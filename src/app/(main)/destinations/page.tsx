"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, ChevronRight, Globe, Sparkles, Compass } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const DESTINATIONS = [
  {
    slug: "kenya",
    name: "Kenya",
    description: "Home to the Masai Mara and the Great Migration",
    image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=1200",
    highlights: ["Masai Mara", "Amboseli", "Tsavo", "Diani Beach"],
    tourCount: 45,
    color: "from-orange-500 to-red-600",
  },
  {
    slug: "tanzania",
    name: "Tanzania",
    description: "Serengeti, Kilimanjaro, and Zanzibar await",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200",
    highlights: ["Serengeti", "Ngorongoro", "Kilimanjaro", "Zanzibar"],
    tourCount: 38,
    color: "from-emerald-500 to-teal-600",
  },
  {
    slug: "uganda",
    name: "Uganda",
    description: "The Pearl of Africa - gorillas and more",
    image: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?q=80&w=1200",
    highlights: ["Bwindi", "Queen Elizabeth", "Murchison Falls", "Jinja"],
    tourCount: 24,
    color: "from-amber-500 to-orange-600",
  },
  {
    slug: "rwanda",
    name: "Rwanda",
    description: "Land of a Thousand Hills and mountain gorillas",
    image: "https://images.unsplash.com/photo-1580746738291-5e1c1e82f5a7?q=80&w=1200",
    highlights: ["Volcanoes NP", "Nyungwe", "Akagera", "Lake Kivu"],
    tourCount: 18,
    color: "from-blue-500 to-indigo-600",
  },
]

const stats = [
  { value: "4", label: "Countries" },
  { value: "125+", label: "Tours Available" },
  { value: "50+", label: "National Parks" },
  { value: "1000+", label: "Wildlife Species" },
]

export default function DestinationsPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/30 py-16 sm:py-20 lg:py-28 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-20 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-20 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <Globe className="h-4 w-4 text-accent" />
              <span className="text-white/90 text-sm font-medium">East Africa Awaits</span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Explore{" "}
              <span className="relative">
                <span className="relative z-10 text-accent">East Africa</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-2 sm:h-3 bg-accent/30 -z-0 origin-left"
                />
              </span>
            </h1>

            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-white/80 max-w-2xl">
              Discover the best safari destinations across Kenya, Tanzania, Uganda, and Rwanda.
              Each country offers unique wildlife experiences and breathtaking landscapes.
            </p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 sm:mt-8 lg:mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center md:text-left"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-white/60 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">
            Popular Destinations
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Choose Your Safari Destination
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Each destination offers unique experiences, from the Great Migration to mountain gorilla trekking
          </p>
        </motion.div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          {DESTINATIONS.map((destination, index) => (
            <motion.div
              key={destination.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/destinations/${destination.slug}`}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden group border-border/50 hover:border-primary/30 hover:shadow-premium-lg transition-all duration-500">
                    <div className="relative h-64 sm:h-72 lg:h-80 overflow-hidden">
                      <Image
                        src={destination.image}
                        alt={destination.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      {/* Tour Count Badge */}
                      <Badge className={cn("absolute top-4 right-4 bg-gradient-to-r border-0 shadow-lg", destination.color)}>
                        {destination.tourCount} Tours
                      </Badge>

                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
                        <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm mb-2 sm:mb-3">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                          East Africa
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
                          {destination.name}
                        </h2>
                        <p className="text-white/90 text-sm sm:text-base lg:text-lg">
                          {destination.description}
                        </p>
                      </div>
                    </div>
                    <CardContent className="p-5 sm:p-6 lg:p-8">
                      <div className="flex flex-wrap gap-2 mb-6">
                        {destination.highlights.map((highlight) => (
                          <Badge
                            key={highlight}
                            variant="secondary"
                            className="px-3 py-1.5 bg-primary/5 text-primary/80 border-0 hover:bg-primary/10 transition-colors"
                          >
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-semibold group-hover:text-primary/80 transition-colors flex items-center gap-2">
                          Explore {destination.name}
                          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <Compass className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:rotate-45 transition-all duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Can't Decide?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              Let Us Help You Choose
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8">
              Our travel experts can help you find the perfect destination based on your interests,
              budget, and travel dates.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button size="lg" className="h-12 px-6 sm:px-8 w-full sm:w-auto shadow-glow">
                <Link href="/contact">Talk to an Expert</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 sm:px-8 w-full sm:w-auto">
                <Link href="/tours">Browse All Tours</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
