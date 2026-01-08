import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/auth/resend-verification
 *
 * Resend email verification link to authenticated user
 *
 * Security considerations:
 * - Requires authenticated session
 * - Only allows resending if email not already verified
 * - Deletes old tokens before creating new one
 * - Token expires in 24 hours
 * - Rate limiting should be implemented at infrastructure level
 */

export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: "Unauthorized. Please log in to resend verification email.",
        },
        { status: 401 }
      )
    }

    // Get current user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      )
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        {
          error: "Your email is already verified",
        },
        { status: 400 }
      )
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex")

    // Set expiration to 24 hours from now
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email },
    })

    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    })

    // Send verification email
    const emailResult = await sendVerificationEmail({
      to: user.email,
      name: user.name || "User",
      token,
    })

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error)

      return NextResponse.json(
        {
          error: "Failed to send verification email. Please try again later.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verification email sent successfully. Please check your inbox.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error resending verification email:", error)

    return NextResponse.json(
      {
        error: "An error occurred while resending verification email",
      },
      { status: 500 }
    )
  }
}
