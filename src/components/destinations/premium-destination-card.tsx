"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, MapPin } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface PremiumDestinationCardProps {
  destination: {
    name: string
    country: string
    image: string
    tours: number
  }
  index?: number
  variant?: "default" | "large"
}

export function PremiumDestinationCard({
  destination,
  index = 0,
  variant = "default"
}: PremiumDestinationCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const isLarge = variant === "large"

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
    >
      <Link
        href={`/destinations/${destination.name.toLowerCase().replace(/ /g, "-")}`}
        className="group block relative overflow-hidden rounded-3xl"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={cn(
            "relative overflow-hidden",
            isLarge ? "aspect-[3/4] md:aspect-[16/10]" : "aspect-[3/4]"
          )}
        >
          {/* Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          {/* Image */}
          <Image
            src={destination.image}
            alt={destination.name}
            fill
            className={cn(
              "object-cover transition-all duration-700 ease-out",
              "group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-primary/20 to-transparent" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-radial from-accent/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            {/* Location Tag */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 text-white/80 text-sm mb-2"
            >
              <MapPin className="h-3.5 w-3.5" />
              {destination.country}
            </motion.div>

            {/* Title */}
            <h3 className={cn(
              "font-bold text-white leading-tight",
              isLarge ? "text-3xl md:text-4xl" : "text-2xl"
            )}>
              {destination.name}
            </h3>

            {/* Tours Count */}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-white/80 text-sm">
                {destination.tours} {destination.tours === 1 ? "tour" : "tours"} available
              </span>

              {/* Arrow Button */}
              <motion.div
                className="flex items-center justify-center h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm text-white opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </div>

            {/* Hover Line */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-sunset"
              initial={{ scaleX: 0, originX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Border Glow on Hover */}
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/20 transition-colors duration-500" />
        </motion.div>
      </Link>
    </motion.div>
  )
}

// Grid variant for multiple destinations
export function DestinationGrid({ destinations, className }: {
  destinations: {
    name: string
    country: string
    image: string
    tours: number
  }[]
  className?: string
}) {
  if (destinations.length === 0) return null

  return (
    <div className={cn("grid gap-6", className)}>
      {destinations.length >= 4 ? (
        <>
          {/* First row - 2 items */}
          <div className="grid gap-6 md:grid-cols-2">
            <PremiumDestinationCard destination={destinations[0]} index={0} variant="large" />
            <PremiumDestinationCard destination={destinations[1]} index={1} variant="large" />
          </div>
          {/* Second row - remaining items */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.slice(2).map((destination, index) => (
              <PremiumDestinationCard
                key={destination.name}
                destination={destination}
                index={index + 2}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination, index) => (
            <PremiumDestinationCard
              key={destination.name}
              destination={destination}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}
