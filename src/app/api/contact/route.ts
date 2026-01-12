import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { createLogger } from "@/lib/logger"
import { sendEmail } from "@/lib/email"

const log = createLogger("Contact API")

const contactMessageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = contactMessageSchema.parse(body)

    // Create contact message
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        subject: validatedData.subject,
        message: validatedData.message,
        status: "NEW",
      },
    })

    log.info("Contact message created", { id: contactMessage.id, email: validatedData.email })

    // Send email notification to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || "admin@safariplus.com",
        subject: `New Contact Message: ${validatedData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Contact Message Received</h2>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>From:</strong> ${validatedData.name}</p>
              <p><strong>Email:</strong> ${validatedData.email}</p>
              ${validatedData.phone ? `<p><strong>Phone:</strong> ${validatedData.phone}</p>` : ""}
              <p><strong>Subject:</strong> ${validatedData.subject}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3>Message:</h3>
              <p style="white-space: pre-wrap;">${validatedData.message}</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                View and respond to this message in the <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/contacts" style="color: #2563eb;">Admin Dashboard</a>
              </p>
            </div>
          </div>
        `,
      })

      log.info("Admin notification email sent", { contactMessageId: contactMessage.id })
    } catch (emailError) {
      log.error("Failed to send admin notification email", emailError)
      // Don't fail the request if email fails
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        to: validatedData.email,
        subject: "We received your message - SafariPlus",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Thank You for Contacting SafariPlus</h2>

            <p>Hi ${validatedData.name},</p>

            <p>We've received your message and our team will get back to you within 24 hours.</p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Your Message:</h3>
              <p><strong>Subject:</strong> ${validatedData.subject}</p>
              <p style="white-space: pre-wrap;">${validatedData.message}</p>
            </div>

            <p>In the meantime, feel free to:</p>
            <ul>
              <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/tours" style="color: #2563eb;">Browse our safari tours</a></li>
              <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/destinations" style="color: #2563eb;">Explore destinations</a></li>
              <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/faq" style="color: #2563eb;">Check our FAQ</a></li>
            </ul>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                Best regards,<br>
                The SafariPlus Team
              </p>
            </div>
          </div>
        `,
      })

      log.info("User confirmation email sent", { email: validatedData.email })
    } catch (emailError) {
      log.error("Failed to send user confirmation email", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been sent successfully. We'll get back to you soon!",
        id: contactMessage.id,
      },
      { status: 201 }
    )
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

    log.error("Error creating contact message", error)
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ])

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    log.error("Error fetching contact messages", error)
    return NextResponse.json(
      { error: "Failed to fetch contact messages" },
      { status: 500 }
    )
  }
}
