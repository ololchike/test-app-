# Feature: Admin Dashboard Backend

## Status
- [x] Requirements Approved
- [ ] Design Complete
- [ ] Implementation Started
- [ ] Implementation Complete
- [ ] Testing Complete
- [ ] Deployed

## Overview

The admin backend provides APIs for platform administration including dashboard statistics, user management, content moderation, commission configuration, and reporting.

## User Stories

### Dashboard & Analytics
- As an admin, I want to see platform-wide statistics at a glance
- As an admin, I want to view revenue trends over time
- As an admin, I want to see booking volume and patterns
- As an admin, I want to monitor user growth metrics
- As an admin, I want to receive alerts for pending actions

### User Management
- As an admin, I want to manage all platform users
- As an admin, I want to view user activity logs
- As an admin, I want to reset user passwords
- As an admin, I want to suspend/activate user accounts

### Content Management
- As an admin, I want to moderate tour listings
- As an admin, I want to feature/unfeature tours
- As an admin, I want to handle flagged content
- As an admin, I want to manage platform content (FAQs, etc.)

### Configuration
- As an admin, I want to configure commission rates
- As an admin, I want to manage platform settings
- As an admin, I want to configure email templates

## Acceptance Criteria

### Dashboard
- [ ] Shows total revenue (today, week, month, all-time)
- [ ] Shows booking counts by status
- [ ] Shows active user counts (clients, agents)
- [ ] Shows pending actions count (agent approvals, withdrawals)
- [ ] Revenue and booking charts (last 12 months)
- [ ] Recent activity feed

### User Management
- [ ] List all users with pagination and filters
- [ ] Search users by name, email, phone
- [ ] View detailed user profile and history
- [ ] Reset user password (sends email)
- [ ] Suspend/activate user accounts
- [ ] Export user data to CSV

### Tour Management
- [ ] List all tours with filters
- [ ] View tour details and history
- [ ] Approve/reject pending tours
- [ ] Feature/unfeature tours
- [ ] Suspend/activate tours
- [ ] View tour performance metrics

### Commission Configuration
- [ ] View current commission structure
- [ ] Add/edit commission tiers
- [ ] Set effective dates for changes
- [ ] View commission history

## Technical Requirements

### Dashboard Stats API

```typescript
// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Parallel queries for efficiency
  const [
    todayRevenue,
    weekRevenue,
    monthRevenue,
    allTimeRevenue,
    bookingsByStatus,
    userCounts,
    pendingActions,
    recentActivity,
  ] = await Promise.all([
    // Today's revenue
    prisma.booking.aggregate({
      where: {
        createdAt: { gte: today },
        payment: { status: "COMPLETED" },
      },
      _sum: { totalPrice: true },
    }),

    // Week's revenue
    prisma.booking.aggregate({
      where: {
        createdAt: { gte: thisWeek },
        payment: { status: "COMPLETED" },
      },
      _sum: { totalPrice: true },
    }),

    // Month's revenue
    prisma.booking.aggregate({
      where: {
        createdAt: { gte: thisMonth },
        payment: { status: "COMPLETED" },
      },
      _sum: { totalPrice: true },
    }),

    // All-time revenue
    prisma.booking.aggregate({
      where: {
        payment: { status: "COMPLETED" },
      },
      _sum: { totalPrice: true, commissionAmount: true },
    }),

    // Bookings by status
    prisma.booking.groupBy({
      by: ["status"],
      _count: true,
    }),

    // User counts
    prisma.user.groupBy({
      by: ["role"],
      _count: true,
    }),

    // Pending actions
    Promise.all([
      prisma.agent.count({ where: { status: "PENDING" } }),
      prisma.withdrawal.count({ where: { status: "PENDING" } }),
      prisma.tour.count({ where: { status: "DRAFT" } }), // Tours pending review
    ]),

    // Recent activity (audit log)
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        // Would need to add user relation to audit log
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      revenue: {
        today: todayRevenue._sum.totalPrice || 0,
        week: weekRevenue._sum.totalPrice || 0,
        month: monthRevenue._sum.totalPrice || 0,
        allTime: allTimeRevenue._sum.totalPrice || 0,
        commission: allTimeRevenue._sum.commissionAmount || 0,
      },
      bookings: Object.fromEntries(
        bookingsByStatus.map((b) => [b.status, b._count])
      ),
      users: Object.fromEntries(
        userCounts.map((u) => [u.role, u._count])
      ),
      pendingActions: {
        agentApprovals: pendingActions[0],
        withdrawals: pendingActions[1],
        tourReviews: pendingActions[2],
      },
      recentActivity,
    },
  })
}
```

### Revenue Chart API

```typescript
// app/api/admin/stats/revenue/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "12months"

  let startDate: Date
  let groupBy: string

  switch (period) {
    case "30days":
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      groupBy = "day"
      break
    case "12months":
    default:
      startDate = new Date(new Date().setMonth(new Date().getMonth() - 11))
      groupBy = "month"
      break
  }

  const revenueData = await prisma.$queryRaw`
    SELECT
      DATE_TRUNC(${groupBy}, b."createdAt") as period,
      SUM(b."totalPrice") as gross_revenue,
      SUM(b."commissionAmount") as platform_commission,
      SUM(b."agentEarnings") as agent_earnings,
      COUNT(*)::int as booking_count
    FROM "Booking" b
    INNER JOIN "Payment" p ON p."bookingId" = b.id
    WHERE b."createdAt" >= ${startDate}
      AND p.status = 'COMPLETED'
    GROUP BY DATE_TRUNC(${groupBy}, b."createdAt")
    ORDER BY period ASC
  `

  return NextResponse.json({
    success: true,
    data: revenueData,
  })
}
```

### Client Management API

```typescript
// app/api/admin/clients/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")

  const where: any = {
    role: "CLIENT",
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ]
  }

  const [clients, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  // Get total spent per client
  const clientIds = clients.map((c) => c.id)
  const spending = await prisma.booking.groupBy({
    by: ["clientId"],
    where: {
      clientId: { in: clientIds },
      payment: { status: "COMPLETED" },
    },
    _sum: { totalPrice: true },
  })

  const spendingMap = Object.fromEntries(
    spending.map((s) => [s.clientId, s._sum.totalPrice || 0])
  )

  const enrichedClients = clients.map((client) => ({
    ...client,
    totalSpent: spendingMap[client.id] || 0,
  }))

  return NextResponse.json({
    success: true,
    data: enrichedClients,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}
```

### Tour Management API

```typescript
// app/api/admin/tours/route.ts
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
  const agentId = searchParams.get("agentId")
  const featured = searchParams.get("featured")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")

  const where: any = {}

  if (status) where.status = status
  if (agentId) where.agentId = agentId
  if (featured !== null) where.featured = featured === "true"
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { destination: { contains: search, mode: "insensitive" } },
    ]
  }

  const [tours, total, statusCounts] = await Promise.all([
    prisma.tour.findMany({
      where,
      include: {
        agent: { select: { businessName: true } },
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tour.count({ where }),
    prisma.tour.groupBy({
      by: ["status"],
      _count: true,
    }),
  ])

  return NextResponse.json({
    success: true,
    data: tours,
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

### Tour Feature Toggle API

```typescript
// app/api/admin/tours/[id]/feature/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tour = await prisma.tour.findUnique({
    where: { id: params.id },
  })

  if (!tour) {
    return NextResponse.json({ error: "Tour not found" }, { status: 404 })
  }

  const updated = await prisma.tour.update({
    where: { id: params.id },
    data: { featured: !tour.featured },
  })

  // Log action
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: tour.featured ? "TOUR_UNFEATURED" : "TOUR_FEATURED",
      entityType: "Tour",
      entityId: params.id,
    },
  })

  return NextResponse.json({
    success: true,
    data: { featured: updated.featured },
  })
}
```

### Commission Configuration API

```typescript
// app/api/admin/commission/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET - List commission tiers
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const configs = await prisma.commissionConfig.findMany({
    where: { isActive: true },
    orderBy: { minAmount: "asc" },
  })

  return NextResponse.json({
    success: true,
    data: configs,
  })
}

// POST - Create/update commission tier
const commissionSchema = z.object({
  tier: z.string(),
  name: z.string(),
  minAmount: z.number().min(0),
  maxAmount: z.number().nullable(),
  percentage: z.number().min(1).max(50),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = commissionSchema.parse(body)

    const config = await prisma.commissionConfig.upsert({
      where: { tier: data.tier },
      update: {
        name: data.name,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        percentage: data.percentage,
      },
      create: data,
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "COMMISSION_CONFIG_UPDATED",
        entityType: "CommissionConfig",
        entityId: config.id,
        newValue: data,
      },
    })

    return NextResponse.json({ success: true, data: config })
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

### Platform Settings API

```typescript
// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET - List all settings
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const settings = await prisma.platformSettings.findMany()

  return NextResponse.json({
    success: true,
    data: Object.fromEntries(settings.map((s) => [s.key, s.value])),
  })
}

// PUT - Update setting
const settingSchema = z.object({
  key: z.string(),
  value: z.string(),
})

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = settingSchema.parse(body)

    const setting = await prisma.platformSettings.upsert({
      where: { key: data.key },
      update: { value: data.value },
      create: { key: data.key, value: data.value },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SETTING_UPDATED",
        entityType: "PlatformSettings",
        entityId: setting.id,
        newValue: { key: data.key, value: data.value },
      },
    })

    return NextResponse.json({ success: true, data: setting })
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

### Reports API

```typescript
// app/api/admin/reports/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "revenue"
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  const dateFilter = {
    ...(startDate && { gte: new Date(startDate) }),
    ...(endDate && { lte: new Date(endDate) }),
  }

  switch (type) {
    case "revenue":
      return generateRevenueReport(dateFilter)
    case "bookings":
      return generateBookingsReport(dateFilter)
    case "agents":
      return generateAgentReport(dateFilter)
    case "tours":
      return generateTourReport(dateFilter)
    case "users":
      return generateUserReport(dateFilter)
    default:
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
  }
}

async function generateRevenueReport(dateFilter: any) {
  const [summary, byAgent, byMonth] = await Promise.all([
    // Summary
    prisma.booking.aggregate({
      where: {
        createdAt: dateFilter,
        payment: { status: "COMPLETED" },
      },
      _sum: { totalPrice: true, commissionAmount: true, agentEarnings: true },
      _count: true,
      _avg: { totalPrice: true },
    }),

    // By agent
    prisma.booking.groupBy({
      by: ["agentId"],
      where: {
        createdAt: dateFilter,
        payment: { status: "COMPLETED" },
      },
      _sum: { totalPrice: true, commissionAmount: true },
      _count: true,
    }),

    // By month
    prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', "createdAt") as month,
        SUM("totalPrice") as revenue,
        SUM("commissionAmount") as commission,
        COUNT(*)::int as bookings
      FROM "Booking"
      WHERE "createdAt" >= ${dateFilter.gte || new Date(0)}
        AND "createdAt" <= ${dateFilter.lte || new Date()}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `,
  ])

  return NextResponse.json({
    success: true,
    data: {
      type: "revenue",
      summary: {
        grossRevenue: summary._sum.totalPrice || 0,
        platformCommission: summary._sum.commissionAmount || 0,
        agentPayouts: summary._sum.agentEarnings || 0,
        totalBookings: summary._count,
        averageBookingValue: summary._avg.totalPrice || 0,
      },
      byAgent,
      byMonth,
    },
  })
}

// Similar implementations for other report types...
```

## Dependencies

- Prisma (database)
- Zod (validation)
- Date manipulation utilities

## MVP Phase
Phase 1 - Core MVP (Sprint 7-8)

## Estimated Effort
13 story points

## Implementation Notes

### Admin Routes Protection

All admin routes must be protected by middleware:

```typescript
// middleware.ts
if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url))
  }
}
```

### Audit Logging

All admin actions should be logged for compliance:

- User status changes
- Commission changes
- Tour moderation actions
- Settings changes
- Withdrawal approvals

### Caching Strategy

- Dashboard stats: Cache for 5 minutes
- Reports: Cache for 1 hour (invalidate on new data)
- User lists: No cache (real-time)

### Security Checklist
- [ ] All endpoints verify ADMIN role
- [ ] Audit logging for all mutations
- [ ] Rate limiting on bulk operations
- [ ] Sensitive data masked in logs

### Testing Checklist
- [ ] Dashboard stats calculation
- [ ] User management operations
- [ ] Tour management operations
- [ ] Commission configuration
- [ ] Report generation
- [ ] CSV export functionality

## Approval
- [ ] User Approved
- Date:
- Notes:
