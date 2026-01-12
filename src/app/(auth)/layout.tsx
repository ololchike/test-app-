"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, Shield, Clock, Sparkles } from "lucide-react"

const testimonials = [
  {
    quote: "SafariPlus made our dream African safari a reality. From booking to the actual experience, everything was perfect.",
    author: "Sarah & Michael Thompson",
    tour: "Serengeti Safari, 2024",
    rating: 5,
  },
  {
    quote: "The gorilla trekking experience was life-changing. The team handled everything seamlessly.",
    author: "David Chen",
    tour: "Uganda Gorilla Trek, 2024",
    rating: 5,
  },
  {
    quote: "Best travel platform I've ever used. Transparent pricing and amazing local operators.",
    author: "Emma Rodriguez",
    tour: "Masai Mara Adventure, 2024",
    rating: 5,
  },
]

const trustBadges = [
  { icon: Shield, text: "Verified Operators" },
  { icon: Clock, text: "24/7 Support" },
  { icon: Star, text: "10K+ Happy Travelers" },
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Form */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        <div className="mx-auto w-full max-w-md relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-10 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-glow"
            >
              <span className="text-xl font-bold text-primary-foreground">S+</span>
            </motion.div>
            <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
              Safari<span className="text-primary">Plus</span>
            </span>
          </Link>

          {children}
        </div>
      </div>

      {/* Right Panel - Image/Brand */}
      <div className="hidden lg:block relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068"
            alt="Safari landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/95 via-secondary/85 to-primary/80" />
        </div>

        {/* Animated shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          {/* Top - Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-6"
          >
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge.text}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-2 text-sm text-white/80"
              >
                <badge.icon className="h-4 w-4 text-accent" />
                <span>{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Middle - Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">What Our Travelers Say</span>
            </div>

            <blockquote className="text-3xl font-semibold leading-relaxed">
              &ldquo;{testimonials[0].quote}&rdquo;
            </blockquote>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-accent to-yellow-500 flex items-center justify-center text-lg font-bold">
                {testimonials[0].author.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-lg">{testimonials[0].author}</p>
                <p className="text-sm text-white/70">{testimonials[0].tour}</p>
              </div>
            </div>

            {/* Rating stars */}
            <div className="flex items-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-accent text-accent" />
              ))}
            </div>
          </motion.div>

          {/* Bottom - Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-8">
              {[
                { value: "10K+", label: "Travelers" },
                { value: "150+", label: "Operators" },
                { value: "4.9", label: "Rating" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
