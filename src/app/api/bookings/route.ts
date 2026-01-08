import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// Generate a unique booking reference
function generateBookingReference(): string {
  const prefix = "SF"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    const body = await request.json()
    const {
      tourId,
      startDate,
      endDate,
      adults,
      children,
      accommodations,
      addons,
      travelers,
      contact,
      pricing,
    } = body

    // Validate required fields
    if (!tourId || !startDate || !adults || !contact?.name || !contact?.email || !contact?.phone) {
      return NextResponse.json(
        { error: "Missing required booking information" },
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

    // Create booking with related records
    const booking = await prisma.booking.create({
      data: {
        bookingReference: generateBookingReference(),
        userId,
        tourId,
        agentId: tour.agentId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        adults,
        children: children || 0,
        infants: 0,
        baseAmount: pricing.baseTotal + pricing.childTotal,
        accommodationAmount: pricing.accommodationTotal,
        activitiesAmount: pricing.addonsTotal,
        taxAmount: pricing.serviceFee,
        totalAmount: pricing.total,
        platformCommission,
        agentEarnings,
        contactName: contact.name,
        contactEmail: contact.email,
        contactPhone: contact.phone,
        specialRequests: contact.specialRequests || null,
        status: "PENDING",
        paymentStatus: "PENDING",
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
        // Create booking activities
        activities: {
          create: (addons || []).map((addonId: string) => {
            const addon = tour.activityAddons.find((a) => a.id === addonId)
            const quantity = adults + (children || 0)
            return {
              activityAddonId: addonId,
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
