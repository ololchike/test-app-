# SafariPlus Security Guidelines

## Document Information
- **Version**: 1.0
- **Last Updated**: January 2026
- **Status**: Active
- **Owner**: Security Team

---

## Overview

This document outlines the security standards and practices for the SafariPlus platform. All developers must follow these guidelines to ensure the security of our users' data, payment information, and personal details.

SafariPlus handles sensitive information including:
- User personal data (names, emails, phone numbers)
- Payment card details (via Pesapal - never stored locally)
- Booking and travel information
- Business operator data

---

## OWASP Top 10 Coverage

### 1. Injection (SQL, NoSQL)

**Risk Level**: Critical

**SafariPlus Mitigations**:

#### Use Prisma ORM (Parameterized Queries)

```typescript
// CORRECT: Prisma automatically parameterizes queries
const tour = await prisma.tour.findMany({
  where: {
    name: { contains: searchTerm },
    price: { lte: maxPrice }
  }
});

// NEVER DO THIS: Raw query with concatenation
// const tours = await prisma.$queryRawUnsafe(`SELECT * FROM tours WHERE name = '${userInput}'`);
```

#### Input Validation with Zod

```typescript
import { z } from 'zod';

// Define strict schemas for all user input
const TourSearchSchema = z.object({
  destination: z.string().min(2).max(100).regex(/^[a-zA-Z\s-]+$/),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Validate before processing
export async function searchTours(input: unknown) {
  const validated = TourSearchSchema.parse(input);
  // Safe to use validated data
}
```

#### Prevention Checklist
- [ ] Never concatenate user input into queries
- [ ] Always use Prisma ORM methods
- [ ] Validate all input with Zod schemas
- [ ] Use parameterized queries for raw SQL (if absolutely necessary)
- [ ] Sanitize any data used in dynamic contexts

---

### 2. Broken Authentication

**Risk Level**: Critical

**SafariPlus Mitigations**:

#### NextAuth.js Configuration

```typescript
// lib/auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Rate limiting check
        await checkRateLimit(credentials.email);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          await recordFailedAttempt(credentials.email);
          throw new Error('Invalid credentials');
        }

        return user;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
};
```

#### Password Requirements

```typescript
const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
```

#### Rate Limiting on Login

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
  analytics: true,
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  if (!success) {
    throw new Error(`Too many login attempts. Try again in ${Math.ceil((reset - Date.now()) / 1000 / 60)} minutes`);
  }

  return { limit, remaining };
}
```

#### Session Management
- JWT tokens expire after 24 hours
- Refresh tokens are rotated on each use
- Sessions are invalidated on password change
- Concurrent session limit per user (configurable)

#### Authentication Checklist
- [ ] Password hashing with bcrypt (cost factor 12+)
- [ ] Session expiry configured (24 hours max)
- [ ] CSRF protection enabled
- [ ] Secure cookie settings (httpOnly, secure, sameSite)
- [ ] Rate limiting on login (5 attempts/15 minutes)
- [ ] Account lockout after repeated failures
- [ ] Password reset tokens expire in 1 hour
- [ ] Email verification for new accounts

---

### 3. Sensitive Data Exposure

**Risk Level**: High

**SafariPlus Mitigations**:

#### HTTPS Only

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
        ],
      },
    ];
  },
};

// middleware.ts - Force HTTPS
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' &&
      request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    );
  }
}
```

#### Environment Variables

```bash
# .env.local (NEVER COMMIT THIS FILE)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..." # Generate with: openssl rand -base64 32
PESAPAL_CONSUMER_KEY="..."
PESAPAL_CONSUMER_SECRET="..."
CLOUDINARY_API_SECRET="..."
```

```typescript
// Validate environment variables on startup
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  PESAPAL_CONSUMER_KEY: z.string(),
  PESAPAL_CONSUMER_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

#### PCI Compliance for Payments
- **Never store** full card numbers, CVV, or PIN
- Use Pesapal's hosted payment page (iframe redirect)
- Only store: last 4 digits, card type, transaction reference
- All payment data transmitted via TLS 1.3

#### Data Encryption at Rest

```typescript
// For sensitive fields that must be stored
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

### 4. XML External Entities (XXE)

**Risk Level**: Low (Mitigated by Design)

**SafariPlus Mitigations**:

- **JSON Only APIs**: SafariPlus exclusively uses JSON for API communication
- **No XML Parsing**: No XML libraries are included in the project
- **Content-Type Enforcement**: API endpoints reject non-JSON content types

```typescript
// middleware.ts - Enforce JSON content type
export function middleware(request: NextRequest) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const contentType = request.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Only application/json content type is accepted' },
        { status: 415 }
      );
    }
  }
}
```

---

### 5. Broken Access Control

**Risk Level**: Critical

**SafariPlus Mitigations**:

#### Role-Based Middleware

```typescript
// middleware/auth.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export const roleMiddleware = (allowedRoles: string[]) => {
  return async (req: NextRequest) => {
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (!allowedRoles.includes(token.role as string)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  };
};
```

#### Server-Side Authorization Checks

```typescript
// app/api/bookings/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { tour: true }
  });

  if (!booking) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Authorization check: User can only see their own bookings
  // Admin can see all bookings
  // Operator can see bookings for their tours
  const isOwner = booking.userId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';
  const isOperator = session.user.role === 'OPERATOR' &&
                     booking.tour.operatorId === session.user.id;

  if (!isOwner && !isAdmin && !isOperator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(booking);
}
```

#### Route Protection Patterns

```typescript
// config/routes.ts
export const protectedRoutes = {
  '/dashboard': ['USER', 'OPERATOR', 'ADMIN'],
  '/dashboard/bookings': ['USER', 'OPERATOR', 'ADMIN'],
  '/dashboard/tours/manage': ['OPERATOR', 'ADMIN'],
  '/admin': ['ADMIN'],
  '/admin/users': ['ADMIN'],
  '/admin/operators': ['ADMIN'],
};

// middleware.ts
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      const token = await getToken({ req: request });

      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      if (!roles.includes(token.role as string)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  return NextResponse.next();
}
```

---

### 6. Security Misconfiguration

**Risk Level**: High

**SafariPlus Mitigations**:

#### Secure Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.pesapal.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https: blob:;
      font-src 'self' https://fonts.gstatic.com;
      frame-src 'self' https://pay.pesapal.com https://cybqa.pesapal.com;
      connect-src 'self' https://api.cloudinary.com https://pay.pesapal.com;
    `.replace(/\n/g, '')
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=(self)'
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

#### Next.js Security Configuration

```typescript
// next.config.js
module.exports = {
  poweredBy: false, // Remove X-Powered-By header

  // Strict mode for development
  reactStrictMode: true,

  // Image optimization whitelist
  images: {
    domains: ['res.cloudinary.com'],
  },

  // Redirect HTTP to HTTPS in production
  async redirects() {
    return process.env.NODE_ENV === 'production' ? [
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://safariplus.co.ke/:path*',
        permanent: true,
      },
    ] : [];
  },
};
```

#### Production Checklist
- [ ] `NODE_ENV=production` is set
- [ ] Debug logging disabled
- [ ] Stack traces not exposed to users
- [ ] Default error pages customized
- [ ] Admin endpoints protected
- [ ] Unnecessary endpoints removed

---

### 7. Cross-Site Scripting (XSS)

**Risk Level**: High

**SafariPlus Mitigations**:

#### React Auto-Escaping

React automatically escapes values embedded in JSX, preventing most XSS attacks:

```tsx
// SAFE: React escapes this automatically
const TourCard = ({ tour }) => (
  <div>
    <h2>{tour.name}</h2>
    <p>{tour.description}</p>
  </div>
);
```

#### Avoiding dangerouslySetInnerHTML

```tsx
// NEVER DO THIS with user-generated content
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// If absolutely necessary (e.g., CMS content), sanitize first:
import DOMPurify from 'dompurify';

const SafeHTML = ({ content }) => (
  <div
    dangerouslySetInnerHTML={{
      __html: DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'li', 'ol'],
        ALLOWED_ATTR: []
      })
    }}
  />
);
```

#### Content Security Policy

The CSP header (configured above) provides defense-in-depth against XSS by:
- Restricting script sources
- Preventing inline script injection
- Blocking eval() usage (except where required by dependencies)

#### XSS Prevention Checklist
- [ ] Never use dangerouslySetInnerHTML with user input
- [ ] Sanitize any HTML that must be rendered
- [ ] CSP headers configured
- [ ] URL parameters validated before use
- [ ] href attributes validated (prevent javascript: URLs)

---

### 8. Insecure Deserialization

**Risk Level**: Medium

**SafariPlus Mitigations**:

#### Validate All Input with Zod

```typescript
// Every API endpoint must validate input
import { z } from 'zod';

const BookingCreateSchema = z.object({
  tourId: z.string().cuid(),
  date: z.string().datetime(),
  participants: z.number().int().min(1).max(50),
  specialRequests: z.string().max(500).optional(),
  contactInfo: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/),
  }),
});

export async function POST(request: Request) {
  const body = await request.json();

  // This throws ZodError if validation fails
  const validated = BookingCreateSchema.parse(body);

  // Safe to use validated data
  const booking = await prisma.booking.create({
    data: validated
  });

  return NextResponse.json(booking);
}
```

#### TypeScript Type Safety

```typescript
// Types provide compile-time safety
interface CreateBookingInput {
  tourId: string;
  date: Date;
  participants: number;
  specialRequests?: string;
}

// Combined with Zod for runtime validation
type ValidatedBookingInput = z.infer<typeof BookingCreateSchema>;
```

#### JSON Parsing Safety

```typescript
// Use structured parsing, never eval()
const parseJSON = (data: string) => {
  try {
    return JSON.parse(data);
  } catch {
    throw new Error('Invalid JSON');
  }
};
```

---

### 9. Using Components with Known Vulnerabilities

**Risk Level**: High

**SafariPlus Mitigations**:

#### npm Audit

```bash
# Run before every deployment
npm audit

# Fix automatically where possible
npm audit fix

# For major version updates (review carefully)
npm audit fix --force
```

#### Dependabot Setup

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    groups:
      production-dependencies:
        dependency-type: "production"
      development-dependencies:
        dependency-type: "development"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
```

#### Regular Update Schedule
- **Weekly**: Review and merge Dependabot PRs
- **Monthly**: Check for major version updates
- **Quarterly**: Full dependency audit and cleanup

#### Package Pinning

```json
// package.json - Use exact versions for critical packages
{
  "dependencies": {
    "next-auth": "4.24.5",
    "prisma": "5.7.1",
    "@prisma/client": "5.7.1"
  }
}
```

---

### 10. Insufficient Logging & Monitoring

**Risk Level**: Medium

**SafariPlus Mitigations**:

#### Error Logging

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
  redact: {
    paths: ['password', 'token', 'secret', 'creditCard', 'cvv'],
    censor: '[REDACTED]'
  },
});

// Usage
logger.info({ userId, action: 'login' }, 'User logged in');
logger.error({ err, userId }, 'Payment failed');
```

#### Audit Trails for Sensitive Actions

```typescript
// lib/audit.ts
export async function createAuditLog(event: {
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  await prisma.auditLog.create({
    data: {
      ...event,
      timestamp: new Date(),
    },
  });
}

// Audit these actions:
type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTER'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'BOOKING_CREATE'
  | 'BOOKING_CANCEL'
  | 'PAYMENT_INITIATE'
  | 'PAYMENT_COMPLETE'
  | 'PAYMENT_FAIL'
  | 'TOUR_CREATE'
  | 'TOUR_UPDATE'
  | 'TOUR_DELETE'
  | 'ADMIN_ACTION';
```

#### Payment Logging

```typescript
// All payment events must be logged
export async function logPaymentEvent(event: {
  transactionId: string;
  pesapalRef?: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata?: Record<string, unknown>;
}) {
  // Log to database
  await prisma.paymentLog.create({ data: event });

  // Log to monitoring system
  logger.info({
    type: 'payment',
    ...event,
    // Never log full card details
  }, `Payment ${event.status}: ${event.transactionId}`);
}
```

---

## Payment Security (Pesapal Specific)

### Never Store Card Details

```typescript
// ONLY store these payment fields:
interface StoredPaymentData {
  transactionId: string;        // Our internal ID
  pesapalTrackingId: string;    // Pesapal reference
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;        // e.g., "MPESA", "CARD"
  cardLastFour?: string;        // Only last 4 digits
  cardType?: string;            // e.g., "VISA", "MASTERCARD"
  createdAt: Date;
  completedAt?: Date;
}

// NEVER store:
// - Full card number
// - CVV/CVC
// - PIN
// - Full expiry date
```

### Webhook Signature Verification

```typescript
// app/api/webhooks/pesapal/route.ts
import crypto from 'crypto';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-pesapal-signature');

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.PESAPAL_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    logger.warn({ signature }, 'Invalid Pesapal webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Process verified webhook
  const data = JSON.parse(body);
  await processPaymentWebhook(data);

  return NextResponse.json({ received: true });
}
```

### Idempotency Keys

```typescript
// Prevent duplicate payment processing
export async function processPayment(bookingId: string, amount: number) {
  const idempotencyKey = `payment-${bookingId}-${amount}`;

  // Check if already processed
  const existing = await prisma.payment.findUnique({
    where: { idempotencyKey }
  });

  if (existing) {
    logger.info({ idempotencyKey }, 'Duplicate payment request ignored');
    return existing;
  }

  // Create payment with idempotency key
  const payment = await prisma.payment.create({
    data: {
      idempotencyKey,
      bookingId,
      amount,
      status: 'PENDING'
    }
  });

  return payment;
}
```

### Transaction Logging

```typescript
// Log all payment state transitions
export async function updatePaymentStatus(
  transactionId: string,
  newStatus: PaymentStatus,
  pesapalResponse?: unknown
) {
  const payment = await prisma.payment.findUnique({
    where: { id: transactionId }
  });

  // Log state transition
  await createAuditLog({
    action: `PAYMENT_${newStatus}`,
    resource: 'payment',
    resourceId: transactionId,
    userId: payment.userId,
    metadata: {
      previousStatus: payment.status,
      newStatus,
      pesapalResponse: sanitizePesapalResponse(pesapalResponse),
    },
  });

  // Update payment
  await prisma.payment.update({
    where: { id: transactionId },
    data: { status: newStatus }
  });
}
```

---

## File Upload Security

### File Type Validation (Whitelist)

```typescript
// lib/upload.ts
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf'
];

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return false;
  }

  // Also check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
    'application/pdf': ['pdf'],
  };

  return validExtensions[file.type]?.includes(extension) ?? false;
}
```

### File Size Limits

```typescript
const FILE_SIZE_LIMITS = {
  avatar: 2 * 1024 * 1024,      // 2MB
  tourImage: 5 * 1024 * 1024,   // 5MB
  document: 10 * 1024 * 1024,   // 10MB
};

export function validateFileSize(file: File, type: keyof typeof FILE_SIZE_LIMITS): boolean {
  return file.size <= FILE_SIZE_LIMITS[type];
}
```

### Cloudinary Upload (No Local Storage)

```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: Buffer, options: {
  folder: string;
  publicId?: string;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `safariplus/${options.folder}`,
        public_id: options.publicId,
        resource_type: 'image',
        // Security options
        moderation: 'aws_rek', // Optional: AWS Rekognition moderation
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    ).end(file);
  });
}
```

### EXIF Data Stripping

```typescript
// Strip metadata from images before upload
import sharp from 'sharp';

export async function processImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // Auto-rotate based on EXIF
    .withMetadata({ // Remove all EXIF except orientation
      exif: {},
      iptc: {},
      xmp: {}
    })
    .toBuffer();
}
```

---

## API Security

### Rate Limiting

```typescript
// middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
});

export async function rateLimitMiddleware(request: NextRequest) {
  const ip = request.ip ?? 'anonymous';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    );
  }

  return NextResponse.next();
}
```

### API Key Management

```typescript
// For operator API access
export async function validateApiKey(request: Request) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return { valid: false, error: 'API key required' };
  }

  const hashedKey = crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');

  const keyRecord = await prisma.apiKey.findUnique({
    where: { hashedKey },
    include: { operator: true }
  });

  if (!keyRecord || keyRecord.revokedAt) {
    return { valid: false, error: 'Invalid API key' };
  }

  // Update last used
  await prisma.apiKey.update({
    where: { id: keyRecord.id },
    data: { lastUsedAt: new Date() }
  });

  return { valid: true, operator: keyRecord.operator };
}
```

### CORS Configuration

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || 'https://safariplus.co.ke' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-API-Key' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },
};
```

### Request Validation

```typescript
// Every API endpoint follows this pattern
export async function POST(request: Request) {
  // 1. Authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 3. Validate with Zod
  const result = RequestSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    );
  }

  // 4. Authorization check
  if (!canPerformAction(session.user, result.data)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 5. Process request
  try {
    const response = await processRequest(result.data);
    return NextResponse.json(response);
  } catch (error) {
    logger.error({ error }, 'Request processing failed');
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

## Environment Security

### .gitignore Configuration

```gitignore
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local

# Secrets
*.pem
*.key
secrets/

# IDE
.idea/
.vscode/settings.json

# Dependencies
node_modules/

# Build outputs
.next/
out/
build/

# Logs
*.log
npm-debug.log*
```

### Environment Per Stage

```bash
# Development (.env.development)
DATABASE_URL="postgresql://localhost:5432/safariplus_dev"
PESAPAL_ENV="sandbox"
PESAPAL_CONSUMER_KEY="sandbox_key"

# Staging (.env.staging)
DATABASE_URL="postgresql://staging-db.internal:5432/safariplus"
PESAPAL_ENV="sandbox"
PESAPAL_CONSUMER_KEY="staging_sandbox_key"

# Production (.env.production)
DATABASE_URL="postgresql://production-db.internal:5432/safariplus"
PESAPAL_ENV="live"
PESAPAL_CONSUMER_KEY="production_live_key"
```

### Secret Rotation Procedure

1. **Schedule**: Rotate secrets quarterly or after any security incident
2. **Process**:
   - Generate new secret
   - Update in secret manager (e.g., AWS Secrets Manager, Vercel)
   - Deploy application
   - Verify functionality
   - Revoke old secret
   - Document rotation in audit log

```typescript
// Track secret versions
interface SecretVersion {
  name: string;
  version: number;
  createdAt: Date;
  expiresAt: Date;
  rotatedBy: string;
}
```

---

## Security Checklist Summary

### Authentication
- [ ] Password hashing (bcrypt via NextAuth)
- [ ] Session expiry (24 hours)
- [ ] CSRF protection enabled
- [ ] Secure cookie settings
- [ ] Rate limiting on login
- [ ] Account lockout implemented

### Environment
- [ ] .env in .gitignore
- [ ] Different keys per environment
- [ ] Secret rotation procedure documented
- [ ] No secrets in code or logs

### Data Protection
- [ ] HTTPS enforced
- [ ] Sensitive data encrypted at rest
- [ ] No card details stored
- [ ] PCI compliance for payments

### API Security
- [ ] Rate limiting configured
- [ ] CORS properly restricted
- [ ] All input validated with Zod
- [ ] Authorization checks on all endpoints

### Infrastructure
- [ ] Security headers configured
- [ ] Dependencies regularly updated
- [ ] npm audit runs on CI/CD
- [ ] Logging and monitoring active

---

## Incident Response

### If a Security Incident Occurs

1. **Contain**: Immediately disable affected functionality
2. **Assess**: Determine scope and impact
3. **Notify**: Alert security team and affected parties
4. **Remediate**: Fix vulnerability and deploy
5. **Review**: Post-incident analysis and documentation
6. **Improve**: Update security measures to prevent recurrence

### Security Contact

Report security vulnerabilities to: security@safariplus.co.ke

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Security Team | Initial document |
