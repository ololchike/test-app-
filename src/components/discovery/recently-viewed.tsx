"use client"

import { useRecentlyViewed } from "@/lib/hooks/use-recently-viewed"
import Link from "next/link"
import Image from "next/image"
import { Clock, MapPin, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRef, useState } from "react"
import { motion } from "framer-motion"

interface RecentlyViewedProps {
  className?: string
  maxItems?: number
  variant?: "horizontal" | "grid"
  title?: string
  showClearButton?: boolean
}

export function RecentlyViewed({
  className,
  maxItems = 6,
  variant = "horizontal",
  title = "Recently Viewed",
  showClearButton = true,
}: RecentlyViewedProps) {
  const { viewedTours, removeTour, clearAll, isLoaded } = useRecentlyViewed()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Don't render if no tours or not loaded
  if (!isLoaded || viewedTours.length === 0) return null

  const tours = viewedTours.slice(0, maxItems)

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    )
  }

  const scrollBy = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 300
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  // Grid variant
  if (variant === "grid") {
    return (
      <section className={cn("py-8", className)}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">{title}</h2>
            </div>
            {showClearButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {tours.map((tour) => (
              <RecentlyViewedCard
                key={tour.id}
                tour={tour}
                onRemove={removeTour}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Horizontal scroll variant
  return (
    <section className={cn("py-8", className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {showClearButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
            {/* Scroll buttons */}
            <div className="hidden md:flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => scrollBy("left")}
                disabled={!canScrollLeft}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => scrollBy("right")}
                disabled={!canScrollRight}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tours.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-[200px] snap-start"
            >
              <RecentlyViewedCard tour={tour} onRemove={removeTour} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Individual card component
function RecentlyViewedCard({
  tour,
  onRemove,
}: {
  tour: {
    id: string
    slug: string
    title: string
    destination: string
    coverImage: string
    basePrice: number
  }
  onRemove: (id: string) => void
}) {
  return (
    <div className="group relative">
      <Link
        href={`/tours/${tour.slug}`}
        className="block rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-md transition-all bg-card"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={tour.coverImage}
            alt={tour.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Price badge */}
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-white/90 backdrop-blur-sm">
            <span className="text-sm font-bold">${tour.basePrice}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {tour.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {tour.destination}
          </p>
        </div>
      </Link>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove(tour.id)
        }}
        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        title="Remove from recently viewed"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
