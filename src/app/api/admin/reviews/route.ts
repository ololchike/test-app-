import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isApproved = searchParams.get("isApproved")
    const rating = searchParams.get("rating")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (isApproved !== null && isApproved !== "all") {
      where.isApproved = isApproved === "true"
    }

    if (rating && rating !== "all") {
      where.rating = parseInt(rating)
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { tour: { title: { contains: search, mode: "insensitive" } } },
      ]
    }

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          tour: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ])

    // Get approval counts
    const approvalCounts = await prisma.review.groupBy({
      by: ["isApproved"],
      _count: true,
    })

    const counts = approvalCounts.reduce((acc, curr) => {
      acc[curr.isApproved ? "approved" : "pending"] = curr._count
      return acc
    }, {} as Record<string, number>)

    // Get rating counts
    const ratingCounts = await prisma.review.groupBy({
      by: ["rating"],
      _count: true,
    })

    const ratings = ratingCounts.reduce((acc, curr) => {
      acc[curr.rating] = curr._count
      return acc
    }, {} as Record<number, number>)

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      approvalCounts: counts,
      ratingCounts: ratings,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}
