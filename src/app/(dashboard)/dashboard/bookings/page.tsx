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
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your safari adventures
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
          <CardDescription>All your safari bookings in one place</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
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
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking</TableHead>
                        <TableHead>Tour</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Travelers</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <div className="font-mono font-medium">
                                {booking.bookingReference}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(booking.createdAt), "MMM d, yyyy")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px]">
                              <div className="font-medium line-clamp-1">
                                {booking.tour.title}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {booking.tour.destination}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(booking.startDate), "MMM d")} -{" "}
                              {format(new Date(booking.endDate), "MMM d, yyyy")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {booking.tour.durationDays} days / {booking.tour.durationNights} nights
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {booking.adults + booking.children}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status, booking.paymentStatus)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${booking.totalAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
