"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface CollectionCardProps {
  collection: {
    id: string
    slug: string
    title: string
    description?: string | null
    coverImage?: string | null
    icon?: string | null
    tourCount: number
  }
  index?: number
  variant?: "default" | "compact" | "featured"
  className?: string
}

export function CollectionCard({
  collection,
  index = 0,
  variant = "default",
  className,
}: CollectionCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href={`/collections/${collection.slug}`}
        className={cn(
          "group flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all",
          className
        )}
      >
        <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={collection.coverImage || "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=200"}
            alt={collection.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {collection.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {collection.tourCount} tour{collection.tourCount !== 1 ? "s" : ""}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </Link>
    )
  }

  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={className}
      >
        <Link
          href={`/collections/${collection.slug}`}
          className="group block relative h-64 rounded-2xl overflow-hidden"
        >
          <Image
            src={collection.coverImage || "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=600"}
            alt={collection.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-foreground transition-colors">
              {collection.title}
            </h3>
            {collection.description && (
              <p className="text-white/80 text-sm line-clamp-2 mb-2">
                {collection.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-white/90">
              <span className="text-sm font-medium">
                {collection.tourCount} tour{collection.tourCount !== 1 ? "s" : ""}
              </span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={className}
    >
      <Link
        href={`/collections/${collection.slug}`}
        className="group block rounded-xl overflow-hidden border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={collection.coverImage || "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=600"}
            alt={collection.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute bottom-3 left-3 right-3">
            <span className="inline-block px-2 py-1 rounded-full bg-white/90 text-xs font-medium">
              {collection.tourCount} tour{collection.tourCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {collection.title}
          </h3>
          {collection.description && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {collection.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-1 text-primary text-sm font-medium">
            <span>View collection</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
