import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { ComparisonTable } from "@/components/tours/comparison-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, GitCompare } from "lucide-react"
import { SectionError } from "@/components/error"

export const metadata: Metadata = {
  title: "Compare Tours | SafariPlus",
  description: "Compare safari tours side by side to find your perfect adventure",
}

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams
  const ids = params.ids?.split(",").filter(Boolean) || []

  if (ids.length < 2) {
    redirect("/tours")
  }

  // Fetch tours with all details for comparison
  const toursData = await prisma.tour.findMany({
    where: {
      id: { in: ids },
      status: "ACTIVE",
    },
    include: {
      agent: {
        select: {
          businessName: true,
          isVerified: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
      _count: {
        select: {
          reviews: true,
          bookings: true,
        },
      },
    },
  })

  if (toursData.length < 2) {
    notFound()
  }

  // Calculate average rating for each tour and prepare data
  const tours = toursData.map((tour) => {
    const avgRating = tour.reviews.length > 0
      ? tour.reviews.reduce((sum, r) => sum + r.rating, 0) / tour.reviews.length
      : null

    return {
      ...tour,
      rating: avgRating,
      highlights: JSON.parse(tour.highlights || "[]") as string[],
      included: JSON.parse(tour.included || "[]") as string[],
      excluded: JSON.parse(tour.excluded || "[]") as string[],
      tourType: JSON.parse(tour.tourType || "[]") as string[],
    }
  })

  // Sort tours in the same order as the ids
  const sortedTours = ids
    .map((id) => tours.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => t !== undefined)

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <SectionError name="Tour Comparison Header">
      <div className="bg-gradient-to-br from-secondary via-secondary/95 to-primary/30 py-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-4 text-white/80 hover:text-white hover:bg-white/10">
            <Link href="/tours">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tours
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
              <GitCompare className="h-5 w-5 text-accent" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Compare Tours
            </h1>
          </div>
          <p className="text-white/70">
            Comparing {sortedTours.length} tours side by side
          </p>
        </div>
      </div>
      </SectionError>

      {/* Comparison Content */}
      <SectionError name="Tour Comparison Table">
      <div className="container mx-auto px-4 py-8">
        <ComparisonTable tours={sortedTours} />
      </div>
      </SectionError>
    </div>
  )
}
