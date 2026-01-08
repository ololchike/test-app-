"use server"

import crypto from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signupSchema, agentSignupSchema } from "@/lib/validations/auth"
import type { SignupInput, AgentSignupInput } from "@/lib/validations/auth"
import { sendVerificationEmail } from "@/lib/email"

export type ActionResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export async function signupAction(
  input: SignupInput
): Promise<ActionResponse<{ userId: string }>> {
  try {
    // Validate input
    const validated = signupSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      }
    }

    const { name, email, password } = validated.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

    // Create user and verification token in a transaction
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "CLIENT",
        status: "ACTIVE",
        emailVerified: null, // User must verify email first
      },
    })

    // Store verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: verificationToken,
        expires: expiresAt,
      },
    })

    // Send verification email (don't block registration on email failure)
    try {
      await sendVerificationEmail({
        to: email.toLowerCase(),
        name: name,
        token: verificationToken,
      })
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // Continue with registration even if email fails
      // User can request a new verification email later
    }

    return {
      success: true,
      data: { userId: user.id },
    }
  } catch (error) {
    console.error("Signup error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

export async function agentSignupAction(
  input: AgentSignupInput
): Promise<ActionResponse<{ userId: string; agentId: string }>> {
  try {
    // Validate input
    const validated = agentSignupSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      }
    }

    const {
      name,
      email,
      phone,
      password,
      businessName,
      businessEmail,
      businessPhone,
      country,
      city,
      address,
      description,
      licenseNumber,
      katoMember,
      tatoMember,
      autoMember,
    } = validated.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

    // Create user and agent in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          phone,
          password: hashedPassword,
          role: "AGENT",
          status: "ACTIVE",
          emailVerified: null, // User must verify email first
        },
      })

      // Create agent profile
      const agent = await tx.agent.create({
        data: {
          userId: user.id,
          businessName,
          businessEmail: businessEmail || null,
          businessPhone: businessPhone || null,
          country,
          city,
          address: address || null,
          description: description || null,
          licenseNumber: licenseNumber || null,
          katoMember,
          tatoMember,
          autoMember,
          status: "PENDING", // Agents need approval
        },
      })

      // Store verification token
      await tx.verificationToken.create({
        data: {
          identifier: email.toLowerCase(),
          token: verificationToken,
          expires: expiresAt,
        },
      })

      return { user, agent }
    })

    // Send verification email (don't block registration on email failure)
    try {
      await sendVerificationEmail({
        to: email.toLowerCase(),
        name: name,
        token: verificationToken,
      })
    } catch (emailError) {
      console.error("Failed to send agent verification email:", emailError)
      // Continue with registration even if email fails
      // User can request a new verification email later
    }

    return {
      success: true,
      data: {
        userId: result.user.id,
        agentId: result.agent.id,
      },
    }
  } catch (error) {
    console.error("Agent signup error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  })
  return !!user
}
