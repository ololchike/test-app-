import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createLogger } from "@/lib/logger"
import { REFERRAL_CONFIG } from "@/lib/referral"

const log = createLogger("Reviews API")

const reviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  title: z.string().max(100).optional(),
  content: z.string().min(10, "Review must be at least 10 characters").max(2000, "Review must be less than 2000 characters"),
  images: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to submit a review." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = reviewSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Get booking with tour info
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        tour: true,
        review: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Verify ownership
    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only review your own bookings" },
        { status: 403 }
      )
    }

    // Check booking status - only COMPLETED bookings can be reviewed
    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Only completed bookings can be reviewed" },
        { status: 400 }
      )
    }

    // Check for existing review
    if (booking.review) {
      return NextResponse.json(
        { error: "You have already reviewed this booking" },
        { status: 400 }
      )
    }

    // Determine reward amount based on whether photos were included
    const hasPhotos = data.images && data.images.length > 0
    const rewardAmount = hasPhotos
      ? REFERRAL_CONFIG.reviewCredit + REFERRAL_CONFIG.photoBonus
      : REFERRAL_CONFIG.reviewCredit

    // Create review, reward, and update tour rating in a transaction
    const { review, creditAmount } = await prisma.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.review.create({
        data: {
          userId: session.user.id,
          tourId: booking.tourId,
          bookingId: data.bookingId,
          rating: data.rating,
          title: data.title,
          content: data.content,
          images: JSON.stringify(data.images || []),
          isVerified: true, // Verified purchase
          isApproved: true, // Auto-approve for now (can add moderation later)
        },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      })

      // Create review reward
      await tx.reviewReward.create({
        data: {
          userId: session.user.id,
          reviewId: newReview.id,
          creditAmount: rewardAmount,
          hasPhotos,
        },
      })

      // Add referral credit to user's account
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + REFERRAL_CONFIG.creditExpiryDays)

      await tx.referralCredit.create({
        data: {
          userId: session.user.id,
          amount: rewardAmount,
          source: "REVIEW",
          expiresAt: expiryDate,
          description: hasPhotos
            ? `Review reward with photo bonus for ${booking.tour.title}`
            : `Review reward for ${booking.tour.title}`,
        },
      })

      // Recalculate tour average rating
      const avgRating = await tx.review.aggregate({
        where: {
          tourId: booking.tourId,
          isApproved: true
        },
        _avg: { rating: true },
        _count: true,
      })

      // Note: Tour model doesn't have averageRating/reviewCount fields yet
      // We'll calculate these on-the-fly when fetching tours

      return { review: newReview, creditAmount: rewardAmount }
    })

    return NextResponse.json(
      {
        success: true,
        data: review,
        reward: {
          amount: creditAmount,
          hasPhotoBonus: hasPhotos,
        },
        message: `Review submitted successfully! You earned $${creditAmount} credit.`
      },
      { status: 201 }
    )
  } catch (error) {
    log.error("Review submission error", error)
    return NextResponse.json(
      { error: "Failed to submit review. Please try again." },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get("tourId")
    const userId = searchParams.get("userId")
    const rating = searchParams.get("rating")
    const sort = searchParams.get("sort") || "recent"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    // Build where clause with Prisma-compatible types
    const where: {
      isApproved: boolean
      tourId?: string
      userId?: string
      rating?: number
    } = { isApproved: true }

    if (tourId) where.tourId = tourId
    if (userId) where.userId = userId
    if (rating) where.rating = parseInt(rating)

    // Build orderBy clause
    let orderBy: { createdAt?: "desc" | "asc"; rating?: "desc" | "asc"; helpfulCount?: "desc" | "asc" } = { createdAt: "desc" }

    if (sort === "highest") {
      orderBy = { rating: "desc" }
    } else if (sort === "lowest") {
      orderBy = { rating: "asc" }
    } else if (sort === "helpful") {
      orderBy = { helpfulCount: "desc" }
    }

    // Fetch reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
          tour: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ])

    // Get rating breakdown if tourId is provided
    let ratingBreakdown: Record<number, number> | null = null
    if (tourId) {
      const breakdown = await prisma.review.groupBy({
        by: ["rating"],
        where: { tourId, isApproved: true },
        _count: true,
      })

      const initialBreakdown: Record<number, number> = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      }

      breakdown.forEach((item) => {
        initialBreakdown[item.rating] = item._count
      })

      ratingBreakdown = initialBreakdown
    }

    // Parse images JSON for each review
    const reviewsWithParsedImages = reviews.map((review) => ({
      ...review,
      images: JSON.parse(review.images),
    }))

    return NextResponse.json({
      success: true,
      data: reviewsWithParsedImages,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        ratingBreakdown,
      },
    })
  } catch (error) {
    log.error("Error fetching reviews", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}
