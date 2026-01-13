import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { AccommodationTier, getEnumValues } from "@/lib/constants"
import { AccommodationTier as PrismaAccommodationTier } from "@prisma/client"

const accommodationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional().nullable(),
  tier: z.enum(getEnumValues(AccommodationTier) as [string, ...string[]]),
  pricePerNight: z.number().min(0),
  images: z.array(z.string().url()).optional(),
  amenities: z.array(z.string()).optional(),
  location: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  dayNumber: z.number().int().min(1).optional().nullable(),
})

// GET all accommodation options for a tour
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

    // Fetch accommodations
    const accommodations = await prisma.accommodationOption.findMany({
      where: { tourId },
      orderBy: [{ tier: "asc" }, { pricePerNight: "asc" }],
    })

    // Transform JSON fields
    const transformed = accommodations.map((acc) => ({
      ...acc,
      images: JSON.parse(acc.images || "[]"),
      amenities: JSON.parse(acc.amenities || "[]"),
    }))

    return NextResponse.json({ accommodations: transformed })
  } catch (error) {
    console.error("Error fetching accommodations:", error)
    return NextResponse.json(
      { error: "Failed to fetch accommodations" },
      { status: 500 }
    )
  }
}

// POST create a new accommodation option
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
        { error: "Only agents can add accommodations" },
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
    const validationResult = accommodationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create accommodation
    const accommodation = await prisma.accommodationOption.create({
      data: {
        tourId,
        name: data.name,
        description: data.description || null,
        tier: data.tier as PrismaAccommodationTier,
        pricePerNight: data.pricePerNight,
        images: JSON.stringify(data.images || []),
        amenities: JSON.stringify(data.amenities || []),
        location: data.location || null,
        rating: data.rating || null,
        dayNumber: data.dayNumber || null,
      },
    })

    return NextResponse.json(
      {
        message: "Accommodation added successfully",
        accommodation: {
          ...accommodation,
          images: JSON.parse(accommodation.images || "[]"),
          amenities: JSON.parse(accommodation.amenities || "[]"),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating accommodation:", error)
    return NextResponse.json(
      { error: "Failed to add accommodation" },
      { status: 500 }
    )
  }
}
