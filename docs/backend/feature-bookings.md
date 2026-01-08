# Feature: Booking System

## Status
- [x] Requirements Approved
- [ ] Design Complete
- [ ] Implementation Started
- [ ] Implementation Complete
- [ ] Testing Complete
- [ ] Deployed

## Overview

The booking system enables clients to reserve tours, handles availability checking, and manages the booking lifecycle from creation through completion.

## User Stories

### Client
- As a client, I want to select a travel date for a tour
- As a client, I want to specify the number of travelers
- As a client, I want to enter traveler details (names, contacts)
- As a client, I want to add special requests for my booking
- As a client, I want to review my booking before payment
- As a client, I want to receive a booking confirmation
- As a client, I want to view my booking history
- As a client, I want to cancel a booking if needed

### Agent
- As an agent, I want to see all bookings for my tours
- As an agent, I want to confirm a pending booking
- As an agent, I want to see client contact information
- As an agent, I want to update booking status
- As an agent, I want to mark a booking as completed after the trip

### Admin
- As an admin, I want to view all bookings on the platform
- As an admin, I want to see booking statistics
- As an admin, I want to handle booking disputes

## Acceptance Criteria

### Booking Creation
- [ ] Client can select from available tour dates
- [ ] Client can specify 1 to max group size travelers
- [ ] Price updates automatically based on traveler count
- [ ] Traveler details form includes name, email, phone for lead traveler
- [ ] Special requests field accepts up to 500 characters
- [ ] Booking summary shows all details before payment
- [ ] Booking is created with PENDING status
- [ ] Unique booking reference number is generated

### Booking Confirmation
- [ ] Booking moves to CONFIRMED after successful payment
- [ ] Confirmation email sent to client
- [ ] Notification sent to agent
- [ ] Agent can view booking in dashboard immediately

### Booking Management (Client)
- [ ] Client can view all their bookings
- [ ] Bookings sorted by travel date (upcoming first)
- [ ] Each booking shows status, tour details, dates
- [ ] Client can cancel booking up to 48 hours before travel date
- [ ] Cancellation reason is required

### Booking Management (Agent)
- [ ] Agent sees all bookings for their tours
- [ ] Bookings filterable by status, tour, date range
- [ ] Agent can update booking status
- [ ] Agent can contact client via platform messaging
- [ ] Agent marks booking complete after trip

### Commission Calculation
- [ ] Commission rate applied based on agent tier
- [ ] Commission amount = total price * commission rate
- [ ] Agent earnings = total price - commission
- [ ] Commission locked at booking creation time

## Technical Requirements

### Booking API

```typescript
// app/api/bookings/route.ts

// POST /api/bookings - Create booking
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const data = bookingCreateSchema.parse(body)

  // Get tour and agent
  const tour = await prisma.tour.findUnique({
    where: { id: data.tourId, status: "PUBLISHED" },
    include: { agent: true },
  })

  if (!tour) {
    return NextResponse.json({ error: "Tour not found" }, { status: 404 })
  }

  // Validate traveler count
  if (data.numberOfTravelers > tour.maxGroupSize) {
    return NextResponse.json(
      { error: `Maximum ${tour.maxGroupSize} travelers allowed` },
      { status: 400 }
    )
  }

  // Check date availability
  if (!tour.startDates.some(d =>
    d.toDateString() === new Date(data.travelDate).toDateString()
  )) {
    return NextResponse.json(
      { error: "Selected date is not available" },
      { status: 400 }
    )
  }

  // Calculate pricing
  const pricePerPerson = tour.price
  const totalPrice = pricePerPerson * data.numberOfTravelers
  const commissionRate = tour.agent.commissionRate
  const commissionAmount = totalPrice * (commissionRate / 100)
  const agentEarnings = totalPrice - commissionAmount

  // Generate booking number
  const bookingNumber = generateBookingNumber()

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      bookingNumber,
      clientId: session.user.id,
      tourId: tour.id,
      agentId: tour.agent.id,
      travelDate: new Date(data.travelDate),
      numberOfTravelers: data.numberOfTravelers,
      travelers: data.travelers,
      specialRequests: data.specialRequests,
      pricePerPerson,
      totalPrice,
      currency: tour.currency,
      commissionRate,
      commissionAmount,
      agentEarnings,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      status: "PENDING",
    },
    include: {
      tour: { include: { images: { where: { isPrimary: true } } } },
      agent: { include: { user: true } },
    },
  })

  // Create conversation for client-agent messaging
  await prisma.conversation.create({
    data: {
      bookingId: booking.id,
      clientId: session.user.id,
      agentId: tour.agent.id,
    },
  })

  return NextResponse.json({ success: true, data: booking }, { status: 201 })
}

// GET /api/bookings - List bookings
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")

  let where: Prisma.BookingWhereInput = {}

  // Filter by role
  if (session.user.role === "CLIENT") {
    where.clientId = session.user.id
  } else if (session.user.role === "AGENT") {
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }
    where.agentId = agent.id
  }
  // Admin sees all

  if (status) {
    where.status = status as BookingStatus
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        tour: { include: { images: { where: { isPrimary: true } } } },
        client: { select: { name: true, email: true, image: true } },
        agent: { select: { businessName: true } },
        payment: { select: { status: true, method: true } },
      },
      orderBy: { travelDate: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    data: bookings,
    meta: { page, limit, total },
  })
}
```

### Status Update API

```typescript
// app/api/bookings/[id]/status/route.ts

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { status, reason } = body

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { agent: true },
  })

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // Verify ownership
  const isAgent = session.user.role === "AGENT" &&
    booking.agent.userId === session.user.id
  const isClient = booking.clientId === session.user.id
  const isAdmin = session.user.role === "ADMIN"

  if (!isAgent && !isClient && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
  }

  if (!validTransitions[booking.status]?.includes(status)) {
    return NextResponse.json(
      { error: `Cannot change from ${booking.status} to ${status}` },
      { status: 400 }
    )
  }

  // Client can only cancel
  if (isClient && status !== "CANCELLED") {
    return NextResponse.json(
      { error: "Clients can only cancel bookings" },
      { status: 403 }
    )
  }

  // Check cancellation deadline (48 hours before travel)
  if (status === "CANCELLED" && isClient) {
    const hoursUntilTravel =
      (booking.travelDate.getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursUntilTravel < 48) {
      return NextResponse.json(
        { error: "Cancellation not allowed within 48 hours of travel" },
        { status: 400 }
      )
    }
  }

  // Update booking
  const updateData: Prisma.BookingUpdateInput = { status }

  if (status === "CONFIRMED") {
    updateData.confirmedAt = new Date()
  } else if (status === "CANCELLED") {
    updateData.cancelledAt = new Date()
    updateData.cancellationReason = reason
  } else if (status === "COMPLETED") {
    updateData.completedAt = new Date()

    // Move pending balance to available
    await prisma.agent.update({
      where: { id: booking.agentId },
      data: {
        pendingBalance: { decrement: booking.agentEarnings },
        availableBalance: { increment: booking.agentEarnings },
        totalEarnings: { increment: booking.agentEarnings },
      },
    })
  }

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: updateData,
  })

  // TODO: Send notification emails

  return NextResponse.json({ success: true, data: updated })
}
```

### Booking Validation Schema

```typescript
// lib/validations/booking.ts
import { z } from "zod"

export const bookingCreateSchema = z.object({
  tourId: z.string(),
  travelDate: z.string().datetime(),
  numberOfTravelers: z.number().int().min(1),
  travelers: z.array(z.object({
    name: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  })).optional(),
  specialRequests: z.string().max(500).optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(10),
})
```

### Booking Number Generation

```typescript
// lib/utils/booking.ts

export function generateBookingNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `SP${year}${month}-${random}`
}
// Example: SP2601-X7K9M2
```

## Dependencies

- Prisma (database)
- Zod (validation)
- Email service for notifications

## MVP Phase
Phase 1 - Core MVP

## Estimated Effort
21 story points

## Implementation Notes

### Booking States

```
PENDING → (payment) → CONFIRMED → (trip complete) → COMPLETED
    ↓                      ↓
    └──────────────────────┴────→ CANCELLED
```

### Edge Cases
- Handle timezone differences for travel dates
- Prevent double-booking same slot
- Handle payment timeout scenarios
- Handle partial refunds (future)

### Performance
- Index bookings by status, travelDate
- Paginate booking lists
- Cache booking counts per tour

## Approval
- [ ] User Approved
- Date:
- Notes:
