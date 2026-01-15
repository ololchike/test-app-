import { Metadata } from "next"
import { Compass } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { defaultCollections, CollectionData } from "@/lib/data/collections"
import { CollectionCard } from "@/components/collections"
import { SectionError } from "@/components/error"

export const metadata: Metadata = {
  title: "Safari Collections | SafariPlus",
  description: "Browse our curated safari collections - Big Five safaris, gorilla trekking, luxury escapes, family adventures, and more.",
}

async function getCollections() {
  try {
    // Try database first
    const dbCollections = await prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    })

    if (dbCollections.length > 0) {
      // Get tour counts
      const collections = await Promise.all(
        dbCollections.map(async (collection) => {
          const criteria = JSON.parse(collection.filterCriteria)
          const tourCount = await getTourCount(criteria)
          return { ...collection, tourCount }
        })
      )
      return collections
    }

    // Fall back to default collections
    const collections = await Promise.all(
      defaultCollections.map(async (collection) => {
        const tourCount = await getTourCount(collection.filterCriteria)
        return { ...collection, tourCount }
      })
    )
    return collections
  } catch (error) {
    console.error("Error fetching collections:", error)
    return defaultCollections.map(c => ({ ...c, tourCount: 0 }))
  }
}

async function getTourCount(criteria: CollectionData["filterCriteria"]) {
  const where: Record<string, unknown> = { status: "ACTIVE" }

  if (criteria.country?.length) {
    where.country = { in: criteria.country }
  }
  if (criteria.maxPrice) {
    where.basePrice = { lte: criteria.maxPrice }
  }
  if (criteria.maxDays) {
    where.durationDays = { lte: criteria.maxDays }
  }
  if (criteria.tourType?.length) {
    where.OR = criteria.tourType.map(type => ({
      tourType: { contains: type }
    }))
  }

  return prisma.tour.count({ where })
}

export default async function CollectionsPage() {
  const collections = await getCollections()
  const featuredCollections = collections.filter(c => c.featured)
  const otherCollections = collections.filter(c => !c.featured)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <SectionError name="Collections Hero">
        <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Compass className="h-6 w-6" />
                <span className="font-semibold uppercase tracking-wider">
                  Curated Collections
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Find Your Perfect Safari Adventure
              </h1>
              <p className="text-lg text-muted-foreground">
                Browse our hand-picked collections of tours designed for every type of traveler.
                From luxury escapes to budget-friendly options, we have the perfect safari waiting for you.
              </p>
            </div>
          </div>
        </section>
      </SectionError>

      {/* Featured Collections */}
      {featuredCollections.length > 0 && (
        <SectionError name="Featured Collections">
          <section className="py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold mb-8">Featured Collections</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredCollections.map((collection, index) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    index={index}
                    variant="featured"
                  />
                ))}
              </div>
            </div>
          </section>
        </SectionError>
      )}

      {/* All Collections */}
      {otherCollections.length > 0 && (
        <SectionError name="More Collections">
          <section className="py-12 sm:py-16 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold mb-8">More Collections</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {otherCollections.map((collection, index) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    index={index}
                    variant="default"
                  />
                ))}
              </div>
            </div>
          </section>
        </SectionError>
      )}
    </div>
  )
}
