import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Check if a tour is in user's wishlist
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ isInWishlist: false })
    }

    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get("tourId")

    if (!tourId) {
      return NextResponse.json(
        { error: "Tour ID is required" },
        { status: 400 }
      )
    }

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_tourId: {
          userId: session.user.id,
          tourId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      isInWishlist: !!wishlistItem,
    })
  } catch (error) {
    console.error("Error checking wishlist:", error)
    return NextResponse.json({ isInWishlist: false })
  }
}
