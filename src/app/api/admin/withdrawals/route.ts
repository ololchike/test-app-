import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/withdrawals
 * Admin: List all withdrawal requests with filters
 * Requires ADMIN role
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const agentId = searchParams.get("agentId")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = {}
    if (status) {
      const validStatuses = ["PENDING", "APPROVED", "PROCESSING", "COMPLETED", "REJECTED"]
      if (!validStatuses.includes(status.toUpperCase())) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      where.status = status.toUpperCase()
    }
    if (agentId) {
      where.agentId = agentId
    }

    // Fetch withdrawals and total count in parallel
    const [withdrawals, total, statusCounts] = await Promise.all([
      prisma.withdrawalRequest.findMany({
        where,
        include: {
          agent: {
            select: {
              businessName: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.withdrawalRequest.count({ where }),
      // Get status counts for all withdrawals
      prisma.withdrawalRequest.groupBy({
        by: ["status"],
        _count: { status: true },
        _sum: { amount: true },
      }),
    ])

    // Format status counts
    const formattedStatusCounts: Record<
      string,
      { count: number; totalAmount: number }
    > = {}

    statusCounts.forEach((s) => {
      formattedStatusCounts[s.status] = {
        count: s._count.status,
        totalAmount: s._sum.amount || 0,
      }
    })

    // Format withdrawal data for response
    const formattedWithdrawals = withdrawals.map((w) => {
      let bankDetailsObj = null
      if (w.bankDetails) {
        try {
          bankDetailsObj = JSON.parse(w.bankDetails)
        } catch (e) {
          // If parsing fails, bankDetailsObj remains null
        }
      }

      return {
        id: w.id,
        agentId: w.agentId,
        agentName: w.agent.businessName,
        agentEmail: w.agent.user.email,
        amount: w.amount,
        currency: w.currency,
        method: w.method,
        mpesaPhone: w.mpesaPhone,
        bankDetails: bankDetailsObj,
        status: w.status,
        processedBy: w.processedBy,
        processedAt: w.processedAt,
        rejectionReason: w.rejectionReason,
        transactionRef: w.transactionRef,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedWithdrawals,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        statusCounts: formattedStatusCounts,
      },
    })
  } catch (error) {
    console.error("Admin get withdrawals error:", error)
    return NextResponse.json(
      { error: "Failed to fetch withdrawals" },
      { status: 500 }
    )
  }
}
