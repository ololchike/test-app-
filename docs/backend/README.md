# SafariPlus - Backend Architecture

## Overview

The SafariPlus backend is built with Next.js 15 App Router, leveraging Server Components, API Routes, and Server Actions for a modern, performant architecture.

---

## Architecture Principles

### 1. Server-First
- Maximize server-side rendering and data fetching
- Minimize client-side JavaScript
- Use Server Actions for mutations

### 2. Type Safety
- Full TypeScript coverage
- Zod validation for all inputs
- Prisma-generated types for database

### 3. Security by Default
- Authentication at every data access point
- Input validation on all endpoints
- Rate limiting on sensitive operations

### 4. Performance
- Database query optimization
- Connection pooling
- Caching where appropriate

---

## API Structure

### REST API Routes

```
/api
├── /auth
│   └── /[...nextauth]     # NextAuth.js handlers
├── /tours
│   ├── GET, POST          # List/Create tours
│   └── /[id]
│       ├── GET, PUT, DELETE
│       └── /publish       # POST - Publish tour
├── /bookings
│   ├── GET, POST          # List/Create bookings
│   └── /[id]
│       ├── GET, PUT       # Get/Update booking
│       └── /status        # PUT - Update status
├── /payments
│   ├── /initiate          # POST - Start payment
│   └── /status            # GET - Check status
├── /messages
│   ├── GET, POST          # List/Send messages
│   └── /conversations     # GET - List conversations
├── /agents
│   └── /[id]
│       ├── GET            # Agent profile
│       └── /earnings      # GET - Earnings data
├── /admin
│   ├── /agents            # GET, PUT - Manage agents
│   ├── /withdrawals       # GET, PUT - Manage withdrawals
│   └── /stats             # GET - Platform stats
├── /webhooks
│   └── /pesapal           # POST - Payment IPN
└── /upload                # POST - Image upload
```

### Server Actions

```typescript
// actions/tours.ts
"use server"

export async function createTour(data: TourFormData)
export async function updateTour(id: string, data: TourFormData)
export async function deleteTour(id: string)
export async function publishTour(id: string)

// actions/bookings.ts
export async function createBooking(data: BookingFormData)
export async function cancelBooking(id: string, reason: string)
export async function confirmBooking(id: string)

// actions/messages.ts
export async function sendMessage(conversationId: string, content: string)
export async function markAsRead(conversationId: string)
```

---

## Feature Documentation

| Feature | Document | Status |
|---------|----------|--------|
| Authentication | [feature-authentication.md](./feature-authentication.md) | MVP |
| Tour Management | [feature-tours.md](./feature-tours.md) | MVP |
| Booking System | [feature-bookings.md](./feature-bookings.md) | MVP |
| Payment Processing | [feature-payments.md](./feature-payments.md) | MVP |
| Messaging | [feature-messaging.md](./feature-messaging.md) | Phase 2 |

---

## Database Access Patterns

### Repository Pattern

```typescript
// lib/repositories/tour.repository.ts

export const tourRepository = {
  findMany: async (filters: TourFilters, pagination: Pagination) => {
    return prisma.tour.findMany({
      where: buildTourWhereClause(filters),
      include: { images: true, agent: true },
      skip: pagination.offset,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
    })
  },

  findById: async (id: string) => {
    return prisma.tour.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        agent: { include: { user: true } },
        reviews: { take: 10, orderBy: { createdAt: "desc" } },
      },
    })
  },

  create: async (agentId: string, data: CreateTourData) => {
    return prisma.tour.create({
      data: {
        ...data,
        agentId,
        slug: generateSlug(data.title),
      },
    })
  },
}
```

---

## Error Handling

### Standard Error Response

```typescript
interface APIError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

// Error codes
const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  PAYMENT_FAILED: "PAYMENT_FAILED",
}
```

### Error Handler Utility

```typescript
// lib/api-error.ts

export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public details?: Record<string, string[]>
  ) {
    super(message)
  }
}

export function handleAPIError(error: unknown): NextResponse {
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status }
    )
  }

  console.error("Unhandled error:", error)
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  )
}
```

---

## Middleware

### Authentication Middleware

```typescript
// middleware.ts

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Public routes
  if (isPublicRoute(pathname)) return NextResponse.next()

  // Check authentication
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Check role-based access
  const role = req.auth.user.role
  if (isAgentRoute(pathname) && role !== "AGENT" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url))
  }
  if (isAdminRoute(pathname) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})
```

### Rate Limiting

```typescript
// lib/rate-limit.ts

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
})

// Usage in API route
export async function POST(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1"
  const { success, limit, remaining } = await rateLimiter.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
        },
      }
    )
  }

  // Process request...
}
```

---

## Background Jobs (Phase 2)

### Job Types

| Job | Trigger | Purpose |
|-----|---------|---------|
| SendBookingEmail | Booking created/confirmed | Email notifications |
| ProcessWithdrawal | Admin approval | Initiate payout |
| UpdateTourStats | Booking completed | Update view/booking counts |
| SyncPaymentStatus | Scheduled (hourly) | Reconcile pending payments |

### Implementation Options

1. **Vercel Cron Jobs** - For scheduled tasks
2. **Inngest** - For event-driven jobs
3. **Trigger.dev** - For complex workflows

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/repositories/tour.test.ts

describe("TourRepository", () => {
  describe("findMany", () => {
    it("should filter by destination", async () => {
      // Test implementation
    })

    it("should paginate results", async () => {
      // Test implementation
    })
  })
})
```

### Integration Tests

```typescript
// __tests__/api/tours.test.ts

describe("POST /api/tours", () => {
  it("should create a tour for authenticated agent", async () => {
    // Test implementation
  })

  it("should reject unauthenticated requests", async () => {
    // Test implementation
  })
})
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...

# Pesapal
PESAPAL_CONSUMER_KEY=...
PESAPAL_CONSUMER_SECRET=...
PESAPAL_API_URL=https://pay.pesapal.com/v3
PESAPAL_IPN_ID=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email
RESEND_API_KEY=...

# Rate Limiting (optional)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Seed data loaded (if needed)
- [ ] Pesapal IPN URL registered
- [ ] Cloudinary configured
- [ ] Error monitoring (Sentry) configured
- [ ] Rate limiting configured
- [ ] CORS headers verified
