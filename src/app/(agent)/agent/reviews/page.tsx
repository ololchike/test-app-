"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Star, TrendingUp, MessageSquare, Filter, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface Review {
  id: string
  rating: number
  title?: string
  content: string
  images: string[]
  createdAt: string
  helpfulCount: number
  isVerified: boolean
  agentResponse?: string
  respondedAt?: string
  user: {
    name: string
    avatar?: string
  }
  tour: {
    id: string
    title: string
    slug: string
    coverImage?: string
  }
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  respondedCount: number
  pendingResponseCount: number
  ratingBreakdown: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export default function AgentReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterRating, setFilterRating] = useState<string>("all")
  const [filterResponded, setFilterResponded] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [responseText, setResponseText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams()

      if (filterRating !== "all") {
        params.append("rating", filterRating)
      }

      if (filterResponded !== "all") {
        params.append("responded", filterResponded)
      }

      const response = await fetch(`/api/agent/reviews?${params}`)
      const data = await response.json()

      if (data.success) {
        setReviews(data.data)
        setStats(data.stats)
      } else {
        toast.error("Failed to load reviews")
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [filterRating, filterResponded])

  const handleRespond = async () => {
    if (!selectedReview || !responseText.trim()) {
      toast.error("Please enter a response")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/reviews/${selectedReview.id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          response: responseText.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Response submitted successfully")
        setSelectedReview(null)
        setResponseText("")
        fetchReviews()
      } else {
        toast.error(data.error || "Failed to submit response")
      }
    } catch (error) {
      console.error("Error submitting response:", error)
      toast.error("Failed to submit response")
    } finally {
      setSubmitting(false)
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

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.tour.title.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const responseRate = stats
    ? stats.totalReviews > 0
      ? Math.round((stats.respondedCount / stats.totalReviews) * 100)
      : 0
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground mt-1">
          Manage and respond to customer reviews
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.averageRating.toFixed(1) || "0.0"}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-muted-foreground">
                  Based on {stats?.totalReviews || 0} reviews
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reviews
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.pendingResponseCount || 0} pending response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Response Rate
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responseRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.respondedCount || 0} of {stats?.totalReviews || 0} responded
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
          <CardDescription>View and respond to customer reviews</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-full sm:w-[180px]">
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

            <Select value={filterResponded} onValueChange={setFilterResponded}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="false">Pending Response</SelectItem>
                <SelectItem value="true">Responded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">
                Reviews from customers will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    {/* Tour Info */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                      <div className="relative h-12 w-12 rounded overflow-hidden">
                        {review.tour.coverImage && (
                          <img
                            src={review.tour.coverImage}
                            alt={review.tour.title}
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{review.tour.title}</p>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="space-y-4">
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
                                <Badge variant="secondary">Verified</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(review.createdAt), "MMMM d, yyyy")}
                            </p>
                          </div>
                        </div>

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

                      {review.title && (
                        <h4 className="font-semibold">{review.title}</h4>
                      )}
                      <p className="text-sm leading-relaxed">{review.content}</p>

                      {/* Agent Response */}
                      {review.agentResponse ? (
                        <div className="mt-4 pl-4 border-l-2 border-primary/20 bg-muted/30 p-4 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>Your Response</Badge>
                            {review.respondedAt && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(review.respondedAt), "MMMM d, yyyy")}
                              </span>
                            )}
                          </div>
                          <p className="text-sm">{review.agentResponse}</p>
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            setSelectedReview(review)
                            setResponseText("")
                          }}
                          className="w-full sm:w-auto"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Respond to Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
            <DialogDescription>
              Write a thoughtful response to {selectedReview?.user.name}'s review
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Show review */}
            {selectedReview && (
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= selectedReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                {selectedReview.title && (
                  <p className="font-medium text-sm mb-1">{selectedReview.title}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {selectedReview.content}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Textarea
                placeholder="Write your response here..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={6}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {responseText.length}/1000 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReview(null)}>
              Cancel
            </Button>
            <Button onClick={handleRespond} disabled={submitting || !responseText.trim()}>
              {submitting ? "Submitting..." : "Submit Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
