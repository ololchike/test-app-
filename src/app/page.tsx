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
} from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

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
      stats: [
        { value: totalBookings > 0 ? `${Math.floor(totalBookings / 100) * 100}+` : "100+", label: "Happy Travelers" },
        { value: `${totalTours}+`, label: "Safari Tours" },
        { value: `${totalAgents}+`, label: "Local Operators" },
        { value: avgRatingData._avg.rating ? avgRatingData._avg.rating.toFixed(1) : "4.9", label: "Average Rating" },
      ],
    }
  } catch (error) {
    console.error("Error fetching homepage data:", error)
    // Return fallback data
    return {
      featuredTours: [],
      destinations: [],
      testimonials: [],
      stats: [
        { value: "100+", label: "Happy Travelers" },
        { value: "50+", label: "Safari Tours" },
        { value: "20+", label: "Local Operators" },
        { value: "4.9", label: "Average Rating" },
      ],
    }
  }
}

export default async function HomePage() {
  const { featuredTours, destinations, testimonials, stats } = await getHomePageData()
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2070"
            alt="African Safari Landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-4 pt-20 lg:px-8">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-primary/90 text-primary-foreground hover:bg-primary">
              Discover East Africa
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your Gateway to
              <span className="text-primary"> Unforgettable</span> Safari
              Adventures
            </h1>
            <p className="mt-6 text-lg text-white/90 sm:text-xl">
              Connect with verified local operators for authentic experiences across
              Kenya, Tanzania, Uganda, and Rwanda. Book with confidence.
            </p>

            {/* Search Box */}
            <div className="mt-8 rounded-xl bg-white p-4 shadow-2xl sm:p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Where to?"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    When
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="date"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Travelers
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="2 Adults"
                        className="pl-9"
                      />
                    </div>
                    <Button size="icon" className="shrink-0">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 flex flex-wrap gap-6 sm:gap-10">
              {stats.map((stat) => (
                <div key={stat.label} className="text-white">
                  <div className="text-2xl font-bold sm:text-3xl">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b bg-muted/50 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Verified Operators</div>
                <div className="text-sm text-muted-foreground">Fully vetted partners</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">24/7 Support</div>
                <div className="text-sm text-muted-foreground">Always here to help</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Best Price</div>
                <div className="text-sm text-muted-foreground">Guaranteed value</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">5-Star Reviews</div>
                <div className="text-sm text-muted-foreground">Trusted by thousands</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Popular Destinations
              </h2>
              <p className="mt-2 text-muted-foreground">
                Explore the best safari destinations in East Africa
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/destinations">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((destination) => (
              <Link
                key={destination.name}
                href={`/destinations/${destination.name.toLowerCase().replace(" ", "-")}`}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="aspect-[4/5] relative">
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-sm text-white/80">{destination.country}</div>
                  <h3 className="text-xl font-semibold text-white">
                    {destination.name}
                  </h3>
                  <div className="mt-2 text-sm text-white/80">
                    {destination.tours} tours available
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Button variant="outline" asChild className="mt-8 w-full sm:hidden">
            <Link href="/destinations">
              View All Destinations <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Featured Safari Tours
              </h2>
              <p className="mt-2 text-muted-foreground">
                Handpicked adventures for unforgettable experiences
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/tours">
                Browse All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTours.length > 0 ? (
              featuredTours.map((tour) => (
                <Link key={tour.id} href={`/tours/${tour.slug}`}>
                  <Card className="group overflow-hidden h-full hover:shadow-lg transition-shadow">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={tour.image}
                        alt={tour.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {tour.badge && (
                        <Badge className="absolute left-3 top-3 bg-primary">
                          {tour.badge}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{tour.rating > 0 ? tour.rating : "New"}</span>
                        {tour.reviews > 0 && (
                          <span className="text-muted-foreground">
                            ({tour.reviews} reviews)
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {tour.title}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        {tour.location}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold">
                            ${tour.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            /person
                          </span>
                        </div>
                        <Badge variant="secondary">{tour.duration}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No featured tours available at the moment.</p>
                <Button variant="outline" asChild className="mt-4">
                  <Link href="/tours">Browse All Tours</Link>
                </Button>
              </div>
            )}
          </div>

          <Button variant="outline" asChild className="mt-8 w-full sm:hidden">
            <Link href="/tours">
              Browse All Tours <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How SafariPlus Works
            </h2>
            <p className="mt-2 text-muted-foreground">
              Book your dream safari in three simple steps
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                1
              </div>
              <h3 className="mt-4 text-xl font-semibold">Search & Compare</h3>
              <p className="mt-2 text-muted-foreground">
                Browse hundreds of safari tours from verified local operators.
                Compare prices, itineraries, and reviews.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                2
              </div>
              <h3 className="mt-4 text-xl font-semibold">Customize & Book</h3>
              <p className="mt-2 text-muted-foreground">
                Customize your tour with accommodation preferences and activities.
                Book securely with our protected payment system.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                3
              </div>
              <h3 className="mt-4 text-xl font-semibold">Experience & Enjoy</h3>
              <p className="mt-2 text-muted-foreground">
                Connect directly with your local operator. Enjoy 24/7 support
                throughout your unforgettable safari adventure.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/tours">
                Start Planning <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary py-16 text-secondary-foreground lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What Travelers Say
            </h2>
            <p className="mt-2 text-secondary-foreground/80">
              Real experiences from our community
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="bg-secondary-foreground/5 border-secondary-foreground/10"
              >
                <CardContent className="p-6">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-secondary-foreground/90">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-secondary-foreground/60">
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-secondary-foreground/60">
                    Tour: {testimonial.tour}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary p-8 text-white sm:p-12 lg:p-16">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready for Your Safari Adventure?
              </h2>
              <p className="mt-4 text-lg text-white/90">
                Join thousands of travelers who&apos;ve discovered the magic of
                East Africa with SafariPlus. Start planning your dream safari today.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                  asChild
                >
                  <Link href="/tours">Browse Tours</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/become-agent">Become an Agent</Link>
                </Button>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
