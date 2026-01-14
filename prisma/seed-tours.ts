import { PrismaClient, AccommodationTier, DifficultyLevel } from "@prisma/client"

const prisma = new PrismaClient()

// Tour templates for various East African destinations
const tourTemplates = [
  {
    slug: "gorilla-trekking-uganda",
    title: "3-Day Gorilla Trekking Adventure",
    subtitle: "Face-to-face with mountain gorillas",
    destination: "Bwindi",
    country: "Uganda",
    durationDays: 3,
    durationNights: 2,
    basePrice: 1899,
    tourType: ["GORILLA_TREKKING", "WILDLIFE", "ADVENTURE"],
    difficulty: "MODERATE",
    bestSeason: ["Jun", "Jul", "Aug", "Sep", "Dec", "Jan", "Feb"],
    coverImage: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?q=80&w=1200",
    description: "An incredible 3-day journey to encounter endangered mountain gorillas in their natural habitat in Bwindi Impenetrable Forest.",
    highlights: ["Gorilla trekking permit included", "Professional guides", "Forest hiking", "Community visits"],
    included: ["Gorilla permit", "Accommodation", "Meals", "Transport", "Guide"],
    excluded: ["Flights", "Visa", "Tips", "Personal items"],
  },
  {
    slug: "amboseli-kilimanjaro-views",
    title: "4-Day Amboseli Safari",
    subtitle: "Elephants against Mt. Kilimanjaro",
    destination: "Amboseli",
    country: "Kenya",
    durationDays: 4,
    durationNights: 3,
    basePrice: 1299,
    tourType: ["SAFARI", "WILDLIFE", "PHOTOGRAPHY"],
    difficulty: "EASY",
    bestSeason: ["Jun", "Jul", "Aug", "Sep", "Oct"],
    coverImage: "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?q=80&w=1200",
    description: "Experience the iconic views of elephants roaming against the backdrop of snow-capped Mt. Kilimanjaro.",
    highlights: ["Elephant herds", "Mt. Kilimanjaro views", "Big Five", "Maasai culture"],
    included: ["Park fees", "Accommodation", "Meals", "Game drives", "Guide"],
    excluded: ["Flights", "Insurance", "Tips", "Drinks"],
  },
  {
    slug: "zanzibar-beach-escape",
    title: "5-Day Zanzibar Beach Paradise",
    subtitle: "Tropical island relaxation",
    destination: "Zanzibar",
    country: "Tanzania",
    durationDays: 5,
    durationNights: 4,
    basePrice: 999,
    tourType: ["BEACH", "CULTURAL", "RELAXATION"],
    difficulty: "EASY",
    bestSeason: ["Jun", "Jul", "Aug", "Sep", "Dec", "Jan", "Feb"],
    coverImage: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?q=80&w=1200",
    description: "Unwind on pristine beaches, explore Stone Town, and experience the spice island culture.",
    highlights: ["White sand beaches", "Stone Town UNESCO site", "Spice tour", "Snorkeling"],
    included: ["Accommodation", "Breakfast", "Transfers", "Stone Town tour", "Spice tour"],
    excluded: ["Flights", "Lunch/Dinner", "Activities", "Tips"],
  },
  {
    slug: "ngorongoro-crater-safari",
    title: "2-Day Ngorongoro Crater Safari",
    subtitle: "Africa's Garden of Eden",
    destination: "Ngorongoro",
    country: "Tanzania",
    durationDays: 2,
    durationNights: 1,
    basePrice: 799,
    tourType: ["SAFARI", "WILDLIFE"],
    difficulty: "EASY",
    bestSeason: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    coverImage: "https://images.unsplash.com/photo-1534476391-27e1b1b8e2e6?q=80&w=1200",
    description: "Descend into the world's largest intact volcanic caldera, home to the densest concentration of wildlife in Africa.",
    highlights: ["Crater floor game drive", "Big Five", "Flamingos at lake", "Maasai boma visit"],
    included: ["Park fees", "Crater fees", "Accommodation", "Meals", "Game drive"],
    excluded: ["Flights", "Tips", "Personal items"],
  },
  {
    slug: "lake-nakuru-flamingos",
    title: "3-Day Lake Nakuru Safari",
    subtitle: "Pink flamingos and rhinos",
    destination: "Lake Nakuru",
    country: "Kenya",
    durationDays: 3,
    durationNights: 2,
    basePrice: 899,
    tourType: ["SAFARI", "WILDLIFE", "BIRD_WATCHING"],
    difficulty: "EASY",
    bestSeason: ["Jan", "Feb", "Mar", "Jun", "Jul", "Aug", "Sep"],
    coverImage: "https://images.unsplash.com/photo-1552862750-746b8f6f7f25?q=80&w=1200",
    description: "Witness the spectacular sight of thousands of flamingos and endangered rhinos in Lake Nakuru National Park.",
    highlights: ["Flamingo colonies", "Black and white rhinos", "Lion prides", "Baboon cliffs"],
    included: ["Park fees", "Accommodation", "Meals", "Game drives", "Guide"],
    excluded: ["Flights", "Tips", "Personal items"],
  },
  {
    slug: "rwanda-gorilla-golden-monkey",
    title: "5-Day Rwanda Primates Safari",
    subtitle: "Gorillas and golden monkeys",
    destination: "Volcanoes National Park",
    country: "Rwanda",
    durationDays: 5,
    durationNights: 4,
    basePrice: 2999,
    tourType: ["GORILLA_TREKKING", "WILDLIFE", "ADVENTURE"],
    difficulty: "MODERATE",
    bestSeason: ["Jun", "Jul", "Aug", "Sep", "Dec", "Jan", "Feb"],
    coverImage: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=1200",
    description: "Experience the best of Rwanda with gorilla trekking, golden monkey tracking, and cultural immersion.",
    highlights: ["Gorilla trekking", "Golden monkey tracking", "Kigali city tour", "Genocide memorial"],
    included: ["Gorilla permit", "Golden monkey permit", "Accommodation", "Meals", "Guide"],
    excluded: ["Flights", "Visa", "Tips", "Personal items"],
  },
  {
    slug: "tarangire-elephants",
    title: "3-Day Tarangire Safari",
    subtitle: "Land of the giants",
    destination: "Tarangire",
    country: "Tanzania",
    durationDays: 3,
    durationNights: 2,
    basePrice: 1099,
    tourType: ["SAFARI", "WILDLIFE"],
    difficulty: "EASY",
    bestSeason: ["Jun", "Jul", "Aug", "Sep", "Oct"],
    coverImage: "https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=1200",
    description: "Explore Tarangire National Park, famous for its large elephant herds and iconic baobab trees.",
    highlights: ["Large elephant herds", "Baobab trees", "Tree-climbing lions", "Bird watching"],
    included: ["Park fees", "Accommodation", "Meals", "Game drives", "Guide"],
    excluded: ["Flights", "Tips", "Drinks"],
  },
  {
    slug: "kenya-cultural-experience",
    title: "6-Day Kenya Cultural Safari",
    subtitle: "Tribes, wildlife, and traditions",
    destination: "Multiple",
    country: "Kenya",
    durationDays: 6,
    durationNights: 5,
    basePrice: 1799,
    tourType: ["CULTURAL", "SAFARI", "WILDLIFE"],
    difficulty: "EASY",
    bestSeason: ["Jan", "Feb", "Jun", "Jul", "Aug", "Sep"],
    coverImage: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?q=80&w=1200",
    description: "Immerse yourself in Kenya's rich cultural heritage while enjoying wildlife safaris.",
    highlights: ["Maasai village stay", "Samburu tribe visit", "Game drives", "Traditional dances"],
    included: ["Accommodation", "Meals", "Cultural visits", "Game drives", "Guide"],
    excluded: ["Flights", "Tips", "Souvenirs"],
  },
  {
    slug: "mount-kenya-trekking",
    title: "5-Day Mount Kenya Trek",
    subtitle: "Africa's second highest peak",
    destination: "Mount Kenya",
    country: "Kenya",
    durationDays: 5,
    durationNights: 4,
    basePrice: 1499,
    tourType: ["TREKKING", "ADVENTURE", "MOUNTAIN"],
    difficulty: "CHALLENGING",
    bestSeason: ["Jan", "Feb", "Jul", "Aug", "Sep"],
    coverImage: "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?q=80&w=1200",
    description: "Conquer Point Lenana on Mount Kenya via the scenic Sirimon route.",
    highlights: ["Summit Point Lenana", "Alpine scenery", "Unique flora", "Mountain wildlife"],
    included: ["Park fees", "Guides", "Porters", "Accommodation", "Meals"],
    excluded: ["Flights", "Equipment", "Tips", "Insurance"],
  },
  {
    slug: "lake-victoria-fishing",
    title: "4-Day Lake Victoria Adventure",
    subtitle: "Africa's largest lake",
    destination: "Lake Victoria",
    country: "Kenya",
    durationDays: 4,
    durationNights: 3,
    basePrice: 899,
    tourType: ["ADVENTURE", "CULTURAL", "FISHING"],
    difficulty: "EASY",
    bestSeason: ["All Year"],
    coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200",
    description: "Experience life around Africa's largest freshwater lake with fishing, island hopping, and local culture.",
    highlights: ["Sport fishing", "Island hopping", "Bird watching", "Local fishing villages"],
    included: ["Accommodation", "Meals", "Boat tours", "Fishing equipment", "Guide"],
    excluded: ["Flights", "Tips", "Personal items"],
  },
  {
    slug: "samburu-special-five",
    title: "4-Day Samburu Special Safari",
    subtitle: "Unique wildlife experience",
    destination: "Samburu",
    country: "Kenya",
    durationDays: 4,
    durationNights: 3,
    basePrice: 1399,
    tourType: ["SAFARI", "WILDLIFE"],
    difficulty: "EASY",
    bestSeason: ["Jun", "Jul", "Aug", "Sep", "Oct"],
    coverImage: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=1200",
    description: "Discover the Samburu Special Five - Grevy's zebra, Somali ostrich, reticulated giraffe, gerenuk, and beisa oryx.",
    highlights: ["Samburu Special Five", "Ewaso Nyiro River", "Samburu culture", "Scenic landscapes"],
    included: ["Park fees", "Accommodation", "Meals", "Game drives", "Guide"],
    excluded: ["Flights", "Tips", "Drinks"],
  },
  {
    slug: "murchison-falls-uganda",
    title: "4-Day Murchison Falls Safari",
    subtitle: "The most powerful waterfall",
    destination: "Murchison Falls",
    country: "Uganda",
    durationDays: 4,
    durationNights: 3,
    basePrice: 1199,
    tourType: ["SAFARI", "WILDLIFE", "ADVENTURE"],
    difficulty: "EASY",
    bestSeason: ["Jun", "Jul", "Aug", "Sep", "Dec", "Jan", "Feb"],
    coverImage: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200",
    description: "Experience Uganda's largest national park with game drives, boat safaris, and the thundering Murchison Falls.",
    highlights: ["Murchison Falls hike", "Nile boat safari", "Game drives", "Chimpanzee tracking"],
    included: ["Park fees", "Accommodation", "Meals", "Activities", "Guide"],
    excluded: ["Flights", "Tips", "Chimp permit"],
  },
  {
    slug: "queen-elizabeth-safari",
    title: "3-Day Queen Elizabeth Safari",
    subtitle: "Tree-climbing lions",
    destination: "Queen Elizabeth",
    country: "Uganda",
    durationDays: 3,
    durationNights: 2,
    basePrice: 999,
    tourType: ["SAFARI", "WILDLIFE", "BIRD_WATCHING"],
    difficulty: "EASY",
    bestSeason: ["Jun", "Jul", "Aug", "Sep", "Dec", "Jan", "Feb"],
    coverImage: "https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=1200",
    description: "Explore Queen Elizabeth National Park, home to tree-climbing lions and the Kazinga Channel.",
    highlights: ["Tree-climbing lions", "Kazinga Channel cruise", "Bird watching", "Crater lakes"],
    included: ["Park fees", "Accommodation", "Meals", "Activities", "Guide"],
    excluded: ["Flights", "Tips", "Drinks"],
  },
  {
    slug: "kilimanjaro-machame-route",
    title: "7-Day Kilimanjaro Machame Route",
    subtitle: "Roof of Africa",
    destination: "Mount Kilimanjaro",
    country: "Tanzania",
    durationDays: 7,
    durationNights: 6,
    basePrice: 2499,
    tourType: ["TREKKING", "ADVENTURE", "MOUNTAIN"],
    difficulty: "CHALLENGING",
    bestSeason: ["Jan", "Feb", "Jun", "Jul", "Aug", "Sep"],
    coverImage: "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?q=80&w=1200",
    description: "Summit Africa's highest peak via the scenic Machame Route, also known as the Whiskey Route.",
    highlights: ["Uhuru Peak summit", "Five climate zones", "Stunning views", "Professional crew"],
    included: ["Park fees", "Guides", "Porters", "Camping gear", "Meals"],
    excluded: ["Flights", "Tips", "Personal gear", "Insurance"],
  },
  {
    slug: "diani-beach-getaway",
    title: "5-Day Diani Beach Retreat",
    subtitle: "Kenya's best beach",
    destination: "Diani Beach",
    country: "Kenya",
    durationDays: 5,
    durationNights: 4,
    basePrice: 799,
    tourType: ["BEACH", "RELAXATION", "WATER_SPORTS"],
    difficulty: "EASY",
    bestSeason: ["Jan", "Feb", "Jun", "Jul", "Aug", "Sep", "Oct"],
    coverImage: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?q=80&w=1200",
    description: "Relax on the white sands of Diani Beach, enjoy water sports, and explore nearby marine parks.",
    highlights: ["White sand beaches", "Snorkeling", "Diving", "Kite surfing", "Dolphin watching"],
    included: ["Accommodation", "Breakfast", "Airport transfers"],
    excluded: ["Flights", "Activities", "Meals", "Tips"],
  },
]

async function main() {
  console.log("🌱 Starting tours seed...")

  // Find the agent to assign tours to
  const agent = await prisma.agent.findFirst({
    where: { status: "ACTIVE" },
  })

  if (!agent) {
    console.log("❌ No active agent found. Please run the main seed first.")
    return
  }

  console.log(`📋 Found agent: ${agent.businessName}`)

  for (const template of tourTemplates) {
    // Check if tour already exists
    const existing = await prisma.tour.findUnique({
      where: { slug: template.slug },
    })

    if (existing) {
      console.log(`⏭️  Skipping existing tour: ${template.title}`)
      continue
    }

    // Create the tour
    const tour = await prisma.tour.create({
      data: {
        agentId: agent.id,
        slug: template.slug,
        title: template.title,
        subtitle: template.subtitle,
        description: template.description,
        highlights: JSON.stringify(template.highlights),
        included: JSON.stringify(template.included),
        excluded: JSON.stringify(template.excluded),
        destination: template.destination,
        country: template.country,
        region: "East Africa",
        startLocation: template.country === "Kenya" ? "Nairobi" : template.country === "Tanzania" ? "Arusha" : template.country === "Uganda" ? "Kampala" : "Kigali",
        endLocation: template.country === "Kenya" ? "Nairobi" : template.country === "Tanzania" ? "Arusha" : template.country === "Uganda" ? "Kampala" : "Kigali",
        durationDays: template.durationDays,
        durationNights: template.durationNights,
        basePrice: template.basePrice,
        currency: "USD",
        minGroupSize: 2,
        maxGroupSize: 12,
        coverImage: template.coverImage,
        images: JSON.stringify([template.coverImage]),
        tourType: JSON.stringify(template.tourType),
        difficulty: template.difficulty as DifficultyLevel,
        bestSeason: JSON.stringify(template.bestSeason),
        status: "ACTIVE",
        featured: Math.random() > 0.7, // 30% chance of being featured
      },
    })

    // Create accommodation options
    const accommodations = [
      {
        tourId: tour.id,
        name: `${template.destination} Budget Camp`,
        tier: AccommodationTier.BUDGET,
        description: "Comfortable budget accommodation",
        pricePerNight: Math.round(template.basePrice * 0.05),
        amenities: JSON.stringify(["Shared facilities", "Hot water", "Restaurant"]),
      },
      {
        tourId: tour.id,
        name: `${template.destination} Comfort Lodge`,
        tier: AccommodationTier.MID_RANGE,
        description: "Mid-range lodge with modern amenities",
        pricePerNight: Math.round(template.basePrice * 0.1),
        amenities: JSON.stringify(["Private bathroom", "WiFi", "Pool", "Restaurant"]),
      },
      {
        tourId: tour.id,
        name: `${template.destination} Luxury Resort`,
        tier: AccommodationTier.LUXURY,
        description: "Premium luxury accommodation",
        pricePerNight: Math.round(template.basePrice * 0.2),
        amenities: JSON.stringify(["Butler service", "Spa", "Fine dining", "Private deck"]),
      },
    ]

    for (const acc of accommodations) {
      await prisma.accommodationOption.create({ data: acc })
    }

    // Create basic itinerary
    for (let day = 1; day <= template.durationDays; day++) {
      await prisma.itinerary.create({
        data: {
          tourId: tour.id,
          dayNumber: day,
          title: day === 1 ? "Arrival Day" : day === template.durationDays ? "Departure Day" : `Day ${day} - ${template.destination} Exploration`,
          description: day === 1
            ? `Arrive and transfer to your accommodation in ${template.destination}.`
            : day === template.durationDays
            ? `After breakfast, transfer to the airport for your departure.`
            : `Full day of activities in ${template.destination} with expert guides.`,
          meals: JSON.stringify(day === 1 ? ["Dinner"] : day === template.durationDays ? ["Breakfast"] : ["Breakfast", "Lunch", "Dinner"]),
          overnight: day === template.durationDays ? null : `${template.destination} Lodge`,
        },
      })
    }

    console.log(`✅ Created tour: ${template.title}`)
  }

  console.log("\n🎉 Tours seed completed!")
  console.log(`📊 Total tours in database: ${await prisma.tour.count()}`)
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
