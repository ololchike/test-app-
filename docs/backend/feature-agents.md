# Feature: Agent Management

## Status
- [x] Requirements Approved
- [ ] Design Complete
- [ ] Implementation Started
- [ ] Implementation Complete
- [ ] Testing Complete
- [ ] Deployed

## Overview

The agent management system handles the complete lifecycle of tour operators on the platform, including registration, verification, profile management, commission tracking, and performance monitoring.

## User Stories

### Agent (Self-Management)
- As an agent, I want to register my business on the platform
- As an agent, I want to complete my profile with business details
- As an agent, I want to upload verification documents
- As an agent, I want to view my commission rate and tier
- As an agent, I want to track my earnings and pending balance
- As an agent, I want to update my payment details for withdrawals
- As an agent, I want to see my performance metrics

### Admin (Agent Management)
- As an admin, I want to view all registered agents
- As an admin, I want to review pending agent applications
- As an admin, I want to approve or reject agent applications
- As an admin, I want to verify agent documents
- As an admin, I want to suspend problematic agents
- As an admin, I want to adjust agent commission rates
- As an admin, I want to view agent performance reports

## Acceptance Criteria

### Agent Registration
- [ ] New agent can register with business name, phone, and email
- [ ] Agent account created in PENDING status
- [ ] Confirmation email sent with next steps
- [ ] Admin notified of new agent application

### Agent Profile
- [ ] Agent can update business name, description, logo
- [ ] Agent can add contact details (phone, WhatsApp, email, address)
- [ ] Agent can upload verification documents (business registration, tourism license)
- [ ] Profile completion percentage is calculated and displayed
- [ ] Agent can set preferred payment method and details

### Agent Verification
- [ ] Admin can view uploaded documents
- [ ] Admin can approve agent (status: APPROVED)
- [ ] Admin can reject agent with reason (status: REJECTED)
- [ ] Agent receives email notification on status change
- [ ] Approved agents can publish tours immediately

### Agent Suspension
- [ ] Admin can suspend agent with reason
- [ ] Suspended agent cannot login or create new tours
- [ ] Existing published tours are unpublished
- [ ] Pending bookings remain active
- [ ] Agent receives suspension notification

### Commission Management
- [ ] Default commission rate applied to new agents (15%)
- [ ] Admin can adjust individual agent rates
- [ ] Commission tier upgrades based on monthly volume
- [ ] Commission rate locked at booking time
- [ ] Historical commission rates maintained

### Performance Tracking
- [ ] Track total bookings per agent
- [ ] Track total revenue generated
- [ ] Track average rating
- [ ] Track response time to inquiries
- [ ] Monthly performance reports available

## Technical Requirements

### Agent Registration API

```typescript
// app/api/agents/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendAgentWelcomeEmail, notifyAdminNewAgent } from "@/lib/email"
import { z } from "zod"

const agentRegisterSchema = z.object({
  userId: z.string(),
  businessName: z.string().min(2).max(100),
  businessRegNumber: z.string().optional(),
  phone: z.string().min(10),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("Kenya"),
  bio: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = agentRegisterSchema.parse(body)

    // Check if agent profile already exists
    const existing = await prisma.agent.findUnique({
      where: { userId: data.userId },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Agent profile already exists" },
        { status: 400 }
      )
    }

    // Get default commission rate
    const defaultConfig = await prisma.commissionConfig.findFirst({
      where: { tier: "tier_1", isActive: true },
    })

    // Create agent profile
    const agent = await prisma.agent.create({
      data: {
        userId: data.userId,
        businessName: data.businessName,
        businessRegNumber: data.businessRegNumber,
        phone: data.phone,
        whatsapp: data.whatsapp || data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        bio: data.bio,
        status: "PENDING",
        commissionRate: defaultConfig?.percentage || 15,
      },
      include: {
        user: { select: { email: true, name: true } },
      },
    })

    // Send welcome email
    await sendAgentWelcomeEmail(agent.user.email, agent.businessName)

    // Notify admin
    await notifyAdminNewAgent(agent)

    return NextResponse.json({ success: true, data: agent }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Agent registration error:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}
```

### Agent Profile API

```typescript
// app/api/agents/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET - Get agent profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const agent = await prisma.agent.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true, image: true } },
      _count: {
        select: {
          tours: { where: { status: "PUBLISHED" } },
          bookings: { where: { status: "COMPLETED" } },
        },
      },
    },
  })

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  // Calculate average rating
  const ratingResult = await prisma.review.aggregate({
    where: { tour: { agentId: agent.id } },
    _avg: { rating: true },
    _count: true,
  })

  return NextResponse.json({
    success: true,
    data: {
      ...agent,
      averageRating: ratingResult._avg.rating || 0,
      reviewCount: ratingResult._count,
    },
  })
}

// PUT - Update agent profile
const updateSchema = z.object({
  businessName: z.string().min(2).max(100).optional(),
  businessRegNumber: z.string().optional(),
  phone: z.string().min(10).optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().max(1000).optional(),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const agent = await prisma.agent.findUnique({
    where: { id: params.id },
  })

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  // Verify ownership or admin
  if (agent.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = updateSchema.parse(body)

    const updated = await prisma.agent.update({
      where: { id: params.id },
      data,
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

### Agent Earnings API

```typescript
// app/api/agents/[id]/earnings/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const agent = await prisma.agent.findUnique({
    where: { id: params.id },
  })

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  // Verify ownership or admin
  if (agent.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "month" // day, week, month, year, all

  // Calculate date range
  const now = new Date()
  let startDate: Date

  switch (period) {
    case "day":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      startDate = new Date(0)
  }

  // Get earnings for period
  const periodEarnings = await prisma.booking.aggregate({
    where: {
      agentId: params.id,
      status: { in: ["CONFIRMED", "COMPLETED"] },
      payment: { status: "COMPLETED" },
      createdAt: { gte: startDate },
    },
    _sum: {
      totalPrice: true,
      commissionAmount: true,
      agentEarnings: true,
    },
    _count: true,
  })

  // Get monthly breakdown (last 6 months)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const monthlyBreakdown = await prisma.$queryRaw`
    SELECT
      DATE_TRUNC('month', "createdAt") as month,
      SUM("totalPrice") as gross,
      SUM("commissionAmount") as commission,
      SUM("agentEarnings") as net,
      COUNT(*) as bookings
    FROM "Booking"
    WHERE "agentId" = ${params.id}
      AND "status" IN ('CONFIRMED', 'COMPLETED')
      AND "createdAt" >= ${sixMonthsAgo}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month DESC
  `

  // Get recent transactions
  const recentTransactions = await prisma.booking.findMany({
    where: {
      agentId: params.id,
      status: { in: ["CONFIRMED", "COMPLETED"] },
      payment: { status: "COMPLETED" },
    },
    select: {
      id: true,
      bookingNumber: true,
      totalPrice: true,
      commissionAmount: true,
      agentEarnings: true,
      createdAt: true,
      tour: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return NextResponse.json({
    success: true,
    data: {
      summary: {
        totalEarnings: agent.totalEarnings,
        availableBalance: agent.availableBalance,
        pendingBalance: agent.pendingBalance,
        commissionRate: agent.commissionRate,
      },
      period: {
        name: period,
        grossRevenue: periodEarnings._sum.totalPrice || 0,
        commission: periodEarnings._sum.commissionAmount || 0,
        netEarnings: periodEarnings._sum.agentEarnings || 0,
        bookingsCount: periodEarnings._count,
      },
      monthlyBreakdown,
      recentTransactions,
    },
  })
}
```

### Admin Agent Management API

```typescript
// app/api/admin/agents/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")

  const where: any = {}

  if (status) {
    where.status = status
  }

  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { phone: { contains: search } },
    ]
  }

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
        _count: {
          select: {
            tours: true,
            bookings: { where: { status: "COMPLETED" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.agent.count({ where }),
  ])

  // Get status counts
  const statusCounts = await prisma.agent.groupBy({
    by: ["status"],
    _count: true,
  })

  return NextResponse.json({
    success: true,
    data: agents,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      statusCounts: Object.fromEntries(
        statusCounts.map((s) => [s.status, s._count])
      ),
    },
  })
}
```

### Agent Status Update API (Admin)

```typescript
// app/api/admin/agents/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  sendAgentApprovalEmail,
  sendAgentRejectionEmail,
  sendAgentSuspensionEmail
} from "@/lib/email"
import { z } from "zod"

const statusUpdateSchema = z.object({
  status: z.enum(["APPROVED", "SUSPENDED"]),
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
    const data = statusUpdateSchema.parse(body)

    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Handle status transitions
    await prisma.$transaction(async (tx) => {
      // Update agent status
      await tx.agent.update({
        where: { id: params.id },
        data: {
          status: data.status,
          verifiedAt: data.status === "APPROVED" ? new Date() : undefined,
          verifiedBy: data.status === "APPROVED" ? session.user.id : undefined,
        },
      })

      // If suspending, unpublish all tours
      if (data.status === "SUSPENDED") {
        await tx.tour.updateMany({
          where: { agentId: params.id, status: "PUBLISHED" },
          data: { status: "ARCHIVED" },
        })
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: `AGENT_${data.status}`,
          entityType: "Agent",
          entityId: params.id,
          oldValue: { status: agent.status },
          newValue: { status: data.status, reason: data.reason },
        },
      })
    })

    // Send notification email
    if (data.status === "APPROVED") {
      await sendAgentApprovalEmail(agent.user.email, agent.businessName)
    } else if (data.status === "SUSPENDED") {
      await sendAgentSuspensionEmail(agent.user.email, agent.businessName, data.reason)
    }

    return NextResponse.json({
      success: true,
      message: `Agent ${data.status.toLowerCase()} successfully`,
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

### Commission Rate Update API (Admin)

```typescript
// app/api/admin/agents/[id]/commission/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const commissionSchema = z.object({
  commissionRate: z.number().min(5).max(30),
  reason: z.string().min(10),
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
    const data = commissionSchema.parse(body)

    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const oldRate = agent.commissionRate

    await prisma.$transaction(async (tx) => {
      await tx.agent.update({
        where: { id: params.id },
        data: { commissionRate: data.commissionRate },
      })

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "COMMISSION_RATE_CHANGED",
          entityType: "Agent",
          entityId: params.id,
          oldValue: { commissionRate: oldRate },
          newValue: { commissionRate: data.commissionRate, reason: data.reason },
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: `Commission rate updated from ${oldRate}% to ${data.commissionRate}%`,
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

### Profile Completion Calculator

```typescript
// lib/utils/agent.ts

export function calculateProfileCompletion(agent: Agent): number {
  const fields = [
    { field: "businessName", weight: 15 },
    { field: "businessRegNumber", weight: 10 },
    { field: "phone", weight: 10 },
    { field: "whatsapp", weight: 5 },
    { field: "address", weight: 10 },
    { field: "city", weight: 5 },
    { field: "bio", weight: 15 },
    { field: "logo", weight: 15 },
    { field: "website", weight: 5 },
    { field: "verifiedAt", weight: 10 }, // Documents verified
  ]

  let totalWeight = 0
  let completedWeight = 0

  for (const { field, weight } of fields) {
    totalWeight += weight
    if (agent[field as keyof Agent]) {
      completedWeight += weight
    }
  }

  return Math.round((completedWeight / totalWeight) * 100)
}
```

## Dependencies

- Prisma (database)
- Email service (Resend)
- Cloudinary (logo upload)
- Zod (validation)

## MVP Phase
Phase 1 - Core MVP (Sprint 7-8)

## Estimated Effort
13 story points

## Implementation Notes

### Agent Lifecycle

```
PENDING → (admin approval) → APPROVED → (violation) → SUSPENDED
    ↓                                        ↑
    └──── (admin rejection) ──────────────────
```

### Commission Tiers

| Tier | Monthly Volume | Commission Rate |
|------|----------------|-----------------|
| Standard | $0 - $5,000 | 15% |
| Premium | $5,001 - $20,000 | 12% |
| Elite | $20,001+ | 10% |

### Security Checklist
- [ ] Agent can only update their own profile
- [ ] Admin-only endpoints protected
- [ ] Audit logging for status changes
- [ ] Document upload size limits

### Testing Checklist
- [ ] Agent registration flow
- [ ] Profile update
- [ ] Admin approval flow
- [ ] Admin rejection flow
- [ ] Suspension and tour unpublishing
- [ ] Commission rate updates
- [ ] Earnings calculation

## Approval
- [ ] User Approved
- Date:
- Notes:
