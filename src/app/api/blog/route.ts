import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/blog - List published blog posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured") === "true"
    const category = searchParams.get("category")
    const tag = searchParams.get("tag")
    const limit = parseInt(searchParams.get("limit") || "12")
    const page = parseInt(searchParams.get("page") || "1")

    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    }

    if (featured) {
      where.isFeatured = true
    }

    if (category) {
      where.category = { slug: category }
    }

    if (tag) {
      where.tags = { has: tag }
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImage: true,
          authorName: true,
          authorAvatar: true,
          tags: true,
          isFeatured: true,
          viewCount: true,
          readingTime: true,
          publishedAt: true,
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
              color: true,
            },
          },
        },
        orderBy: [
          { isFeatured: "desc" },
          { publishedAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    )
  }
}
