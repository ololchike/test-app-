import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for creating promo codes
const createPromoCodeSchema = z.object({
  code: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/, "Code must be uppercase alphanumeric"),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().positive(),
  minBookingAmount: z.number().positive().optional(),
  maxDiscountAmount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  usesPerUser: z.number().int().positive().default(1),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  tourIds: z.array(z.string()).optional(),
})

// GET - List agent's promo codes
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"

    // Fetch promo codes
    const promoCodes = await prisma.promoCode.findMany({
      where: {
        agentId: agent.id,
        ...(activeOnly && { isActive: true }),
      },
      include: {
        _count: {
          select: { usages: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Format response
    const formattedCodes = promoCodes.map((code) => ({
      id: code.id,
      code: code.code,
      discountType: code.discountType,
      discountValue: code.discountValue,
      minBookingAmount: code.minBookingAmount,
      maxDiscountAmount: code.maxDiscountAmount,
      maxUses: code.maxUses,
      usesPerUser: code.usesPerUser,
      usedCount: code._count.usages,
      validFrom: code.validFrom,
      validUntil: code.validUntil,
      tourIds: code.tourIds,
      isActive: code.isActive,
      createdAt: code.createdAt,
    }))

    return NextResponse.json({ promoCodes: formattedCodes })
  } catch (error) {
    console.error("Error fetching promo codes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new promo code
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = createPromoCodeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      )
    }

    const data = validation.data

    // Validate discount value for percentage
    if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
      return NextResponse.json(
        { error: "Percentage discount cannot exceed 100%" },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingCode = await prisma.promoCode.findUnique({
      where: { code: data.code },
    })

    if (existingCode) {
      return NextResponse.json(
        { error: "Promo code already exists" },
        { status: 400 }
      )
    }

    // Validate tour IDs if provided
    if (data.tourIds && data.tourIds.length > 0) {
      const tours = await prisma.tour.findMany({
        where: {
          id: { in: data.tourIds },
          agentId: agent.id,
        },
      })

      if (tours.length !== data.tourIds.length) {
        return NextResponse.json(
          { error: "Some tour IDs are invalid or do not belong to you" },
          { status: 400 }
        )
      }
    }

    // Create promo code
    const promoCode = await prisma.promoCode.create({
      data: {
        agentId: agent.id,
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        minBookingAmount: data.minBookingAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        maxUses: data.maxUses,
        usesPerUser: data.usesPerUser,
        validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        tourIds: data.tourIds || [],
      },
    })

    return NextResponse.json({
      success: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
      },
    })
  } catch (error) {
    console.error("Error creating promo code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
