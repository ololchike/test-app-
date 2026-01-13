import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateCommissionSchema = z.object({
  commissionRate: z.number().min(0).max(50), // 0% to 50% range
  reason: z.string().min(1).max(500).optional(),
})

/**
 * GET /api/admin/agents/[id]/commission
 * Get agent's current commission rate
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agent = await prisma.agent.findUnique({
      where: { id },
      select: {
        id: true,
        businessName: true,
        commissionRate: true,
        user: {
          select: { email: true },
        },
      },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        agentId: agent.id,
        businessName: agent.businessName,
        email: agent.user.email,
        commissionRate: agent.commissionRate,
      },
    })
  } catch (error) {
    console.error("Get commission error:", error)
    return NextResponse.json(
      { error: "Failed to get commission rate" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/agents/[id]/commission
 * Update agent's commission rate (system fee percentage)
 *
 * Example: If commission rate is 10%, agent gets 90% of booking amount
 * - Booking: $2000
 * - System fee (platform): $200 (10%)
 * - Agent earnings: $1800 (90%)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateCommissionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { commissionRate, reason } = validation.data

    // Get current agent data
    const agent = await prisma.agent.findUnique({
      where: { id },
      select: {
        id: true,
        businessName: true,
        commissionRate: true,
        user: { select: { email: true } },
      },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const oldRate = agent.commissionRate

    // Update commission rate
    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: { commissionRate },
      select: {
        id: true,
        businessName: true,
        commissionRate: true,
      },
    })

    // Log the change (could be enhanced with audit log table)
    console.log(`Commission rate updated for agent ${agent.businessName}:`, {
      adminId: session.user.id,
      agentId: id,
      oldRate,
      newRate: commissionRate,
      reason: reason || "No reason provided",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `Commission rate updated from ${oldRate}% to ${commissionRate}%`,
      data: {
        agentId: updatedAgent.id,
        businessName: updatedAgent.businessName,
        previousRate: oldRate,
        newRate: updatedAgent.commissionRate,
      },
    })
  } catch (error) {
    console.error("Update commission error:", error)
    return NextResponse.json(
      { error: "Failed to update commission rate" },
      { status: 500 }
    )
  }
}
