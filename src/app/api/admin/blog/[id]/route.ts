import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { BlogPostStatus } from "@prisma/client"

const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().nullable().optional(),
  content: z.string().min(1).optional(),
  coverImage: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().nullable().optional(),
  authorName: z.string().nullable().optional(),
  authorBio: z.string().nullable().optional(),
  authorAvatar: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  metaKeywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "REJECTED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
  readingTime: z.number().optional(),
  relatedTourIds: z.array(z.string()).optional(),
  relatedDestinations: z.array(z.string()).optional(),
  rejectionReason: z.string().nullable().optional(),
})

// GET /api/admin/blog/[id] - Get a blog post by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: true,
        submitter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/blog/[id] - Update a blog post
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
    const validatedData = updatePostSchema.parse(body)

    // Check post exists
    const existing = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      )
    }

    // Check slug uniqueness if changing
    if (validatedData.slug && validatedData.slug !== existing.slug) {
      const slugExists = await prisma.blogPost.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: "A blog post with this slug already exists" },
          { status: 400 }
        )
      }
    }

    // Handle publishedAt and review tracking
    const updateData: Record<string, unknown> = { ...validatedData }

    // If publishing, set publishedAt
    if (validatedData.status === BlogPostStatus.PUBLISHED && existing.status !== BlogPostStatus.PUBLISHED) {
      updateData.publishedAt = new Date()
    }

    // If approving or rejecting, track the reviewer
    if (
      (validatedData.status === BlogPostStatus.PUBLISHED || validatedData.status === BlogPostStatus.REJECTED) &&
      existing.status === BlogPostStatus.PENDING_APPROVAL
    ) {
      updateData.reviewedBy = session.user.id
      updateData.reviewedAt = new Date()
    }

    // Calculate reading time if content changed
    if (validatedData.content && !validatedData.readingTime) {
      updateData.readingTime = Math.ceil(validatedData.content.split(/\s+/).length / 200)
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ post })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating blog post:", error)
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/blog/[id] - Delete a blog post
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

    const existing = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      )
    }

    await prisma.blogPost.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    )
  }
}
