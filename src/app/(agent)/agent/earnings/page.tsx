"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calendar, Download, Clock } from "lucide-react"
import { WithdrawalForm } from "@/components/agent/withdrawal-form"
import { WithdrawalHistory } from "@/components/agent/withdrawal-history"
import { Skeleton } from "@/components/ui/skeleton"

interface BalanceData {
  totalEarnings: number
  monthlyEarnings: number
  availableBalance: number
  pendingWithdrawals: number
  totalWithdrawn: number
  pendingEarnings: number
  currency: string
  stats: {
    completedBookingsCount: number
    pendingWithdrawalsCount: number
    completedWithdrawalsCount: number
  }
}

export default function AgentEarningsPage() {
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchBalance = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/agent/balance")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch balance")
      }

      setBalanceData(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [refreshTrigger])

  const handleWithdrawalSuccess = () => {
    // Refresh balance and withdrawal history
    setRefreshTrigger((prev) => prev + 1)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground mt-1">
            Track your earnings and commission from bookings
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={fetchBalance}
                className="text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground mt-1">
          Track your earnings and manage withdrawal requests
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Earnings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${balanceData?.totalEarnings.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {balanceData?.stats.completedBookingsCount || 0} bookings
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* This Month */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${balanceData?.monthlyEarnings.toLocaleString() || 0}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">Current month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Available Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${balanceData?.availableBalance.toLocaleString() || 0}
                </div>
                <div className="mt-2">
                  <WithdrawalForm
                    availableBalance={balanceData?.availableBalance || 0}
                    currency={balanceData?.currency || "USD"}
                    onSuccess={handleWithdrawalSuccess}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Withdrawals
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${balanceData?.pendingWithdrawals.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {balanceData?.stats.pendingWithdrawalsCount || 0} pending request
                  {balanceData?.stats.pendingWithdrawalsCount !== 1 ? "s" : ""}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>
            View and track your withdrawal requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WithdrawalHistory refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${balanceData?.totalWithdrawn.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {balanceData?.stats.completedWithdrawalsCount || 0} completed
                  withdrawal
                  {balanceData?.stats.completedWithdrawalsCount !== 1 ? "s" : ""}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${balanceData?.pendingEarnings.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From bookings in progress
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
