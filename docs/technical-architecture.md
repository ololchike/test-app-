# SafariPlus - Technical Architecture

## Architecture Overview

SafariPlus follows a modern, serverless-first architecture optimized for the East African market's unique requirements: mobile-first usage, variable connectivity, and local payment integration.

```
                                    +------------------+
                                    |   Cloudflare    |
                                    |   (CDN + WAF)   |
                                    +--------+---------+
                                             |
                                    +--------v---------+
                                    |     Vercel      |
                                    |  (Edge + SSR)   |
                                    +--------+---------+
                                             |
                    +------------------------+------------------------+
                    |                        |                        |
           +--------v--------+     +---------v--------+     +---------v--------+
           |   Next.js 15    |     |   API Routes    |     |  Server Actions  |
           |   App Router    |     |   (REST API)    |     |  (Mutations)     |
           +--------+--------+     +---------+--------+     +---------+--------+
                    |                        |                        |
                    +------------------------+------------------------+
                                             |
                                    +--------v---------+
                                    |     Prisma      |
                                    |   (ORM Layer)   |
                                    +--------+---------+
                                             |
                    +------------------------+------------------------+
                    |                        |                        |
           +--------v--------+     +---------v--------+     +---------v--------+
           |   PostgreSQL   |     |    Cloudinary   |     |     Pusher      |
           |   (Database)   |     |    (Images)     |     |   (Real-time)   |
           +----------------+     +-----------------+     +-----------------+
                    |
           +--------v--------+
           |    Pesapal     |
           |   (Payments)   |
           +----------------+
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | Full-stack React framework |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | Latest | Component library |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |
| TanStack Query | 5.x | Server state management |
| Zustand | 4.x | Client state management |
| date-fns | 3.x | Date manipulation |
| Lucide React | Latest | Icons |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 15.x | REST API endpoints |
| Server Actions | 15.x | Form mutations |
| Prisma | 6.x | Database ORM |
| NextAuth.js | 5.x | Authentication |
| Resend | Latest | Transactional email |
| Pusher | Latest | Real-time messaging |

### Database

| Technology | Purpose |
|------------|---------|
| PostgreSQL 16 | Primary database |
| Prisma Accelerate | Connection pooling for serverless |
| Redis (optional) | Caching layer (Phase 2) |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel | Hosting, Edge functions, CI/CD |
| Cloudflare | CDN, DDoS protection, WAF |
| Cloudinary | Image storage and optimization |
| Sentry | Error monitoring |
| Vercel Analytics | Performance monitoring |

### External Integrations

| Service | Purpose |
|---------|---------|
| Pesapal API 3.0 | Payment processing |
| Pusher Channels | Real-time messaging |
| Resend | Email delivery |
| Cloudinary | Image management |

---

## Project Structure

```
safariplus/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── verify-email/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   ├── (client)/
│   │   ├── tours/
│   │   │   ├── page.tsx              # Tour listing
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Tour detail
│   │   ├── book/
│   │   │   └── [tourId]/
│   │   │       └── page.tsx          # Booking flow
│   │   ├── bookings/
│   │   │   └── page.tsx              # Client bookings
│   │   ├── messages/
│   │   │   └── page.tsx              # Client messages
│   │   └── profile/
│   │       └── page.tsx
│   ├── (agent)/
│   │   └── agent/
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── tours/
│   │       │   ├── page.tsx          # Agent's tours
│   │       │   ├── new/
│   │       │   │   └── page.tsx      # Create tour
│   │       │   └── [id]/
│   │       │       └── edit/
│   │       │           └── page.tsx  # Edit tour
│   │       ├── bookings/
│   │       │   └── page.tsx
│   │       ├── earnings/
│   │       │   └── page.tsx
│   │       ├── messages/
│   │       │   └── page.tsx
│   │       └── settings/
│   │           └── page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── agents/
│   │       │   └── page.tsx
│   │       ├── clients/
│   │       │   └── page.tsx
│   │       ├── bookings/
│   │       │   └── page.tsx
│   │       ├── withdrawals/
│   │       │   └── page.tsx
│   │       ├── revenue/
│   │       │   └── page.tsx
│   │       └── settings/
│   │           └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── tours/
│   │   │   ├── route.ts              # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET, PUT, DELETE
│   │   ├── bookings/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── payments/
│   │   │   ├── initiate/
│   │   │   │   └── route.ts
│   │   │   ├── callback/
│   │   │   │   └── route.ts          # Pesapal IPN
│   │   │   └── status/
│   │   │       └── route.ts
│   │   ├── messages/
│   │   │   └── route.ts
│   │   ├── webhooks/
│   │   │   └── pesapal/
│   │   │       └── route.ts
│   │   └── upload/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx                      # Landing page
│   ├── globals.css
│   └── providers.tsx
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── forms/
│   │   ├── tour-form.tsx
│   │   ├── booking-form.tsx
│   │   └── auth-forms.tsx
│   ├── tours/
│   │   ├── tour-card.tsx
│   │   ├── tour-grid.tsx
│   │   ├── tour-filters.tsx
│   │   └── tour-gallery.tsx
│   ├── bookings/
│   │   ├── booking-card.tsx
│   │   ├── booking-status.tsx
│   │   └── date-picker.tsx
│   ├── dashboard/
│   │   ├── stats-card.tsx
│   │   ├── recent-bookings.tsx
│   │   └── earnings-chart.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   └── mobile-nav.tsx
│   └── shared/
│       ├── loading.tsx
│       ├── error-boundary.tsx
│       └── empty-state.tsx
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── auth.ts                       # NextAuth configuration
│   ├── pesapal.ts                    # Pesapal API client
│   ├── cloudinary.ts                 # Image upload helpers
│   ├── pusher.ts                     # Pusher client setup
│   ├── email.ts                      # Email sending utilities
│   ├── utils.ts                      # General utilities
│   └── validations/
│       ├── tour.ts
│       ├── booking.ts
│       └── auth.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-tours.ts
│   ├── use-bookings.ts
│   └── use-messages.ts
├── types/
│   ├── tour.ts
│   ├── booking.ts
│   ├── user.ts
│   └── payment.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── images/
│   └── icons/
├── config/
│   ├── site.ts
│   ├── navigation.ts
│   └── constants.ts
├── middleware.ts                     # Auth & role protection
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Authentication Architecture

### NextAuth.js v5 Configuration

```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Validate credentials against database
        // Return user object or null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.agentId = user.agentId
      }
      return token
    },
    session({ session, token }) {
      session.user.role = token.role
      session.user.agentId = token.agentId
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-email",
  },
})
```

### Role-Based Access Control

```typescript
// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const publicRoutes = ["/", "/tours", "/login", "/register"]
const agentRoutes = ["/agent"]
const adminRoutes = ["/admin"]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // Public routes - accessible to all
  if (publicRoutes.some(route => nextUrl.pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Not logged in - redirect to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Agent routes - require AGENT role
  if (agentRoutes.some(route => nextUrl.pathname.startsWith(route))) {
    if (userRole !== "AGENT" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  // Admin routes - require ADMIN role
  if (adminRoutes.some(route => nextUrl.pathname.startsWith(route))) {
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

---

## API Design

### REST API Endpoints

#### Tours API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/tours | List tours (with filters) | Public |
| GET | /api/tours/[id] | Get tour details | Public |
| POST | /api/tours | Create tour | Agent |
| PUT | /api/tours/[id] | Update tour | Agent (owner) |
| DELETE | /api/tours/[id] | Delete tour | Agent (owner) |
| POST | /api/tours/[id]/publish | Publish tour | Agent (owner) |

#### Bookings API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/bookings | List bookings | Authenticated |
| GET | /api/bookings/[id] | Get booking details | Owner/Agent |
| POST | /api/bookings | Create booking | Client |
| PUT | /api/bookings/[id]/status | Update status | Agent |
| DELETE | /api/bookings/[id] | Cancel booking | Owner |

#### Payments API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/payments/initiate | Start payment | Client |
| GET | /api/payments/status/[id] | Check status | Owner |
| POST | /api/webhooks/pesapal | IPN callback | Pesapal |

#### Admin API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/agents | List agents | Admin |
| PUT | /api/admin/agents/[id] | Update agent | Admin |
| GET | /api/admin/withdrawals | List withdrawals | Admin |
| PUT | /api/admin/withdrawals/[id] | Approve/reject | Admin |
| GET | /api/admin/stats | Platform stats | Admin |

### API Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid tour data",
    "details": [
      { "field": "price", "message": "Price must be positive" }
    ]
  }
}
```

---

## Real-Time Messaging Architecture

### Pusher Integration

```typescript
// lib/pusher.ts
import Pusher from "pusher"
import PusherClient from "pusher-js"

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
})

// Client-side Pusher instance
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: "/api/pusher/auth",
  }
)
```

### Channel Structure

| Channel | Type | Purpose |
|---------|------|---------|
| `private-user-{userId}` | Private | Personal notifications |
| `private-conversation-{id}` | Private | Direct messages |
| `private-agent-{agentId}` | Private | Agent notifications |
| `presence-admin` | Presence | Admin activity |

---

## Image Handling Architecture

### Cloudinary Integration

```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadTourImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "safariplus/tours",
        transformation: [
          { width: 1200, height: 800, crop: "fill", quality: "auto" },
          { fetch_format: "auto" }
        ]
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result!.secure_url)
      }
    ).end(buffer)
  })
}

// Generate responsive image URLs
export function getTourImageUrl(publicId: string, width: number) {
  return cloudinary.url(publicId, {
    width,
    crop: "fill",
    quality: "auto",
    fetch_format: "auto",
  })
}
```

### Image Optimization Strategy

| Use Case | Dimensions | Format | Quality |
|----------|------------|--------|---------|
| Tour Card Thumbnail | 400x300 | WebP/AVIF | 80 |
| Tour Detail Hero | 1200x800 | WebP/AVIF | 85 |
| Gallery Images | 1000x750 | WebP/AVIF | 85 |
| Agent Avatar | 200x200 | WebP/AVIF | 80 |

---

## Performance Optimization

### Server-Side Rendering Strategy

| Page | Strategy | Cache |
|------|----------|-------|
| Landing Page | Static (ISR) | 1 hour |
| Tour Listing | Dynamic | CDN: 5 min |
| Tour Detail | Dynamic | CDN: 5 min |
| Search Results | Dynamic | No cache |
| Dashboard Pages | Dynamic | No cache |
| Booking Pages | Dynamic | No cache |

### Edge Caching Headers

```typescript
// For tour listings
export async function GET(request: Request) {
  // ... fetch data

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  })
}
```

### Client-Side Optimization

1. **Image Lazy Loading**: Use Next.js Image with `loading="lazy"`
2. **Route Prefetching**: Prefetch likely navigation targets
3. **Component Code Splitting**: Dynamic imports for heavy components
4. **Service Worker**: Cache static assets (Phase 2)

---

## Security Measures

### Authentication Security
- JWT tokens with short expiry (15 min)
- Refresh token rotation
- HttpOnly, Secure, SameSite cookies
- Rate limiting on auth endpoints

### API Security
- Input validation with Zod on all endpoints
- CSRF protection via Server Actions
- Rate limiting per IP and per user
- SQL injection prevention via Prisma

### Payment Security
- Pesapal handles card data (PCI compliant)
- Webhook signature verification
- Idempotency keys for payment operations
- Audit logging for all transactions

### Infrastructure Security
- HTTPS everywhere
- Cloudflare WAF rules
- Environment variable encryption
- Database encryption at rest

---

## Monitoring & Observability

### Error Tracking (Sentry)

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

### Performance Monitoring

- Vercel Analytics for Web Vitals
- Custom metrics for booking funnel
- Database query performance via Prisma metrics

### Logging Strategy

| Log Level | Use Case |
|-----------|----------|
| ERROR | Exceptions, failed payments |
| WARN | Validation failures, rate limits |
| INFO | Successful bookings, logins |
| DEBUG | Development only |

---

## Deployment Architecture

### Environment Strategy

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Development | feature/* | localhost | Local dev |
| Preview | PR branches | *.vercel.app | PR review |
| Staging | develop | staging.safariplus.com | QA testing |
| Production | main | safariplus.com | Live users |

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: --prod
```

---

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Pesapal
PESAPAL_CONSUMER_KEY="..."
PESAPAL_CONSUMER_SECRET="..."
PESAPAL_API_URL="https://pay.pesapal.com/v3"
PESAPAL_IPN_URL="https://yourdomain.com/api/webhooks/pesapal"

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Pusher
PUSHER_APP_ID="..."
NEXT_PUBLIC_PUSHER_KEY="..."
PUSHER_SECRET="..."
NEXT_PUBLIC_PUSHER_CLUSTER="..."

# Email
RESEND_API_KEY="..."

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="..."
SENTRY_AUTH_TOKEN="..."
```

---

## Approval Checklist

- [ ] Technology stack approved
- [ ] Project structure approved
- [ ] API design approved
- [ ] Security measures approved
- [ ] Deployment strategy approved

**Approver**: ____________________
**Date**: ____________________
