import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        isVerified: false,
        verifiedAt: null,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "agent_unverified",
        resource: "agent",
        resourceId: agent.id,
        metadata: {
          agentName: agent.businessName,
          agentEmail: agent.user.email,
        },
      },
    })

    return NextResponse.json({ agent })
  } catch (error) {
    console.error("Error unverifying agent:", error)
    return NextResponse.json(
      { error: "Failed to unverify agent" },
      { status: 500 }
    )
  }
}
