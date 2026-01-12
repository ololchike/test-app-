"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const DESTINATIONS = [
  {
    slug: "kenya",
    name: "Kenya",
    description: "Home to the Masai Mara and the Great Migration",
    image: "/images/destinations/kenya.jpg",
    highlights: ["Masai Mara", "Amboseli", "Tsavo", "Diani Beach"],
  },
  {
    slug: "tanzania",
    name: "Tanzania",
    description: "Serengeti, Kilimanjaro, and Zanzibar await",
    image: "/images/destinations/tanzania.jpg",
    highlights: ["Serengeti", "Ngorongoro", "Kilimanjaro", "Zanzibar"],
  },
  {
    slug: "uganda",
    name: "Uganda",
    description: "The Pearl of Africa - gorillas and more",
    image: "/images/destinations/uganda.jpg",
    highlights: ["Bwindi", "Queen Elizabeth", "Murchison Falls", "Jinja"],
  },
  {
    slug: "rwanda",
    name: "Rwanda",
    description: "Land of a Thousand Hills and mountain gorillas",
    image: "/images/destinations/rwanda.jpg",
    highlights: ["Volcanoes NP", "Nyungwe", "Akagera", "Lake Kivu"],
  },
]

export default function DestinationsPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <div className="bg-muted/50 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Explore East Africa
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Discover the best safari destinations across Kenya, Tanzania, Uganda, and Rwanda.
            Each country offers unique wildlife experiences and breathtaking landscapes.
          </p>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          {DESTINATIONS.map((destination) => (
            <Link key={destination.slug} href={`/destinations/${destination.slug}`}>
              <Card className="overflow-hidden group hover:shadow-xl transition-all h-full">
                <div className="relative h-64">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                  <div className="absolute inset-0 bg-muted" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                      <MapPin className="h-4 w-4" />
                      East Africa
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {destination.name}
                    </h2>
                    <p className="text-white/90">
                      {destination.description}
                    </p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {destination.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="text-xs px-2 py-1 bg-muted rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                    Explore {destination.name}
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
