import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/destinations - List published destination guides
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured") === "true"
    const country = searchParams.get("country")
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: Record<string, unknown> = {
      isPublished: true,
    }

    if (featured) {
      where.isFeatured = true
    }

    if (country) {
      where.country = country
    }

    const destinations = await prisma.destinationGuide.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        country: true,
        region: true,
        heroImage: true,
        heroTitle: true,
        heroSubtitle: true,
        highlights: true,
        bestMonths: true,
        isFeatured: true,
        viewCount: true,
        metaDescription: true,
      },
      orderBy: [
        { isFeatured: "desc" },
        { name: "asc" },
      ],
      take: limit,
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
