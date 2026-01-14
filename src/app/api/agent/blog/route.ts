import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { BlogPostStatus, BlogSubmitterType } from "@prisma/client"

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  coverImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  relatedTourIds: z.array(z.string()).optional(),
  relatedDestinations: z.array(z.string()).optional(),
})

// GET /api/agent/blog - List agent's blog posts
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {
      submitterId: session.user.id,
      submittedBy: BlogSubmitterType.AGENT,
    }

    if (status && status !== "all") {
      where.status = status.toUpperCase() as BlogPostStatus
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching agent blog posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    )
  }
}

// POST /api/agent/blog - Create a blog post (pending approval)
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createPostSchema.parse(body)

    // Check for duplicate slug
    const existing = await prisma.blogPost.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: "A blog post with this slug already exists" },
        { status: 400 }
      )
    }

    // Calculate reading time
    const readingTime = Math.ceil(validatedData.content.split(/\s+/).length / 200)

    // Get agent info for author details
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { businessName: true },
    })

    const post = await prisma.blogPost.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
        authorName: agent?.businessName || session.user.name || undefined,
        submitterId: session.user.id,
        submittedBy: BlogSubmitterType.AGENT,
        status: BlogPostStatus.PENDING_APPROVAL,
        readingTime,
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating agent blog post:", error)
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    )
  }
}
