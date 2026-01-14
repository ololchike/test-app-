"use client"

import { Gift, Users, DollarSign, TrendingUp, Clock, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCredit, getReferralStatusDisplay } from "@/lib/referral"
import { cn } from "@/lib/utils"

interface ReferralStats {
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
  totalEarned: number
  availableCredits: number
  referralCredits?: number
  reviewCredits?: number
  reviewRewardsCount?: number
}

interface RecentReferral {
  id: string
  referredEmail?: string | null
  status: string
  referrerReward: number
  createdAt: string
}

interface ReferralStatsCardProps {
  stats: ReferralStats
  recentReferrals: RecentReferral[]
  className?: string
}

export function ReferralStatsCard({ stats, recentReferrals, className }: ReferralStatsCardProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                <p className="text-xs text-muted-foreground">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedReferrals}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.reviewRewardsCount || 0}</p>
                <p className="text-xs text-muted-foreground">Review Rewards</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{formatCredit(stats.availableCredits)}</p>
                <p className="text-xs text-muted-foreground">Available Credit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credits Breakdown */}
      {(stats.referralCredits || stats.reviewCredits) && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-4">Credit Breakdown</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-bold">{formatCredit(stats.referralCredits || 0)}</p>
                  <p className="text-xs text-muted-foreground">From Referrals</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-bold">{formatCredit(stats.reviewCredits || 0)}</p>
                  <p className="text-xs text-muted-foreground">From Reviews</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Recent Referrals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentReferrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No referrals yet</p>
              <p className="text-sm">Share your link to start earning!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReferrals.map((referral) => {
                const statusDisplay = getReferralStatusDisplay(referral.status)
                return (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {referral.referredEmail || "Referral Link"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {referral.status === "COMPLETED" && (
                        <span className="text-sm font-medium text-green-600">
                          +{formatCredit(referral.referrerReward)}
                        </span>
                      )}
                      <Badge
                        variant="secondary"
                        className={cn(
                          statusDisplay.color === "yellow" && "bg-yellow-100 text-yellow-700",
                          statusDisplay.color === "blue" && "bg-blue-100 text-blue-700",
                          statusDisplay.color === "purple" && "bg-purple-100 text-purple-700",
                          statusDisplay.color === "green" && "bg-green-100 text-green-700",
                          statusDisplay.color === "gray" && "bg-gray-100 text-gray-700"
                        )}
                      >
                        {statusDisplay.label}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
