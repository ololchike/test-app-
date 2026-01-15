"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
  Mail,
  Sparkles,
  TrendingUp,
  DollarSign,
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
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { SectionError } from "@/components/error"

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

const statsConfig = [
  {
    key: "totalBookings",
    title: "Total Bookings",
    icon: Calendar,
    color: "from-blue-500 to-indigo-600",
  },
  {
    key: "upcomingBookings",
    title: "Upcoming Trips",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
  },
  {
    key: "totalRevenue",
    title: "Total Revenue",
    icon: DollarSign,
    color: "from-amber-500 to-orange-600",
  },
  {
    key: "pendingPayments",
    title: "Pending Payments",
    icon: Clock,
    color: "from-yellow-500 to-orange-500",
  },
]

export default function AgentBookingsPage() {
  const searchParams = useSearchParams()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState("all")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Sync search from URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search") || ""
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

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
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
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
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
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

  const stats = {
    totalBookings: bookings.length,
    upcomingBookings: upcomingBookings.length,
    totalRevenue,
    pendingPayments: pendingPayments.length,
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading bookings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-3">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Booking Management</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Bookings</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          View and manage all bookings for your tours
        </p>
      </motion.div>

      {/* Stats Summary */}
      <SectionError name="Bookings Stats">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon
            const value = stat.key === "totalRevenue"
              ? `$${stats[stat.key as keyof typeof stats].toLocaleString()}`
              : stats[stat.key as keyof typeof stats]
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border/50 hover:border-primary/30 hover:shadow-premium transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br", stat.color)}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={cn(
                      "text-2xl font-bold",
                      stat.key === "pendingPayments" && stats.pendingPayments > 0 && "text-yellow-600"
                    )}>
                      {value}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </SectionError>

      {/* Bookings Table */}
      <SectionError name="Bookings Table">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 hover:shadow-premium transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                All Bookings
              </CardTitle>
              <CardDescription>Manage and track your tour bookings</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="flex flex-col gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reference, customer, or tour..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-border/50 focus:border-primary/50 w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full h-11 rounded-xl border-border/50">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending Payment</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "You don't have any bookings yet. Share your tours to get bookings!"}
                </p>
                <Button asChild className="shadow-glow">
                  <Link href="/agent/tours">View My Tours</Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">Reference</TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">Tour</TableHead>
                      <TableHead className="font-semibold">Dates</TableHead>
                      <TableHead className="font-semibold">Guests</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold">Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking, index) => (
                      <motion.tr
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="group hover:bg-primary/5 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <div className="font-mono font-semibold text-primary">
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
                          <div className="flex items-center gap-1.5 text-sm">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            {booking.adults + booking.children}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.status, booking.paymentStatus)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-bold text-lg">
                            ${booking.totalAmount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
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
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </SectionError>
    </div>
  )
}
