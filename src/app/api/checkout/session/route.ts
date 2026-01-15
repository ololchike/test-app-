import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addMinutes, addDays } from "date-fns"

const HOLD_DURATION_MINUTES = 15

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()

    const {
      tourId,
      startDate,
      adults,
      children,
      infants,
    } = body

    if (!tourId || !startDate) {
      return NextResponse.json(
        { error: "Tour ID and start date are required" },
        { status: 400 }
      )
    }

    // Fetch tour with all related data
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        agent: {
          select: {
            id: true,
            businessName: true,
            isVerified: true,
          },
        },
        pricing: true, // Include configurable pricing
        vehicles: {
          where: { isActive: true },
          orderBy: [
            { isDefault: "desc" },
            { pricePerDay: "asc" },
          ],
        },
        accommodationOptions: {
          where: { isActive: true },
          orderBy: [
            { sortOrder: "asc" },
            { tier: "asc" },
            { pricePerNight: "asc" },
          ],
        },
        activityAddons: {
          where: { isActive: true },
          orderBy: [
            { isPopular: "desc" },
            { sortOrder: "asc" },
          ],
        },
        itinerary: {
          orderBy: { dayNumber: "asc" },
        },
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

    const parsedStartDate = new Date(startDate)
    const parsedEndDate = addDays(parsedStartDate, tour.durationNights)
    const totalGuests = (adults || 0) + (children || 0) + (infants || 0)

    // Check for existing active holds on this date (excluding user's own)
    const activeHolds = await prisma.availabilityHold.count({
      where: {
        tourId,
        startDate: parsedStartDate,
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
        ...(session?.user?.id ? { userId: { not: session.user.id } } : {}),
      },
    })

    // Check tour capacity (if maxGroupSize is set)
    if (tour.maxGroupSize) {
      if (totalGuests > tour.maxGroupSize) {
        return NextResponse.json(
          { error: `Maximum group size is ${tour.maxGroupSize} travelers` },
          { status: 400 }
        )
      }

      // Check existing bookings for this date
      const existingBookings = await prisma.booking.aggregate({
        where: {
          tourId,
          startDate: parsedStartDate,
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
        _sum: {
          adults: true,
          children: true,
          infants: true,
        },
      })

      const bookedCount =
        (existingBookings._sum.adults || 0) +
        (existingBookings._sum.children || 0) +
        (existingBookings._sum.infants || 0)

      // Get spots held from active holds
      const activeHoldsData = await prisma.availabilityHold.aggregate({
        where: {
          tourId,
          startDate: parsedStartDate,
          status: "ACTIVE",
          expiresAt: { gt: new Date() },
          ...(session?.user?.id ? { userId: { not: session.user.id } } : {}),
        },
        _sum: {
          spotsHeld: true,
        },
      })

      const heldCount = activeHoldsData._sum.spotsHeld || 0

      if (bookedCount + heldCount + totalGuests > tour.maxGroupSize) {
        return NextResponse.json(
          { error: "Not enough availability for the selected date" },
          { status: 400 }
        )
      }
    }

    // Create availability hold
    const expiresAt = addMinutes(new Date(), HOLD_DURATION_MINUTES)

    const hold = await prisma.availabilityHold.create({
      data: {
        tourId,
        userId: session?.user?.id || null,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        spotsHeld: totalGuests,
        expiresAt,
        status: "ACTIVE",
      },
    })

    // Format tour summary
    const tourSummary = {
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      coverImage: tour.coverImage,
      destination: tour.destination,
      country: tour.country,
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      basePrice: tour.basePrice,
      childPrice: tour.childPrice,
      infantPrice: tour.infantPrice,
      depositEnabled: tour.depositEnabled,
      depositPercentage: tour.depositPercentage,
      freeCancellationDays: tour.freeCancellationDays,
      agent: tour.agent,
    }

    // Format vehicles
    const vehicles = tour.vehicles.map(v => ({
      id: v.id,
      type: v.type,
      name: v.name,
      description: v.description,
      maxPassengers: v.maxPassengers,
      pricePerDay: v.pricePerDay,
      features: JSON.parse(v.features || "[]"),
      images: JSON.parse(v.images || "[]"),
      isDefault: v.isDefault,
    }))

    // Format accommodations
    const accommodations = tour.accommodationOptions.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      tier: a.tier,
      pricePerNight: a.pricePerNight,
      location: a.location,
      rating: a.rating,
      amenities: JSON.parse(a.amenities || "[]"),
      roomType: a.roomType,
    }))

    // Format addons
    const addons = tour.activityAddons.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      price: a.price,
      childPrice: a.childPrice,
      duration: a.duration,
      maxCapacity: a.maxCapacity,
      type: a.type,
      category: a.category,
      priceType: a.priceType,
      isPopular: a.isPopular,
      dayAvailable: a.dayAvailable ? JSON.parse(a.dayAvailable) : null,
    }))

    // Format itinerary with available options
    const itinerary = tour.itinerary.map(day => ({
      dayNumber: day.dayNumber,
      title: day.title,
      description: day.description,
      location: day.location,
      meals: JSON.parse(day.meals || "[]"),
      activities: JSON.parse(day.activities || "[]"),
      overnight: day.overnight,
      availableAccommodationIds: JSON.parse(day.availableAccommodationIds || "[]"),
      defaultAccommodationId: day.defaultAccommodationId,
      availableAddonIds: JSON.parse(day.availableAddonIds || "[]"),
    }))

    // Format pricing config (with defaults)
    const pricingConfig = tour.pricing
      ? {
          childDiscountPercent: tour.pricing.childDiscountPercent,
          childMinAge: tour.pricing.childMinAge,
          childMaxAge: tour.pricing.childMaxAge,
          infantMaxAge: tour.pricing.infantMaxAge,
          infantPrice: tour.pricing.infantPrice,
          serviceFeePercent: tour.pricing.serviceFeePercent,
          serviceFeeFixed: tour.pricing.serviceFeeFixed,
          depositPercent: tour.pricing.depositPercent,
          depositMinimum: tour.pricing.depositMinimum,
          groupDiscountThreshold: tour.pricing.groupDiscountThreshold,
          groupDiscountPercent: tour.pricing.groupDiscountPercent,
          earlyBirdDays: tour.pricing.earlyBirdDays,
          earlyBirdPercent: tour.pricing.earlyBirdPercent,
        }
      : {
          // Default pricing rules
          childDiscountPercent: 30,
          childMinAge: 3,
          childMaxAge: 11,
          infantMaxAge: 2,
          infantPrice: 0,
          serviceFeePercent: 5,
          serviceFeeFixed: null,
          depositPercent: null,
          depositMinimum: null,
          groupDiscountThreshold: null,
          groupDiscountPercent: null,
          earlyBirdDays: null,
          earlyBirdPercent: null,
        }

    return NextResponse.json({
      session: {
        id: hold.id,
        expiresAt: hold.expiresAt,
      },
      tour: tourSummary,
      vehicles,
      accommodations,
      addons,
      itinerary,
      pricingConfig,
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    // Return more detailed error in development
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to create checkout session", details: errorMessage },
      { status: 500 }
    )
  }
}

// Extend or release a hold
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, action } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      )
    }

    const hold = await prisma.availabilityHold.findUnique({
      where: { id: sessionId },
    })

    if (!hold) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    if (action === "extend") {
      // Extend the hold
      const newExpiresAt = addMinutes(new Date(), HOLD_DURATION_MINUTES)

      await prisma.availabilityHold.update({
        where: { id: sessionId },
        data: { expiresAt: newExpiresAt },
      })

      return NextResponse.json({
        success: true,
        expiresAt: newExpiresAt,
      })
    } else if (action === "release") {
      // Release the hold
      await prisma.availabilityHold.update({
        where: { id: sessionId },
        data: { status: "RELEASED" },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error updating checkout session:", error)
    return NextResponse.json(
      { error: "Failed to update checkout session" },
      { status: 500 }
    )
  }
}
