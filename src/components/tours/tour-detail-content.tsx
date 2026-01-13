"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
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
  Calendar,
  Sun,
  Award,
  Sparkles,
  ChevronRight,
  Copy,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TourCustomizer, TourData } from "./tour-customizer"
import { InteractiveItinerary } from "./interactive-itinerary"
import { BookingCard } from "./booking-card"
import { ReviewStats } from "@/components/reviews/review-stats"
import { ReviewList } from "@/components/reviews/review-list"
import { TourReviewSection } from "@/components/reviews/tour-review-section"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Tour type for detail page
export interface TourDetailData {
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
      description: string | null
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
    images?: string[]
    createdAt?: string
    helpfulCount?: number
    isVerified?: boolean
  }[]
}

interface TourDetailContentProps {
  tour: TourDetailData
}

export function TourDetailContent({ tour }: TourDetailContentProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const bookNowButtonRef = useRef<HTMLButtonElement>(null)
  const [showFloatingButton, setShowFloatingButton] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // Check if tour is in wishlist on mount
  useEffect(() => {
    const checkWishlist = async () => {
      if (!session?.user) return
      try {
        const response = await fetch(`/api/client/wishlist/check?tourId=${tour.id}`)
        const data = await response.json()
        if (data.success) {
          setIsWishlisted(data.isWishlisted)
        }
      } catch (error) {
        console.error("Error checking wishlist:", error)
      }
    }
    checkWishlist()
  }, [session, tour.id])

  // Observe when the Book Now button in the card goes out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
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

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!session?.user) {
      toast.error("Please log in to save tours")
      router.push(`/login?callbackUrl=/tours/${tour.slug}`)
      return
    }

    setWishlistLoading(true)
    try {
      if (isWishlisted) {
        const response = await fetch(`/api/client/wishlist?tourId=${tour.id}`, {
          method: "DELETE",
        })
        const data = await response.json()
        if (data.success) {
          setIsWishlisted(false)
          toast.success("Removed from wishlist")
        } else {
          toast.error(data.error || "Failed to remove from wishlist")
        }
      } else {
        const response = await fetch("/api/client/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tourId: tour.id }),
        })
        const data = await response.json()
        if (data.success) {
          setIsWishlisted(true)
          toast.success("Added to wishlist")
        } else {
          toast.error(data.error || "Failed to add to wishlist")
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast.error("Something went wrong")
    } finally {
      setWishlistLoading(false)
    }
  }

  // Handle share
  const handleShare = async () => {
    const shareData = {
      title: tour.title,
      text: `Check out this amazing safari: ${tour.title} - ${tour.destination}`,
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        toast.success("Shared successfully!")
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== "AbortError") {
          // Fallback to copy link
          copyToClipboard()
        }
      }
    } else {
      // Fallback: copy link to clipboard
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard!")
  }

  // Handle contact
  const handleContact = () => {
    if (!session?.user) {
      toast.error("Please log in to contact the operator")
      router.push(`/login?callbackUrl=/tours/${tour.slug}`)
      return
    }
    // Navigate to messages with agent context
    router.push(`/dashboard/messages?agentId=${tour.agent.id}&tourId=${tour.id}`)
  }

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
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Tour Details */}
            <div className="flex-1 space-y-8">
              {/* Title and Quick Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {tour.tourType.map((type: string, i: number) => (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Badge
                        variant="secondary"
                        className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary border-0 hover:bg-primary/20 transition-colors"
                      >
                        {type}
                      </Badge>
                    </motion.div>
                  ))}
                  {tour.featured && (
                    <Badge className="bg-gradient-to-r from-primary to-orange-500 border-0 shadow-lg px-3 py-1">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {tour.title}
                </h1>
                {tour.subtitle && (
                  <p className="text-lg text-muted-foreground mt-2">{tour.subtitle}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-5">
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm"
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                    {tour.destination}, {tour.country}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm"
                  >
                    <Clock className="h-4 w-4 text-primary" />
                    {tour.durationDays} Days / {tour.durationNights} Nights
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm"
                  >
                    <Users className="h-4 w-4 text-primary" />
                    Max {tour.maxGroupSize} people
                  </motion.span>
                  {tour.rating > 0 && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-sm"
                    >
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{tour.rating}</span>
                      <span className="text-muted-foreground">
                        ({tour.reviewCount} reviews)
                      </span>
                    </motion.span>
                  )}
                </div>

                {/* Best Season */}
                {tour.bestSeason.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span>Best time to visit: <span className="font-medium text-foreground">{tour.bestSeason.join(", ")}</span></span>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="flex gap-3 mt-6"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-10 px-4 border-border/50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all",
                      isWishlisted && "bg-rose-50 text-rose-600 border-rose-200"
                    )}
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                  >
                    {wishlistLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Heart className={cn("h-4 w-4 mr-2", isWishlisted && "fill-current")} />
                    )}
                    {isWishlisted ? "Saved" : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-4 border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </motion.div>
              </motion.div>

              {/* Tabs Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                    {["overview", "itinerary", "accommodation", "reviews"].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary pb-3 capitalize font-medium transition-all"
                      >
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="overview" className="mt-8 space-y-10">
                    {/* Description */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <span className="h-8 w-1 bg-gradient-to-b from-primary to-accent rounded-full"></span>
                        About This Tour
                      </h2>
                      <div className="prose prose-lg max-w-none text-muted-foreground">
                        {tour.description.split("\n\n").map((paragraph: string, i: number) => (
                          <p key={i} className="leading-relaxed">{paragraph}</p>
                        ))}
                      </div>
                    </motion.div>

                    {/* Highlights */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <span className="h-8 w-1 bg-gradient-to-b from-primary to-accent rounded-full"></span>
                        Tour Highlights
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {tour.highlights.map((highlight: string, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 hover:border-primary/20 transition-colors"
                          >
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <Check className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{highlight}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Included / Excluded */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="grid sm:grid-cols-2 gap-8"
                    >
                      <Card className="border-green-200/50 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-900/10">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            What&apos;s Included
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {tour.included.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <ChevronRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-red-200/50 bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-900/10">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            What&apos;s Not Included
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {tour.excluded.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ChevronRight className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="itinerary" className="mt-8">
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

                  <TabsContent value="accommodation" className="mt-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <span className="h-8 w-1 bg-gradient-to-b from-primary to-accent rounded-full"></span>
                        Accommodation Options
                      </h2>
                      <p className="text-muted-foreground mb-8">
                        Choose your preferred accommodation for each night in the Itinerary tab. Below are all available options:
                      </p>
                      <div className="grid gap-6">
                        {tour.accommodationOptions.map((option, index) => (
                          <motion.div
                            key={option.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-premium-lg transition-all duration-300">
                              <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "mb-2",
                                        option.tier === "LUXURY" && "border-amber-400 text-amber-600 bg-amber-50",
                                        option.tier === "STANDARD" && "border-blue-400 text-blue-600 bg-blue-50",
                                        option.tier === "BUDGET" && "border-gray-400 text-gray-600 bg-gray-50"
                                      )}
                                    >
                                      {option.tier}
                                    </Badge>
                                    <CardTitle className="text-xl">{option.name}</CardTitle>
                                    {option.location && (
                                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {option.location}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-3xl font-bold text-gradient">
                                      ${option.pricePerNight}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      per night
                                    </p>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-4">
                                <p className="text-muted-foreground mb-4">
                                  {option.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {option.amenities.map((amenity: string) => (
                                    <Badge key={amenity} variant="secondary" className="bg-primary/5 text-primary/80 border-0">
                                      {amenity}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>

                      <h3 className="text-xl font-bold mt-12 mb-2 flex items-center gap-2">
                        <span className="h-6 w-1 bg-gradient-to-b from-accent to-secondary rounded-full"></span>
                        Optional Add-ons
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Add-ons are available on specific days. Check the Itinerary tab to see availability.
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {tour.activityAddons.map((addon, index) => (
                          <motion.div
                            key={addon.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                          >
                            <Card className="h-full border-border/50 hover:border-accent/30 hover:shadow-lg transition-all duration-300">
                              <CardContent className="pt-6">
                                <h4 className="font-bold text-lg">{addon.name}</h4>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {addon.description}
                                </p>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {addon.duration}
                                  </span>
                                  <span className="font-bold text-lg text-gradient">${addon.price}</span>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-8 space-y-10">
                    {/* Write a Review Section */}
                    <TourReviewSection
                      tourId={tour.id}
                      tourSlug={tour.slug}
                      tourTitle={tour.title}
                    />

                    {/* Review Stats */}
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

                    {/* Reviews List */}
                    <div>
                      <h3 className="text-xl font-bold mb-6">Customer Reviews</h3>
                      <ReviewList
                        tourSlug={tour.slug}
                        initialReviews={tour.reviews.map((review) => ({
                          id: review.id,
                          rating: review.rating,
                          title: review.title || undefined,
                          content: review.content,
                          images: review.images || [],
                          createdAt: review.createdAt || new Date().toISOString(),
                          helpfulCount: review.helpfulCount || 0,
                          isVerified: review.isVerified ?? true,
                          user: {
                            name: review.user.name || "Anonymous",
                            avatar: review.user.avatar || undefined,
                          },
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
              </motion.div>

              {/* Tour Operator Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="border-border/50 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-secondary/10 to-transparent">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-secondary" />
                      About the Tour Operator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                          {tour.agent.businessName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{tour.agent.businessName}</h3>
                          {tour.agent.isVerified && (
                            <Badge className="bg-secondary/10 text-secondary border-0 text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {tour.agent.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-semibold">
                              {tour.agent.rating}
                            </span>
                            <span className="text-muted-foreground">({tour.agent.reviewCount})</span>
                          </span>
                          {tour.agent.toursConducted && (
                            <span className="px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground">
                              {tour.agent.toursConducted}+ tours
                            </span>
                          )}
                          {tour.agent.yearsInBusiness && (
                            <span className="px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground">
                              {tour.agent.yearsInBusiness} years experience
                            </span>
                          )}
                        </div>
                        <div className="flex gap-3 mt-5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                            onClick={handleContact}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 border-border/50 hover:bg-secondary/5 hover:text-secondary hover:border-secondary/30"
                            asChild
                          >
                            <Link href={`/operators/${tour.agent.id}`}>View Profile</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Booking Card (Sticky) */}
            <div className="lg:w-96 shrink-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
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
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating Book Now Button */}
        <AnimatePresence>
          {showFloatingButton && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBooking}
                disabled={!bookingState.startDate || isLoading}
                className="group flex items-center gap-3 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-primary-foreground pl-5 pr-6 py-4 rounded-full shadow-2xl hover:shadow-glow transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {/* Price Badge */}
                <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold">
                  ${pricing.total.toLocaleString()}
                </span>

                {/* Button Text */}
                <span className="font-bold text-base">
                  {isLoading ? "Processing..." : "Book Now"}
                </span>

                {/* Arrow Icon */}
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        </>
      )}
    </TourCustomizer>
  )
}
