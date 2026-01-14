"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Share2, QrCode, Code2, Copy, Check } from "lucide-react"

interface Tour {
  id: string
  title: string
  slug: string
}

// Share Links Section Component
export function ShareLinksSection({
  agentId,
  tours,
  baseUrl,
}: {
  agentId: string
  tours: Tour[]
  baseUrl: string
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Shareable Links</h2>
        <p className="text-sm text-muted-foreground">
          Share these links on social media, WhatsApp, or email to drive traffic to your tours
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Agent Profile Link */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Agent Profile</CardTitle>
            <CardDescription>
              Share your complete profile showing all your tours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShareLinkInput url={`${baseUrl}/operators/${agentId}`} />
          </CardContent>
        </Card>

        {/* Individual Tour Links */}
        {tours.slice(0, 5).map((tour) => (
          <Card key={tour.id}>
            <CardHeader>
              <CardTitle className="text-base truncate">{tour.title}</CardTitle>
              <CardDescription>Direct link to this tour</CardDescription>
            </CardHeader>
            <CardContent>
              <ShareLinkInput url={`${baseUrl}/tours/${tour.slug}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {tours.length > 5 && (
        <p className="text-sm text-muted-foreground text-center">
          And {tours.length - 5} more tours...
        </p>
      )}
    </div>
  )
}

// Share Link Input Component
function ShareLinkInput({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaWhatsApp = () => {
    const message = `Check out this safari tour: ${url}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={url}
        readOnly
        className="text-sm"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <Button
        size="sm"
        onClick={shareViaWhatsApp}
        className="bg-green-600 hover:bg-green-700"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

// QR Codes Section
export function QRCodesSection({ tours, baseUrl }: { tours: Tour[]; baseUrl: string }) {
  const downloadQRCode = (tourSlug: string, tourTitle: string) => {
    // Generate QR code URL using a free QR code API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${baseUrl}/tours/${tourSlug}`)}`

    // Create a link and trigger download
    const link = document.createElement("a")
    link.href = qrUrl
    link.download = `qr-${tourTitle.toLowerCase().replace(/\s+/g, "-")}.png`
    link.target = "_blank"
    link.click()

    toast.success("QR code download started!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">QR Codes</h2>
        <p className="text-sm text-muted-foreground">
          Generate QR codes for your tours to use in print materials, brochures, or business cards
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <Card key={tour.id}>
            <CardHeader>
              <CardTitle className="text-base truncate">{tour.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(`${baseUrl}/tours/${tour.slug}`)}`}
                  alt={`QR code for ${tour.title}`}
                  className="w-full h-full"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mb-2 truncate max-w-full">
                {baseUrl}/tours/{tour.slug}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadQRCode(tour.slug, tour.title)}
              >
                Download QR Code
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {tours.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <QrCode className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="font-medium">No published tours</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Publish a tour to generate QR codes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Embed Widget Section
export function EmbedWidgetSection({ agentId, baseUrl }: { agentId: string; baseUrl: string }) {
  const [copied, setCopied] = useState(false)
  const embedCode = `<iframe src="${baseUrl}/embed/operators/${agentId}" width="100%" height="500" frameborder="0"></iframe>`

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    toast.success("Embed code copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Embeddable Widget</h2>
        <p className="text-sm text-muted-foreground">
          Add this widget to your website to showcase your tours directly on your own site
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Embed Code</CardTitle>
          <CardDescription>
            Copy this code and paste it into your website&apos;s HTML
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <code className="text-sm break-all">{embedCode}</code>
          </div>
          <Button variant="outline" onClick={copyEmbedCode}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied!" : "Copy Code"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>
            This is how your widget will look on other websites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg bg-muted/50 h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Code2 className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm">Widget Preview</p>
              <p className="text-xs">Shows your latest tours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
