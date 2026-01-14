"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ComparisonTour {
  id: string
  slug: string
  title: string
  destination: string
  country: string
  coverImage: string | null
  basePrice: number
  durationDays: number
  durationNights: number
  tourType: string[]
  difficulty: string | null
  maxGroupSize: number | null
  featured: boolean
  rating: number | null
  highlights: string[]
  included: string[]
  excluded: string[]
  agent: {
    businessName: string
    isVerified: boolean
  }
  _count: {
    reviews: number
    bookings: number
  }
}

interface ComparisonTableProps {
  tours: ComparisonTour[]
}

export function ComparisonTable({ tours }: ComparisonTableProps) {
  // Find the best value (lowest price) and highest rated
  const lowestPrice = Math.min(...tours.map((t) => t.basePrice))
  const highestRating = Math.max(...tours.map((t) => t.rating || 0))

  return (
    <div className="space-y-8">
      {/* Tour Headers with Images */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${tours.length}, minmax(0, 1fr))` }}>
        {tours.map((tour, index) => (
          <motion.div
            key={tour.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden border border-border/50 bg-card">
              {/* Image */}
              <div className="relative aspect-[4/3]">
                {tour.coverImage ? (
                  <Image
                    src={tour.coverImage}
                    alt={tour.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary/30">
                      {tour.title.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {tour.basePrice === lowestPrice && (
                    <Badge className="bg-green-500 text-white">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Best Value
                    </Badge>
                  )}
                  {tour.rating && tour.rating === highestRating && highestRating > 0 && (
                    <Badge className="bg-amber-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Top Rated
                    </Badge>
                  )}
                  {tour.featured && (
                    <Badge className="bg-primary text-primary-foreground">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-2">{tour.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-3 w-3" />
                  {tour.destination}, {tour.country}
                </div>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{tour.rating?.toFixed(1) || "New"}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    ({tour._count.reviews} reviews)
                  </span>
                </div>

                {/* Agent */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">by</span>
                  <span className="font-medium">{tour.agent.businessName}</span>
                  {tour.agent.isVerified && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparison Rows */}
      <div className="rounded-2xl border border-border/50 overflow-hidden">
        {/* Price Row */}
        <ComparisonRow label="Price" icon={<DollarSign className="h-4 w-4" />}>
          {tours.map((tour) => (
            <div key={tour.id} className="text-center">
              <div className={cn(
                "text-2xl font-bold",
                tour.basePrice === lowestPrice && "text-green-600"
              )}>
                ${tour.basePrice.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">per person</div>
            </div>
          ))}
        </ComparisonRow>

        {/* Duration Row */}
        <ComparisonRow label="Duration" icon={<Clock className="h-4 w-4" />} striped>
          {tours.map((tour) => (
            <div key={tour.id} className="text-center font-medium">
              {tour.durationDays} Days / {tour.durationNights} Nights
            </div>
          ))}
        </ComparisonRow>

        {/* Group Size Row */}
        <ComparisonRow label="Group Size" icon={<Users className="h-4 w-4" />}>
          {tours.map((tour) => (
            <div key={tour.id} className="text-center font-medium">
              {tour.maxGroupSize ? `Up to ${tour.maxGroupSize}` : "Flexible"}
            </div>
          ))}
        </ComparisonRow>

        {/* Tour Type Row */}
        <ComparisonRow label="Tour Type" icon={<Calendar className="h-4 w-4" />} striped>
          {tours.map((tour) => (
            <div key={tour.id} className="flex flex-wrap justify-center gap-1">
              {tour.tourType.slice(0, 3).map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          ))}
        </ComparisonRow>

        {/* Difficulty Row */}
        <ComparisonRow label="Difficulty">
          {tours.map((tour) => (
            <div key={tour.id} className="text-center">
              <Badge
                variant="outline"
                className={cn(
                  tour.difficulty === "Easy" && "border-green-500 text-green-600",
                  tour.difficulty === "Moderate" && "border-amber-500 text-amber-600",
                  tour.difficulty === "Challenging" && "border-red-500 text-red-600"
                )}
              >
                {tour.difficulty || "Not specified"}
              </Badge>
            </div>
          ))}
        </ComparisonRow>

        {/* Bookings Row */}
        <ComparisonRow label="Total Bookings" striped>
          {tours.map((tour) => (
            <div key={tour.id} className="text-center font-medium">
              {tour._count.bookings > 0 ? `${tour._count.bookings}+ bookings` : "New tour"}
            </div>
          ))}
        </ComparisonRow>

        {/* Highlights Row */}
        <ComparisonRow label="Highlights" className="items-start">
          {tours.map((tour) => (
            <div key={tour.id} className="space-y-1">
              {tour.highlights.slice(0, 5).map((highlight, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{highlight}</span>
                </div>
              ))}
            </div>
          ))}
        </ComparisonRow>

        {/* Included Row */}
        <ComparisonRow label="What's Included" striped className="items-start">
          {tours.map((tour) => (
            <div key={tour.id} className="space-y-1">
              {tour.included.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{item}</span>
                </div>
              ))}
              {tour.included.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  +{tour.included.length - 5} more
                </div>
              )}
            </div>
          ))}
        </ComparisonRow>

        {/* Not Included Row */}
        <ComparisonRow label="Not Included" className="items-start">
          {tours.map((tour) => (
            <div key={tour.id} className="space-y-1">
              {tour.excluded.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{item}</span>
                </div>
              ))}
            </div>
          ))}
        </ComparisonRow>
      </div>

      {/* Action Buttons */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${tours.length}, minmax(0, 1fr))` }}>
        {tours.map((tour, index) => (
          <motion.div
            key={tour.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Button asChild size="lg" className="w-full shadow-glow">
              <Link href={`/tours/${tour.slug || tour.id}`}>
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Helper component for comparison rows
function ComparisonRow({
  label,
  icon,
  striped,
  children,
  className,
}: {
  label: string
  icon?: React.ReactNode
  striped?: boolean
  children: React.ReactNode
  className?: string
}) {
  const childArray = Array.isArray(children) ? children : [children]

  return (
    <div className={cn(
      "grid items-center py-4 px-4",
      striped && "bg-muted/30"
    )}
    style={{ gridTemplateColumns: `180px repeat(${childArray.length}, minmax(0, 1fr))` }}
    >
      <div className="flex items-center gap-2 font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      {childArray.map((child, i) => (
        <div key={i} className={cn("px-4", className)}>
          {child}
        </div>
      ))}
    </div>
  )
}
