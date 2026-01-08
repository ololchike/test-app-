import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { renderToBuffer } from "@react-pdf/renderer"
import { ItineraryPDF } from "@/lib/pdf/itinerary-template"
import React from "react"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch booking with all related data
    const booking = await prisma.booking.findUnique({
      where: { id },
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
              },
            },
          },
        },
        activities: {
          include: {
            activityAddon: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
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

    // Prepare booking data for PDF
    const pdfData = {
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
        tour: {
          title: booking.tour.title,
          destination: booking.tour.destination,
          durationDays: booking.tour.durationDays,
          durationNights: booking.tour.durationNights,
        },
        agent: booking.agent,
        accommodations: booking.accommodations,
        activities: booking.activities,
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
    }

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
