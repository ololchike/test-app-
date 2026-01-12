"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import {
  MapPin,
  Clock,
  Users,
  Star,
  Check,
  X,
  Shield,
  Heart,
  Share2,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TourCustomizer, TourData } from "./tour-customizer"
import { InteractiveItinerary } from "./interactive-itinerary"
import { BookingCard } from "./booking-card"
import { ReviewStats } from "@/components/reviews/review-stats"
import { ReviewList } from "@/components/reviews/review-list"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TourDetailContentProps {
  tour: {
    id: string
    slug: string
    title: string
    subtitle: string | null
    description: string
    destination: string
    country: string
    difficulty: string | null
    coverImage: string | null
    basePrice: number
    durationDays: number
    durationNights: number
    maxGroupSize: number
    images: string[]
    tourType: string[]
    bestSeason: string[]
    featured: boolean
    highlights: string[]
    included: string[]
    excluded: string[]
    rating: number
    reviewCount: number
    itinerary: {
      id: string
      dayNumber: number
      title: string
      description: string
      location: string | null
      meals: string[]
      activities: string[]
      overnight: string | null
      availableAccommodationIds: string[]
      defaultAccommodationId: string | null
      availableAddonIds: string[]
    }[]
    accommodationOptions: {
      id: string
      tier: string
      name: string
      description: string | null
      pricePerNight: number
      images: string[]
      amenities: string[]
      location: string | null
      rating: number | null
    }[]
    activityAddons: {
      id: string
      name: string
      description: string
      price: number
      duration: string | null
      images: string[]
      dayAvailable: number[]
    }[]
    agent: {
      id: string
      businessName: string
      description: string | null
      isVerified: boolean
      yearsInBusiness: number | null
      toursConducted: number | null
      rating: number
      reviewCount: number
    }
    reviews: {
      id: string
      user: { name: string | null; avatar: string | null }
      rating: number
      title: string | null
      content: string
      date: string
    }[]
  }
}

export function TourDetailContent({ tour }: TourDetailContentProps) {
  const bookNowButtonRef = useRef<HTMLButtonElement>(null)
  const [showFloatingButton, setShowFloatingButton] = useState(false)

  // Observe when the Book Now button in the card goes out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show floating button when the card's Book Now button is NOT visible
        setShowFloatingButton(!entry.isIntersecting)
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0,
      }
    )

    if (bookNowButtonRef.current) {
      observer.observe(bookNowButtonRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Prepare tour data for TourCustomizer
  const tourData: TourData = {
    id: tour.id,
    slug: tour.slug,
    title: tour.title,
    basePrice: tour.basePrice,
    durationDays: tour.durationDays,
    durationNights: tour.durationNights,
    maxGroupSize: tour.maxGroupSize,
    itinerary: tour.itinerary,
    accommodationOptions: tour.accommodationOptions,
    activityAddons: tour.activityAddons,
  }

  return (
    <TourCustomizer tour={tourData}>
      {({
        bookingState,
        pricing,
        updateAccommodation,
        toggleAddon,
        setAdults,
        setChildren,
        setStartDate,
        handleBooking,
        isLoading,
        endDate,
      }) => (
        <>
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Tour Details */}
            <div className="flex-1 space-y-8">
              {/* Title and Quick Info */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tour.tourType.map((type: string) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                  {tour.featured && <Badge className="bg-primary">Featured</Badge>}
                </div>
                <h1 className="text-3xl font-bold tracking-tight">{tour.title}</h1>
                {tour.subtitle && (
                  <p className="text-lg text-muted-foreground mt-1">{tour.subtitle}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {tour.destination}, {tour.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {tour.durationDays} Days / {tour.durationNights} Nights
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Max {tour.maxGroupSize} people
                  </span>
                  {tour.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{tour.rating}</span>
                      <span className="text-muted-foreground">
                        ({tour.reviewCount} reviews)
                      </span>
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="itinerary"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Itinerary
                  </TabsTrigger>
                  <TabsTrigger
                    value="accommodation"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Accommodation
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Reviews
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  {/* Description */}
                  <div>
                    <h2 className="text-xl font-semibold mb-3">About This Tour</h2>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      {tour.description.split("\n\n").map((paragraph: string, i: number) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Highlights</h2>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {tour.highlights.map((highlight: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Included / Excluded */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        What&apos;s Included
                      </h3>
                      <ul className="space-y-2">
                        {tour.included.map((item: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <X className="h-5 w-5 text-red-500" />
                        What&apos;s Not Included
                      </h3>
                      <ul className="space-y-2">
                        {tour.excluded.map((item: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="itinerary" className="mt-6">
                  <InteractiveItinerary
                    itinerary={tour.itinerary}
                    accommodationOptions={tour.accommodationOptions}
                    activityAddons={tour.activityAddons}
                    bookingState={bookingState}
                    onAccommodationChange={updateAccommodation}
                    onAddonToggle={toggleAddon}
                    durationDays={tour.durationDays}
                  />
                </TabsContent>

                <TabsContent value="accommodation" className="mt-6">
                  <h2 className="text-xl font-semibold mb-6">
                    Accommodation Options
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Choose your preferred accommodation for each night in the Itinerary tab. Below are all available options:
                  </p>
                  <div className="grid gap-4">
                    {tour.accommodationOptions.map((option) => (
                      <Card key={option.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="outline">{option.tier}</Badge>
                              <CardTitle className="mt-2">{option.name}</CardTitle>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                ${option.pricePerNight}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                per night
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-3">
                            {option.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {option.amenities.map((amenity: string) => (
                              <Badge key={amenity} variant="secondary">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold mt-8 mb-4">
                    Optional Add-ons
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Add-ons are available on specific days. Check the Itinerary tab to see availability and add them to your booking.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tour.activityAddons.map((addon) => (
                      <Card key={addon.id}>
                        <CardContent className="pt-6">
                          <h4 className="font-semibold">{addon.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {addon.description}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm text-muted-foreground">
                              {addon.duration}
                            </span>
                            <span className="font-bold">${addon.price}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <ReviewStats
                    averageRating={tour.rating}
                    totalReviews={tour.reviewCount}
                    ratingBreakdown={{
                      5: 0,
                      4: 0,
                      3: 0,
                      2: 0,
                      1: 0,
                    }}
                  />
                  <div className="mt-6">
                    <ReviewList
                      tourSlug={tour.slug}
                      initialReviews={tour.reviews.map((review) => ({
                        ...review,
                        createdAt: new Date().toISOString(),
                        helpfulCount: 0,
                        isVerified: true,
                      }))}
                      initialMeta={{
                        total: tour.reviewCount,
                        totalPages: Math.ceil(tour.reviewCount / 10),
                        page: 1,
                      }}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Tour Operator Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Tour Operator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                        {tour.agent.businessName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{tour.agent.businessName}</h3>
                        {tour.agent.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tour.agent.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-foreground">
                            {tour.agent.rating}
                          </span>
                          ({tour.agent.reviewCount} reviews)
                        </span>
                        {tour.agent.toursConducted && (
                          <span>{tour.agent.toursConducted}+ tours</span>
                        )}
                        {tour.agent.yearsInBusiness && (
                          <span>{tour.agent.yearsInBusiness} years</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/agents/${tour.agent.id}`}>View Profile</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Booking Card (Sticky) */}
            <div className="lg:w-96 shrink-0">
              <BookingCard
                basePrice={tour.basePrice}
                durationNights={tour.durationNights}
                maxGroupSize={tour.maxGroupSize}
                bookingState={bookingState}
                pricing={pricing}
                activityAddons={tour.activityAddons}
                onAdultsChange={setAdults}
                onChildrenChange={setChildren}
                onStartDateChange={setStartDate}
                onAddonToggle={toggleAddon}
                onBooking={handleBooking}
                isLoading={isLoading}
                endDate={endDate}
                bookNowButtonRef={bookNowButtonRef}
              />
            </div>
          </div>
        </div>

        {/* Floating Book Now Button - shows when card's Book Now button is out of view */}
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
            showFloatingButton
              ? "translate-y-0 opacity-100"
              : "translate-y-16 opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={handleBooking}
            disabled={!bookingState.startDate || isLoading}
            className="group flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground pl-5 pr-6 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {/* Price Badge */}
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
              ${pricing.total.toLocaleString()}
            </span>

            {/* Button Text */}
            <span className="font-semibold text-base">
              {isLoading ? "Processing..." : "Book Now"}
            </span>

            {/* Arrow Icon */}
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        </>
      )}
    </TourCustomizer>
  )
}
