import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { BlogPostStatus, BlogSubmitterType } from "@prisma/client"

const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().nullable().optional(),
  content: z.string().min(1).optional(),
  coverImage: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  metaKeywords: z.array(z.string()).optional(),
})

// GET /api/client/blog/[id] - Get a blog post by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const post = await prisma.blogPost.findFirst({
      where: {
        id,
        submitterId: session.user.id,
        submittedBy: BlogSubmitterType.CLIENT,
      },
      include: {
        category: true,
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

// PUT /api/client/blog/[id] - Update a blog post (resubmit for approval)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updatePostSchema.parse(body)

    // Check post exists and belongs to this client
    const existing = await prisma.blogPost.findFirst({
      where: {
        id,
        submitterId: session.user.id,
        submittedBy: BlogSubmitterType.CLIENT,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      )
    }

    // Clients can only edit draft or rejected posts
    if (existing.status === BlogPostStatus.PUBLISHED) {
      return NextResponse.json(
        { error: "Published posts cannot be edited. Contact support for changes." },
        { status: 400 }
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

    // Calculate reading time if content changed
    const updateData: Record<string, unknown> = { ...validatedData }
    if (validatedData.content) {
      updateData.readingTime = Math.ceil(validatedData.content.split(/\s+/).length / 200)
    }

    // If editing a rejected post, resubmit for approval
    if (existing.status === BlogPostStatus.REJECTED || existing.status === BlogPostStatus.DRAFT) {
      updateData.status = BlogPostStatus.PENDING_APPROVAL
      updateData.rejectionReason = null
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

// DELETE /api/client/blog/[id] - Delete a blog post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.blogPost.findFirst({
      where: {
        id,
        submitterId: session.user.id,
        submittedBy: BlogSubmitterType.CLIENT,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      )
    }

    // Can only delete non-published posts
    if (existing.status === BlogPostStatus.PUBLISHED) {
      return NextResponse.json(
        { error: "Published posts cannot be deleted. Contact support." },
        { status: 400 }
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
