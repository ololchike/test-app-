import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/destinations/[slug] - Get a destination guide by slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const destination = await prisma.destinationGuide.findUnique({
      where: { slug },
      include: {
        faqs: {
          where: { isPublished: true },
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

    if (!destination.isPublished) {
      return NextResponse.json(
        { error: "Destination not published" },
        { status: 404 }
      )
    }

    // Increment view count (async, don't wait)
    prisma.destinationGuide.update({
      where: { id: destination.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {})

    // Get related tours count
    const tourCount = await prisma.tour.count({
      where: {
        status: "ACTIVE",
        OR: [
          { country: { contains: destination.name, mode: "insensitive" } },
          { destination: { contains: destination.name, mode: "insensitive" } },
        ],
      },
    })

    return NextResponse.json({
      destination: {
        ...destination,
        tourCount,
      },
    })
  } catch (error) {
    console.error("Error fetching destination:", error)
    return NextResponse.json(
      { error: "Failed to fetch destination" },
      { status: 500 }
    )
  }
}
