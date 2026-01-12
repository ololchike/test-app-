import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET - Get client profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
            wishlist: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get travel stats
    const completedBookings = await prisma.booking.count({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
      },
    })

    const upcomingBookings = await prisma.booking.count({
      where: {
        userId: session.user.id,
        status: { in: ["CONFIRMED", "PAID"] },
        startDate: { gte: new Date() },
      },
    })

    // Get unique destinations visited
    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
      },
      include: {
        tour: {
          select: { destination: true, country: true },
        },
      },
    })

    const uniqueDestinations = new Set(
      bookings.map((b) => b.tour.destination)
    ).size
    const uniqueCountries = new Set(bookings.map((b) => b.tour.country)).size

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        stats: {
          totalBookings: user._count.bookings,
          completedBookings,
          upcomingBookings,
          reviewsWritten: user._count.reviews,
          savedTours: user._count.wishlist,
          destinationsVisited: uniqueDestinations,
          countriesVisited: uniqueCountries,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

// PUT - Update client profile
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      )
    }

    const data = validation.data

    // If firstName and lastName are provided, also update name
    if (data.firstName || data.lastName) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { firstName: true, lastName: true },
      })

      const firstName = data.firstName || currentUser?.firstName || ""
      const lastName = data.lastName || currentUser?.lastName || ""
      data.name = `${firstName} ${lastName}`.trim()
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
