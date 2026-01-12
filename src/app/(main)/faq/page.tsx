"use client"

import Link from "next/link"
import { HelpCircle, Mail, ArrowRight, Sparkles, Search } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const faqCategories = [
  {
    category: "Booking & Payments",
    icon: "💳",
    questions: [
      {
        question: "How do I book a safari tour?",
        answer:
          "Booking a safari is easy! Browse our tours, select your preferred dates and options, and proceed to checkout. You can customize your tour with different accommodation levels and activity add-ons. Once you complete the payment, you'll receive a confirmation email with all the details.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept M-Pesa, credit/debit cards (Visa, Mastercard), and bank transfers. All payments are processed securely through our payment partner, Pesapal. You can pay the full amount or make a deposit to secure your booking.",
      },
      {
        question: "Is my payment secure?",
        answer:
          "Yes, absolutely! We use industry-standard encryption and work with certified payment processors to ensure your payment information is completely secure. We never store your full card details on our servers.",
      },
      {
        question: "Can I get a refund if I cancel?",
        answer:
          "Refund policies vary by tour operator. Generally, cancellations made 30+ days before departure receive a full refund minus processing fees. Cancellations within 30 days may receive partial refunds depending on the operator's policy. Please review the specific cancellation policy on each tour page.",
      },
      {
        question: "Do I need to pay a deposit?",
        answer:
          "Most tours require a deposit (typically 30-50% of the total) to secure your booking. The remaining balance is usually due 30 days before your departure date. Specific deposit requirements are shown during the booking process.",
      },
    ],
  },
  {
    category: "Tours & Itineraries",
    icon: "🦁",
    questions: [
      {
        question: "Can I customize my safari itinerary?",
        answer:
          "Yes! Many of our tours offer customization options including accommodation levels, activity add-ons, and flexible itineraries. During booking, you can select your preferences. For major customizations, contact the tour operator directly through our messaging system.",
      },
      {
        question: "What's included in the tour price?",
        answer:
          "Each tour's inclusions are clearly listed on its page. Typically, tours include accommodation, park fees, game drives, most meals, and transport. Exclusions often include international flights, travel insurance, tips, and personal expenses.",
      },
      {
        question: "How many people will be in my group?",
        answer:
          "Group sizes vary by tour. Private tours can be just for you and your travel companions. Group tours typically have 4-12 people. The minimum and maximum group sizes are shown on each tour page.",
      },
      {
        question: "What if I have dietary restrictions?",
        answer:
          "Most operators can accommodate dietary restrictions including vegetarian, vegan, halal, and food allergies. Make sure to specify your requirements in the special requests section during booking.",
      },
      {
        question: "Are tours suitable for families with children?",
        answer:
          "Many tours welcome families! Look for tours marked as 'Family-Friendly' in the filters. Some tours have age restrictions due to the nature of activities (like gorilla trekking which requires participants to be 15+).",
      },
    ],
  },
  {
    category: "Travel Requirements",
    icon: "✈️",
    questions: [
      {
        question: "Do I need a visa?",
        answer:
          "Visa requirements depend on your nationality and destination country. Most visitors to Kenya, Tanzania, Uganda, and Rwanda require a visa, which can usually be obtained online (e-visa) or on arrival. We recommend checking with the respective embassy or consulate before travel.",
      },
      {
        question: "What vaccinations do I need?",
        answer:
          "Yellow fever vaccination is often required or recommended for East Africa. Consult your doctor or a travel clinic about other recommended vaccines (Hepatitis A/B, Typhoid, etc.) and malaria prophylaxis. Carry your vaccination certificate when traveling.",
      },
      {
        question: "Do I need travel insurance?",
        answer:
          "Yes, we strongly recommend comprehensive travel insurance covering medical expenses, trip cancellation, and evacuation. Some tours require proof of insurance. Many of our partner operators offer travel insurance options during booking.",
      },
      {
        question: "What should I pack for a safari?",
        answer:
          "Essentials include: light, neutral-colored clothing, sunscreen, insect repellent, binoculars, camera with zoom lens, comfortable walking shoes, hat, and sunglasses. Most lodges offer laundry service. We'll send you a detailed packing list with your booking confirmation.",
      },
      {
        question: "What's the best time to visit?",
        answer:
          "It depends on what you want to see! The Great Migration in the Serengeti/Masai Mara is July-October. For general wildlife viewing, the dry seasons (June-October and December-February) are ideal. Each tour page shows the best seasons for that specific experience.",
      },
    ],
  },
  {
    category: "SafariPlus Platform",
    icon: "🌍",
    questions: [
      {
        question: "How does SafariPlus work?",
        answer:
          "SafariPlus is a marketplace connecting travelers with verified local tour operators. We provide the platform for browsing, comparing, and booking tours securely. The actual safari experience is provided by our trusted partner operators.",
      },
      {
        question: "Are tour operators verified?",
        answer:
          "Yes! All operators on our platform undergo a thorough verification process. We check licenses, insurance, safety records, and customer reviews. Look for the 'Verified Operator' badge on tour listings.",
      },
      {
        question: "What if I have issues during my trip?",
        answer:
          "You can reach out to your tour operator directly for immediate assistance. You can also contact our 24/7 support team through the messaging system in your dashboard. We're here to ensure you have a smooth experience.",
      },
      {
        question: "How can I leave a review?",
        answer:
          "After completing your tour, you'll receive an email invitation to leave a review. You can also leave a review through your dashboard under 'My Bookings'. Your honest feedback helps other travelers and helps us maintain quality standards.",
      },
      {
        question: "Can tour operators see my contact information?",
        answer:
          "Operators can see the contact information you provide during booking (name, email, phone) so they can communicate with you about your tour. We never share your payment details or other sensitive information.",
      },
    ],
  },
  {
    category: "Becoming an Agent",
    icon: "🤝",
    questions: [
      {
        question: "How can I become a tour operator on SafariPlus?",
        answer:
          "Visit our 'Become an Agent' page and complete the application form. You'll need to provide your business license, insurance details, and company information. Our team will review your application, and if approved, we'll help you set up your operator profile.",
      },
      {
        question: "What are the fees for operators?",
        answer:
          "SafariPlus charges a commission on each booking (typically 12-15% of the tour price). There are no upfront fees or monthly charges. You only pay when you receive bookings through our platform.",
      },
      {
        question: "How do I receive payments as an operator?",
        answer:
          "Payments are transferred to your account after the tour is completed and any refund period has passed. We support M-Pesa and bank transfers. You can withdraw your earnings through your agent dashboard.",
      },
      {
        question: "Can I manage my tours and bookings online?",
        answer:
          "Yes! Our agent dashboard provides a complete management system where you can create and edit tours, manage bookings, communicate with customers, track earnings, and request withdrawals.",
      },
    ],
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0)

  const totalQuestions = faqCategories.reduce((sum, cat) => sum + cat.questions.length, 0)

  return (
    <div className="pt-20">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/30 py-20 lg:py-28 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-20 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <HelpCircle className="h-4 w-4 text-accent" />
              <span className="text-white/90 text-sm font-medium">{totalQuestions}+ Questions Answered</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Frequently Asked{" "}
              <span className="relative">
                <span className="relative z-10 text-accent">Questions</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute bottom-2 left-0 right-0 h-3 bg-accent/30 -z-0 origin-left"
                />
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Everything you need to know about booking safaris with SafariPlus
            </p>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 max-w-md mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-12 rounded-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="py-8 -mt-8 relative z-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {faqCategories.map((category, index) => (
              <motion.a
                key={category.category}
                href={`#${category.category.toLowerCase().replace(/\s+/g, '-')}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="px-4 py-2 rounded-full bg-background border border-border/50 hover:border-primary/30 hover:shadow-premium transition-all duration-300 text-sm font-medium"
              >
                <span className="mr-2">{category.icon}</span>
                {category.category}
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-12">
            {(searchQuery ? filteredCategories : faqCategories).map((category, catIndex) => (
              <motion.div
                key={category.category}
                id={category.category.toLowerCase().replace(/\s+/g, '-')}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{category.icon}</span>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {category.category}
                  </h2>
                  <Badge variant="secondary" className="ml-2">
                    {category.questions.length} questions
                  </Badge>
                </div>
                <Accordion type="single" collapsible className="space-y-3">
                  {category.questions.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <AccordionItem
                        value={`${category.category}-${index}`}
                        className="border border-border/50 rounded-xl px-6 hover:border-primary/30 hover:shadow-md transition-all duration-200 bg-background"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-5">
                          <span className="font-semibold pr-4">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              </motion.div>
            ))}

            {searchQuery && filteredCategories.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">No results found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search or browse all categories
                </p>
                <Button className="mt-4" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl"
          >
            <Card className="border-border/50 hover:shadow-premium-lg transition-all duration-300 overflow-hidden">
              <CardContent className="p-10 text-center relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-0" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -z-0" />

                <div className="relative z-10">
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mb-6">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">24/7 Support</span>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Still Have Questions?
                  </h2>
                  <p className="mt-3 text-muted-foreground text-lg max-w-md mx-auto">
                    Can't find the answer you're looking for? Our customer support
                    team is here to help.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg" className="h-12 px-8 shadow-glow">
                      <Link href="/contact">
                        Contact Us
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="h-12 px-8 border-border/50 hover:border-primary/30" asChild>
                      <Link href="/tours">Browse Tours</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
