import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to mark reviews as helpful." },
        { status: 401 }
      )
    }

    const { id: reviewId } = await params

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      )
    }

    // Prevent self-voting
    if (review.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot mark your own review as helpful" },
        { status: 400 }
      )
    }

    // Check if user already marked this review as helpful
    const existingMark = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId: session.user.id,
        },
      },
    })

    let action: "added" | "removed"

    if (existingMark) {
      // Remove the helpful mark (toggle off)
      await prisma.$transaction([
        prisma.reviewHelpful.delete({
          where: { id: existingMark.id },
        }),
        prisma.review.update({
          where: { id: reviewId },
          data: {
            helpfulCount: {
              decrement: 1,
            },
          },
        }),
      ])
      action = "removed"
    } else {
      // Add the helpful mark (toggle on)
      await prisma.$transaction([
        prisma.reviewHelpful.create({
          data: {
            reviewId,
            userId: session.user.id,
          },
        }),
        prisma.review.update({
          where: { id: reviewId },
          data: {
            helpfulCount: {
              increment: 1,
            },
          },
        }),
      ])
      action = "added"
    }

    // Get updated review
    const updatedReview = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        helpfulCount: true,
      },
    })

    return NextResponse.json({
      success: true,
      action,
      data: updatedReview,
      message: action === "added"
        ? "Marked review as helpful"
        : "Removed helpful mark",
    })
  } catch (error) {
    console.error("Error updating helpful status:", error)
    return NextResponse.json(
      { error: "Failed to update helpful status" },
      { status: 500 }
    )
  }
}
