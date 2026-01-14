// Referral program configuration and utilities

export const REFERRAL_CONFIG = {
  // Rewards
  referrerReward: 25, // USD credit for referrer when referred user completes booking
  referredDiscount: 10, // Percentage discount for new user
  photoReviewBonus: 5, // Extra credit for photo reviews

  // Review rewards
  reviewCredit: 10, // USD credit for leaving a review
  photoBonus: 5, // Extra credit for including photos

  // Expiration
  referralExpiryDays: 30, // Days until referral link expires
  creditExpiryDays: 365, // Days until credits expire

  // Limits
  maxActiveReferrals: 50, // Max pending referrals per user
  minBookingForReward: 100, // Minimum booking value for referral reward
}

// Generate a unique referral code
export function generateReferralCode(_userId: string): string {
  // cspell:disable-next-line
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Excluding confusing chars
  const randomPart = Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("")
  return `REF${randomPart}`
}

// Generate referral link
export function getReferralLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://safariplus.com"
  return `${baseUrl}/signup?ref=${code}`
}

// Format credit amount
export function formatCredit(amount: number): string {
  return `$${amount.toFixed(0)}`
}

// Calculate referral status display
export function getReferralStatusDisplay(status: string): {
  label: string
  color: string
  description: string
} {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        color: "yellow",
        description: "Waiting for your friend to sign up",
      }
    case "SIGNED_UP":
      return {
        label: "Signed Up",
        color: "blue",
        description: "Your friend has created an account",
      }
    case "BOOKED":
      return {
        label: "Booked",
        color: "purple",
        description: "Your friend has made a booking",
      }
    case "COMPLETED":
      return {
        label: "Completed",
        color: "green",
        description: "Reward earned!",
      }
    case "EXPIRED":
      return {
        label: "Expired",
        color: "gray",
        description: "Referral link expired",
      }
    default:
      return {
        label: status,
        color: "gray",
        description: "",
      }
  }
}
