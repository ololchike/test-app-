"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DestinationForm } from "@/components/admin/destination-form"
import { toast } from "sonner"

export default function NewDestinationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/admin/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create destination")
      }

      toast.success("Destination created successfully")
      router.push(`/admin/destinations/${result.destination.id}`)
    } catch (error) {
      console.error("Error creating destination:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create destination")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Destination Guide</h1>
        <p className="text-muted-foreground">
          Create a rich destination guide to improve SEO and help visitors discover tours
        </p>
      </div>

      <DestinationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}
