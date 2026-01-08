import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const tour = await prisma.tour.findUnique({
      where: { slug },
      include: {
        agent: {
          select: {
            id: true,
            businessName: true,
            description: true,
            isVerified: true,
            yearsInBusiness: true,
            toursConducted: true,
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        itinerary: {
          orderBy: { dayNumber: "asc" },
        },
        accommodationOptions: {
          orderBy: { pricePerNight: "asc" },
        },
        activityAddons: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
            bookings: true,
          },
        },
      },
    })

    if (!tour) {
      return NextResponse.json(
        { error: "Tour not found" },
        { status: 404 }
      )
    }

    // Check if tour is active (allow preview for agents/admins later)
    if (tour.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Tour is not available" },
        { status: 404 }
      )
    }

    // Increment view count asynchronously
    prisma.tour.update({
      where: { id: tour.id },
      data: { viewCount: { increment: 1 } },
    }).catch(console.error)

    // Calculate average rating
    const avgRating = tour.reviews.length > 0
      ? tour.reviews.reduce((sum, r) => sum + r.rating, 0) / tour.reviews.length
      : 0

    // Transform tour to parse JSON arrays
    const transformedTour = {
      ...tour,
      highlights: JSON.parse(tour.highlights || "[]"),
      included: JSON.parse(tour.included || "[]"),
      excluded: JSON.parse(tour.excluded || "[]"),
      images: JSON.parse(tour.images || "[]"),
      tourType: JSON.parse(tour.tourType || "[]"),
      bestSeason: JSON.parse(tour.bestSeason || "[]"),
      itinerary: tour.itinerary.map((day) => ({
        ...day,
        meals: JSON.parse(day.meals || "[]"),
        activities: JSON.parse(day.activities || "[]"),
      })),
      accommodationOptions: tour.accommodationOptions.map((acc) => ({
        ...acc,
        images: JSON.parse(acc.images || "[]"),
        amenities: JSON.parse(acc.amenities || "[]"),
      })),
      activityAddons: tour.activityAddons.map((addon) => ({
        ...addon,
        images: JSON.parse(addon.images || "[]"),
        dayAvailable: JSON.parse(addon.dayAvailable || "[]"),
      })),
      reviews: tour.reviews.map((review) => ({
        ...review,
        images: JSON.parse(review.images || "[]"),
      })),
      averageRating: Math.round(avgRating * 10) / 10,
    }

    return NextResponse.json({ tour: transformedTour })
  } catch (error) {
    console.error("Error fetching tour:", error)
    return NextResponse.json(
      { error: "Failed to fetch tour" },
      { status: 500 }
    )
  }
}
