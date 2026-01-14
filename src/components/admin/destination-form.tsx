"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Save,
  Eye,
  ArrowLeft,
  Globe,
  Image as ImageIcon,
  FileText,
  Settings,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link"

interface DestinationFormProps {
  initialData?: {
    id?: string
    slug: string
    name: string
    country: string
    region: string | null
    heroImage: string | null
    heroTitle: string | null
    heroSubtitle: string | null
    overview: string | null
    highlights: string[]
    wildlife: string | null
    bestTimeToVisit: string | null
    attractions: string | null
    activities: string | null
    accommodation: string | null
    travelTips: string | null
    gettingThere: string | null
    bestMonths: string[]
    avgTemperature: string | null
    currency: string | null
    language: string | null
    timezone: string | null
    visaInfo: string | null
    images: string[]
    videoUrl: string | null
    latitude: number | null
    longitude: number | null
    metaTitle: string | null
    metaDescription: string | null
    metaKeywords: string[]
    isPublished: boolean
    isFeatured: boolean
  }
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  isSubmitting: boolean
}

export function DestinationForm({
  initialData,
  onSubmit,
  isSubmitting,
}: DestinationFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    country: initialData?.country || "",
    region: initialData?.region || "",
    heroImage: initialData?.heroImage || "",
    heroTitle: initialData?.heroTitle || "",
    heroSubtitle: initialData?.heroSubtitle || "",
    overview: initialData?.overview || "",
    highlights: initialData?.highlights?.join("\n") || "",
    wildlife: initialData?.wildlife || "",
    bestTimeToVisit: initialData?.bestTimeToVisit || "",
    attractions: initialData?.attractions || "",
    activities: initialData?.activities || "",
    accommodation: initialData?.accommodation || "",
    travelTips: initialData?.travelTips || "",
    gettingThere: initialData?.gettingThere || "",
    bestMonths: initialData?.bestMonths?.join(", ") || "",
    avgTemperature: initialData?.avgTemperature || "",
    currency: initialData?.currency || "",
    language: initialData?.language || "",
    timezone: initialData?.timezone || "",
    visaInfo: initialData?.visaInfo || "",
    images: initialData?.images?.join("\n") || "",
    videoUrl: initialData?.videoUrl || "",
    latitude: initialData?.latitude?.toString() || "",
    longitude: initialData?.longitude?.toString() || "",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    metaKeywords: initialData?.metaKeywords?.join(", ") || "",
    isPublished: initialData?.isPublished || false,
    isFeatured: initialData?.isFeatured || false,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-generate slug from name
    if (name === "name" && !initialData) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data: Record<string, unknown> = {
      name: formData.name,
      slug: formData.slug,
      country: formData.country,
      region: formData.region || null,
      heroImage: formData.heroImage || null,
      heroTitle: formData.heroTitle || null,
      heroSubtitle: formData.heroSubtitle || null,
      overview: formData.overview || null,
      highlights: formData.highlights
        .split("\n")
        .map((h) => h.trim())
        .filter(Boolean),
      wildlife: formData.wildlife || null,
      bestTimeToVisit: formData.bestTimeToVisit || null,
      attractions: formData.attractions || null,
      activities: formData.activities || null,
      accommodation: formData.accommodation || null,
      travelTips: formData.travelTips || null,
      gettingThere: formData.gettingThere || null,
      bestMonths: formData.bestMonths
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      avgTemperature: formData.avgTemperature || null,
      currency: formData.currency || null,
      language: formData.language || null,
      timezone: formData.timezone || null,
      visaInfo: formData.visaInfo || null,
      images: formData.images
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean),
      videoUrl: formData.videoUrl || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      metaTitle: formData.metaTitle || null,
      metaDescription: formData.metaDescription || null,
      metaKeywords: formData.metaKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      isPublished: formData.isPublished,
      isFeatured: formData.isFeatured,
    }

    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          {initialData?.slug && (
            <Button type="button" variant="outline" asChild>
              <Link href={`/destinations/${initialData.slug}`} target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Link>
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Destination Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Masai Mara"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="e.g., masai-mara"
                    pattern="^[a-z0-9-]+$"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g., Kenya"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    placeholder="e.g., Narok County"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroImage">Hero Image URL</Label>
                <Input
                  id="heroImage"
                  name="heroImage"
                  value={formData.heroImage}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input
                  id="heroTitle"
                  name="heroTitle"
                  value={formData.heroTitle}
                  onChange={handleChange}
                  placeholder="Custom hero title (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Input
                  id="heroSubtitle"
                  name="heroSubtitle"
                  value={formData.heroSubtitle}
                  onChange={handleChange}
                  placeholder="Short tagline"
                />
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Sections
              </CardTitle>
              <CardDescription>
                Write rich content for each section. HTML is supported.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="overview">
                  <AccordionTrigger>Overview (Main Introduction)</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      name="overview"
                      value={formData.overview}
                      onChange={handleChange}
                      placeholder="Write a comprehensive introduction (500+ words recommended for SEO)..."
                      rows={10}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="highlights">
                  <AccordionTrigger>Key Highlights</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      name="highlights"
                      value={formData.highlights}
                      onChange={handleChange}
                      placeholder="Enter one highlight per line..."
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      One highlight per line
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="wildlife">
                  <AccordionTrigger>Wildlife & Animals</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      name="wildlife"
                      value={formData.wildlife}
                      onChange={handleChange}
                      placeholder="Describe the wildlife and animals visitors can see..."
                      rows={8}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="bestTime">
                  <AccordionTrigger>Best Time to Visit</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      name="bestTimeToVisit"
                      value={formData.bestTimeToVisit}
                      onChange={handleChange}
                      placeholder="Describe the best seasons and weather information..."
                      rows={8}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="attractions">
                  <AccordionTrigger>Must-See Attractions</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      name="attractions"
                      value={formData.attractions}
                      onChange={handleChange}
                      placeholder="List and describe the top attractions..."
                      rows={8}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="activities">
                  <AccordionTrigger>Things to Do</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      name="activities"
                      value={formData.activities}
                      onChange={handleChange}
                      placeholder="Describe activities and experiences available..."
                      rows={8}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="accommodation">
                  <AccordionTrigger>Where to Stay</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      name="accommodation"
                      value={formData.accommodation}
                      onChange={handleChange}
                      placeholder="Describe accommodation options..."
                      rows={8}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="travelTips">
                  <AccordionTrigger>Travel Tips</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      name="travelTips"
                      value={formData.travelTips}
                      onChange={handleChange}
                      placeholder="Practical tips for visitors..."
                      rows={8}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="gettingThere">
                  <AccordionTrigger>Getting There</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      name="gettingThere"
                      value={formData.gettingThere}
                      onChange={handleChange}
                      placeholder="How to get to this destination..."
                      rows={8}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="visa">
                  <AccordionTrigger>Visa Information</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      name="visaInfo"
                      value={formData.visaInfo}
                      onChange={handleChange}
                      placeholder="Visa requirements and information..."
                      rows={6}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="images">Image URLs</Label>
                <Textarea
                  id="images"
                  name="images"
                  value={formData.images}
                  onChange={handleChange}
                  placeholder="Enter one image URL per line..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  One URL per line
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="YouTube or Vimeo URL"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Published</Label>
                  <p className="text-xs text-muted-foreground">
                    Make visible to visitors
                  </p>
                </div>
                <Switch
                  checked={formData.isPublished}
                  onCheckedChange={handleSwitchChange("isPublished")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Featured</Label>
                  <p className="text-xs text-muted-foreground">
                    Show on homepage
                  </p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={handleSwitchChange("isFeatured")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Facts */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Facts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bestMonths">Best Months</Label>
                <Input
                  id="bestMonths"
                  name="bestMonths"
                  value={formData.bestMonths}
                  onChange={handleChange}
                  placeholder="July, August, September"
                />
                <p className="text-xs text-muted-foreground">
                  Comma separated
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avgTemperature">Avg Temperature</Label>
                <Input
                  id="avgTemperature"
                  name="avgTemperature"
                  value={formData.avgTemperature}
                  onChange={handleChange}
                  placeholder="20-28°C"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  placeholder="KES"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  placeholder="English, Swahili"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  placeholder="EAT (UTC+3)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Map Coordinates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Map Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="-1.4061"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="35.0167"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  placeholder="Custom page title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  placeholder="Page description for search engines..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Keywords</Label>
                <Input
                  id="metaKeywords"
                  name="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={handleChange}
                  placeholder="safari, kenya, wildlife"
                />
                <p className="text-xs text-muted-foreground">
                  Comma separated
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
