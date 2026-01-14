import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { defaultCollections } from "@/lib/data/collections"

export const revalidate = 300 // Cache for 5 minutes

export async function GET() {
  try {
    // Try to get collections from database first
    const dbCollections = await prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    })

    if (dbCollections.length > 0) {
      // Get tour counts for each collection
      const collectionsWithCounts = await Promise.all(
        dbCollections.map(async (collection) => {
          const criteria = JSON.parse(collection.filterCriteria)
          const tourCount = await getTourCountForCriteria(criteria)
          return {
            ...collection,
            tourCount,
          }
        })
      )

      return NextResponse.json({ collections: collectionsWithCounts })
    }

    // Fall back to default collections with dynamic tour counts
    const collectionsWithCounts = await Promise.all(
      defaultCollections.map(async (collection) => {
        const tourCount = await getTourCountForCriteria(collection.filterCriteria)
        return {
          ...collection,
          tourCount,
        }
      })
    )

    return NextResponse.json({ collections: collectionsWithCounts })
  } catch (error) {
    console.error("Error fetching collections:", error)
    // Return default collections on error
    return NextResponse.json({ collections: defaultCollections.map(c => ({ ...c, tourCount: 0 })) })
  }
}

async function getTourCountForCriteria(criteria: {
  tourType?: string[]
  country?: string[]
  maxPrice?: number
  minPrice?: number
  difficulty?: string
  minDays?: number
  maxDays?: number
}) {
  const where: Record<string, unknown> = {
    status: "ACTIVE",
  }

  if (criteria.country && criteria.country.length > 0) {
    where.country = { in: criteria.country }
  }

  if (criteria.maxPrice) {
    where.basePrice = { ...(where.basePrice as object || {}), lte: criteria.maxPrice }
  }

  if (criteria.minPrice) {
    where.basePrice = { ...(where.basePrice as object || {}), gte: criteria.minPrice }
  }

  if (criteria.difficulty) {
    where.difficulty = criteria.difficulty
  }

  if (criteria.maxDays) {
    where.durationDays = { ...(where.durationDays as object || {}), lte: criteria.maxDays }
  }

  if (criteria.minDays) {
    where.durationDays = { ...(where.durationDays as object || {}), gte: criteria.minDays }
  }

  // For tourType, we need to check if any of the values are in the JSON array
  if (criteria.tourType && criteria.tourType.length > 0) {
    // Use raw query for JSON array search
    const count = await prisma.tour.count({
      where: {
        ...where,
        OR: criteria.tourType.map(type => ({
          tourType: { contains: type }
        }))
      }
    })
    return count
  }

  return prisma.tour.count({ where })
}
