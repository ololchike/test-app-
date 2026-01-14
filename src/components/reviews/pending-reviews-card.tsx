"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, Gift, ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { REFERRAL_CONFIG } from "@/lib/referral"
import { cn } from "@/lib/utils"

interface PendingReview {
  bookingId: string
  tourId: string
  tourSlug: string
  tourTitle: string
  tourImage: string
  completedAt: string
}

interface PendingReviewsCardProps {
  className?: string
}

export function PendingReviewsCard({ className }: PendingReviewsCardProps) {
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPendingReviews() {
      try {
        const response = await fetch("/api/reviews/pending")
        if (response.ok) {
          const data = await response.json()
          setPendingReviews(data.pendingReviews || [])
        }
      } catch (error) {
        console.error("Error fetching pending reviews:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingReviews()
  }, [])

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (pendingReviews.length === 0) {
    return null
  }

  return (
    <Card className={cn("border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Share Your Experience
          </CardTitle>
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Gift className="h-3 w-3 mr-1" />
            Earn ${REFERRAL_CONFIG.reviewCredit}+
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          You have {pendingReviews.length} trip{pendingReviews.length > 1 ? "s" : ""} waiting for your review
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {pendingReviews.slice(0, 3).map((review) => (
          <div
            key={review.bookingId}
            className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-card border border-border/50"
          >
            <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0">
              <Image
                src={review.tourImage || "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=100"}
                alt={review.tourTitle}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{review.tourTitle}</p>
              <p className="text-xs text-muted-foreground">
                Completed {new Date(review.completedAt).toLocaleDateString()}
              </p>
            </div>
            <Button asChild size="sm">
              <Link href={`/tours/${review.tourSlug}?review=true`}>
                Review
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        ))}

        {pendingReviews.length > 3 && (
          <Button variant="ghost" asChild className="w-full">
            <Link href="/dashboard/bookings?filter=completed">
              View all {pendingReviews.length} pending reviews
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
