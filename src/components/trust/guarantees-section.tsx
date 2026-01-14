"use client"

import { cn } from "@/lib/utils"
import {
  Shield,
  Calendar,
  Lock,
  UserCheck,
  HeadphonesIcon,
  RefreshCw,
  Award,
  CreditCard,
} from "lucide-react"
import { motion } from "framer-motion"

interface GuaranteesSectionProps {
  variant?: "full" | "compact" | "checkout"
  className?: string
}

const guarantees = [
  {
    icon: Shield,
    title: "Best Price Guarantee",
    description: "Find it cheaper elsewhere? We'll match it + give you 10% off",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Calendar,
    title: "Free Cancellation",
    description: "Cancel up to 48 hours before for a full refund",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: Lock,
    title: "Secure Payment",
    description: "Bank-level 256-bit encryption protects your payment",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: UserCheck,
    title: "Verified Operators",
    description: "Every operator is vetted and verified by our team",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "We're here to help you, anytime, anywhere",
    color: "text-rose-600",
    bgColor: "bg-rose-100",
  },
]

const checkoutGuarantees = [
  {
    icon: Lock,
    text: "Secure checkout",
  },
  {
    icon: RefreshCw,
    text: "Free cancellation",
  },
  {
    icon: Shield,
    text: "Price guarantee",
  },
  {
    icon: CreditCard,
    text: "Safe payment",
  },
]

export function GuaranteesSection({
  variant = "full",
  className,
}: GuaranteesSectionProps) {
  // Checkout variant - minimal for payment pages
  if (variant === "checkout") {
    return (
      <div className={cn("py-3 border-t border-border/50", className)}>
        <div className="grid grid-cols-2 gap-2">
          {checkoutGuarantees.map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <item.icon className="h-3.5 w-3.5 text-green-600 shrink-0" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Compact variant - horizontal scrolling badges
  if (variant === "compact") {
    return (
      <div className={cn("py-4 overflow-x-auto", className)}>
        <div className="flex items-center justify-center gap-6 min-w-max px-4">
          {guarantees.map((guarantee) => (
            <div
              key={guarantee.title}
              className="flex items-center gap-2 text-sm"
            >
              <guarantee.icon className={cn("h-4 w-4 shrink-0", guarantee.color)} />
              <span className="text-muted-foreground whitespace-nowrap">
                {guarantee.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Full variant - detailed section with cards
  return (
    <section className={cn("py-16 bg-muted/30", className)}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Award className="h-4 w-4" />
            Our Commitments
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">Book with Confidence</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            We're committed to making your safari booking experience safe, simple, and worry-free.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {guarantees.map((guarantee, index) => (
            <motion.div
              key={guarantee.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="bg-card rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={cn(
                  "inline-flex h-14 w-14 items-center justify-center rounded-xl mb-4",
                  guarantee.bgColor
                )}
              >
                <guarantee.icon className={cn("h-7 w-7", guarantee.color)} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{guarantee.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {guarantee.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
