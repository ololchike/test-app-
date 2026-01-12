import Link from "next/link"
import { HelpCircle, Mail } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const faqCategories = [
  {
    category: "Booking & Payments",
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
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-secondary py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Frequently Asked Questions
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to know about booking safaris with SafariPlus
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-12">
              {faqCategories.map((category) => (
                <div key={category.category}>
                  <h2 className="text-2xl font-bold tracking-tight mb-6">
                    {category.category}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`${category.category}-${index}`}
                        className="border rounded-lg px-6"
                      >
                        <AccordionTrigger className="text-left hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="mx-auto h-12 w-12 text-primary" />
                  <h2 className="mt-4 text-2xl font-bold">
                    Still Have Questions?
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Can't find the answer you're looking for? Our customer support
                    team is here to help.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-4">
                    <Button asChild>
                      <Link href="/contact">Contact Us</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/tours">Browse Tours</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
