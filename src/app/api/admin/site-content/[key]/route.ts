import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/site-content/[key] - Get specific site content
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params

    const content = await prisma.siteContent.findUnique({
      where: { key },
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

// DELETE /api/admin/site-content/[key] - Delete site content
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { key } = await params

    await prisma.siteContent.delete({
      where: { key },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting site content:", error)
    return NextResponse.json(
      { error: "Failed to delete site content" },
      { status: 500 }
    )
  }
}
