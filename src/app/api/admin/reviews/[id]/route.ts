import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { isApproved } = body

    const review = await prisma.review.update({
      where: { id },
      data: {
        isApproved: isApproved ?? true,
      },
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
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: isApproved ? "review_approved" : "review_rejected",
        resource: "review",
        resourceId: review.id,
        metadata: {
          tourTitle: review.tour.title,
          reviewerEmail: review.user.email,
        },
      },
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error("Error updating review:", error)
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get review details before deletion for audit log
    const review = await prisma.review.findUnique({
      where: { id },
      select: {
        tour: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Delete review
    await prisma.review.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "review_deleted",
        resource: "review",
        resourceId: id,
        metadata: {
          tourTitle: review.tour.title,
          reviewerEmail: review.user.email,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    )
  }
}
