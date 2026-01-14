"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  Calendar,
  MapPin,
  Users,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Star,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Booking {
  id: string
  bookingReference: string
  status: string
  paymentStatus: string
  startDate: string
  endDate: string
  adults: number
  children: number
  totalAmount: number
  createdAt: string
  hasReview: boolean
  tour: {
    title: string
    slug: string
    coverImage: string | null
    destination: string
    durationDays: number
    durationNights: number
  }
  agent: {
    id: string
    businessName: string
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)
  const [cancellationReason, setCancellationReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)
  const [refundInfo, setRefundInfo] = useState<{
    percentage: number
    amount: number
    message: string
  } | null>(null)

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch("/api/client/bookings")
        if (response.ok) {
          const data = await response.json()
          setBookings(data.bookings || [])
        }
      } catch (error) {
        console.error("Error fetching bookings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const handleDownloadItinerary = async (bookingId: string, reference: string) => {
    setDownloadingId(bookingId)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/itinerary`)
      if (!response.ok) throw new Error("Failed to download")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `SafariPlus-Itinerary-${reference}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading itinerary:", error)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleRefreshStatus = async (bookingId: string) => {
    setRefreshingId(bookingId)
    try {
      const response = await fetch(
        `/api/payments/status?bookingId=${bookingId}&refreshFromPesapal=true`
      )
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to refresh status")
        return
      }

      if (data.updated) {
        toast.success("Payment status updated!")
        // Update the booking in the list
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: data.booking.status,
                  paymentStatus: data.booking.paymentStatus,
                }
              : b
          )
        )
      } else {
        toast.info(data.message || "Status is up to date")
      }
    } catch (error) {
      console.error("Error refreshing status:", error)
      toast.error("Failed to refresh payment status")
    } finally {
      setRefreshingId(null)
    }
  }

  const handleOpenCancelDialog = (booking: Booking) => {
    setBookingToCancel(booking)
    setCancellationReason("")
    setRefundInfo(null)
    setCancelDialogOpen(true)

    // Calculate refund info based on booking dates
    const now = new Date()
    const startDate = new Date(booking.startDate)
    const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const freeCancellationDays = 14 // Default, should come from tour

    let refundPercentage = 0
    let refundAmount = 0

    if (daysUntilStart >= freeCancellationDays) {
      refundPercentage = 100
      refundAmount = booking.totalAmount
    } else if (daysUntilStart >= 7) {
      refundPercentage = 50
      refundAmount = Math.round(booking.totalAmount * 0.5)
    } else if (daysUntilStart >= 3) {
      refundPercentage = 25
      refundAmount = Math.round(booking.totalAmount * 0.25)
    }

    setRefundInfo({
      percentage: refundPercentage,
      amount: refundAmount,
      message: refundPercentage === 100
        ? "Full refund will be processed"
        : refundPercentage > 0
          ? `${refundPercentage}% refund ($${refundAmount.toLocaleString()}) will be processed`
          : "No refund applicable based on cancellation policy",
    })
  }

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return

    setIsCancelling(true)

    try {
      const response = await fetch(`/api/bookings/${bookingToCancel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: cancellationReason || "Cancelled by user",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to cancel booking")
        return
      }

      toast.success("Booking cancelled successfully", {
        description: data.refund.message,
      })

      // Update the booking in the list
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingToCancel.id
            ? { ...b, status: "CANCELLED" }
            : b
        )
      )

      setCancelDialogOpen(false)
      setBookingToCancel(null)
      setCancellationReason("")
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel booking")
    } finally {
      setIsCancelling(false)
    }
  }

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus !== "COMPLETED") {
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
          <AlertCircle className="h-3 w-3 mr-1" />
          Payment Pending
        </Badge>
      )
    }

    switch (status) {
      case "CONFIRMED":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
    }
  }

  const now = new Date()
  const upcomingBookings = bookings.filter(
    (b) => new Date(b.startDate) >= now && b.status !== "CANCELLED"
  )
  const pastBookings = bookings.filter(
    (b) => new Date(b.endDate) < now || b.status === "COMPLETED"
  )
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED")

  const filteredBookings =
    activeTab === "upcoming"
      ? upcomingBookings
      : activeTab === "past"
      ? pastBookings
      : activeTab === "cancelled"
      ? cancelledBookings
      : bookings

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          View and manage your safari adventures
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Upcoming Trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{upcomingBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Completed Trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{pastBookings.length}</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              ${bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Booking History</CardTitle>
          <CardDescription className="text-sm">All your safari bookings in one place</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="all" className="text-xs sm:text-sm">All ({bookings.length})</TabsTrigger>
              <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming ({upcomingBookings.length})</TabsTrigger>
              <TabsTrigger value="past" className="text-xs sm:text-sm">Past ({pastBookings.length})</TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs sm:text-sm">Cancelled ({cancelledBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No bookings found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "upcoming"
                      ? "You don't have any upcoming trips. Start planning your next adventure!"
                      : activeTab === "past"
                      ? "You haven't completed any trips yet."
                      : activeTab === "cancelled"
                      ? "You don't have any cancelled bookings."
                      : "You haven't made any bookings yet."}
                  </p>
                  <Button asChild>
                    <Link href="/tours">Browse Tours</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs sm:text-sm">Booking</TableHead>
                            <TableHead className="text-xs sm:text-sm">Tour</TableHead>
                            <TableHead className="text-xs sm:text-sm">Dates</TableHead>
                            <TableHead className="text-xs sm:text-sm">Travelers</TableHead>
                            <TableHead className="text-xs sm:text-sm">Status</TableHead>
                            <TableHead className="text-right text-xs sm:text-sm">Amount</TableHead>
                            <TableHead className="text-xs sm:text-sm"></TableHead>
                          </TableRow>
                        </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="whitespace-nowrap">
                            <div>
                              <div className="font-mono font-medium text-xs sm:text-sm">
                                {booking.bookingReference}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(booking.createdAt), "MMM d, yyyy")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-[150px] max-w-[200px]">
                              <div className="font-medium line-clamp-1 text-xs sm:text-sm">
                                {booking.tour.title}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {booking.tour.destination}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-xs sm:text-sm">
                              {format(new Date(booking.startDate), "MMM d")} -{" "}
                              {format(new Date(booking.endDate), "MMM d, yyyy")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {booking.tour.durationDays}d / {booking.tour.durationNights}n
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-1 text-xs sm:text-sm">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                              {booking.adults + booking.children}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status, booking.paymentStatus)}
                          </TableCell>
                          <TableCell className="text-right font-medium whitespace-nowrap text-xs sm:text-sm">
                            ${booking.totalAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/booking/confirmation/${booking.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              {booking.status === "CONFIRMED" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDownloadItinerary(
                                      booking.id,
                                      booking.bookingReference
                                    )
                                  }
                                  disabled={downloadingId === booking.id}
                                >
                                  {downloadingId === booking.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              {booking.paymentStatus !== "COMPLETED" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRefreshStatus(booking.id)}
                                  disabled={refreshingId === booking.id}
                                  title="Refresh payment status"
                                >
                                  {refreshingId === booking.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              {/* Write Review - show for completed paid bookings that don't have a review yet */}
                              {booking.paymentStatus === "COMPLETED" &&
                                new Date(booking.endDate) < now &&
                                !booking.hasReview && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    title="Write a review"
                                  >
                                    <Link href={`/tours/${booking.tour.slug}#reviews`}>
                                      <Star className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                )}
                              {/* Contact Agent */}
                              {booking.paymentStatus === "COMPLETED" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  title={`Contact ${booking.agent.businessName}`}
                                >
                                  <Link href={`/dashboard/messages?agentId=${booking.agent.id}&bookingRef=${booking.bookingReference}`}>
                                    <MessageSquare className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                              {/* Cancel Booking - Only show for confirmed/pending bookings that haven't started yet */}
                              {(booking.status === "CONFIRMED" || booking.status === "PENDING") &&
                                new Date(booking.startDate) > now && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenCancelDialog(booking)}
                                    title="Cancel booking"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Cancel Booking
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking?
            </DialogDescription>
          </DialogHeader>

          {bookingToCancel && (
            <div className="space-y-4">
              {/* Booking Details */}
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking Reference</span>
                  <span className="font-mono font-medium">{bookingToCancel.bookingReference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tour</span>
                  <span className="font-medium">{bookingToCancel.tour.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium">
                    {format(new Date(bookingToCancel.startDate), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium">${bookingToCancel.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Refund Policy */}
              {refundInfo && (
                <div className={`p-4 rounded-lg border ${
                  refundInfo.percentage === 100
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                    : refundInfo.percentage > 0
                      ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                      : "bg-destructive/10 border-destructive/20"
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${
                      refundInfo.percentage === 100
                        ? "text-green-600"
                        : refundInfo.percentage > 0
                          ? "text-amber-600"
                          : "text-destructive"
                    }`} />
                    <div>
                      <p className={`font-semibold ${
                        refundInfo.percentage === 100
                          ? "text-green-800 dark:text-green-200"
                          : refundInfo.percentage > 0
                            ? "text-amber-800 dark:text-amber-200"
                            : "text-destructive"
                      }`}>
                        Refund Policy
                      </p>
                      <p className={`text-sm mt-1 ${
                        refundInfo.percentage === 100
                          ? "text-green-700 dark:text-green-300"
                          : refundInfo.percentage > 0
                            ? "text-amber-700 dark:text-amber-300"
                            : "text-destructive/80"
                      }`}>
                        {refundInfo.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancellation Reason */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Reason for Cancellation (Optional)
                </label>
                <Textarea
                  placeholder="Please let us know why you're cancelling..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isCancelling}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
