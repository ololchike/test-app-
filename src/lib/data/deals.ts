// Default deals - used as fallback when no deals exist in database

export interface DealData {
  id: string
  slug: string
  title: string
  description: string
  type: "PERCENTAGE_OFF" | "FIXED_AMOUNT_OFF" | "EARLY_BIRD" | "LAST_MINUTE" | "FLASH_SALE" | "SEASONAL"
  discountValue: number
  startDate: Date
  endDate: Date
  coverImage: string
  badge: string
  featured: boolean
  couponCode?: string
  minBookingValue?: number
}

// Generate dates relative to now
const now = new Date()
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
const in3Months = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

export const defaultDeals: DealData[] = [
  {
    id: "early-bird-2026",
    slug: "early-bird-2026",
    title: "Early Bird Special",
    description: "Book 60+ days in advance and save 15% on any safari. Perfect for planners who like to secure the best deals early.",
    type: "EARLY_BIRD",
    discountValue: 15,
    startDate: now,
    endDate: in3Months,
    coverImage: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=800",
    badge: "Early Bird",
    featured: true,
    couponCode: "EARLY15",
    minBookingValue: 500,
  },
  {
    id: "flash-sale-weekend",
    slug: "flash-sale-weekend",
    title: "Weekend Flash Sale",
    description: "This weekend only! Get 20% off selected Masai Mara safaris. Limited availability - book now before spots fill up!",
    type: "FLASH_SALE",
    discountValue: 20,
    startDate: now,
    endDate: nextWeek,
    coverImage: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800",
    badge: "Flash Sale",
    featured: true,
    couponCode: "FLASH20",
  },
  {
    id: "last-minute-deals",
    slug: "last-minute-deals",
    title: "Last Minute Deals",
    description: "Spontaneous traveler? Grab up to 25% off on departures within the next 14 days. Incredible value on short-notice bookings.",
    type: "LAST_MINUTE",
    discountValue: 25,
    startDate: now,
    endDate: nextMonth,
    coverImage: "https://images.unsplash.com/photo-1534177616064-ef61e1f28faf?q=80&w=800",
    badge: "Last Minute",
    featured: true,
    couponCode: "LASTMIN25",
  },
  {
    id: "gorilla-special",
    slug: "gorilla-special",
    title: "Gorilla Trekking Special",
    description: "Experience mountain gorillas at a special rate. Save $200 on our premium gorilla trekking packages in Uganda and Rwanda.",
    type: "FIXED_AMOUNT_OFF",
    discountValue: 200,
    startDate: now,
    endDate: nextMonth,
    coverImage: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?q=80&w=800",
    badge: "Special Offer",
    featured: true,
    couponCode: "GORILLA200",
    minBookingValue: 1500,
  },
  {
    id: "group-discount",
    slug: "group-discount",
    title: "Group Booking Discount",
    description: "Traveling with friends or family? Groups of 4+ get 10% off. The more the merrier, and the bigger the savings!",
    type: "PERCENTAGE_OFF",
    discountValue: 10,
    startDate: now,
    endDate: in3Months,
    coverImage: "https://images.unsplash.com/photo-1534759926787-89b33e5e618d?q=80&w=800",
    badge: "Group Deal",
    featured: false,
    couponCode: "GROUP10",
  },
  {
    id: "honeymoon-package",
    slug: "honeymoon-package",
    title: "Honeymoon Package",
    description: "Celebrate your love with a complimentary room upgrade and romantic dinner on select honeymoon safaris.",
    type: "SEASONAL",
    discountValue: 0, // Value-add rather than discount
    startDate: now,
    endDate: in3Months,
    coverImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800",
    badge: "Romance",
    featured: false,
    couponCode: "HONEYMOON",
  },
]
