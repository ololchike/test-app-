import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createFaqSchema = z.object({
  category: z.string().min(1, "Category is required"),
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  order: z.number().optional(),
  isPublished: z.boolean().optional(),
})

// GET /api/admin/faqs - List all FAQs
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const where: Record<string, unknown> = {}

    if (category && category !== "all") {
      where.category = category
    }

    const faqs = await prisma.siteFAQ.findMany({
      where,
      orderBy: [
        { category: "asc" },
        { order: "asc" },
      ],
    })

    // Group by category
    const grouped = faqs.reduce((acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = []
      }
      acc[faq.category].push(faq)
      return acc
    }, {} as Record<string, typeof faqs>)

    return NextResponse.json({ faqs, grouped })
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    )
  }
}

// POST /api/admin/faqs - Create a FAQ
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createFaqSchema.parse(body)

    // Get current max order for this category
    const maxOrder = await prisma.siteFAQ.aggregate({
      where: { category: validatedData.category },
      _max: { order: true },
    })

    const faq = await prisma.siteFAQ.create({
      data: {
        ...validatedData,
        order: validatedData.order ?? (maxOrder._max.order ?? -1) + 1,
      },
    })

    return NextResponse.json({ faq }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
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
