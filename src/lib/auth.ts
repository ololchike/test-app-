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

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
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

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: { agent: true },
        })

        if (!user || !user.password) {
          return null
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
          return null
        }

        // Check if account is active
        if (user.status !== "ACTIVE") {
          throw new Error("Account is not active. Please contact support.")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          agentId: user.agent?.id,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, update user info if needed
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        if (existingUser && existingUser.status !== "ACTIVE") {
          return false
        }
      }

      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.agentId = user.agentId
      }

      // Handle session update
      if (trigger === "update" && session) {
        token.name = session.name
        token.email = session.email
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.agentId = token.agentId as string | undefined
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
