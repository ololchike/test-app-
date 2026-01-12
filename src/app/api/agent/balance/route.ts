import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/agent/balance
 * Get agent's current balance information
 * Returns total earnings, pending withdrawals, and available balance
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get agent profile
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Get all completed bookings for total earnings
    const completedBookings = await prisma.booking.findMany({
      where: {
        agentId: agent.id,
        paymentStatus: "COMPLETED",
      },
      select: {
        agentEarnings: true,
        createdAt: true,
      },
    })

    const totalEarnings = completedBookings.reduce(
      (sum, b) => sum + b.agentEarnings,
      0
    )

    // Get current month earnings
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlyEarnings = completedBookings
      .filter((b) => new Date(b.createdAt) >= thisMonth)
      .reduce((sum, b) => sum + b.agentEarnings, 0)

    // Get pending and processing withdrawals
    const pendingWithdrawals = await prisma.withdrawalRequest.findMany({
      where: {
        agentId: agent.id,
        status: {
          in: ["PENDING", "APPROVED", "PROCESSING"],
        },
      },
      select: {
        amount: true,
        status: true,
      },
    })

    const pendingWithdrawalsAmount = pendingWithdrawals.reduce(
      (sum, w) => sum + w.amount,
      0
    )

    // Get completed withdrawals
    const completedWithdrawals = await prisma.withdrawalRequest.findMany({
      where: {
        agentId: agent.id,
        status: "COMPLETED",
      },
      select: {
        amount: true,
      },
    })

    const totalWithdrawn = completedWithdrawals.reduce(
      (sum, w) => sum + w.amount,
      0
    )

    // Calculate available balance
    const availableBalance = totalEarnings - totalWithdrawn - pendingWithdrawalsAmount

    // Get pending bookings (confirmed but not yet completed)
    const pendingBookings = await prisma.booking.findMany({
      where: {
        agentId: agent.id,
        status: {
          in: ["CONFIRMED", "PAID", "IN_PROGRESS"],
        },
        paymentStatus: "COMPLETED",
      },
      select: {
        agentEarnings: true,
      },
    })

    const pendingEarnings = pendingBookings.reduce(
      (sum, b) => sum + b.agentEarnings,
      0
    )

    return NextResponse.json({
      success: true,
      data: {
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        monthlyEarnings: parseFloat(monthlyEarnings.toFixed(2)),
        availableBalance: parseFloat(availableBalance.toFixed(2)),
        pendingWithdrawals: parseFloat(pendingWithdrawalsAmount.toFixed(2)),
        totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
        pendingEarnings: parseFloat(pendingEarnings.toFixed(2)),
        currency: "USD",
        stats: {
          completedBookingsCount: completedBookings.length,
          pendingWithdrawalsCount: pendingWithdrawals.length,
          completedWithdrawalsCount: completedWithdrawals.length,
        },
      },
    })
  } catch (error) {
    console.error("Get balance error:", error)
    return NextResponse.json(
      { error: "Failed to fetch balance information" },
      { status: 500 }
    )
  }
}
