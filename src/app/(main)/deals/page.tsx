import { Metadata } from "next"
import { Zap, Clock, Calendar, Tag } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { defaultDeals } from "@/lib/data/deals"
import { DealCard } from "@/components/deals"

export const metadata: Metadata = {
  title: "Deals & Offers | SafariPlus",
  description: "Exclusive safari deals and special offers. Save on your next African adventure with our limited-time discounts.",
}

async function getDeals() {
  try {
    // Try database first
    const now = new Date()
    const dbDeals = await prisma.deal.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: [
        { featured: "desc" },
        { endDate: "asc" },
      ],
    })

    if (dbDeals.length > 0) {
      return dbDeals
    }

    // Fall back to default deals
    return defaultDeals.filter(d => new Date(d.endDate) >= now)
  } catch (error) {
    console.error("Error fetching deals:", error)
    return defaultDeals.filter(d => new Date(d.endDate) >= new Date())
  }
}

export default async function DealsPage() {
  const deals = await getDeals()

  // Categorize deals
  const flashDeals = deals.filter(d => d.type === "FLASH_SALE")
  const earlyBirdDeals = deals.filter(d => d.type === "EARLY_BIRD")
  const lastMinuteDeals = deals.filter(d => d.type === "LAST_MINUTE")
  const otherDeals = deals.filter(d => !["FLASH_SALE", "EARLY_BIRD", "LAST_MINUTE"].includes(d.type))

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 bg-gradient-to-br from-red-500/10 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <Zap className="h-6 w-6" />
              <span className="font-semibold uppercase tracking-wider">
                Special Offers
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Deals & Discounts
            </h1>
            <p className="text-lg text-muted-foreground">
              Don't miss out on these incredible savings! Our limited-time offers make your dream safari more affordable than ever.
            </p>
          </div>
        </div>
      </section>

      {/* Flash Sales - Most Urgent */}
      {flashDeals.length > 0 && (
        <section className="py-12 sm:py-16 bg-red-50/50 dark:bg-red-950/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Flash Sales</h2>
                <p className="text-muted-foreground text-sm">Limited time - act fast!</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {flashDeals.map((deal, index) => (
                <DealCard key={deal.id} deal={deal} index={index} variant="featured" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Last Minute Deals */}
      {lastMinuteDeals.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Last Minute Deals</h2>
                <p className="text-muted-foreground text-sm">Departures within 14 days</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lastMinuteDeals.map((deal, index) => (
                <DealCard key={deal.id} deal={deal} index={index} variant="default" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Early Bird Deals */}
      {earlyBirdDeals.length > 0 && (
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Early Bird Specials</h2>
                <p className="text-muted-foreground text-sm">Book ahead and save more</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {earlyBirdDeals.map((deal, index) => (
                <DealCard key={deal.id} deal={deal} index={index} variant="default" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other Offers */}
      {otherDeals.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <Tag className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">More Offers</h2>
                <p className="text-muted-foreground text-sm">Additional ways to save</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {otherDeals.map((deal, index) => (
                <DealCard key={deal.id} deal={deal} index={index} variant="default" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {deals.length === 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Active Deals</h3>
            <p className="text-muted-foreground">
              Check back soon for new offers and discounts!
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
