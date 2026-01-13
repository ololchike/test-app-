import Link from "next/link"
import { Shield } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-secondary py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mt-4 sm:mt-6 text-3xl sm:text-4xl font-bold tracking-tight lg:text-5xl">
                Privacy Policy
              </h1>
              <p className="mt-4 text-muted-foreground">
                Last updated: January 12, 2026
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 sm:py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl prose prose-slate">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold">1. Introduction</h2>
                  <p className="text-muted-foreground mt-4">
                    Welcome to SafariPlus ("we," "our," or "us"). We are committed to
                    protecting your personal information and your right to privacy. This
                    Privacy Policy explains how we collect, use, disclose, and safeguard
                    your information when you use our website and services.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">2. Information We Collect</h2>
                  <div className="mt-4 space-y-4 text-muted-foreground">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        2.1 Personal Information
                      </h3>
                      <p>
                        We collect personal information that you voluntarily provide when
                        registering, making a booking, or contacting us. This includes:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Name and contact information (email, phone number)</li>
                        <li>Account credentials</li>
                        <li>Payment information</li>
                        <li>Travel preferences and booking details</li>
                        <li>Communication preferences</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        2.2 Automatically Collected Information
                      </h3>
                      <p>
                        When you visit our website, we automatically collect certain
                        information, including:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>IP address and browser type</li>
                        <li>Device information</li>
                        <li>Usage data and browsing behavior</li>
                        <li>Cookies and similar tracking technologies</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
                  <div className="mt-4 text-muted-foreground">
                    <p>We use your information to:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Process and manage your bookings</li>
                      <li>Communicate with you about your reservations</li>
                      <li>Send booking confirmations and updates</li>
                      <li>Provide customer support</li>
                      <li>Process payments and prevent fraud</li>
                      <li>Improve our services and website functionality</li>
                      <li>Send marketing communications (with your consent)</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">4. Sharing Your Information</h2>
                  <div className="mt-4 space-y-4 text-muted-foreground">
                    <p>We may share your information with:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>
                        <strong>Tour Operators:</strong> We share booking details with
                        the tour operators you book with to fulfill your reservation
                      </li>
                      <li>
                        <strong>Payment Processors:</strong> To process your payments
                        securely
                      </li>
                      <li>
                        <strong>Service Providers:</strong> Third-party companies that
                        help us operate our business
                      </li>
                      <li>
                        <strong>Legal Requirements:</strong> When required by law or to
                        protect our rights
                      </li>
                    </ul>
                    <p className="mt-4">
                      We never sell your personal information to third parties for
                      marketing purposes.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">5. Data Security</h2>
                  <p className="text-muted-foreground mt-4">
                    We implement appropriate technical and organizational measures to
                    protect your personal information against unauthorized access,
                    alteration, disclosure, or destruction. This includes:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                    <li>Encryption of sensitive data</li>
                    <li>Regular security assessments</li>
                    <li>Secure payment processing through certified providers</li>
                    <li>Access controls and authentication measures</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">6. Cookies and Tracking</h2>
                  <p className="text-muted-foreground mt-4">
                    We use cookies and similar tracking technologies to enhance your
                    experience, analyze usage patterns, and deliver personalized content.
                    You can control cookie preferences through your browser settings.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">7. Your Privacy Rights</h2>
                  <div className="mt-4 text-muted-foreground">
                    <p>You have the right to:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Access your personal information</li>
                      <li>Correct inaccurate data</li>
                      <li>Request deletion of your data</li>
                      <li>Opt-out of marketing communications</li>
                      <li>Object to certain processing activities</li>
                      <li>Data portability</li>
                    </ul>
                    <p className="mt-4">
                      To exercise these rights, please contact us at{" "}
                      <a
                        href="mailto:privacy@safariplus.com"
                        className="text-primary hover:underline"
                      >
                        privacy@safariplus.com
                      </a>
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">8. Data Retention</h2>
                  <p className="text-muted-foreground mt-4">
                    We retain your personal information only for as long as necessary to
                    fulfill the purposes outlined in this policy, comply with legal
                    obligations, resolve disputes, and enforce our agreements.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">9. Children's Privacy</h2>
                  <p className="text-muted-foreground mt-4">
                    Our services are not intended for children under 16 years of age. We
                    do not knowingly collect personal information from children. If you
                    believe we have collected information from a child, please contact us
                    immediately.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">10. International Data Transfers</h2>
                  <p className="text-muted-foreground mt-4">
                    Your information may be transferred to and processed in countries
                    other than your country of residence. We ensure appropriate
                    safeguards are in place to protect your information in accordance
                    with this Privacy Policy.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">11. Changes to This Policy</h2>
                  <p className="text-muted-foreground mt-4">
                    We may update this Privacy Policy from time to time. We will notify
                    you of any significant changes by posting the new policy on our
                    website and updating the "Last updated" date. We encourage you to
                    review this policy periodically.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">12. Contact Us</h2>
                  <div className="mt-4 text-muted-foreground">
                    <p>
                      If you have questions or concerns about this Privacy Policy, please
                      contact us:
                    </p>
                    <div className="mt-4 space-y-2">
                      <p>
                        <strong>Email:</strong>{" "}
                        <a
                          href="mailto:privacy@safariplus.com"
                          className="text-primary hover:underline"
                        >
                          privacy@safariplus.com
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
                  For more information about our services, please visit our{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  or{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    contact us
                  </Link>
                  .
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
