import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  Users,
  Map,
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

// Mock data - will be replaced with real data from API
const platformStats = [
  {
    title: "Total Revenue",
    value: "$248,560",
    icon: DollarSign,
    change: "+18.2%",
    trend: "up",
    description: "This month",
  },
  {
    title: "Active Agents",
    value: "156",
    icon: Shield,
    change: "+12",
    trend: "up",
    description: "Verified operators",
  },
  {
    title: "Total Bookings",
    value: "1,284",
    icon: Calendar,
    change: "+24.5%",
    trend: "up",
    description: "This month",
  },
  {
    title: "Total Users",
    value: "12,456",
    icon: Users,
    change: "+856",
    trend: "up",
    description: "Registered users",
  },
]

const pendingAgents = [
  {
    id: "1",
    businessName: "Kenya Wild Safaris",
    ownerName: "John Kamau",
    email: "john@kenyawild.com",
    submittedAt: "2 hours ago",
    location: "Nairobi, Kenya",
  },
  {
    id: "2",
    businessName: "Tanzania Eco Tours",
    ownerName: "Grace Mwangi",
    email: "grace@tzecotours.com",
    submittedAt: "5 hours ago",
    location: "Arusha, Tanzania",
  },
  {
    id: "3",
    businessName: "Uganda Gorilla Treks",
    ownerName: "David Okello",
    email: "david@ugtreks.com",
    submittedAt: "1 day ago",
    location: "Kampala, Uganda",
  },
]

const pendingWithdrawals = [
  {
    id: "WD-001",
    agentName: "Safari Adventures Kenya",
    amount: 5200,
    method: "M-Pesa",
    requestedAt: "10 minutes ago",
    status: "pending",
  },
  {
    id: "WD-002",
    agentName: "Serengeti Explorers",
    amount: 3800,
    method: "Bank Transfer",
    requestedAt: "2 hours ago",
    status: "pending",
  },
  {
    id: "WD-003",
    agentName: "Bwindi Adventures",
    amount: 2500,
    method: "M-Pesa",
    requestedAt: "5 hours ago",
    status: "pending",
  },
]

const recentActivity = [
  {
    type: "booking",
    message: "New booking #BK-2024-156 confirmed",
    time: "5 minutes ago",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  {
    type: "agent",
    message: "Agent Safari Adventures Kenya verified",
    time: "1 hour ago",
    icon: Shield,
    iconColor: "text-blue-500",
  },
  {
    type: "withdrawal",
    message: "Withdrawal #WD-154 processed - $3,200",
    time: "2 hours ago",
    icon: CreditCard,
    iconColor: "text-purple-500",
  },
  {
    type: "alert",
    message: "High booking volume detected",
    time: "4 hours ago",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
  },
  {
    type: "booking",
    message: "Booking #BK-2024-155 cancelled",
    time: "6 hours ago",
    icon: Clock,
    iconColor: "text-muted-foreground",
  },
]

const topAgents = [
  {
    name: "Safari Adventures Kenya",
    revenue: 45600,
    bookings: 38,
    rating: 4.9,
  },
  {
    name: "Serengeti Explorers",
    revenue: 38200,
    bookings: 32,
    rating: 4.8,
  },
  {
    name: "Masai Mara Tours",
    revenue: 32100,
    bookings: 28,
    rating: 4.8,
  },
  {
    name: "Rwanda Eco Tours",
    revenue: 28500,
    bookings: 24,
    rating: 4.7,
  },
]

export default function AdminDashboardPage() {
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
                <Badge variant="destructive">{pendingAgents.length}</Badge>
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
            {pendingAgents.map((agent) => (
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
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Pending Withdrawals
                <Badge variant="destructive">{pendingWithdrawals.length}</Badge>
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
            {pendingWithdrawals.map((withdrawal) => (
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
                  <p className="font-semibold">${withdrawal.amount}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    {withdrawal.id}
                  </Badge>
                </div>
              </div>
            ))}
            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/withdrawals">
                Process Withdrawals
              </Link>
            </Button>
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
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <activity.icon className={`h-5 w-5 mt-0.5 ${activity.iconColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
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
              {topAgents.map((agent, index) => (
                <div
                  key={agent.name}
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
                      <span className="flex items-center gap-1">
                        <span className="text-amber-500">★</span>
                        {agent.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ${agent.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
