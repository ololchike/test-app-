"use client"

import { useState, useEffect } from "react"
import { Gift, Loader2 } from "lucide-react"
import { ReferralShareCard, ReferralStatsCard } from "@/components/referral"
import { REFERRAL_CONFIG, formatCredit } from "@/lib/referral"

interface ReferralData {
  referralCode: string
  stats: {
    totalReferrals: number
    completedReferrals: number
    pendingReferrals: number
    totalEarned: number
    availableCredits: number
    referralCredits?: number
    reviewCredits?: number
    reviewRewardsCount?: number
  }
  recentReferrals: {
    id: string
    referredEmail?: string | null
    status: string
    referrerReward: number
    createdAt: string
  }[]
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReferralData() {
      try {
        const response = await fetch("/api/referrals")
        if (!response.ok) {
          throw new Error("Failed to fetch referral data")
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError("Failed to load referral data")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReferralData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Gift className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to load referrals</h2>
        <p className="text-muted-foreground">{error || "Please try again later"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          Refer & Earn
        </h1>
        <p className="text-muted-foreground mt-1">
          Share SafariPlus with friends and earn {formatCredit(REFERRAL_CONFIG.referrerReward)} for each successful referral
        </p>
      </div>

      {/* How it works banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6">
        <h2 className="font-semibold mb-3">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-sm">Share Your Link</p>
              <p className="text-xs text-muted-foreground">
                Send your unique referral link to friends
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-sm">Friend Books a Safari</p>
              <p className="text-xs text-muted-foreground">
                They get {REFERRAL_CONFIG.referredDiscount}% off their first booking
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-sm">You Earn Credit</p>
              <p className="text-xs text-muted-foreground">
                Get {formatCredit(REFERRAL_CONFIG.referrerReward)} credit after their booking completes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Share Card */}
        <div className="lg:col-span-1">
          <ReferralShareCard referralCode={data.referralCode} />
        </div>

        {/* Stats and History */}
        <div className="lg:col-span-2">
          <ReferralStatsCard
            stats={data.stats}
            recentReferrals={data.recentReferrals}
          />
        </div>
      </div>

      {/* Terms */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-4">
        <p className="font-medium mb-2">Terms & Conditions</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Referral credits are issued after the referred booking is completed</li>
          <li>Minimum booking value of ${REFERRAL_CONFIG.minBookingForReward} required for rewards</li>
          <li>Credits expire after {REFERRAL_CONFIG.creditExpiryDays} days</li>
          <li>Cannot be combined with other promotional offers</li>
          <li>SafariPlus reserves the right to modify or cancel the program at any time</li>
        </ul>
      </div>
    </div>
  )
}
