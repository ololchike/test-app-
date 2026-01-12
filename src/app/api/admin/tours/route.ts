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
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
        { agent: { businessName: { contains: search, mode: "insensitive" } } },
      ]
    }

    // Get tours with pagination
    const [tours, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        include: {
          agent: {
            select: {
              businessName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.tour.count({ where }),
    ])

    // Get status counts
    const statusCounts = await prisma.tour.groupBy({
      by: ["status"],
      _count: true,
    })

    const counts = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      tours,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts: counts,
    })
  } catch (error) {
    console.error("Error fetching tours:", error)
    return NextResponse.json(
      { error: "Failed to fetch tours" },
      { status: 500 }
    )
  }
}
