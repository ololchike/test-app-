interface TourStructuredDataProps {
  tour: {
    id: string
    title: string
    description: string
    destination: string
    country: string
    basePrice: number
    durationDays: number
    images: string[]
    rating?: number
    reviewCount?: number
    agent: {
      businessName: string
    }
  }
  slug: string
}

export function TourStructuredData({ tour, slug }: TourStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.description.replace(/<[^>]*>/g, "").substring(0, 200),
    image: tour.images[0] || "",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/tours/${slug}`,
    touristType: "Tourist",
    itinerary: {
      "@type": "ItemList",
      numberOfItems: tour.durationDays,
    },
    offers: {
      "@type": "Offer",
      price: tour.basePrice,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString(),
    },
    provider: {
      "@type": "TravelAgency",
      name: tour.agent.businessName,
    },
    ...(tour.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: tour.rating,
        reviewCount: tour.reviewCount || 0,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
