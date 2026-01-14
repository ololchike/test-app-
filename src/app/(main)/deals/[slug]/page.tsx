import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Clock, Tag, Copy, Check, ArrowRight, Percent } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { defaultDeals } from "@/lib/data/deals"
import { TourCard } from "@/components/tours/tour-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CopyCodeButton } from "@/components/deals/copy-code-button"

interface DealDetailPageProps {
  params: Promise<{ slug: string }>
}

async function getDeal(slug: string) {
  try {
    // Try database first
    const dbDeal = await prisma.deal.findUnique({
      where: { slug },
    })

    if (dbDeal) {
      return dbDeal
    }

    // Fall back to default deals
    return defaultDeals.find(d => d.slug === slug) || null
  } catch (error) {
    console.error("Error fetching deal:", error)
    return defaultDeals.find(d => d.slug === slug) || null
  }
}

async function getApplicableTours(deal: { type: string; discountValue: number }) {
  // Get some featured/popular tours to show as applicable
  const tours = await prisma.tour.findMany({
    where: { status: "ACTIVE" },
    orderBy: [
      { featured: "desc" },
      { viewCount: "desc" },
    ],
    take: 8,
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
  })

  return tours.map(tour => {
    const avgRating = tour.reviews.length > 0
      ? tour.reviews.reduce((sum, r) => sum + r.rating, 0) / tour.reviews.length
      : 0

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
      tourType: JSON.parse(tour.tourType || "[]"),
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: tour._count.reviews,
      agent: tour.agent,
      featured: tour.featured,
      maxGroupSize: tour.maxGroupSize,
    }
  })
}

function getTimeRemaining(endDate: Date | string) {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return "Expired"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 7) return `${days} days remaining`
  if (days > 0) return `${days} days, ${hours} hours remaining`
  return `${hours} hours remaining`
}

function getDiscountDisplay(type: string, value: number) {
  switch (type) {
    case "PERCENTAGE_OFF":
    case "EARLY_BIRD":
    case "LAST_MINUTE":
    case "FLASH_SALE":
      return `${value}% OFF`
    case "FIXED_AMOUNT_OFF":
      return `$${value} OFF`
    case "SEASONAL":
      return "Special Offer"
    default:
      return `${value}% OFF`
  }
}

export async function generateMetadata({ params }: DealDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const deal = await getDeal(slug)

  if (!deal) {
    return { title: "Deal Not Found" }
  }

  return {
    title: `${deal.title} | SafariPlus Deals`,
    description: deal.description || `Get ${getDiscountDisplay(deal.type, deal.discountValue)} on safaris with this special offer.`,
  }
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const { slug } = await params
  const deal = await getDeal(slug)

  if (!deal) {
    notFound()
  }

  const tours = await getApplicableTours(deal)
  const timeRemaining = getTimeRemaining(deal.endDate)
  const discountDisplay = getDiscountDisplay(deal.type, deal.discountValue)
  const isExpired = timeRemaining === "Expired"

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-16">
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-3 border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <Link href="/deals" className="text-muted-foreground hover:text-primary transition-colors">
              Deals
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <span className="text-foreground font-medium">{deal.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative h-64 sm:h-80 overflow-hidden">
        <Image
          src={deal.coverImage || "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200"}
          alt={deal.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />

        {/* Discount Badge */}
        <div className="absolute top-6 right-6">
          <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg sm:text-xl">
            {discountDisplay}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="container mx-auto">
            {deal.badge && (
              <Badge variant="secondary" className="mb-3 bg-white/90">
                <Tag className="h-3 w-3 mr-1" />
                {deal.badge}
              </Badge>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {deal.title}
            </h1>
            <div className={`flex items-center gap-2 ${isExpired ? "text-red-300" : "text-white/90"}`}>
              <Clock className="h-5 w-5" />
              <span className="font-medium">{timeRemaining}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Deal Info */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Description */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl border border-border/50 p-6">
                <h2 className="text-xl font-bold mb-4">About This Offer</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {deal.description}
                </p>

                {deal.minBookingValue && (
                  <div className="mt-4 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm">
                      <span className="font-medium">Minimum booking value:</span>{" "}
                      ${deal.minBookingValue.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Coupon Code Card */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border/50 p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                    <Percent className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-red-600">{discountDisplay}</p>
                </div>

                {deal.couponCode && (
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground text-center mb-2">
                      Use this code at checkout:
                    </p>
                    <CopyCodeButton code={deal.couponCode} />
                  </div>
                )}

                <Button asChild size="lg" className="w-full" disabled={isExpired}>
                  <Link href="/tours">
                    Browse Eligible Tours
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                {isExpired && (
                  <p className="text-sm text-red-500 text-center mt-4">
                    This offer has expired
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Applicable Tours */}
      {tours.length > 0 && !isExpired && (
        <section className="py-8 sm:py-12 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Tours You Can Apply This Deal To</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tours.map((tour, index) => (
                <TourCard key={tour.id} tour={tour} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
