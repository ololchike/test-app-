import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/bookings",
  "/profile",
  "/messages",
]

// Routes that require agent role
const agentRoutes = [
  "/agent",
]

// Routes that require admin role
const adminRoutes = [
  "/admin",
]

// Routes that should redirect to dashboard if authenticated
const authRoutes = [
  "/login",
  "/signup",
  "/register",
]

// Routes that don't require email verification
const publicVerificationRoutes = [
  "/verify-email",
  "/resend-verification",
]

export async function middleware(req: NextRequest) {
  const { nextUrl } = req
  const pathname = nextUrl.pathname

  // Get token from JWT
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  })

  const isLoggedIn = !!token
  const userRole = token?.role as string | undefined

  // Allow access to public verification routes
  if (publicVerificationRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if trying to access auth routes while logged in
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isLoggedIn) {
      // Redirect based on role
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", nextUrl))
      }
      if (userRole === "AGENT") {
        return NextResponse.redirect(new URL("/agent/dashboard", nextUrl))
      }
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
    return NextResponse.next()
  }

  // Check admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl))
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl))
    }
    return NextResponse.next()
  }

  // Check agent routes
  if (agentRoutes.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl))
    }
    if (userRole !== "AGENT" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl))
    }
    return NextResponse.next()
  }

  // Check protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(pathname)
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
      )
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need auth
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/webhooks).*)",
  ],
}
