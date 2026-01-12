import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * Process Schema
 * Validates process request data
 */
const processSchema = z.object({
  transactionRef: z
    .string()
    .min(1, "Transaction reference is required")
    .max(100),
  notes: z.string().optional(),
})

/**
 * POST /api/admin/withdrawals/[id]/process
 * Admin: Mark withdrawal as completed with transaction reference
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
    const validationResult = processSchema.safeParse(body)

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

    // Verify withdrawal is in APPROVED or PROCESSING status
    if (!["APPROVED", "PROCESSING"].includes(withdrawal.status)) {
      return NextResponse.json(
        {
          error: `Cannot process withdrawal with status: ${withdrawal.status}`,
        },
        { status: 400 }
      )
    }

    // Update withdrawal status to COMPLETED in a transaction
    const updatedWithdrawal = await prisma.$transaction(async (tx) => {
      // Update withdrawal
      const updated = await tx.withdrawalRequest.update({
        where: { id },
        data: {
          status: "COMPLETED",
          processedBy: session.user.id,
          processedAt: new Date(),
          transactionRef: data.transactionRef,
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "WITHDRAWAL_COMPLETED",
          resource: "Withdrawal",
          resourceId: id,
          metadata: {
            agentId: withdrawal.agentId,
            amount: withdrawal.amount,
            currency: withdrawal.currency,
            transactionRef: data.transactionRef,
            notes: data.notes,
          },
        },
      })

      return updated
    })

    // TODO: Send email notification to agent with transaction reference
    // await sendWithdrawalCompletedEmail(
    //   withdrawal.agent.user.email,
    //   withdrawal.amount,
    //   withdrawal.currency,
    //   data.transactionRef
    // )

    return NextResponse.json({
      success: true,
      data: updatedWithdrawal,
      message: "Withdrawal processed successfully",
    })
  } catch (error) {
    console.error("Process withdrawal error:", error)
    return NextResponse.json(
      { error: "Failed to process withdrawal" },
      { status: 500 }
    )
  }
}
