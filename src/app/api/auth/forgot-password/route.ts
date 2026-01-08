import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { sendPasswordResetEmail } from "@/lib/email"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/auth/forgot-password
 *
 * Generate password reset token and send email
 *
 * Security considerations:
 * - Always returns success message (don't reveal if email exists)
 * - Token is cryptographically secure (32 bytes)
 * - Token expires in 1 hour
 * - Old tokens are deleted before creating new one
 * - No sensitive data in response
 */

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validation = forgotPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid email address",
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { email } = validation.data
    const normalizedEmail = email.toLowerCase()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // SECURITY: Always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message:
            "If an account exists with this email, you will receive a password reset link shortly.",
        },
        { status: 200 }
      )
    }

    // Check if user has a password (OAuth users don't)
    if (!user.password) {
      // Still return success but don't send email
      return NextResponse.json(
        {
          success: true,
          message:
            "If an account exists with this email, you will receive a password reset link shortly.",
        },
        { status: 200 }
      )
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex")

    // Set expiration to 1 hour from now
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete any existing password reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    })

    // Create new password reset token
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token,
        expires,
        used: false,
      },
    })

    // Send password reset email
    const emailResult = await sendPasswordResetEmail({
      to: normalizedEmail,
      name: user.name || "User",
      token,
    })

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error)
      // Don't expose email sending failure to user for security
    }

    // Return generic success message
    return NextResponse.json(
      {
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link shortly.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in forgot password:", error)

    // Return generic error message (don't expose internal errors)
    return NextResponse.json(
      {
        error: "An error occurred while processing your request",
      },
      { status: 500 }
    )
  }
}
