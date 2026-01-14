import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  coverImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  authorName: z.string().optional(),
  authorBio: z.string().optional(),
  authorAvatar: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
  readingTime: z.number().optional(),
  relatedTourIds: z.array(z.string()).optional(),
  relatedDestinations: z.array(z.string()).optional(),
})

// GET /api/admin/blog - List all blog posts (admin)
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const categoryId = searchParams.get("category")

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status.toUpperCase()
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
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
      orderBy: [
        { updatedAt: "desc" },
      ],
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    )
  }
}

// POST /api/admin/blog - Create a blog post
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    // Calculate reading time if not provided
    const readingTime = validatedData.readingTime ||
      Math.ceil(validatedData.content.split(/\s+/).length / 200)

    const post = await prisma.blogPost.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
        readingTime,
        publishedAt: validatedData.status === "PUBLISHED" ? new Date() : null,
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

    console.error("Error creating blog post:", error)
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    )
  }
}
