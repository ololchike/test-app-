import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PromoCodeCreator } from "@/components/agent/promo-code-creator"
import {
  ShareLinksSection,
  QRCodesSection,
  EmbedWidgetSection,
} from "@/components/agent/marketing-tools"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tag, Share2, QrCode, Code2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Marketing Tools | SafariPlus Agent",
  description: "Manage your promo codes and marketing tools",
}

export default async function MarketingPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Get agent
  const agent = await prisma.agent.findUnique({
    where: { userId: session.user.id },
  })

  if (!agent) {
    redirect("/become-agent")
  }

  // Get agent's tours
  const tours = await prisma.tour.findMany({
    where: {
      agentId: agent.id,
      status: "ACTIVE",
    },
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: { title: "asc" },
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://safariplus.com"

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketing Tools</h1>
        <p className="text-muted-foreground">
          Boost your bookings with promo codes, QR codes, and shareable links
        </p>
      </div>

      <Tabs defaultValue="promo-codes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="promo-codes" className="gap-2">
            <Tag className="h-4 w-4" />
            Promo Codes
          </TabsTrigger>
          <TabsTrigger value="share-links" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share Links
          </TabsTrigger>
          <TabsTrigger value="qr-codes" className="gap-2">
            <QrCode className="h-4 w-4" />
            QR Codes
          </TabsTrigger>
          <TabsTrigger value="widgets" className="gap-2">
            <Code2 className="h-4 w-4" />
            Embed Widget
          </TabsTrigger>
        </TabsList>

        <TabsContent value="promo-codes">
          <PromoCodeCreator tours={tours} />
        </TabsContent>

        <TabsContent value="share-links">
          <ShareLinksSection agentId={agent.id} tours={tours} baseUrl={baseUrl} />
        </TabsContent>

        <TabsContent value="qr-codes">
          <QRCodesSection tours={tours} baseUrl={baseUrl} />
        </TabsContent>

        <TabsContent value="widgets">
          <EmbedWidgetSection agentId={agent.id} baseUrl={baseUrl} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
