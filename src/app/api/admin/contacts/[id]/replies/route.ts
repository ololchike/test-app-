import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createLogger } from "@/lib/logger"
import { sendEmail } from "@/lib/email"

const log = createLogger("Admin Contact Replies API")

// GET /api/admin/contacts/[id]/replies - Get all replies for a contact message
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

    // Verify the contact message exists
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!contactMessage) {
      return NextResponse.json(
        { error: "Contact message not found" },
        { status: 404 }
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

// POST /api/admin/contacts/[id]/replies - Admin sends a new reply
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
    const { message } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Verify the contact message exists and get agent info
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id },
      include: {
        assignedAgent: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!contactMessage) {
      return NextResponse.json(
        { error: "Contact message not found" },
        { status: 404 }
      )
    }

    // Create the reply
    const reply = await prisma.contactMessageReply.create({
      data: {
        contactMessageId: id,
        senderId: session.user.id,
        senderRole: "ADMIN",
        message: message.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    // Send email notification to agent if assigned
    if (contactMessage.assignedAgent) {
      try {
        await sendEmail({
          to: contactMessage.assignedAgent.user.email,
          subject: `New message from admin regarding: ${contactMessage.subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">New Message from Admin</h2>
              <p>Hello ${contactMessage.assignedAgent.user.name || contactMessage.assignedAgent.businessName},</p>
              <p>The admin team has sent you a new message regarding the customer inquiry <strong>"${contactMessage.subject}"</strong>:</p>
              <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0; white-space: pre-wrap;">${message.trim()}</p>
              </div>
              <p>Please log in to your dashboard to view the full conversation and respond.</p>
              <div style="background-color: #eff6ff; padding: 12px; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 0; font-size: 14px;"><strong>Customer:</strong> ${contactMessage.name} (${contactMessage.email})</p>
              </div>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/agent/contacts"
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                View Message
              </a>
              <p style="color: #6b7280; font-size: 14px;">Best regards,<br>SafariPlus Admin Team</p>
            </div>
          `,
        })
        log.info(`Email notification sent to agent ${contactMessage.assignedAgent.user.email}`)
      } catch (emailError) {
        log.error("Failed to send email notification to agent", emailError)
        // Don't fail the request if email fails
      }
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
