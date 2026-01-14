import { NextRequest, NextResponse } from "next/server"
import { UserRole } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { role, status } = body

    // Prevent admin from changing their own role or status
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot modify your own account" },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: any = {}
    if (role !== undefined) {
      // CRITICAL: Prevent creating more than one admin
      if (role === UserRole.ADMIN) {
        // Check if there's already an admin (other than the current user being modified)
        const existingAdmin = await prisma.user.findFirst({
          where: {
            role: UserRole.ADMIN,
            id: { not: id }, // Exclude the user being modified
          },
        })

        if (existingAdmin) {
          return NextResponse.json(
            { error: "Only one admin account is allowed in the system" },
            { status: 400 }
          )
        }
      }
      updateData.role = role
    }
    if (status !== undefined) {
      updateData.status = status
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "user_updated",
        resource: "user",
        resourceId: user.id,
        metadata: {
          userEmail: user.email,
          changes: updateData,
        },
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}
