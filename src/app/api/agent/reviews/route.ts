import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent account not found" },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get("tourId")
    const rating = searchParams.get("rating")
    const responded = searchParams.get("responded") // "true" | "false" | null
    const sort = searchParams.get("sort") || "recent"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    // Build where clause - only reviews for agent's tours
    const where: any = {
      tour: {
        agentId: agent.id,
      },
      isApproved: true,
    }

    if (tourId) {
      where.tourId = tourId
    }

    if (rating) {
      where.rating = parseInt(rating)
    }

    if (responded === "true") {
      where.agentResponse = { not: null }
    } else if (responded === "false") {
      where.agentResponse = null
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" }

    if (sort === "highest") {
      orderBy = { rating: "desc" }
    } else if (sort === "lowest") {
      orderBy = { rating: "asc" }
    }

    // Fetch reviews with pagination
    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
          tour: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
      // Get statistics
      prisma.review.aggregate({
        where: {
          tour: {
            agentId: agent.id,
          },
          isApproved: true,
        },
        _avg: { rating: true },
        _count: true,
      }),
    ])

    // Get counts by status
    const [respondedCount, pendingCount, ratingBreakdown] = await Promise.all([
      prisma.review.count({
        where: {
          tour: { agentId: agent.id },
          isApproved: true,
          agentResponse: { not: null },
        },
      }),
      prisma.review.count({
        where: {
          tour: { agentId: agent.id },
          isApproved: true,
          agentResponse: null,
        },
      }),
      prisma.review.groupBy({
        by: ["rating"],
        where: {
          tour: { agentId: agent.id },
          isApproved: true,
        },
        _count: true,
      }),
    ])

    // Format rating breakdown
    const breakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    }

    ratingBreakdown.forEach((item) => {
      breakdown[item.rating as keyof typeof breakdown] = item._count
    })

    // Format reviews
    const formattedReviews = reviews.map((review) => ({
      ...review,
      images: JSON.parse(review.images),
    }))

    return NextResponse.json({
      success: true,
      data: formattedReviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalReviews: stats._count,
        averageRating: stats._avg.rating
          ? Math.round(stats._avg.rating * 10) / 10
          : 0,
        respondedCount,
        pendingResponseCount: pendingCount,
        ratingBreakdown: breakdown,
      },
    })
  } catch (error) {
    console.error("Error fetching agent reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}
