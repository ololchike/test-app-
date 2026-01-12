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
  Loader2,
  ExternalLink,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your business performance
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your business performance and insights
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All tour page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Views to bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Booking Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(overview.avgBookingValue).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Return Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.returnRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Repeat booking rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalBookings}</div>
            <div className="flex items-center gap-1 mt-1">
              {growthIsPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={`text-xs ${growthIsPositive ? "text-green-600" : "text-red-600"}`}
              >
                {overview.bookingGrowth}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.completedBookings} completed trips
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Earnings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
            <CardDescription>Your earnings over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyEarnings.some((m) => m.earnings > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                      "Earnings",
                    ]}
                  />
                  <Bar dataKey="earnings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No earnings data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No bookings yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Tours */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Tours</CardTitle>
          <CardDescription>Your most viewed and booked tours</CardDescription>
        </CardHeader>
        <CardContent>
          {topTours.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                      Tour
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                      Views
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                      Bookings
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                      Conversion
                    </th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {topTours.map((tour) => (
                    <tr key={tour.id} className="border-b">
                      <td className="py-3 px-2">
                        <span className="font-medium">{tour.title}</span>
                      </td>
                      <td className="text-right py-3 px-2">
                        {tour.views.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-2">{tour.bookings}</td>
                      <td className="text-right py-3 px-2">
                        {tour.conversionRate}%
                      </td>
                      <td className="py-3 px-2">
                        <Link
                          href={`/tours/${tour.slug}`}
                          target="_blank"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No tour data yet. Create and publish tours to see analytics.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
