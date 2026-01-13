import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/site-content - Get all site content
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contents = await prisma.siteContent.findMany({
      orderBy: { key: "asc" },
    })

    return NextResponse.json({ contents })
  } catch (error) {
    console.error("Error fetching site content:", error)
    return NextResponse.json(
      { error: "Failed to fetch site content" },
      { status: 500 }
    )
  }
}

// POST /api/admin/site-content - Create or update site content
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { key, title, content } = body

    if (!key || !title || !content) {
      return NextResponse.json(
        { error: "Key, title, and content are required" },
        { status: 400 }
      )
    }

    const siteContent = await prisma.siteContent.upsert({
      where: { key },
      update: {
        title,
        content,
        updatedBy: session.user.id,
      },
      create: {
        key,
        title,
        content,
        updatedBy: session.user.id,
      },
    })

    return NextResponse.json({ content: siteContent })
  } catch (error) {
    console.error("Error saving site content:", error)
    return NextResponse.json(
      { error: "Failed to save site content" },
      { status: 500 }
    )
  }
}
