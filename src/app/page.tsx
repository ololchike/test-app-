import Link from "next/link"
import Image from "next/image"
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  Shield,
  Clock,
  Award,
  ArrowRight,
  ChevronRight,
  Play,
  Sparkles,
} from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { SectionError } from "@/components/error"
import { HeroSection } from "@/components/home/hero-section"
import { TrustIndicators } from "@/components/home/trust-indicators"
import { TrustBadges } from "@/components/trust/trust-badges"
import { SocialProofBanner } from "@/components/trust/social-proof-banner"
import { MpesaHeroBanner } from "@/components/trust/mpesa-hero-banner"
import { GuaranteesSection } from "@/components/trust/guarantees-section"
import { RecentlyViewed } from "@/components/discovery/recently-viewed"
import { FeaturedDestinations } from "@/components/home/featured-destinations"
import { FeaturedTours } from "@/components/home/featured-tours"
import { FeaturedCollections } from "@/components/collections"
import { defaultCollections } from "@/lib/data/collections"
import { FeaturedDeals } from "@/components/deals"
import { defaultDeals } from "@/lib/data/deals"
import { HowItWorks } from "@/components/home/how-it-works"
import { Testimonials } from "@/components/home/testimonials"
import { CTASection } from "@/components/home/cta-section"

// Destination images mapping
const destinationImages: Record<string, string> = {
  "masai mara": "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=500",
  "serengeti": "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=500",
  "bwindi": "https://images.unsplash.com/photo-1521651201144-634f700b36ef?q=80&w=500",
  "volcanoes": "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=500",
  "amboseli": "https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=500",
  "ngorongoro": "https://images.unsplash.com/photo-1534177616064-ef61e1f28faf?q=80&w=500",
  "zanzibar": "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=500",
}

async function getHomePageData() {
  try {
    // Fetch featured tours
    const featuredTours = await prisma.tour.findMany({
      where: {
        status: "ACTIVE",
        featured: true,
      },
      orderBy: [
        { viewCount: "desc" },
        { createdAt: "desc" },
      ],
      take: 4,
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
          select: {
            reviews: true,
            bookings: true,
          },
        },
      },
    })

    // Get popular destinations with tour counts
    const destinationsData = await prisma.tour.groupBy({
      by: ["destination", "country"],
      where: {
        status: "ACTIVE",
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 4,
    })

    // Get real reviews for testimonials
    const reviews = await prisma.review.findMany({
      where: {
        isApproved: true,
        rating: 5,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
        tour: {
          select: {
            title: true,
          },
        },
      },
    })

    // Calculate stats
    const [totalBookings, totalTours, totalAgents, avgRatingData] = await Promise.all([
      prisma.booking.count({
        where: {
          status: {
            in: ["CONFIRMED", "PAID", "IN_PROGRESS", "COMPLETED"],
          },
        },
      }),
      prisma.tour.count({
        where: {
          status: "ACTIVE",
        },
      }),
      prisma.agent.count({
        where: {
          isVerified: true,
        },
      }),
      prisma.review.aggregate({
        where: {
          isApproved: true,
        },
        _avg: {
          rating: true,
        },
      }),
    ])

    // Get featured collections with tour counts
    const featuredCollectionsData = defaultCollections.filter(c => c.featured).slice(0, 6)
    const collectionsWithCounts = await Promise.all(
      featuredCollectionsData.map(async (collection) => {
        const where: Record<string, unknown> = { status: "ACTIVE" }
        if (collection.filterCriteria.country?.length) {
          where.country = { in: collection.filterCriteria.country }
        }
        if (collection.filterCriteria.maxPrice) {
          where.basePrice = { lte: collection.filterCriteria.maxPrice }
        }
        if (collection.filterCriteria.tourType?.length) {
          where.OR = collection.filterCriteria.tourType.map(type => ({
            tourType: { contains: type }
          }))
        }
        const tourCount = await prisma.tour.count({ where })
        return { ...collection, tourCount }
      })
    )

    // Get featured deals (filter active ones)
    const now = new Date()
    const featuredDealsData = defaultDeals.filter(d => d.featured && new Date(d.endDate) >= now).slice(0, 3)

    return {
      collections: collectionsWithCounts,
      deals: featuredDealsData,
      featuredTours: featuredTours.map((tour) => {
        const avgRating = tour.reviews.length > 0
          ? Math.round((tour.reviews.reduce((sum, r) => sum + r.rating, 0) / tour.reviews.length) * 10) / 10
          : 0

        return {
          id: tour.id,
          slug: tour.slug,
          title: tour.title,
          location: tour.destination,
          image: tour.coverImage || (JSON.parse(tour.images || "[]")[0]) || "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=600",
          price: tour.basePrice,
          rating: avgRating,
          reviews: tour._count.reviews,
          duration: `${tour.durationDays} Day${tour.durationDays > 1 ? "s" : ""}`,
          badge: tour.viewCount > 100 ? "Best Seller" : tour.featured ? "Featured" : null,
          maxGroupSize: tour.maxGroupSize,
        }
      }),
      destinations: destinationsData.map((dest) => {
        const destName = dest.destination.toLowerCase()
        const imageKey = Object.keys(destinationImages).find((key) => destName.includes(key))

        return {
          name: dest.destination,
          country: dest.country,
          image: imageKey ? destinationImages[imageKey] : "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=500",
          tours: dest._count.id,
        }
      }),
      testimonials: reviews.map((review) => ({
        name: review.user.name || "Anonymous",
        location: "Verified Customer",
        image: review.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.name || "U")}&background=random`,
        rating: review.rating,
        text: review.content,
        tour: review.tour.title,
      })),
      stats: {
        travelers: totalBookings > 0 ? `${Math.floor(totalBookings / 100) * 100}+` : "100+",
        tours: `${totalTours}+`,
        operators: `${totalAgents}+`,
        rating: avgRatingData._avg.rating ? avgRatingData._avg.rating.toFixed(1) : "4.9",
      },
    }
  } catch (error) {
    console.error("Error fetching homepage data:", error)
    // Return fallback data
    return {
      collections: defaultCollections.filter(c => c.featured).slice(0, 6).map(c => ({ ...c, tourCount: 0 })),
      deals: defaultDeals.filter(d => d.featured).slice(0, 3),
      featuredTours: [],
      destinations: [],
      testimonials: [],
      stats: {
        travelers: "100+",
        tours: "50+",
        operators: "20+",
        rating: "4.9",
      },
    }
  }
}

export default async function HomePage() {
  const { collections, deals, featuredTours, destinations, testimonials, stats } = await getHomePageData()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <SectionError name="Hero">
        <HeroSection stats={stats} />
      </SectionError>

      {/* M-Pesa Hero Banner */}
      <SectionError name="M-Pesa Banner">
        <MpesaHeroBanner variant="full" />
      </SectionError>

      {/* Trust Badges - KATO, TATO, Payment Methods */}
      <SectionError name="Trust Badges">
        <TrustBadges variant="full" />
      </SectionError>

      {/* Social Proof - Live Stats */}
      <SectionError name="Social Proof">
        <SocialProofBanner variant="full" />
      </SectionError>

      {/* Trust Indicators */}
      <SectionError name="Trust Indicators">
        <TrustIndicators />
      </SectionError>

      {/* Featured Destinations */}
      <SectionError name="Featured Destinations">
        <FeaturedDestinations destinations={destinations} />
      </SectionError>

      {/* Curated Collections */}
      <SectionError name="Collections">
        <FeaturedCollections collections={collections} />
      </SectionError>

      {/* Featured Tours */}
      <SectionError name="Featured Tours">
        <FeaturedTours tours={featuredTours} />
      </SectionError>

      {/* Deals & Offers */}
      <SectionError name="Deals">
        <FeaturedDeals deals={deals} />
      </SectionError>

      {/* Recently Viewed Tours */}
      <SectionError name="Recently Viewed">
        <RecentlyViewed variant="horizontal" />
      </SectionError>

      {/* How It Works */}
      <SectionError name="How It Works">
        <HowItWorks />
      </SectionError>

      {/* Testimonials */}
      <SectionError name="Testimonials">
        <Testimonials testimonials={testimonials} />
      </SectionError>

      {/* Guarantees */}
      <SectionError name="Guarantees">
        <GuaranteesSection variant="full" />
      </SectionError>

      {/* CTA Section */}
      <SectionError name="CTA">
        <CTASection />
      </SectionError>

      <Footer />
    </div>
  )
}
