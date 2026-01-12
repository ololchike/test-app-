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
} from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const values = [
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "All our tour operators are verified and vetted to ensure the highest standards of safety and professionalism.",
  },
  {
    icon: Heart,
    title: "Authentic Experiences",
    description:
      "We connect travelers with local operators who provide genuine, culturally rich safari experiences.",
  },
  {
    icon: Globe,
    title: "Sustainable Tourism",
    description:
      "We promote responsible tourism practices that benefit local communities and protect wildlife.",
  },
  {
    icon: Zap,
    title: "Easy Booking",
    description:
      "Our platform makes it simple to compare, customize, and book your perfect safari adventure.",
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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2070"
              alt="Safari landscape"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          </div>

          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Connecting Travelers with Authentic Safari Experiences
              </h1>
              <p className="mt-6 text-lg text-white/90 sm:text-xl">
                SafariPlus is East Africa's leading platform for discovering and
                booking unforgettable safari adventures with trusted local
                operators.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/tours">Explore Tours</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="bg-white/10 border-white text-white hover:bg-white/20">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b bg-muted/50 py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-primary sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Our Story
                </h2>
                <div className="mt-6 space-y-4 text-muted-foreground">
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
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto">
                <Image
                  src="https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=800"
                  alt="Safari experience"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="bg-secondary py-16 text-secondary-foreground lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                  Our Mission
                </h2>
                <p className="mt-4 text-secondary-foreground/80">
                  To democratize access to authentic safari experiences by
                  connecting travelers with trusted local operators, making
                  African adventures accessible, transparent, and unforgettable.
                </p>
              </div>
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                  Our Vision
                </h2>
                <p className="mt-4 text-secondary-foreground/80">
                  To become the world's most trusted platform for African safari
                  bookings, setting the standard for quality, sustainability, and
                  authentic travel experiences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Our Values
              </h2>
              <p className="mt-4 text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <Card key={value.title}>
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-muted/50 py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Meet Our Team
              </h2>
              <p className="mt-4 text-muted-foreground">
                Passionate professionals dedicated to your safari experience
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <Card key={member.name} className="overflow-hidden">
                  <div className="relative aspect-square">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    <p className="text-sm font-medium text-primary">
                      {member.role}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-r from-primary to-secondary p-8 text-center text-white sm:p-12 lg:p-16">
              <Users className="mx-auto h-12 w-12" />
              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Start Your Safari Adventure?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
                Join thousands of travelers who have discovered the magic of East
                Africa with SafariPlus. Browse our tours and start planning your
                dream safari today.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                  asChild
                >
                  <Link href="/tours">Browse Tours</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/become-agent">Become an Operator</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
