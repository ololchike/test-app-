import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { sendPasswordChangedEmail } from "@/lib/email"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/auth/reset-password
 *
 * Reset user password using token from email
 *
 * Security considerations:
 * - Password complexity requirements enforced
 * - Token must be valid and not expired
 * - Token is marked as used (cannot be reused)
 * - Password hashed with bcrypt cost factor 12
 * - Confirmation email sent to notify user
 */

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[a-zA-Z]/,
      "Password must contain at least one letter"
    ),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validation = resetPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { token, password } = validation.data

    // Find the password reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json(
        {
          error: "Invalid or expired reset token",
        },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (resetToken.expires < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { token },
      })

      return NextResponse.json(
        {
          error: "Reset token has expired. Please request a new one.",
        },
        { status: 400 }
      )
    }

    // Check if token has already been used
    if (resetToken.used) {
      return NextResponse.json(
        {
          error: "This reset token has already been used",
        },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    })

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      )
    }

    // Hash the new password with bcrypt (cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user's password and mark token as used in a transaction
    await prisma.$transaction([
      // Update password
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      }),
      // Mark token as used
      prisma.passwordResetToken.update({
        where: { token },
        data: {
          used: true,
          usedAt: new Date(),
        },
      }),
    ])

    // Send password changed confirmation email
    const emailResult = await sendPasswordChangedEmail({
      to: user.email,
      name: user.name || "User",
    })

    if (!emailResult.success) {
      console.error(
        "Failed to send password changed email:",
        emailResult.error
      )
      // Continue despite email failure
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully. You can now log in with your new password.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error resetting password:", error)

    return NextResponse.json(
      {
        error: "An error occurred while resetting your password",
      },
      { status: 500 }
    )
  }
}
