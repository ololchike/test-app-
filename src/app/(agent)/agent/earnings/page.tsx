import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

async function getAgentEarnings(userId: string) {
  const agent = await prisma.agent.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!agent) {
    return null
  }

  // Get all confirmed bookings for this agent
  const bookings = await prisma.booking.findMany({
    where: {
      agentId: agent.id,
      paymentStatus: "COMPLETED"
    },
    select: {
      agentEarnings: true,
      createdAt: true,
    },
  })

  const totalEarnings = bookings.reduce((sum, b) => sum + b.agentEarnings, 0)
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const monthlyEarnings = bookings
    .filter(b => new Date(b.createdAt) >= thisMonth)
    .reduce((sum, b) => sum + b.agentEarnings, 0)

  return {
    totalEarnings,
    monthlyEarnings,
    bookingsCount: bookings.length,
  }
}

export default async function AgentEarningsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const data = await getAgentEarnings(session.user.id)

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <DollarSign className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Agent profile not found</h2>
        <p className="text-muted-foreground">Please complete your agent registration.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground mt-1">
          Track your earnings and commission from bookings
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {data.bookingsCount} bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.monthlyEarnings.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">Current month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalEarnings.toLocaleString()}</div>
            <Button variant="outline" size="sm" className="mt-2">
              <Download className="h-3 w-3 mr-2" />
              Request Withdrawal
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
          <CardDescription>
            This feature is coming soon. You'll be able to view detailed earnings history and download statements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Detailed earnings history and withdrawal management will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
