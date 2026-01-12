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
    const paymentStatus = searchParams.get("paymentStatus")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus
    }

    if (search) {
      where.OR = [
        { bookingReference: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { contactEmail: { contains: search, mode: "insensitive" } },
        { tour: { title: { contains: search, mode: "insensitive" } } },
      ]
    }

    // Get bookings with pagination
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
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
          agent: {
            select: {
              businessName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ])

    // Get status counts
    const statusCounts = await prisma.booking.groupBy({
      by: ["status"],
      _count: true,
    })

    const counts = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts: counts,
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}
