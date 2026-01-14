import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Filter, SlidersHorizontal } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { defaultCollections, CollectionData } from "@/lib/data/collections"
import { TourCard } from "@/components/tours/tour-card"
import { Button } from "@/components/ui/button"

interface CollectionDetailPageProps {
  params: Promise<{ slug: string }>
}

async function getCollection(slug: string) {
  try {
    // Try database first
    const dbCollection = await prisma.collection.findUnique({
      where: { slug },
    })

    if (dbCollection) {
      return {
        ...dbCollection,
        filterCriteria: JSON.parse(dbCollection.filterCriteria),
      }
    }

    // Fall back to default collections
    const defaultCollection = defaultCollections.find(c => c.slug === slug)
    return defaultCollection || null
  } catch (error) {
    console.error("Error fetching collection:", error)
    return defaultCollections.find(c => c.slug === slug) || null
  }
}

async function getToursForCollection(criteria: CollectionData["filterCriteria"]) {
  const where: Record<string, unknown> = { status: "ACTIVE" }

  if (criteria.country?.length) {
    where.country = { in: criteria.country }
  }
  if (criteria.maxPrice) {
    where.basePrice = { lte: criteria.maxPrice }
  }
  if (criteria.minPrice) {
    where.basePrice = { ...(where.basePrice as object || {}), gte: criteria.minPrice }
  }
  if (criteria.maxDays) {
    where.durationDays = { lte: criteria.maxDays }
  }
  if (criteria.minDays) {
    where.durationDays = { ...(where.durationDays as object || {}), gte: criteria.minDays }
  }
  if (criteria.difficulty) {
    where.difficulty = criteria.difficulty
  }
  if (criteria.tourType?.length) {
    where.OR = criteria.tourType.map(type => ({
      tourType: { contains: type }
    }))
  }

  const tours = await prisma.tour.findMany({
    where,
    orderBy: [
      { featured: "desc" },
      { viewCount: "desc" },
    ],
    take: 24,
    include: {
      agent: {
        select: {
          businessName: true,
          isVerified: true,
        },
      },
      reviews: {
        where: { isApproved: true },
        select: { rating: true },
      },
      _count: {
        select: { reviews: true },
      },
    },
  })

  return tours.map(tour => {
    const avgRating = tour.reviews.length > 0
      ? tour.reviews.reduce((sum, r) => sum + r.rating, 0) / tour.reviews.length
      : 0

    return {
      id: tour.id,
      slug: tour.slug,
      title: tour.title,
      destination: tour.destination,
      country: tour.country,
      coverImage: tour.coverImage || "",
      basePrice: tour.basePrice,
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      tourType: JSON.parse(tour.tourType || "[]"),
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: tour._count.reviews,
      agent: tour.agent,
      featured: tour.featured,
      maxGroupSize: tour.maxGroupSize,
    }
  })
}

export async function generateMetadata({ params }: CollectionDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollection(slug)

  if (!collection) {
    return { title: "Collection Not Found" }
  }

  return {
    title: `${collection.title} | SafariPlus Collections`,
    description: collection.description || `Browse ${collection.title} safaris on SafariPlus`,
  }
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { slug } = await params
  const collection = await getCollection(slug)

  if (!collection) {
    notFound()
  }

  const tours = await getToursForCollection(collection.filterCriteria)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-16">
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-3 border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <Link href="/collections" className="text-muted-foreground hover:text-primary transition-colors">
              Collections
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <span className="text-foreground font-medium">{collection.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative h-64 sm:h-80 overflow-hidden">
        <Image
          src={collection.coverImage || "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200"}
          alt={collection.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="container mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {collection.title}
            </h1>
            {collection.description && (
              <p className="text-white/90 max-w-2xl">
                {collection.description}
              </p>
            )}
            <p className="text-white/80 mt-2">
              {tours.length} tour{tours.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters Bar (placeholder for future enhancement) */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing {tours.length} tour{tours.length !== 1 ? "s" : ""}
            </p>
            <Button variant="outline" size="sm" disabled>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {tours.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tours.map((tour, index) => (
                <TourCard key={tour.id} tour={tour} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No tours found</h3>
              <p className="text-muted-foreground mb-6">
                We don't have any tours matching this collection criteria yet.
              </p>
              <Button asChild>
                <Link href="/tours">Browse All Tours</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
