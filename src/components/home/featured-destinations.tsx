"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PremiumDestinationCard } from "@/components/destinations/premium-destination-card"

interface FeaturedDestinationsProps {
  destinations: {
    name: string
    country: string
    image: string
    tours: number
  }[]
}

export function FeaturedDestinations({ destinations }: FeaturedDestinationsProps) {
  if (destinations.length === 0) return null

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />

      <div className="container relative mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
        >
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-primary font-semibold text-sm uppercase tracking-wider"
            >
              Popular Destinations
            </motion.span>
            <h2 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
              Explore{" "}
              <span className="text-gradient">East Africa</span>
            </h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-xl">
              Discover the most breathtaking safari destinations in the world
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            className="hidden sm:flex group text-base font-semibold"
          >
            <Link href="/destinations">
              View All Destinations
              <ChevronRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {/* Destinations Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination, index) => (
            <PremiumDestinationCard
              key={destination.name}
              destination={destination}
              index={index}
            />
          ))}
        </div>

        {/* Mobile View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 sm:hidden"
        >
          <Button asChild variant="outline" className="w-full h-12 text-base font-semibold">
            <Link href="/destinations">
              View All Destinations
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
