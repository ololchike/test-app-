import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const addonSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional().nullable(),
  price: z.number().min(0),
  duration: z.string().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  maxCapacity: z.number().int().min(1).optional().nullable(),
  dayAvailable: z.array(z.number().int().min(1)).optional(),
})

// GET all activity addons for a tour
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

    // Fetch addons
    const addons = await prisma.activityAddon.findMany({
      where: { tourId },
      orderBy: { price: "asc" },
    })

    // Transform JSON fields
    const transformed = addons.map((addon) => ({
      ...addon,
      images: JSON.parse(addon.images || "[]"),
      dayAvailable: JSON.parse(addon.dayAvailable || "[]"),
    }))

    return NextResponse.json({ addons: transformed })
  } catch (error) {
    console.error("Error fetching addons:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity addons" },
      { status: 500 }
    )
  }
}

// POST create a new activity addon
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
        { error: "Only agents can add activity addons" },
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
    const validationResult = addonSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create addon
    const addon = await prisma.activityAddon.create({
      data: {
        tourId,
        name: data.name,
        description: data.description || null,
        price: data.price,
        duration: data.duration || null,
        images: JSON.stringify(data.images || []),
        maxCapacity: data.maxCapacity || null,
        dayAvailable: JSON.stringify(data.dayAvailable || []),
      },
    })

    return NextResponse.json(
      {
        message: "Activity addon added successfully",
        addon: {
          ...addon,
          images: JSON.parse(addon.images || "[]"),
          dayAvailable: JSON.parse(addon.dayAvailable || "[]"),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating addon:", error)
    return NextResponse.json(
      { error: "Failed to add activity addon" },
      { status: 500 }
    )
  }
}
