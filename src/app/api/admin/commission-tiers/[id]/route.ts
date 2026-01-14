import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for commission tier update
const updateTierSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  minBookings: z.number().int().min(0).optional(),
  minRevenue: z.number().min(0).nullable().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  isActive: z.boolean().optional(),
})

// GET - Get a single commission tier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const tier = await prisma.commissionTier.findUnique({
      where: { id },
    })

    if (!tier) {
      return NextResponse.json({ error: "Commission tier not found" }, { status: 404 })
    }

    return NextResponse.json({ tier })
  } catch (error) {
    console.error("Error fetching commission tier:", error)
    return NextResponse.json(
      { error: "Failed to fetch commission tier" },
      { status: 500 }
    )
  }
}

// PATCH - Update a commission tier
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
    const validationResult = updateTierSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const tier = await prisma.commissionTier.update({
      where: { id },
      data,
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "commission_tier_updated",
        resource: "commission_tier",
        resourceId: tier.id,
        metadata: {
          tierName: tier.name,
          changes: data,
        },
      },
    })

    return NextResponse.json({ tier })
  } catch (error) {
    console.error("Error updating commission tier:", error)
    return NextResponse.json(
      { error: "Failed to update commission tier" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a commission tier
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

    const tier = await prisma.commissionTier.findUnique({
      where: { id },
    })

    if (!tier) {
      return NextResponse.json({ error: "Commission tier not found" }, { status: 404 })
    }

    await prisma.commissionTier.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "commission_tier_deleted",
        resource: "commission_tier",
        resourceId: id,
        metadata: {
          tierName: tier.name,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting commission tier:", error)
    return NextResponse.json(
      { error: "Failed to delete commission tier" },
      { status: 500 }
    )
  }
}
