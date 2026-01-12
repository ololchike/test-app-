"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface TestimonialsProps {
  testimonials: {
    name: string
    location: string
    image: string
    rating: number
    text: string
    tour: string
  }[]
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  if (testimonials.length === 0) {
    // Show placeholder testimonials
    testimonials = [
      {
        name: "Sarah Mitchell",
        location: "United Kingdom",
        image: "https://ui-avatars.com/api/?name=Sarah+Mitchell&background=E07B39&color=fff",
        rating: 5,
        text: "An absolutely magical experience! The team took care of every detail, from the airport pickup to the lodge accommodations. Seeing the Great Migration was a dream come true.",
        tour: "Masai Mara Safari Adventure",
      },
      {
        name: "David Chen",
        location: "Singapore",
        image: "https://ui-avatars.com/api/?name=David+Chen&background=1B4D3E&color=fff",
        rating: 5,
        text: "The gorilla trekking experience in Uganda was life-changing. Our guide was incredibly knowledgeable and made us feel safe throughout the journey.",
        tour: "Gorilla Trekking Experience",
      },
      {
        name: "Emma Rodriguez",
        location: "Spain",
        image: "https://ui-avatars.com/api/?name=Emma+Rodriguez&background=C9A227&color=fff",
        rating: 5,
        text: "From the Serengeti to the Ngorongoro Crater, every moment was perfect. The local operators truly know how to create unforgettable experiences.",
        tour: "Tanzania Wildlife Safari",
      },
    ]
  }

  return (
    <section className="py-20 lg:py-28 bg-secondary text-secondary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

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
            className="text-accent font-semibold text-sm uppercase tracking-wider"
          >
            Testimonials
          </motion.span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-white">
            What Our Travelers Say
          </h2>
          <p className="mt-4 text-lg text-secondary-foreground/80">
            Real experiences from our community of adventurers
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500">
                  <CardContent className="p-8">
                    {/* Quote Icon */}
                    <Quote className="h-10 w-10 text-accent/40 mb-4" />

                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-accent text-accent"
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-secondary-foreground/90 text-lg leading-relaxed line-clamp-4">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="mt-8 flex items-center gap-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-accent/30">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{testimonial.name}</div>
                        <div className="text-sm text-secondary-foreground/60">
                          {testimonial.location}
                        </div>
                      </div>
                    </div>

                    {/* Tour Badge */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-xs text-secondary-foreground/50 uppercase tracking-wider">Tour</div>
                      <div className="text-sm text-accent font-medium mt-1">{testimonial.tour}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
