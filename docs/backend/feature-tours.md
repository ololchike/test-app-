# Feature: Tour Management

## Status
- [x] Requirements Approved
- [x] Design Complete
- [x] Implementation Started
- [ ] Implementation Complete
- [ ] Testing Complete
- [ ] Deployed

## Implementation Progress

### Completed API Endpoints
- [x] `GET /api/tours` - List published tours with filters
- [x] `GET /api/tours/[slug]` - Tour details by slug
- [x] `POST /api/agent/tours` - Create tour (Agent)
- [x] `GET /api/agent/tours` - List agent's tours
- [x] `GET /api/agent/tours/[id]` - Get tour for editing
- [x] `PUT /api/agent/tours/[id]` - Update tour
- [x] `DELETE /api/agent/tours/[id]` - Delete tour
- [x] `PUT /api/agent/tours/[id]/status` - Publish/Unpublish tour
- [x] `POST /api/agent/tours/[id]/accommodations` - Add accommodation
- [x] `PUT /api/agent/tours/[id]/accommodations/[accId]` - Update accommodation
- [x] `DELETE /api/agent/tours/[id]/accommodations/[accId]` - Delete accommodation
- [x] `POST /api/agent/tours/[id]/addons` - Add activity add-on
- [x] `PUT /api/agent/tours/[id]/addons/[addonId]` - Update add-on
- [x] `DELETE /api/agent/tours/[id]/addons/[addonId]` - Delete add-on
- [x] `GET /api/agent/tours/[id]/itinerary` - Get tour itinerary
- [x] `POST /api/agent/tours/[id]/itinerary` - Add itinerary day
- [x] `PUT /api/agent/tours/[id]/itinerary` - Bulk update itinerary
- [x] `DELETE /api/agent/tours/[id]/itinerary` - Delete all itinerary

### Completed Database Models
- [x] Tour (with slug, pricing, guest types, rich description)
- [x] TourItinerary (day-by-day with activities, meals, accommodation/add-on references)
  - `availableAccommodationIds` - JSON array of accommodations available per night
  - `defaultAccommodationId` - Default accommodation selection per night
  - `availableAddonIds` - JSON array of add-ons available per day
- [x] TourAccommodation (tiers, pricing, amenities)
- [x] TourAddon (activities with day availability)

### Pending
- [ ] Image upload integration (Cloudinary)
- [ ] Search optimization (full-text index)
- [ ] Tour availability/calendar management

## Overview

Tour management enables agents to create, edit, and manage safari tour listings. Clients can browse, search, and filter tours to find their ideal safari experience.

## User Stories

### Agent (Tour Creation)
- As an agent, I want to create a new tour with title, description, and pricing
- As an agent, I want to upload multiple images for my tour
- As an agent, I want to create a day-by-day itinerary
- As an agent, I want to specify what's included and excluded in the price
- As an agent, I want to set available dates for my tour
- As an agent, I want to save a tour as draft before publishing
- As an agent, I want to publish a tour to make it visible to clients

### Agent (Tour Management)
- As an agent, I want to view all my tours in a dashboard
- As an agent, I want to edit my existing tours
- As an agent, I want to unpublish a tour temporarily
- As an agent, I want to delete a tour that's no longer offered
- As an agent, I want to see booking count and views for each tour

### Client (Tour Discovery)
- As a client, I want to browse all available tours
- As a client, I want to search tours by destination
- As a client, I want to filter tours by price range
- As a client, I want to filter tours by duration
- As a client, I want to sort tours by price, rating, or date
- As a client, I want to see tour details including full itinerary
- As a client, I want to see the agent's profile and ratings

## Acceptance Criteria

### Tour Creation
- [ ] Agent can create tour with required fields (title, description, destination, price, duration)
- [ ] Agent can upload up to 10 images per tour
- [ ] Primary image is automatically set to first uploaded
- [ ] Agent can reorder images
- [ ] Agent can add day-by-day itinerary
- [ ] Agent can specify included/excluded items
- [ ] Agent can set minimum/maximum group size
- [ ] Tour is saved as draft by default
- [ ] Agent can publish when ready

### Tour Display
- [ ] Tour card shows primary image, title, rating, price, duration
- [ ] Tour detail page shows all images in gallery
- [ ] Full itinerary is displayed with day markers
- [ ] Included/excluded lists are clearly formatted
- [ ] Agent profile card is shown
- [ ] Reviews section displays (Phase 2)

### Search & Filter
- [ ] Search bar filters by title and destination
- [ ] Price range filter with min/max inputs
- [ ] Duration filter (1-3 days, 4-7 days, 8+ days)
- [ ] Destination dropdown/autocomplete
- [ ] Sort options: Featured, Price (low-high), Price (high-low), Rating
- [ ] Results update without page reload
- [ ] Clear filters option available

## Technical Requirements

### Tour API Endpoints

```typescript
// app/api/tours/route.ts

// GET /api/tours - List tours with filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const filters = {
    destination: searchParams.get("destination"),
    minPrice: searchParams.get("minPrice"),
    maxPrice: searchParams.get("maxPrice"),
    duration: searchParams.get("duration"),
    search: searchParams.get("search"),
  }

  const sort = searchParams.get("sort") || "featured"
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "12")

  const where: Prisma.TourWhereInput = {
    status: "PUBLISHED",
    ...(filters.destination && { destination: filters.destination }),
    ...(filters.minPrice && { price: { gte: parseFloat(filters.minPrice) } }),
    ...(filters.maxPrice && { price: { lte: parseFloat(filters.maxPrice) } }),
    ...(filters.duration && buildDurationFilter(filters.duration)),
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: "insensitive" } },
        { destination: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ],
    }),
  }

  const orderBy = buildOrderBy(sort)

  const [tours, total] = await Promise.all([
    prisma.tour.findMany({
      where,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        agent: { select: { businessName: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tour.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    data: tours,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

// POST /api/tours - Create tour (Agent only)
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const agent = await prisma.agent.findUnique({
    where: { userId: session.user.id },
  })

  if (!agent || agent.status !== "APPROVED") {
    return NextResponse.json({ error: "Agent not approved" }, { status: 403 })
  }

  const body = await request.json()
  const data = tourCreateSchema.parse(body)

  const tour = await prisma.tour.create({
    data: {
      ...data,
      agentId: agent.id,
      slug: generateSlug(data.title),
      status: "DRAFT",
    },
  })

  return NextResponse.json({ success: true, data: tour }, { status: 201 })
}
```

### Tour Validation Schema

```typescript
// lib/validations/tour.ts
import { z } from "zod"

export const tourCreateSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(100).max(5000),
  shortDescription: z.string().max(300).optional(),
  destination: z.string().min(2).max(100),
  country: z.string().default("Kenya"),
  meetingPoint: z.string().optional(),
  price: z.number().positive(),
  currency: z.enum(["USD", "KES", "TZS", "UGX"]).default("USD"),
  duration: z.number().int().positive(),
  durationUnit: z.enum(["days", "hours"]).default("days"),
  minGroupSize: z.number().int().min(1).default(1),
  maxGroupSize: z.number().int().min(1).default(10),
  priceIncludes: z.array(z.string()).default([]),
  priceExcludes: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string(),
    description: z.string(),
    activities: z.array(z.string()).optional(),
  })).optional(),
  requirements: z.array(z.string()).default([]),
  whatToBring: z.array(z.string()).default([]),
})

export const tourUpdateSchema = tourCreateSchema.partial()
```

### Image Upload

```typescript
// app/api/upload/route.ts
import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File
  const tourId = formData.get("tourId") as string

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  // Verify tour ownership
  const tour = await prisma.tour.findFirst({
    where: {
      id: tourId,
      agent: { userId: session.user.id },
    },
  })

  if (!tour) {
    return NextResponse.json({ error: "Tour not found" }, { status: 404 })
  }

  // Upload to Cloudinary
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `safariplus/tours/${tourId}`,
        transformation: [
          { width: 1200, height: 800, crop: "fill", quality: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(buffer)
  })

  // Save to database
  const imageCount = await prisma.tourImage.count({ where: { tourId } })

  const image = await prisma.tourImage.create({
    data: {
      tourId,
      url: result.secure_url,
      publicId: result.public_id,
      isPrimary: imageCount === 0,
      order: imageCount,
    },
  })

  return NextResponse.json({ success: true, data: image })
}
```

### Tour Detail Query

```typescript
// lib/queries/tours.ts

export async function getTourBySlug(slug: string) {
  const tour = await prisma.tour.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: { order: "asc" } },
      agent: {
        include: {
          user: { select: { name: true, image: true } },
        },
      },
      reviews: {
        where: { isPublished: true },
        include: {
          client: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: { bookings: true, reviews: true },
      },
    },
  })

  if (tour) {
    // Increment view count (fire and forget)
    prisma.tour.update({
      where: { id: tour.id },
      data: { viewCount: { increment: 1 } },
    }).catch(console.error)
  }

  return tour
}
```

## Dependencies

- Prisma (database)
- Cloudinary (image hosting)
- Zod (validation)
- Next.js Image component

## MVP Phase
Phase 1 - Core MVP

## Estimated Effort
21 story points

## Implementation Notes

### Image Guidelines
- Maximum 10 images per tour
- Accepted formats: JPEG, PNG, WebP
- Maximum file size: 5MB
- Auto-optimize via Cloudinary
- Generate responsive variants

### Search Optimization
- Full-text search index on title, description, destination
- Cache popular searches
- Consider Algolia for Phase 2

### Performance
- Paginate tour listings (12 per page)
- Lazy load images in gallery
- Use ISR for tour detail pages

## Approval
- [ ] User Approved
- Date:
- Notes:
