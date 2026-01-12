"use client"

import { motion } from "framer-motion"
import { Shield, Clock, Award, Star, Headphones, CreditCard } from "lucide-react"

const indicators = [
  {
    icon: Shield,
    title: "Verified Operators",
    description: "Fully vetted partners",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Always here to help",
  },
  {
    icon: Award,
    title: "Best Price Guarantee",
    description: "Unbeatable value",
  },
  {
    icon: Star,
    title: "5-Star Reviews",
    description: "Trusted by thousands",
  },
]

export function TrustIndicators() {
  return (
    <section className="relative border-b bg-card py-10 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />

      <div className="container relative mx-auto px-4 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="grid grid-cols-2 gap-6 md:grid-cols-4"
        >
          {indicators.map((item, index) => (
            <motion.div
              key={item.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="group flex items-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300"
              >
                <item.icon className="h-6 w-6 text-primary" />
              </motion.div>
              <div>
                <div className="font-semibold text-foreground">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.description}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
