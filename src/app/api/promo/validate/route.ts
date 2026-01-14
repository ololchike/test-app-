import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limit"

// Validation schema for promo code validation request
const validatePromoSchema = z.object({
  code: z.string().min(1, "Promo code is required").max(20),
  tourId: z.string().uuid("Invalid tour ID"),
  bookingAmount: z.number().positive("Booking amount must be positive"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Rate limiting - 20 validation attempts per minute
    const clientId = getClientIdentifier(request, session?.user?.id)
    const rateLimitResult = rateLimiters.api.check(clientId)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          },
        }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = validatePromoSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid request data",
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { code, tourId, bookingAmount } = validation.data

    // Find the promo code
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        agent: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: { usages: true },
        },
      },
    })

    // Check if promo code exists
    if (!promoCode) {
      return NextResponse.json({
        valid: false,
        error: "Invalid promo code",
      })
    }

    // Check if promo code is active
    if (!promoCode.isActive) {
      return NextResponse.json({
        valid: false,
        error: "This promo code is no longer active",
      })
    }

    // Check if agent is active
    if (promoCode.agent.status !== "ACTIVE") {
      return NextResponse.json({
        valid: false,
        error: "This promo code is no longer valid",
      })
    }

    // Check validity dates
    const now = new Date()
    if (promoCode.validFrom && now < promoCode.validFrom) {
      return NextResponse.json({
        valid: false,
        error: "This promo code is not yet valid",
      })
    }

    if (promoCode.validUntil && now > promoCode.validUntil) {
      return NextResponse.json({
        valid: false,
        error: "This promo code has expired",
      })
    }

    // Check tour restrictions
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: {
        id: true,
        agentId: true,
        status: true,
      },
    })

    if (!tour) {
      return NextResponse.json({
        valid: false,
        error: "Tour not found",
      })
    }

    // Check if promo code is for this agent's tour
    if (tour.agentId !== promoCode.agentId) {
      return NextResponse.json({
        valid: false,
        error: "This promo code is not valid for this tour",
      })
    }

    // Check if promo code is restricted to specific tours
    if (promoCode.tourIds.length > 0 && !promoCode.tourIds.includes(tourId)) {
      return NextResponse.json({
        valid: false,
        error: "This promo code is not valid for this tour",
      })
    }

    // Check maximum uses
    if (promoCode.maxUses !== null && promoCode._count.usages >= promoCode.maxUses) {
      return NextResponse.json({
        valid: false,
        error: "This promo code has reached its usage limit",
      })
    }

    // Check user-specific usage limits
    if (session?.user?.id) {
      const userUsageCount = await prisma.promoCodeUsage.count({
        where: {
          promoCodeId: promoCode.id,
          userId: session.user.id,
        },
      })

      if (userUsageCount >= promoCode.usesPerUser) {
        return NextResponse.json({
          valid: false,
          error: "You have already used this promo code the maximum number of times",
        })
      }
    }

    // Check minimum booking amount
    if (promoCode.minBookingAmount && bookingAmount < promoCode.minBookingAmount) {
      return NextResponse.json({
        valid: false,
        error: `Minimum booking amount of $${promoCode.minBookingAmount} required for this promo code`,
      })
    }

    // Calculate discount
    let discountAmount: number
    if (promoCode.discountType === "PERCENTAGE") {
      discountAmount = Math.round(bookingAmount * (promoCode.discountValue / 100) * 100) / 100

      // Apply max discount cap if set
      if (promoCode.maxDiscountAmount && discountAmount > promoCode.maxDiscountAmount) {
        discountAmount = promoCode.maxDiscountAmount
      }
    } else {
      // FIXED_AMOUNT
      discountAmount = Math.min(promoCode.discountValue, bookingAmount)
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100

    return NextResponse.json({
      valid: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        discountAmount,
        minBookingAmount: promoCode.minBookingAmount,
        maxDiscountAmount: promoCode.maxDiscountAmount,
      },
      message: promoCode.discountType === "PERCENTAGE"
        ? `${promoCode.discountValue}% discount applied`
        : `$${promoCode.discountValue} discount applied`,
    })
  } catch (error) {
    console.error("Error validating promo code:", error)
    return NextResponse.json(
      { valid: false, error: "Failed to validate promo code" },
      { status: 500 }
    )
  }
}
