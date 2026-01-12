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
  Sparkles,
  ArrowUpRight,
  Settings,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cn } from "@/lib/utils"

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
        iconColor = "text-emerald-500"
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
        iconColor = "text-emerald-500"
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
        iconColor = "text-emerald-500"
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

const statsConfig = [
  {
    key: "revenue",
    title: "Total Revenue",
    icon: DollarSign,
    color: "from-emerald-500 to-teal-600",
  },
  {
    key: "agents",
    title: "Active Agents",
    icon: Shield,
    color: "from-blue-500 to-indigo-600",
  },
  {
    key: "bookings",
    title: "Total Bookings",
    icon: Calendar,
    color: "from-amber-500 to-orange-600",
  },
  {
    key: "users",
    title: "Total Users",
    icon: Users,
    color: "from-purple-500 to-pink-600",
  },
]

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
  const firstName = session?.user?.name?.split(" ")[0] || "Admin"

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in slide-in-from-top duration-500">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-3">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Admin Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-gradient">{firstName}</span>!
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform overview and management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border/50 hover:border-primary/30" asChild>
            <Link href="/admin/reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Link>
          </Button>
          <Button className="shadow-glow" asChild>
            <Link href="/admin/settings">
              <Settings className="h-4 w-4 mr-2" />
              Platform Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((statConfig, index) => {
          const stat = stats[statConfig.key as keyof typeof stats]
          const Icon = statConfig.icon
          return (
            <Card
              key={statConfig.title}
              className="border-border/50 hover:border-primary/30 hover:shadow-premium transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {statConfig.title}
                </CardTitle>
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br", statConfig.color)}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.formatted}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={cn(
                      "flex items-center text-xs px-2 py-0.5 rounded-full",
                      stat.trend === "up"
                        ? "text-emerald-600 bg-emerald-500/10"
                        : "text-red-600 bg-red-500/10"
                    )}
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
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Agent Approvals */}
        <Card className="border-border/50 hover:shadow-premium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Pending Agent Approvals
                {agents.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{agents.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Agents awaiting verification</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="group" asChild>
              <Link href="/admin/agents?status=pending">
                View all
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {agents.length === 0 ? (
              <div className="text-center py-10">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <p className="font-medium">All caught up!</p>
                <p className="text-sm text-muted-foreground">No pending agent approvals</p>
              </div>
            ) : (
              agents.map((agent, index) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-orange-500 text-primary-foreground font-semibold">
                      {agent.businessName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                      {agent.businessName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {agent.ownerName} - {agent.location}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted {agent.submittedAt}
                    </p>
                  </div>
                  <Button size="sm" className="shadow-glow" asChild>
                    <Link href={`/admin/agents/${agent.id}`}>Review</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card className="border-border/50 hover:shadow-premium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Pending Withdrawals
                {withdrawals.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{withdrawals.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Withdrawal requests to process</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="group" asChild>
              <Link href="/admin/withdrawals">
                View all
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {withdrawals.length === 0 ? (
              <div className="text-center py-10">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-amber-600" />
                </div>
                <p className="font-medium">All caught up!</p>
                <p className="text-sm text-muted-foreground">No pending withdrawals</p>
              </div>
            ) : (
              <>
                {withdrawals.map((withdrawal, index) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {withdrawal.agentName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {withdrawal.method} - Requested {withdrawal.requestedAt}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${withdrawal.amount.toLocaleString()}
                      </p>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {withdrawal.id.substring(0, 8)}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button className="w-full shadow-glow mt-2" asChild>
                  <Link href="/admin/withdrawals">
                    Process Withdrawals
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-1 border-border/50 hover:shadow-premium transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.length === 0 ? (
              <div className="text-center py-10">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              activity.map((item, index) => {
                const IconComponent = getIconComponent(item.icon)
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      item.iconColor.includes("emerald") ? "bg-emerald-500/10" :
                      item.iconColor.includes("blue") ? "bg-blue-500/10" :
                      item.iconColor.includes("amber") ? "bg-amber-500/10" :
                      item.iconColor.includes("purple") ? "bg-purple-500/10" : "bg-muted"
                    )}>
                      <IconComponent className={cn("h-4 w-4", item.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-tight">{item.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Top Performing Agents */}
        <Card className="lg:col-span-2 border-border/50 hover:shadow-premium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Top Performing Agents
              </CardTitle>
              <CardDescription>Best performing agents this month</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="group" asChild>
              <Link href="/admin/analytics">
                View analytics
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topAgents.length === 0 ? (
                <div className="text-center py-10">
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium">No data yet</p>
                  <p className="text-sm text-muted-foreground">Agent performance data will appear here</p>
                </div>
              ) : (
                topAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={cn(
                      "font-bold text-2xl w-10 text-center",
                      index === 0 ? "text-amber-500" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-700" : "text-muted-foreground"
                    )}>
                      #{index + 1}
                    </div>
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-orange-500 text-primary-foreground font-semibold">
                        {agent.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate group-hover:text-primary transition-colors">{agent.name}</h4>
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
                      <p className="font-bold text-xl">
                        ${agent.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
