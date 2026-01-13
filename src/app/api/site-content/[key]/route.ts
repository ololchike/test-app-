import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/site-content/[key] - Get site content by key (public)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params

    const content = await prisma.siteContent.findUnique({
      where: { key },
      select: {
        key: true,
        title: true,
        content: true,
        updatedAt: true,
      },
    })

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error fetching site content:", error)
    return NextResponse.json(
      { error: "Failed to fetch site content" },
      { status: 500 }
    )
  }
}
