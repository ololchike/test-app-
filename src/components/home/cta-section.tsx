"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Compass, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background with Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />

      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"
        />
      </div>

      {/* Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Compass Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <Compass className="h-10 w-10 text-white" />
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              Ready for Your{" "}
              <span className="relative">
                <span className="relative z-10">African Adventure</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute bottom-2 left-0 right-0 h-3 bg-accent/40 -z-0 origin-left"
                />
              </span>
              ?
            </h2>
            <p className="mt-6 text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Join thousands of travelers who have discovered the magic of East Africa.
              Your dream safari is just a click away.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="h-14 px-8 text-base font-semibold bg-white text-primary hover:bg-white/90 shadow-2xl"
            >
              <Link href="/tours">
                Explore Tours
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base font-semibold border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <Link href="/contact">
                <Phone className="mr-2 h-5 w-5" />
                Contact Us
              </Link>
            </Button>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/70"
          >
            <a
              href="tel:+254700000000"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>+254 700 000 000</span>
            </a>
            <span className="hidden sm:block w-1 h-1 bg-white/30 rounded-full" />
            <a
              href="mailto:hello@safariplus.com"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>hello@safariplus.com</span>
            </a>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-16 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-primary border-2 border-white/20"
                  style={{
                    backgroundImage: `url(https://ui-avatars.com/api/?name=User+${i}&background=random&color=fff)`,
                    backgroundSize: "cover",
                  }}
                />
              ))}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">10,000+ Happy Travelers</div>
              <div className="text-xs text-white/60">Join our community today</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
