import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Tour ID is required" },
        { status: 400 }
      )
    }

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            businessName: true,
            isVerified: true,
            commissionRate: true,
          },
        },
        accommodationOptions: {
          orderBy: { pricePerNight: "asc" },
        },
        activityAddons: true,
      },
    })

    if (!tour) {
      return NextResponse.json(
        { error: "Tour not found" },
        { status: 404 }
      )
    }

    if (tour.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Tour is not available" },
        { status: 404 }
      )
    }

    // Transform tour data
    const transformedTour = {
      id: tour.id,
      slug: tour.slug,
      title: tour.title,
      coverImage: tour.coverImage,
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      basePrice: tour.basePrice,
      agent: tour.agent,
      accommodationOptions: tour.accommodationOptions.map((acc) => ({
        id: acc.id,
        name: acc.name,
        tier: acc.tier,
        pricePerNight: acc.pricePerNight,
        images: JSON.parse(acc.images || "[]"),
        amenities: JSON.parse(acc.amenities || "[]"),
      })),
      activityAddons: tour.activityAddons.map((addon) => ({
        id: addon.id,
        name: addon.name,
        description: addon.description,
        price: addon.price,
        duration: addon.duration,
        images: JSON.parse(addon.images || "[]"),
      })),
    }

    return NextResponse.json({ tour: transformedTour })
  } catch (error) {
    console.error("Error fetching tour for checkout:", error)
    return NextResponse.json(
      { error: "Failed to fetch tour" },
      { status: 500 }
    )
  }
}
