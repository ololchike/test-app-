"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { motion } from "framer-motion"
import {
  CheckCircle,
  Calendar,
  Users,
  MapPin,
  Download,
  Mail,
  Phone,
  Building2,
  Sparkles,
  Clock,
  Star,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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
    if (!booking) {
      toast.error("Booking data not loaded yet")
      return
    }

    setIsDownloading(true)
    toast.info("Generating PDF...")

    try {
      const response = await fetch(`/api/bookings/${booking.id}/itinerary`)
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to download")
      }

      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `SafariPlus-Itinerary-${booking.bookingReference}.pdf`)
      link.style.display = "none"
      document.body.appendChild(link)

      // Trigger download
      link.click()

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)

      toast.success("Itinerary downloaded!")
    } catch (error: any) {
      console.error("Error downloading itinerary:", error)
      toast.error(error.message || "Failed to download itinerary")
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        {/* Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 relative z-10"
        >
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          </div>
          <p className="text-muted-foreground">Loading booking details...</p>
        </motion.div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-background via-background to-muted/30">
        {/* Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-destructive/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-muted/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 relative z-10"
        >
          <div className="mx-auto w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Calendar className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-lg text-muted-foreground">Booking not found</p>
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/tours">Browse Tours</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  const isConfirmed = booking.status === "CONFIRMED" && booking.paymentStatus === "COMPLETED"

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8 relative">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className={cn(
                "inline-flex items-center justify-center w-24 h-24 rounded-2xl",
                isConfirmed
                  ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
                  : "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
              )}
            >
              <CheckCircle className={cn(
                "h-12 w-12",
                isConfirmed ? "text-emerald-600" : "text-amber-600"
              )} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold">
                {isConfirmed ? "Booking Confirmed!" : "Booking Received"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isConfirmed
                  ? "Your safari adventure has been booked successfully."
                  : "Your booking is being processed."}
              </p>
            </motion.div>
          </motion.div>

          {/* Booking Reference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/50 shadow-premium overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              <CardContent className="py-6 relative z-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-muted-foreground">Booking Reference</p>
                    <p className="text-2xl font-mono font-bold mt-1">{booking.bookingReference}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={isConfirmed ? "default" : "secondary"}
                      className={cn(
                        "rounded-full px-3 py-1",
                        isConfirmed && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      )}
                    >
                      {booking.status}
                    </Badge>
                    <Badge
                      variant={booking.paymentStatus === "COMPLETED" ? "default" : "outline"}
                      className={cn(
                        "rounded-full px-3 py-1",
                        booking.paymentStatus === "COMPLETED" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      )}
                    >
                      {booking.paymentStatus === "COMPLETED" ? "Paid" : "Pending Payment"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tour Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50 shadow-premium hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-border/50">
                    <Image
                      src={booking.tour.coverImage}
                      alt={booking.tour.title}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{booking.tour.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {booking.tour.destination}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {booking.tour.durationDays} days, {booking.tour.durationNights} nights
                    </p>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Travel Dates</p>
                      <p className="font-medium">
                        {format(new Date(booking.startDate), "MMM d")} -{" "}
                        {format(new Date(booking.endDate), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Travelers</p>
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
                    <Separator className="bg-border/50" />
                    <div>
                      <p className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Accommodations
                      </p>
                      <div className="space-y-2">
                        {booking.accommodations.map((acc, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm p-2 rounded-lg bg-muted/30"
                          >
                            <span className="text-muted-foreground">
                              Night {acc.dayNumber}
                            </span>
                            <span>
                              {acc.accommodationOption.name}
                              <Badge variant="outline" className="ml-2 text-xs">
                                {acc.accommodationOption.tier}
                              </Badge>
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
                    <Separator className="bg-border/50" />
                    <div>
                      <p className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        Add-ons
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {booking.activities.map((activity, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="rounded-full px-3 py-1 bg-primary/5"
                          >
                            {activity.activityAddon.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator className="bg-border/50" />

                <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                  <span className="text-lg font-semibold">Total Paid</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ${booking.totalAmount.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50 shadow-premium hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="truncate">{booking.contactEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p>{booking.contactPhone}</p>
                    </div>
                  </div>
                </div>

                {booking.specialRequests && (
                  <>
                    <Separator className="bg-border/50" />
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-600" />
                        Special Requests
                      </p>
                      <p className="text-sm text-muted-foreground">{booking.specialRequests}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tour Operator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/50 shadow-premium hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  Tour Operator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{booking.agent.businessName}</p>
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
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 relative z-20"
          >
            <Button
              className="flex-1 h-12 rounded-xl border-border/50 hover:bg-muted/50"
              variant="outline"
              onClick={handleDownloadItinerary}
              disabled={isDownloading || !booking}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Itinerary
                </>
              )}
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
              asChild
            >
              <Link href="/dashboard/bookings">View My Bookings</Link>
            </Button>
          </motion.div>

          {/* Help Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-muted-foreground py-4"
          >
            A confirmation email has been sent to {booking.contactEmail}.
            If you have any questions, please contact us at{" "}
            <a href="mailto:support@safariplus.com" className="text-primary hover:underline">
              support@safariplus.com
            </a>
          </motion.p>
        </div>
      </div>
    </div>
  )
}
