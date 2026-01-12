import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const responseSchema = z.object({
  response: z.string()
    .min(10, "Response must be at least 10 characters")
    .max(1000, "Response must be less than 1000 characters"),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: reviewId } = await params

    // Get review with tour info
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        tour: true,
      },
    })

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      )
    }

    // Verify the tour belongs to this agent
    if (review.tour.agentId !== agent.id) {
      return NextResponse.json(
        { error: "You can only respond to reviews for your tours" },
        { status: 403 }
      )
    }

    // Check if already responded
    if (review.agentResponse) {
      return NextResponse.json(
        { error: "You have already responded to this review" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validationResult = responseSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Update review with agent response
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        agentResponse: data.response,
        respondedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
        tour: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedReview,
        images: JSON.parse(updatedReview.images),
      },
      message: "Response submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting agent response:", error)
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent account not found" },
        { status: 404 }
      )
    }

    const { id: reviewId } = await params

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        tour: true,
      },
    })

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      )
    }

    if (review.tour.agentId !== agent.id) {
      return NextResponse.json(
        { error: "You can only edit responses for your tours" },
        { status: 403 }
      )
    }

    if (!review.respondedAt) {
      return NextResponse.json(
        { error: "No response to update" },
        { status: 400 }
      )
    }

    // Check edit window (48 hours)
    const hoursSinceResponse =
      (Date.now() - review.respondedAt.getTime()) / (1000 * 60 * 60)

    if (hoursSinceResponse > 48) {
      return NextResponse.json(
        { error: "Edit window has expired (48 hours)" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validationResult = responseSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        agentResponse: data.response,
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
        tour: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedReview,
        images: JSON.parse(updatedReview.images),
      },
      message: "Response updated successfully",
    })
  } catch (error) {
    console.error("Error updating agent response:", error)
    return NextResponse.json(
      { error: "Failed to update response" },
      { status: 500 }
    )
  }
}
