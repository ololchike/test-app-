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
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"

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

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your safari adventures
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Trips
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingTrips}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.daysUntilNextTrip
                ? `Next trip in ${stats.daysUntilNextTrip} days`
                : "No upcoming trips"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Trips
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTrips}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.lastTripDate
                ? `Last trip: ${format(new Date(stats.lastTripDate), "MMM yyyy")}`
                : "No trips yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saved Tours
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Wishlist items
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Trips</CardTitle>
              <CardDescription>Your scheduled safari adventures</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/bookings">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold">No upcoming trips</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start planning your next adventure
                </p>
                <Button asChild>
                  <Link href="/tours">Browse Tours</Link>
                </Button>
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/booking/confirmation/${booking.id}`}
                  className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="relative h-20 w-28 rounded-md overflow-hidden shrink-0 bg-muted">
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
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {booking.tour.title}
                      </h4>
                      <Badge
                        variant={
                          booking.status === "CONFIRMED" ? "default" : "secondary"
                        }
                        className="shrink-0"
                      >
                        {booking.status === "CONFIRMED" ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {booking.agent.businessName}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(booking.startDate), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
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
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Things you can do right now</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link href="/tours">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Browse Tours</div>
                    <div className="text-xs text-muted-foreground">
                      Discover new safari adventures
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link href="/dashboard/wishlist">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-rose-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">View Wishlist</div>
                    <div className="text-xs text-muted-foreground">
                      Save your favorite tours
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link href="/dashboard/bookings">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Manage Bookings</div>
                    <div className="text-xs text-muted-foreground">
                      View and manage your trips
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Tours */}
      {recommendedTours.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>
                Based on your interests and past trips
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tours">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedTours.map((tour) => (
                <Link
                  key={tour.id}
                  href={`/tours/${tour.slug}`}
                  className="group block rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {tour.coverImage && (
                      <Image
                        src={tour.coverImage}
                        alt={tour.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <Badge className="absolute top-2 right-2 bg-background/90 text-foreground">
                      {tour.durationDays} Days
                    </Badge>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3" />
                      {tour.destination}
                    </div>
                    <h4 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                      {tour.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">From </span>
                        <span className="font-bold">${tour.basePrice.toLocaleString()}</span>
                      </div>
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
