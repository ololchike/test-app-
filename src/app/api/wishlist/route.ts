import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    const [wishlistItems, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: { userId: session.user.id },
        include: {
          tour: {
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
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.wishlist.count({
        where: { userId: session.user.id },
      }),
    ])

    // Process wishlist items to include average rating
    const processedItems = wishlistItems.map((item) => {
      const ratings = item.tour.reviews.map((r) => r.rating)
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null

      return {
        id: item.id,
        tourId: item.tourId,
        createdAt: item.createdAt,
        tour: {
          id: item.tour.id,
          slug: item.tour.slug,
          title: item.tour.title,
          subtitle: item.tour.subtitle,
          coverImage: item.tour.coverImage,
          destination: item.tour.destination,
          country: item.tour.country,
          durationDays: item.tour.durationDays,
          durationNights: item.tour.durationNights,
          basePrice: item.tour.basePrice,
          currency: item.tour.currency,
          status: item.tour.status,
          agent: item.tour.agent,
          rating: avgRating,
          reviewCount: item.tour.reviews.length,
        },
      }
    })

    return NextResponse.json({
      success: true,
      data: processedItems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    )
  }
}

// POST - Add tour to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { tourId } = body

    if (!tourId) {
      return NextResponse.json(
        { error: "Tour ID is required" },
        { status: 400 }
      )
    }

    // Check if tour exists and is active
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: { id: true, status: true },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    if (tour.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Tour is not available" },
        { status: 400 }
      )
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_tourId: {
          userId: session.user.id,
          tourId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: true, data: existing, message: "Already in wishlist" },
        { status: 200 }
      )
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        tourId,
      },
    })

    return NextResponse.json(
      { success: true, data: wishlistItem },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    )
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get("tourId")

    if (!tourId) {
      return NextResponse.json(
        { error: "Tour ID is required" },
        { status: 400 }
      )
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId: session.user.id,
        tourId,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
    })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    )
  }
}
