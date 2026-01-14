"use client"

import { motion } from "framer-motion"
import { Gift, Star, Camera, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { REFERRAL_CONFIG } from "@/lib/referral"
import { cn } from "@/lib/utils"

interface ReviewIncentiveBannerProps {
  variant?: "compact" | "full"
  className?: string
}

export function ReviewIncentiveBanner({ variant = "full", className }: ReviewIncentiveBannerProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800", className)}>
        <Gift className="h-5 w-5 text-green-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Earn ${REFERRAL_CONFIG.reviewCredit} credit for your review
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            +${REFERRAL_CONFIG.photoBonus} bonus for including photos
          </p>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800", className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center shrink-0">
            <Gift className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              Share Your Experience, Earn Rewards
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
              Your honest feedback helps other travelers make informed decisions and supports our tour operators.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-black/20"
              >
                <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Write a Review</p>
                  <p className="text-xs text-muted-foreground">Earn ${REFERRAL_CONFIG.reviewCredit} credit</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-black/20"
              >
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Camera className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Add Photos</p>
                  <p className="text-xs text-muted-foreground">+${REFERRAL_CONFIG.photoBonus} bonus</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
