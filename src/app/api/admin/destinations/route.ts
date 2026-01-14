import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createDestinationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  country: z.string().min(1, "Country is required"),
  region: z.string().optional(),
  heroImage: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  overview: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  wildlife: z.string().optional(),
  bestTimeToVisit: z.string().optional(),
  attractions: z.string().optional(),
  activities: z.string().optional(),
  accommodation: z.string().optional(),
  travelTips: z.string().optional(),
  gettingThere: z.string().optional(),
  bestMonths: z.array(z.string()).optional(),
  avgTemperature: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  visaInfo: z.string().optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

// GET /api/admin/destinations - List all destinations (admin)
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // "published", "draft", "all"
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}

    if (status === "published") {
      where.isPublished = true
    } else if (status === "draft") {
      where.isPublished = false
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
      ]
    }

    const destinations = await prisma.destinationGuide.findMany({
      where,
      include: {
        _count: {
          select: { faqs: true },
        },
      },
      orderBy: [
        { country: "asc" },
        { name: "asc" },
      ],
    })

    return NextResponse.json({ destinations })
  } catch (error) {
    console.error("Error fetching destinations:", error)
    return NextResponse.json(
      { error: "Failed to fetch destinations" },
      { status: 500 }
    )
  }
}

// POST /api/admin/destinations - Create a destination guide
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createDestinationSchema.parse(body)

    // Check for duplicate slug
    const existing = await prisma.destinationGuide.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: "A destination with this slug already exists" },
        { status: 400 }
      )
    }

    const destination = await prisma.destinationGuide.create({
      data: {
        ...validatedData,
        publishedAt: validatedData.isPublished ? new Date() : null,
      },
    })

    return NextResponse.json({ destination }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating destination:", error)
    return NextResponse.json(
      { error: "Failed to create destination" },
      { status: 500 }
    )
  }
}
