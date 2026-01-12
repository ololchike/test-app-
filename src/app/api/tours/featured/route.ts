import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get featured tours
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "6")

    const tours = await prisma.tour.findMany({
      where: {
        status: "ACTIVE",
        featured: true,
      },
      include: {
        agent: {
          select: {
            businessName: true,
            isVerified: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: [
        { viewCount: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    })

    // Process tours to include average rating
    const processedTours = tours.map((tour) => {
      const ratings = tour.reviews.map((r) => r.rating)
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null

      return {
        id: tour.id,
        slug: tour.slug,
        title: tour.title,
        subtitle: tour.subtitle,
        coverImage: tour.coverImage,
        destination: tour.destination,
        country: tour.country,
        durationDays: tour.durationDays,
        durationNights: tour.durationNights,
        basePrice: tour.basePrice,
        currency: tour.currency,
        tourType: JSON.parse(tour.tourType || "[]"),
        featured: tour.featured,
        agent: tour.agent,
        rating: avgRating,
        reviewCount: tour.reviews.length,
        bookingCount: tour._count.bookings,
      }
    })

    return NextResponse.json({
      success: true,
      data: processedTours,
    })
  } catch (error) {
    console.error("Error fetching featured tours:", error)
    return NextResponse.json(
      { error: "Failed to fetch featured tours" },
      { status: 500 }
    )
  }
}
