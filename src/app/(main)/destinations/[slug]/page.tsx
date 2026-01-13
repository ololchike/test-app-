"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Clock, Star, ChevronLeft, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

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
  featured: boolean
  rating: number
  agent: {
    businessName: string
    isVerified: boolean
  }
  _count: {
    reviews: number
  }
}

// Destination metadata
const DESTINATIONS: Record<string, { name: string; description: string; image: string }> = {
  kenya: {
    name: "Kenya",
    description: "Experience the magic of the Masai Mara, witness the Great Migration, and explore diverse landscapes from savannas to beaches.",
    image: "/images/destinations/kenya.jpg",
  },
  tanzania: {
    name: "Tanzania",
    description: "Home to Mount Kilimanjaro, the Serengeti, and Zanzibar's pristine beaches. Discover Africa's most iconic wildlife destinations.",
    image: "/images/destinations/tanzania.jpg",
  },
  uganda: {
    name: "Uganda",
    description: "The Pearl of Africa offers gorilla trekking, chimpanzee encounters, and the source of the Nile.",
    image: "/images/destinations/uganda.jpg",
  },
  rwanda: {
    name: "Rwanda",
    description: "Known as the Land of a Thousand Hills, Rwanda offers unforgettable gorilla trekking and stunning mountain scenery.",
    image: "/images/destinations/rwanda.jpg",
  },
}

export default function DestinationPage() {
  const params = useParams()
  const slug = params.slug as string
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const destination = DESTINATIONS[slug.toLowerCase()] || {
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    description: `Explore amazing safari tours in ${slug}.`,
    image: "/images/placeholder-destination.jpg",
  }

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/tours?country=${destination.name}`)
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
  }, [destination.name])

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <div className="relative h-[250px] sm:h-[300px] md:h-[400px] bg-muted">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/tours">
              <Button variant="ghost" className="text-white mb-4 -ml-2">
                <ChevronLeft className="h-4 w-4 mr-1" />
                All Destinations
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
              {destination.name}
            </h1>
            <p className="text-base sm:text-lg text-white/90 max-w-2xl">
              {destination.description}
            </p>
          </div>
        </div>
      </div>

      {/* Tours Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">
              Tours in {destination.name}
            </h2>
            <p className="text-muted-foreground mt-1">
              {isLoading ? "Loading..." : `${tours.length} tours available`}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/tours?country=${destination.name}`}>
              View All
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No tours found</h3>
            <p className="text-muted-foreground mb-4">
              We don't have any tours in {destination.name} yet.
            </p>
            <Button asChild>
              <Link href="/tours">Browse All Tours</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <Card
                key={tour.id}
                className="overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <Link href={`/tours/${tour.slug}`}>
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={tour.coverImage || "/images/placeholder-tour.jpg"}
                      alt={tour.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {tour.featured && (
                      <Badge className="absolute top-2 left-2 bg-primary">
                        Featured
                      </Badge>
                    )}
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="bg-white text-foreground">
                        From ${tour.basePrice.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                </Link>

                <CardContent className="p-4">
                  <Link href={`/tours/${tour.slug}`}>
                    <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors">
                      {tour.title}
                    </h3>
                  </Link>

                  {tour.subtitle && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {tour.subtitle}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {tour.destination}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {tour.durationDays}D/{tour.durationNights}N
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-1">
                      {tour.rating > 0 ? (
                        <>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {tour.rating.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({tour._count.reviews})
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No reviews yet
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {tour.agent.businessName}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
