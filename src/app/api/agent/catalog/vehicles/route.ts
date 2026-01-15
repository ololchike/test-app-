import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for creating/updating vehicle catalog
const vehicleCatalogSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    "SAFARI_VAN",
    "LAND_CRUISER",
    "EXTENDED_CRUISER",
    "OVERLAND_TRUCK",
    "PRIVATE_VEHICLE",
  ]),
  description: z.string().optional().nullable(),
  maxPassengers: z.number().min(1, "Must have at least 1 passenger capacity"),
  basePricePerDay: z.number().min(0, "Price must be positive"),
  currency: z.string().default("USD"),
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
})

// GET - List all vehicles in agent's catalog
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const isActive = searchParams.get("isActive")

    const vehicles = await prisma.vehicleCatalog.findMany({
      where: {
        agentId: agent.id,
        ...(type && { type: type as "SAFARI_VAN" | "LAND_CRUISER" | "EXTENDED_CRUISER" | "OVERLAND_TRUCK" | "PRIVATE_VEHICLE" }),
        ...(isActive !== null && { isActive: isActive === "true" }),
      },
      orderBy: [{ maxPassengers: "desc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { tourVehicles: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      vehicles: vehicles.map((vehicle) => ({
        ...vehicle,
        features: JSON.parse(vehicle.features),
        images: JSON.parse(vehicle.images),
        toursUsingThis: vehicle._count.tourVehicles,
      })),
    })
  } catch (error) {
    console.error("Error fetching vehicle catalog:", error)
    return NextResponse.json(
      { error: "Failed to fetch vehicle catalog" },
      { status: 500 }
    )
  }
}

// POST - Create new vehicle in catalog
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const body = await request.json()
    console.log("Creating vehicle with body:", JSON.stringify(body, null, 2))

    const validatedData = vehicleCatalogSchema.parse(body)
    console.log("Validated data:", JSON.stringify(validatedData, null, 2))

    const vehicle = await prisma.vehicleCatalog.create({
      data: {
        agentId: agent.id,
        name: validatedData.name,
        type: validatedData.type,
        description: validatedData.description || null,
        maxPassengers: validatedData.maxPassengers,
        basePricePerDay: validatedData.basePricePerDay,
        currency: validatedData.currency,
        features: JSON.stringify(validatedData.features),
        images: JSON.stringify(validatedData.images),
        isActive: validatedData.isActive,
      },
    })

    return NextResponse.json({
      success: true,
      vehicle: {
        ...vehicle,
        features: JSON.parse(vehicle.features),
        images: JSON.parse(vehicle.images),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error creating vehicle:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to create vehicle", details: errorMessage },
      { status: 500 }
    )
  }
}
