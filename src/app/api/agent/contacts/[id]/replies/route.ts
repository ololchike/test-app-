import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createLogger } from "@/lib/logger"
import { sendEmail } from "@/lib/email"
import { ContactReplyRole } from "@/lib/constants"

const log = createLogger("Agent Contact Replies API")

// GET /api/agent/contacts/[id]/replies - Get all replies for a contact message
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get the agent's agent record
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Verify the contact message is assigned to this agent
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id },
      select: {
        id: true,
        assignedAgentId: true,
      },
    })

    if (!contactMessage) {
      return NextResponse.json(
        { error: "Contact message not found" },
        { status: 404 }
      )
    }

    if (contactMessage.assignedAgentId !== agent.id) {
      return NextResponse.json(
        { error: "Not authorized to view this message" },
        { status: 403 }
      )
    }

    const replies = await prisma.contactMessageReply.findMany({
      where: { contactMessageId: id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            agent: {
              select: {
                businessName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ replies })
  } catch (error) {
    log.error("Error fetching contact message replies", error)
    return NextResponse.json(
      { error: "Failed to fetch replies" },
      { status: 500 }
    )
  }
}

// POST /api/agent/contacts/[id]/replies - Agent sends a new reply
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { message } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Get the agent's agent record
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true, businessName: true },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Verify the contact message is assigned to this agent
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id },
      select: {
        id: true,
        assignedAgentId: true,
        subject: true,
        name: true,
        email: true,
      },
    })

    if (!contactMessage) {
      return NextResponse.json(
        { error: "Contact message not found" },
        { status: 404 }
      )
    }

    if (contactMessage.assignedAgentId !== agent.id) {
      return NextResponse.json(
        { error: "Not authorized to reply to this message" },
        { status: 403 }
      )
    }

    // Create the reply
    const reply = await prisma.contactMessageReply.create({
      data: {
        contactMessageId: id,
        senderId: session.user.id,
        senderRole: ContactReplyRole.AGENT,
        message: message.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            agent: {
              select: {
                businessName: true,
              },
            },
          },
        },
      },
    })

    // Send email notification to admin
    try {
      // Get admin users
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { email: true, name: true },
      })

      const adminEmail = process.env.ADMIN_EMAIL || admins[0]?.email || process.env.SUPPORT_EMAIL

      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `Agent response to: ${contactMessage.subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">New Agent Response</h2>
              <p>Hello Admin,</p>
              <p><strong>${agent.businessName}</strong> has sent a new message regarding the customer inquiry <strong>"${contactMessage.subject}"</strong>:</p>
              <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0; white-space: pre-wrap;">${message.trim()}</p>
              </div>
              <p>Please log in to your dashboard to view the full conversation.</p>
              <div style="background-color: #eff6ff; padding: 12px; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 0; font-size: 14px;"><strong>Customer:</strong> ${contactMessage.name} (${contactMessage.email})</p>
                <p style="margin: 4px 0 0 0; font-size: 14px;"><strong>Agent:</strong> ${agent.businessName}</p>
              </div>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/contacts"
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                View Message
              </a>
              <p style="color: #6b7280; font-size: 14px;">Best regards,<br>SafariPlus System</p>
            </div>
          `,
        })
        log.info(`Email notification sent to admin ${adminEmail}`)
      }
    } catch (emailError) {
      log.error("Failed to send email notification to admin", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ reply }, { status: 201 })
  } catch (error) {
    log.error("Error creating contact message reply", error)
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    )
  }
}
