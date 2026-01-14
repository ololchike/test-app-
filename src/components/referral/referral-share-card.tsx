"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Gift,
  Copy,
  Check,
  Share2,
  Mail,
  MessageCircle,
  Twitter,
  Facebook,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { getReferralLink, REFERRAL_CONFIG, formatCredit } from "@/lib/referral"
import { cn } from "@/lib/utils"

interface ReferralShareCardProps {
  referralCode: string
  className?: string
}

export function ReferralShareCard({ referralCode, className }: ReferralShareCardProps) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)

  const referralLink = getReferralLink(referralCode)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast.success("Referral link copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const handleShare = (platform: string) => {
    const message = `Join me on SafariPlus and get ${REFERRAL_CONFIG.referredDiscount}% off your first safari booking! Use my referral link:`
    const encodedMessage = encodeURIComponent(message)
    const encodedLink = encodeURIComponent(referralLink)

    let shareUrl = ""
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedLink}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedMessage}`
        break
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedMessage}%20${encodedLink}`
        break
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent("Join me on SafariPlus!")}&body=${encodedMessage}%20${encodedLink}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  const handleEmailInvite = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast.success(`Invitation sent to ${email}`)
        setEmail("")
      } else {
        toast.error("Failed to send invitation")
      }
    } catch {
      toast.error("Failed to send invitation")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl">Refer Friends, Earn Rewards</CardTitle>
            <p className="text-white/80 text-sm mt-1">
              Give {REFERRAL_CONFIG.referredDiscount}% off, get {formatCredit(REFERRAL_CONFIG.referrerReward)} credit
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* How it works */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Share2 className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium">Share your link</p>
          </div>
          <div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium">Friend books</p>
          </div>
          <div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium">You both earn</p>
          </div>
        </div>

        {/* Referral Link */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Your Referral Link
          </label>
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm bg-muted"
            />
            <Button onClick={handleCopy} variant="outline" className="shrink-0">
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Code: <span className="font-mono font-bold">{referralCode}</span>
          </p>
        </div>

        {/* Share buttons */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Share via
          </label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleShare("whatsapp")}
            >
              <MessageCircle className="h-5 w-5 text-green-600" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="h-5 w-5 text-sky-500" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleShare("facebook")}
            >
              <Facebook className="h-5 w-5 text-blue-600" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleShare("email")}
            >
              <Mail className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Email invite */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Or invite by email
          </label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailInvite()}
            />
            <Button onClick={handleEmailInvite} disabled={isSending}>
              {isSending ? "Sending..." : "Invite"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
