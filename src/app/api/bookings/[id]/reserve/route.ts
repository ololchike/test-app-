import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { format, addDays } from "date-fns"

/**
 * POST /api/bookings/[id]/reserve
 * Reserve a booking without immediate payment
 * Sends confirmation email with payment link and sets payment reminder
 */
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

    // Fetch booking with tour details
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        tour: {
          select: {
            title: true,
            slug: true,
            coverImage: true,
            destination: true,
            durationDays: true,
            durationNights: true,
            freeCancellationDays: true,
          },
        },
        agent: {
          select: {
            businessName: true,
            businessEmail: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Verify ownership
    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if already paid
    if (booking.paymentStatus === "COMPLETED") {
      return NextResponse.json(
        { error: "Booking is already paid" },
        { status: 400 }
      )
    }

    // Check if cancelled
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot reserve a cancelled booking" },
        { status: 400 }
      )
    }

    // Calculate payment due date (7 days from now or 3 days before trip, whichever is earlier)
    const sevenDaysFromNow = addDays(new Date(), 7)
    const threeDaysBeforeTrip = addDays(new Date(booking.startDate), -3)
    const paymentDueDate = sevenDaysFromNow < threeDaysBeforeTrip
      ? sevenDaysFromNow
      : threeDaysBeforeTrip

    // Update booking with reservation status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "PENDING", // Keep as pending until paid
        // Store payment due date in a note or we can add a field
        specialRequests: booking.specialRequests
          ? `${booking.specialRequests}\n\n[Reserved on ${format(new Date(), "MMM d, yyyy")} - Payment due by ${format(paymentDueDate, "MMM d, yyyy")}]`
          : `[Reserved on ${format(new Date(), "MMM d, yyyy")} - Payment due by ${format(paymentDueDate, "MMM d, yyyy")}]`,
      },
    })

    // Send confirmation email with payment link
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/booking/payment/${booking.id}`
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/booking/confirmation/${booking.id}`

    try {
      await sendEmail({
        to: booking.contactEmail,
        subject: `Booking Reserved - ${booking.tour.title} | Payment Required`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f97316; margin: 0;">SafariPlus</h1>
              <p style="color: #6b7280; margin: 5px 0;">Your Safari Adventure Awaits</p>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h2 style="color: #92400e; margin: 0 0 10px;">Your Spot is Reserved!</h2>
              <p style="color: #78350f; margin: 0;">Complete your payment to confirm your booking.</p>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px; color: #111827;">Booking Details</h3>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Reference</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold; font-family: monospace;">${booking.bookingReference}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Tour</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 500;">${booking.tour.title}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Destination</td>
                  <td style="padding: 8px 0; text-align: right;">${booking.tour.destination}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Duration</td>
                  <td style="padding: 8px 0; text-align: right;">${booking.tour.durationDays} days / ${booking.tour.durationNights} nights</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Travel Dates</td>
                  <td style="padding: 8px 0; text-align: right;">${format(new Date(booking.startDate), "MMM d")} - ${format(new Date(booking.endDate), "MMM d, yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Guests</td>
                  <td style="padding: 8px 0; text-align: right;">${booking.adults} Adult${booking.adults > 1 ? 's' : ''}${booking.children > 0 ? `, ${booking.children} Child${booking.children > 1 ? 'ren' : ''}` : ''}${booking.infants > 0 ? `, ${booking.infants} Infant${booking.infants > 1 ? 's' : ''}` : ''}</td>
                </tr>
              </table>

              <div style="border-top: 2px solid #e5e7eb; margin-top: 15px; padding-top: 15px;">
                <table style="width: 100%;">
                  <tr>
                    <td style="color: #111827; font-weight: bold; font-size: 18px;">Total Amount</td>
                    <td style="text-align: right; color: #f97316; font-weight: bold; font-size: 20px;">${booking.currency} ${booking.totalAmount.toLocaleString()}</td>
                  </tr>
                </table>
              </div>
            </div>

            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #991b1b; font-weight: 500;">
                <strong>Payment Due By:</strong> ${format(paymentDueDate, "EEEE, MMMM d, yyyy")}
              </p>
              <p style="margin: 10px 0 0; color: #7f1d1d; font-size: 14px;">
                Your reservation will be automatically cancelled if payment is not received by this date.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentUrl}" style="display: inline-block; background: #f97316; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Complete Payment Now
              </a>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${confirmationUrl}" style="color: #6b7280; font-size: 14px;">View Booking Details</a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              <p>Questions? Contact ${booking.agent.businessName} at ${booking.agent.businessEmail || 'support@safariplus.com'}</p>
              <p style="margin-top: 10px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #f97316;">SafariPlus</a> - Your Gateway to African Adventures
              </p>
            </div>
          </div>
        `,
      })
    } catch (emailError) {
      console.error("Failed to send reservation email:", emailError)
      // Don't fail the request if email fails
    }

    // Also notify the agent
    try {
      if (booking.agent.businessEmail) {
        await sendEmail({
          to: booking.agent.businessEmail,
          subject: `New Reservation - ${booking.bookingReference} | Payment Pending`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>New Booking Reservation</h2>
              <p>A customer has reserved a spot on your tour but has not yet paid.</p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
                <p><strong>Customer:</strong> ${booking.contactName}</p>
                <p><strong>Email:</strong> ${booking.contactEmail}</p>
                <p><strong>Tour:</strong> ${booking.tour.title}</p>
                <p><strong>Dates:</strong> ${format(new Date(booking.startDate), "MMM d")} - ${format(new Date(booking.endDate), "MMM d, yyyy")}</p>
                <p><strong>Guests:</strong> ${booking.adults + booking.children}</p>
                <p><strong>Amount:</strong> ${booking.currency} ${booking.totalAmount.toLocaleString()}</p>
                <p><strong>Payment Due:</strong> ${format(paymentDueDate, "MMM d, yyyy")}</p>
              </div>

              <p style="color: #6b7280;">The customer will receive payment reminders. The booking will be confirmed once payment is received.</p>
            </div>
          `,
        })
      }
    } catch (agentEmailError) {
      console.error("Failed to send agent notification:", agentEmailError)
    }

    return NextResponse.json({
      success: true,
      message: "Booking reserved successfully. Payment reminder email sent.",
      booking: {
        id: updatedBooking.id,
        bookingReference: updatedBooking.bookingReference,
        status: updatedBooking.status,
        paymentDueDate: paymentDueDate.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error reserving booking:", error)
    return NextResponse.json(
      { error: "Failed to reserve booking" },
      { status: 500 }
    )
  }
}
