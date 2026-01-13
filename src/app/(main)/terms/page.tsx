import Link from "next/link"
import { FileText } from "lucide-react"
import { format } from "date-fns"
import { prisma } from "@/lib/prisma"
import { RichTextViewer } from "@/components/ui/rich-text-viewer"

async function getTermsContent() {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key: "terms-of-service" },
    })
    return content
  } catch {
    return null
  }
}

export default async function TermsOfServicePage() {
  const dbContent = await getTermsContent()
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
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-4 sm:mt-6 text-3xl sm:text-4xl font-bold tracking-tight lg:text-5xl">
              {dbContent?.title || "Terms of Service"}
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
              <DefaultTermsContent />
            )}

            <div className="mt-12 pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                By using SafariPlus, you acknowledge that you have read, understood, and agree to be
                bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function DefaultTermsContent() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
      <div>
        <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
        <p className="text-muted-foreground mt-4">
          By accessing and using SafariPlus (&quot;Platform,&quot; &quot;Service,&quot;
          &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms
          of Service (&quot;Terms&quot;). If you disagree with any part of these terms, you may not
          access the Service.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold">2. Description of Service</h2>
        <p className="text-muted-foreground mt-4">
          SafariPlus is a marketplace platform that connects travelers with verified tour operators
          in East Africa. We facilitate bookings but do not operate tours ourselves. The actual
          safari experiences are provided by independent tour operators.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold">3. User Accounts</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <div>
            <h3 className="text-lg font-semibold text-foreground">3.1 Account Creation</h3>
            <p>
              To book tours, you must create an account. You agree to provide accurate, current, and
              complete information and to update it as necessary.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">3.2 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities under your account. You must notify us immediately of any
              unauthorized access or security breaches.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold">4. Bookings and Payments</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>
            When you book a tour, you enter into a direct contract with the tour operator.
            SafariPlus facilitates the transaction but is not a party to the agreement between you
            and the operator.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold">5. Contact Information</h2>
        <div className="mt-4 text-muted-foreground">
          <p>For questions about these Terms, please contact us:</p>
          <div className="mt-4 space-y-2">
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:legal@safariplus.com" className="text-primary hover:underline">
                legal@safariplus.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          See also our{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/cookies" className="text-primary hover:underline">
            Cookies Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
