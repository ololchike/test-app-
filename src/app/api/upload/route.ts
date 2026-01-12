import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/lib/auth"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Only agents and admins can upload images
    if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "safariplus/tours",
            resource_type: "image",
            transformation: [
              { width: 1920, height: 1080, crop: "limit" },
              { quality: "auto:good" },
              { fetch_format: "auto" }
            ]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result as { secure_url: string; public_id: string })
          }
        )
        uploadStream.end(buffer)
      }
    )

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}

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
    await cloudinary.uploader.destroy(publicId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    )
  }
}
