# Feature: Authentication & Authorization

## Status
- [x] Requirements Approved
- [x] Design Complete
- [x] Implementation Started
- [x] Implementation Complete (Email Verification & Password Reset)
- [x] Core Features Complete (Registration, Login, Email Verification, Password Reset)
- [ ] Testing Complete
- [ ] Deployed

## Recent Updates (2026-01-08)
- Created email verification endpoint (`/api/auth/verify-email`)
- Created password reset endpoints (`/api/auth/forgot-password`, `/api/auth/reset-password`)
- Created resend verification endpoint (`/api/auth/resend-verification`)
- Added email service functions for all auth flows (Resend API integration)
- All endpoints include comprehensive security measures
- Token expiration: 24 hours for verification, 1 hour for password reset
- Single-use tokens with database cleanup
- Professional HTML email templates with SafariPlus branding

## Overview

The authentication system handles user registration, login, session management, and role-based access control for three user types: Clients, Agents, and Admins.

## User Stories

### Registration
- As a visitor, I want to register as a client so that I can book tours
- As a visitor, I want to register as an agent so that I can list and manage tours
- As a user, I want to verify my email so that my account is secure
- As a user, I want to sign up with Google so that registration is faster

### Login
- As a user, I want to log in with email/password so that I can access my account
- As a user, I want to log in with Google so that login is convenient
- As a user, I want to stay logged in so that I don't have to re-authenticate frequently

### Password Management
- As a user, I want to reset my password if I forget it [IMPLEMENTED]
- As a user, I want to change my password from my profile
- As a user, I want to resend verification email if I didn't receive it [IMPLEMENTED]

### Authorization
- As a client, I want to access only client features
- As an agent, I want to access agent dashboard and client features
- As an admin, I want to access all platform features

## Acceptance Criteria

### Registration (Client)
- [ ] User can register with email and password
- [ ] Password must be minimum 8 characters with 1 number
- [ ] Email verification email is sent within 30 seconds
- [ ] User cannot access protected features until email is verified
- [ ] Duplicate email registration is prevented with clear error
- [ ] Google OAuth registration creates account automatically

### Registration (Agent)
- [ ] User can register as an agent with business details
- [ ] Business name and phone number are required
- [ ] Agent account is created in PENDING status
- [ ] Agent receives confirmation email with next steps
- [ ] Admin is notified of new agent registration

### Login
- [ ] User can log in with valid email/password
- [ ] Failed login shows generic "Invalid credentials" message
- [ ] Account is locked after 5 failed attempts for 15 minutes
- [ ] Successful login redirects to appropriate dashboard
- [ ] Session persists for 7 days with "remember me"

### Password Reset
- [x] User can request password reset via email
- [x] Reset link expires after 1 hour
- [x] Reset link can only be used once
- [x] User is notified of password change

### Email Verification
- [x] Verification email sent on registration
- [x] Verification link expires after 24 hours
- [x] User can resend verification email
- [x] Token is single-use and deleted after verification

### Authorization
- [ ] Unauthenticated users can only access public pages
- [ ] Clients cannot access /agent or /admin routes
- [ ] Agents cannot access /admin routes
- [ ] API endpoints verify role before processing

## Technical Requirements

### NextAuth.js v5 Configuration

```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 }, // 7 days
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
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

### Type Extensions

```typescript
// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    id: string
  }
}
```

### Registration API

```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/\d/, "Must contain a number"),
  name: z.string().min(2),
  role: z.enum(["CLIENT", "AGENT"]),
  // Agent-specific fields
  businessName: z.string().optional(),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Check existing user
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
      },
    })

    // Create agent profile if registering as agent
    if (data.role === "AGENT" && data.businessName && data.phone) {
      await prisma.agent.create({
        data: {
          userId: user.id,
          businessName: data.businessName,
          phone: data.phone,
          status: "PENDING",
        },
      })
    }

    // Send verification email
    await sendVerificationEmail(user.email, user.id)

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}
```

### Middleware Protection

```typescript
// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const publicRoutes = [
  "/",
  "/tours",
  "/tours/(.*)",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/api/auth/(.*)",
  "/api/tours",
  "/api/tours/(.*)",
]

const agentRoutes = ["/agent", "/agent/(.*)"]
const adminRoutes = ["/admin", "/admin/(.*)"]

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) =>
    new RegExp(`^${route}$`).test(pathname)
  )) {
    return NextResponse.next()
  }

  // Require authentication for all other routes
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = req.auth.user.role

  // Check agent routes
  if (agentRoutes.some((route) =>
    new RegExp(`^${route}$`).test(pathname)
  )) {
    if (role !== "AGENT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Check admin routes
  if (adminRoutes.some((route) =>
    new RegExp(`^${route}$`).test(pathname)
  )) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
```

## Dependencies

- NextAuth.js v5
- @auth/prisma-adapter
- bcryptjs
- Email service (Resend)

## MVP Phase
Phase 1 - Core MVP

## Estimated Effort
13 story points

## Implementation Notes

### Security Checklist
- [ ] Passwords hashed with bcrypt (cost 12)
- [ ] JWT tokens with short expiry
- [ ] CSRF protection enabled
- [ ] Rate limiting on login endpoint
- [ ] Secure cookie configuration

### Testing Checklist
- [ ] Registration flow (happy path)
- [ ] Registration with existing email
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Password reset flow
- [ ] Role-based route protection
- [ ] Google OAuth flow

## Implemented API Endpoints

### 1. POST /api/auth/verify-email
**Purpose**: Verify user's email address using token from verification email

**Request Body**:
```json
{
  "token": "string (required)"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Responses**:
- 400: Invalid or expired token
- 404: User not found
- 500: Server error

**Security Features**:
- Token is single-use (deleted after verification)
- Token has 24-hour expiration
- Database transaction ensures atomicity

**Files**:
- `/src/app/api/auth/verify-email/route.ts`

---

### 2. POST /api/auth/forgot-password
**Purpose**: Generate password reset token and send email

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive a password reset link shortly."
}
```

**Error Responses**:
- 400: Invalid email format
- 500: Server error

**Security Features**:
- Always returns success (prevents email enumeration)
- Token is cryptographically secure (32 bytes)
- Token expires in 1 hour
- Old tokens deleted before creating new one
- No sensitive data in response
- Skips OAuth users silently

**Files**:
- `/src/app/api/auth/forgot-password/route.ts`

---

### 3. POST /api/auth/reset-password
**Purpose**: Reset user password using token from email

**Request Body**:
```json
{
  "token": "string (required)",
  "password": "string (min 8 chars, at least 1 number, 1 letter)"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Password reset successfully. You can now log in with your new password."
}
```

**Error Responses**:
- 400: Invalid token, expired token, or weak password
- 404: User not found
- 500: Server error

**Security Features**:
- Password complexity requirements enforced
- Token must be valid and not expired
- Token marked as used (cannot be reused)
- Password hashed with bcrypt cost factor 12
- Confirmation email sent to notify user
- Database transaction for atomicity

**Files**:
- `/src/app/api/auth/reset-password/route.ts`

---

### 4. POST /api/auth/resend-verification
**Purpose**: Resend email verification link to authenticated user

**Request Body**: None (uses session)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Verification email sent successfully. Please check your inbox."
}
```

**Error Responses**:
- 401: Not authenticated
- 400: Email already verified
- 404: User not found
- 500: Server error or email sending failed

**Security Features**:
- Requires authenticated session
- Only works if email not already verified
- Deletes old tokens before creating new one
- Token expires in 24 hours
- Rate limiting recommended at infrastructure level

**Files**:
- `/src/app/api/auth/resend-verification/route.ts`

---

## Email Service Functions

The following email functions have been added to `/src/lib/email/index.ts`:

### sendVerificationEmail(data: VerificationEmailData)
Sends email verification link with:
- Professional HTML template
- Clickable verification button
- Plain text link fallback
- 24-hour expiration notice
- SafariPlus branding

### sendPasswordResetEmail(data: PasswordResetEmailData)
Sends password reset link with:
- Professional HTML template
- Clickable reset button
- Plain text link fallback
- 1-hour expiration notice
- Security reminder

### sendPasswordChangedEmail(data: PasswordChangedEmailData)
Sends confirmation after password change with:
- Success notification
- Security alert instructions
- Login link
- Contact support information

All email templates include:
- Responsive design
- SafariPlus branding
- Mobile-friendly layout
- Clear call-to-action buttons
- Security best practices

## Approval
- [ ] User Approved
- Date:
- Notes:
