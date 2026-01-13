"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
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
  Loader2,
  AlertCircle,
  CreditCard
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
  // Payment type fields
  paymentType: "FULL" | "DEPOSIT"
  depositAmount: number | null
  balanceAmount: number | null
  balanceDueDate: string | null
  balancePaidAt: string | null
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

function ConfirmationContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)
  const [paymentVerified, setPaymentVerified] = useState(false)

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

  // Verify payment with Pesapal callback parameters
  useEffect(() => {
    async function verifyPayment() {
      const orderTrackingId = searchParams.get("OrderTrackingId")
      const merchantReference = searchParams.get("OrderMerchantReference")

      if (!orderTrackingId && !merchantReference) {
        return false
      }

      setIsVerifyingPayment(true)

      try {
        const callbackUrl = new URL("/api/payments/callback", window.location.origin)
        if (orderTrackingId) callbackUrl.searchParams.set("OrderTrackingId", orderTrackingId)
        if (merchantReference) callbackUrl.searchParams.set("OrderMerchantReference", merchantReference)
        callbackUrl.searchParams.set("bookingId", params.id as string)

        const response = await fetch(callbackUrl.toString())
        const data = await response.json()

        if (data.success && data.paymentStatus === "COMPLETED") {
          setPaymentVerified(true)
          toast.success("Payment Verified!", {
            description: "Your payment has been confirmed successfully.",
          })
          return true
        } else if (data.paymentStatus === "FAILED") {
          toast.error("Payment Failed", {
            description: "Your payment could not be processed. Please try again.",
          })
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
      } finally {
        setIsVerifyingPayment(false)
      }

      return false
    }

    async function fetchBooking() {
      try {
        // First verify payment if we have callback params
        await verifyPayment()

        // Then fetch the updated booking data
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
  }, [params.id, searchParams])

  if (isLoading || isVerifyingPayment) {
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
          <div className="space-y-2">
            <p className="text-muted-foreground">
              {isVerifyingPayment ? "Verifying payment..." : "Loading booking details..."}
            </p>
            {isVerifyingPayment && (
              <p className="text-xs text-muted-foreground">
                Please wait while we confirm your payment status
              </p>
            )}
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-4 sm:py-8 relative">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3 sm:space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className={cn(
                "inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl",
                isConfirmed
                  ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
                  : "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
              )}
            >
              <CheckCircle className={cn(
                "h-10 w-10 sm:h-12 sm:w-12",
                isConfirmed ? "text-emerald-600" : "text-amber-600"
              )} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold">
                {isConfirmed ? "Booking Confirmed!" : "Booking Received"}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
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
              <CardContent className="py-4 sm:py-6 relative z-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-muted-foreground">Booking Reference</p>
                    <p className="text-xl sm:text-2xl font-mono font-bold mt-1">{booking.bookingReference}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
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
                        booking.paymentStatus === "COMPLETED" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                        booking.paymentStatus === "PARTIAL" && "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      )}
                    >
                      {booking.paymentStatus === "COMPLETED"
                        ? "Paid"
                        : booking.paymentStatus === "PARTIAL"
                          ? "Deposit Paid"
                          : "Pending Payment"}
                    </Badge>
                    {booking.paymentType === "DEPOSIT" && (
                      <Badge
                        variant="outline"
                        className="rounded-full px-3 py-1 bg-blue-500/10 text-blue-600 border-blue-500/20"
                      >
                        Deposit Payment
                      </Badge>
                    )}
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
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 border border-border/50">
                    <Image
                      src={booking.tour.coverImage}
                      alt={booking.tour.title}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-lg">{booking.tour.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="truncate">{booking.tour.destination}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      {booking.tour.durationDays} days, {booking.tour.durationNights} nights
                    </p>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-muted/50">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Travel Dates</p>
                      <p className="text-sm sm:text-base font-medium">
                        {format(new Date(booking.startDate), "MMM d")} -{" "}
                        {format(new Date(booking.endDate), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-muted/50">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Travelers</p>
                      <p className="text-sm sm:text-base font-medium">
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

                {/* Payment Summary */}
                <div className="space-y-3">
                  {/* Total Amount */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-medium">${booking.totalAmount.toLocaleString()}</span>
                  </div>

                  {/* Deposit/Balance breakdown for deposit payments */}
                  {booking.paymentType === "DEPOSIT" && booking.depositAmount && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Deposit Paid</span>
                        <span className="font-medium text-emerald-600">${booking.depositAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Balance Remaining</span>
                        <span className={cn(
                          "font-medium",
                          booking.balancePaidAt ? "text-emerald-600 line-through" : "text-amber-600"
                        )}>
                          ${booking.balanceAmount?.toLocaleString()}
                        </span>
                      </div>
                      {booking.balanceDueDate && !booking.balancePaidAt && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Balance Due By</span>
                          <span className="font-medium">{format(new Date(booking.balanceDueDate), "MMM d, yyyy")}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Amount Paid Summary */}
                  <div className={cn(
                    "flex justify-between items-center p-3 sm:p-4 rounded-xl border",
                    booking.paymentType === "DEPOSIT" && !booking.balancePaidAt
                      ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20"
                      : "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20"
                  )}>
                    <span className="text-base sm:text-lg font-semibold">
                      {booking.paymentType === "DEPOSIT" && !booking.balancePaidAt ? "Deposit Paid" : "Total Paid"}
                    </span>
                    <span className={cn(
                      "text-xl sm:text-2xl font-bold",
                      booking.paymentType === "DEPOSIT" && !booking.balancePaidAt ? "text-amber-600" : "text-emerald-600"
                    )}>
                      ${booking.paymentType === "DEPOSIT" && booking.depositAmount
                        ? booking.depositAmount.toLocaleString()
                        : booking.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Balance Due Notice */}
                  {booking.paymentType === "DEPOSIT" && booking.balanceAmount && !booking.balancePaidAt && (
                    <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">Balance Payment Required</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          Please pay the remaining ${booking.balanceAmount.toLocaleString()}
                          {booking.balanceDueDate
                            ? ` by ${format(new Date(booking.balanceDueDate), "MMMM d, yyyy")}`
                            : " before your trip"} to confirm your booking.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 border-amber-500/30 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                          asChild
                        >
                          <Link href={`/booking/payment/${booking.id}?balance=true`}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Balance
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
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
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-20"
          >
            <Button
              className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base rounded-xl border-border/50 hover:bg-muted/50"
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
              className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
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


export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
              <div className="h-8 w-8 border-t-2 border-primary rounded-full animate-spin" />
            </div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
