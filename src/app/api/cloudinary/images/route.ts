import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/lib/auth"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Only agents and admins can browse media library
    if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const maxResults = parseInt(searchParams.get("max_results") || "30")
    const nextCursor = searchParams.get("next_cursor") || undefined
    const folder = searchParams.get("folder") || "safariplus/tours"

    // Fetch images from Cloudinary
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: maxResults,
      next_cursor: nextCursor,
      resource_type: "image",
    })

    // Transform the response to include necessary information
    const images = result.resources.map((resource: any) => ({
      url: resource.secure_url,
      publicId: resource.public_id,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      size: resource.bytes,
      createdAt: resource.created_at,
      thumbnail: cloudinary.url(resource.public_id, {
        transformation: [
          { width: 300, height: 300, crop: "fill" },
          { quality: "auto:low" },
          { fetch_format: "auto" }
        ]
      })
    }))

    return NextResponse.json({
      images,
      nextCursor: result.next_cursor || null,
      hasMore: !!result.next_cursor,
      total: result.total_count,
    })
  } catch (error) {
    console.error("Cloudinary API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch images from Cloudinary" },
      { status: 500 }
    )
  }
}
