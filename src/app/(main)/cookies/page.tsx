import Link from "next/link"
import { Cookie } from "lucide-react"
import { format } from "date-fns"
import { prisma } from "@/lib/prisma"
import { RichTextViewer } from "@/components/ui/rich-text-viewer"
import { SectionError } from "@/components/error"

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
      <SectionError name="Cookies Policy Header">
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
      </SectionError>

      {/* Content */}
      <SectionError name="Cookies Policy Content">
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {dbContent?.content ? (
              <RichTextViewer content={dbContent.content} />
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
      </SectionError>
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
        <h2 className="text-2xl font-bold">3. Managing Cookies</h2>
        <div className="mt-4 text-muted-foreground">
          <p>
            Most web browsers allow you to control cookies through their settings. You can usually
            find these in the &quot;Options&quot; or &quot;Preferences&quot; menu of your browser.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold">4. Contact Us</h2>
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
