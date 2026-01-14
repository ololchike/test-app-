"use client"

import Link from "next/link"
import { ArrowRight, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CollectionCard } from "./collection-card"
import { cn } from "@/lib/utils"

interface Collection {
  id: string
  slug: string
  title: string
  description?: string | null
  coverImage?: string | null
  icon?: string | null
  tourCount: number
}

interface FeaturedCollectionsProps {
  collections: Collection[]
  className?: string
}

export function FeaturedCollections({ collections, className }: FeaturedCollectionsProps) {
  if (collections.length === 0) return null

  return (
    <section className={cn("py-12 sm:py-16", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Compass className="h-5 w-5" />
              <span className="font-semibold text-sm uppercase tracking-wider">
                Curated Collections
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Find Your Perfect Safari
            </h2>
            <p className="text-muted-foreground mt-1">
              Hand-picked tours for every type of traveler
            </p>
          </div>

          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/collections">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.slice(0, 6).map((collection, index) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={index}
              variant="default"
            />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Button asChild>
            <Link href="/collections">
              View All Collections
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
