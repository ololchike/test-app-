import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limit"
import { sanitizeInput } from "@/lib/security"

// Generate a unique booking reference
function generateBookingReference(): string {
  const prefix = "SF"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

// SECURITY: Comprehensive input validation schema
const bookingSchema = z.object({
  tourId: z.string().min(1, "Tour ID is required"), // Prisma uses CUID, not UUID
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date"),
  adults: z.number().int().min(1).max(20, "Too many adults"),
  children: z.number().int().min(0).max(20, "Too many children").optional(),
  infants: z.number().int().min(0).max(10, "Too many infants").optional(),
  accommodations: z.record(z.string(), z.string()).optional(),
  addons: z.array(z.object({
    id: z.string().min(1),
    quantity: z.number().int().min(1).max(20).optional(),
  })).optional(),
  travelers: z.array(z.object({
    type: z.string().optional(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    nationality: z.string().optional(),
    passportNumber: z.string().optional(),
  })).optional(),
  contact: z.object({
    name: z.string().min(1, "Name is required").max(200),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(1, "Phone is required").max(50),
    specialRequests: z.string().max(2000).optional(),
  }),
  pricing: z.object({
    baseTotal: z.number().min(0),
    childTotal: z.number().min(0),
    accommodationTotal: z.number().min(0),
    addonsTotal: z.number().min(0),
    serviceFee: z.number().min(0),
    total: z.number().min(1, "Total must be greater than 0"),
    discount: z.number().min(0).optional(),
  }),
  paymentType: z.enum(["FULL", "DEPOSIT"]).optional(),
  depositAmount: z.number().min(0).nullable().optional(),
  balanceAmount: z.number().min(0).nullable().optional(),
  promoCodeId: z.string().nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // SECURITY: Rate limiting - 10 bookings per minute per user
    const clientId = getClientIdentifier(request, session?.user?.id)
    const rateLimitResult = rateLimiters.api.check(clientId)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          },
        }
      )
    }

    // SECURITY: Validate and sanitize input
    const body = await request.json()
    const validationResult = bookingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid booking data",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data
    const {
      tourId,
      startDate,
      endDate,
      adults,
      children,
      infants,
      accommodations,
      addons,
      travelers: _travelers, // Reserved for future traveler details feature
      contact,
      pricing,
      paymentType = "FULL",
      depositAmount,
      balanceAmount,
    } = data

    // SECURITY: Sanitize text inputs to prevent XSS
    const sanitizedContact = {
      name: sanitizeInput(contact.name),
      email: contact.email, // Email already validated by Zod
      phone: sanitizeInput(contact.phone),
      specialRequests: contact.specialRequests ? sanitizeInput(contact.specialRequests) : null,
    }

    // SECURITY: Validate date range
    const startDateTime = new Date(startDate)
    const endDateTime = new Date(endDate)
    const now = new Date()

    // Allow same-day bookings by comparing dates only (not time)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const bookingDate = new Date(startDateTime.getFullYear(), startDateTime.getMonth(), startDateTime.getDate())

    if (bookingDate < todayStart) {
      return NextResponse.json(
        { error: "Start date cannot be in the past" },
        { status: 400 }
      )
    }

    if (endDateTime <= startDateTime) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    // Fetch tour to validate and get agent info
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        agent: true,
        accommodationOptions: true,
        activityAddons: true,
      },
    })

    if (!tour) {
      return NextResponse.json(
        { error: "Tour not found" },
        { status: 404 }
      )
    }

    if (tour.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Tour is not available for booking" },
        { status: 400 }
      )
    }

    // SECURITY: Validate tour availability for selected dates
    const totalGuests = adults + (children || 0)

    // Check for blocked dates
    const blockedDates = await prisma.tourAvailability.findMany({
      where: {
        tourId,
        date: {
          gte: startDateTime,
          lte: endDateTime,
        },
        type: "BLOCKED",
      },
    })

    if (blockedDates.length > 0) {
      return NextResponse.json(
        { error: "Some of the selected dates are not available for booking" },
        { status: 400 }
      )
    }

    // Check capacity against existing bookings
    const existingBookings = await prisma.booking.findMany({
      where: {
        tourId,
        status: { notIn: ["CANCELLED", "REFUNDED"] },
        startDate: { lte: endDateTime },
        endDate: { gte: startDateTime },
      },
      select: {
        adults: true,
        children: true,
      },
    })

    const totalBookedGuests = existingBookings.reduce(
      (sum, b) => sum + b.adults + b.children,
      0
    )

    if (totalBookedGuests + totalGuests > tour.maxGroupSize) {
      return NextResponse.json(
        { error: `Insufficient capacity. Only ${tour.maxGroupSize - totalBookedGuests} spots available.` },
        { status: 400 }
      )
    }

    // Calculate commission
    const commissionRate = tour.agent.commissionRate / 100
    const platformCommission = Math.round(pricing.total * commissionRate)
    const agentEarnings = pricing.total - platformCommission

    // Get or create user
    let userId = session?.user?.id

    if (!userId) {
      // Create guest user or find existing by email
      let user = await prisma.user.findUnique({
        where: { email: contact.email },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: contact.email,
            name: contact.name,
            phone: contact.phone,
            role: "CLIENT",
          },
        })
      }

      userId = user.id
    }

    // Calculate balance due date for deposit payments
    const tripStartDate = new Date(startDate)
    const balanceDueDate = paymentType === "DEPOSIT" && tour.freeCancellationDays
      ? new Date(tripStartDate.getTime() - (tour.freeCancellationDays * 24 * 60 * 60 * 1000))
      : null

    // Create booking with related records
    const booking = await prisma.booking.create({
      data: {
        bookingReference: generateBookingReference(),
        userId,
        tourId,
        agentId: tour.agentId,
        startDate: tripStartDate,
        endDate: new Date(endDate),
        adults,
        children: children || 0,
        infants: infants || 0,
        baseAmount: pricing.baseTotal + pricing.childTotal,
        accommodationAmount: pricing.accommodationTotal,
        activitiesAmount: pricing.addonsTotal,
        taxAmount: pricing.serviceFee,
        discountAmount: pricing.discount || 0,
        totalAmount: pricing.total,
        platformCommission,
        agentEarnings,
        contactName: sanitizedContact.name,
        contactEmail: sanitizedContact.email,
        contactPhone: sanitizedContact.phone,
        specialRequests: sanitizedContact.specialRequests,
        status: "PENDING",
        paymentStatus: "PENDING",
        // Payment type fields
        paymentType: paymentType as "FULL" | "DEPOSIT",
        depositAmount: paymentType === "DEPOSIT" ? depositAmount : null,
        balanceAmount: paymentType === "DEPOSIT" ? balanceAmount : null,
        balanceDueDate,
        // Create booking accommodations
        accommodations: {
          create: Object.entries(accommodations || {}).map(([dayNumber, accId]) => {
            const acc = tour.accommodationOptions.find((a) => a.id === accId)
            return {
              accommodationOptionId: accId as string,
              dayNumber: parseInt(dayNumber, 10),
              price: acc?.pricePerNight || 0,
            }
          }),
        },
        // Create booking activities with quantity validation
        activities: {
          create: (addons || []).map((addonItem) => {
            const addon = tour.activityAddons.find((a) => a.id === addonItem.id)
            // Use provided quantity or default to total guests
            const requestedQty = addonItem.quantity || (adults + (children || 0))
            // Respect max capacity if set
            const quantity = addon?.maxCapacity
              ? Math.min(requestedQty, addon.maxCapacity)
              : requestedQty
            return {
              activityAddonId: addonItem.id,
              quantity,
              price: (addon?.price || 0) * quantity,
            }
          }),
        },
      },
      include: {
        tour: {
          select: {
            title: true,
            slug: true,
          },
        },
        agent: {
          select: {
            businessName: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: booking.id,
      bookingReference: booking.bookingReference,
      tourTitle: booking.tour.title,
      agentName: booking.agent.businessName,
      totalAmount: booking.totalAmount,
      status: booking.status,
      // Payment type info
      paymentType: booking.paymentType,
      depositAmount: booking.depositAmount,
      balanceAmount: booking.balanceAmount,
      balanceDueDate: booking.balanceDueDate,
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
        ...(status ? { status: status as never } : {}),
      },
      include: {
        tour: {
          select: {
            title: true,
            slug: true,
            coverImage: true,
            destination: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}
