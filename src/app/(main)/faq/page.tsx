import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { FAQPageClient } from "./faq-client"

export const metadata: Metadata = {
  title: "Frequently Asked Questions | SafariPlus",
  description: "Find answers to common questions about booking safari tours, payments, cancellations, and more. Get help planning your East African adventure.",
}

// Fallback FAQs if database is empty
const defaultFaqCategories = [
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

// Category labels for display
const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  general: { label: "General Questions", icon: "🌍" },
  booking: { label: "Booking & Payments", icon: "💳" },
  payment: { label: "Payment & Pricing", icon: "💰" },
  tours: { label: "Tours & Itineraries", icon: "🦁" },
  cancellation: { label: "Cancellation & Refunds", icon: "📅" },
  safety: { label: "Travel Requirements", icon: "✈️" },
}

async function getFAQsFromDB() {
  try {
    const faqs = await prisma.siteFAQ.findMany({
      where: { isPublished: true },
      orderBy: [
        { category: "asc" },
        { order: "asc" },
      ],
    })
    return faqs
  } catch {
    return []
  }
}

export default async function FAQPage() {
  const dbFaqs = await getFAQsFromDB()

  // Convert DB FAQs to category format if we have them
  let faqCategories = defaultFaqCategories

  if (dbFaqs.length > 0) {
    // Group by category
    const grouped = dbFaqs.reduce((acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = []
      }
      acc[faq.category].push({
        question: faq.question,
        answer: faq.answer,
      })
      return acc
    }, {} as Record<string, { question: string; answer: string }[]>)

    // Convert to category format
    faqCategories = Object.entries(grouped).map(([category, questions]) => ({
      category: CATEGORY_LABELS[category]?.label || category,
      icon: CATEGORY_LABELS[category]?.icon || "❓",
      questions,
    }))
  }

  // Generate FAQ Schema JSON-LD for SEO
  const allQuestions = faqCategories.flatMap(cat => cat.questions)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allQuestions.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      {/* FAQ Schema JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FAQPageClient faqCategories={faqCategories} />
    </>
  )
}
