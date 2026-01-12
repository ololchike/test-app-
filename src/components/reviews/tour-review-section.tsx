"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Star, Loader2, Lock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import Link from "next/link"

interface TourReviewSectionProps {
  tourId: string
  tourSlug: string
  tourTitle: string
  onReviewSubmitted?: () => void
}

interface EligibleBooking {
  id: string
  startDate: string
  hasReview: boolean
}

export function TourReviewSection({
  tourId,
  tourSlug,
  tourTitle,
  onReviewSubmitted,
}: TourReviewSectionProps) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [eligibleBooking, setEligibleBooking] = useState<EligibleBooking | null>(null)
  const [hasExistingReview, setHasExistingReview] = useState(false)

  // Form state
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Check if user has an eligible booking for this tour
  useEffect(() => {
    const checkEligibility = async () => {
      if (status === "loading") return
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/tours/${tourSlug}/review-eligibility`)
        const data = await response.json()

        if (data.success) {
          setEligibleBooking(data.eligibleBooking)
          setHasExistingReview(data.hasExistingReview)
        }
      } catch (error) {
        console.error("Error checking review eligibility:", error)
      } finally {
        setLoading(false)
      }
    }

    checkEligibility()
  }, [session, status, tourSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!eligibleBooking) return

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (content.trim().length < 10) {
      toast.error("Review must be at least 10 characters")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: eligibleBooking.id,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Review submitted successfully!")
        setRating(0)
        setTitle("")
        setContent("")
        setHasExistingReview(true)
        setEligibleBooking(null)
        if (onReviewSubmitted) {
          onReviewSubmitted()
        }
      } else {
        toast.error(data.error || "Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading || status === "loading") {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Checking review eligibility...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Not logged in
  if (!session?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
          <CardDescription>Share your experience with others</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Login Required</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">Please log in to write a review for this tour.</p>
              <Button asChild>
                <Link href={`/login?callbackUrl=/tours/${tourSlug}`}>Log In</Link>
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Already reviewed
  if (hasExistingReview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-400">Thank you for your review!</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-500">
              You have already reviewed this tour. Your feedback helps other travelers make informed decisions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // No eligible booking
  if (!eligibleBooking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
          <CardDescription>Share your experience with others</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Booking Required</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">
                You can write a review after completing this tour. Book now and share your experience with other travelers!
              </p>
              <Button asChild variant="outline">
                <a href="#booking">Book This Tour</a>
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Show review form
  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience with {tourTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Selector */}
          <div className="space-y-2">
            <Label>Your Rating *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} out of 5 stars
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Review Title (Optional)</Label>
            <Input
              id="review-title"
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/100 characters
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="review-content">Your Review *</Label>
            <Textarea
              id="review-content"
              placeholder="Tell us about your tour experience. What did you enjoy? What could be improved?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={2000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/2000 characters (minimum 10)
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting || rating === 0 || content.trim().length < 10}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
