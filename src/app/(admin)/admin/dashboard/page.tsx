import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Shield,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

// Force dynamic rendering for this page
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Calculate time ago string from date
 */
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 60) {
    return diffInMinutes === 0 ? "just now" : `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  } else {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }
}

/**
 * Fetch dashboard data from database
 */
async function getDashboardData() {
  // Calculate date ranges
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

  // Fetch all stats in parallel
  const [
    currentMonthRevenue,
    lastMonthRevenue,
    activeAgentsCount,
    lastMonthActiveAgentsCount,
    currentMonthBookings,
    lastMonthBookings,
    totalUsers,
    lastMonthTotalUsers,
    pendingAgents,
    pendingWithdrawals,
    recentLogs,
    agents,
  ] = await Promise.all([
    // Current month revenue
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        completedAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    // Last month revenue
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        completedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { amount: true },
    }),
    // Current active agents
    prisma.agent.count({
      where: { isVerified: true, status: "ACTIVE" },
    }),
    // Last month active agents
    prisma.agent.count({
      where: { isVerified: true, status: "ACTIVE", createdAt: { lt: startOfMonth } },
    }),
    // Current month bookings
    prisma.booking.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    // Last month bookings
    prisma.booking.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    // Total users
    prisma.user.count(),
    // Users at start of month
    prisma.user.count({
      where: { createdAt: { lt: startOfMonth } },
    }),
    // Pending agents
    prisma.agent.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    // Pending withdrawals
    prisma.withdrawalRequest.findMany({
      where: { status: "PENDING" },
      include: {
        agent: {
          select: { businessName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    // Recent activity logs
    prisma.auditLog.findMany({
      where: {
        action: {
          in: [
            "booking_created",
            "booking_confirmed",
            "booking_cancelled",
            "agent_verified",
            "agent_suspended",
            "withdrawal_processed",
            "withdrawal_approved",
            "withdrawal_rejected",
            "payment_completed",
            "tour_published",
            "user_registered",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    // All active agents for top performers
    prisma.agent.findMany({
      where: { isVerified: true, status: "ACTIVE" },
      include: {
        bookings: {
          where: {
            createdAt: { gte: startOfMonth },
            status: { in: ["CONFIRMED", "PAID", "IN_PROGRESS", "COMPLETED"] },
          },
          select: {
            agentEarnings: true,
            totalAmount: true,
          },
        },
        tours: {
          include: {
            reviews: {
              where: { isApproved: true },
              select: { rating: true },
            },
          },
        },
      },
    }),
  ])

  // Calculate stats
  const currentRevenue = currentMonthRevenue._sum.amount || 0
  const previousRevenue = lastMonthRevenue._sum.amount || 0
  const revenueChange = previousRevenue > 0
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
    : 100

  const agentChange = activeAgentsCount - lastMonthActiveAgentsCount

  const bookingsChange = lastMonthBookings > 0
    ? ((currentMonthBookings - lastMonthBookings) / lastMonthBookings) * 100
    : 100

  const userChange = totalUsers - lastMonthTotalUsers

  const stats = {
    revenue: {
      value: currentRevenue,
      formatted: `$${currentRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      change: revenueChange >= 0 ? `+${revenueChange.toFixed(1)}%` : `${revenueChange.toFixed(1)}%`,
      trend: revenueChange >= 0 ? "up" as const : "down" as const,
      description: "This month",
    },
    agents: {
      value: activeAgentsCount,
      formatted: activeAgentsCount.toLocaleString(),
      change: agentChange >= 0 ? `+${agentChange}` : `${agentChange}`,
      trend: agentChange >= 0 ? "up" as const : "down" as const,
      description: "Verified operators",
    },
    bookings: {
      value: currentMonthBookings,
      formatted: currentMonthBookings.toLocaleString(),
      change: bookingsChange >= 0 ? `+${bookingsChange.toFixed(1)}%` : `${bookingsChange.toFixed(1)}%`,
      trend: bookingsChange >= 0 ? "up" as const : "down" as const,
      description: "This month",
    },
    users: {
      value: totalUsers,
      formatted: totalUsers.toLocaleString(),
      change: userChange >= 0 ? `+${userChange}` : `${userChange}`,
      trend: userChange >= 0 ? "up" as const : "down" as const,
      description: "Registered users",
    },
  }

  // Format pending agents
  const formattedAgents = pendingAgents.map((agent) => {
    const ownerName = agent.user.name ||
      (agent.user.firstName && agent.user.lastName
        ? `${agent.user.firstName} ${agent.user.lastName}`
        : agent.user.email)

    return {
      id: agent.id,
      businessName: agent.businessName,
      ownerName,
      email: agent.user.email,
      submittedAt: getTimeAgo(agent.createdAt),
      location: agent.city && agent.country
        ? `${agent.city}, ${agent.country}`
        : agent.country || "Not specified",
    }
  })

  // Format pending withdrawals
  const formattedWithdrawals = pendingWithdrawals.map((withdrawal) => ({
    id: withdrawal.id,
    agentName: withdrawal.agent.businessName,
    amount: withdrawal.amount,
    currency: withdrawal.currency,
    method: withdrawal.method === "mpesa" ? "M-Pesa" : "Bank Transfer",
    requestedAt: getTimeAgo(withdrawal.createdAt),
  }))

  // Format activity logs
  const activity = recentLogs.map((log) => {
    let type: string
    let message: string
    let icon: string
    let iconColor: string

    switch (log.action) {
      case "booking_created":
      case "booking_confirmed":
        type = "booking"
        message = `New booking ${log.resourceId ? `#${log.resourceId}` : ""} confirmed`
        icon = "CheckCircle"
        iconColor = "text-green-500"
        break
      case "booking_cancelled":
        type = "booking"
        message = `Booking ${log.resourceId ? `#${log.resourceId}` : ""} cancelled`
        icon = "Clock"
        iconColor = "text-muted-foreground"
        break
      case "agent_verified":
        type = "agent"
        const agentName = (log.metadata as Record<string, unknown>)?.agentName || "Agent"
        message = `Agent ${agentName} verified`
        icon = "Shield"
        iconColor = "text-blue-500"
        break
      case "agent_suspended":
        type = "alert"
        const suspendedAgent = (log.metadata as Record<string, unknown>)?.agentName || "Agent"
        message = `Agent ${suspendedAgent} suspended`
        icon = "AlertTriangle"
        iconColor = "text-amber-500"
        break
      case "withdrawal_processed":
      case "withdrawal_approved":
        type = "withdrawal"
        const amount = (log.metadata as Record<string, unknown>)?.amount || 0
        message = `Withdrawal ${log.resourceId ? `#${log.resourceId}` : ""} processed - $${(amount as number).toLocaleString()}`
        icon = "CreditCard"
        iconColor = "text-purple-500"
        break
      case "withdrawal_rejected":
        type = "alert"
        message = `Withdrawal ${log.resourceId ? `#${log.resourceId}` : ""} rejected`
        icon = "AlertTriangle"
        iconColor = "text-amber-500"
        break
      case "payment_completed":
        type = "booking"
        const paymentAmount = (log.metadata as Record<string, unknown>)?.amount || 0
        message = `Payment completed - $${(paymentAmount as number).toLocaleString()}`
        icon = "CheckCircle"
        iconColor = "text-green-500"
        break
      case "tour_published":
        type = "booking"
        const tourTitle = (log.metadata as Record<string, unknown>)?.title || "Tour"
        message = `New tour published: ${tourTitle}`
        icon = "CheckCircle"
        iconColor = "text-blue-500"
        break
      case "user_registered":
        type = "booking"
        message = `New user registered`
        icon = "CheckCircle"
        iconColor = "text-green-500"
        break
      default:
        type = "booking"
        message = log.action.replace(/_/g, " ")
        icon = "Clock"
        iconColor = "text-muted-foreground"
    }

    return {
      id: log.id,
      type,
      message,
      time: getTimeAgo(log.createdAt),
      icon,
      iconColor,
    }
  })

  // Calculate top agents
  const topAgents = agents
    .map((agent) => {
      const revenue = agent.bookings.reduce((sum, booking) => sum + booking.agentEarnings, 0)
      const bookingsCount = agent.bookings.length
      const allReviews = agent.tours.flatMap((tour) => tour.reviews)
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
      const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0

      return {
        id: agent.id,
        name: agent.businessName,
        revenue,
        bookings: bookingsCount,
        rating: Math.round(avgRating * 10) / 10,
      }
    })
    .filter((agent) => agent.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return {
    stats,
    agents: formattedAgents,
    withdrawals: formattedWithdrawals,
    activity,
    topAgents,
  }
}

/**
 * Get icon component by name
 */
function getIconComponent(iconName: string) {
  const icons: Record<string, typeof Clock> = {
    CheckCircle,
    Shield,
    CreditCard,
    AlertTriangle,
    Clock,
  }
  return icons[iconName] || Clock
}

/**
 * Admin Dashboard Page - Server Component
 */
export default async function AdminDashboardPage() {
  // Check authentication - this is redundant with layout but serves as extra security
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/unauthorized")
  }

  const { stats, agents, withdrawals, activity, topAgents } = await getDashboardData()

  const platformStats = [
    {
      title: "Total Revenue",
      value: stats.revenue.formatted,
      icon: DollarSign,
      change: stats.revenue.change,
      trend: stats.revenue.trend,
      description: stats.revenue.description,
    },
    {
      title: "Active Agents",
      value: stats.agents.formatted,
      icon: Shield,
      change: stats.agents.change,
      trend: stats.agents.trend,
      description: stats.agents.description,
    },
    {
      title: "Total Bookings",
      value: stats.bookings.formatted,
      icon: Calendar,
      change: stats.bookings.change,
      trend: stats.bookings.trend,
      description: stats.bookings.description,
    },
    {
      title: "Total Users",
      value: stats.users.formatted,
      icon: Users,
      change: stats.users.change,
      trend: stats.users.trend,
      description: stats.users.description,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Platform overview and management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/reports">View Reports</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/settings">Platform Settings</Link>
          </Button>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {platformStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`flex items-center text-xs ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </div>
                <span className="text-xs text-muted-foreground">
                  {stat.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Agent Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Pending Agent Approvals
                {agents.length > 0 && (
                  <Badge variant="destructive">{agents.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Agents awaiting verification</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/agents?status=pending">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {agents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No pending agent approvals</p>
              </div>
            ) : (
              agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-4 p-3 rounded-lg border"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {agent.businessName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {agent.businessName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {agent.ownerName} - {agent.location}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted {agent.submittedAt}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/agents/${agent.id}`}>Review</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Pending Withdrawals
                {withdrawals.length > 0 && (
                  <Badge variant="destructive">{withdrawals.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Withdrawal requests to process</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/withdrawals">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {withdrawals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No pending withdrawals</p>
              </div>
            ) : (
              <>
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {withdrawal.agentName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {withdrawal.method} - Requested {withdrawal.requestedAt}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${withdrawal.amount.toLocaleString()}
                      </p>
                      <Badge variant="secondary" className="text-[10px]">
                        {withdrawal.id.substring(0, 8)}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/admin/withdrawals">
                    Process Withdrawals
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No recent activity</p>
              </div>
            ) : (
              activity.map((item) => {
                const IconComponent = getIconComponent(item.icon)
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <IconComponent className={`h-5 w-5 mt-0.5 ${item.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{item.message}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Top Performing Agents */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Performing Agents</CardTitle>
              <CardDescription>Best performing agents this month</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/analytics">
                View analytics <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topAgents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No agent data available</p>
                </div>
              ) : (
                topAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <div className="font-bold text-2xl text-muted-foreground w-8">
                      #{index + 1}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {agent.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{agent.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{agent.bookings} bookings</span>
                        {agent.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="text-amber-500">★</span>
                            {agent.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${agent.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
