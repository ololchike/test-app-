import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get("sort") || "recent"
    const rating = searchParams.get("rating")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const { slug } = await params

    // Get tour by slug
    const tour = await prisma.tour.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!tour) {
      return NextResponse.json(
        { error: "Tour not found" },
        { status: 404 }
      )
    }

    // Build where clause
    const where: any = {
      tourId: tour.id,
      isApproved: true,
    }

    if (rating) {
      where.rating = parseInt(rating)
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" }

    if (sort === "highest") {
      orderBy = { rating: "desc" }
    } else if (sort === "lowest") {
      orderBy = { rating: "asc" }
    } else if (sort === "helpful") {
      orderBy = { helpfulCount: "desc" }
    }

    // Get current user to check if they've marked reviews as helpful
    const session = await auth()
    const userId = session?.user?.id

    // Fetch reviews with pagination
    const [reviews, total, ratingStats] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
          // Include helpful marks if user is logged in
          ...(userId && {
            helpfulMarks: {
              where: { userId },
              select: { userId: true },
            },
          }),
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
      // Get rating statistics
      prisma.review.groupBy({
        by: ["rating"],
        where: {
          tourId: tour.id,
          isApproved: true,
        },
        _count: true,
      }),
    ])

    // Calculate rating breakdown
    const ratingBreakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    }

    ratingStats.forEach((stat) => {
      ratingBreakdown[stat.rating as keyof typeof ratingBreakdown] = stat._count
    })

    // Calculate average rating
    const totalRatings = Object.values(ratingBreakdown).reduce((a, b) => a + b, 0)
    const sumRatings = Object.entries(ratingBreakdown).reduce(
      (sum, [rating, count]) => sum + parseInt(rating) * count,
      0
    )
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0

    // Format reviews
    const formattedReviews = reviews.map((review) => ({
      ...review,
      images: JSON.parse(review.images),
      isHelpfulByCurrentUser: userId
        ? review.helpfulMarks?.some((mark) => mark.userId === userId) || false
        : false,
      helpfulMarks: undefined, // Remove from response
    }))

    return NextResponse.json({
      success: true,
      data: formattedReviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: totalRatings,
        ratingBreakdown,
      },
    })
  } catch (error) {
    console.error("Error fetching tour reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}
