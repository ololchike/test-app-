import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

/**
 * POST /api/auth/verify-email
 *
 * Verify user's email address using token from verification email
 *
 * Security considerations:
 * - Token is single-use (deleted after verification)
 * - Token has expiration timestamp
 * - No rate limiting needed as token is unique and single-use
 */

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validation = verifyEmailSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { token } = validation.data

    // Find the verification token in database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        {
          error: "Invalid or expired verification token",
        },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      })

      return NextResponse.json(
        {
          error: "Verification token has expired. Please request a new one.",
        },
        { status: 400 }
      )
    }

    // Find user by email (identifier in VerificationToken is the email)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      )
    }

    // Update user's emailVerified field
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
      },
    })

    // Delete the used verification token
    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error verifying email:", error)

    return NextResponse.json(
      {
        error: "An error occurred while verifying your email",
      },
      { status: 500 }
    )
  }
}
