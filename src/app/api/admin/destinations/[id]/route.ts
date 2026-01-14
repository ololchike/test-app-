import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateDestinationSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  country: z.string().min(1).optional(),
  region: z.string().nullable().optional(),
  heroImage: z.string().nullable().optional(),
  heroTitle: z.string().nullable().optional(),
  heroSubtitle: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
  highlights: z.array(z.string()).optional(),
  wildlife: z.string().nullable().optional(),
  bestTimeToVisit: z.string().nullable().optional(),
  attractions: z.string().nullable().optional(),
  activities: z.string().nullable().optional(),
  accommodation: z.string().nullable().optional(),
  travelTips: z.string().nullable().optional(),
  gettingThere: z.string().nullable().optional(),
  bestMonths: z.array(z.string()).optional(),
  avgTemperature: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  visaInfo: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  metaKeywords: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

// GET /api/admin/destinations/[id] - Get a destination by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const destination = await prisma.destinationGuide.findUnique({
      where: { id },
      include: {
        faqs: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!destination) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ destination })
  } catch (error) {
    console.error("Error fetching destination:", error)
    return NextResponse.json(
      { error: "Failed to fetch destination" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/destinations/[id] - Update a destination
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateDestinationSchema.parse(body)

    // Check destination exists
    const existing = await prisma.destinationGuide.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      )
    }

    // Check slug uniqueness if changing
    if (validatedData.slug && validatedData.slug !== existing.slug) {
      const slugExists = await prisma.destinationGuide.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: "A destination with this slug already exists" },
          { status: 400 }
        )
      }
    }

    // Handle publishedAt
    const updateData: Record<string, unknown> = { ...validatedData }
    if (validatedData.isPublished === true && !existing.isPublished) {
      updateData.publishedAt = new Date()
    } else if (validatedData.isPublished === false) {
      updateData.publishedAt = null
    }

    const destination = await prisma.destinationGuide.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ destination })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating destination:", error)
    return NextResponse.json(
      { error: "Failed to update destination" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/destinations/[id] - Delete a destination
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.destinationGuide.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      )
    }

    await prisma.destinationGuide.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting destination:", error)
    return NextResponse.json(
      { error: "Failed to delete destination" },
      { status: 500 }
    )
  }
}
