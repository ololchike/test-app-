import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createFaqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  order: z.number().optional(),
})

// POST /api/admin/destinations/[id]/faqs - Add a FAQ
export async function POST(
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
    const validatedData = createFaqSchema.parse(body)

    // Check destination exists
    const destination = await prisma.destinationGuide.findUnique({
      where: { id },
    })

    if (!destination) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      )
    }

    // Get current max order
    const maxOrder = await prisma.destinationFAQ.aggregate({
      where: { destinationId: id },
      _max: { order: true },
    })

    const faq = await prisma.destinationFAQ.create({
      data: {
        destinationId: id,
        question: validatedData.question,
        answer: validatedData.answer,
        order: validatedData.order ?? (maxOrder._max.order ?? -1) + 1,
      },
    })

    return NextResponse.json({ faq }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating FAQ:", error)
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    )
  }
}
