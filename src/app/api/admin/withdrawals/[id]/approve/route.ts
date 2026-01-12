import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * Approval Schema
 * Validates approval request data
 */
const approvalSchema = z.object({
  notes: z.string().optional(),
})

/**
 * POST /api/admin/withdrawals/[id]/approve
 * Admin: Approve a withdrawal request
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
    const validationResult = approvalSchema.safeParse(body)

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
          error: `Cannot approve withdrawal with status: ${withdrawal.status}`,
        },
        { status: 400 }
      )
    }

    // Calculate agent's available balance to verify they still have sufficient funds
    const completedBookings = await prisma.booking.findMany({
      where: {
        agentId: withdrawal.agentId,
        paymentStatus: "COMPLETED",
      },
      select: {
        agentEarnings: true,
      },
    })

    const totalEarnings = completedBookings.reduce(
      (sum, b) => sum + b.agentEarnings,
      0
    )

    // Get other pending/processing withdrawals
    const otherPendingWithdrawals = await prisma.withdrawalRequest.findMany({
      where: {
        agentId: withdrawal.agentId,
        id: { not: id },
        status: {
          in: ["PENDING", "APPROVED", "PROCESSING"],
        },
      },
      select: {
        amount: true,
      },
    })

    const otherPendingAmount = otherPendingWithdrawals.reduce(
      (sum, w) => sum + w.amount,
      0
    )

    // Get completed withdrawals
    const completedWithdrawals = await prisma.withdrawalRequest.findMany({
      where: {
        agentId: withdrawal.agentId,
        status: "COMPLETED",
      },
      select: {
        amount: true,
      },
    })

    const withdrawnAmount = completedWithdrawals.reduce(
      (sum, w) => sum + w.amount,
      0
    )

    const availableBalance =
      totalEarnings - withdrawnAmount - otherPendingAmount

    // Verify sufficient balance
    if (withdrawal.amount > availableBalance) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Agent has $${availableBalance.toFixed(2)} available`,
        },
        { status: 400 }
      )
    }

    // Update withdrawal status to APPROVED
    const updatedWithdrawal = await prisma.$transaction(async (tx) => {
      // Update withdrawal
      const updated = await tx.withdrawalRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          processedBy: session.user.id,
          processedAt: new Date(),
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "WITHDRAWAL_APPROVED",
          resource: "Withdrawal",
          resourceId: id,
          metadata: {
            agentId: withdrawal.agentId,
            amount: withdrawal.amount,
            currency: withdrawal.currency,
            notes: data.notes,
          },
        },
      })

      return updated
    })

    // TODO: Send email notification to agent (implement later with email service)
    // await sendWithdrawalApprovedEmail(
    //   withdrawal.agent.user.email,
    //   withdrawal.amount,
    //   withdrawal.currency
    // )

    return NextResponse.json({
      success: true,
      data: updatedWithdrawal,
      message: "Withdrawal approved successfully",
    })
  } catch (error) {
    console.error("Approve withdrawal error:", error)
    return NextResponse.json(
      { error: "Failed to approve withdrawal" },
      { status: 500 }
    )
  }
}
