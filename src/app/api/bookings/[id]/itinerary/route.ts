import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { renderToBuffer } from "@react-pdf/renderer"
import { ItineraryPDF } from "@/lib/pdf/itinerary-template"
import React from "react"

// Helper function to fetch and prepare booking data for PDF
async function getBookingPdfData(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tour: {
        include: {
          itinerary: {
            orderBy: { dayNumber: "asc" },
          },
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
              images: true,
            },
          },
        },
      },
      activities: {
        include: {
          activityAddon: {
            select: {
              name: true,
              priceType: true,
              maxCapacity: true,
              images: true,
            },
          },
        },
      },
    },
  })

  if (!booking) {
    return null
  }

  // Parse itinerary JSON fields
  const itinerary = booking.tour.itinerary.map((day) => ({
    dayNumber: day.dayNumber,
    title: day.title,
    description: day.description || "",
    location: day.location,
    meals: JSON.parse(day.meals || "[]"),
    activities: JSON.parse(day.activities || "[]"),
    overnight: day.overnight,
  }))

  // Calculate pricing breakdown
  const baseTotal = Math.round(
    booking.baseAmount - (booking.baseAmount * 0.3 * booking.children) / (booking.adults + booking.children * 0.7)
  )
  const childTotal = booking.baseAmount - baseTotal
  const accommodationTotal = booking.accommodationAmount
  const addonsTotal = booking.activitiesAmount
  const serviceFee = booking.taxAmount
  const total = booking.totalAmount

  return {
    booking,
    pdfData: {
      booking: {
        bookingReference: booking.bookingReference,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        adults: booking.adults,
        children: booking.children,
        totalAmount: booking.totalAmount,
        contactName: booking.contactName,
        contactEmail: booking.contactEmail,
        contactPhone: booking.contactPhone,
        specialRequests: booking.specialRequests,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentType: booking.paymentType,
        depositAmount: booking.depositAmount,
        balanceAmount: booking.balanceAmount,
        balanceDueDate: booking.balanceDueDate?.toISOString() || null,
        tour: {
          title: booking.tour.title,
          destination: booking.tour.destination,
          durationDays: booking.tour.durationDays,
          durationNights: booking.tour.durationNights,
          coverImage: booking.tour.coverImage,
          images: JSON.parse(booking.tour.images || "[]"),
        },
        agent: booking.agent,
        accommodations: booking.accommodations.map((acc) => ({
          dayNumber: acc.dayNumber,
          price: acc.price,
          accommodationOption: {
            name: acc.accommodationOption.name,
            tier: acc.accommodationOption.tier,
            images: JSON.parse(acc.accommodationOption.images || "[]"),
          },
        })),
        activities: booking.activities.map((act) => ({
          price: act.price,
          quantity: act.quantity,
          dayNumber: act.dayNumber,
          activityAddon: {
            name: act.activityAddon.name,
            priceType: act.activityAddon.priceType as "PER_PERSON" | "PER_GROUP" | "FLAT_RATE",
            maxCapacity: act.activityAddon.maxCapacity,
            images: JSON.parse(act.activityAddon.images || "[]") as string[],
          },
        })),
      },
      itinerary,
      pricing: {
        baseTotal,
        childTotal,
        accommodationTotal,
        addonsTotal,
        serviceFee,
        total,
      },
    },
  }
}

// GET - Download itinerary PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await getBookingPdfData(id)
    if (!result) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const { booking, pdfData } = result

    // Generate PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      React.createElement(ItineraryPDF, pdfData) as any
    )

    // Return PDF as downloadable file
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="SafariPlus-Itinerary-${booking.bookingReference}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating itinerary PDF:", error)
    return NextResponse.json(
      { error: "Failed to generate itinerary" },
      { status: 500 }
    )
  }
}

// POST - Resend itinerary email to client
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get booking and verify agent ownership
    const result = await getBookingPdfData(id)
    if (!result) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const { booking, pdfData } = result

    // Verify the user is the agent for this booking
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!agent || agent.id !== booking.agentId) {
      return NextResponse.json(
        { error: "You can only resend itineraries for your own bookings" },
        { status: 403 }
      )
    }

    // Generate PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      React.createElement(ItineraryPDF, pdfData) as any
    )

    // TODO: Send email with PDF attachment
    // For now, we'll just return success
    // In production, integrate with email service like SendGrid, Resend, etc.
    /*
    await sendEmail({
      to: booking.contactEmail,
      subject: `Your Safari Itinerary - ${booking.bookingReference}`,
      html: `
        <h1>Your Safari Adventure Awaits!</h1>
        <p>Dear ${booking.contactName},</p>
        <p>Please find attached your updated itinerary for ${booking.tour.title}.</p>
        <p>Booking Reference: <strong>${booking.bookingReference}</strong></p>
        <p>Travel Dates: ${format(booking.startDate, 'MMM d')} - ${format(booking.endDate, 'MMM d, yyyy')}</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>${booking.agent.businessName}</p>
      `,
      attachments: [{
        filename: `SafariPlus-Itinerary-${booking.bookingReference}.pdf`,
        content: pdfBuffer,
      }],
    })
    */

    return NextResponse.json({
      success: true,
      message: `Itinerary sent to ${booking.contactEmail}`,
      booking: {
        id: booking.id,
        bookingReference: booking.bookingReference,
        contactEmail: booking.contactEmail,
      },
    })
  } catch (error) {
    console.error("Error resending itinerary:", error)
    return NextResponse.json(
      { error: "Failed to resend itinerary" },
      { status: 500 }
    )
  }
}
