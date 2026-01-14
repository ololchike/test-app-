import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const revalidate = 300 // Cache for 5 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")?.toLowerCase() || ""

  try {
    // Get popular destinations
    const destinations = await prisma.tour.groupBy({
      by: ["destination", "country"],
      where: {
        status: "ACTIVE",
        ...(query && {
          OR: [
            { destination: { contains: query, mode: "insensitive" } },
            { country: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    })

    // Get tour types that match
    const tourTypes = [
      { value: "SAFARI", label: "Safari Tours", icon: "Binoculars" },
      { value: "WILDLIFE", label: "Wildlife Tours", icon: "Cat" },
      { value: "GORILLA_TREKKING", label: "Gorilla Trekking", icon: "TreePine" },
      { value: "BEACH", label: "Beach Holidays", icon: "Palmtree" },
      { value: "MOUNTAIN", label: "Mountain Adventures", icon: "Mountain" },
      { value: "CULTURAL", label: "Cultural Tours", icon: "Landmark" },
      { value: "ADVENTURE", label: "Adventure Tours", icon: "Compass" },
      { value: "LUXURY", label: "Luxury Safaris", icon: "Crown" },
      { value: "FAMILY", label: "Family Safaris", icon: "Users" },
      { value: "HONEYMOON", label: "Honeymoon Safaris", icon: "Heart" },
      { value: "PHOTOGRAPHY", label: "Photography Tours", icon: "Camera" },
      { value: "BIRD_WATCHING", label: "Bird Watching", icon: "Bird" },
    ]

    const filteredTourTypes = query
      ? tourTypes.filter(
          t => t.label.toLowerCase().includes(query) || t.value.toLowerCase().includes(query)
        )
      : tourTypes.slice(0, 4)

    // Get matching tours (for tour title suggestions)
    const matchingTours = query
      ? await prisma.tour.findMany({
          where: {
            status: "ACTIVE",
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { destination: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            slug: true,
            title: true,
            destination: true,
            coverImage: true,
            basePrice: true,
          },
          take: 3,
          orderBy: { viewCount: "desc" },
        })
      : []

    return NextResponse.json({
      destinations: destinations.map(d => ({
        name: d.destination,
        country: d.country,
        tourCount: d._count.id,
      })),
      tourTypes: filteredTourTypes.slice(0, 4),
      tours: matchingTours,
    })
  } catch (error) {
    console.error("Error fetching search suggestions:", error)
    return NextResponse.json({
      destinations: [],
      tourTypes: [],
      tours: [],
    })
  }
}
