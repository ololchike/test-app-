import Link from "next/link"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { ChevronRight } from "lucide-react"
import { TourDetailContent, TourDetailData } from "@/components/tours/tour-detail-content"
import { TourCard } from "@/components/tours/tour-card"
import { TourStructuredData } from "@/components/seo/tour-structured-data"
import { TourGallery } from "@/components/tours/tour-gallery"
import { TourViewTracker } from "@/components/discovery/tour-view-tracker"
import { SectionError } from "@/components/error"
import { prisma } from "@/lib/prisma"

async function getTour(slug: string) {
  const tour = await prisma.tour.findUnique({
    where: { slug },
    include: {
      agent: {
        select: {
          id: true,
          businessName: true,
          description: true,
          isVerified: true,
          yearsInBusiness: true,
          toursConducted: true,
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
      itinerary: {
        orderBy: { dayNumber: "asc" },
      },
      accommodationOptions: {
        orderBy: { pricePerNight: "asc" },
      },
      activityAddons: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  })

  if (!tour || tour.status !== "ACTIVE") {
    return null
  }

  // Calculate average rating
  const avgRating = tour.reviews.length > 0
    ? tour.reviews.reduce((sum, r) => sum + r.rating, 0) / tour.reviews.length
    : 0

  // Transform JSON strings to arrays
  return {
    ...tour,
    highlights: JSON.parse(tour.highlights || "[]"),
    included: JSON.parse(tour.included || "[]"),
    excluded: JSON.parse(tour.excluded || "[]"),
    images: JSON.parse(tour.images || "[]"),
    tourType: JSON.parse(tour.tourType || "[]"),
    bestSeason: JSON.parse(tour.bestSeason || "[]"),
    itinerary: tour.itinerary.map((day) => ({
      ...day,
      meals: JSON.parse(day.meals || "[]"),
      activities: JSON.parse(day.activities || "[]"),
      availableAccommodationIds: JSON.parse(day.availableAccommodationIds || "[]"),
      availableAddonIds: JSON.parse(day.availableAddonIds || "[]"),
    })),
    accommodationOptions: tour.accommodationOptions.map((acc) => ({
      ...acc,
      images: JSON.parse(acc.images || "[]"),
      amenities: JSON.parse(acc.amenities || "[]"),
    })),
    activityAddons: tour.activityAddons.map((addon) => ({
      ...addon,
      images: JSON.parse(addon.images || "[]"),
      dayAvailable: JSON.parse(addon.dayAvailable || "[]"),
    })),
    reviews: tour.reviews.map((review) => ({
      id: review.id,
      user: review.user,
      rating: review.rating,
      title: review.title,
      content: review.content,
      images: JSON.parse(review.images || "[]") as string[],
      createdAt: review.createdAt.toISOString(),
      helpfulCount: review.helpfulCount,
      isVerified: review.isVerified,
      date: review.createdAt.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    })),
    // Extend agent with calculated fields
    agent: {
      ...tour.agent,
      rating: Math.round(avgRating * 10) / 10, // Use tour rating for now
      reviewCount: tour._count.reviews,
    },
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: tour._count.reviews,
  }
}

async function getSimilarTours(slug: string) {
  try {
    // Get current tour details
    const currentTour = await prisma.tour.findUnique({
      where: { slug, status: "ACTIVE" },
      select: {
        id: true,
        destination: true,
        country: true,
        tourType: true,
      },
    })

    if (!currentTour) return []

    // Find similar tours
    const similarTours = await prisma.tour.findMany({
      where: {
        AND: [
          { status: "ACTIVE" },
          { id: { not: currentTour.id } },
          {
            OR: [
              { destination: currentTour.destination },
              { country: currentTour.country },
            ],
          },
        ],
      },
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
      take: 12,
    })

    // Calculate rating and similarity score
    const toursWithScore = similarTours.map((tour) => {
      const avgRating =
        tour.reviews.length > 0
          ? tour.reviews.reduce((sum, r) => sum + r.rating, 0) / tour.reviews.length
          : 0

      const tourTypes = JSON.parse(tour.tourType as string) as string[]
      const currentTourTypes = JSON.parse(currentTour.tourType as string) as string[]

      // Calculate similarity score
      let score = 0
      if (tour.destination === currentTour.destination) score += 10
      if (tour.country === currentTour.country) score += 5

      const matchingTypes = tourTypes.filter(type => currentTourTypes.includes(type))
      score += matchingTypes.length * 2

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
        tourType: tourTypes,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: tour._count.reviews,
        agent: tour.agent,
        featured: tour.featured,
        similarityScore: score,
      }
    })

    // Sort by similarity score and take top 4
    return toursWithScore
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 4)
  } catch (error) {
    console.error("Error fetching similar tours:", error)
    return []
  }
}

interface TourDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: TourDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const tour = await getTour(slug)

  if (!tour) {
    return {
      title: "Tour Not Found",
      description: "The requested tour could not be found.",
    }
  }

  // Strip HTML from description
  const plainDescription = tour.description.replace(/<[^>]*>/g, "").substring(0, 160)

  return {
    title: `${tour.title} | SafariPlus`,
    description: plainDescription,
    keywords: [
      ...tour.tourType,
      tour.destination,
      tour.country,
      "safari",
      "tour",
      "travel",
      "Africa",
      "booking",
    ],
    openGraph: {
      title: tour.title,
      description: plainDescription,
      type: "website",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/tours/${slug}`,
      images: [
        {
          url: tour.images[0] || "",
          width: 1200,
          height: 630,
          alt: tour.title,
        },
      ],
      siteName: "SafariPlus",
    },
    twitter: {
      card: "summary_large_image",
      title: tour.title,
      description: plainDescription,
      images: [tour.images[0] || ""],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/tours/${slug}`,
    },
  }
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { slug } = await params

  // Fetch tour and similar tours from database
  const [tour, similarTours] = await Promise.all([
    getTour(slug),
    getSimilarTours(slug),
  ])

  if (!tour) {
    notFound()
  }

  return (
    <>
      <TourStructuredData tour={tour} slug={slug} />
      <TourViewTracker
        tour={{
          id: tour.id,
          slug: tour.slug,
          title: tour.title,
          destination: tour.destination,
          coverImage: tour.coverImage || tour.images[0] || "",
          basePrice: tour.basePrice,
        }}
      />
      <div className="pt-16">
        {/* Breadcrumb */}
        <div className="bg-gradient-to-r from-muted/50 to-transparent py-3 sm:py-4 border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs sm:text-sm overflow-x-auto">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <Link href="/tours" className="text-muted-foreground hover:text-primary transition-colors">
              Tours
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <Link href={`/destinations/${tour.country.toLowerCase()}`} className="text-muted-foreground hover:text-primary transition-colors">
              {tour.country}
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <span className="text-foreground font-medium truncate max-w-xs">{tour.title}</span>
          </nav>
        </div>
      </div>

      {/* Image Gallery */}
      <SectionError name="Image Gallery" minHeight="min-h-[300px]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <TourGallery images={tour.images} title={tour.title} />
        </div>
      </SectionError>

      {/* Main Content - Client Component for Interactivity */}
      <SectionError name="Tour Details" minHeight="min-h-[400px]">
        <TourDetailContent tour={tour} />
      </SectionError>

      {/* Similar Tours Section */}
      {similarTours.length > 0 && (
        <SectionError name="Similar Tours">
          <section className="py-12 sm:py-16 bg-gradient-to-b from-muted/30 to-transparent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-10">
                <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                  Discover More
                </span>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">
                  You might also like
                </h2>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                  Similar tours in {tour.destination} and nearby destinations
                </p>
              </div>

              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {similarTours.map((similarTour, index) => (
                  <TourCard key={similarTour.id} tour={similarTour} index={index} />
                ))}
              </div>
            </div>
          </section>
        </SectionError>
      )}
      </div>
    </>
  )
}
