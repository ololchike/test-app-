"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { DestinationForm } from "@/components/admin/destination-form"
import { DestinationFAQManager } from "@/components/admin/destination-faq-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface DestinationFAQ {
  id: string
  question: string
  answer: string
  order: number
  isPublished: boolean
}

interface Destination {
  id: string
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
  faqs: DestinationFAQ[]
}

export default function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [destination, setDestination] = useState<Destination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchDestination = async () => {
    try {
      const response = await fetch(`/api/admin/destinations/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch destination")
      }

      setDestination(data.destination)
    } catch (error) {
      console.error("Error fetching destination:", error)
      toast.error("Failed to load destination")
      router.push("/admin/destinations")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDestination()
  }, [id])

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/admin/destinations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update destination")
      }

      setDestination(result.destination)
      toast.success("Destination updated successfully")
    } catch (error) {
      console.error("Error updating destination:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to update destination"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    )
  }

  if (!destination) {
    return null
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit: {destination.name}</h1>
        <p className="text-muted-foreground">
          Update the destination guide content and SEO settings
        </p>
      </div>

      <Tabs defaultValue="content">
        <TabsList className="mb-6">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="faqs">FAQs ({destination.faqs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <DestinationForm
            initialData={destination}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </TabsContent>

        <TabsContent value="faqs">
          <DestinationFAQManager
            destinationId={id}
            faqs={destination.faqs}
            onUpdate={fetchDestination}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
