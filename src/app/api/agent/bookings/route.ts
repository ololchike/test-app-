import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get agent profile
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Get all bookings for the agent's tours
    const bookings = await prisma.booking.findMany({
      where: {
        agentId: agent.id,
      },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            destination: true,
            durationDays: true,
            durationNights: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Error fetching agent bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}
