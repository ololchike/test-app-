import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for creating/updating add-on catalog
const addonCatalogSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  basePrice: z.number().min(0, "Price must be positive"),
  duration: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
  type: z.enum(["ACTIVITY", "SERVICE", "EQUIPMENT", "UPGRADE"]).default("ACTIVITY"),
  category: z.enum([
    "ADVENTURE",
    "CULTURAL",
    "WILDLIFE",
    "TRANSFER",
    "EQUIPMENT",
    "WELLNESS",
    "DINING",
  ]).default("ADVENTURE"),
  priceType: z.enum(["PER_PERSON", "PER_GROUP", "FLAT"]).default("PER_PERSON"),
  childPrice: z.number().optional().nullable(),
  maxCapacity: z.number().int().min(1).optional().nullable(),
  isActive: z.boolean().default(true),
})

// GET - List all add-ons in agent's catalog
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const category = searchParams.get("category")
    const isActive = searchParams.get("isActive")

    const addons = await prisma.addonCatalog.findMany({
      where: {
        agentId: agent.id,
        ...(type && { type: type as "ACTIVITY" | "SERVICE" | "EQUIPMENT" | "UPGRADE" }),
        ...(category && { category: category as "ADVENTURE" | "CULTURAL" | "WILDLIFE" | "TRANSFER" | "EQUIPMENT" | "WELLNESS" | "DINING" }),
        ...(isActive !== null && { isActive: isActive === "true" }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { tourAddons: true }, // Count tours using this addon
        },
      },
    })

    return NextResponse.json({
      success: true,
      addons: addons.map((addon) => ({
        ...addon,
        images: JSON.parse(addon.images),
        toursUsingThis: addon._count.tourAddons,
      })),
    })
  } catch (error) {
    console.error("Error fetching addon catalog:", error)
    return NextResponse.json(
      { error: "Failed to fetch addon catalog" },
      { status: 500 }
    )
  }
}

// POST - Create new add-on in catalog
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = addonCatalogSchema.parse(body)

    const addon = await prisma.addonCatalog.create({
      data: {
        agentId: agent.id,
        name: validatedData.name,
        description: validatedData.description ?? undefined,
        basePrice: validatedData.basePrice,
        duration: validatedData.duration ?? undefined,
        images: JSON.stringify(validatedData.images),
        type: validatedData.type,
        category: validatedData.category,
        priceType: validatedData.priceType,
        childPrice: validatedData.childPrice ?? undefined,
        maxCapacity: validatedData.maxCapacity ?? undefined,
        isActive: validatedData.isActive,
      },
    })

    return NextResponse.json({
      success: true,
      addon: {
        ...addon,
        images: JSON.parse(addon.images),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error creating addon:", error)
    return NextResponse.json(
      { error: "Failed to create addon" },
      { status: 500 }
    )
  }
}
