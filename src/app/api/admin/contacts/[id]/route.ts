import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const log = createLogger("Admin Contact Detail API")

const updateContactMessageSchema = z.object({
  status: z.enum(["NEW", "READ", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  adminNotes: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!message) {
      return NextResponse.json(
        { error: "Contact message not found" },
        { status: 404 }
      )
    }

    // Mark as read if it's new
    if (message.status === "NEW") {
      await prisma.contactMessage.update({
        where: { id },
        data: {
          status: "READ",
        },
      })
    }

    return NextResponse.json(message)
  } catch (error) {
    log.error("Error fetching contact message", error)
    return NextResponse.json(
      { error: "Failed to fetch contact message" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateContactMessageSchema.parse(body)

    const updateData: Record<string, unknown> = {}

    if (validatedData.status) {
      updateData.status = validatedData.status
    }

    if (validatedData.adminNotes !== undefined) {
      updateData.adminNotes = validatedData.adminNotes
    }

    if (validatedData.status === "RESOLVED" || validatedData.status === "CLOSED") {
      updateData.respondedBy = session.user.id
      updateData.respondedAt = new Date()
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: updateData,
    })

    log.info("Contact message updated", { id, status: validatedData.status })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      )
    }

    log.error("Error updating contact message", error)
    return NextResponse.json(
      { error: "Failed to update contact message" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.contactMessage.delete({
      where: { id },
    })

    log.info("Contact message deleted", { id })

    return NextResponse.json({ success: true })
  } catch (error) {
    log.error("Error deleting contact message", error)
    return NextResponse.json(
      { error: "Failed to delete contact message" },
      { status: 500 }
    )
  }
}
