import { PrismaClient, AccommodationTier } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Hash passwords
  const clientPassword = await bcrypt.hash("Client123!", 12)
  const agentPassword = await bcrypt.hash("Agent123!", 12)
  const adminPassword = await bcrypt.hash("Admin123!", 12)

  // Create Client User
  const clientUser = await prisma.user.upsert({
    where: { email: "client@safariplus.com" },
    update: {},
    create: {
      email: "client@safariplus.com",
      name: "Sarah Thompson",
      firstName: "Sarah",
      lastName: "Thompson",
      password: clientPassword,
      role: "CLIENT",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  })
  console.log("✅ Created client user:", clientUser.email)

  // Create Agent User with Agent Profile
  const agentUser = await prisma.user.upsert({
    where: { email: "agent@safariplus.com" },
    update: {},
    create: {
      email: "agent@safariplus.com",
      name: "James Kamau",
      firstName: "James",
      lastName: "Kamau",
      password: agentPassword,
      role: "AGENT",
      status: "ACTIVE",
      emailVerified: new Date(),
      agent: {
        create: {
          businessName: "Safari Adventures Kenya",
          businessEmail: "info@safariadventures.co.ke",
          businessPhone: "+254 712 345 678",
          description:
            "Award-winning safari operator with over 15 years of experience in East Africa. We specialize in authentic wildlife safaris, gorilla trekking, and cultural experiences across Kenya, Tanzania, Uganda, and Rwanda.",
          website: "https://safariadventures.co.ke",
          address: "Kimathi Street, Nairobi",
          city: "Nairobi",
          country: "Kenya",
          licenseNumber: "KWS/TL/2024/001",
          katoMember: true,
          tatoMember: false,
          autoMember: false,
          isVerified: true,
          verifiedAt: new Date(),
          yearsInBusiness: 15,
          toursConducted: 1250,
          commissionRate: 12.0,
          status: "ACTIVE",
          bankDetails: {
            create: {
              mpesaNumber: "+254 712 345 678",
              mpesaName: "Safari Adventures Kenya",
              preferredMethod: "MPESA",
            },
          },
        },
      },
    },
  })
  console.log("✅ Created agent user:", agentUser.email)

  // Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@safariplus.com" },
    update: {},
    create: {
      email: "admin@safariplus.com",
      name: "Admin User",
      firstName: "Admin",
      lastName: "User",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  })
  console.log("✅ Created admin user:", adminUser.email)

  // Get the agent profile to create sample tours
  const agent = await prisma.agent.findUnique({
    where: { userId: agentUser.id },
  })

  if (agent) {
    // Create sample tours
    const tour1 = await prisma.tour.upsert({
      where: { slug: "masai-mara-safari-adventure" },
      update: {},
      create: {
        agentId: agent.id,
        slug: "masai-mara-safari-adventure",
        title: "7-Day Masai Mara Safari Adventure",
        subtitle: "Experience the magic of the African savannah",
        description: `Embark on an unforgettable 7-day journey through Kenya's most iconic wildlife sanctuary. The Masai Mara National Reserve offers unparalleled opportunities to witness the Big Five and experience the annual Great Migration.

Our expert guides will take you on daily game drives, where you'll have the chance to see lions, elephants, leopards, rhinos, and buffalo in their natural habitat. Stay in carefully selected lodges and camps that offer comfort without compromising the authentic safari experience.

This tour is perfect for wildlife enthusiasts, photographers, and anyone seeking an authentic African adventure.`,
        highlights: JSON.stringify([
          "Witness the Great Migration (seasonal)",
          "Daily game drives with expert guides",
          "Visit a traditional Maasai village",
          "Optional hot air balloon safari",
          "Comfortable lodge accommodation",
          "All meals included during safari",
        ]),
        included: JSON.stringify([
          "Airport transfers",
          "All park entrance fees",
          "Professional English-speaking guide",
          "Game drives in 4x4 safari vehicle",
          "Full board accommodation",
          "Bottled water during game drives",
        ]),
        excluded: JSON.stringify([
          "International flights",
          "Travel insurance",
          "Tips and gratuities",
          "Personal expenses",
          "Optional activities",
          "Visa fees",
        ]),
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
        coverImage:
          "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=1200",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=800",
          "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800",
          "https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=800",
        ]),
        tourType: JSON.stringify(["SAFARI", "WILDLIFE", "PHOTOGRAPHY"]),
        difficulty: "EASY",
        bestSeason: JSON.stringify(["Jul", "Aug", "Sep", "Oct"]),
        status: "ACTIVE",
        featured: true,
      },
    })
    console.log("✅ Created tour:", tour1.title)

    // Create accommodation options for the tour
    const accommodationData = [
      {
        tourId: tour1.id,
        name: "Mara Explorer Camp",
        tier: AccommodationTier.BUDGET,
        description: "Comfortable tented camps with shared facilities",
        pricePerNight: 150,
        amenities: JSON.stringify(["Shared bathroom", "Hot water", "Restaurant", "Campfire"]),
      },
      {
        tourId: tour1.id,
        name: "Mara Serena Safari Lodge",
        tier: AccommodationTier.MID_RANGE,
        description: "Well-appointed rooms with private facilities and pool",
        pricePerNight: 280,
        amenities: JSON.stringify(["Private bathroom", "Pool", "Restaurant", "Bar", "WiFi"]),
      },
      {
        tourId: tour1.id,
        name: "Angama Mara",
        tier: AccommodationTier.LUXURY,
        description: "Exclusive luxury tents with panoramic views",
        pricePerNight: 650,
        amenities: JSON.stringify([
          "Private deck",
          "Butler service",
          "Spa",
          "Fine dining",
          "Premium drinks",
        ]),
      },
    ]
    for (const acc of accommodationData) {
      await prisma.accommodationOption.create({ data: acc })
    }
    console.log("✅ Created accommodation options")

    // Create activity add-ons
    const activityData = [
      {
        tourId: tour1.id,
        name: "Hot Air Balloon Safari",
        description: "Sunrise flight over the Mara with champagne breakfast",
        price: 450,
        duration: "4 hours",
      },
      {
        tourId: tour1.id,
        name: "Extended Maasai Village Visit",
        description: "Immersive half-day cultural experience",
        price: 75,
        duration: "Half day",
      },
      {
        tourId: tour1.id,
        name: "Private Photography Guide",
        description: "Expert wildlife photographer as your personal guide",
        price: 200,
        duration: "Full day",
      },
    ]
    for (const act of activityData) {
      await prisma.activityAddon.create({ data: act })
    }
    console.log("✅ Created activity add-ons")

    // Create itinerary
    const itineraryData = [
      {
        tourId: tour1.id,
        dayNumber: 1,
        title: "Arrival in Nairobi",
        description:
          "Arrive at Jomo Kenyatta International Airport where you'll be met by our representative. Transfer to your hotel in Nairobi for an overnight stay.",
        meals: JSON.stringify(["Dinner"]),
        overnight: "Nairobi Serena Hotel",
      },
      {
        tourId: tour1.id,
        dayNumber: 2,
        title: "Nairobi to Masai Mara",
        description:
          "After breakfast, depart for the Masai Mara National Reserve. The scenic drive takes you through the Great Rift Valley.",
        meals: JSON.stringify(["Breakfast", "Lunch", "Dinner"]),
        overnight: "Mara Serena Safari Lodge",
      },
      {
        tourId: tour1.id,
        dayNumber: 3,
        title: "Full Day Masai Mara",
        description:
          "Enjoy a full day of game drives in the reserve, searching for the Big Five and other wildlife.",
        meals: JSON.stringify(["Breakfast", "Lunch", "Dinner"]),
        overnight: "Mara Serena Safari Lodge",
      },
      {
        tourId: tour1.id,
        dayNumber: 4,
        title: "Masai Mara Exploration",
        description:
          "Another exciting day in the Mara with morning and afternoon game drives. Visit a traditional Maasai village.",
        meals: JSON.stringify(["Breakfast", "Lunch", "Dinner"]),
        overnight: "Mara Serena Safari Lodge",
      },
      {
        tourId: tour1.id,
        dayNumber: 5,
        title: "Masai Mara to Lake Naivasha",
        description:
          "Depart the Mara after breakfast and drive to Lake Naivasha. Afternoon boat ride on the lake.",
        meals: JSON.stringify(["Breakfast", "Lunch", "Dinner"]),
        overnight: "Lake Naivasha Sopa Resort",
      },
      {
        tourId: tour1.id,
        dayNumber: 6,
        title: "Lake Naivasha to Nairobi",
        description:
          "Morning visit to Hell's Gate National Park. After lunch, drive back to Nairobi.",
        meals: JSON.stringify(["Breakfast", "Lunch", "Dinner"]),
        overnight: "Nairobi Serena Hotel",
      },
      {
        tourId: tour1.id,
        dayNumber: 7,
        title: "Departure",
        description:
          "After breakfast, enjoy some free time. Transfer to the airport for your departure flight.",
        meals: JSON.stringify(["Breakfast"]),
        overnight: null,
      },
    ]
    for (const day of itineraryData) {
      await prisma.itinerary.create({ data: day })
    }
    console.log("✅ Created tour itinerary")

    // Create a second tour
    const tour2 = await prisma.tour.upsert({
      where: { slug: "serengeti-migration-safari" },
      update: {},
      create: {
        agentId: agent.id,
        slug: "serengeti-migration-safari",
        title: "Great Migration Safari - Serengeti",
        subtitle: "Witness nature's greatest spectacle",
        description:
          "Experience the awe-inspiring Great Migration in Tanzania's Serengeti National Park. Watch millions of wildebeest and zebra cross the Mara River in search of greener pastures.",
        highlights: JSON.stringify([
          "Witness the Great Migration river crossings",
          "Big Five game viewing",
          "Ngorongoro Crater visit",
          "Luxury tented camps",
        ]),
        included: JSON.stringify([
          "All transfers",
          "Park fees",
          "Expert guide",
          "Full board",
          "Game drives",
        ]),
        excluded: JSON.stringify([
          "Flights",
          "Insurance",
          "Tips",
          "Personal items",
        ]),
        destination: "Serengeti",
        country: "Tanzania",
        region: "East Africa",
        startLocation: "Arusha",
        endLocation: "Arusha",
        durationDays: 8,
        durationNights: 7,
        basePrice: 3299,
        currency: "USD",
        minGroupSize: 2,
        maxGroupSize: 10,
        coverImage:
          "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800",
        ]),
        tourType: JSON.stringify(["SAFARI", "WILDLIFE", "LUXURY"]),
        difficulty: "EASY",
        bestSeason: JSON.stringify(["Jun", "Jul", "Aug", "Sep"]),
        status: "ACTIVE",
        featured: true,
      },
    })
    console.log("✅ Created tour:", tour2.title)
  }

  // Create platform settings
  await prisma.platformSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      defaultCommissionRate: 12.0,
      minWithdrawalAmount: 50.0,
      supportEmail: "support@safariplus.com",
      supportPhone: "+254 700 000 000",
    },
  })
  console.log("✅ Created platform settings")

  console.log("\n🎉 Database seeding completed!")
  console.log("\n📋 Test Credentials:")
  console.log("-----------------------------------")
  console.log("CLIENT:  client@safariplus.com / Client123!")
  console.log("AGENT:   agent@safariplus.com / Agent123!")
  console.log("ADMIN:   admin@safariplus.com / Admin123!")
  console.log("-----------------------------------\n")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
