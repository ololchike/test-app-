import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/blog/categories - List blog categories
export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        image: true,
        color: true,
        _count: {
          select: {
            posts: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
