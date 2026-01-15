"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, Calendar, TrendingUp, DollarSign, Users, Package } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { SectionError } from "@/components/error"

// Color palette
const COLORS = {
  revenue: "#22c55e", // green
  commission: "#3b82f6", // blue
  booking: "#3b82f6", // blue
  user: "#a855f7", // purple
  tour: "#f97316", // orange
  agent: "#06b6d4", // cyan
}

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#06b6d4", "#eab308", "#ef4444"]

interface RevenueData {
  dailyRevenue: Array<{ date: string; amount: number; commission: number; count: number }>
  byPaymentMethod: Array<{ method: string; amount: number; count: number }>
  byDestination: Array<{ destination: string; amount: number; count: number }>
  totals: { revenue: number; commission: number; bookings: number }
}

interface BookingsData {
  dailyBookings: Array<{ date: string; count: number; value: number }>
  byStatus: Array<{ status: string; count: number }>
  byDestination: Array<{ destination: string; count: number }>
  averageValue: number
  totalCount: number
  totalValue: number
}

interface UsersData {
  registrations: Array<{ date: string; clients: number; agents: number }>
  byRole: Array<{ role: string; count: number }>
  topCustomers: Array<{
    id: string
    name: string
    email: string
    totalSpent: number
    bookings: number
  }>
}

interface AgentsData {
  topAgents: Array<{
    id: string
    name: string
    ownerName: string
    revenue: number
    earnings: number
    bookings: number
    rating: number
  }>
  byStatus: Array<{ status: string; count: number }>
  commissionPayouts: Array<{ month: string; amount: number }>
  registrations: Array<{ date: string; count: number }>
}

interface ToursData {
  mostBooked: Array<{ id: string; title: string; agent: string; bookings: number; revenue: number }>
  byStatus: Array<{ status: string; count: number }>
  byDestination: Array<{ destination: string; count: number }>
  topRated: Array<{ id: string; title: string; agent: string; rating: number; reviews: number }>
  agentRatings: Array<{ agent: string; rating: number; reviews: number }>
}

const dateRanges = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "This year", value: "year" },
]

function getDateRange(range: string): { startDate: string; endDate: string } {
  const now = new Date()
  const endDate = now.toISOString()
  let startDate: Date

  switch (range) {
    case "7d":
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case "30d":
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 30)
      break
    case "90d":
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 90)
      break
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 30)
  }

  return { startDate: startDate.toISOString(), endDate }
}

function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csv = [
    headers.join(","),
    ...data.map((row) => headers.map((header) => row[header]).join(",")),
  ].join("\n")

  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export default function AdminReportsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [dateRange, setDateRange] = useState(searchParams.get("range") || "30d")
  const [activeTab, setActiveTab] = useState("revenue")

  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [bookingsData, setBookingsData] = useState<BookingsData | null>(null)
  const [usersData, setUsersData] = useState<UsersData | null>(null)
  const [agentsData, setAgentsData] = useState<AgentsData | null>(null)
  const [toursData, setToursData] = useState<ToursData | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    setLoading(true)
    const { startDate, endDate } = getDateRange(dateRange)

    try {
      const [revenue, bookings, users, agents, tours] = await Promise.all([
        fetch(`/api/admin/reports/revenue?startDate=${startDate}&endDate=${endDate}`).then((r) =>
          r.json()
        ),
        fetch(`/api/admin/reports/bookings?startDate=${startDate}&endDate=${endDate}`).then((r) =>
          r.json()
        ),
        fetch(`/api/admin/reports/users?startDate=${startDate}&endDate=${endDate}`).then((r) =>
          r.json()
        ),
        fetch(`/api/admin/reports/agents?startDate=${startDate}&endDate=${endDate}`).then((r) =>
          r.json()
        ),
        fetch(`/api/admin/reports/tours?startDate=${startDate}&endDate=${endDate}`).then((r) =>
          r.json()
        ),
      ])

      setRevenueData(revenue)
      setBookingsData(bookings)
      setUsersData(users)
      setAgentsData(agents)
      setToursData(tours)
    } catch (error) {
      console.error("Error fetching reports data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (value: string) => {
    setDateRange(value)
    router.push(`/admin/reports?range=${value}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive platform analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${revenueData?.totals.revenue.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Commission: ${revenueData?.totals.commission.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookingsData?.totalCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: ${Math.round(bookingsData?.averageValue || 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usersData?.byRole.reduce((sum, role) => sum + role.count, 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Clients:{" "}
                {usersData?.byRole.find((r) => r.role === "CLIENT")?.count || 0}, Agents:{" "}
                {usersData?.byRole.find((r) => r.role === "AGENT")?.count || 0}
              </p>
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
              <div className="text-2xl font-bold">
                {toursData?.byStatus.find((s) => s.status === "ACTIVE")?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total: {toursData?.byStatus.reduce((sum, status) => sum + status.count, 0) || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <SectionError name="Reports Analytics">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="tours">Tours</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Revenue Over Time</CardTitle>
                    <CardDescription>Daily revenue and commission breakdown</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportToCSV(revenueData?.dailyRevenue || [], "revenue-over-time.csv")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData?.dailyRevenue || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke={COLORS.revenue}
                        name="Revenue"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="commission"
                        stroke={COLORS.commission}
                        name="Commission"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Revenue by Payment Method</CardTitle>
                      <CardDescription>Distribution across payment methods</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        exportToCSV(
                          revenueData?.byPaymentMethod || [],
                          "revenue-by-payment-method.csv"
                        )
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={revenueData?.byPaymentMethod || []}
                          dataKey="amount"
                          nameKey="method"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry: any) =>
                            `${entry.method}: $${entry.amount.toLocaleString()}`
                          }
                        >
                          {(revenueData?.byPaymentMethod || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Revenue by Destination</CardTitle>
                      <CardDescription>Top performing destinations</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        exportToCSV(
                          revenueData?.byDestination || [],
                          "revenue-by-destination.csv"
                        )
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData?.byDestination || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="destination" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="amount" fill={COLORS.revenue} name="Revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Bookings Over Time</CardTitle>
                    <CardDescription>Daily booking trends</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportToCSV(bookingsData?.dailyBookings || [], "bookings-over-time.csv")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={bookingsData?.dailyBookings || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke={COLORS.booking}
                        fill={COLORS.booking}
                        name="Bookings"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Booking Status Breakdown</CardTitle>
                      <CardDescription>Current booking statuses</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        exportToCSV(bookingsData?.byStatus || [], "bookings-by-status.csv")
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={bookingsData?.byStatus || []}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry: any) => `${entry.status}: ${entry.count}`}
                        >
                          {(bookingsData?.byStatus || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Bookings by Destination</CardTitle>
                      <CardDescription>Most popular destinations</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        exportToCSV(
                          bookingsData?.byDestination || [],
                          "bookings-by-destination.csv"
                        )
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={bookingsData?.byDestination || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="destination" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill={COLORS.booking} name="Bookings" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Average Booking Value</CardTitle>
                    <CardDescription>Booking value trends over time</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportToCSV(
                        bookingsData?.dailyBookings.map((b) => ({
                          date: b.date,
                          averageValue: b.count > 0 ? b.value / b.count : 0,
                        })) || [],
                        "average-booking-value.csv"
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={
                        bookingsData?.dailyBookings.map((b) => ({
                          date: b.date,
                          averageValue: b.count > 0 ? Math.round(b.value / b.count) : 0,
                        })) || []
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="averageValue"
                        stroke={COLORS.booking}
                        name="Avg Booking Value"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>User Registrations Over Time</CardTitle>
                    <CardDescription>New user signups by role</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportToCSV(usersData?.registrations || [], "user-registrations.csv")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={usersData?.registrations || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="clients"
                        stroke={COLORS.user}
                        name="Clients"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="agents"
                        stroke={COLORS.agent}
                        name="Agents"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Users by Role</CardTitle>
                    <CardDescription>User distribution across roles</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(usersData?.byRole || [], "users-by-role.csv")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={usersData?.byRole || []}
                        dataKey="count"
                        nameKey="role"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry: any) => `${entry.role}: ${entry.count}`}
                      >
                        {(usersData?.byRole || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Top Customers by Spending</CardTitle>
                    <CardDescription>Highest value customers</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportToCSV(usersData?.topCustomers || [], "top-customers.csv")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(usersData?.topCustomers || []).map((customer, index) => (
                      <div key={customer.id} className="flex items-center gap-4">
                        <div className="font-bold text-2xl text-muted-foreground w-8">
                          #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{customer.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {customer.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            ${customer.totalSpent.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {customer.bookings} bookings
                          </p>
                        </div>
                      </div>
                    ))}
                    {(usersData?.topCustomers || []).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No customer data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Top Performing Agents</CardTitle>
                    <CardDescription>Agents by revenue generated</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(agentsData?.topAgents || [], "top-agents.csv")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={agentsData?.topAgents || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill={COLORS.agent} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Agent Registrations</CardTitle>
                      <CardDescription>New agent signups over time</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        exportToCSV(agentsData?.registrations || [], "agent-registrations.csv")
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={agentsData?.registrations || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke={COLORS.agent}
                          name="Registrations"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Agents by Status</CardTitle>
                      <CardDescription>Agent verification status breakdown</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        exportToCSV(agentsData?.byStatus || [], "agents-by-status.csv")
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={agentsData?.byStatus || []}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry: any) => `${entry.status}: ${entry.count}`}
                        >
                          {(agentsData?.byStatus || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Commission Payouts</CardTitle>
                    <CardDescription>Monthly commission payments to agents</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportToCSV(
                        agentsData?.commissionPayouts || [],
                        "commission-payouts.csv"
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={agentsData?.commissionPayouts || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" fill={COLORS.agent} name="Payout Amount" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tours Tab */}
        <TabsContent value="tours" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Most Booked Tours</CardTitle>
                    <CardDescription>Top performing tours by bookings</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportToCSV(toursData?.mostBooked || [], "most-booked-tours.csv")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={toursData?.mostBooked || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" angle={-45} textAnchor="end" height={120} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="bookings" fill={COLORS.tour} name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Tours by Status</CardTitle>
                      <CardDescription>Tour status distribution</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        exportToCSV(toursData?.byStatus || [], "tours-by-status.csv")
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={toursData?.byStatus || []}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry: any) => `${entry.status}: ${entry.count}`}
                        >
                          {(toursData?.byStatus || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Tours by Destination</CardTitle>
                      <CardDescription>Distribution across destinations</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        exportToCSV(toursData?.byDestination || [], "tours-by-destination.csv")
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={toursData?.byDestination || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="destination" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill={COLORS.tour} name="Tours" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Average Tour Rating by Agent</CardTitle>
                    <CardDescription>Top rated agents by average tour rating</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportToCSV(toursData?.agentRatings || [], "agent-ratings.csv")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={toursData?.agentRatings || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="agent" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="rating" fill="#eab308" name="Avg Rating" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        </Tabs>
      </SectionError>
    </div>
  )
}
