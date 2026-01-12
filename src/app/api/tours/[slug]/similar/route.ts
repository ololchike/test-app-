import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{
    slug: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params

    // First get the current tour
    const currentTour = await prisma.tour.findUnique({
      where: { slug, status: "ACTIVE" },
      select: {
        id: true,
        destination: true,
        country: true,
        tourType: true,
      },
    })

    if (!currentTour) {
      return NextResponse.json(
        { error: "Tour not found" },
        { status: 404 }
      )
    }

    // Find similar tours based on:
    // 1. Same destination (highest priority)
    // 2. Same country
    // 3. Similar tour types
    const similarTours = await prisma.tour.findMany({
      where: {
        AND: [
          { status: "ACTIVE" },
          { id: { not: currentTour.id } }, // Exclude current tour
          {
            OR: [
              { destination: currentTour.destination },
              { country: currentTour.country },
            ],
          },
        ],
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
          select: { reviews: true },
        },
      },
      take: 12, // Get more than needed for filtering
    })

    // Calculate rating and similarity score
    const toursWithScore = similarTours.map((tour) => {
      const avgRating =
        tour.reviews.length > 0
          ? tour.reviews.reduce((sum, r) => sum + r.rating, 0) /
            tour.reviews.length
          : 0

      // Parse tour type from JSON string
      const tourTypes = JSON.parse(tour.tourType as string) as string[]
      const currentTourTypes = JSON.parse(currentTour.tourType as string) as string[]

      // Calculate similarity score
      let score = 0
      if (tour.destination === currentTour.destination) score += 10
      if (tour.country === currentTour.country) score += 5

      // Add points for matching tour types
      const matchingTypes = tourTypes.filter(type => currentTourTypes.includes(type))
      score += matchingTypes.length * 2

      return {
        id: tour.id,
        slug: tour.slug,
        title: tour.title,
        destination: tour.destination,
        country: tour.country,
        coverImage: tour.coverImage,
        basePrice: tour.basePrice,
        durationDays: tour.durationDays,
        durationNights: tour.durationNights,
        tourType: tourTypes,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: tour._count.reviews,
        agent: tour.agent,
        featured: tour.featured,
        similarityScore: score,
      }
    })

    // Sort by similarity score and take top 4
    const topSimilarTours = toursWithScore
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 4)

    return NextResponse.json({ tours: topSimilarTours })
  } catch (error) {
    console.error("Error fetching similar tours:", error)
    return NextResponse.json(
      { error: "Failed to fetch similar tours" },
      { status: 500 }
    )
  }
}
