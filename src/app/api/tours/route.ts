import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const log = createLogger("Tours API")

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("q") || searchParams.get("search") || ""
    const destination = searchParams.get("destination") || ""
    const countries = searchParams.get("countries") || searchParams.get("country") || ""
    const minPrice = parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999")
    const duration = searchParams.get("duration") || ""
    const tourTypes = searchParams.get("types") || searchParams.get("tourType") || ""
    const sort = searchParams.get("sort") || searchParams.get("sortBy") || "featured"
    const featured = searchParams.get("featured") === "true"
    const hasLocation = searchParams.get("hasLocation") === "true"

    // Build where clause
    const where: Record<string, unknown> = {
      status: "ACTIVE",
    }

    // Price filter
    if (minPrice > 0 || maxPrice < 999999) {
      where.basePrice = {
        gte: minPrice,
        lte: maxPrice,
      }
    }

    // Duration filter
    if (duration) {
      const [minDays, maxDays] = duration.split("-").map(Number)
      if (maxDays) {
        where.durationDays = {
          gte: minDays,
          lte: maxDays,
        }
      } else {
        // For "15+" format
        where.durationDays = {
          gte: minDays,
        }
      }
    }

    // Search by title or description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
      ]
    }

    // Filter by destination
    if (destination) {
      where.destination = { contains: destination, mode: "insensitive" }
    }

    // Filter by countries (multiple)
    if (countries) {
      const countryList = countries.split(",").map((c) => c.trim())
      where.country = { in: countryList }
    }

    // Filter by tour types (multiple)
    if (tourTypes) {
      const typeList = tourTypes.split(",").map((t) => t.trim())
      // Match any of the types in the JSON array
      where.AND = typeList.map((type) => ({
        tourType: { contains: type },
      }))
    }

    // Filter featured only
    if (featured) {
      where.featured = true
    }

    // Filter only tours with location data
    if (hasLocation) {
      where.latitude = { not: null }
      where.longitude = { not: null }
    }

    // Build order by
    let orderBy: Record<string, string> | Array<Record<string, string>> = {}

    switch (sort) {
      case "price-low":
      case "price_asc":
        orderBy = { basePrice: "asc" }
        break
      case "price-high":
      case "price_desc":
        orderBy = { basePrice: "desc" }
        break
      case "rating":
        // Note: Sorting by rating requires post-processing since ratings are calculated
        // We fetch all then sort, or use featured as approximation for now
        orderBy = [{ featured: "desc" }, { createdAt: "desc" }]
        break
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "popular":
      case "popularity":
        orderBy = [{ viewCount: "desc" }, { createdAt: "desc" }]
        break
      case "featured":
      default:
        orderBy = [{ featured: "desc" }, { createdAt: "desc" }]
        break
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Execute queries in parallel
    const [tours, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          agent: {
            select: {
              id: true,
              businessName: true,
              isVerified: true,
              user: {
                select: {
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          reviews: {
            where: { isApproved: true },
            select: { rating: true },
          },
          _count: {
            select: {
              reviews: true,
              bookings: true,
            },
          },
        },
      }),
      prisma.tour.count({ where }),
    ])

    // Transform tours to parse JSON arrays and calculate rating
    const transformedTours = tours.map((tour) => {
      // Calculate average rating from approved reviews
      const avgRating = tour.reviews.length > 0
        ? Math.round((tour.reviews.reduce((sum, r) => sum + r.rating, 0) / tour.reviews.length) * 10) / 10
        : 0

      // Remove reviews from response (only needed for rating calculation)
      const { reviews, ...tourWithoutReviews } = tour

      return {
        ...tourWithoutReviews,
        rating: avgRating,
        highlights: JSON.parse(tour.highlights || "[]"),
        included: JSON.parse(tour.included || "[]"),
        excluded: JSON.parse(tour.excluded || "[]"),
        images: JSON.parse(tour.images || "[]"),
        tourType: JSON.parse(tour.tourType || "[]"),
        bestSeason: JSON.parse(tour.bestSeason || "[]"),
      }
    })

    return NextResponse.json({
      tours: transformedTours,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    log.error("Error fetching tours", error)
    return NextResponse.json(
      { error: "Failed to fetch tours" },
      { status: 500 }
    )
  }
}
