import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/blog/[slug] - Get a blog post by slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
            color: true,
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

    if (post.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Blog post not published" },
        { status: 404 }
      )
    }

    // Increment view count (async, don't wait)
    prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {})

    // Get related posts
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        id: { not: post.id },
        status: "PUBLISHED",
        OR: [
          { categoryId: post.categoryId },
          { tags: { hasSome: post.tags } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
    })

    return NextResponse.json({
      post,
      relatedPosts,
    })
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    )
  }
}
