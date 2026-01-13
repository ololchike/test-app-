"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calendar, Clock, Sparkles, Wallet, ArrowUpRight, Loader2 } from "lucide-react"
import { WithdrawalForm } from "@/components/agent/withdrawal-form"
import { WithdrawalHistory } from "@/components/agent/withdrawal-history"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

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

const statsConfig = [
  {
    key: "totalEarnings",
    title: "Total Earnings",
    icon: DollarSign,
    color: "from-emerald-500 to-teal-600",
    description: (data: BalanceData) => `From ${data.stats.completedBookingsCount} bookings`,
  },
  {
    key: "monthlyEarnings",
    title: "This Month",
    icon: Calendar,
    color: "from-blue-500 to-indigo-600",
    description: () => "Current month earnings",
  },
  {
    key: "availableBalance",
    title: "Available Balance",
    icon: Wallet,
    color: "from-amber-500 to-orange-600",
    description: () => "Ready to withdraw",
  },
  {
    key: "pendingWithdrawals",
    title: "Pending Withdrawals",
    icon: Clock,
    color: "from-purple-500 to-pink-600",
    description: (data: BalanceData) => `${data.stats.pendingWithdrawalsCount} pending request${data.stats.pendingWithdrawalsCount !== 1 ? "s" : ""}`,
  },
]

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
    setRefreshTrigger((prev) => prev + 1)
  }

  if (error) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-3">
            <DollarSign className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Earnings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Earnings</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Track your earnings and manage withdrawal requests
          </p>
        </motion.div>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={fetchBalance}
                className="text-primary hover:underline font-medium"
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
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-3">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Earnings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Earnings</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Track your earnings and manage withdrawal requests
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border/50 hover:border-primary/30 hover:shadow-premium transition-all duration-300 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br", stat.color)}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-32" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        ${balanceData?.[stat.key as keyof BalanceData]?.toLocaleString() || 0}
                      </div>
                      {stat.key === "monthlyEarnings" && balanceData && (
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="h-3 w-3 text-emerald-600" />
                          <span className="text-xs text-emerald-600">Current month</span>
                        </div>
                      )}
                      {stat.key !== "monthlyEarnings" && balanceData && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {stat.description(balanceData)}
                        </p>
                      )}
                      {stat.key === "availableBalance" && !loading && (
                        <div className="mt-3">
                          <WithdrawalForm
                            availableBalance={balanceData?.availableBalance || 0}
                            currency={balanceData?.currency || "USD"}
                            onSuccess={handleWithdrawalSuccess}
                          />
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Withdrawal History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border/50 hover:shadow-premium transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Withdrawal History
            </CardTitle>
            <CardDescription>
              View and track your withdrawal requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WithdrawalHistory refreshTrigger={refreshTrigger} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border/50 hover:border-primary/30 hover:shadow-premium transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              </div>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-border/50 hover:border-primary/30 hover:shadow-premium transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
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
        </motion.div>
      </div>
    </div>
  )
}
