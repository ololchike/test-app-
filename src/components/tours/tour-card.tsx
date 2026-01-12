"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, MapPin, Star, Clock, Users, CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { motion } from "framer-motion"

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
  index?: number
}

export function TourCard({ tour, variant = "default", index = 0 }: TourCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const duration = `${tour.durationDays} Days / ${tour.durationNights} Nights`

  if (variant === "horizontal") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <Link
          href={`/tours/${tour.slug}`}
          className="group flex flex-col sm:flex-row gap-4 rounded-2xl border border-border/50 overflow-hidden hover:shadow-premium-lg transition-all duration-500 bg-card hover:border-primary/30"
        >
          <div className="relative sm:w-72 h-52 sm:h-auto shrink-0 overflow-hidden">
            {/* Skeleton loader */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
            )}
            <Image
              src={tour.coverImage}
              alt={tour.title}
              fill
              className={cn(
                "object-cover transition-all duration-700",
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
                "group-hover:scale-110"
              )}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {tour.featured && (
              <Badge className="absolute top-4 left-4 bg-gradient-to-r from-primary to-orange-500 border-0 shadow-lg">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300"
              onClick={(e) => {
                e.preventDefault()
                setIsWishlisted(!isWishlisted)
              }}
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : "text-gray-600"
                )}
              />
            </motion.button>
          </div>

          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-primary/80 mb-2 font-medium">
                <MapPin className="h-4 w-4" />
                <span>
                  {tour.destination}, {tour.country}
                </span>
              </div>
              <h3 className="font-bold text-xl group-hover:text-primary transition-colors duration-300 line-clamp-2">
                {tour.title}
              </h3>
              {tour.agent && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                  By {tour.agent.businessName}
                  {tour.agent.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground text-xs">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {tour.tourType.slice(0, 3).map((type) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className="text-xs font-medium border-primary/20 text-primary/80 hover:bg-primary/5 transition-colors"
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary/60" />
                  {duration}
                </span>
                {tour.rating !== undefined && tour.rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-foreground">
                      {tour.rating.toFixed(1)}
                    </span>
                    {tour.reviewCount !== undefined && (
                      <span className="text-muted-foreground">({tour.reviewCount})</span>
                    )}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">From</p>
                <p className="text-2xl font-bold text-gradient">${tour.basePrice.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href={`/tours/${tour.slug}`}
          className="group block rounded-2xl border border-border/50 overflow-hidden hover:shadow-premium-lg transition-all duration-500 bg-card hover:border-primary/30"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            {/* Skeleton loader */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
            )}
            <Image
              src={tour.coverImage}
              alt={tour.title}
              fill
              className={cn(
                "object-cover transition-all duration-700",
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
                "group-hover:scale-110"
              )}
              onLoad={() => setImageLoaded(true)}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {tour.featured && (
              <Badge className="absolute top-4 left-4 bg-gradient-to-r from-primary to-orange-500 border-0 shadow-lg">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault()
                setIsWishlisted(!isWishlisted)
              }}
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : "text-gray-600"
                )}
              />
            </motion.button>

            {/* Tour types on image */}
            <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
              {tour.tourType.slice(0, 2).map((type) => (
                <Badge
                  key={type}
                  className="bg-white/95 text-foreground text-xs font-medium backdrop-blur-sm shadow-lg border-0"
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {tour.destination}, {tour.country}
              </span>
            </div>

            <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {tour.title}
            </h3>

            {tour.agent && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                By {tour.agent.businessName}
                {tour.agent.isVerified && (
                  <CheckCircle className="h-3.5 w-3.5 text-secondary fill-secondary/20" />
                )}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary/60" />
              <span>{duration}</span>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              {tour.rating !== undefined && tour.rating > 0 ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < Math.round(tour.rating || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-sm">{tour.rating.toFixed(1)}</span>
                  {tour.reviewCount !== undefined && (
                    <span className="text-muted-foreground text-xs">
                      ({tour.reviewCount})
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground font-medium">New</span>
              )}

              <div className="text-right">
                <span className="text-xs text-muted-foreground">From </span>
                <span className="font-bold text-xl text-gradient">${tour.basePrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </Link>
      </motion.div>
    </motion.div>
  )
}
