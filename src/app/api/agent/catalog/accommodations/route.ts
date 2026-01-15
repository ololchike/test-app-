import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for creating/updating accommodation catalog
const accommodationCatalogSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  tier: z.enum(["BUDGET", "MID_RANGE", "LUXURY", "ULTRA_LUXURY"]),
  basePricePerNight: z.number().min(0, "Price must be positive"),
  currency: z.string().default("USD"),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  location: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  roomType: z.string().optional().nullable(),
  numberOfRooms: z.number().int().min(1).optional().nullable(),
  numberOfBeds: z.number().int().min(1).optional().nullable(),
  isActive: z.boolean().default(true),
})

// GET - List all accommodations in agent's catalog
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
    const tier = searchParams.get("tier")
    const isActive = searchParams.get("isActive")
    const location = searchParams.get("location")

    const accommodations = await prisma.accommodationCatalog.findMany({
      where: {
        agentId: agent.id,
        ...(tier && { tier: tier as "BUDGET" | "MID_RANGE" | "LUXURY" | "ULTRA_LUXURY" }),
        ...(isActive !== null && { isActive: isActive === "true" }),
        ...(location && { location: { contains: location, mode: "insensitive" } }),
      },
      orderBy: [{ tier: "asc" }, { basePricePerNight: "asc" }],
      include: {
        _count: {
          select: { tourAccommodations: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      accommodations: accommodations.map((acc) => ({
        ...acc,
        images: JSON.parse(acc.images),
        amenities: JSON.parse(acc.amenities),
        toursUsingThis: acc._count.tourAccommodations,
      })),
    })
  } catch (error) {
    console.error("Error fetching accommodation catalog:", error)
    return NextResponse.json(
      { error: "Failed to fetch accommodation catalog" },
      { status: 500 }
    )
  }
}

// POST - Create new accommodation in catalog
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
    const validatedData = accommodationCatalogSchema.parse(body)

    const accommodation = await prisma.accommodationCatalog.create({
      data: {
        agentId: agent.id,
        name: validatedData.name,
        description: validatedData.description ?? undefined,
        tier: validatedData.tier,
        basePricePerNight: validatedData.basePricePerNight,
        currency: validatedData.currency,
        images: JSON.stringify(validatedData.images),
        amenities: JSON.stringify(validatedData.amenities),
        location: validatedData.location ?? undefined,
        rating: validatedData.rating ?? undefined,
        roomType: validatedData.roomType ?? undefined,
        numberOfRooms: validatedData.numberOfRooms ?? undefined,
        numberOfBeds: validatedData.numberOfBeds ?? undefined,
        isActive: validatedData.isActive,
      },
    })

    return NextResponse.json({
      success: true,
      accommodation: {
        ...accommodation,
        images: JSON.parse(accommodation.images),
        amenities: JSON.parse(accommodation.amenities),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error creating accommodation:", error)
    return NextResponse.json(
      { error: "Failed to create accommodation" },
      { status: 500 }
    )
  }
}
