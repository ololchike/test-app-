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
  Package,
  Sparkles,
  ArrowUpRight,
  Clock,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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

const statsConfig = [
  {
    key: "totalRevenue",
    title: "Total Revenue",
    icon: DollarSign,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600",
    format: (value: number) => `$${value.toLocaleString()}`,
  },
  {
    key: "totalBookings",
    title: "Total Bookings",
    icon: Calendar,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600",
    format: (value: number) => value.toString(),
  },
  {
    key: "activeTours",
    title: "Active Tours",
    icon: Package,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
    format: (value: number) => value.toString(),
  },
  {
    key: "upcomingBookings",
    title: "Upcoming Trips",
    icon: Users,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-600",
    format: (value: number) => value.toString(),
  },
]

export default async function AgentDashboardPage() {
  const session = await auth()
  const firstName = session?.user?.name?.split(" ")[0] || "Agent"

  const data = session?.user?.id
    ? await getAgentDashboardData(session.user.id)
    : null

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Package className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Agent profile not found</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Please complete your agent registration to access the dashboard.
        </p>
        <Button asChild className="mt-2 shadow-glow">
          <Link href="/become-agent">Complete Registration</Link>
        </Button>
      </div>
    )
  }

  const { stats, recentBookings, topTours } = data

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in slide-in-from-top duration-500">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Agent Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-gradient">{firstName}</span>!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your tours today
          </p>
        </div>
        <Button asChild className="shadow-glow">
          <Link href="/agent/tours/new">
            <Map className="h-4 w-4 mr-2" />
            Create New Tour
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat, index) => {
          const value = stats[stat.key as keyof typeof stats]
          const Icon = stat.icon
          return (
            <Card
              key={stat.key}
              className="border-border/50 hover:border-primary/30 hover:shadow-premium transition-all duration-300 overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br", stat.color)}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.format(value)}</div>
                {stat.key === "totalRevenue" && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      ${stats.monthlyRevenue.toLocaleString()}
                    </div>
                    <span className="text-xs text-muted-foreground">This month</span>
                  </div>
                )}
                {stat.key === "totalBookings" && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {stats.upcomingBookings} upcoming
                    </span>
                  </div>
                )}
                {stat.key === "activeTours" && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {stats.totalTours} total tours
                    </span>
                  </div>
                )}
                {stat.key === "upcomingBookings" && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Confirmed bookings</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Bookings */}
        <Card className="lg:col-span-2 border-border/50 hover:shadow-premium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recent Bookings
              </CardTitle>
              <CardDescription>Latest booking activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="group" asChild>
              <Link href="/agent/bookings">
                View all
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-10">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold">No bookings yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  Share your tours to start receiving bookings from travelers
                </p>
                <Button asChild className="shadow-glow">
                  <Link href="/agent/tours">View My Tours</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking, index) => (
                  <Link
                    key={booking.id}
                    href={`/booking/confirmation/${booking.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md transition-all duration-200 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-muted">
                      {booking.tour.coverImage && (
                        <Image
                          src={booking.tour.coverImage}
                          alt={booking.tour.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                          {booking.contactName}
                        </h4>
                        <Badge
                          variant={booking.status === "CONFIRMED" ? "default" : "secondary"}
                          className={cn(
                            "text-[10px]",
                            booking.status === "CONFIRMED" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          )}
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {booking.tour.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(booking.startDate), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {booking.adults + booking.children} guests
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${booking.totalAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{booking.bookingReference}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50 hover:shadow-premium transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Manage your tours and bookings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { href: "/agent/tours/new", icon: Map, label: "Create New Tour", color: "from-primary to-orange-500" },
              { href: "/agent/bookings", icon: Calendar, label: "View All Bookings", color: "from-blue-500 to-indigo-600" },
              { href: "/agent/tours", icon: Package, label: "Manage Tours", color: "from-emerald-500 to-teal-600" },
            ].map((action) => (
              <Button
                key={action.href}
                variant="outline"
                className="w-full justify-start h-12 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                asChild
              >
                <Link href={action.href}>
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br mr-3", action.color)}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="group-hover:text-primary transition-colors">{action.label}</span>
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Tours */}
      {topTours.length > 0 && (
        <Card className="border-border/50 hover:shadow-premium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Top Performing Tours
              </CardTitle>
              <CardDescription>Your tours ranked by revenue</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="group" asChild>
              <Link href="/agent/tours">
                View all
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTours.map((tour, index) => (
                <Link
                  key={tour.id}
                  href={`/agent/tours/${tour.id}/edit`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md transition-all duration-200 group"
                >
                  <div className={cn(
                    "font-bold text-2xl w-8 text-center",
                    index === 0 ? "text-amber-500" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-700" : "text-muted-foreground"
                  )}>
                    #{index + 1}
                  </div>
                  <div className="relative h-16 w-24 rounded-xl overflow-hidden shrink-0 bg-muted">
                    {tour.coverImage && (
                      <Image
                        src={tour.coverImage}
                        alt={tour.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate group-hover:text-primary transition-colors">{tour.title}</h4>
                    <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {tour.bookings} bookings
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl">${tour.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
