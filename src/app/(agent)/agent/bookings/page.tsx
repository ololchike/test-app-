"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Calendar,
  MapPin,
  Users,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  DollarSign,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  contactName: string
  contactEmail: string
  contactPhone: string
  tour: {
    id: string
    title: string
    slug: string
    coverImage: string | null
    destination: string
    durationDays: number
    durationNights: number
  }
}

export default function AgentBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch("/api/agent/bookings")
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
      if (!response.ok) {
        throw new Error("Failed to download itinerary")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `SafariPlus-Itinerary-${reference}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Itinerary downloaded successfully", {
        description: `Downloaded itinerary for booking ${reference}`,
      })
    } catch (error) {
      console.error("Error downloading itinerary:", error)
      toast.error("Failed to download itinerary", {
        description: "Please try again or contact support if the issue persists.",
      })
    } finally {
      setDownloadingId(null)
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

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      searchQuery === "" ||
      booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.tour.title.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "confirmed" && booking.status === "CONFIRMED") ||
      (statusFilter === "pending" && booking.paymentStatus !== "COMPLETED") ||
      (statusFilter === "cancelled" && booking.status === "CANCELLED") ||
      (statusFilter === "completed" && booking.status === "COMPLETED")

    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const now = new Date()
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED")
  const upcomingBookings = confirmedBookings.filter((b) => new Date(b.startDate) >= now)
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "COMPLETED")
    .reduce((sum, b) => sum + b.totalAmount, 0)
  const pendingPayments = bookings.filter((b) => b.paymentStatus !== "COMPLETED")

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
        <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all bookings for your tours
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
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
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>Manage and track your tour bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference, customer, or tour..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending Payment</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You don't have any bookings yet. Share your tours to get bookings!"}
              </p>
              <Button asChild>
                <Link href="/agent/tours">View My Tours</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Tour</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Guests</TableHead>
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
                        <div>
                          <div className="font-medium">{booking.contactName}</div>
                          <div className="text-xs text-muted-foreground">
                            {booking.contactEmail}
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
                          {booking.tour.durationDays} days
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
                      <TableCell className="text-right">
                        <div className="font-medium">
                          ${booking.totalAmount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/booking/confirmation/${booking.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {booking.status === "CONFIRMED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDownloadItinerary(
                                    booking.id,
                                    booking.bookingReference
                                  )
                                }
                                disabled={downloadingId === booking.id}
                              >
                                {downloadingId === booking.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4 mr-2" />
                                )}
                                Download Itinerary
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                              <a href={`mailto:${booking.contactEmail}`}>
                                <Mail className="h-4 w-4 mr-2" />
                                Contact Customer
                              </a>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
