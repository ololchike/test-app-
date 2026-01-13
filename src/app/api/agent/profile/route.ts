import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateProfileSchema = z.object({
  // User fields
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional().nullable(),

  // Agent/Business fields
  businessName: z.string().min(2).max(100).optional(),
  businessEmail: z.string().email().optional().nullable().or(z.literal("")),
  businessPhone: z.string().max(20).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  yearsInBusiness: z.number().int().min(0).max(100).optional().nullable(),
  licenseNumber: z.string().max(50).optional().nullable(),
})

/**
 * GET /api/agent/profile
 * Get current agent's profile information
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        agent: {
          select: {
            id: true,
            businessName: true,
            businessEmail: true,
            businessPhone: true,
            description: true,
            logo: true,
            coverImage: true,
            website: true,
            address: true,
            city: true,
            country: true,
            licenseNumber: true,
            katoMember: true,
            tatoMember: true,
            autoMember: true,
            isVerified: true,
            verifiedAt: true,
            yearsInBusiness: true,
            toursConducted: true,
            status: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.agent) {
      return NextResponse.json({ error: "Agent profile not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
        },
        agent: user.agent,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/agent/profile
 * Update agent's profile information
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Separate user and agent fields
    const userFields: Record<string, unknown> = {}
    const agentFields: Record<string, unknown> = {}

    if (validatedData.firstName !== undefined) userFields.firstName = validatedData.firstName
    if (validatedData.lastName !== undefined) userFields.lastName = validatedData.lastName
    if (validatedData.phone !== undefined) userFields.phone = validatedData.phone

    // Update name if firstName or lastName changed
    if (validatedData.firstName !== undefined || validatedData.lastName !== undefined) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { firstName: true, lastName: true },
      })
      const firstName = validatedData.firstName ?? currentUser?.firstName ?? ""
      const lastName = validatedData.lastName ?? currentUser?.lastName ?? ""
      userFields.name = `${firstName} ${lastName}`.trim()
    }

    if (validatedData.businessName !== undefined) agentFields.businessName = validatedData.businessName
    if (validatedData.businessEmail !== undefined) agentFields.businessEmail = validatedData.businessEmail || null
    if (validatedData.businessPhone !== undefined) agentFields.businessPhone = validatedData.businessPhone || null
    if (validatedData.description !== undefined) agentFields.description = validatedData.description || null
    if (validatedData.website !== undefined) agentFields.website = validatedData.website || null
    if (validatedData.address !== undefined) agentFields.address = validatedData.address || null
    if (validatedData.city !== undefined) agentFields.city = validatedData.city || null
    if (validatedData.country !== undefined) agentFields.country = validatedData.country || null
    if (validatedData.yearsInBusiness !== undefined) agentFields.yearsInBusiness = validatedData.yearsInBusiness
    if (validatedData.licenseNumber !== undefined) agentFields.licenseNumber = validatedData.licenseNumber || null

    // Update in transaction
    const [updatedUser, updatedAgent] = await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: Object.keys(userFields).length > 0 ? userFields : undefined,
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
        },
      }),
      prisma.agent.update({
        where: { id: agent.id },
        data: Object.keys(agentFields).length > 0 ? agentFields : undefined,
        select: {
          id: true,
          businessName: true,
          businessEmail: true,
          businessPhone: true,
          description: true,
          logo: true,
          coverImage: true,
          website: true,
          address: true,
          city: true,
          country: true,
          licenseNumber: true,
          katoMember: true,
          tatoMember: true,
          autoMember: true,
          isVerified: true,
          verifiedAt: true,
          yearsInBusiness: true,
          toursConducted: true,
          status: true,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
        agent: updatedAgent,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
