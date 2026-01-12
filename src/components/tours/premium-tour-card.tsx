"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, Star, Clock, Users, Heart, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface PremiumTourCardProps {
  tour: {
    id: string
    slug: string
    title: string
    location: string
    image: string
    price: number
    rating: number
    reviews: number
    duration: string
    badge?: string | null
    maxGroupSize?: number
  }
  index?: number
}

export function PremiumTourCard({ tour, index = 0 }: PremiumTourCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
    >
      <Link href={`/tours/${tour.slug}`} className="group block">
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl bg-card shadow-premium hover:shadow-premium-lg transition-shadow duration-500"
        >
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {/* Skeleton loader */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}

            <Image
              src={tour.image}
              alt={tour.title}
              fill
              className={cn(
                "object-cover transition-all duration-700 ease-out",
                "group-hover:scale-110",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Badge */}
            {tour.badge && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute left-3 top-3"
              >
                <Badge className="bg-primary shadow-lg backdrop-blur-sm font-medium px-3 py-1">
                  {tour.badge}
                </Badge>
              </motion.div>
            )}

            {/* Like Button */}
            <motion.button
              onClick={(e) => {
                e.preventDefault()
                setIsLiked(!isLiked)
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transition-colors hover:bg-white"
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                )}
              />
            </motion.button>

            {/* Quick View on Hover */}
            <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <motion.div
                className="flex items-center justify-center gap-2 bg-white/95 backdrop-blur-sm text-foreground rounded-xl py-2.5 px-4 font-medium text-sm shadow-lg"
              >
                View Details
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-sm">
                  {tour.rating > 0 ? tour.rating.toFixed(1) : "New"}
                </span>
              </div>
              {tour.reviews > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({tour.reviews} reviews)
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="mt-2 font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {tour.title}
            </h3>

            {/* Location */}
            <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-sm">{tour.location}</span>
            </div>

            {/* Divider */}
            <div className="my-4 h-px bg-border" />

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-foreground">
                  ${tour.price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  /person
                </span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium">{tour.duration}</span>
                </div>
                {tour.maxGroupSize && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="text-xs font-medium">Max {tour.maxGroupSize}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom accent line on hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-sunset origin-left"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </Link>
    </motion.div>
  )
}

// Skeleton loader for tour cards
export function PremiumTourCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card shadow-premium overflow-hidden">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-6 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="h-px bg-border my-4" />
        <div className="flex justify-between">
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          <div className="h-6 w-20 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
