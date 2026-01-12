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
    const { status, featured } = body

    // Build update object
    const updateData: any = {}
    if (status !== undefined) {
      updateData.status = status
    }
    if (featured !== undefined) {
      updateData.featured = featured
    }

    const tour = await prisma.tour.update({
      where: { id },
      data: updateData,
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
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "tour_updated",
        resource: "tour",
        resourceId: tour.id,
        metadata: {
          tourTitle: tour.title,
          changes: updateData,
        },
      },
    })

    return NextResponse.json({ tour })
  } catch (error) {
    console.error("Error updating tour:", error)
    return NextResponse.json(
      { error: "Failed to update tour" },
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

    // Get tour details before deletion for audit log
    const tour = await prisma.tour.findUnique({
      where: { id },
      select: {
        title: true,
        agentId: true,
      },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Delete tour
    await prisma.tour.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "tour_deleted",
        resource: "tour",
        resourceId: id,
        metadata: {
          tourTitle: tour.title,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting tour:", error)
    return NextResponse.json(
      { error: "Failed to delete tour" },
      { status: 500 }
    )
  }
}
