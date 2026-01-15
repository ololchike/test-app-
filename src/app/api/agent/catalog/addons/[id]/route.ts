import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for updating add-on catalog
const updateAddonSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  basePrice: z.number().min(0).optional(),
  duration: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  type: z.enum(["ACTIVITY", "SERVICE", "EQUIPMENT", "UPGRADE"]).optional(),
  category: z.enum([
    "ADVENTURE",
    "CULTURAL",
    "WILDLIFE",
    "TRANSFER",
    "EQUIPMENT",
    "WELLNESS",
    "DINING",
  ]).optional(),
  priceType: z.enum(["PER_PERSON", "PER_GROUP", "FLAT"]).optional(),
  childPrice: z.number().optional().nullable(),
  maxCapacity: z.number().int().min(1).optional().nullable(),
  isActive: z.boolean().optional(),
})

// GET - Get single add-on from catalog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const addon = await prisma.addonCatalog.findFirst({
      where: {
        id,
        agentId: agent.id,
      },
      include: {
        tourAddons: {
          include: {
            tour: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
    })

    if (!addon) {
      return NextResponse.json({ error: "Add-on not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      addon: {
        ...addon,
        images: JSON.parse(addon.images),
        toursUsing: addon.tourAddons.map((ta) => ({
          id: ta.tour.id,
          title: ta.tour.title,
          slug: ta.tour.slug,
          priceOverride: ta.priceOverride,
        })),
      },
    })
  } catch (error) {
    console.error("Error fetching addon:", error)
    return NextResponse.json(
      { error: "Failed to fetch addon" },
      { status: 500 }
    )
  }
}

// PATCH - Update add-on in catalog
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Verify ownership
    const existingAddon = await prisma.addonCatalog.findFirst({
      where: { id, agentId: agent.id },
    })

    if (!existingAddon) {
      return NextResponse.json({ error: "Add-on not found" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateAddonSchema.parse(body)

    const addon = await prisma.addonCatalog.update({
      where: { id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description ?? null }),
        ...(validatedData.basePrice !== undefined && { basePrice: validatedData.basePrice }),
        ...(validatedData.duration !== undefined && { duration: validatedData.duration ?? null }),
        ...(validatedData.images !== undefined && { images: JSON.stringify(validatedData.images) }),
        ...(validatedData.type !== undefined && { type: validatedData.type }),
        ...(validatedData.category !== undefined && { category: validatedData.category }),
        ...(validatedData.priceType !== undefined && { priceType: validatedData.priceType }),
        ...(validatedData.childPrice !== undefined && { childPrice: validatedData.childPrice ?? null }),
        ...(validatedData.maxCapacity !== undefined && { maxCapacity: validatedData.maxCapacity ?? null }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
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
    console.error("Error updating addon:", error)
    return NextResponse.json(
      { error: "Failed to update addon" },
      { status: 500 }
    )
  }
}

// DELETE - Delete add-on from catalog
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Verify ownership and check if in use
    const existingAddon = await prisma.addonCatalog.findFirst({
      where: { id, agentId: agent.id },
      include: {
        _count: { select: { tourAddons: true } },
      },
    })

    if (!existingAddon) {
      return NextResponse.json({ error: "Add-on not found" }, { status: 404 })
    }

    // If add-on is used by tours, don't delete - deactivate instead
    if (existingAddon._count.tourAddons > 0) {
      await prisma.addonCatalog.update({
        where: { id },
        data: { isActive: false },
      })

      return NextResponse.json({
        success: true,
        message: "Add-on is used by tours. Deactivated instead of deleted.",
        deactivated: true,
      })
    }

    // Delete if not in use
    await prisma.addonCatalog.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: "Add-on deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting addon:", error)
    return NextResponse.json(
      { error: "Failed to delete addon" },
      { status: 500 }
    )
  }
}
