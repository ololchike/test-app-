import Link from "next/link"
import { FileText } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-secondary py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Terms of Service
              </h1>
              <p className="mt-4 text-muted-foreground">
                Last updated: January 12, 2026
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-4xl prose prose-slate">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
                  <p className="text-muted-foreground mt-4">
                    By accessing and using SafariPlus ("Platform," "Service," "we," "us,"
                    or "our"), you agree to be bound by these Terms of Service ("Terms").
                    If you disagree with any part of these terms, you may not access the
                    Service.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">2. Description of Service</h2>
                  <p className="text-muted-foreground mt-4">
                    SafariPlus is a marketplace platform that connects travelers with
                    verified tour operators in East Africa. We facilitate bookings but do
                    not operate tours ourselves. The actual safari experiences are
                    provided by independent tour operators.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">3. User Accounts</h2>
                  <div className="mt-4 space-y-4 text-muted-foreground">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        3.1 Account Creation
                      </h3>
                      <p>
                        To book tours, you must create an account. You agree to provide
                        accurate, current, and complete information and to update it as
                        necessary.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        3.2 Account Security
                      </h3>
                      <p>
                        You are responsible for maintaining the confidentiality of your
                        account credentials and for all activities under your account. You
                        must notify us immediately of any unauthorized access or security
                        breaches.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        3.3 Account Termination
                      </h3>
                      <p>
                        We reserve the right to suspend or terminate accounts that violate
                        these Terms or engage in fraudulent, abusive, or illegal
                        activities.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">4. Bookings and Payments</h2>
                  <div className="mt-4 space-y-4 text-muted-foreground">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        4.1 Booking Process
                      </h3>
                      <p>
                        When you book a tour, you enter into a direct contract with the
                        tour operator. SafariPlus facilitates the transaction but is not a
                        party to the agreement between you and the operator.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        4.2 Pricing
                      </h3>
                      <p>
                        All prices are listed in USD unless otherwise stated. Prices
                        include applicable taxes but may exclude optional add-ons. Prices
                        are subject to change until booking is confirmed.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        4.3 Payment Terms
                      </h3>
                      <p>
                        Payment is required to confirm bookings. We accept various payment
                        methods through secure payment processors. Full payment terms are
                        provided during checkout.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        4.4 Platform Commission
                      </h3>
                      <p>
                        SafariPlus charges tour operators a commission for bookings made
                        through the platform. This commission is included in the tour
                        price displayed to travelers.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">5. Cancellations and Refunds</h2>
                  <div className="mt-4 space-y-4 text-muted-foreground">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        5.1 Cancellation Policy
                      </h3>
                      <p>
                        Each tour has its own cancellation policy set by the operator.
                        Review the specific policy before booking. Generally:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>30+ days before departure: Full refund minus processing fees</li>
                        <li>15-29 days before departure: 50% refund</li>
                        <li>Less than 15 days: No refund</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        5.2 Refund Processing
                      </h3>
                      <p>
                        Approved refunds are processed within 10-14 business days to the
                        original payment method. Processing fees may apply.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        5.3 Force Majeure
                      </h3>
                      <p>
                        Neither party is liable for failure to perform due to
                        circumstances beyond reasonable control (natural disasters,
                        pandemics, war, etc.). Alternative arrangements or credits may be
                        offered.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">6. User Responsibilities</h2>
                  <div className="mt-4 text-muted-foreground">
                    <p>You agree to:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Provide accurate information when booking</li>
                      <li>Comply with visa and health requirements</li>
                      <li>Obtain necessary travel insurance</li>
                      <li>Follow operator instructions and local laws</li>
                      <li>Treat operators, guides, and other travelers respectfully</li>
                      <li>Leave honest reviews based on actual experiences</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">7. Operator Responsibilities</h2>
                  <div className="mt-4 text-muted-foreground">
                    <p>Tour operators on our platform must:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Maintain valid licenses and insurance</li>
                      <li>Provide accurate tour information</li>
                      <li>Deliver services as described</li>
                      <li>Communicate promptly with customers</li>
                      <li>Honor cancellation policies</li>
                      <li>Comply with all applicable laws and regulations</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">8. Limitation of Liability</h2>
                  <div className="mt-4 space-y-4 text-muted-foreground">
                    <p>
                      SafariPlus acts as a marketplace platform only. We are not
                      responsible for:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Actions or omissions of tour operators</li>
                      <li>Quality or safety of tours provided</li>
                      <li>Injuries, losses, or damages during tours</li>
                      <li>Travel delays or cancellations</li>
                      <li>Disputes between travelers and operators</li>
                    </ul>
                    <p className="mt-4">
                      To the maximum extent permitted by law, our liability is limited to
                      the amount you paid for the booking through our platform.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">9. Intellectual Property</h2>
                  <p className="text-muted-foreground mt-4">
                    All content on SafariPlus (text, images, logos, designs, software) is
                    owned by SafariPlus or our licensors and protected by copyright,
                    trademark, and other intellectual property laws. You may not copy,
                    reproduce, or distribute our content without permission.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">10. Reviews and Content</h2>
                  <div className="mt-4 space-y-4 text-muted-foreground">
                    <p>
                      By posting reviews or content, you grant us a non-exclusive,
                      worldwide, royalty-free license to use, display, and distribute your
                      content. You agree that reviews will be:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Based on genuine experiences</li>
                      <li>Honest and not misleading</li>
                      <li>Free from offensive or inappropriate content</li>
                      <li>Compliant with applicable laws</li>
                    </ul>
                    <p className="mt-4">
                      We reserve the right to remove reviews that violate these guidelines.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">11. Privacy</h2>
                  <p className="text-muted-foreground mt-4">
                    Your use of SafariPlus is also governed by our{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    . Please review it to understand how we collect, use, and protect your
                    information.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">12. Dispute Resolution</h2>
                  <div className="mt-4 text-muted-foreground">
                    <p>
                      In case of disputes between travelers and operators, we encourage
                      direct communication first. If unresolved, you may contact our
                      support team for assistance.
                    </p>
                    <p className="mt-4">
                      Any legal disputes arising from these Terms will be governed by the
                      laws of Kenya and resolved in Kenyan courts.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">13. Changes to Terms</h2>
                  <p className="text-muted-foreground mt-4">
                    We may modify these Terms at any time. We will notify users of
                    significant changes via email or platform notification. Continued use
                    of the Service after changes constitutes acceptance of the updated
                    Terms.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">14. Severability</h2>
                  <p className="text-muted-foreground mt-4">
                    If any provision of these Terms is found to be unenforceable or
                    invalid, that provision will be limited or eliminated to the minimum
                    extent necessary while the remainder of these Terms remains in full
                    effect.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">15. Contact Information</h2>
                  <div className="mt-4 text-muted-foreground">
                    <p>For questions about these Terms, please contact us:</p>
                    <div className="mt-4 space-y-2">
                      <p>
                        <strong>Email:</strong>{" "}
                        <a
                          href="mailto:legal@safariplus.com"
                          className="text-primary hover:underline"
                        >
                          legal@safariplus.com
                        </a>
                      </p>
                      <p>
                        <strong>Address:</strong> SafariPlus, Nairobi, Kenya
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        <a
                          href="tel:+254700000000"
                          className="text-primary hover:underline"
                        >
                          +254 700 000 000
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t">
                <p className="text-sm text-muted-foreground">
                  By using SafariPlus, you acknowledge that you have read, understood, and
                  agree to be bound by these Terms of Service.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
