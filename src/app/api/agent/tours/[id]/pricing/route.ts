import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const pricingSchema = z.object({
  // Child pricing
  childDiscountPercent: z.number().min(0).max(100).optional(),
  childMinAge: z.number().int().min(0).max(17).optional(),
  childMaxAge: z.number().int().min(0).max(17).optional(),

  // Infant pricing
  infantMaxAge: z.number().int().min(0).max(5).optional(),
  infantPrice: z.number().min(0).optional(),

  // Service fees
  serviceFeePercent: z.number().min(0).max(30).optional(),
  serviceFeeFixed: z.number().min(0).nullable().optional(),

  // Deposit settings
  depositPercent: z.number().min(0).max(100).nullable().optional(),
  depositMinimum: z.number().min(0).nullable().optional(),

  // Group discounts
  groupDiscountThreshold: z.number().int().min(1).nullable().optional(),
  groupDiscountPercent: z.number().min(0).max(50).nullable().optional(),

  // Early bird discount
  earlyBirdDays: z.number().int().min(1).nullable().optional(),
  earlyBirdPercent: z.number().min(0).max(50).nullable().optional(),
})

// GET tour pricing configuration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: tourId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can access this resource" },
        { status: 403 }
      )
    }

    // Find agent and verify tour ownership
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      )
    }

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: { pricing: true },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    if (tour.agentId !== agent.id) {
      return NextResponse.json(
        { error: "You don't have permission to access this tour" },
        { status: 403 }
      )
    }

    // Return pricing config or defaults
    const pricing = tour.pricing || {
      childDiscountPercent: 30,
      childMinAge: 3,
      childMaxAge: 11,
      infantMaxAge: 2,
      infantPrice: 0,
      serviceFeePercent: 5,
      serviceFeeFixed: null,
      depositPercent: null,
      depositMinimum: null,
      groupDiscountThreshold: null,
      groupDiscountPercent: null,
      earlyBirdDays: null,
      earlyBirdPercent: null,
    }

    return NextResponse.json({ pricing })
  } catch (error) {
    console.error("Error fetching tour pricing:", error)
    return NextResponse.json(
      { error: "Failed to fetch pricing configuration" },
      { status: 500 }
    )
  }
}

// PUT update tour pricing configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: tourId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can update pricing" },
        { status: 403 }
      )
    }

    // Find agent and verify tour ownership
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      )
    }

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    if (tour.agentId !== agent.id) {
      return NextResponse.json(
        { error: "You don't have permission to modify this tour" },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = pricingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Upsert pricing configuration
    const pricing = await prisma.tourPricing.upsert({
      where: { tourId },
      create: {
        tourId,
        childDiscountPercent: data.childDiscountPercent ?? 30,
        childMinAge: data.childMinAge ?? 3,
        childMaxAge: data.childMaxAge ?? 11,
        infantMaxAge: data.infantMaxAge ?? 2,
        infantPrice: data.infantPrice ?? 0,
        serviceFeePercent: data.serviceFeePercent ?? 5,
        serviceFeeFixed: data.serviceFeeFixed ?? null,
        depositPercent: data.depositPercent ?? null,
        depositMinimum: data.depositMinimum ?? null,
        groupDiscountThreshold: data.groupDiscountThreshold ?? null,
        groupDiscountPercent: data.groupDiscountPercent ?? null,
        earlyBirdDays: data.earlyBirdDays ?? null,
        earlyBirdPercent: data.earlyBirdPercent ?? null,
      },
      update: {
        ...(data.childDiscountPercent !== undefined && { childDiscountPercent: data.childDiscountPercent }),
        ...(data.childMinAge !== undefined && { childMinAge: data.childMinAge }),
        ...(data.childMaxAge !== undefined && { childMaxAge: data.childMaxAge }),
        ...(data.infantMaxAge !== undefined && { infantMaxAge: data.infantMaxAge }),
        ...(data.infantPrice !== undefined && { infantPrice: data.infantPrice }),
        ...(data.serviceFeePercent !== undefined && { serviceFeePercent: data.serviceFeePercent }),
        ...(data.serviceFeeFixed !== undefined && { serviceFeeFixed: data.serviceFeeFixed }),
        ...(data.depositPercent !== undefined && { depositPercent: data.depositPercent }),
        ...(data.depositMinimum !== undefined && { depositMinimum: data.depositMinimum }),
        ...(data.groupDiscountThreshold !== undefined && { groupDiscountThreshold: data.groupDiscountThreshold }),
        ...(data.groupDiscountPercent !== undefined && { groupDiscountPercent: data.groupDiscountPercent }),
        ...(data.earlyBirdDays !== undefined && { earlyBirdDays: data.earlyBirdDays }),
        ...(data.earlyBirdPercent !== undefined && { earlyBirdPercent: data.earlyBirdPercent }),
      },
    })

    return NextResponse.json({
      message: "Pricing configuration updated successfully",
      pricing,
    })
  } catch (error) {
    console.error("Error updating tour pricing:", error)
    return NextResponse.json(
      { error: "Failed to update pricing configuration" },
      { status: 500 }
    )
  }
}

// DELETE remove custom pricing (revert to defaults)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: tourId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can delete pricing" },
        { status: 403 }
      )
    }

    // Find agent and verify tour ownership
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      )
    }

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    if (tour.agentId !== agent.id) {
      return NextResponse.json(
        { error: "You don't have permission to modify this tour" },
        { status: 403 }
      )
    }

    // Delete pricing configuration (will use defaults)
    await prisma.tourPricing.deleteMany({
      where: { tourId },
    })

    return NextResponse.json({ message: "Pricing configuration reset to defaults" })
  } catch (error) {
    console.error("Error deleting tour pricing:", error)
    return NextResponse.json(
      { error: "Failed to reset pricing configuration" },
      { status: 500 }
    )
  }
}
