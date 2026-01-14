import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for commission tier
const commissionTierSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  minBookings: z.number().int().min(0),
  minRevenue: z.number().min(0).nullable().optional(),
  commissionRate: z.number().min(0).max(100),
  description: z.string().max(500).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  isActive: z.boolean().default(true),
})

// GET - List all commission tiers
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tiers = await prisma.commissionTier.findMany({
      orderBy: { minBookings: "asc" },
    })

    return NextResponse.json({ tiers })
  } catch (error) {
    console.error("Error fetching commission tiers:", error)
    return NextResponse.json(
      { error: "Failed to fetch commission tiers" },
      { status: 500 }
    )
  }
}

// POST - Create a new commission tier
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = commissionTierSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const tier = await prisma.commissionTier.create({
      data: {
        name: data.name,
        minBookings: data.minBookings,
        minRevenue: data.minRevenue ?? null,
        commissionRate: data.commissionRate,
        description: data.description ?? null,
        color: data.color ?? null,
        isActive: data.isActive,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "commission_tier_created",
        resource: "commission_tier",
        resourceId: tier.id,
        metadata: {
          tierName: tier.name,
          commissionRate: tier.commissionRate,
        },
      },
    })

    return NextResponse.json({ tier }, { status: 201 })
  } catch (error) {
    console.error("Error creating commission tier:", error)
    return NextResponse.json(
      { error: "Failed to create commission tier" },
      { status: 500 }
    )
  }
}
