# Security Quick Reference Guide

Quick copy-paste security patterns for SafariPlus developers.

---

## 🔒 Secure API Route Template

```typescript
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limit"
import { sanitizeInput, createSafeErrorResponse } from "@/lib/security"

// 1. INPUT VALIDATION SCHEMA
const requestSchema = z.object({
  // Define your schema
  name: z.string().min(1).max(100),
  email: z.string().email(),
  amount: z.number().positive(),
})

export async function POST(request: NextRequest) {
  try {
    // 2. AUTHENTICATION CHECK
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 3. AUTHORIZATION CHECK (if needed)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 4. RATE LIMITING
    const clientId = getClientIdentifier(request, session.user.id)
    const rateLimitResult = rateLimiters.api.check(clientId)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
            ),
          },
        }
      )
    }

    // 5. INPUT VALIDATION
    const body = await request.json()
    const validationResult = requestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // 6. INPUT SANITIZATION (for text fields)
    const sanitizedName = sanitizeInput(data.name)

    // 7. BUSINESS LOGIC
    const result = await prisma.model.create({
      data: {
        name: sanitizedName,
        userId: session.user.id,
      },
    })

    // 8. AUDIT LOGGING (for sensitive operations)
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "MODEL_CREATED",
        resource: "Model",
        resourceId: result.id,
        metadata: { name: sanitizedName },
      },
    })

    // 9. SUCCESS RESPONSE
    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    // 10. SAFE ERROR HANDLING
    console.error("Error:", error)
    return NextResponse.json(
      createSafeErrorResponse(error, "Operation failed"),
      { status: 500 }
    )
  }
}
```

---

## 🔐 Authentication Patterns

### Check if User is Authenticated

```typescript
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

### Check User Role

```typescript
// Admin only
if (session.user.role !== "ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

// Agent or Admin
if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
```

### Check Resource Ownership (Agent)

```typescript
const agent = await prisma.agent.findUnique({
  where: { userId: session.user.id },
})

const resource = await prisma.tour.findUnique({
  where: { id },
})

// Agents can only access their own resources, admins can access all
if (session.user.role === "AGENT" && resource.agentId !== agent?.id) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
```

---

## 🚦 Rate Limiting Patterns

### Apply Rate Limiting

```typescript
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limit"

const clientId = getClientIdentifier(request, session?.user?.id)
const rateLimitResult = rateLimiters.api.check(clientId) // or .auth, .payment, .admin

if (!rateLimitResult.success) {
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: {
        "Retry-After": String(
          Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        ),
        "X-RateLimit-Limit": String(rateLimitResult.limit),
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
      },
    }
  )
}
```

### Available Rate Limiters

```typescript
rateLimiters.auth      // 10 requests per 15 minutes
rateLimiters.api       // 100 requests per minute
rateLimiters.payment   // 5 requests per minute
rateLimiters.webhook   // 50 requests per minute
rateLimiters.admin     // 30 requests per minute
```

---

## ✅ Input Validation Patterns

### Basic Validation Schema

```typescript
import { z } from "zod"

const schema = z.object({
  // Strings
  name: z.string().min(1).max(100),
  email: z.string().email(),
  url: z.string().url(),
  uuid: z.string().uuid(),

  // Numbers
  amount: z.number().positive(),
  age: z.number().int().min(18).max(120),
  rating: z.number().int().min(1).max(5),

  // Dates
  date: z.string().datetime(),

  // Enums
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),

  // Arrays
  tags: z.array(z.string()).max(10),

  // Optional fields
  description: z.string().max(2000).optional(),

  // Nullable fields
  middleName: z.string().nullable(),
})

// Use it
const result = schema.safeParse(data)
if (!result.success) {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: result.error.flatten().fieldErrors,
    },
    { status: 400 }
  )
}

const validData = result.data // TypeScript knows the type!
```

---

## 🧹 Input Sanitization Patterns

### Sanitize User Input

```typescript
import { sanitizeInput, sanitizeHtml, escapeHtml } from "@/lib/security"

// For general text (removes XSS)
const safeName = sanitizeInput(userInput.name)

// For rich text (strips dangerous HTML)
const safeContent = sanitizeHtml(userInput.content)

// For HTML attributes (escapes special chars)
const safeAttr = escapeHtml(userInput.title)
```

### Sanitize Before Saving to Database

```typescript
const booking = await prisma.booking.create({
  data: {
    contactName: sanitizeInput(contact.name),
    contactEmail: contact.email, // Already validated by Zod
    contactPhone: sanitizeInput(contact.phone),
    specialRequests: contact.specialRequests
      ? sanitizeInput(contact.specialRequests)
      : null,
  },
})
```

---

## 🛡️ Webhook Security Pattern

```typescript
import { getRealIp } from "@/lib/security"
import { rateLimiters } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // 1. Get real IP
    const clientIp = getRealIp(request)

    // 2. Rate limiting
    const rateLimitResult = rateLimiters.webhook.check(clientIp)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }

    // 3. Verify signature (if available)
    // const signature = request.headers.get("x-webhook-signature")
    // if (!verifyWebhookSignature(payload, signature, SECRET)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    // }

    // 4. Validate payload structure
    const body = await request.json()
    if (!body.id || !body.event) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    // 5. Idempotency check
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { externalId: body.id },
    })
    if (existingEvent) {
      return NextResponse.json({ message: "Already processed" })
    }

    // 6. Process webhook
    // ... your logic

    // 7. Record event
    await prisma.webhookEvent.create({
      data: {
        externalId: body.id,
        event: body.event,
        payload: JSON.stringify(body),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Log error but don't expose details
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    )
  }
}
```

---

## 📝 Audit Logging Pattern

```typescript
// For sensitive operations, always log
await prisma.auditLog.create({
  data: {
    userId: session.user.id,
    action: "WITHDRAWAL_APPROVED", // Use SCREAMING_SNAKE_CASE
    resource: "Withdrawal", // Resource type
    resourceId: withdrawal.id, // Resource ID
    metadata: {
      // Additional context
      amount: withdrawal.amount,
      currency: withdrawal.currency,
      agentId: withdrawal.agentId,
    },
  },
})
```

### Common Actions to Log

- `USER_LOGIN`
- `USER_LOGOUT`
- `PASSWORD_CHANGED`
- `PAYMENT_COMPLETED`
- `PAYMENT_FAILED`
- `BOOKING_CREATED`
- `BOOKING_CANCELLED`
- `AGENT_VERIFIED`
- `AGENT_SUSPENDED`
- `WITHDRAWAL_REQUESTED`
- `WITHDRAWAL_APPROVED`
- `WITHDRAWAL_REJECTED`
- `TOUR_PUBLISHED`
- `ADMIN_ACTION`

---

## 🔍 Safe Error Handling

```typescript
import { createSafeErrorResponse } from "@/lib/security"

try {
  // Your code
} catch (error) {
  // Log full error for debugging
  console.error("Detailed error:", error)

  // Return safe error to client
  return NextResponse.json(
    createSafeErrorResponse(error, "Operation failed"),
    { status: 500 }
  )
}
```

### Development vs Production Errors

The `createSafeErrorResponse` function automatically:
- In development: Returns full error details
- In production: Returns only safe, generic messages
- Removes: File paths, database URLs, API keys, IPs, emails

---

## 🔐 Password Validation

```typescript
import { validatePasswordStrength } from "@/lib/security"

const validation = validatePasswordStrength(password)
if (!validation.valid) {
  return NextResponse.json(
    {
      error: "Weak password",
      details: validation.errors,
    },
    { status: 400 }
  )
}

// Password meets requirements:
// - At least 8 characters
// - Contains uppercase and lowercase
// - Contains number
// - Contains special character
// - Not a common password
```

---

## 📁 File Upload Security

```typescript
import { validateFileType, generateSafeFilename } from "@/lib/security"

// 1. Validate file type by magic bytes (not extension)
const buffer = await file.arrayBuffer()
const bufferData = Buffer.from(buffer)

if (!validateFileType(bufferData, ["jpg", "jpeg", "png", "webp"])) {
  return NextResponse.json(
    { error: "Invalid file type" },
    { status: 400 }
  )
}

// 2. Generate safe filename (prevents path traversal)
const safeFilename = generateSafeFilename(file.name)

// 3. Upload to Cloudinary or S3
```

---

## 🎯 Common Zod Patterns

```typescript
import { z } from "zod"

// Email
z.string().email()

// UUID
z.string().uuid()

// URL
z.string().url()

// Date (ISO string)
z.string().datetime()

// Enum
z.enum(["OPTION_A", "OPTION_B", "OPTION_C"])

// Phone (basic)
z.string().regex(/^\+?[1-9]\d{1,14}$/)

// Positive number
z.number().positive()

// Integer in range
z.number().int().min(1).max(100)

// String with length limits
z.string().min(3).max(100)

// Optional field
z.string().optional()

// Nullable field
z.string().nullable()

// Array with limits
z.array(z.string()).min(1).max(10)

// Object
z.object({
  name: z.string(),
  age: z.number(),
})

// Conditional validation
z.object({
  type: z.enum(["EMAIL", "SMS"]),
  email: z.string().email().optional(),
  phone: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === "EMAIL") return !!data.email
    if (data.type === "SMS") return !!data.phone
    return true
  },
  {
    message: "Email required for EMAIL type, phone for SMS type",
  }
)
```

---

## 🚨 Security Checklist for New Endpoints

Before deploying a new API endpoint, verify:

- [ ] Authentication check (`await auth()`)
- [ ] Authorization check (role/ownership)
- [ ] Rate limiting applied
- [ ] Input validation with Zod schema
- [ ] Input sanitization for text fields
- [ ] Safe error handling (no sensitive info leakage)
- [ ] Audit logging for sensitive operations
- [ ] Tested with invalid/malicious input
- [ ] Returns appropriate HTTP status codes
- [ ] No secrets in code or logs

---

## 📚 Import Cheat Sheet

```typescript
// Authentication
import { auth } from "@/lib/auth"

// Database
import { prisma } from "@/lib/prisma"

// Validation
import { z } from "zod"

// Rate Limiting
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limit"

// Security Utilities
import {
  sanitizeInput,
  sanitizeHtml,
  escapeHtml,
  createSafeErrorResponse,
  getRealIp,
  validatePasswordStrength,
  validateFileType,
  generateSafeFilename,
  verifyWebhookSignature,
} from "@/lib/security"

// Next.js
import { NextRequest, NextResponse } from "next/server"
```

---

## 🔄 Testing Security Features

```bash
# Test rate limiting
for i in {1..15}; do curl -X POST https://your-app.com/api/endpoint; done

# Test authentication
curl -X GET https://your-app.com/api/protected
# Should return 401

# Test authorization
curl -X GET https://your-app.com/api/admin/users -H "Cookie: session=client-token"
# Should return 403

# Test input validation
curl -X POST https://your-app.com/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
# Should return 400
```

---

## 🎓 Remember

1. **Never trust client input** - Always validate and sanitize
2. **Always check authentication** - Every protected endpoint
3. **Always check authorization** - Role and resource ownership
4. **Always rate limit** - Prevent abuse and DoS
5. **Always log sensitive operations** - For audit trail
6. **Always handle errors safely** - No information leakage
7. **Always use HTTPS** - In production
8. **Never commit secrets** - Use environment variables

---

**Security is not optional. It's mandatory.**

Every line of code is a potential vulnerability. Code defensively.
