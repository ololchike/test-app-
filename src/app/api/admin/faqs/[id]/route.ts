import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateFaqSchema = z.object({
  category: z.string().min(1).optional(),
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  order: z.number().optional(),
  isPublished: z.boolean().optional(),
})

// PUT /api/admin/faqs/[id] - Update a FAQ
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateFaqSchema.parse(body)

    const existing = await prisma.siteFAQ.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      )
    }

    const faq = await prisma.siteFAQ.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({ faq })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating FAQ:", error)
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/faqs/[id] - Delete a FAQ
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.siteFAQ.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      )
    }

    await prisma.siteFAQ.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting FAQ:", error)
    return NextResponse.json(
      { error: "Failed to delete FAQ" },
      { status: 500 }
    )
  }
}
