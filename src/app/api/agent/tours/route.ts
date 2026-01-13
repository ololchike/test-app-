import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { DifficultyLevel, getEnumValues } from "@/lib/constants"

// Validation schema for tour creation
const createTourSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  subtitle: z.string().max(200).optional(),
  description: z.string().min(50, "Description must be at least 50 characters"),
  destination: z.string().min(2, "Destination is required"),
  country: z.enum(["Kenya", "Tanzania", "Uganda", "Rwanda"]),
  durationDays: z.number().int().min(1).max(30),
  durationNights: z.number().int().min(0).max(30),
  basePrice: z.number().min(0),
  childPrice: z.number().min(0).optional().nullable(),
  infantPrice: z.number().min(0).optional().nullable(),
  singleSupplement: z.number().min(0).optional().nullable(),
  maxGroupSize: z.number().int().min(1).max(50).default(12),
  difficulty: z.enum(getEnumValues(DifficultyLevel) as [string, ...string[]]).default(DifficultyLevel.MODERATE),
  tourType: z.array(z.string()).min(1, "Select at least one tour type"),
  highlights: z.array(z.string()).optional(),
  included: z.array(z.string()).optional(),
  excluded: z.array(z.string()).optional(),
  bestSeason: z.array(z.string()).optional(),
  coverImage: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  // Deposit settings
  depositEnabled: z.boolean().default(false),
  depositPercentage: z.number().min(10).max(90).default(30),
  freeCancellationDays: z.number().int().min(0).max(90).default(14),
})

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can access this resource" },
        { status: 403 }
      )
    }

    // Find agent profile
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      )
    }

    // Fetch agent's tours
    const tours = await prisma.tour.findMany({
      where: { agentId: agent.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    })

    // Transform for response
    const transformedTours = tours.map((tour) => ({
      id: tour.id,
      slug: tour.slug,
      title: tour.title,
      destination: tour.destination,
      country: tour.country,
      coverImage: tour.coverImage,
      basePrice: tour.basePrice,
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      status: tour.status,
      featured: tour.featured,
      viewCount: tour.viewCount,
      createdAt: tour.createdAt.toISOString(),
      _count: tour._count,
    }))

    return NextResponse.json({ tours: transformedTours })
  } catch (error) {
    console.error("Error fetching agent tours:", error)
    return NextResponse.json(
      { error: "Failed to fetch tours" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can create tours" },
        { status: 403 }
      )
    }

    // Find agent profile
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      )
    }

    // Check agent status
    if (agent.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Your agent account must be approved before creating tours" },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createTourSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Generate unique slug from title
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check for existing slug and append number if needed
    let slug = baseSlug
    let counter = 1
    while (await prisma.tour.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create tour in DRAFT status
    const tour = await prisma.tour.create({
      data: {
        agentId: agent.id,
        slug,
        title: data.title,
        subtitle: data.subtitle || null,
        description: data.description,
        destination: data.destination,
        country: data.country,
        durationDays: data.durationDays,
        durationNights: data.durationNights,
        basePrice: data.basePrice,
        childPrice: data.childPrice ?? null,
        infantPrice: data.infantPrice ?? null,
        singleSupplement: data.singleSupplement ?? null,
        maxGroupSize: data.maxGroupSize,
        difficulty: data.difficulty,
        tourType: JSON.stringify(data.tourType),
        highlights: JSON.stringify(data.highlights || []),
        included: JSON.stringify(data.included || []),
        excluded: JSON.stringify(data.excluded || []),
        bestSeason: JSON.stringify(data.bestSeason || []),
        coverImage: data.coverImage || null,
        images: JSON.stringify(data.images || []),
        status: "DRAFT",
        // Deposit settings
        depositEnabled: data.depositEnabled,
        depositPercentage: data.depositPercentage,
        freeCancellationDays: data.freeCancellationDays,
      },
    })

    return NextResponse.json(
      {
        message: "Tour created successfully",
        tour: {
          id: tour.id,
          slug: tour.slug,
          title: tour.title,
          status: tour.status,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating tour:", error)
    return NextResponse.json(
      { error: "Failed to create tour" },
      { status: 500 }
    )
  }
}
