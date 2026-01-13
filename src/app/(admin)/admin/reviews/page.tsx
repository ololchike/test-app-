"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Star, Search, Check, X, Trash2 } from "lucide-react"
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
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

interface Review {
  id: string
  rating: number
  title: string | null
  content: string
  isApproved: boolean
  createdAt: string
  user: {
    name: string | null
    email: string
  }
  tour: {
    title: string
    slug: string
  }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [approvalCounts, setApprovalCounts] = useState<Record<string, number>>({})
  const [ratingCounts, setRatingCounts] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [approvalFilter, setApprovalFilter] = useState<string>("all")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"approve" | "reject" | "delete">("approve")
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [approvalFilter, ratingFilter, page])

  async function fetchReviews() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (approvalFilter !== "all") params.set("isApproved", approvalFilter)
      if (ratingFilter !== "all") params.set("rating", ratingFilter)
      if (searchQuery) params.set("search", searchQuery)
      params.set("page", page.toString())
      params.set("limit", "10")

      const response = await fetch(`/api/admin/reviews?${params}`)
      if (!response.ok) throw new Error("Failed to fetch reviews")

      const data = await response.json()
      setReviews(data.reviews || [])
      setApprovalCounts(data.approvalCounts || {})
      setRatingCounts(data.ratingCounts || {})
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  async function handleReviewAction() {
    if (!selectedReview) return

    setIsProcessing(true)
    try {
      if (dialogType === "delete") {
        const response = await fetch(`/api/admin/reviews/${selectedReview.id}`, {
          method: "DELETE",
        })
        if (!response.ok) throw new Error("Failed to delete review")
        toast.success("Review deleted")
      } else {
        const response = await fetch(`/api/admin/reviews/${selectedReview.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isApproved: dialogType === "approve",
          }),
        })
        if (!response.ok) throw new Error("Failed to update review")
        toast.success(
          dialogType === "approve" ? "Review approved" : "Review rejected"
        )
      }

      setDialogOpen(false)
      fetchReviews()
    } catch (error) {
      console.error("Error processing review:", error)
      toast.error("Failed to process review")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchReviews()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Review Management</h1>
        <p className="text-muted-foreground mt-2">
          Moderate and manage tour reviews
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            approvalFilter === "all" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => {
            setApprovalFilter("all")
            setPage(1)
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">All Reviews</p>
                <p className="text-2xl font-bold mt-1">
                  {approvalCounts.approved || 0 + approvalCounts.pending || 0}
                </p>
              </div>
              <Star className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            approvalFilter === "false" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => {
            setApprovalFilter("false")
            setPage(1)
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1">
                  {approvalCounts.pending || 0}
                </p>
              </div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            approvalFilter === "true" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => {
            setApprovalFilter("true")
            setPage(1)
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold mt-1">
                  {approvalCounts.approved || 0}
                </p>
              </div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
          </CardContent>
        </Card>

        {[5, 4, 3].map((rating) => (
          <Card
            key={rating}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              ratingFilter === rating.toString() ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => {
              setRatingFilter(rating.toString())
              setPage(1)
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{rating} Stars</p>
                  <p className="text-2xl font-bold mt-1">
                    {ratingCounts[rating] || 0}
                  </p>
                </div>
                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Reviews</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No reviews found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Tour</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {review.user.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {review.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/tours/${review.tour.slug}`}
                          className="text-blue-600 hover:underline max-w-xs truncate block"
                        >
                          {review.tour.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {review.title && (
                            <p className="font-medium text-sm mb-1">
                              {review.title}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground truncate">
                            {review.content}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            review.isApproved
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          } text-white border-0`}
                        >
                          {review.isApproved ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(review.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {!review.isApproved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReview(review)
                                setDialogType("approve")
                                setDialogOpen(true)
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {review.isApproved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReview(review)
                                setDialogType("reject")
                                setDialogOpen(true)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReview(review)
                              setDialogType("delete")
                              setDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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

      <ConfirmationDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleReviewAction}
        title={
          dialogType === "approve"
            ? "Approve Review"
            : dialogType === "reject"
            ? "Reject Review"
            : "Delete Review"
        }
        description={
          dialogType === "approve"
            ? `Are you sure you want to approve this review from ${selectedReview?.user.email}? It will be visible on the tour page.`
            : dialogType === "reject"
            ? `Are you sure you want to reject this review from ${selectedReview?.user.email}? It will be hidden from the tour page.`
            : `Are you sure you want to permanently delete this review from ${selectedReview?.user.email}? This action cannot be undone.`
        }
        confirmText={
          dialogType === "approve"
            ? "Approve"
            : dialogType === "reject"
            ? "Reject"
            : "Delete"
        }
        variant={dialogType === "delete" ? "danger" : "default"}
        isLoading={isProcessing}
      />
    </div>
  )
}
