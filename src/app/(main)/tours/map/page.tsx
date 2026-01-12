"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import {
  MapPin,
  Clock,
  Star,
  List,
  Map as MapIcon,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamic import for map component (client-side only)
const TourMap = dynamic(
  () => import("@/components/tours/tour-map").then((mod) => mod.TourMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
)

interface Tour {
  id: string
  slug: string
  title: string
  subtitle: string | null
  coverImage: string | null
  destination: string
  country: string
  durationDays: number
  durationNights: number
  basePrice: number
  currency: string
  tourType: string[]
  latitude: number | null
  longitude: number | null
  rating: number | null
  reviewCount: number
}

function MapSearchContent() {
  const searchParams = useSearchParams()
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null)
  const [showList, setShowList] = useState(true)
  const [filters, setFilters] = useState({
    country: searchParams.get("country") || "",
    tourType: searchParams.get("type") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  })

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        params.set("hasLocation", "true")
        if (filters.country && filters.country !== "all") params.set("country", filters.country)
        if (filters.tourType && filters.tourType !== "all") params.set("tourType", filters.tourType)
        if (filters.minPrice) params.set("minPrice", filters.minPrice)
        if (filters.maxPrice) params.set("maxPrice", filters.maxPrice)

        const response = await fetch(`/api/tours?${params.toString()}`)
        const data = await response.json()
        if (data.tours) {
          setTours(data.tours)
        }
      } catch (error) {
        console.error("Error fetching tours:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTours()
  }, [filters])

  const selectedTour = tours.find((t) => t.id === selectedTourId)
  const toursWithLocation = tours.filter((t) => t.latitude && t.longitude)

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link href="/tours">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Tours
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Explore Tours on Map</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Filters Sheet for Mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Tours</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">Country</label>
                    <Select
                      value={filters.country}
                      onValueChange={(v) =>
                        setFilters((prev) => ({ ...prev, country: v }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All countries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All countries</SelectItem>
                        <SelectItem value="Kenya">Kenya</SelectItem>
                        <SelectItem value="Tanzania">Tanzania</SelectItem>
                        <SelectItem value="Uganda">Uganda</SelectItem>
                        <SelectItem value="Rwanda">Rwanda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tour Type</label>
                    <Select
                      value={filters.tourType}
                      onValueChange={(v) =>
                        setFilters((prev) => ({ ...prev, tourType: v }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="SAFARI">Safari</SelectItem>
                        <SelectItem value="BEACH">Beach</SelectItem>
                        <SelectItem value="MOUNTAIN">Mountain</SelectItem>
                        <SelectItem value="CULTURAL">Cultural</SelectItem>
                        <SelectItem value="ADVENTURE">Adventure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Min Price</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.minPrice}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            minPrice: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Max Price</label>
                      <Input
                        type="number"
                        placeholder="Any"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            maxPrice: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-2">
              <Select
                value={filters.country}
                onValueChange={(v) =>
                  setFilters((prev) => ({ ...prev, country: v }))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="Tanzania">Tanzania</SelectItem>
                  <SelectItem value="Uganda">Uganda</SelectItem>
                  <SelectItem value="Rwanda">Rwanda</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.tourType}
                onValueChange={(v) =>
                  setFilters((prev) => ({ ...prev, tourType: v }))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tour Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="SAFARI">Safari</SelectItem>
                  <SelectItem value="BEACH">Beach</SelectItem>
                  <SelectItem value="MOUNTAIN">Mountain</SelectItem>
                  <SelectItem value="CULTURAL">Cultural</SelectItem>
                  <SelectItem value="ADVENTURE">Adventure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* List Toggle */}
            <Button
              variant={showList ? "default" : "outline"}
              size="sm"
              onClick={() => setShowList(!showList)}
              className="hidden md:flex"
            >
              {showList ? (
                <>
                  <MapIcon className="h-4 w-4 mr-2" />
                  Full Map
                </>
              ) : (
                <>
                  <List className="h-4 w-4 mr-2" />
                  Show List
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tour List Sidebar */}
        {showList && (
          <div className="w-full md:w-96 border-r bg-background overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-background z-10">
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? "Loading..."
                  : `${toursWithLocation.length} tours with location`}
              </p>
            </div>

            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : toursWithLocation.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tours with location data found</p>
                <p className="text-sm mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="divide-y">
                {toursWithLocation.map((tour) => (
                  <button
                    key={tour.id}
                    onClick={() =>
                      setSelectedTourId(
                        tour.id === selectedTourId ? null : tour.id
                      )
                    }
                    className={`w-full text-left p-4 hover:bg-accent transition-colors ${
                      selectedTourId === tour.id ? "bg-accent" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="relative h-20 w-28 flex-shrink-0 rounded-md overflow-hidden">
                        <Image
                          src={
                            tour.coverImage || "/images/placeholder-tour.jpg"
                          }
                          alt={tour.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-1">
                          {tour.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {tour.destination}, {tour.country}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tour.durationDays}D/{tour.durationNights}N
                          </span>
                          {tour.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {tour.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-sm">
                            ${tour.basePrice.toLocaleString()}
                          </span>
                          <Link
                            href={`/tours/${tour.slug}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Badge variant="secondary" className="text-xs">
                              View
                            </Badge>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          <TourMap
            tours={toursWithLocation}
            isLoading={isLoading}
            selectedTourId={selectedTourId}
            onTourSelect={setSelectedTourId}
          />
        </div>
      </div>

      {/* Mobile Tour Preview */}
      {selectedTour && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-[1001]">
          <button
            className="absolute top-2 right-2"
            onClick={() => setSelectedTourId(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex gap-3">
            <div className="relative h-20 w-28 flex-shrink-0 rounded-md overflow-hidden">
              <Image
                src={selectedTour.coverImage || "/images/placeholder-tour.jpg"}
                alt={selectedTour.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-1">
                {selectedTour.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selectedTour.destination}, {selectedTour.country}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold">
                  ${selectedTour.basePrice.toLocaleString()}
                </span>
                <Button asChild size="sm">
                  <Link href={`/tours/${selectedTour.slug}`}>View Tour</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
    </div>
  )
}

export default function ToursMapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <MapSearchContent />
    </Suspense>
  )
}
