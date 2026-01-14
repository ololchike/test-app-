import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Get single promo code details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Get promo code with usage stats
    const promoCode = await prisma.promoCode.findFirst({
      where: {
        id,
        agentId: agent.id,
      },
      include: {
        _count: {
          select: { usages: true },
        },
        usages: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!promoCode) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 })
    }

    return NextResponse.json({
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        minBookingAmount: promoCode.minBookingAmount,
        maxDiscountAmount: promoCode.maxDiscountAmount,
        maxUses: promoCode.maxUses,
        usesPerUser: promoCode.usesPerUser,
        usedCount: promoCode._count.usages,
        validFrom: promoCode.validFrom,
        validUntil: promoCode.validUntil,
        tourIds: promoCode.tourIds,
        isActive: promoCode.isActive,
        createdAt: promoCode.createdAt,
        recentUsages: promoCode.usages.map((usage) => ({
          id: usage.id,
          usedAt: usage.createdAt,
          discountApplied: usage.discountApplied,
          bookingId: usage.bookingId,
        })),
      },
    })
  } catch (error) {
    console.error("Error fetching promo code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Update promo code
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Get existing promo code
    const existingCode = await prisma.promoCode.findFirst({
      where: {
        id,
        agentId: agent.id,
      },
    })

    if (!existingCode) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()

    // Build update data (only allow certain fields to be updated)
    const updateData: Record<string, unknown> = {}

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive
    }

    if (body.maxUses !== undefined) {
      updateData.maxUses = body.maxUses === null ? null : parseInt(body.maxUses)
    }

    if (body.usesPerUser !== undefined) {
      updateData.usesPerUser = parseInt(body.usesPerUser) || 1
    }

    if (body.validUntil !== undefined) {
      updateData.validUntil = body.validUntil ? new Date(body.validUntil) : null
    }

    if (body.minBookingAmount !== undefined) {
      updateData.minBookingAmount = body.minBookingAmount === null
        ? null
        : parseFloat(body.minBookingAmount)
    }

    if (body.maxDiscountAmount !== undefined) {
      updateData.maxDiscountAmount = body.maxDiscountAmount === null
        ? null
        : parseFloat(body.maxDiscountAmount)
    }

    if (body.tourIds !== undefined) {
      // Validate tour IDs if provided
      if (Array.isArray(body.tourIds) && body.tourIds.length > 0) {
        const tours = await prisma.tour.findMany({
          where: {
            id: { in: body.tourIds },
            agentId: agent.id,
          },
        })

        if (tours.length !== body.tourIds.length) {
          return NextResponse.json(
            { error: "Some tour IDs are invalid or do not belong to you" },
            { status: 400 }
          )
        }
      }
      updateData.tourIds = body.tourIds || []
    }

    // Update promo code
    const updatedCode = await prisma.promoCode.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      promoCode: {
        id: updatedCode.id,
        code: updatedCode.code,
        isActive: updatedCode.isActive,
      },
    })
  } catch (error) {
    console.error("Error updating promo code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete promo code
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Get existing promo code
    const existingCode = await prisma.promoCode.findFirst({
      where: {
        id,
        agentId: agent.id,
      },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    })

    if (!existingCode) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 })
    }

    // Delete promo code (this will cascade delete usages due to schema relation)
    await prisma.promoCode.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Promo code deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting promo code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
