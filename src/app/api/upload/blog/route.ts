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

    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "image" or "video"

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    const validVideoTypes = ["video/mp4", "video/webm", "video/quicktime"]

    const isImage = validImageTypes.includes(file.type)
    const isVideo = validVideoTypes.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPG, PNG, WebP, GIF for images; MP4, WebM, MOV for videos." },
        { status: 400 }
      )
    }

    // Validate file size
    const maxImageSize = 10 * 1024 * 1024 // 10MB for images
    const maxVideoSize = 100 * 1024 * 1024 // 100MB for videos
    const maxSize = isVideo ? maxVideoSize : maxImageSize

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${isVideo ? "100MB" : "10MB"} limit` },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const resourceType = isVideo ? "video" : "image"

    const result = await new Promise<{ secure_url: string; public_id: string; resource_type: string }>(
      (resolve, reject) => {
        const uploadOptions: Record<string, unknown> = {
          folder: "safariplus/blog",
          resource_type: resourceType,
        }

        // Add transformations for images
        if (isImage) {
          uploadOptions.transformation = [
            { width: 1920, height: 1080, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ]
        }

        // Add transformations for videos
        if (isVideo) {
          uploadOptions.eager = [
            { width: 1280, height: 720, crop: "limit", quality: "auto" }
          ]
          uploadOptions.eager_async = true
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error)
            else resolve(result as { secure_url: string; public_id: string; resource_type: string })
          }
        )
        uploadStream.end(buffer)
      }
    )

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    })
  } catch (error) {
    console.error("Blog upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
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

    const { publicId, resourceType = "image" } = await req.json()

    if (!publicId) {
      return NextResponse.json(
        { error: "No public ID provided" },
        { status: 400 }
      )
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Blog delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    )
  }
}
