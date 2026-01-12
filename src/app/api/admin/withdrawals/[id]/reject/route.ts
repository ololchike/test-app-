import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * Rejection Schema
 * Validates rejection request data
 */
const rejectionSchema = z.object({
  reason: z
    .string()
    .min(10, "Rejection reason must be at least 10 characters")
    .max(500, "Rejection reason must not exceed 500 characters"),
})

/**
 * POST /api/admin/withdrawals/[id]/reject
 * Admin: Reject a withdrawal request
 * Requires ADMIN role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Await params
    const { id } = await params

    // Parse and validate request body
    const body = await request.json()
    const validationResult = rejectionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Get withdrawal with agent info
    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id },
      include: {
        agent: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal not found" },
        { status: 404 }
      )
    }

    // Verify withdrawal is in PENDING status
    if (withdrawal.status !== "PENDING") {
      return NextResponse.json(
        {
          error: `Cannot reject withdrawal with status: ${withdrawal.status}`,
        },
        { status: 400 }
      )
    }

    // Update withdrawal status to REJECTED in a transaction
    const updatedWithdrawal = await prisma.$transaction(async (tx) => {
      // Update withdrawal
      const updated = await tx.withdrawalRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          processedBy: session.user.id,
          processedAt: new Date(),
          rejectionReason: data.reason,
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "WITHDRAWAL_REJECTED",
          resource: "Withdrawal",
          resourceId: id,
          metadata: {
            agentId: withdrawal.agentId,
            amount: withdrawal.amount,
            currency: withdrawal.currency,
            rejectionReason: data.reason,
          },
        },
      })

      return updated
    })

    // TODO: Send email notification to agent with rejection reason
    // await sendWithdrawalRejectedEmail(
    //   withdrawal.agent.user.email,
    //   withdrawal.amount,
    //   withdrawal.currency,
    //   data.reason
    // )

    return NextResponse.json({
      success: true,
      data: updatedWithdrawal,
      message: "Withdrawal rejected",
    })
  } catch (error) {
    console.error("Reject withdrawal error:", error)
    return NextResponse.json(
      { error: "Failed to reject withdrawal" },
      { status: 500 }
    )
  }
}
