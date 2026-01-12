import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createLogger } from "@/lib/logger"
import { sendEmail } from "@/lib/email"

const log = createLogger("Agent Contact Detail API")

const updateContactMessageSchema = z.object({
  status: z.enum(["ACKNOWLEDGED", "IN_PROGRESS", "NEEDS_INFO", "RESOLVED"]),
  agentResponse: z.string().optional(), // Optional now since we're using chat interface
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get agent profile
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent profile not found" }, { status: 404 })
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

    // Ensure the message is assigned to this agent
    if (message.assignedAgentId !== agent.id) {
      return NextResponse.json(
        { error: "Not authorized to view this message" },
        { status: 403 }
      )
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

    if (!session || session.user.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get agent profile
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent profile not found" }, { status: 404 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateContactMessageSchema.parse(body)

    // Get the contact message
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!contactMessage) {
      return NextResponse.json(
        { error: "Contact message not found" },
        { status: 404 }
      )
    }

    // Ensure the message is assigned to this agent
    if (contactMessage.assignedAgentId !== agent.id) {
      return NextResponse.json(
        { error: "Not authorized to update this message" },
        { status: 403 }
      )
    }

    // Update contact message
    const updateData: any = {
      status: validatedData.status,
      agentUpdatedAt: new Date(),
    }

    // Only update agentResponse if provided
    if (validatedData.agentResponse) {
      updateData.agentResponse = validatedData.agentResponse
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: updateData,
    })

    // Send email notification to admin
    try {
      const platformSettings = await prisma.platformSettings.findUnique({
        where: { id: "default" },
      })

      if (platformSettings?.supportEmail) {
        await sendEmail({
          to: platformSettings.supportEmail,
          subject: `Agent Update: ${contactMessage.subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Agent Response to Customer Inquiry</h2>

              <p>Agent <strong>${agent.businessName}</strong> has updated the status of a customer inquiry:</p>

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Customer:</strong> ${contactMessage.name} (${contactMessage.email})</p>
                <p><strong>Subject:</strong> ${contactMessage.subject}</p>
                <p><strong>New Status:</strong> <span style="background-color: #dbeafe; padding: 4px 8px; border-radius: 4px;">${validatedData.status.replace("_", " ")}</span></p>
              </div>

              <div style="margin: 20px 0;">
                <h3>Original Message:</h3>
                <p style="white-space: pre-wrap; background-color: #f9fafb; padding: 15px; border-left: 4px solid #e5e7eb;">${contactMessage.message}</p>
              </div>

              ${
                contactMessage.adminNote
                  ? `
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Your Note to Agent:</strong></p>
                  <p style="white-space: pre-wrap;">${contactMessage.adminNote}</p>
                </div>
              `
                  : ""
              }

              ${
                validatedData.agentResponse
                  ? `
                <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Agent Response:</strong></p>
                  <p style="white-space: pre-wrap;">${validatedData.agentResponse}</p>
                </div>
              `
                  : ""
              }

              <div style="margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/contacts"
                   style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  View in Admin Dashboard
                </a>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                  This is an automated notification from SafariPlus Admin System.
                </p>
              </div>
            </div>
          `,
        })

        log.info("Admin notified of agent update", {
          contactMessageId: id,
          agentId: agent.id,
          status: validatedData.status,
        })
      }
    } catch (emailError) {
      log.error("Failed to send admin notification email", emailError)
      // Don't fail the request if email fails
    }

    log.info("Agent updated contact message", {
      id,
      agentId: agent.id,
      status: validatedData.status,
    })

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
