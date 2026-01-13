import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Heart,
  MapPin,
  Clock,
  ArrowRight,
  DollarSign,
  Plane,
  Sparkles,
  TrendingUp,
  Star,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

async function getDashboardData(userId: string) {
  const now = new Date()

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      tour: {
        select: {
          title: true,
          slug: true,
          coverImage: true,
          destination: true,
        },
      },
      agent: {
        select: {
          businessName: true,
        },
      },
    },
    orderBy: { startDate: "asc" },
  })

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.startDate) >= now && b.status !== "CANCELLED"
  )
  const completedBookings = bookings.filter(
    (b) => new Date(b.endDate) < now || b.status === "COMPLETED"
  )
  const totalSpent = bookings
    .filter((b) => b.paymentStatus === "COMPLETED")
    .reduce((sum, b) => sum + b.totalAmount, 0)

  const nextTrip = upcomingBookings[0]
  const daysUntilNextTrip = nextTrip
    ? Math.ceil(
        (new Date(nextTrip.startDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null

  const lastCompletedTrip = completedBookings.sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
  )[0]

  // Get recommended tours (featured tours not yet booked)
  const bookedTourIds = bookings.map((b) => b.tourId)
  const recommendedTours = await prisma.tour.findMany({
    where: {
      status: "ACTIVE",
      id: { notIn: bookedTourIds },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      destination: true,
      coverImage: true,
      basePrice: true,
      durationDays: true,
      durationNights: true,
    },
    orderBy: { featured: "desc" },
    take: 3,
  })

  return {
    stats: {
      upcomingTrips: upcomingBookings.length,
      completedTrips: completedBookings.length,
      totalSpent,
      daysUntilNextTrip,
      lastTripDate: lastCompletedTrip?.endDate || null,
    },
    upcomingBookings: upcomingBookings.slice(0, 3),
    recommendedTours,
  }
}

export default async function DashboardPage() {
  const session = await auth()
  const firstName = session?.user?.name?.split(" ")[0] || "Traveler"

  const data = session?.user?.id
    ? await getDashboardData(session.user.id)
    : { stats: { upcomingTrips: 0, completedTrips: 0, totalSpent: 0, daysUntilNextTrip: null, lastTripDate: null }, upcomingBookings: [], recommendedTours: [] }

  const { stats, upcomingBookings, recommendedTours } = data

  // Get time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-secondary/95 to-primary/30 p-4 sm:p-6 lg:p-8 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 text-white/80 mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">{greeting}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-white/80 mt-2 max-w-xl text-sm sm:text-base">
            Here&apos;s what&apos;s happening with your safari adventures
          </p>

          {stats.daysUntilNextTrip && (
            <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm sm:text-base">
              <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              <span className="font-medium">
                Your next adventure is in <span className="text-accent font-bold">{stats.daysUntilNextTrip} days</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Upcoming Trips",
            value: stats.upcomingTrips,
            subtitle: stats.daysUntilNextTrip
              ? `Next trip in ${stats.daysUntilNextTrip} days`
              : "No upcoming trips",
            icon: Calendar,
            color: "primary",
            gradient: "from-primary/10 to-orange-500/10",
          },
          {
            title: "Completed Trips",
            value: stats.completedTrips,
            subtitle: stats.lastTripDate
              ? `Last trip: ${format(new Date(stats.lastTripDate), "MMM yyyy")}`
              : "No trips yet",
            icon: MapPin,
            color: "secondary",
            gradient: "from-secondary/10 to-emerald-500/10",
          },
          {
            title: "Total Spent",
            value: `$${stats.totalSpent.toLocaleString()}`,
            subtitle: "Lifetime value",
            icon: DollarSign,
            color: "accent",
            gradient: "from-accent/10 to-amber-500/10",
          },
          {
            title: "Saved Tours",
            value: "0",
            subtitle: "Wishlist items",
            icon: Heart,
            color: "rose",
            gradient: "from-rose-500/10 to-pink-500/10",
          },
        ].map((stat, index) => (
          <Card
            key={stat.title}
            className={cn(
              "border-border/50 overflow-hidden hover:shadow-premium transition-all duration-300",
              "animate-fade-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", stat.gradient)} />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                stat.color === "primary" && "bg-primary/10",
                stat.color === "secondary" && "bg-secondary/10",
                stat.color === "accent" && "bg-accent/10",
                stat.color === "rose" && "bg-rose-500/10",
              )}>
                <stat.icon className={cn(
                  "h-5 w-5",
                  stat.color === "primary" && "text-primary",
                  stat.color === "secondary" && "text-secondary",
                  stat.color === "accent" && "text-accent",
                  stat.color === "rose" && "text-rose-500",
                )} />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card className="border-border/50 hover:shadow-premium transition-all duration-300">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Trips
              </CardTitle>
              <CardDescription className="text-sm">Your scheduled safari adventures</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="hover:bg-primary/5 hover:text-primary w-full sm:w-auto">
              <Link href="/dashboard/bookings">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg">No upcoming trips</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-6">
                  Start planning your next adventure
                </p>
                <Button asChild className="shadow-glow">
                  <Link href="/tours">Browse Tours</Link>
                </Button>
              </div>
            ) : (
              upcomingBookings.map((booking, index) => (
                <Link
                  key={booking.id}
                  href={`/booking/confirmation/${booking.id}`}
                  className={cn(
                    "flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300",
                    "animate-fade-up"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-48 sm:h-20 w-full sm:w-28 rounded-lg overflow-hidden shrink-0 bg-muted">
                    {booking.tour.coverImage && (
                      <Image
                        src={booking.tour.coverImage}
                        alt={booking.tour.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold line-clamp-1 text-sm sm:text-base">
                        {booking.tour.title}
                      </h4>
                      <Badge
                        className={cn(
                          "shrink-0 text-xs",
                          booking.status === "CONFIRMED"
                            ? "bg-secondary/10 text-secondary border-secondary/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}
                      >
                        {booking.status === "CONFIRMED" ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {booking.agent.businessName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(booking.startDate), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
                        <Clock className="h-3 w-3" />
                        {booking.adults + booking.children} guests
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50 hover:shadow-premium transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TrendingUp className="h-5 w-5 text-accent" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-sm">Things you can do right now</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              {
                href: "/tours",
                icon: MapPin,
                iconBg: "bg-primary/10",
                iconColor: "text-primary",
                title: "Browse Tours",
                subtitle: "Discover new safari adventures",
              },
              {
                href: "/dashboard/wishlist",
                icon: Heart,
                iconBg: "bg-rose-500/10",
                iconColor: "text-rose-500",
                title: "View Wishlist",
                subtitle: "Save your favorite tours",
              },
              {
                href: "/dashboard/bookings",
                icon: Calendar,
                iconBg: "bg-blue-500/10",
                iconColor: "text-blue-500",
                title: "Manage Bookings",
                subtitle: "View and manage your trips",
              },
            ].map((action, index) => (
              <Button
                key={action.href}
                variant="outline"
                className={cn(
                  "justify-start h-auto py-4 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300",
                  "animate-fade-up"
                )}
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
                asChild
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-4">
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", action.iconBg)}>
                      <action.icon className={cn("h-6 w-6", action.iconColor)} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.subtitle}
                      </div>
                    </div>
                  </div>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Tours */}
      {recommendedTours.length > 0 && (
        <Card className="border-border/50 hover:shadow-premium transition-all duration-300">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Star className="h-5 w-5 text-amber-500" />
                Recommended for You
              </CardTitle>
              <CardDescription className="text-sm">
                Based on your interests and past trips
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="hover:bg-primary/5 hover:text-primary w-full sm:w-auto">
              <Link href="/tours">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedTours.map((tour, index) => (
                <Link
                  key={tour.id}
                  href={`/tours/${tour.slug}`}
                  className={cn(
                    "group block rounded-2xl border border-border/50 overflow-hidden hover:shadow-premium-lg hover:border-primary/30 transition-all duration-300",
                    "animate-fade-up"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {tour.coverImage && (
                      <Image
                        src={tour.coverImage}
                        alt={tour.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Badge className="absolute top-3 right-3 bg-white/90 text-foreground border-0 shadow-lg">
                      {tour.durationDays} Days
                    </Badge>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {tour.destination}
                    </div>
                    <h4 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">
                      {tour.title}
                    </h4>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">From</span>
                      <span className="font-bold text-xl text-gradient">${tour.basePrice.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
