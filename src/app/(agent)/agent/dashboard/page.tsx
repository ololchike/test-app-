import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Users,
  Map,
  Clock,
  Package,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"

async function getAgentDashboardData(userId: string) {
  const agent = await prisma.agent.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!agent) {
    return null
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get all bookings for this agent
  const bookings = await prisma.booking.findMany({
    where: { agentId: agent.id },
    include: {
      tour: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Get all tours for this agent
  const tours = await prisma.tour.findMany({
    where: { agentId: agent.id },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      status: true,
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Calculate stats
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED")
  const upcomingBookings = confirmedBookings.filter(
    (b) => new Date(b.startDate) >= now
  )
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "COMPLETED")
    .reduce((sum, b) => sum + b.totalAmount, 0)
  const monthlyRevenue = bookings
    .filter(
      (b) =>
        b.paymentStatus === "COMPLETED" && new Date(b.createdAt) >= startOfMonth
    )
    .reduce((sum, b) => sum + b.totalAmount, 0)

  // Get recent bookings (last 5)
  const recentBookings = bookings.slice(0, 5)

  // Calculate tour performance
  const tourPerformance = await Promise.all(
    tours.slice(0, 5).map(async (tour) => {
      const tourBookings = bookings.filter((b) => b.tourId === tour.id)
      const revenue = tourBookings
        .filter((b) => b.paymentStatus === "COMPLETED")
        .reduce((sum, b) => sum + b.totalAmount, 0)

      return {
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
        coverImage: tour.coverImage,
        bookings: tour._count.bookings,
        revenue,
      }
    })
  )

  return {
    stats: {
      totalRevenue,
      monthlyRevenue,
      totalBookings: bookings.length,
      upcomingBookings: upcomingBookings.length,
      activeTours: tours.filter((t) => t.status === "ACTIVE").length,
      totalTours: tours.length,
    },
    recentBookings,
    topTours: tourPerformance.sort((a, b) => b.revenue - a.revenue),
  }
}

export default async function AgentDashboardPage() {
  const session = await auth()
  const firstName = session?.user?.name?.split(" ")[0] || "Agent"

  const data = session?.user?.id
    ? await getAgentDashboardData(session.user.id)
    : null

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Package className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Agent profile not found</h2>
        <p className="text-muted-foreground">Please complete your agent registration.</p>
      </div>
    )
  }

  const { stats, recentBookings, topTours } = data

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your tours today
          </p>
        </div>
        <Button asChild>
          <Link href="/agent/tours/new">
            <Map className="h-4 w-4 mr-2" />
            Create New Tour
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                ${stats.monthlyRevenue.toLocaleString()}
              </div>
              <span className="text-xs text-muted-foreground">This month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {stats.upcomingBookings} upcoming
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tours
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTours}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {stats.totalTours} total tours
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Trips
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">Confirmed bookings</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest booking activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/agent/bookings">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold">No bookings yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your tours to start receiving bookings
                </p>
                <Button asChild>
                  <Link href="/agent/tours">View My Tours</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/booking/confirmation/${booking.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative h-12 w-12 rounded-md overflow-hidden shrink-0 bg-muted">
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
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">
                          {booking.contactName}
                        </h4>
                        <Badge
                          variant={
                            booking.status === "CONFIRMED" ? "default" : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {booking.tour.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(booking.startDate), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {booking.adults + booking.children}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${booking.totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{booking.bookingReference}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your tours and bookings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/agent/tours/new">
                <Map className="h-4 w-4 mr-2" />
                Create New Tour
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/agent/bookings">
                <Calendar className="h-4 w-4 mr-2" />
                View All Bookings
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/agent/tours">
                <Package className="h-4 w-4 mr-2" />
                Manage Tours
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Tours */}
      {topTours.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Performing Tours</CardTitle>
              <CardDescription>Your tours by revenue</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/agent/tours">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTours.map((tour, index) => (
                <Link
                  key={tour.id}
                  href={`/agent/tours/${tour.id}/edit`}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="font-bold text-2xl text-muted-foreground w-8">
                    #{index + 1}
                  </div>
                  <div className="relative h-16 w-24 rounded-md overflow-hidden shrink-0 bg-muted">
                    {tour.coverImage && (
                      <Image
                        src={tour.coverImage}
                        alt={tour.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{tour.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {tour.bookings} bookings
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${tour.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
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
