import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import type { NextAuthConfig } from "next-auth"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

// Validation schema for credentials
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// SECURITY: Brute force protection - Track failed login attempts
const failedLoginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

// Clean up old failed attempts every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of failedLoginAttempts.entries()) {
      if (now - value.lastAttempt > LOCKOUT_DURATION) {
        failedLoginAttempts.delete(key)
      }
    }
  }, 60 * 60 * 1000)
}

function checkBruteForce(email: string): boolean {
  const attempts = failedLoginAttempts.get(email)
  if (!attempts) return false

  const now = Date.now()
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    failedLoginAttempts.delete(email)
    return false
  }

  return attempts.count >= MAX_FAILED_ATTEMPTS
}

function recordFailedAttempt(email: string): void {
  const attempts = failedLoginAttempts.get(email)
  const now = Date.now()

  if (!attempts) {
    failedLoginAttempts.set(email, { count: 1, lastAttempt: now })
  } else {
    attempts.count++
    attempts.lastAttempt = now
  }
}

function clearFailedAttempts(email: string): void {
  failedLoginAttempts.delete(email)
}

const useSecureCookies = process.env.NODE_ENV === "production"
const cookiePrefix = useSecureCookies ? "__Secure-" : ""

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}authjs.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${cookiePrefix}authjs.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/onboarding",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)

        if (!parsed.success) {
          return null
        }

        const { email, password } = parsed.data
        const normalizedEmail = email.toLowerCase()

        // SECURITY: Check for brute force attacks
        if (checkBruteForce(normalizedEmail)) {
          throw new Error(
            `Too many failed login attempts. Account temporarily locked. Please try again in ${Math.ceil(LOCKOUT_DURATION / 60000)} minutes.`
          )
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: { agent: true },
        })

        if (!user || !user.password) {
          // SECURITY: Record failed attempt
          recordFailedAttempt(normalizedEmail)
          // Use constant-time delay to prevent user enumeration
          await new Promise(resolve => setTimeout(resolve, 1000))
          return null
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
          // SECURITY: Record failed attempt
          recordFailedAttempt(normalizedEmail)
          // Use constant-time delay to prevent timing attacks
          await new Promise(resolve => setTimeout(resolve, 1000))
          return null
        }

        // SECURITY: Clear failed attempts on successful login
        clearFailedAttempts(normalizedEmail)

        // Check if user account is active
        if (user.status !== "ACTIVE") {
          throw new Error("Account is not active. Please contact support.")
        }

        // Check if agent is suspended
        if (user.agent && user.agent.status === "SUSPENDED") {
          throw new Error("Your agent account has been suspended. Please contact support.")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          agentId: user.agent?.id,
          phone: user.phone ?? undefined,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, check if user/agent is suspended
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { agent: true },
        })

        if (existingUser) {
          // Check if user account is not active
          if (existingUser.status !== "ACTIVE") {
            return false
          }
          // Check if agent is suspended
          if (existingUser.agent && existingUser.agent.status === "SUSPENDED") {
            return false
          }
        }
      }

      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.agentId = user.agentId
        token.phone = user.phone
      }

      // Handle session update
      if (trigger === "update" && session) {
        token.name = session.name
        token.email = session.email
        if (session.phone) token.phone = session.phone
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.agentId = token.agentId as string | undefined
        session.user.phone = token.phone as string | undefined
      }

      return session
    },
  },
  events: {
    async signIn({ user, account }) {
      // Sign-in event - could be used for analytics/audit logging
      // In production, use a proper logging service
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log(`User signed in: ${user.email} via ${account?.provider}`)
      }
    },
    async signOut(message) {
      // Sign-out event - could be used for analytics/audit logging
      if (process.env.NODE_ENV === "development" && "token" in message && message.token) {
        // eslint-disable-next-line no-console
        console.log(`User signed out: ${message.token.email}`)
      }
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
