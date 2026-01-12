"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Star, ThumbsUp, BadgeCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Review {
  id: string
  rating: number
  title?: string
  content: string
  images: string[]
  createdAt: string
  helpfulCount: number
  isVerified: boolean
  isHelpfulByCurrentUser?: boolean
  agentResponse?: string
  respondedAt?: string
  user: {
    name: string
    avatar?: string
  }
}

interface ReviewListProps {
  tourSlug: string
  initialReviews?: Review[]
  initialMeta?: {
    total: number
    totalPages: number
    page: number
  }
}

export function ReviewList({
  tourSlug,
  initialReviews = [],
  initialMeta,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState("recent")
  const [filterRating, setFilterRating] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(initialMeta)

  const fetchReviews = async (newSort?: string, newRating?: string, newPage?: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sort: newSort || sortBy,
        page: String(newPage || page),
        limit: "10",
      })

      if (newRating && newRating !== "all") {
        params.append("rating", newRating)
      }

      const response = await fetch(`/api/tours/${tourSlug}/reviews?${params}`)
      const data = await response.json()

      if (data.success) {
        setReviews(data.data)
        setMeta(data.meta)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (value: string) => {
    setSortBy(value)
    setPage(1)
    fetchReviews(value, filterRating, 1)
  }

  const handleFilter = (value: string) => {
    setFilterRating(value)
    setPage(1)
    fetchReviews(sortBy, value, 1)
  }

  const handleHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        // Update the review in the list
        setReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  helpfulCount: data.data.helpfulCount,
                  isHelpfulByCurrentUser: data.action === "added",
                }
              : review
          )
        )
        toast.success(data.message)
      } else {
        toast.error(data.error || "Failed to update helpful status")
      }
    } catch (error) {
      console.error("Error marking review as helpful:", error)
      toast.error("Failed to update helpful status")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={sortBy} onValueChange={handleSort}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="highest">Highest Rating</SelectItem>
            <SelectItem value="lowest">Lowest Rating</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRating} onValueChange={handleFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No reviews yet. Be the first to review this tour!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Reviewer Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.user.avatar} />
                        <AvatarFallback>
                          {getInitials(review.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{review.user.name}</span>
                          {review.isVerified && (
                            <Badge variant="secondary" className="gap-1">
                              <BadgeCheck className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(review.createdAt), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="space-y-2">
                    {review.title && (
                      <h4 className="font-semibold">{review.title}</h4>
                    )}
                    <p className="text-sm leading-relaxed">{review.content}</p>
                  </div>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}

                  {/* Helpful Button */}
                  <div className="flex items-center gap-4 pt-2">
                    <Button
                      variant={review.isHelpfulByCurrentUser ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleHelpful(review.id)}
                      className="gap-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Helpful ({review.helpfulCount})
                    </Button>
                  </div>

                  {/* Agent Response */}
                  {review.agentResponse && (
                    <div className="mt-4 pl-4 border-l-2 border-primary/20 bg-muted/30 p-4 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>Agent Response</Badge>
                        {review.respondedAt && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(review.respondedAt), "MMMM d, yyyy")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{review.agentResponse}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              const newPage = page - 1
              setPage(newPage)
              fetchReviews(sortBy, filterRating, newPage)
            }}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => {
              const newPage = page + 1
              setPage(newPage)
              fetchReviews(sortBy, filterRating, newPage)
            }}
            disabled={page === meta.totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
