import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/client/wishlist
 * Get user's wishlist
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        tour: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverImage: true,
            destination: true,
            basePrice: true,
            durationDays: true,
            durationNights: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      wishlist: wishlistItems.map((item) => ({
        id: item.id,
        tourId: item.tourId,
        addedAt: item.createdAt,
        tour: item.tour,
      })),
    })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/client/wishlist
 * Add tour to wishlist
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { tourId } = body

    if (!tourId) {
      return NextResponse.json(
        { success: false, error: "Tour ID is required" },
        { status: 400 }
      )
    }

    // Check if tour exists
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: { id: true },
    })

    if (!tour) {
      return NextResponse.json(
        { success: false, error: "Tour not found" },
        { status: 404 }
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
      return NextResponse.json({
        success: true,
        message: "Tour already in wishlist",
        wishlistId: existing.id,
      })
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        tourId,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Tour added to wishlist",
      wishlistId: wishlistItem.id,
    })
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json(
      { success: false, error: "Failed to add to wishlist" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/client/wishlist
 * Remove tour from wishlist
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get("tourId")

    if (!tourId) {
      return NextResponse.json(
        { success: false, error: "Tour ID is required" },
        { status: 400 }
      )
    }

    // Delete from wishlist
    await prisma.wishlist.deleteMany({
      where: {
        userId: session.user.id,
        tourId,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Tour removed from wishlist",
    })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json(
      { success: false, error: "Failed to remove from wishlist" },
      { status: 500 }
    )
  }
}
