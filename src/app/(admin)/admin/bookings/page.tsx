"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Search, Eye } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"

interface Booking {
  id: string
  bookingReference: string
  contactName: string
  contactEmail: string
  totalAmount: number
  currency: string
  status: string
  paymentStatus: string
  startDate: string
  user: {
    name: string | null
    email: string
  }
  tour: {
    title: string
    slug: string
  }
  agent: {
    businessName: string
  }
  createdAt: string
}

const statusConfig = {
  PENDING: { label: "Pending", color: "bg-yellow-500" },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-500" },
  PAID: { label: "Paid", color: "bg-green-500" },
  IN_PROGRESS: { label: "In Progress", color: "bg-purple-500" },
  COMPLETED: { label: "Completed", color: "bg-gray-500" },
  CANCELLED: { label: "Cancelled", color: "bg-red-500" },
  REFUNDED: { label: "Refunded", color: "bg-orange-500" },
}

const paymentStatusConfig = {
  PENDING: { label: "Pending", color: "bg-yellow-500" },
  PROCESSING: { label: "Processing", color: "bg-blue-500" },
  COMPLETED: { label: "Completed", color: "bg-green-500" },
  FAILED: { label: "Failed", color: "bg-red-500" },
  REFUNDED: { label: "Refunded", color: "bg-orange-500" },
  PARTIALLY_REFUNDED: { label: "Partial Refund", color: "bg-amber-500" },
}

export default function AdminBookingsPage() {
  const searchParams = useSearchParams()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Sync search from URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search") || ""
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

  useEffect(() => {
    fetchBookings()
  }, [statusFilter, paymentFilter, page])

  async function fetchBookings() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (paymentFilter !== "all") params.set("paymentStatus", paymentFilter)
      if (searchQuery) params.set("search", searchQuery)
      params.set("page", page.toString())
      params.set("limit", "10")

      const response = await fetch(`/api/admin/bookings?${params}`)
      if (!response.ok) throw new Error("Failed to fetch bookings")

      const data = await response.json()
      setBookings(data.bookings || [])
      setStatusCounts(data.statusCounts || {})
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast.error("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchBookings()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Booking Management</h1>
        <p className="text-muted-foreground mt-2">View and manage all bookings</p>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            statusFilter === "all" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => {
            setStatusFilter("all")
            setPage(1)
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">All Bookings</p>
                <p className="text-2xl font-bold mt-1">
                  {Object.values(statusCounts).reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {["CONFIRMED", "PAID", "CANCELLED"].map((status) => {
          const count = statusCounts[status] || 0

          return (
            <Card
              key={status}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                statusFilter === status ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => {
                setStatusFilter(status)
                setPage(1)
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {statusConfig[status as keyof typeof statusConfig]?.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{count}</p>
                  </div>
                  <div
                    className={`h-3 w-3 rounded-full ${
                      statusConfig[status as keyof typeof statusConfig]?.color
                    }`}
                  ></div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Bookings</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  {Object.entries(paymentStatusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No bookings found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Tour</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.bookingReference.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {booking.contactName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.contactEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {booking.tour.title}
                        </div>
                      </TableCell>
                      <TableCell>{booking.agent.businessName}</TableCell>
                      <TableCell>
                        {booking.currency} {booking.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            statusConfig[booking.status as keyof typeof statusConfig]
                              ?.color
                          } text-white border-0`}
                        >
                          {
                            statusConfig[booking.status as keyof typeof statusConfig]
                              ?.label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            paymentStatusConfig[
                              booking.paymentStatus as keyof typeof paymentStatusConfig
                            ]?.color
                          } text-white border-0`}
                        >
                          {
                            paymentStatusConfig[
                              booking.paymentStatus as keyof typeof paymentStatusConfig
                            ]?.label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(booking.startDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/tours/${booking.tour.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
