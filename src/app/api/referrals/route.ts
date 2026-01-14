import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateReferralCode, REFERRAL_CONFIG } from "@/lib/referral"

// GET - Get user's referral stats and code
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get or create user's referral code
    let existingReferral = await prisma.referral.findFirst({
      where: {
        referrerId: userId,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    // If no active referral code, create one
    if (!existingReferral) {
      const code = generateReferralCode(userId)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + REFERRAL_CONFIG.referralExpiryDays)

      existingReferral = await prisma.referral.create({
        data: {
          referrerId: userId,
          referralCode: code,
          expiresAt,
        },
      })
    }

    // Get referral stats
    const [totalReferrals, completedReferrals, pendingReferrals] = await Promise.all([
      prisma.referral.count({ where: { referrerId: userId } }),
      prisma.referral.count({ where: { referrerId: userId, status: "COMPLETED" } }),
      prisma.referral.count({
        where: {
          referrerId: userId,
          status: { in: ["PENDING", "SIGNED_UP", "BOOKED"] },
        },
      }),
    ])

    // Get total credits earned (separated by source)
    const [creditsResult, reviewCreditsResult, creditsUsedResult] = await Promise.all([
      // Referral credits earned
      prisma.referralCredit.aggregate({
        where: {
          userId,
          type: "EARNED",
          source: "REFERRAL",
        },
        _sum: { amount: true },
      }),
      // Review credits earned
      prisma.referralCredit.aggregate({
        where: {
          userId,
          type: "EARNED",
          source: "REVIEW",
        },
        _sum: { amount: true },
      }),
      // Credits used/redeemed
      prisma.referralCredit.aggregate({
        where: {
          userId,
          type: "REDEEMED",
        },
        _sum: { amount: true },
      }),
    ])

    const referralCredits = creditsResult._sum.amount || 0
    const reviewCredits = reviewCreditsResult._sum.amount || 0
    const totalEarned = referralCredits + reviewCredits
    const totalUsed = creditsUsedResult._sum.amount || 0
    const availableCredits = totalEarned - totalUsed

    // Get review rewards count
    const reviewRewardsCount = await prisma.reviewReward.count({
      where: { userId },
    })

    // Get recent referrals
    const recentReferrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return NextResponse.json({
      referralCode: existingReferral.referralCode,
      stats: {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        totalEarned,
        availableCredits,
        referralCredits,
        reviewCredits,
        reviewRewardsCount,
      },
      recentReferrals,
      config: REFERRAL_CONFIG,
    })
  } catch (error) {
    console.error("Error fetching referral data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Share referral (track email sent)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email } = await request.json()
    const userId = session.user.id

    // Generate new referral for specific email
    const code = generateReferralCode(userId)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFERRAL_CONFIG.referralExpiryDays)

    const referral = await prisma.referral.create({
      data: {
        referrerId: userId,
        referredEmail: email,
        referralCode: code,
        expiresAt,
      },
    })

    return NextResponse.json({
      referralCode: referral.referralCode,
      message: "Referral created successfully",
    })
  } catch (error) {
    console.error("Error creating referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
