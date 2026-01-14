"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { TourCard } from "@/components/tours/tour-card"
import { TourFilters, TourFiltersSidebar } from "@/components/tours/tour-filters"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"
import { Loader2, Map, Search, Compass, Filter, Grid3X3, List, Sparkles, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { SocialProofBanner } from "@/components/trust/social-proof-banner"

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
  rating?: number
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

function ToursGridSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) {
  return (
    <div className={cn(
      viewMode === "grid"
        ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
        : "flex flex-col gap-6"
    )}>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            "rounded-2xl border border-border/50 overflow-hidden bg-card",
            viewMode === "list" && "flex flex-row"
          )}
        >
          <div className={cn(
            viewMode === "grid" ? "aspect-[4/3]" : "w-72 h-52",
            "relative overflow-hidden"
          )}>
            <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
          </div>
          <div className="p-5 space-y-4 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between pt-4 border-t border-border/50">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ToursPageSkeleton() {
  return (
    <div className="pt-20">
      <div className="relative bg-gradient-to-br from-secondary via-secondary/90 to-primary/20 py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <Skeleton className="h-12 w-80" />
          <Skeleton className="h-6 w-96 mt-4" />
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-40" />
        </div>
        <ToursGridSkeleton />
      </div>
    </div>
  )
}

export default function ToursPage() {
  return (
    <Suspense fallback={<ToursPageSkeleton />}>
      <ToursContent />
    </Suspense>
  )
}

function ToursContent() {
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
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch tours when filters change (reset to page 1)
  useEffect(() => {
    const fetchTours = async () => {
      setIsLoading(true)
      setError(null)
      setCurrentPage(1)

      try {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", "1")
        const response = await fetch(`/api/tours?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch tours")
        }

        const data: ToursResponse = await response.json()
        setTours(data.tours)
        setPagination(data.pagination)
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching tours:", err)
        }
        setError("Failed to load tours. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTours()
  }, [searchParams])

  // Load more tours
  const handleLoadMore = async () => {
    if (isLoadingMore || !pagination.hasMore) return

    setIsLoadingMore(true)
    const nextPage = currentPage + 1

    try {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", nextPage.toString())
      const response = await fetch(`/api/tours?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch more tours")
      }

      const data: ToursResponse = await response.json()
      setTours(prev => [...prev, ...data.tours])
      setPagination(data.pagination)
      setCurrentPage(nextPage)
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error loading more tours:", err)
      }
      toast.error("Failed to load more tours")
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/tours?${params.toString()}`, { scroll: true })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="pt-20">
      {/* Premium Hero Header */}
      <div className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/30 py-12 sm:py-16 lg:py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-20 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-20 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          />
        </div>

        {/* Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <Compass className="h-4 w-4 text-accent" />
              <span className="text-white/90 text-sm font-medium">Discover Amazing Experiences</span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Explore{" "}
              <span className="relative">
                <span className="relative z-10 text-accent">Safari Tours</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-2 sm:h-3 bg-accent/30 -z-0 origin-left"
                />
              </span>
            </h1>

            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-white/80 max-w-2xl">
              Discover unforgettable safari experiences across East Africa. From
              wildlife safaris to gorilla trekking, find your perfect adventure.
            </p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 sm:mt-8 flex flex-wrap gap-6 sm:gap-8"
            >
              {[
                { value: "500+", label: "Tours" },
                { value: "50+", label: "Destinations" },
                { value: "10K+", label: "Happy Travelers" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Social Proof Banner */}
      <SocialProofBanner variant="compact" />

      {/* Filters and Results */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TourFilters />
        </motion.div>

        <div className="flex gap-6 lg:gap-8 mt-6 sm:mt-8">
          {/* Sidebar Filters (Desktop) */}
          <TourFiltersSidebar />

          {/* Results */}
          <div className="flex-1">
            {/* Results Count & View Toggle */}
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between mb-6"
              >
                <p className="text-muted-foreground">
                  {pagination.total === 0 ? (
                    "No tours found"
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-semibold text-foreground">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>
                      {" - "}
                      <span className="font-semibold text-foreground">
                        {Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )}
                      </span>
                      {" of "}
                      <span className="font-semibold text-foreground">
                        {pagination.total}
                      </span>{" "}
                      {pagination.total === 1 ? "tour" : "tours"}
                    </>
                  )}
                </p>

                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center rounded-lg border border-border/50 p-1 bg-muted/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0",
                        viewMode === "grid" && "bg-background shadow-sm"
                      )}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0",
                        viewMode === "list" && "bg-background shadow-sm"
                      )}
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Map View Button */}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                  >
                    <Link href="/tours/map">
                      <Map className="h-4 w-4 mr-2" />
                      Map View
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {isLoading && <ToursGridSkeleton viewMode={viewMode} />}

            {/* Error State */}
            {error && !isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 px-8 rounded-2xl bg-destructive/5 border border-destructive/20"
              >
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Search className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-destructive font-medium mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  Try again
                </Button>
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && !error && tours.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 px-8 rounded-2xl bg-muted/30 border border-border/50"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-20 w-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <Compass className="h-10 w-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">No tours found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We couldn&apos;t find any tours matching your criteria. Try adjusting your filters or search terms.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/tours")}
                  className="hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                >
                  Clear all filters
                </Button>
              </motion.div>
            )}

            {/* Tours Grid/List */}
            <AnimatePresence mode="wait">
              {!isLoading && !error && tours.length > 0 && (
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={cn(
                    viewMode === "grid"
                      ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                      : "flex flex-col gap-6"
                  )}>
                    {tours.map((tour, index) => (
                      <TourCard
                        key={tour.id}
                        tour={{
                          ...tour,
                          coverImage: tour.coverImage || "",
                          rating: tour.rating || 0,
                          reviewCount: tour._count.reviews,
                        }}
                        variant={viewMode === "list" ? "horizontal" : "default"}
                        index={index}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {pagination.hasMore && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-12 flex flex-col items-center gap-4"
                    >
                      <p className="text-sm text-muted-foreground">
                        Showing {tours.length} of {pagination.total} tours
                      </p>
                      <Button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        size="lg"
                        variant="outline"
                        className="min-w-[200px] h-12 rounded-xl border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            Load More Tours
                            <ChevronDown className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}

                  {/* Traditional Pagination (fallback) */}
                  {!pagination.hasMore && pagination.totalPages > 1 && tours.length < pagination.total && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-12"
                    >
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading More State */}
            {isLoading && tours.length > 0 && (
              <div className="flex justify-center items-center py-8">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm font-medium text-primary">Loading more tours...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      {!isLoading && tours.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-12 sm:py-16 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Need Help Choosing?</span>
            </motion.div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
              Can&apos;t decide? Let us help you find your perfect safari
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              Our travel experts are here to help you plan your dream African adventure.
            </p>
            <Button size="lg" className="h-12 px-6 sm:px-8 w-full sm:w-auto shadow-glow">
              <Link href="/contact">Talk to an Expert</Link>
            </Button>
          </div>
        </motion.section>
      )}
    </div>
  )
}
