"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Search, MapPin, Calendar, Users, ArrowRight, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface HeroSectionProps {
  stats: {
    travelers: string
    tours: string
    operators: string
    rating: string
  }
}

export function HeroSection({ stats }: HeroSectionProps) {
  const [destination, setDestination] = useState("")

  const statItems = [
    { value: stats.travelers, label: "Happy Travelers" },
    { value: stats.tours, label: "Safari Tours" },
    { value: stats.operators, label: "Local Operators" },
    { value: stats.rating, label: "Average Rating" },
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2070"
          alt="African Safari Landscape"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Animated Grain Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
        </div>
      </motion.div>

      {/* Floating Decorative Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-accent/20 rounded-full blur-3xl"
      />

      {/* Hero Content */}
      <div className="container relative z-10 mx-auto px-4 pt-24 pb-16 lg:px-8">
        <div className="max-w-3xl">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge className="mb-6 bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 px-4 py-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2 text-accent" />
              Discover East Africa
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]"
          >
            Your Gateway to{" "}
            <span className="relative">
              <span className="text-gradient-sunset">Unforgettable</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-sunset origin-left"
              />
            </span>{" "}
            Safari Adventures
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-6 text-xl text-white/80 max-w-2xl leading-relaxed"
          >
            Connect with verified local operators for authentic experiences across
            Kenya, Tanzania, Uganda, and Rwanda. Book with confidence.
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-10"
          >
            <div className="rounded-2xl bg-white/95 backdrop-blur-xl p-4 sm:p-6 shadow-premium-lg border border-white/20">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                    <Input
                      placeholder="Where do you want to go?"
                      className="pl-10 h-12 border-0 bg-muted/50 text-base font-medium focus-visible:ring-primary"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    When
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                    <Input
                      type="date"
                      className="pl-10 h-12 border-0 bg-muted/50 text-base font-medium focus-visible:ring-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    &nbsp;
                  </label>
                  <Button asChild size="lg" className="w-full h-12 text-base font-semibold shadow-glow">
                    <Link href={`/tours${destination ? `?destination=${destination}` : ""}`}>
                      <Search className="h-5 w-5 mr-2" />
                      Search Tours
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-12 flex flex-wrap gap-8 sm:gap-12"
          >
            {statItems.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                className="text-white group"
              >
                <div className="text-3xl sm:text-4xl font-bold group-hover:text-primary transition-colors">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button
              asChild
              size="lg"
              className="h-14 px-8 text-base font-semibold shadow-glow hover:shadow-glow-gold transition-shadow"
            >
              <Link href="/tours">
                Explore Tours
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base font-semibold border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              <Link href="#how-it-works">
                <Play className="mr-2 h-5 w-5" />
                Watch Video
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 rounded-full bg-white/60"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
