import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { VehicleType } from "@prisma/client"

const vehicleSchema = z.object({
  type: z.enum([
    "SAFARI_VAN",
    "LAND_CRUISER",
    "EXTENDED_CRUISER",
    "OVERLAND_TRUCK",
    "PRIVATE_VEHICLE",
  ] as const),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional().nullable(),
  maxPassengers: z.number().int().min(1).max(50),
  pricePerDay: z.number().min(0),
  features: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

// GET all vehicles for a tour
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

    // Fetch vehicles
    const vehicles = await prisma.vehicle.findMany({
      where: { tourId },
      orderBy: [{ isDefault: "desc" }, { pricePerDay: "asc" }],
    })

    // Transform JSON fields
    const transformed = vehicles.map((vehicle) => ({
      ...vehicle,
      features: JSON.parse(vehicle.features || "[]"),
      images: JSON.parse(vehicle.images || "[]"),
    }))

    return NextResponse.json({ vehicles: transformed })
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    )
  }
}

// POST create a new vehicle
export async function POST(
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
        { error: "Only agents can add vehicles" },
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
    const validationResult = vehicleSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // If this vehicle is being set as default, unset other defaults
    if (data.isDefault) {
      await prisma.vehicle.updateMany({
        where: { tourId, isDefault: true },
        data: { isDefault: false },
      })
    }

    // Check if this is the first vehicle - make it default
    const existingVehicles = await prisma.vehicle.count({ where: { tourId } })
    const isFirstVehicle = existingVehicles === 0

    // Create vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        tourId,
        type: data.type as VehicleType,
        name: data.name,
        description: data.description || null,
        maxPassengers: data.maxPassengers,
        pricePerDay: data.pricePerDay,
        features: JSON.stringify(data.features || []),
        images: JSON.stringify(data.images || []),
        isDefault: data.isDefault ?? isFirstVehicle,
        isActive: data.isActive ?? true,
      },
    })

    return NextResponse.json(
      {
        message: "Vehicle added successfully",
        vehicle: {
          ...vehicle,
          features: JSON.parse(vehicle.features || "[]"),
          images: JSON.parse(vehicle.images || "[]"),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating vehicle:", error)
    return NextResponse.json(
      { error: "Failed to add vehicle" },
      { status: 500 }
    )
  }
}
