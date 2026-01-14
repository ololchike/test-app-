import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { MobileNav } from "@/components/layout/mobile-nav"
import { WhatsAppButton } from "@/components/engagement/whatsapp-button"
import { ExitIntentPopup } from "@/components/engagement/exit-intent-popup"
import { ReturnVisitorBanner } from "@/components/engagement/return-visitor-banner"
import { AbandonedCartBanner } from "@/components/engagement/abandoned-cart-banner"
import { auth } from "@/lib/auth"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Return Visitor Welcome Banner */}
      <ReturnVisitorBanner discountCode="WELCOMEBACK" discountPercent={5} />

      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileNav isAuthenticated={!!session?.user} />

      {/* WhatsApp Floating Button */}
      <WhatsAppButton variant="floating" />

      {/* Exit Intent Popup - Captures leaving visitors */}
      <ExitIntentPopup discountCode="WELCOME10" discountPercent={10} />

      {/* Abandoned Cart Recovery Banner */}
      <AbandonedCartBanner variant="floating" discountCode="COMPLETE5" discountPercent={5} />
    </div>
  )
}
