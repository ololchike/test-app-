"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Eye,
  ShoppingCart,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { SectionError } from "@/components/error"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts"

interface AnalyticsData {
  overview: {
    totalViews: number
    totalBookings: number
    completedBookings: number
    conversionRate: string
    avgBookingValue: string
    totalRevenue: string
    returnRate: string
    uniqueCustomers: number
    bookingGrowth: string
  }
  monthlyEarnings: Array<{
    month: string
    earnings: number
    bookings: number
  }>
  topTours: Array<{
    id: string
    title: string
    slug: string
    views: number
    bookings: number
    conversionRate: string
  }>
  statusBreakdown: {
    pending: number
    confirmed: number
    inProgress: number
    completed: number
    cancelled: number
  }
}

const COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#22c55e", "#ef4444"]

const statsConfig = [
  {
    key: "totalViews",
    title: "Total Views",
    icon: Eye,
    color: "from-blue-500 to-indigo-600",
    format: (val: string | number) => Number(val).toLocaleString(),
    description: "All tour page views",
  },
  {
    key: "conversionRate",
    title: "Conversion Rate",
    icon: BarChart3,
    color: "from-emerald-500 to-teal-600",
    format: (val: string | number) => `${val}%`,
    description: "Views to bookings",
  },
  {
    key: "avgBookingValue",
    title: "Avg. Booking Value",
    icon: DollarSign,
    color: "from-amber-500 to-orange-600",
    format: (val: string | number) => `$${parseFloat(String(val)).toLocaleString()}`,
    description: "Per booking",
  },
  {
    key: "returnRate",
    title: "Return Customers",
    icon: Users,
    color: "from-purple-500 to-pink-600",
    format: (val: string | number) => `${val}%`,
    description: "Repeat booking rate",
  },
]

export default function AgentAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/agent/analytics")
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        }
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-3">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Track your business performance and insights
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <BarChart3 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    )
  }

  const { overview, monthlyEarnings, topTours, statusBreakdown } = data

  const statusData = [
    { name: "Pending", value: statusBreakdown.pending },
    { name: "Confirmed", value: statusBreakdown.confirmed },
    { name: "In Progress", value: statusBreakdown.inProgress },
    { name: "Completed", value: statusBreakdown.completed },
    { name: "Cancelled", value: statusBreakdown.cancelled },
  ].filter((item) => item.value > 0)

  const growthIsPositive = parseFloat(overview.bookingGrowth) >= 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-3">
          <BarChart3 className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Analytics</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your business performance and insights
        </p>
      </motion.div>

      {/* Overview Stats */}
      <SectionError name="Analytics Overview">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon
            const value = overview[stat.key as keyof typeof overview]
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border/50 hover:border-primary/30 hover:shadow-premium transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br", stat.color)}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stat.format(value)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </SectionError>

      {/* Secondary Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 hover:border-primary/30 hover:shadow-premium transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalBookings}</div>
              <div className="flex items-center gap-1 mt-1">
                {growthIsPositive ? (
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={cn("text-xs", growthIsPositive ? "text-emerald-600" : "text-red-600")}>
                  {overview.bookingGrowth}% from last month
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border/50 hover:border-primary/30 hover:shadow-premium transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${parseFloat(overview.totalRevenue).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {overview.totalBookings} bookings
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-border/50 hover:border-primary/30 hover:shadow-premium transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unique Customers
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.uniqueCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {overview.completedBookings} completed trips
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue & Bookings Trend */}
      <SectionError name="Revenue Trend">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-border/50 hover:shadow-premium transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Revenue & Bookings Trend
              </CardTitle>
              <CardDescription>Your earnings and bookings over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
            {monthlyEarnings.some((m) => m.earnings > 0 || m.bookings > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyEarnings}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="earnings"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#colorEarnings)"
                    name="Earnings ($)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorBookings)"
                    name="Bookings"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No earnings data yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </SectionError>

      {/* Charts Row */}
      <SectionError name="Analytics Charts">
        <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-border/50 hover:shadow-premium transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Monthly Earnings
              </CardTitle>
              <CardDescription>Your earnings over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyEarnings.some((m) => m.earnings > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                        "Earnings",
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="earnings" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <DollarSign className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No earnings data yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Booking Status Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="border-border/50 hover:shadow-premium transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Booking Status
              </CardTitle>
              <CardDescription>Breakdown by current status</CardDescription>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No bookings yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </SectionError>

      {/* Top Tours */}
      <SectionError name="Top Tours">
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Card className="border-border/50 hover:shadow-premium transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Top Performing Tours
            </CardTitle>
            <CardDescription>Your most viewed and booked tours</CardDescription>
          </CardHeader>
          <CardContent>
            {topTours.length > 0 ? (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                        Tour
                      </th>
                      <th className="text-right py-3 px-2 font-semibold text-muted-foreground">
                        Views
                      </th>
                      <th className="text-right py-3 px-2 font-semibold text-muted-foreground">
                        Bookings
                      </th>
                      <th className="text-right py-3 px-2 font-semibold text-muted-foreground">
                        Conversion
                      </th>
                      <th className="py-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTours.map((tour, index) => (
                      <motion.tr
                        key={tour.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.05 }}
                        className="border-b border-border/30 hover:bg-primary/5 transition-colors group"
                      >
                        <td className="py-4 px-2">
                          <span className="font-medium group-hover:text-primary transition-colors">{tour.title}</span>
                        </td>
                        <td className="text-right py-4 px-2 font-mono">
                          {tour.views.toLocaleString()}
                        </td>
                        <td className="text-right py-4 px-2 font-mono">{tour.bookings}</td>
                        <td className="text-right py-4 px-2">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            parseFloat(tour.conversionRate) > 5
                              ? "bg-emerald-500/10 text-emerald-600"
                              : parseFloat(tour.conversionRate) > 2
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {tour.conversionRate}%
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <Link
                            href={`/tours/${tour.slug}`}
                            target="_blank"
                            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No tour data yet. Create and publish tours to see analytics.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </SectionError>
    </div>
  )
}
