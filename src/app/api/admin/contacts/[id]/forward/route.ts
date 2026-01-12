import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createLogger } from "@/lib/logger"
import { sendEmail } from "@/lib/email"

const log = createLogger("Admin Contact Forward API")

const forwardMessageSchema = z.object({
  agentId: z.string().min(1, "Agent ID is required"),
  adminNote: z.string().optional(),
})

export async function POST(
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
    const { agentId, adminNote } = forwardMessageSchema.parse(body)

    // Get contact message
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!contactMessage) {
      return NextResponse.json(
        { error: "Contact message not found" },
        { status: 404 }
      )
    }

    // Get agent details
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Update contact message
    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: {
        assignedAgentId: agentId,
        assignedAt: new Date(),
        adminNote: adminNote,
        status: "IN_PROGRESS",
        // Keep legacy fields for backward compatibility
        forwardedTo: agentId,
        forwardedAt: new Date(),
      },
    })

    // Send email to agent
    try {
      await sendEmail({
        to: agent.user.email,
        subject: `Forwarded Inquiry: ${contactMessage.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Forwarded Customer Inquiry</h2>

            <p>Hi ${agent.user.name || agent.businessName},</p>

            <p>An admin has forwarded the following customer inquiry to you:</p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>From:</strong> ${contactMessage.name}</p>
              <p><strong>Email:</strong> ${contactMessage.email}</p>
              ${contactMessage.phone ? `<p><strong>Phone:</strong> ${contactMessage.phone}</p>` : ""}
              <p><strong>Subject:</strong> ${contactMessage.subject}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3>Message:</h3>
              <p style="white-space: pre-wrap;">${contactMessage.message}</p>
            </div>

            ${
              adminNote
                ? `
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Admin Note:</strong></p>
                <p style="white-space: pre-wrap;">${adminNote}</p>
              </div>
            `
                : ""
            }

            <div style="margin-top: 30px;">
              <p>You can manage this inquiry and provide updates from your agent dashboard:</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/agent/contacts"
                 style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px;">
                View in Agent Dashboard
              </a>
            </div>

            <div style="margin-top: 30px;">
              <p>Please reach out to the customer directly to assist them with their inquiry.</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                Best regards,<br>
                The SafariPlus Admin Team
              </p>
            </div>
          </div>
        `,
      })

      log.info("Inquiry forwarded to agent", {
        contactMessageId: id,
        agentId,
      })
    } catch (emailError) {
      log.error("Failed to send forward email to agent", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: updatedMessage,
    })
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

    log.error("Error forwarding contact message", error)
    return NextResponse.json(
      { error: "Failed to forward contact message" },
      { status: 500 }
    )
  }
}
