"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, MapPin, Star, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface TourCardProps {
  tour: {
    id: string
    slug: string
    title: string
    destination: string
    country: string
    coverImage: string
    basePrice: number
    durationDays: number
    durationNights: number
    rating?: number
    reviewCount?: number
    tourType: string[]
    featured?: boolean
    agent?: {
      businessName: string
      isVerified: boolean
    }
  }
  variant?: "default" | "horizontal"
}

export function TourCard({ tour, variant = "default" }: TourCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const duration = `${tour.durationDays} Days / ${tour.durationNights} Nights`

  if (variant === "horizontal") {
    return (
      <Link
        href={`/tours/${tour.slug}`}
        className="group flex flex-col sm:flex-row gap-4 rounded-xl border overflow-hidden hover:shadow-lg transition-shadow bg-card"
      >
        <div className="relative sm:w-64 h-48 sm:h-auto shrink-0 overflow-hidden">
          <Image
            src={tour.coverImage}
            alt={tour.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {tour.featured && (
            <Badge className="absolute top-3 left-3 bg-primary">Featured</Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.preventDefault()
              setIsWishlisted(!isWishlisted)
            }}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isWishlisted ? "fill-rose-500 text-rose-500" : "text-gray-600"
              )}
            />
          </Button>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <MapPin className="h-3 w-3" />
              <span>
                {tour.destination}, {tour.country}
              </span>
            </div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
              {tour.title}
            </h3>
            {tour.agent && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                By {tour.agent.businessName}
                {tour.agent.isVerified && (
                  <Badge variant="secondary" className="text-[10px] h-4">
                    Verified
                  </Badge>
                )}
              </p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {tour.tourType.slice(0, 3).map((type) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {duration}
              </span>
              {tour.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">
                    {tour.rating}
                  </span>
                  {tour.reviewCount && (
                    <span>({tour.reviewCount})</span>
                  )}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-xl font-bold">${tour.basePrice}</p>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group block rounded-xl border overflow-hidden hover:shadow-lg transition-shadow bg-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={tour.coverImage}
          alt={tour.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {tour.featured && (
          <Badge className="absolute top-3 left-3 bg-primary">Featured</Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
          onClick={(e) => {
            e.preventDefault()
            setIsWishlisted(!isWishlisted)
          }}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              isWishlisted ? "fill-rose-500 text-rose-500" : "text-gray-600"
            )}
          />
        </Button>
        <div className="absolute bottom-3 left-3 flex gap-1">
          {tour.tourType.slice(0, 2).map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="bg-white/90 text-foreground text-xs"
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <MapPin className="h-3 w-3" />
          <span>
            {tour.destination}, {tour.country}
          </span>
        </div>
        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {tour.title}
        </h3>
        {tour.agent && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            By {tour.agent.businessName}
            {tour.agent.isVerified && (
              <span className="text-blue-500">✓</span>
            )}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{duration}</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          {tour.rating ? (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{tour.rating}</span>
              {tour.reviewCount && (
                <span className="text-muted-foreground">
                  ({tour.reviewCount})
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">New</span>
          )}
          <div className="text-right">
            <span className="text-xs text-muted-foreground">From </span>
            <span className="font-bold text-lg">${tour.basePrice}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
