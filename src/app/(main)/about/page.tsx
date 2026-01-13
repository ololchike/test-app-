"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Award,
  Globe,
  Heart,
  Shield,
  Target,
  Users,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const values = [
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "All our tour operators are verified and vetted to ensure the highest standards of safety and professionalism.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Heart,
    title: "Authentic Experiences",
    description:
      "We connect travelers with local operators who provide genuine, culturally rich safari experiences.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Globe,
    title: "Sustainable Tourism",
    description:
      "We promote responsible tourism practices that benefit local communities and protect wildlife.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Zap,
    title: "Easy Booking",
    description:
      "Our platform makes it simple to compare, customize, and book your perfect safari adventure.",
    color: "from-amber-500 to-orange-600",
  },
]

const team = [
  {
    name: "Michael Kariuki",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400",
    bio: "10+ years experience in East African tourism",
  },
  {
    name: "Sarah Mwangi",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400",
    bio: "Expert in tour operator partnerships",
  },
  {
    name: "David Ochieng",
    role: "Customer Success Lead",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
    bio: "Passionate about creating memorable experiences",
  },
  {
    name: "Grace Njeri",
    role: "Marketing Director",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400",
    bio: "Showcasing East Africa to the world",
  },
]

const stats = [
  { value: "2020", label: "Founded" },
  { value: "150+", label: "Partner Operators" },
  { value: "10,000+", label: "Happy Travelers" },
  { value: "4 Countries", label: "Coverage" },
]

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2070"
            alt="Safari landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
        </div>

        {/* Animated shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
          />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-white/90 text-sm font-medium">Our Story</span>
            </motion.div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Connecting Travelers with{" "}
              <span className="relative">
                <span className="relative z-10 text-accent">Authentic Safari</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-2 sm:h-3 bg-accent/30 -z-0 origin-left"
                />
              </span>{" "}
              Experiences
            </h1>
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-white/80 leading-relaxed">
              SafariPlus is East Africa's leading platform for discovering and
              booking unforgettable safari adventures with trusted local
              operators.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
            >
              <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-8 w-full sm:w-auto shadow-glow" asChild>
                <Link href="/tours">
                  Explore Tours
                  <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 sm:h-14 px-6 sm:px-8 w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative border-b bg-gradient-to-r from-muted/50 via-background to-muted/50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient">
                  {stat.value}
                </div>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 sm:py-16 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">
                Who We Are
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
                Our Story
              </h2>
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
                <p>
                  SafariPlus was born from a simple observation: travelers
                  planning African safaris faced overwhelming choices, unclear
                  pricing, and uncertainty about operator quality. Meanwhile,
                  exceptional local tour operators struggled to reach
                  international audiences.
                </p>
                <p>
                  Founded in 2020 by a team of tourism professionals and tech
                  enthusiasts, SafariPlus bridges this gap. We created a
                  platform where verified operators showcase their offerings,
                  and travelers can confidently book authentic safari
                  experiences.
                </p>
                <p>
                  Today, we're proud to work with over 150 vetted operators
                  across Kenya, Tanzania, Uganda, and Rwanda, helping thousands
                  of travelers create unforgettable memories while supporting
                  local businesses and conservation efforts.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-premium-lg">
                <Image
                  src="https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=800"
                  alt="Safari experience"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-6 -left-6 bg-white dark:bg-card rounded-2xl p-6 shadow-premium-lg border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                    <CheckCircle className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">150+</div>
                    <div className="text-sm text-muted-foreground">Verified Operators</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-secondary py-12 sm:py-16 lg:py-28 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-20 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500">
                <Target className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold md:text-3xl">
                Our Mission
              </h2>
              <p className="mt-3 sm:mt-4 text-white/80 text-base sm:text-lg leading-relaxed">
                To democratize access to authentic safari experiences by
                connecting travelers with trusted local operators, making
                African adventures accessible, transparent, and unforgettable.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-yellow-500">
                <Award className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold md:text-3xl">
                Our Vision
              </h2>
              <p className="mt-3 sm:mt-4 text-white/80 text-base sm:text-lg leading-relaxed">
                To become the world's most trusted platform for African safari
                bookings, setting the standard for quality, sustainability, and
                authentic travel experiences.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 lg:mb-16"
          >
            <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">
              What We Believe
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
              Our Values
            </h2>
            <p className="mt-3 sm:mt-4 text-muted-foreground text-base sm:text-lg">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-premium-lg transition-all duration-300">
                    <CardContent className="p-5 sm:p-6 lg:p-8">
                      <div className={cn(
                        "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br",
                        value.color
                      )}>
                        <value.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold">
                        {value.title}
                      </h3>
                      <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-muted/30 py-12 sm:py-16 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 lg:mb-16"
          >
            <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">
              The People Behind SafariPlus
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-3 sm:mt-4 text-muted-foreground text-base sm:text-lg">
              Passionate professionals dedicated to your safari experience
            </p>
          </motion.div>

          <div className="grid gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-premium-lg transition-all duration-300">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-bold">{member.name}</h3>
                      <p className="text-xs sm:text-sm font-medium text-primary mt-1">
                        {member.role}
                      </p>
                      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
                        {member.bio}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary via-primary/90 to-secondary p-8 sm:p-10 lg:p-16 text-center text-white"
          >
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-20 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
              />
            </div>

            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6 sm:mb-8"
              >
                <Users className="h-8 w-8 sm:h-10 sm:w-10" />
              </motion.div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                Ready to Start Your Safari Adventure?
              </h2>
              <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg lg:text-xl text-white/80">
                Join thousands of travelers who have discovered the magic of East
                Africa with SafariPlus. Browse our tours and start planning your
                dream safari today.
              </p>
              <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
                <Button
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-8 w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-2xl"
                  asChild
                >
                  <Link href="/tours">
                    Browse Tours
                    <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 sm:h-14 px-6 sm:px-8 w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/become-agent">Become an Operator</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
