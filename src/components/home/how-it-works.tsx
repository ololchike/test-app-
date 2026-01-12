"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Search, Settings, Plane, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search & Compare",
    description: "Browse hundreds of safari tours from verified local operators. Compare prices, itineraries, and reviews.",
    color: "from-primary to-orange-400",
  },
  {
    number: "02",
    icon: Settings,
    title: "Customize & Book",
    description: "Customize your tour with accommodation preferences and activities. Book securely with our protected payment system.",
    color: "from-accent to-yellow-400",
  },
  {
    number: "03",
    icon: Plane,
    title: "Experience & Enjoy",
    description: "Connect directly with your local operator. Enjoy 24/7 support throughout your unforgettable safari adventure.",
    color: "from-secondary to-emerald-400",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent pointer-events-none" />

      <div className="container relative mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-primary font-semibold text-sm uppercase tracking-wider"
          >
            How It Works
          </motion.span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            Book Your Dream Safari{" "}
            <span className="text-gradient">in 3 Steps</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We&apos;ve made it incredibly simple to plan and book your African safari adventure
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
              )}

              {/* Card */}
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="relative text-center p-8 rounded-3xl bg-card border border-border hover:border-primary/30 hover:shadow-premium-lg transition-all duration-500"
              >
                {/* Number Badge */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                >
                  <step.icon className="h-9 w-9 text-white" />
                </motion.div>

                {/* Step Number */}
                <div className="absolute top-6 right-6 text-6xl font-bold text-muted/30 group-hover:text-primary/20 transition-colors">
                  {step.number}
                </div>

                <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Button asChild size="lg" className="h-14 px-8 text-base font-semibold shadow-glow">
            <Link href="/tours">
              Start Planning Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
