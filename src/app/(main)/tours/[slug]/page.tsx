import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { TourDetailContent } from "@/components/tours/tour-detail-content"
import { prisma } from "@/lib/prisma"

async function getTour(slug: string) {
  const tour = await prisma.tour.findUnique({
    where: { slug },
    include: {
      agent: {
        select: {
          id: true,
          businessName: true,
          description: true,
          isVerified: true,
          yearsInBusiness: true,
          toursConducted: true,
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
      itinerary: {
        orderBy: { dayNumber: "asc" },
      },
      accommodationOptions: {
        orderBy: { pricePerNight: "asc" },
      },
      activityAddons: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  })

  if (!tour || tour.status !== "ACTIVE") {
    return null
  }

  // Calculate average rating
  const avgRating = tour.reviews.length > 0
    ? tour.reviews.reduce((sum, r) => sum + r.rating, 0) / tour.reviews.length
    : 0

  // Transform JSON strings to arrays
  return {
    ...tour,
    highlights: JSON.parse(tour.highlights || "[]"),
    included: JSON.parse(tour.included || "[]"),
    excluded: JSON.parse(tour.excluded || "[]"),
    images: JSON.parse(tour.images || "[]"),
    tourType: JSON.parse(tour.tourType || "[]"),
    bestSeason: JSON.parse(tour.bestSeason || "[]"),
    itinerary: tour.itinerary.map((day) => ({
      ...day,
      meals: JSON.parse(day.meals || "[]"),
      activities: JSON.parse(day.activities || "[]"),
      availableAccommodationIds: JSON.parse(day.availableAccommodationIds || "[]"),
      availableAddonIds: JSON.parse(day.availableAddonIds || "[]"),
    })),
    accommodationOptions: tour.accommodationOptions.map((acc) => ({
      ...acc,
      images: JSON.parse(acc.images || "[]"),
      amenities: JSON.parse(acc.amenities || "[]"),
    })),
    activityAddons: tour.activityAddons.map((addon) => ({
      ...addon,
      images: JSON.parse(addon.images || "[]"),
      dayAvailable: JSON.parse(addon.dayAvailable || "[]"),
    })),
    reviews: tour.reviews.map((review) => ({
      ...review,
      images: JSON.parse(review.images || "[]"),
      date: review.createdAt.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    })),
    // Extend agent with calculated fields
    agent: {
      ...tour.agent,
      rating: Math.round(avgRating * 10) / 10, // Use tour rating for now
      reviewCount: tour._count.reviews,
    },
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: tour._count.reviews,
  }
}

// Fallback mock data for when database is empty (development)
const mockTour = {
  id: "1",
  slug: "masai-mara-safari-adventure",
  title: "7-Day Masai Mara Safari Adventure",
  subtitle: "Experience the magic of the African savannah",
  description: `Embark on an unforgettable 7-day journey through Kenya's most iconic wildlife sanctuary. The Masai Mara National Reserve offers unparalleled opportunities to witness the Big Five and experience the annual Great Migration.

Our expert guides will take you on daily game drives, where you'll have the chance to see lions, elephants, leopards, rhinos, and buffalo in their natural habitat. Stay in carefully selected lodges and camps that offer comfort without compromising the authentic safari experience.

This tour is perfect for wildlife enthusiasts, photographers, and anyone seeking an authentic African adventure. Each day brings new discoveries, from sunrise balloon rides over the savannah to cultural visits with the Maasai people.`,
  destination: "Masai Mara",
  country: "Kenya",
  region: "East Africa",
  startLocation: "Nairobi",
  endLocation: "Nairobi",
  durationDays: 7,
  durationNights: 6,
  basePrice: 2499,
  currency: "USD",
  minGroupSize: 2,
  maxGroupSize: 12,
  difficulty: "Easy",
  bestSeason: ["Jul", "Aug", "Sep", "Oct"],
  coverImage: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=1200",
  images: [
    "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=800",
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800",
    "https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=800",
    "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=800",
  ],
  tourType: ["Safari", "Wildlife", "Photography"],
  featured: true,
  rating: 4.9,
  reviewCount: 128,
  highlights: [
    "Witness the Great Migration (seasonal)",
    "Daily game drives with expert guides",
    "Visit a traditional Maasai village",
    "Optional hot air balloon safari",
    "Comfortable lodge accommodation",
    "All meals included during safari",
  ],
  included: [
    "Airport transfers",
    "All park entrance fees",
    "Professional English-speaking guide",
    "Game drives in 4x4 safari vehicle",
    "Full board accommodation",
    "Bottled water during game drives",
    "Flying Doctors emergency evacuation cover",
  ],
  excluded: [
    "International flights",
    "Travel insurance",
    "Tips and gratuities",
    "Personal expenses",
    "Optional activities (balloon safari, etc.)",
    "Visa fees",
  ],
  itinerary: [
    {
      id: "day-1",
      dayNumber: 1,
      title: "Arrival in Nairobi",
      description: "Arrive at Jomo Kenyatta International Airport where you'll be met by our representative. Transfer to your hotel in Nairobi for an overnight stay. Enjoy a welcome dinner and briefing about your upcoming safari adventure.",
      location: "Nairobi",
      meals: ["Dinner"],
      activities: ["Airport pickup", "Hotel check-in", "Welcome dinner"],
      overnight: "Nairobi Serena Hotel",
      availableAccommodationIds: ["budget", "midrange", "luxury"],
      defaultAccommodationId: "midrange",
      availableAddonIds: [],
    },
    {
      id: "day-2",
      dayNumber: 2,
      title: "Nairobi to Masai Mara",
      description: "After breakfast, depart for the Masai Mara National Reserve. The scenic drive takes you through the Great Rift Valley with stops at viewpoints. Arrive at your camp in time for lunch, followed by an afternoon game drive.",
      location: "Masai Mara",
      meals: ["Breakfast", "Lunch", "Dinner"],
      activities: ["Scenic drive", "Rift Valley viewpoint", "Afternoon game drive"],
      overnight: "Mara Serena Safari Lodge",
      availableAccommodationIds: ["budget", "midrange", "luxury"],
      defaultAccommodationId: "midrange",
      availableAddonIds: [],
    },
    {
      id: "day-3",
      dayNumber: 3,
      title: "Full Day Masai Mara",
      description: "Enjoy a full day of game drives in the reserve, searching for the Big Five and other wildlife. You can opt for a sunrise hot air balloon safari (additional cost). Visit the Mara River, famous for wildebeest crossings during migration season.",
      location: "Masai Mara",
      meals: ["Breakfast", "Lunch", "Dinner"],
      activities: ["Morning game drive", "Big Five search", "Mara River visit"],
      overnight: "Mara Serena Safari Lodge",
      availableAccommodationIds: ["budget", "midrange", "luxury"],
      defaultAccommodationId: "midrange",
      availableAddonIds: ["balloon"],
    },
    {
      id: "day-4",
      dayNumber: 4,
      title: "Masai Mara Exploration",
      description: "Another exciting day in the Mara with morning and afternoon game drives. Visit a traditional Maasai village to learn about their culture, traditions, and way of life. Evening sundowner with views of the savannah.",
      location: "Masai Mara",
      meals: ["Breakfast", "Lunch", "Dinner"],
      activities: ["Morning game drive", "Afternoon game drive", "Evening sundowner"],
      overnight: "Mara Serena Safari Lodge",
      availableAccommodationIds: ["budget", "midrange", "luxury"],
      defaultAccommodationId: "midrange",
      availableAddonIds: ["maasai", "photo"],
    },
    {
      id: "day-5",
      dayNumber: 5,
      title: "Masai Mara to Lake Naivasha",
      description: "Depart the Mara after breakfast and drive to Lake Naivasha. Afternoon boat ride on the lake to see hippos, fish eagles, and other bird species. Optional visit to Crescent Island for a walking safari.",
      location: "Lake Naivasha",
      meals: ["Breakfast", "Lunch", "Dinner"],
      activities: ["Scenic drive", "Boat ride", "Bird watching"],
      overnight: "Lake Naivasha Sopa Resort",
      availableAccommodationIds: ["budget", "midrange"],
      defaultAccommodationId: "midrange",
      availableAddonIds: [],
    },
    {
      id: "day-6",
      dayNumber: 6,
      title: "Lake Naivasha to Nairobi",
      description: "Morning visit to Hell's Gate National Park where you can cycle or walk among wildlife. After lunch, drive back to Nairobi with a stop at the Great Rift Valley viewpoint. Farewell dinner in Nairobi.",
      location: "Nairobi",
      meals: ["Breakfast", "Lunch", "Dinner"],
      activities: ["Hell's Gate visit", "Cycling", "Farewell dinner"],
      overnight: "Nairobi Serena Hotel",
      availableAccommodationIds: ["budget", "midrange", "luxury"],
      defaultAccommodationId: "midrange",
      availableAddonIds: [],
    },
    {
      id: "day-7",
      dayNumber: 7,
      title: "Departure",
      description: "After breakfast, enjoy some free time for last-minute shopping or optional activities. Transfer to the airport for your departure flight. End of safari.",
      location: "Nairobi",
      meals: ["Breakfast"],
      activities: ["Free time", "Airport transfer"],
      overnight: null,
      availableAccommodationIds: [],
      defaultAccommodationId: null,
      availableAddonIds: [],
    },
  ],
  accommodationOptions: [
    {
      id: "budget",
      tier: "Budget",
      name: "Mara Explorer Camp",
      description: "Comfortable tented camps with shared facilities",
      pricePerNight: 150,
      images: [],
      amenities: ["Shared bathroom", "Hot water", "Restaurant", "Campfire"],
      location: "Masai Mara",
      rating: 4.2,
    },
    {
      id: "midrange",
      tier: "Mid-Range",
      name: "Mara Serena Safari Lodge",
      description: "Well-appointed rooms with private facilities and pool",
      pricePerNight: 280,
      images: [],
      amenities: ["Private bathroom", "Pool", "Restaurant", "Bar", "WiFi"],
      location: "Masai Mara",
      rating: 4.6,
    },
    {
      id: "luxury",
      tier: "Luxury",
      name: "Angama Mara",
      description: "Exclusive luxury tents with panoramic views",
      pricePerNight: 650,
      images: [],
      amenities: ["Private deck", "Butler service", "Spa", "Fine dining", "Premium drinks"],
      location: "Masai Mara",
      rating: 4.9,
    },
  ],
  activityAddons: [
    {
      id: "balloon",
      name: "Hot Air Balloon Safari",
      description: "Sunrise flight over the Mara with champagne breakfast",
      price: 450,
      duration: "4 hours",
      images: [],
      dayAvailable: [3],
    },
    {
      id: "maasai",
      name: "Extended Maasai Village Visit",
      description: "Immersive half-day cultural experience",
      price: 75,
      duration: "Half day",
      images: [],
      dayAvailable: [4],
    },
    {
      id: "photo",
      name: "Private Photography Guide",
      description: "Expert wildlife photographer as your personal guide",
      price: 200,
      duration: "Full day",
      images: [],
      dayAvailable: [3, 4],
    },
  ],
  agent: {
    id: "1",
    businessName: "Safari Adventures Kenya",
    description: "Award-winning safari operator with 15+ years of experience",
    logo: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=100",
    rating: 4.9,
    reviewCount: 324,
    isVerified: true,
    toursConducted: 1250,
    yearsInBusiness: 15,
  },
  reviews: [
    {
      id: "1",
      user: { name: "Sarah Johnson", avatar: null },
      rating: 5,
      title: "Trip of a lifetime!",
      content: "This safari exceeded all our expectations. The guides were incredibly knowledgeable and patient. We saw all of the Big Five and countless other animals. The lodges were comfortable and the food was excellent.",
      date: "December 2024",
    },
    {
      id: "2",
      user: { name: "Michael Chen", avatar: null },
      rating: 5,
      title: "Unforgettable experience",
      content: "From start to finish, everything was perfectly organized. Our guide James was exceptional - his knowledge of wildlife and ability to spot animals was amazing. Highly recommend the balloon safari!",
      date: "November 2024",
    },
    {
      id: "3",
      user: { name: "Emma Williams", avatar: null },
      rating: 4,
      title: "Great safari, minor hiccups",
      content: "Overall an amazing experience. The game drives were incredible and we saw so much wildlife. Only reason for 4 stars was a small mix-up with our accommodation, but the team resolved it quickly.",
      date: "October 2024",
    },
  ],
}

interface TourDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { slug } = await params

  // Fetch tour from database, fallback to mock for development if empty
  let tour = await getTour(slug)

  // Use mock data as fallback during development if no tour found
  if (!tour && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tour = slug === "masai-mara-safari-adventure" ? (mockTour as any) : null
  }

  if (!tour) {
    notFound()
  }

  return (
    <div className="pt-16">
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/tours" className="hover:text-foreground">
              Tours
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/destinations/${tour.country.toLowerCase()}`} className="hover:text-foreground">
              {tour.country}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate">{tour.title}</span>
          </nav>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-4 gap-4 h-[400px] lg:h-[500px]">
          <div className="col-span-4 lg:col-span-2 relative rounded-xl overflow-hidden">
            <Image
              src={tour.images[0]}
              alt={tour.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="hidden lg:grid col-span-2 grid-cols-2 gap-4">
            {tour.images.slice(1, 5).map((image: string, index: number) => (
              <div key={index} className="relative rounded-xl overflow-hidden">
                <Image
                  src={image}
                  alt={`${tour.title} ${index + 2}`}
                  fill
                  className="object-cover"
                />
                {index === 3 && tour.images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      +{tour.images.length - 5} photos
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Client Component for Interactivity */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <TourDetailContent tour={tour as any} />
    </div>
  )
}
