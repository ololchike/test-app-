import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/lib/auth"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Only agents and admins can delete images
    if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const { publicId } = await req.json()

    if (!publicId) {
      return NextResponse.json(
        { error: "No public ID provided" },
        { status: 400 }
      )
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result !== "ok") {
      throw new Error(`Failed to delete image: ${result.result}`)
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully"
    })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete image from Cloudinary"
      },
      { status: 500 }
    )
  }
}
