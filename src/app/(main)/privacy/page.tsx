import Link from "next/link"
import { Shield } from "lucide-react"
import { format } from "date-fns"
import { prisma } from "@/lib/prisma"
import { RichTextViewer } from "@/components/ui/rich-text-viewer"

async function getPrivacyContent() {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key: "privacy-policy" },
    })
    return content
  } catch {
    return null
  }
}

export default async function PrivacyPolicyPage() {
  const dbContent = await getPrivacyContent()
  const lastUpdated = dbContent?.updatedAt
    ? format(new Date(dbContent.updatedAt), "MMMM d, yyyy")
    : "January 12, 2026"

  return (
    <>
      {/* Header */}
      <section className="bg-secondary py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-4 sm:mt-6 text-3xl sm:text-4xl font-bold tracking-tight lg:text-5xl">
              {dbContent?.title || "Privacy Policy"}
            </h1>
            <p className="mt-4 text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {dbContent?.content ? (
              <RichTextViewer content={dbContent.content} />
            ) : (
              <DefaultPrivacyContent />
            )}

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
    </>
  )
}

function DefaultPrivacyContent() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
      <div>
        <h2 className="text-2xl font-bold">1. Introduction</h2>
        <p className="text-muted-foreground mt-4">
          Welcome to SafariPlus (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed
          to protecting your personal information and your right to privacy. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information when you use our
          website and services.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold">2. Information We Collect</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <div>
            <h3 className="text-lg font-semibold text-foreground">2.1 Personal Information</h3>
            <p>
              We collect personal information that you voluntarily provide when registering, making
              a booking, or contacting us. This includes:
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
              When you visit our website, we automatically collect certain information, including:
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
        <h2 className="text-2xl font-bold">4. Contact Us</h2>
        <div className="mt-4 text-muted-foreground">
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us at{" "}
            <a href="mailto:privacy@safariplus.com" className="text-primary hover:underline">
              privacy@safariplus.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
