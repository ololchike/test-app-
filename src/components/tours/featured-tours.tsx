"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Clock, Star, ChevronRight, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { WishlistButton } from "./wishlist-button"

interface FeaturedTour {
  id: string
  slug: string
  title: string
  subtitle: string | null
  coverImage: string | null
  destination: string
  country: string
  durationDays: number
  durationNights: number
  basePrice: number
  currency: string
  tourType: string[]
  featured: boolean
  agent: {
    businessName: string
    isVerified: boolean
  }
  rating: number | null
  reviewCount: number
  bookingCount: number
}

interface FeaturedToursProps {
  limit?: number
  showTitle?: boolean
  className?: string
}

export function FeaturedTours({
  limit = 6,
  showTitle = true,
  className,
}: FeaturedToursProps) {
  const [tours, setTours] = useState<FeaturedTour[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedTours = async () => {
      try {
        const response = await fetch(`/api/tours/featured?limit=${limit}`)
        const data = await response.json()
        if (data.success) {
          setTours(data.data)
        }
      } catch (error) {
        console.error("Error fetching featured tours:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedTours()
  }, [limit])

  if (isLoading) {
    return (
      <section className={className}>
        {showTitle && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Featured Tours
              </h2>
              <p className="text-muted-foreground mt-1">
                Hand-picked experiences for you
              </p>
            </div>
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (tours.length === 0) {
    return null
  }

  return (
    <section className={className}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Featured Tours
            </h2>
            <p className="text-muted-foreground mt-1">
              Hand-picked experiences for unforgettable adventures
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link href="/tours?featured=true">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <Card
            key={tour.id}
            className="overflow-hidden group hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <Link href={`/tours/${tour.slug}`}>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={tour.coverImage || "/images/placeholder-tour.jpg"}
                    alt={tour.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              </Link>

              {/* Wishlist button */}
              <div className="absolute top-2 right-2">
                <WishlistButton tourId={tour.id} />
              </div>

              {/* Featured badge */}
              <Badge className="absolute top-2 left-2 bg-primary">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>

              {/* Price badge */}
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="bg-white text-foreground">
                  From ${tour.basePrice.toLocaleString()}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <Link href={`/tours/${tour.slug}`}>
                <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors">
                  {tour.title}
                </h3>
              </Link>

              {tour.subtitle && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {tour.subtitle}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {tour.destination}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {tour.durationDays}D/{tour.durationNights}N
                </span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <div className="flex items-center gap-1">
                  {tour.rating ? (
                    <>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {tour.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({tour.reviewCount})
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No reviews yet
                    </span>
                  )}
                </div>

                <span className="text-xs text-muted-foreground">
                  {tour.agent.businessName}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showTitle && (
        <div className="mt-6 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link href="/tours?featured=true">
              View All Featured Tours
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  )
}
