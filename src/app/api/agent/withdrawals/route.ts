import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * Withdrawal Request Schema
 * Validates withdrawal request data with strict rules
 */
const withdrawalSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum(["USD", "KES"]).default("USD"),
  method: z.enum(["mpesa", "bank"]),
  mpesaPhone: z.string().optional(),
  bankDetails: z
    .object({
      bankName: z.string().min(1),
      accountNumber: z.string().min(1),
      accountName: z.string().min(1),
      branchCode: z.string().optional(),
      swiftCode: z.string().optional(),
    })
    .optional(),
})

/**
 * GET /api/agent/withdrawals
 * Get agent's withdrawal history with pagination and filters
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = { agentId: agent.id }
    if (status) {
      // Validate status
      const validStatuses = ["PENDING", "APPROVED", "PROCESSING", "COMPLETED", "REJECTED"]
      if (!validStatuses.includes(status.toUpperCase())) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      where.status = status.toUpperCase()
    }

    // Fetch withdrawals and total count in parallel
    const [withdrawals, total] = await Promise.all([
      prisma.withdrawalRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.withdrawalRequest.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: withdrawals,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get withdrawals error:", error)
    return NextResponse.json(
      { error: "Failed to fetch withdrawals" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/agent/withdrawals
 * Create a new withdrawal request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get agent profile with bankDetails
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      include: {
        bankDetails: true,
      },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Check if agent is approved
    if (agent.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Agent account must be active to request withdrawals" },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = withdrawalSchema.safeParse(body)

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

    // Get platform settings for minimum withdrawal
    const settings = await prisma.platformSettings.findUnique({
      where: { id: "default" },
    })

    // Check for development mode
    const isDevMode = process.env.PESAPAL_DEV_MODE === "true"

    // In dev mode, allow 1 KES test withdrawals; otherwise enforce minimum
    const minWithdrawal = isDevMode ? 1 : (settings?.minWithdrawalAmount || 50.0)

    // Validate minimum amount
    if (data.amount < minWithdrawal) {
      return NextResponse.json(
        {
          error: `Minimum withdrawal amount is $${minWithdrawal}`,
        },
        { status: 400 }
      )
    }

    // Log dev mode status for debugging
    if (isDevMode && data.amount === 1) {
      console.log(`Dev mode enabled: Processing 1 KES test withdrawal for agent ${agent.id}`)
    }

    // Calculate available balance
    // Get total earnings from completed bookings
    const completedBookings = await prisma.booking.findMany({
      where: {
        agentId: agent.id,
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

    // Get pending and approved withdrawals
    const pendingWithdrawals = await prisma.withdrawalRequest.findMany({
      where: {
        agentId: agent.id,
        status: {
          in: ["PENDING", "APPROVED", "PROCESSING"],
        },
      },
      select: {
        amount: true,
      },
    })

    const pendingAmount = pendingWithdrawals.reduce(
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

    const withdrawnAmount = completedWithdrawals.reduce(
      (sum, w) => sum + w.amount,
      0
    )

    const availableBalance = totalEarnings - withdrawnAmount - pendingAmount

    // Validate sufficient balance
    if (data.amount > availableBalance) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Available: $${availableBalance.toFixed(2)}`,
        },
        { status: 400 }
      )
    }

    // Check for existing pending withdrawal
    const existingPending = await prisma.withdrawalRequest.findFirst({
      where: {
        agentId: agent.id,
        status: {
          in: ["PENDING", "PROCESSING"],
        },
      },
    })

    if (existingPending) {
      return NextResponse.json(
        {
          error: "You already have a pending withdrawal request",
        },
        { status: 400 }
      )
    }

    // Validate payment method details
    if (data.method === "mpesa") {
      if (!data.mpesaPhone) {
        return NextResponse.json(
          { error: "M-Pesa phone number is required" },
          { status: 400 }
        )
      }
      // Validate phone format (basic validation)
      const phoneRegex = /^(\+?254|0)[17]\d{8}$/
      if (!phoneRegex.test(data.mpesaPhone)) {
        return NextResponse.json(
          { error: "Invalid M-Pesa phone number format" },
          { status: 400 }
        )
      }
    } else if (data.method === "bank") {
      if (!data.bankDetails) {
        return NextResponse.json(
          { error: "Bank details are required for bank transfer" },
          { status: 400 }
        )
      }
      if (
        !data.bankDetails.bankName ||
        !data.bankDetails.accountNumber ||
        !data.bankDetails.accountName
      ) {
        return NextResponse.json(
          {
            error: "Bank name, account number, and account name are required",
          },
          { status: 400 }
        )
      }
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        agentId: agent.id,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        mpesaPhone: data.method === "mpesa" ? data.mpesaPhone : null,
        bankDetails:
          data.method === "bank" && data.bankDetails
            ? JSON.stringify(data.bankDetails)
            : null,
        status: "PENDING",
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: withdrawal,
        message: "Withdrawal request submitted successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create withdrawal error:", error)
    return NextResponse.json(
      { error: "Failed to create withdrawal request" },
      { status: 500 }
    )
  }
}
