"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import {
  CheckCircle,
  Calendar,
  Users,
  MapPin,
  Download,
  Mail,
  Phone,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface BookingData {
  id: string
  bookingReference: string
  totalAmount: number
  status: string
  paymentStatus: string
  startDate: string
  endDate: string
  adults: number
  children: number
  contactName: string
  contactEmail: string
  contactPhone: string
  specialRequests: string | null
  tour: {
    title: string
    slug: string
    coverImage: string
    destination: string
    durationDays: number
    durationNights: number
  }
  agent: {
    businessName: string
    businessEmail: string
    businessPhone: string
  }
  accommodations: Array<{
    dayNumber: number
    accommodationOption: {
      name: string
      tier: string
    }
  }>
  activities: Array<{
    activityAddon: {
      name: string
    }
  }>
}

export default function ConfirmationPage() {
  const params = useParams()
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadItinerary = async () => {
    if (!booking) return

    setIsDownloading(true)
    try {
      const response = await fetch(`/api/bookings/${booking.id}/itinerary`)
      if (!response.ok) throw new Error("Failed to download")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `SafariPlus-Itinerary-${booking.bookingReference}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading itinerary:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  useEffect(() => {
    async function fetchBooking() {
      try {
        const response = await fetch(`/api/bookings/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setBooking(data.booking)
        }
      } catch (error) {
        console.error("Error fetching booking:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchBooking()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Booking not found</p>
        <Button asChild>
          <Link href="/tours">Browse Tours</Link>
        </Button>
      </div>
    )
  }

  const isConfirmed = booking.status === "CONFIRMED" && booking.paymentStatus === "COMPLETED"

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
              isConfirmed ? "bg-green-100" : "bg-yellow-100"
            }`}>
              <CheckCircle className={`h-10 w-10 ${
                isConfirmed ? "text-green-600" : "text-yellow-600"
              }`} />
            </div>
            <h1 className="text-3xl font-bold">
              {isConfirmed ? "Booking Confirmed!" : "Booking Received"}
            </h1>
            <p className="text-muted-foreground">
              {isConfirmed
                ? "Your safari adventure has been booked successfully."
                : "Your booking is being processed."}
            </p>
          </div>

          {/* Booking Reference */}
          <Card>
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">Booking Reference</p>
                  <p className="text-2xl font-mono font-bold">{booking.bookingReference}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={isConfirmed ? "default" : "secondary"}>
                    {booking.status}
                  </Badge>
                  <Badge variant={booking.paymentStatus === "COMPLETED" ? "default" : "outline"}>
                    {booking.paymentStatus === "COMPLETED" ? "Paid" : "Pending Payment"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tour Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={booking.tour.coverImage}
                    alt={booking.tour.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{booking.tour.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {booking.tour.destination}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Travel Dates</p>
                    <p className="font-medium">
                      {format(new Date(booking.startDate), "MMM d")} -{" "}
                      {format(new Date(booking.endDate), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Travelers</p>
                    <p className="font-medium">
                      {booking.adults} adult{booking.adults > 1 ? "s" : ""}
                      {booking.children > 0 && `, ${booking.children} child${booking.children > 1 ? "ren" : ""}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Accommodations */}
              {booking.accommodations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Accommodations</p>
                    <div className="space-y-1">
                      {booking.accommodations.map((acc, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Night {acc.dayNumber}
                          </span>
                          <span>
                            {acc.accommodationOption.name}
                            <span className="text-muted-foreground ml-2">
                              ({acc.accommodationOption.tier})
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Activities */}
              {booking.activities.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Add-ons</p>
                    <div className="flex flex-wrap gap-2">
                      {booking.activities.map((activity, idx) => (
                        <Badge key={idx} variant="outline">
                          {activity.activityAddon.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total Paid</span>
                <span>${booking.totalAmount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{booking.contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{booking.contactPhone}</p>
                  </div>
                </div>
              </div>

              {booking.specialRequests && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-1">Special Requests</p>
                    <p className="text-sm text-muted-foreground">{booking.specialRequests}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tour Operator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tour Operator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-muted">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">{booking.agent.businessName}</p>
                  {booking.agent.businessEmail && (
                    <p className="text-sm text-muted-foreground">{booking.agent.businessEmail}</p>
                  )}
                  {booking.agent.businessPhone && (
                    <p className="text-sm text-muted-foreground">{booking.agent.businessPhone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              className="flex-1"
              variant="outline"
              onClick={handleDownloadItinerary}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? "Generating PDF..." : "Download Itinerary"}
            </Button>
            <Button className="flex-1" asChild>
              <Link href="/dashboard/bookings">View My Bookings</Link>
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground">
            A confirmation email has been sent to {booking.contactEmail}.
            If you have any questions, please contact us at support@safariplus.com
          </p>
        </div>
      </div>
    </div>
  )
}
