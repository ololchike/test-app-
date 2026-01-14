import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateFaqSchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  order: z.number().optional(),
  isPublished: z.boolean().optional(),
})

// PUT /api/admin/destinations/[id]/faqs/[faqId] - Update a FAQ
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; faqId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, faqId } = await params
    const body = await request.json()
    const validatedData = updateFaqSchema.parse(body)

    // Check FAQ exists and belongs to destination
    const existing = await prisma.destinationFAQ.findFirst({
      where: {
        id: faqId,
        destinationId: id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      )
    }

    const faq = await prisma.destinationFAQ.update({
      where: { id: faqId },
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

// DELETE /api/admin/destinations/[id]/faqs/[faqId] - Delete a FAQ
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; faqId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, faqId } = await params

    // Check FAQ exists and belongs to destination
    const existing = await prisma.destinationFAQ.findFirst({
      where: {
        id: faqId,
        destinationId: id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      )
    }

    await prisma.destinationFAQ.delete({
      where: { id: faqId },
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
