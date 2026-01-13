import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import {
  MapPin,
  Star,
  Shield,
  Calendar,
  Award,
  Users,
  Phone,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import Image from "next/image"

interface Props {
  params: Promise<{ id: string }>
}

async function getOperator(id: string) {
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          avatar: true,
        },
      },
      tours: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          slug: true,
          title: true,
          coverImage: true,
          destination: true,
          country: true,
          basePrice: true,
          durationDays: true,
          durationNights: true,
          reviews: {
            select: { rating: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      _count: {
        select: {
          tours: true,
        },
      },
    },
  })

  if (!agent) return null

  // Calculate average rating from all tour reviews
  const allReviews = agent.tours.flatMap(tour => tour.reviews)
  const avgRating = allReviews.length > 0
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    : 0

  // Transform tours to include computed rating
  const toursWithRating = agent.tours.map(tour => {
    const tourRating = tour.reviews.length > 0
      ? tour.reviews.reduce((sum, r) => sum + r.rating, 0) / tour.reviews.length
      : 0
    return {
      id: tour.id,
      slug: tour.slug,
      title: tour.title,
      coverImage: tour.coverImage,
      destination: tour.destination,
      country: tour.country,
      basePrice: tour.basePrice,
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      rating: tourRating,
      reviewCount: tour.reviews.length,
    }
  })

  // Combine city and country for location display
  const location = [agent.city, agent.country].filter(Boolean).join(", ")

  return {
    id: agent.id,
    businessName: agent.businessName,
    description: agent.description,
    businessEmail: agent.businessEmail,
    businessPhone: agent.businessPhone,
    website: agent.website,
    location: location || null,
    yearsInBusiness: agent.yearsInBusiness,
    toursConducted: agent.toursConducted,
    isVerified: agent.isVerified,
    rating: avgRating,
    reviewCount: allReviews.length,
    tourCount: agent._count.tours,
    user: agent.user,
    tours: toursWithRating,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const operator = await getOperator(id)

  if (!operator) {
    return { title: "Operator Not Found" }
  }

  return {
    title: `${operator.businessName} | SafariPlus Tour Operator`,
    description: operator.description || `Book tours with ${operator.businessName} on SafariPlus`,
  }
}

export default async function OperatorProfilePage({ params }: Props) {
  const { id } = await params
  const operator = await getOperator(id)

  if (!operator) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="relative bg-linear-to-r from-secondary/10 via-primary/5 to-secondary/10 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow-xl">
                <AvatarImage src={operator.user?.avatar || ""} />
                <AvatarFallback className="text-4xl bg-linear-to-br from-primary to-secondary text-white font-bold">
                  {operator.businessName[0]}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{operator.businessName}</h1>
                  {operator.isVerified && (
                    <Badge className="bg-secondary/10 text-secondary border-0">
                      <Shield className="h-3.5 w-3.5 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                {operator.location && (
                  <p className="text-muted-foreground flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4" />
                    {operator.location}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{operator.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground text-sm">
                      ({operator.reviewCount} reviews)
                    </span>
                  </span>

                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    {operator.tourCount} tours
                  </span>

                  {operator.yearsInBusiness && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      {operator.yearsInBusiness} years
                    </span>
                  )}

                  {operator.toursConducted > 0 && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      {operator.toursConducted}+ tours conducted
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="lg:ml-auto flex gap-3">
              {operator.businessEmail && (
                <Button variant="outline" asChild>
                  <a href={`mailto:${operator.businessEmail}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </a>
                </Button>
              )}
              {operator.businessPhone && (
                <Button variant="outline" asChild>
                  <a href={`tel:${operator.businessPhone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - About & Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* About */}
            {operator.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {operator.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {operator.businessEmail && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${operator.businessEmail}`}
                      className="text-primary hover:underline"
                    >
                      {operator.businessEmail}
                    </a>
                  </div>
                )}
                {operator.businessPhone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${operator.businessPhone}`}
                      className="text-primary hover:underline"
                    >
                      {operator.businessPhone}
                    </a>
                  </div>
                )}
                {operator.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{operator.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tours */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Tours by {operator.businessName}</h2>
              {operator.tourCount > 6 && (
                <Button variant="outline" asChild>
                  <Link href={`/tours?operator=${operator.id}`}>View All Tours</Link>
                </Button>
              )}
            </div>

            {operator.tours.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No active tours available at the moment.
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {operator.tours.map((tour) => (
                  <Link key={tour.id} href={`/tours/${tour.slug}`}>
                    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={tour.coverImage || "/images/placeholder-tour.jpg"}
                          alt={tour.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white/90 text-foreground shadow-sm">
                            ${tour.basePrice.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {tour.title}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                          <MapPin className="h-3.5 w-3.5" />
                          {tour.destination}, {tour.country}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {tour.durationDays} days / {tour.durationNights} nights
                          </span>
                          {tour.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {tour.rating.toFixed(1)}
                              <span className="text-muted-foreground">
                                ({tour.reviewCount})
                              </span>
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
