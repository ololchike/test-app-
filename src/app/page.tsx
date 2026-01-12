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
import { HeroSection } from "@/components/home/hero-section"
import { TrustIndicators } from "@/components/home/trust-indicators"
import { FeaturedDestinations } from "@/components/home/featured-destinations"
import { FeaturedTours } from "@/components/home/featured-tours"
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

    return {
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
  const { featuredTours, destinations, testimonials, stats } = await getHomePageData()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <HeroSection stats={stats} />

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* Featured Destinations */}
      <FeaturedDestinations destinations={destinations} />

      {/* Featured Tours */}
      <FeaturedTours tours={featuredTours} />

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials testimonials={testimonials} />

      {/* CTA Section */}
      <CTASection />

      <Footer />
    </div>
  )
}
