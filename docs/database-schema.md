# SafariPlus - Database Schema

## Overview

This document defines the PostgreSQL database schema for SafariPlus, implemented using Prisma ORM. The schema supports multi-tenancy (agents), role-based access, and comprehensive booking/payment tracking.

---

## Entity Relationship Diagram

```
+------------------+       +------------------+       +------------------+
|      User        |       |      Agent       |       |      Tour        |
+------------------+       +------------------+       +------------------+
| id (PK)          |<----->| id (PK)          |<----->| id (PK)          |
| email            |       | userId (FK)      |       | agentId (FK)     |
| password         |       | businessName     |       | title            |
| name             |       | phone            |       | description      |
| role             |       | status           |       | destination      |
| emailVerified    |       | commissionRate   |       | price            |
| image            |       | totalEarnings    |       | duration         |
+------------------+       | availableBalance |       | status           |
         |                 +------------------+       +------------------+
         |                          |                         |
         |                          |                         |
         v                          v                         v
+------------------+       +------------------+       +------------------+
|     Booking      |       |    Withdrawal    |       |   TourImage      |
+------------------+       +------------------+       +------------------+
| id (PK)          |       | id (PK)          |       | id (PK)          |
| clientId (FK)    |       | agentId (FK)     |       | tourId (FK)      |
| tourId (FK)      |       | amount           |       | url              |
| agentId (FK)     |       | status           |       | isPrimary        |
| travelDate       |       | approvedBy       |       +------------------+
| travelers        |       +------------------+
| totalPrice       |
| status           |               +------------------+
+------------------+               |     Payment      |
         |                         +------------------+
         +------------------------>| id (PK)          |
                                   | bookingId (FK)   |
                                   | amount           |
                                   | method           |
                                   | status           |
                                   | pesapalRef       |
                                   +------------------+

+------------------+       +------------------+
|   Conversation   |       |     Message      |
+------------------+       +------------------+
| id (PK)          |<----->| id (PK)          |
| bookingId (FK)   |       | conversationId   |
| clientId (FK)    |       | senderId (FK)    |
| agentId (FK)     |       | content          |
+------------------+       | readAt           |
                           +------------------+

+------------------+       +------------------+
|     Review       |       | CommissionConfig |
+------------------+       +------------------+
| id (PK)          |       | id (PK)          |
| bookingId (FK)   |       | tier             |
| clientId (FK)    |       | minAmount        |
| tourId (FK)      |       | maxAmount        |
| rating           |       | percentage       |
| comment          |       +------------------+
+------------------+
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  CLIENT
  AGENT
  ADMIN
}

enum AgentStatus {
  PENDING
  APPROVED
  SUSPENDED
}

enum TourStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
}

enum PaymentMethod {
  MPESA
  CARD
  PAYPAL
  BANK_TRANSFER
}

enum WithdrawalStatus {
  PENDING
  APPROVED
  PROCESSING
  COMPLETED
  REJECTED
}

// ============================================
// USER & AUTHENTICATION
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  password      String?   // Nullable for OAuth users
  name          String?
  image         String?
  phone         String?
  role          UserRole  @default(CLIENT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  agent         Agent?
  bookings      Booking[]       @relation("ClientBookings")
  reviews       Review[]
  sentMessages  Message[]       @relation("MessageSender")
  conversations Conversation[]  @relation("ClientConversations")
  savedConfigurations SavedConfiguration[]

  // NextAuth relations
  accounts      Account[]
  sessions      Session[]

  @@index([email])
  @@index([role])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================
// AGENT
// ============================================

model Agent {
  id                String       @id @default(cuid())
  userId            String       @unique
  businessName      String
  businessRegNumber String?
  phone             String
  whatsapp          String?
  address           String?
  city              String?
  country           String       @default("Kenya")
  bio               String?      @db.Text
  logo              String?
  website           String?
  status            AgentStatus  @default(PENDING)

  // Commission & Earnings
  commissionRate    Float        @default(15) // Percentage
  totalEarnings     Float        @default(0)
  availableBalance  Float        @default(0)
  pendingBalance    Float        @default(0)

  // Verification
  verifiedAt        DateTime?
  verifiedBy        String?

  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  // Relations
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  tours             Tour[]
  bookings          Booking[]
  withdrawals       Withdrawal[]
  conversations     Conversation[] @relation("AgentConversations")
  packageTemplates  PackageTemplate[]

  @@index([status])
  @@index([country])
}

// ============================================
// TOUR
// ============================================

model Tour {
  id              String      @id @default(cuid())
  agentId         String
  title           String
  slug            String      @unique
  description     String      @db.Text
  shortDescription String?    @db.VarChar(300)

  // Location
  destination     String      // e.g., "Masai Mara"
  country         String      @default("Kenya")
  meetingPoint    String?

  // Pricing
  price           Float       // Base price per person
  currency        String      @default("USD")
  priceIncludes   String[]    // What's included
  priceExcludes   String[]    // What's not included

  // Duration
  duration        Int         // In days
  durationUnit    String      @default("days")

  // Capacity
  minGroupSize    Int         @default(1)
  maxGroupSize    Int         @default(10)

  // Details
  highlights      String[]
  itinerary       Json?       // Day-by-day breakdown
  requirements    String[]    // Physical requirements, age limits, etc.
  whatToBring     String[]

  // Availability
  startDates      DateTime[]  // Available start dates
  isAvailable     Boolean     @default(true)

  // Status
  status          TourStatus  @default(DRAFT)
  featured        Boolean     @default(false)

  // Metrics
  viewCount       Int         @default(0)
  bookingCount    Int         @default(0)
  averageRating   Float       @default(0)
  reviewCount     Int         @default(0)

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  publishedAt     DateTime?

  // Relations
  agent           Agent       @relation(fields: [agentId], references: [id], onDelete: Cascade)
  images          TourImage[]
  bookings        Booking[]
  reviews         Review[]

  @@index([agentId])
  @@index([status])
  @@index([destination])
  @@index([country])
  @@index([price])
  @@index([duration])
  @@index([featured])
  @@fulltext([title, description, destination])
}

model TourImage {
  id        String   @id @default(cuid())
  tourId    String
  url       String
  publicId  String?  // Cloudinary public ID
  alt       String?
  isPrimary Boolean  @default(false)
  order     Int      @default(0)
  createdAt DateTime @default(now())

  tour Tour @relation(fields: [tourId], references: [id], onDelete: Cascade)

  @@index([tourId])
}

// ============================================
// BOOKING
// ============================================

model Booking {
  id              String        @id @default(cuid())
  bookingNumber   String        @unique @default(cuid())

  // Relationships
  clientId        String
  tourId          String
  agentId         String

  // Travel Details
  travelDate      DateTime
  numberOfTravelers Int         @default(1)
  travelers       Json?         // Array of traveler details
  specialRequests String?       @db.Text

  // Pricing
  pricePerPerson  Float
  totalPrice      Float
  currency        String        @default("USD")

  // Commission
  commissionRate  Float         // Snapshot at booking time
  commissionAmount Float
  agentEarnings   Float         // totalPrice - commissionAmount

  // Status
  status          BookingStatus @default(PENDING)
  confirmedAt     DateTime?
  cancelledAt     DateTime?
  cancellationReason String?
  completedAt     DateTime?

  // Contact
  contactEmail    String
  contactPhone    String

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  client          User          @relation("ClientBookings", fields: [clientId], references: [id])
  tour            Tour          @relation(fields: [tourId], references: [id])
  agent           Agent         @relation(fields: [agentId], references: [id])
  payment         Payment?
  review          Review?
  conversation    Conversation?

  @@index([clientId])
  @@index([tourId])
  @@index([agentId])
  @@index([status])
  @@index([travelDate])
  @@index([bookingNumber])
}

// ============================================
// PAYMENT
// ============================================

model Payment {
  id                String         @id @default(cuid())
  bookingId         String         @unique

  // Amount
  amount            Float
  currency          String         @default("USD")

  // Pesapal Integration
  pesapalOrderId    String?        @unique
  pesapalTrackingId String?        @unique
  merchantReference String?        @unique

  // Payment Details
  method            PaymentMethod?
  status            PaymentStatus  @default(PENDING)

  // Metadata from Pesapal
  paymentAccount    String?        // e.g., phone number for M-Pesa
  paymentConfirmation String?      // Confirmation code

  // Processing
  initiatedAt       DateTime       @default(now())
  processedAt       DateTime?
  failedAt          DateTime?
  failureReason     String?

  // Refund
  refundedAt        DateTime?
  refundAmount      Float?
  refundReason      String?

  // Relations
  booking           Booking        @relation(fields: [bookingId], references: [id])

  @@index([status])
  @@index([pesapalOrderId])
  @@index([pesapalTrackingId])
}

// ============================================
// WITHDRAWAL
// ============================================

model Withdrawal {
  id              String           @id @default(cuid())
  agentId         String

  // Amount
  amount          Float
  currency        String           @default("USD")

  // Payment Details
  paymentMethod   String           // M-Pesa, Bank Transfer
  accountDetails  Json             // Phone number or bank details

  // Status
  status          WithdrawalStatus @default(PENDING)
  requestedAt     DateTime         @default(now())

  // Processing
  reviewedBy      String?
  reviewedAt      DateTime?
  processedAt     DateTime?
  rejectionReason String?

  // Confirmation
  transactionRef  String?

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relations
  agent           Agent            @relation(fields: [agentId], references: [id])

  @@index([agentId])
  @@index([status])
}

// ============================================
// MESSAGING
// ============================================

model Conversation {
  id              String    @id @default(cuid())
  bookingId       String?   @unique
  clientId        String
  agentId         String

  lastMessageAt   DateTime  @default(now())
  clientUnread    Int       @default(0)
  agentUnread     Int       @default(0)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  booking         Booking?  @relation(fields: [bookingId], references: [id])
  client          User      @relation("ClientConversations", fields: [clientId], references: [id])
  agent           Agent     @relation("AgentConversations", fields: [agentId], references: [id])
  messages        Message[]

  @@unique([clientId, agentId])
  @@index([clientId])
  @@index([agentId])
  @@index([lastMessageAt])
}

model Message {
  id              String       @id @default(cuid())
  conversationId  String
  senderId        String
  content         String       @db.Text
  readAt          DateTime?

  createdAt       DateTime     @default(now())

  // Relations
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender          User         @relation("MessageSender", fields: [senderId], references: [id])

  @@index([conversationId])
  @@index([senderId])
  @@index([createdAt])
}

// ============================================
// REVIEW
// ============================================

model Review {
  id              String    @id @default(cuid())
  bookingId       String    @unique
  clientId        String
  tourId          String

  rating          Int       // 1-5
  title           String?
  comment         String?   @db.Text

  // Moderation
  isPublished     Boolean   @default(true)
  isVerified      Boolean   @default(false) // Verified purchase

  // Agent Response
  agentResponse   String?   @db.Text
  respondedAt     DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  booking         Booking   @relation(fields: [bookingId], references: [id])
  client          User      @relation(fields: [clientId], references: [id])
  tour            Tour      @relation(fields: [tourId], references: [id])

  @@index([tourId])
  @@index([rating])
}

// ============================================
// PLATFORM CONFIGURATION
// ============================================

model CommissionConfig {
  id          String   @id @default(cuid())
  tier        String   @unique // e.g., "tier_1", "tier_2", "tier_3"
  name        String   // e.g., "Standard", "Premium", "Elite"
  minAmount   Float    // Monthly booking volume threshold
  maxAmount   Float?   // Upper threshold (null for unlimited)
  percentage  Float    // Commission percentage
  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model PlatformSettings {
  id                    String   @id @default(cuid())
  key                   String   @unique
  value                 String
  description           String?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

// ============================================
// AUDIT LOG
// ============================================

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String   // e.g., "BOOKING_CREATED", "PAYMENT_COMPLETED"
  entityType  String   // e.g., "Booking", "Payment", "Agent"
  entityId    String
  oldValue    Json?
  newValue    Json?
  ipAddress   String?
  userAgent   String?

  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([createdAt])
}

// ============================================
// PACKAGE BUILDER SYSTEM
// ============================================

enum AccommodationTier {
  BUDGET
  STANDARD
  COMFORT
  LUXURY
  ULTRA_LUXURY
}

enum ActivityCategory {
  ADVENTURE
  WILDLIFE
  CULTURAL
  DINING
  WELLNESS
  PHOTOGRAPHY
  WATER
  BIRDING
  TREKKING
  OTHER
}

enum PricingModel {
  PER_PERSON
  PER_GROUP
  PER_PERSON_MINIMUM
  TIERED
}

enum PackageStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// Package Templates - The configurable tour packages
model PackageTemplate {
  id                String        @id @default(cuid())
  agentId           String

  // Basic Info
  title             String
  slug              String        @unique
  description       String        @db.Text
  shortDescription  String?       @db.VarChar(500)

  // Duration
  totalDays         Int
  totalNights       Int

  // Base Pricing
  basePrice         Float         // Minimum price (with budget options)
  baseCurrency      String        @default("USD")
  priceType         String        @default("per_person") // per_person, per_group

  // Group Configuration
  minGroupSize      Int           @default(1)
  maxGroupSize      Int           @default(10)

  // Inclusions (always included in base)
  baseInclusions    String[]
  baseExclusions    String[]

  // Availability
  availableFrom     DateTime?
  availableTo       DateTime?
  blackoutDates     Json          @default("[]")  // Array of date ranges

  // Status
  status            PackageStatus @default(DRAFT)
  featured          Boolean       @default(false)

  // Metrics
  viewCount         Int           @default(0)
  bookingCount      Int           @default(0)
  averageRating     Float         @default(0)

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  publishedAt       DateTime?

  // Relations
  agent             Agent         @relation(fields: [agentId], references: [id], onDelete: Cascade)
  days              PackageDay[]
  activities        PackageActivity[]
  seasonalPricing   PackageSeasonalPricing[]
  childPricingPolicy ChildPricingPolicy?
  images            PackageImage[]
  savedConfigurations SavedConfiguration[]

  @@index([agentId])
  @@index([status])
  @@index([featured])
  @@fulltext([title, description])
}

// Package Days - Individual days in the itinerary
model PackageDay {
  id                    String              @id @default(cuid())
  packageId             String
  dayNumber             Int
  title                 String              // e.g., "Masai Mara Game Drive"
  description           String?             @db.Text
  location              String              // e.g., "Masai Mara National Reserve"

  // Activities included in base
  includedActivities    String[]

  // Meals included
  mealsBreakfast        Boolean             @default(true)
  mealsLunch            Boolean             @default(true)
  mealsDinner           Boolean             @default(true)

  // Accommodation required?
  requiresAccommodation Boolean             @default(true)

  // Transfer details
  transferDetails       Json?

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  package               PackageTemplate     @relation(fields: [packageId], references: [id], onDelete: Cascade)
  accommodationOptions  AccommodationOption[]

  @@unique([packageId, dayNumber])
  @@index([packageId])
}

// Accommodation Options - Multiple options per day/location
model AccommodationOption {
  id                String              @id @default(cuid())
  packageDayId      String

  // Classification
  tier              AccommodationTier
  category          String              @default("lodge") // hotel, lodge, tented_camp, etc.

  // Basic Info
  name              String
  description       String?             @db.Text
  shortDescription  String?             @db.VarChar(500)
  location          String?
  address           String?
  latitude          Float?
  longitude         Float?

  // Pricing
  pricePerPerson    Float               // Additional price per person per night
  pricePerRoom      Float?              // Or per room
  pricingModel      String              @default("per_person")
  singleSupplementPercent Float         @default(0)
  singleSupplementFixed   Float?
  childPrice        Float?
  childPricePercent Float               @default(50)
  childPricingModel String              @default("percentage")
  freeChildAge      Int                 @default(2)
  currency          String              @default("USD")

  // Capacity
  maxOccupancy      Int                 @default(2)
  maxAdults         Int                 @default(2)
  maxChildren       Int                 @default(2)

  // Features
  amenities         String[]
  features          String[]
  highlights        String[]

  // External
  starRating        Int?
  guestRating       Float?
  tripAdvisorId     String?
  tripAdvisorRating Float?
  website           String?
  bookingPolicies   String?             @db.Text
  cancellationPolicy String?            @db.Text

  // Availability
  isAvailable       Boolean             @default(true)
  blackoutDates     Json                @default("[]")

  // Agent Settings
  isDefault         Boolean             @default(false)
  sortOrder         Int                 @default(0)
  featured          Boolean             @default(false)
  notes             String?             @db.Text

  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  // Relations
  packageDay        PackageDay          @relation(fields: [packageDayId], references: [id], onDelete: Cascade)
  images            AccommodationImage[]
  roomTypes         RoomType[]
  seasonalPricing   AccommodationSeasonalPricing[]

  @@unique([packageDayId, tier])
  @@index([packageDayId])
  @@index([tier])
  @@index([isAvailable])
}

// Accommodation Images
model AccommodationImage {
  id              String              @id @default(cuid())
  accommodationId String
  url             String
  publicId        String?             // Cloudinary ID
  alt             String?
  category        String              @default("other") // exterior, room, bathroom, etc.
  isPrimary       Boolean             @default(false)
  sortOrder       Int                 @default(0)

  createdAt       DateTime            @default(now())

  accommodation   AccommodationOption @relation(fields: [accommodationId], references: [id], onDelete: Cascade)

  @@index([accommodationId])
}

// Room Types within Accommodations
model RoomType {
  id              String              @id @default(cuid())
  accommodationId String
  name            String              // "Double Room", "Twin Room", "Family Suite"
  description     String?
  maxOccupancy    Int                 @default(2)
  maxAdults       Int                 @default(2)
  maxChildren     Int                 @default(1)
  bedConfiguration String?            // "1 King", "2 Singles"
  priceModifier   Float               @default(0) // Additional cost
  amenities       String[]
  isDefault       Boolean             @default(false)
  sortOrder       Int                 @default(0)

  createdAt       DateTime            @default(now())

  accommodation   AccommodationOption @relation(fields: [accommodationId], references: [id], onDelete: Cascade)
  images          RoomTypeImage[]

  @@index([accommodationId])
}

// Room Type Images
model RoomTypeImage {
  id          String    @id @default(cuid())
  roomTypeId  String
  url         String
  publicId    String?
  alt         String?
  isPrimary   Boolean   @default(false)
  sortOrder   Int       @default(0)

  createdAt   DateTime  @default(now())

  roomType    RoomType  @relation(fields: [roomTypeId], references: [id], onDelete: Cascade)

  @@index([roomTypeId])
}

// Accommodation Seasonal Pricing
model AccommodationSeasonalPricing {
  id              String              @id @default(cuid())
  accommodationId String
  seasonName      String
  startDate       DateTime
  endDate         DateTime
  pricePerPerson  Float
  pricePerRoom    Float?
  isActive        Boolean             @default(true)

  createdAt       DateTime            @default(now())

  accommodation   AccommodationOption @relation(fields: [accommodationId], references: [id], onDelete: Cascade)

  @@index([accommodationId])
  @@index([startDate, endDate])
}

// Package Activities (Add-ons)
model PackageActivity {
  id                  String          @id @default(cuid())
  packageId           String

  // Basic Info
  name                String
  description         String?         @db.Text
  shortDescription    String?         @db.VarChar(500)
  duration            String?         // "3 hours", "Half day"

  // Category
  category            ActivityCategory
  subcategory         String?

  // Availability
  availabilityType    String          @default("all_days") // all_days, specific_days, specific_location
  availableOnDays     Int[]           // [1, 2, 3]
  availableAtLocations String[]

  // Pricing
  pricingModel        PricingModel    @default(PER_PERSON)
  pricePerPerson      Float
  pricePerGroup       Float?
  minimumParticipants Int             @default(1)
  maximumParticipants Int?
  minimumCharge       Float?
  currency            String          @default("USD")

  // Child Pricing
  childPrice          Float?
  childPricePercent   Float           @default(100)
  childPricingModel   String          @default("same_as_adult")
  childMinAge         Int             @default(0)
  childMaxAge         Int             @default(11)

  // Group Discounts
  groupDiscounts      Json            @default("[]")

  // Requirements & Restrictions
  requirements        Json            @default("[]")
  restrictions        Json            @default("[]")
  minAge              Int?
  maxAge              Int?
  fitnessLevel        String          @default("easy")
  accessibility       String[]

  // What's Included
  inclusions          String[]
  exclusions          String[]
  whatToBring         String[]

  // External Provider
  providerId          String?
  providerName        String?
  providerContact     String?

  // Status & Sorting
  isAvailable         Boolean         @default(true)
  isPopular           Boolean         @default(false)
  isFeatured          Boolean         @default(false)
  sortOrder           Int             @default(0)
  bookingCount        Int             @default(0)

  // Blackouts
  blackoutDates       Json            @default("[]")

  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  // Relations
  package             PackageTemplate @relation(fields: [packageId], references: [id], onDelete: Cascade)
  images              ActivityImage[]
  timeSlots           ActivityTimeSlot[]
  seasonalAvailability ActivitySeasonalAvailability[]

  @@index([packageId])
  @@index([category])
  @@index([isAvailable])
  @@index([isPopular])
}

// Activity Images
model ActivityImage {
  id          String          @id @default(cuid())
  activityId  String
  url         String
  publicId    String?
  alt         String?
  isPrimary   Boolean         @default(false)
  sortOrder   Int             @default(0)

  createdAt   DateTime        @default(now())

  activity    PackageActivity @relation(fields: [activityId], references: [id], onDelete: Cascade)

  @@index([activityId])
}

// Activity Time Slots
model ActivityTimeSlot {
  id            String          @id @default(cuid())
  activityId    String
  name          String          // "Sunrise Flight", "Morning Drive"
  startTime     String          // "05:30"
  endTime       String          // "08:30"
  priceModifier Float           @default(0)
  maxCapacity   Int?
  isDefault     Boolean         @default(false)
  sortOrder     Int             @default(0)

  createdAt     DateTime        @default(now())

  activity      PackageActivity @relation(fields: [activityId], references: [id], onDelete: Cascade)

  @@index([activityId])
}

// Activity Seasonal Availability
model ActivitySeasonalAvailability {
  id            String          @id @default(cuid())
  activityId    String
  startDate     DateTime
  endDate       DateTime
  isAvailable   Boolean         @default(true)
  priceModifier Float           @default(0)
  reason        String?

  createdAt     DateTime        @default(now())

  activity      PackageActivity @relation(fields: [activityId], references: [id], onDelete: Cascade)

  @@index([activityId])
  @@index([startDate, endDate])
}

// Child Pricing Policy per Package
model ChildPricingPolicy {
  id                String          @id @default(cuid())
  packageId         String          @unique

  // Age Boundaries
  infantMinAge      Int             @default(0)
  infantMaxAge      Int             @default(2)
  childMinAge       Int             @default(3)
  childMaxAge       Int             @default(11)
  teenMinAge        Int             @default(12)
  teenMaxAge        Int             @default(17)

  // Infant Pricing
  infantPriceType   String          @default("free") // free, percentage, fixed
  infantPercentage  Int             @default(0)
  infantFixedAmount Float?
  maxFreeInfantsPerRoom Int         @default(1)

  // Child Pricing
  childPriceType    String          @default("percentage")
  childPercentage   Int             @default(50)
  childFixedAmount  Float?
  childSharingDiscount Int          @default(0)

  // Teen Pricing
  teenPriceType     String          @default("adult") // percentage, fixed, adult
  teenPercentage    Int             @default(100)
  teenFixedAmount   Float?

  // Restrictions
  minAdultsRequired Int             @default(1)
  maxChildrenPerRoom Int            @default(2)
  childrenAllowed   Boolean         @default(true)

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  package           PackageTemplate @relation(fields: [packageId], references: [id], onDelete: Cascade)
}

// Package Seasonal Pricing
model PackageSeasonalPricing {
  id                  String          @id @default(cuid())
  packageId           String
  name                String          // "High Season", "Green Season"
  adjustmentType      String          @default("percentage") // percentage, fixed
  adjustmentValue     Float
  affectsBase         Boolean         @default(true)
  affectsAccommodation Boolean        @default(true)
  affectsActivities   Boolean         @default(false)
  priority            Int             @default(0)

  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  package             PackageTemplate @relation(fields: [packageId], references: [id], onDelete: Cascade)
  dateRanges          SeasonalDateRange[]

  @@index([packageId])
}

// Seasonal Date Ranges
model SeasonalDateRange {
  id                String                  @id @default(cuid())
  seasonalPricingId String
  startDate         DateTime
  endDate           DateTime
  recurringYearly   Boolean                 @default(true)

  createdAt         DateTime                @default(now())

  seasonalPricing   PackageSeasonalPricing  @relation(fields: [seasonalPricingId], references: [id], onDelete: Cascade)

  @@index([seasonalPricingId])
  @@index([startDate, endDate])
}

// Package Images
model PackageImage {
  id          String          @id @default(cuid())
  packageId   String
  url         String
  publicId    String?
  alt         String?
  isPrimary   Boolean         @default(false)
  sortOrder   Int             @default(0)

  createdAt   DateTime        @default(now())

  package     PackageTemplate @relation(fields: [packageId], references: [id], onDelete: Cascade)

  @@index([packageId])
}

// Saved Configurations (Tourist)
model SavedConfiguration {
  id            String          @id @default(cuid())
  packageId     String
  userId        String?         // Nullable for anonymous saves
  shareToken    String          @unique @default(cuid())

  // Configuration Data
  configuration Json            // Full configuration snapshot
  travelDate    DateTime?
  travelers     Json?           // { adults, children, teens, infants }

  // Calculated Price (at save time)
  totalPrice    Float?
  currency      String          @default("USD")

  // Expiration
  expiresAt     DateTime?

  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  // Relations
  package       PackageTemplate @relation(fields: [packageId], references: [id], onDelete: Cascade)
  user          User?           @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([packageId])
  @@index([userId])
  @@index([shareToken])
}

// Promo Codes
model PromoCode {
  id              String    @id @default(cuid())
  code            String    @unique
  description     String?

  // Discount
  discountType    String    // percentage, fixed
  discountValue   Float
  maxDiscount     Float?    // Cap for percentage discounts

  // Validity
  startsAt        DateTime?
  expiresAt       DateTime?

  // Usage Limits
  usageLimit      Int?
  usageCount      Int       @default(0)
  usageLimitPerUser Int?

  // Restrictions
  minimumAmount   Float?    // Minimum order value
  packageIds      String[]  // Specific packages only (empty = all)
  agentIds        String[]  // Specific agents only (empty = all)

  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([code])
  @@index([isActive])
}
```

---

## Key Relationships Summary

### User Relationships
| User Role | Can Have |
|-----------|----------|
| CLIENT | Bookings, Reviews, Messages, Conversations |
| AGENT | Agent Profile, Tours, Bookings (as recipient), Withdrawals, Conversations |
| ADMIN | All access, Commission config, Withdrawal approval |

### Booking Flow Relationships
```
User (Client) --creates--> Booking --for--> Tour --owned by--> Agent
         |                    |
         |                    +--has--> Payment
         |                    +--triggers--> Commission calculation
         |                    +--creates--> Conversation
         |
         +--after completion--> Review
```

### Financial Relationships
```
Booking.totalPrice = Booking.pricePerPerson * Booking.numberOfTravelers
Booking.commissionAmount = Booking.totalPrice * (Booking.commissionRate / 100)
Booking.agentEarnings = Booking.totalPrice - Booking.commissionAmount

On Payment.status = COMPLETED:
  Agent.pendingBalance += Booking.agentEarnings

On Booking.status = COMPLETED:
  Agent.pendingBalance -= Booking.agentEarnings
  Agent.availableBalance += Booking.agentEarnings
  Agent.totalEarnings += Booking.agentEarnings

On Withdrawal.status = COMPLETED:
  Agent.availableBalance -= Withdrawal.amount
```

---

## Indexes Strategy

### High-Priority Indexes (MVP)
- User.email - Login lookup
- Tour.slug - URL-based lookup
- Tour.status + Tour.destination - Filtered searches
- Booking.bookingNumber - Lookup by reference
- Payment.pesapalTrackingId - Webhook processing

### Search Indexes
- Full-text search on Tour (title, description, destination)

### Analytics Indexes
- Booking.createdAt + Booking.status - Revenue reports
- Agent.status - Agent management
- Payment.status + Payment.initiatedAt - Payment reports

---

## Data Migration Strategy

### Initial Seed Data

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Commission tiers
  await prisma.commissionConfig.createMany({
    data: [
      {
        tier: "tier_1",
        name: "Standard",
        minAmount: 0,
        maxAmount: 5000,
        percentage: 15,
      },
      {
        tier: "tier_2",
        name: "Premium",
        minAmount: 5000,
        maxAmount: 20000,
        percentage: 12,
      },
      {
        tier: "tier_3",
        name: "Elite",
        minAmount: 20000,
        maxAmount: null,
        percentage: 10,
      },
    ],
  })

  // Platform settings
  await prisma.platformSettings.createMany({
    data: [
      { key: "DEFAULT_CURRENCY", value: "USD" },
      { key: "SUPPORTED_CURRENCIES", value: "USD,KES,TZS,UGX" },
      { key: "MIN_WITHDRAWAL_AMOUNT", value: "50" },
      { key: "WITHDRAWAL_PROCESSING_DAYS", value: "3" },
    ],
  })

  // Create admin user
  await prisma.user.create({
    data: {
      email: "admin@safariplus.com",
      name: "System Admin",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

## Approval Checklist

- [ ] Schema design approved
- [ ] Relationships validated
- [ ] Indexes reviewed
- [ ] Seed data approved

**Approver**: ____________________
**Date**: ____________________
