"use client"

import { useState, useEffect } from "react"
import { ReviewStats } from "./review-stats"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ReviewStatsLoaderProps {
  tourSlug: string
  fallbackRating: number
  fallbackCount: number
}

export function ReviewStatsLoader({
  tourSlug,
  fallbackRating,
  fallbackCount,
}: ReviewStatsLoaderProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{
    averageRating: number
    totalReviews: number
    ratingBreakdown: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
  } | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/tours/${tourSlug}/reviews?limit=1`)
        const data = await response.json()

        if (data.success && data.meta) {
          setStats({
            averageRating: data.meta.averageRating || fallbackRating,
            totalReviews: data.meta.totalReviews || fallbackCount,
            ratingBreakdown: data.meta.ratingBreakdown || {
              5: 0,
              4: 0,
              3: 0,
              2: 0,
              1: 0,
            },
          })
        }
      } catch (error) {
        console.error("Error fetching review stats:", error)
        // Use fallback values
        setStats({
          averageRating: fallbackRating,
          totalReviews: fallbackCount,
          ratingBreakdown: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [tourSlug, fallbackRating, fallbackCount])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading review statistics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <ReviewStats
        averageRating={fallbackRating}
        totalReviews={fallbackCount}
        ratingBreakdown={{
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        }}
      />
    )
  }

  return (
    <ReviewStats
      averageRating={stats.averageRating}
      totalReviews={stats.totalReviews}
      ratingBreakdown={stats.ratingBreakdown}
    />
  )
}
