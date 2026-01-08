# Feature: Review System

## Status
- [x] Requirements Approved
- [ ] Design Complete
- [ ] Implementation Started
- [ ] Implementation Complete
- [ ] Testing Complete
- [ ] Deployed

## Overview

The review system enables clients to leave verified reviews after completing tours, helps future clients make informed decisions, and provides agents with valuable feedback. Reviews include ratings, text comments, and agent response capabilities.

## User Stories

### Client
- As a client, I want to leave a review after my trip is completed
- As a client, I want to rate my experience from 1-5 stars
- As a client, I want to write a detailed review comment
- As a client, I want to see if my review is verified (verified purchase)
- As a client, I want to see the agent's response to my review
- As a client, I want to edit my review within 7 days

### Agent
- As an agent, I want to see all reviews for my tours
- As an agent, I want to respond to client reviews
- As an agent, I want to see my average rating
- As an agent, I want to be notified of new reviews

### Admin
- As an admin, I want to moderate reviews
- As an admin, I want to hide inappropriate reviews
- As an admin, I want to see review analytics

### Public (Client Browsing)
- As a visitor, I want to see reviews on tour pages
- As a visitor, I want to filter reviews by rating
- As a visitor, I want to see the overall rating breakdown
- As a visitor, I want to see verified purchase badges

## Acceptance Criteria

### Review Submission
- [ ] Client can only review completed bookings
- [ ] Client can submit rating (1-5 stars, required)
- [ ] Client can add optional title (max 100 chars)
- [ ] Client can add optional comment (max 2000 chars)
- [ ] Review marked as "Verified Purchase" automatically
- [ ] Client can edit review within 7 days of submission
- [ ] Client cannot submit multiple reviews per booking

### Review Display
- [ ] Tour page shows average rating and review count
- [ ] Reviews sorted by most recent by default
- [ ] Verified purchase badge displayed
- [ ] Agent response displayed under review
- [ ] Rating breakdown chart shown (5-star, 4-star, etc.)
- [ ] Pagination for reviews (10 per page)

### Agent Response
- [ ] Agent can respond once to each review
- [ ] Response appears below the review
- [ ] Agent can edit response within 48 hours
- [ ] Response timestamp displayed

### Review Moderation
- [ ] Admin can unpublish inappropriate reviews
- [ ] Admin can flag reviews for investigation
- [ ] Automated filtering for profanity (Phase 2)

## Technical Requirements

### Review Submission API

```typescript
// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(2000).optional(),
})

// POST - Create review
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = reviewSchema.parse(body)

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        tour: true,
        review: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Verify ownership
    if (booking.clientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check booking status
    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only review completed bookings" },
        { status: 400 }
      )
    }

    // Check for existing review
    if (booking.review) {
      return NextResponse.json(
        { error: "Review already submitted for this booking" },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          bookingId: data.bookingId,
          clientId: session.user.id,
          tourId: booking.tourId,
          rating: data.rating,
          title: data.title,
          comment: data.comment,
          isVerified: true, // Verified purchase
          isPublished: true,
        },
        include: {
          client: { select: { name: true, image: true } },
        },
      })

      // Update tour average rating
      const avgRating = await tx.review.aggregate({
        where: { tourId: booking.tourId, isPublished: true },
        _avg: { rating: true },
        _count: true,
      })

      await tx.tour.update({
        where: { id: booking.tourId },
        data: {
          averageRating: avgRating._avg.rating || 0,
          reviewCount: avgRating._count,
        },
      })

      return newReview
    })

    // TODO: Send notification to agent

    return NextResponse.json({ success: true, data: review }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Review error:", error)
    return NextResponse.json({ error: "Review failed" }, { status: 500 })
  }
}

// GET - List reviews for a tour
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tourId = searchParams.get("tourId")
  const agentId = searchParams.get("agentId")
  const rating = searchParams.get("rating")
  const sort = searchParams.get("sort") || "recent"
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")

  const where: any = { isPublished: true }

  if (tourId) where.tourId = tourId
  if (agentId) where.tour = { agentId }
  if (rating) where.rating = parseInt(rating)

  const orderBy: any =
    sort === "recent"
      ? { createdAt: "desc" }
      : sort === "rating_high"
      ? { rating: "desc" }
      : sort === "rating_low"
      ? { rating: "asc" }
      : { createdAt: "desc" }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        client: { select: { name: true, image: true } },
        tour: { select: { title: true, slug: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ])

  // Get rating breakdown if tourId provided
  let ratingBreakdown = null
  if (tourId) {
    const breakdown = await prisma.review.groupBy({
      by: ["rating"],
      where: { tourId, isPublished: true },
      _count: true,
    })
    ratingBreakdown = Object.fromEntries(
      breakdown.map((b) => [b.rating, b._count])
    )
  }

  return NextResponse.json({
    success: true,
    data: reviews,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      ratingBreakdown,
    },
  })
}
```

### Review Update API

```typescript
// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).optional(),
  comment: z.string().max(2000).optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const review = await prisma.review.findUnique({
    where: { id: params.id },
  })

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  // Verify ownership
  if (review.clientId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Check edit window (7 days)
  const daysSinceCreation =
    (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceCreation > 7) {
    return NextResponse.json(
      { error: "Edit window has expired (7 days)" },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const data = updateSchema.parse(body)

    const updated = await prisma.$transaction(async (tx) => {
      const updatedReview = await tx.review.update({
        where: { id: params.id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      })

      // Recalculate tour average if rating changed
      if (data.rating) {
        const avgRating = await tx.review.aggregate({
          where: { tourId: review.tourId, isPublished: true },
          _avg: { rating: true },
        })

        await tx.tour.update({
          where: { id: review.tourId },
          data: { averageRating: avgRating._avg.rating || 0 },
        })
      }

      return updatedReview
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    throw error
  }
}
```

### Agent Response API

```typescript
// app/api/reviews/[id]/response/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const responseSchema = z.object({
  response: z.string().min(10).max(1000),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get agent
  const agent = await prisma.agent.findUnique({
    where: { userId: session.user.id },
  })

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: { tour: true },
  })

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  // Verify tour belongs to agent
  if (review.tour.agentId !== agent.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Check if already responded
  if (review.agentResponse) {
    return NextResponse.json(
      { error: "Response already submitted" },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const data = responseSchema.parse(body)

    const updated = await prisma.review.update({
      where: { id: params.id },
      data: {
        agentResponse: data.response,
        respondedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    throw error
  }
}

// PUT - Update response (within 48 hours)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const agent = await prisma.agent.findUnique({
    where: { userId: session.user.id },
  })

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: { tour: true },
  })

  if (!review || review.tour.agentId !== agent.id) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  if (!review.respondedAt) {
    return NextResponse.json({ error: "No response to update" }, { status: 400 })
  }

  // Check edit window (48 hours)
  const hoursSinceResponse =
    (Date.now() - review.respondedAt.getTime()) / (1000 * 60 * 60)
  if (hoursSinceResponse > 48) {
    return NextResponse.json(
      { error: "Edit window has expired (48 hours)" },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const data = responseSchema.parse(body)

    const updated = await prisma.review.update({
      where: { id: params.id },
      data: {
        agentResponse: data.response,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    throw error
  }
}
```

### Admin Review Moderation API

```typescript
// app/api/admin/reviews/[id]/moderate/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const moderationSchema = z.object({
  action: z.enum(["publish", "unpublish", "flag"]),
  reason: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = moderationSchema.parse(body)

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    const updateData: any = {}

    switch (data.action) {
      case "publish":
        updateData.isPublished = true
        break
      case "unpublish":
        updateData.isPublished = false
        break
      case "flag":
        // Could add a flagged field to the schema
        break
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.update({
        where: { id: params.id },
        data: updateData,
      })

      // Recalculate tour rating
      const avgRating = await tx.review.aggregate({
        where: { tourId: review.tourId, isPublished: true },
        _avg: { rating: true },
        _count: true,
      })

      await tx.tour.update({
        where: { id: review.tourId },
        data: {
          averageRating: avgRating._avg.rating || 0,
          reviewCount: avgRating._count,
        },
      })

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: `REVIEW_${data.action.toUpperCase()}`,
          entityType: "Review",
          entityId: params.id,
          newValue: { action: data.action, reason: data.reason },
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: `Review ${data.action}ed successfully`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    throw error
  }
}
```

### Tour Review Summary Query

```typescript
// lib/queries/reviews.ts

export async function getTourReviewSummary(tourId: string) {
  const [summary, breakdown, recent] = await Promise.all([
    // Aggregate summary
    prisma.review.aggregate({
      where: { tourId, isPublished: true },
      _avg: { rating: true },
      _count: true,
    }),

    // Rating breakdown
    prisma.review.groupBy({
      by: ["rating"],
      where: { tourId, isPublished: true },
      _count: true,
    }),

    // Recent reviews
    prisma.review.findMany({
      where: { tourId, isPublished: true },
      include: {
        client: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  const ratingBreakdown: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  }
  breakdown.forEach((b) => {
    ratingBreakdown[b.rating] = b._count
  })

  return {
    averageRating: summary._avg.rating || 0,
    totalReviews: summary._count,
    ratingBreakdown,
    recentReviews: recent,
  }
}
```

## Dependencies

- Prisma (database)
- Zod (validation)
- Email service for notifications

## MVP Phase
Phase 2 - Growth Features (Sprint 9-10)

## Estimated Effort
13 story points

## Implementation Notes

### Review Timeline

```
Booking COMPLETED
         |
         v
Client can submit review
         |
         v
Review published (isPublished: true)
         |
    /---------\
    |         |
    v         v
 7 days    Agent can
to edit    respond
             |
             v
          48 hours
          to edit response
```

### Rating Calculation

```typescript
// After any review change (create, update, delete, moderate)
const avgRating = await prisma.review.aggregate({
  where: { tourId, isPublished: true },
  _avg: { rating: true },
  _count: true,
})

await prisma.tour.update({
  where: { id: tourId },
  data: {
    averageRating: avgRating._avg.rating || 0,
    reviewCount: avgRating._count,
  },
})
```

### Security Checklist
- [ ] Only completed booking owners can review
- [ ] One review per booking enforced
- [ ] Edit windows enforced (7 days client, 48 hours agent)
- [ ] Admin-only moderation endpoints
- [ ] XSS prevention on review content

### Testing Checklist
- [ ] Submit review (happy path)
- [ ] Submit review (not completed booking)
- [ ] Submit review (duplicate)
- [ ] Edit review within window
- [ ] Edit review after window
- [ ] Agent respond to review
- [ ] Admin moderate review
- [ ] Rating recalculation

## Approval
- [ ] User Approved
- Date:
- Notes:
