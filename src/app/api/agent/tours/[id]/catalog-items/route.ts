import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for assigning add-on to tour
const assignAddonSchema = z.object({
  addonCatalogId: z.string(),
  priceOverride: z.number().optional().nullable(),
  childPriceOverride: z.number().optional().nullable(),
  dayNumbers: z.array(z.number()).default([]),
  isRecommended: z.boolean().default(false),
})

// Schema for assigning vehicle to tour
const assignVehicleSchema = z.object({
  vehicleCatalogId: z.string(),
  pricePerDayOverride: z.number().optional().nullable(),
  isDefault: z.boolean().default(false),
  isIncludedInBase: z.boolean().default(false),
})

// Schema for assigning accommodation to tour
const assignAccommodationSchema = z.object({
  accommodationCatalogId: z.string(),
  pricePerNightOverride: z.number().optional().nullable(),
  availableDays: z.array(z.number()).default([]),
  tierOverride: z.enum(["BUDGET", "MID_RANGE", "LUXURY", "ULTRA_LUXURY"]).optional().nullable(),
  isDefault: z.boolean().default(false),
})

// GET - Get all catalog items assigned to this tour
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: tourId } = await params

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Verify tour ownership
    const tour = await prisma.tour.findFirst({
      where: { id: tourId, agentId: agent.id },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Get assigned items
    const [addons, vehicles, accommodations] = await Promise.all([
      prisma.tourAddon.findMany({
        where: { tourId },
        include: {
          addonCatalog: true,
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.tourVehicle.findMany({
        where: { tourId },
        include: {
          vehicleCatalog: true,
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.tourAccommodation.findMany({
        where: { tourId },
        include: {
          accommodationCatalog: true,
        },
        orderBy: { sortOrder: "asc" },
      }),
    ])

    return NextResponse.json({
      success: true,
      addons: addons.map((a) => ({
        id: a.id,
        catalog: {
          ...a.addonCatalog,
          images: JSON.parse(a.addonCatalog.images),
        },
        priceOverride: a.priceOverride,
        childPriceOverride: a.childPriceOverride,
        effectivePrice: a.priceOverride ?? a.addonCatalog.basePrice,
        dayNumbers: JSON.parse(a.dayNumbers),
        isRecommended: a.isRecommended,
        isActive: a.isActive,
      })),
      vehicles: vehicles.map((v) => ({
        id: v.id,
        catalog: {
          ...v.vehicleCatalog,
          features: JSON.parse(v.vehicleCatalog.features),
          images: JSON.parse(v.vehicleCatalog.images),
        },
        pricePerDayOverride: v.pricePerDayOverride,
        effectivePricePerDay: v.pricePerDayOverride ?? v.vehicleCatalog.basePricePerDay,
        isDefault: v.isDefault,
        isIncludedInBase: v.isIncludedInBase,
        isActive: v.isActive,
      })),
      accommodations: accommodations.map((a) => ({
        id: a.id,
        catalog: {
          ...a.accommodationCatalog,
          images: JSON.parse(a.accommodationCatalog.images),
          amenities: JSON.parse(a.accommodationCatalog.amenities),
        },
        pricePerNightOverride: a.pricePerNightOverride,
        effectivePricePerNight: a.pricePerNightOverride ?? a.accommodationCatalog.basePricePerNight,
        availableDays: JSON.parse(a.availableDays),
        tierOverride: a.tierOverride,
        isDefault: a.isDefault,
        isActive: a.isActive,
      })),
    })
  } catch (error) {
    console.error("Error fetching tour catalog items:", error)
    return NextResponse.json(
      { error: "Failed to fetch tour catalog items" },
      { status: 500 }
    )
  }
}

// POST - Assign catalog items to tour
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: tourId } = await params

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const tour = await prisma.tour.findFirst({
      where: { id: tourId, agentId: agent.id },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    const body = await request.json()
    const { type, ...data } = body

    if (type === "addon") {
      const validated = assignAddonSchema.parse(data)

      // Verify catalog item belongs to agent
      const catalogItem = await prisma.addonCatalog.findFirst({
        where: { id: validated.addonCatalogId, agentId: agent.id },
      })

      if (!catalogItem) {
        return NextResponse.json({ error: "Add-on not found in your catalog" }, { status: 404 })
      }

      const addon = await prisma.tourAddon.upsert({
        where: {
          tourId_addonCatalogId: {
            tourId,
            addonCatalogId: validated.addonCatalogId,
          },
        },
        create: {
          tourId,
          addonCatalogId: validated.addonCatalogId,
          priceOverride: validated.priceOverride,
          childPriceOverride: validated.childPriceOverride,
          dayNumbers: JSON.stringify(validated.dayNumbers),
          isRecommended: validated.isRecommended,
        },
        update: {
          priceOverride: validated.priceOverride,
          childPriceOverride: validated.childPriceOverride,
          dayNumbers: JSON.stringify(validated.dayNumbers),
          isRecommended: validated.isRecommended,
          isActive: true,
        },
        include: { addonCatalog: true },
      })

      return NextResponse.json({
        success: true,
        addon: {
          id: addon.id,
          catalog: {
            ...addon.addonCatalog,
            images: JSON.parse(addon.addonCatalog.images),
          },
          priceOverride: addon.priceOverride,
          effectivePrice: addon.priceOverride ?? addon.addonCatalog.basePrice,
          dayNumbers: JSON.parse(addon.dayNumbers),
          isRecommended: addon.isRecommended,
        },
      })
    }

    if (type === "vehicle") {
      const validated = assignVehicleSchema.parse(data)

      const catalogItem = await prisma.vehicleCatalog.findFirst({
        where: { id: validated.vehicleCatalogId, agentId: agent.id },
      })

      if (!catalogItem) {
        return NextResponse.json({ error: "Vehicle not found in your catalog" }, { status: 404 })
      }

      // If setting as default, unset other defaults
      if (validated.isDefault) {
        await prisma.tourVehicle.updateMany({
          where: { tourId, isDefault: true },
          data: { isDefault: false },
        })
      }

      const vehicle = await prisma.tourVehicle.upsert({
        where: {
          tourId_vehicleCatalogId: {
            tourId,
            vehicleCatalogId: validated.vehicleCatalogId,
          },
        },
        create: {
          tourId,
          vehicleCatalogId: validated.vehicleCatalogId,
          pricePerDayOverride: validated.pricePerDayOverride,
          isDefault: validated.isDefault,
          isIncludedInBase: validated.isIncludedInBase,
        },
        update: {
          pricePerDayOverride: validated.pricePerDayOverride,
          isDefault: validated.isDefault,
          isIncludedInBase: validated.isIncludedInBase,
          isActive: true,
        },
        include: { vehicleCatalog: true },
      })

      return NextResponse.json({
        success: true,
        vehicle: {
          id: vehicle.id,
          catalog: {
            ...vehicle.vehicleCatalog,
            features: JSON.parse(vehicle.vehicleCatalog.features),
            images: JSON.parse(vehicle.vehicleCatalog.images),
          },
          pricePerDayOverride: vehicle.pricePerDayOverride,
          effectivePricePerDay: vehicle.pricePerDayOverride ?? vehicle.vehicleCatalog.basePricePerDay,
          isDefault: vehicle.isDefault,
          isIncludedInBase: vehicle.isIncludedInBase,
        },
      })
    }

    if (type === "accommodation") {
      const validated = assignAccommodationSchema.parse(data)

      const catalogItem = await prisma.accommodationCatalog.findFirst({
        where: { id: validated.accommodationCatalogId, agentId: agent.id },
      })

      if (!catalogItem) {
        return NextResponse.json({ error: "Accommodation not found in your catalog" }, { status: 404 })
      }

      if (validated.isDefault) {
        await prisma.tourAccommodation.updateMany({
          where: { tourId, isDefault: true },
          data: { isDefault: false },
        })
      }

      const accommodation = await prisma.tourAccommodation.upsert({
        where: {
          tourId_accommodationCatalogId: {
            tourId,
            accommodationCatalogId: validated.accommodationCatalogId,
          },
        },
        create: {
          tourId,
          accommodationCatalogId: validated.accommodationCatalogId,
          pricePerNightOverride: validated.pricePerNightOverride,
          availableDays: JSON.stringify(validated.availableDays),
          tierOverride: validated.tierOverride,
          isDefault: validated.isDefault,
        },
        update: {
          pricePerNightOverride: validated.pricePerNightOverride,
          availableDays: JSON.stringify(validated.availableDays),
          tierOverride: validated.tierOverride,
          isDefault: validated.isDefault,
          isActive: true,
        },
        include: { accommodationCatalog: true },
      })

      return NextResponse.json({
        success: true,
        accommodation: {
          id: accommodation.id,
          catalog: {
            ...accommodation.accommodationCatalog,
            images: JSON.parse(accommodation.accommodationCatalog.images),
            amenities: JSON.parse(accommodation.accommodationCatalog.amenities),
          },
          pricePerNightOverride: accommodation.pricePerNightOverride,
          effectivePricePerNight: accommodation.pricePerNightOverride ?? accommodation.accommodationCatalog.basePricePerNight,
          availableDays: JSON.parse(accommodation.availableDays),
          tierOverride: accommodation.tierOverride,
          isDefault: accommodation.isDefault,
        },
      })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error assigning catalog item:", error)
    return NextResponse.json(
      { error: "Failed to assign catalog item" },
      { status: 500 }
    )
  }
}

// DELETE - Remove catalog item from tour
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: tourId } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const itemId = searchParams.get("itemId")

    if (!type || !itemId) {
      return NextResponse.json({ error: "Type and itemId required" }, { status: 400 })
    }

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const tour = await prisma.tour.findFirst({
      where: { id: tourId, agentId: agent.id },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    if (type === "addon") {
      await prisma.tourAddon.delete({
        where: { id: itemId, tourId },
      })
    } else if (type === "vehicle") {
      await prisma.tourVehicle.delete({
        where: { id: itemId, tourId },
      })
    } else if (type === "accommodation") {
      await prisma.tourAccommodation.delete({
        where: { id: itemId, tourId },
      })
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing catalog item:", error)
    return NextResponse.json(
      { error: "Failed to remove catalog item" },
      { status: 500 }
    )
  }
}
