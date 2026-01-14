// Default collections - can be overridden by database entries
// These are used as fallback when no collections exist in the database

export interface CollectionData {
  id: string
  slug: string
  title: string
  description: string
  coverImage: string
  icon: string
  filterCriteria: {
    tourType?: string[]
    country?: string[]
    maxPrice?: number
    minPrice?: number
    difficulty?: string
    minDays?: number
    maxDays?: number
  }
  featured: boolean
  sortOrder: number
}

export const defaultCollections: CollectionData[] = [
  {
    id: "big-five-safaris",
    slug: "big-five-safaris",
    title: "Big Five Safaris",
    description: "Experience the ultimate wildlife adventure with our Big Five safaris featuring lions, elephants, buffalo, leopards, and rhinos.",
    coverImage: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=800",
    icon: "Binoculars",
    filterCriteria: {
      tourType: ["WILDLIFE", "SAFARI"],
    },
    featured: true,
    sortOrder: 1,
  },
  {
    id: "gorilla-trekking",
    slug: "gorilla-trekking",
    title: "Gorilla Trekking Adventures",
    description: "Get up close with endangered mountain gorillas in their natural habitat in Uganda and Rwanda.",
    coverImage: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?q=80&w=800",
    icon: "TreePine",
    filterCriteria: {
      tourType: ["GORILLA_TREKKING"],
    },
    featured: true,
    sortOrder: 2,
  },
  {
    id: "luxury-escapes",
    slug: "luxury-escapes",
    title: "Luxury Safari Escapes",
    description: "Indulge in five-star lodges, private game drives, and exclusive experiences across East Africa.",
    coverImage: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=800",
    icon: "Crown",
    filterCriteria: {
      tourType: ["LUXURY"],
    },
    featured: true,
    sortOrder: 3,
  },
  {
    id: "budget-friendly",
    slug: "budget-friendly",
    title: "Budget-Friendly Safaris",
    description: "Amazing wildlife experiences that won't break the bank. Quality adventures for savvy travelers.",
    coverImage: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800",
    icon: "Wallet",
    filterCriteria: {
      tourType: ["BUDGET"],
      maxPrice: 500,
    },
    featured: true,
    sortOrder: 4,
  },
  {
    id: "family-adventures",
    slug: "family-adventures",
    title: "Family Safari Adventures",
    description: "Kid-friendly safaris with educational experiences, comfortable lodges, and unforgettable memories.",
    coverImage: "https://images.unsplash.com/photo-1534759926787-89b33e5e618d?q=80&w=800",
    icon: "Users",
    filterCriteria: {
      tourType: ["FAMILY"],
    },
    featured: true,
    sortOrder: 5,
  },
  {
    id: "honeymoon-romance",
    slug: "honeymoon-romance",
    title: "Honeymoon & Romance",
    description: "Celebrate love with romantic safari lodges, sunset game drives, and bush dinners under the stars.",
    coverImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800",
    icon: "Heart",
    filterCriteria: {
      tourType: ["HONEYMOON"],
    },
    featured: true,
    sortOrder: 6,
  },
  {
    id: "kenya-safaris",
    slug: "kenya-safaris",
    title: "Kenya Safaris",
    description: "Explore the iconic Masai Mara, Amboseli, and more in the birthplace of the safari.",
    coverImage: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=800",
    icon: "MapPin",
    filterCriteria: {
      country: ["Kenya"],
    },
    featured: false,
    sortOrder: 7,
  },
  {
    id: "tanzania-safaris",
    slug: "tanzania-safaris",
    title: "Tanzania Safaris",
    description: "Witness the Great Migration in the Serengeti and explore the Ngorongoro Crater.",
    coverImage: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800",
    icon: "MapPin",
    filterCriteria: {
      country: ["Tanzania"],
    },
    featured: false,
    sortOrder: 8,
  },
  {
    id: "photography-safaris",
    slug: "photography-safaris",
    title: "Photography Safaris",
    description: "Perfect for shutterbugs! Tours designed for optimal wildlife photography opportunities.",
    coverImage: "https://images.unsplash.com/photo-1534177616064-ef61e1f28faf?q=80&w=800",
    icon: "Camera",
    filterCriteria: {
      tourType: ["PHOTOGRAPHY"],
    },
    featured: false,
    sortOrder: 9,
  },
  {
    id: "beach-and-bush",
    slug: "beach-and-bush",
    title: "Beach & Bush Combos",
    description: "The best of both worlds - combine thrilling safaris with relaxing beach getaways.",
    coverImage: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800",
    icon: "Palmtree",
    filterCriteria: {
      tourType: ["BEACH", "SAFARI"],
    },
    featured: false,
    sortOrder: 10,
  },
  {
    id: "short-getaways",
    slug: "short-getaways",
    title: "Weekend Getaways",
    description: "Short on time? These 2-4 day safaris pack maximum adventure into minimal days.",
    coverImage: "https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=800",
    icon: "Clock",
    filterCriteria: {
      maxDays: 4,
    },
    featured: false,
    sortOrder: 11,
  },
  {
    id: "adventure-safaris",
    slug: "adventure-safaris",
    title: "Adventure Safaris",
    description: "For thrill-seekers! Walking safaris, hot air balloons, and adrenaline-pumping experiences.",
    coverImage: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=800",
    icon: "Mountain",
    filterCriteria: {
      tourType: ["ADVENTURE"],
    },
    featured: false,
    sortOrder: 12,
  },
]
