import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        tour: {
          select: {
            title: true,
            slug: true,
            coverImage: true,
            destination: true,
            durationDays: true,
            durationNights: true,
          },
        },
        agent: {
          select: {
            businessName: true,
            businessEmail: true,
            businessPhone: true,
          },
        },
        accommodations: {
          include: {
            accommodationOption: {
              select: {
                name: true,
                tier: true,
              },
            },
          },
        },
        activities: {
          include: {
            activityAddon: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    )
  }
}
