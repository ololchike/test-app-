"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PremiumTourCard } from "@/components/tours/premium-tour-card"

interface FeaturedToursProps {
  tours: {
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
  }[]
}

export function FeaturedTours({ tours }: FeaturedToursProps) {
  return (
    <section className="py-20 lg:py-28 bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />

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
              Featured Tours
            </motion.span>
            <h2 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
              Handpicked{" "}
              <span className="text-gradient-sunset">Adventures</span>
            </h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-xl">
              Curated safari experiences for unforgettable memories
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            className="hidden sm:flex group text-base font-semibold"
          >
            <Link href="/tours">
              Browse All Tours
              <ChevronRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {/* Tours Grid */}
        {tours.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tours.map((tour, index) => (
              <PremiumTourCard
                key={tour.id}
                tour={tour}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground text-lg mb-4">
              No featured tours available at the moment.
            </p>
            <Button asChild variant="outline" size="lg">
              <Link href="/tours">Browse All Tours</Link>
            </Button>
          </motion.div>
        )}

        {/* Mobile View All Button */}
        {tours.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 sm:hidden"
          >
            <Button asChild variant="outline" className="w-full h-12 text-base font-semibold">
              <Link href="/tours">
                Browse All Tours
                <ChevronRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
