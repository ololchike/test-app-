"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import {
  Map,
  Search,
  Filter,
  Eye,
  Trash2,
  Star,
  StarOff,
  MoreVertical,
  Loader2,
} from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

interface Tour {
  id: string
  title: string
  slug: string
  destination: string
  status: string
  featured: boolean
  basePrice: number
  currency: string
  durationDays: number
  agent: {
    businessName: string
    user: {
      email: string
    }
  }
  _count: {
    bookings: number
    reviews: number
  }
  createdAt: string
  updatedAt: string
}

interface StatusCounts {
  DRAFT?: number
  PENDING_REVIEW?: number
  ACTIVE?: number
  PAUSED?: number
  ARCHIVED?: number
}

const statusConfig = {
  DRAFT: { label: "Draft", color: "bg-gray-500" },
  PENDING_REVIEW: { label: "Pending Review", color: "bg-yellow-500" },
  ACTIVE: { label: "Active", color: "bg-green-500" },
  PAUSED: { label: "Paused", color: "bg-orange-500" },
  ARCHIVED: { label: "Archived", color: "bg-red-500" },
}

export default function AdminToursPage() {
  const searchParams = useSearchParams()
  const [tours, setTours] = useState<Tour[]>([])
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
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

  // Confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchTours()
  }, [statusFilter, page])

  async function fetchTours() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.set("status", statusFilter)
      }
      if (searchQuery) {
        params.set("search", searchQuery)
      }
      params.set("page", page.toString())
      params.set("limit", "10")

      const response = await fetch(`/api/admin/tours?${params}`)
      if (!response.ok) throw new Error("Failed to fetch tours")

      const data = await response.json()
      setTours(data.tours || [])
      setStatusCounts(data.statusCounts || {})
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching tours:", error)
      toast.error("Failed to load tours")
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleFeatured(tour: Tour) {
    try {
      const response = await fetch(`/api/admin/tours/${tour.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !tour.featured }),
      })

      if (!response.ok) throw new Error("Failed to update tour")

      toast.success(
        tour.featured ? "Removed from featured" : "Added to featured"
      )
      fetchTours()
    } catch (error) {
      console.error("Error updating tour:", error)
      toast.error("Failed to update tour")
    }
  }

  async function handleUpdateStatus() {
    if (!selectedTour) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/tours/${selectedTour.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update tour status")

      toast.success("Tour status updated")
      setStatusDialogOpen(false)
      fetchTours()
    } catch (error) {
      console.error("Error updating tour status:", error)
      toast.error("Failed to update tour status")
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleDeleteTour() {
    if (!selectedTour) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/tours/${selectedTour.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete tour")

      toast.success("Tour deleted successfully")
      setDeleteDialogOpen(false)
      fetchTours()
    } catch (error) {
      console.error("Error deleting tour:", error)
      toast.error("Failed to delete tour")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchTours()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Tour Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all tours on the platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5">
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
                <p className="text-sm text-muted-foreground">All Tours</p>
                <p className="text-2xl font-bold mt-1">
                  {Object.values(statusCounts).reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <Map className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {Object.entries(statusConfig).map(([status, config]) => {
          const count = statusCounts[status as keyof StatusCounts] || 0

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
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className="text-2xl font-bold mt-1">{count}</p>
                  </div>
                  <div
                    className={`h-3 w-3 rounded-full ${config.color}`}
                  ></div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Tours</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tours, destination, or agent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch} variant="secondary" className="w-full sm:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
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
          ) : tours.length === 0 ? (
            <div className="text-center py-12">
              <Map className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No tours found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tour</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tours.map((tour) => (
                      <TableRow key={tour.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{tour.title}</p>
                              {tour.featured && (
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {tour.slug}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {tour.agent.businessName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tour.agent.user.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{tour.destination}</TableCell>
                        <TableCell>
                          {tour.currency} {tour.basePrice.toLocaleString()}
                        </TableCell>
                        <TableCell>{tour.durationDays}D</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{tour._count.bookings} bookings</p>
                            <p className="text-xs text-muted-foreground">
                              {tour._count.reviews} reviews
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${
                              statusConfig[tour.status as keyof typeof statusConfig]
                                .color
                            } text-white border-0`}
                          >
                            {
                              statusConfig[tour.status as keyof typeof statusConfig]
                                .label
                            }
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/tours/${tour.slug}`} target="_blank">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Tour
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleFeatured(tour)}
                              >
                                {tour.featured ? (
                                  <>
                                    <StarOff className="h-4 w-4 mr-2" />
                                    Remove Featured
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Make Featured
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {Object.keys(statusConfig).map((status) => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() => {
                                    setSelectedTour(tour)
                                    setNewStatus(status)
                                    setStatusDialogOpen(true)
                                  }}
                                  disabled={tour.status === status}
                                >
                                  Set as {statusConfig[status as keyof typeof statusConfig].label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTour(tour)
                                  setDeleteDialogOpen(true)
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Tour
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteTour}
        title="Delete Tour"
        description={`Are you sure you want to delete "${selectedTour?.title}"? This action cannot be undone and will remove all associated data including bookings and reviews.`}
        confirmText="Delete Tour"
        variant="danger"
        isLoading={isProcessing}
      />

      {/* Status Update Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        onConfirm={handleUpdateStatus}
        title="Update Tour Status"
        description={`Are you sure you want to change the status of "${selectedTour?.title}" to ${
          newStatus ? statusConfig[newStatus as keyof typeof statusConfig]?.label : ""
        }?`}
        confirmText="Update Status"
        variant="warning"
        isLoading={isProcessing}
      />
    </div>
  )
}
