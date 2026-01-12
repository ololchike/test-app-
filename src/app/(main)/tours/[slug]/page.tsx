import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { TourDetailContent, TourDetailData } from "@/components/tours/tour-detail-content"
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

interface TourDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { slug } = await params

  // Fetch tour from database
  const tour = await getTour(slug)

  if (!tour) {
    notFound()
  }

  return (
    <div className="pt-16">
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/tours" className="hover:text-foreground">
              Tours
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/destinations/${tour.country.toLowerCase()}`} className="hover:text-foreground">
              {tour.country}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate">{tour.title}</span>
          </nav>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-4 gap-4 h-[400px] lg:h-[500px]">
          <div className="col-span-4 lg:col-span-2 relative rounded-xl overflow-hidden">
            <Image
              src={tour.images[0]}
              alt={tour.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="hidden lg:grid col-span-2 grid-cols-2 gap-4">
            {tour.images.slice(1, 5).map((image: string, index: number) => (
              <div key={index} className="relative rounded-xl overflow-hidden">
                <Image
                  src={image}
                  alt={`${tour.title} ${index + 2}`}
                  fill
                  className="object-cover"
                />
                {index === 3 && tour.images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      +{tour.images.length - 5} photos
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Client Component for Interactivity */}
      <TourDetailContent tour={tour} />
    </div>
  )
}
