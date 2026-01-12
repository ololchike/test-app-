import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { MobileNav } from "@/components/layout/mobile-nav"
import { auth } from "@/lib/auth"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileNav isAuthenticated={!!session?.user} />
    </div>
  )
}
