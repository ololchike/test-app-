import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
      },
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Error fetching client bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}
