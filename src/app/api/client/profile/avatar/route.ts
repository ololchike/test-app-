import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Helper to extract public ID from Cloudinary URL
function getPublicIdFromUrl(url: string): string | null {
  try {
    // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{format}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (2MB max for avatars)
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 2MB limit" },
        { status: 400 }
      )
    }

    // Get current user to check for existing avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    })

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "safariplus/avatars",
            resource_type: "image",
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto:good" },
              { fetch_format: "auto" }
            ],
            public_id: `user_${session.user.id}_${Date.now()}`,
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result as { secure_url: string; public_id: string })
          }
        )
        uploadStream.end(buffer)
      }
    )

    // Update user avatar in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: result.secure_url },
    })

    // Delete old avatar from Cloudinary if it exists and is a Cloudinary URL
    if (currentUser?.avatar && currentUser.avatar.includes("cloudinary.com")) {
      const oldPublicId = getPublicIdFromUrl(currentUser.avatar)
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId)
        } catch (deleteError) {
          // Log but don't fail the request if old image deletion fails
          console.error("Failed to delete old avatar:", deleteError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get current user avatar
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    })

    if (!user?.avatar) {
      return NextResponse.json(
        { error: "No avatar to delete" },
        { status: 400 }
      )
    }

    // Delete from Cloudinary if it's a Cloudinary URL
    if (user.avatar.includes("cloudinary.com")) {
      const publicId = getPublicIdFromUrl(user.avatar)
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId)
        } catch (deleteError) {
          console.error("Failed to delete avatar from Cloudinary:", deleteError)
        }
      }
    }

    // Remove avatar from database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: null },
    })

    return NextResponse.json({
      success: true,
      message: "Avatar deleted successfully",
    })
  } catch (error) {
    console.error("Avatar delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 }
    )
  }
}
