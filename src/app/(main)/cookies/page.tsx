import Link from "next/link"
import { Cookie } from "lucide-react"
import { format } from "date-fns"
import { prisma } from "@/lib/prisma"

async function getCookiesContent() {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key: "cookies-policy" },
    })
    return content
  } catch {
    return null
  }
}

export default async function CookiesPolicyPage() {
  const dbContent = await getCookiesContent()
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
              <Cookie className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-4 sm:mt-6 text-3xl sm:text-4xl font-bold tracking-tight lg:text-5xl">
              {dbContent?.title || "Cookies Policy"}
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
              <div
                className="prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: dbContent.content }}
              />
            ) : (
              <DefaultCookiesContent />
            )}

            <div className="mt-12 pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                For more information about how we handle your data, please see our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
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

function DefaultCookiesContent() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
      <div>
        <h2 className="text-2xl font-bold">1. What Are Cookies</h2>
        <p className="text-muted-foreground mt-4">
          Cookies are small text files that are placed on your computer or mobile device when you
          visit a website. They are widely used to make websites work more efficiently and provide
          information to the website owners.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold">2. How We Use Cookies</h2>
        <div className="mt-4 text-muted-foreground">
          <p>SafariPlus uses cookies for several purposes:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              <strong>Essential Cookies:</strong> These are necessary for the website to function
              properly. They enable basic features like page navigation and access to secure areas.
            </li>
            <li>
              <strong>Authentication Cookies:</strong> We use these to remember when you&apos;re
              logged in so you don&apos;t have to log in every time you visit.
            </li>
            <li>
              <strong>Preference Cookies:</strong> These remember your settings and preferences,
              such as language and region.
            </li>
            <li>
              <strong>Analytics Cookies:</strong> We use these to understand how visitors interact
              with our website, helping us improve our services.
            </li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold">3. Types of Cookies We Use</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <div>
            <h3 className="text-lg font-semibold text-foreground">3.1 Session Cookies</h3>
            <p>
              These are temporary cookies that expire when you close your browser. They are used to
              maintain your session while you navigate our website.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">3.2 Persistent Cookies</h3>
            <p>
              These remain on your device for a set period. They help us remember your preferences
              and improve your experience on future visits.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">3.3 Third-Party Cookies</h3>
            <p>
              We may use third-party services that set their own cookies, such as payment
              processors and analytics providers. These cookies are governed by the respective
              third parties&apos; privacy policies.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold">4. Managing Cookies</h2>
        <div className="mt-4 text-muted-foreground">
          <p>
            Most web browsers allow you to control cookies through their settings. You can usually
            find these in the &quot;Options&quot; or &quot;Preferences&quot; menu of your browser.
            You can:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>View what cookies are stored on your device</li>
            <li>Delete some or all cookies</li>
            <li>Block cookies from specific websites</li>
            <li>Block all cookies from being set</li>
            <li>Clear all cookies when you close your browser</li>
          </ul>
          <p className="mt-4">
            Please note that if you choose to block or delete cookies, some parts of our website
            may not function properly.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold">5. Cookie Duration</h2>
        <div className="mt-4 text-muted-foreground">
          <p>The cookies we use have different durations:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Session cookies: Deleted when you close your browser</li>
            <li>Authentication cookies: Typically last 24 hours to 30 days</li>
            <li>Preference cookies: May persist for up to 1 year</li>
            <li>Analytics cookies: Typically persist for 1-2 years</li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold">6. Updates to This Policy</h2>
        <p className="text-muted-foreground mt-4">
          We may update this Cookies Policy from time to time to reflect changes in technology or
          legislation, or for other operational reasons. Please check this page periodically for
          any updates.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold">7. Contact Us</h2>
        <div className="mt-4 text-muted-foreground">
          <p>
            If you have questions about our use of cookies, please contact us at{" "}
            <a href="mailto:privacy@safariplus.com" className="text-primary hover:underline">
              privacy@safariplus.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
