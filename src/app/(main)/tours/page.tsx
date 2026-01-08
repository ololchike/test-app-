"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { TourCard } from "@/components/tours/tour-card"
import { TourFilters, TourFiltersSidebar } from "@/components/tours/tour-filters"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"
import { Loader2 } from "lucide-react"

interface Tour {
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
  featured: boolean
  agent: {
    businessName: string
    isVerified: boolean
  }
  _count: {
    reviews: number
  }
}

interface ToursResponse {
  tours: Tour[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

function ToursGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-xl border overflow-hidden">
          <Skeleton className="aspect-[4/3]" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between pt-3 border-t">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ToursPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tours, setTours] = useState<Tour[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasMore: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTours = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams(searchParams.toString())
        const response = await fetch(`/api/tours?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch tours")
        }

        const data: ToursResponse = await response.json()
        setTours(data.tours)
        setPagination(data.pagination)
      } catch (err) {
        console.error("Error fetching tours:", err)
        setError("Failed to load tours. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTours()
  }, [searchParams])

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/tours?${params.toString()}`, { scroll: true })

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="pt-20">
      {/* Hero Header */}
      <div className="bg-muted/50 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Explore Safari Tours
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Discover unforgettable safari experiences across East Africa. From
            wildlife safaris to gorilla trekking, find your perfect adventure.
          </p>
        </div>
      </div>

      {/* Filters and Results */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <TourFilters />

        <div className="flex gap-8 mt-8">
          {/* Sidebar Filters (Desktop) */}
          <TourFiltersSidebar />

          {/* Results */}
          <div className="flex-1">
            {/* Results Count */}
            {!isLoading && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {pagination.total === 0 ? (
                    "No tours found"
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-medium text-foreground">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>
                      {" - "}
                      <span className="font-medium text-foreground">
                        {Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )}
                      </span>
                      {" of "}
                      <span className="font-medium text-foreground">
                        {pagination.total}
                      </span>{" "}
                      {pagination.total === 1 ? "tour" : "tours"}
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && <ToursGridSkeleton />}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && tours.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-2">
                  No tours found matching your criteria
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}

            {/* Tours Grid */}
            {!isLoading && !error && tours.length > 0 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {tours.map((tour) => (
                    <TourCard
                      key={tour.id}
                      tour={{
                        ...tour,
                        coverImage: tour.coverImage || "",
                        rating: 4.8, // TODO: Calculate from actual reviews
                        reviewCount: tour._count.reviews,
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}

            {/* Loading More State */}
            {isLoading && tours.length > 0 && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
