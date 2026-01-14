"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Star, Camera, X, Loader2, Gift, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ReviewIncentiveBanner } from "./review-incentive-banner"
import { REFERRAL_CONFIG } from "@/lib/referral"

interface ReviewFormProps {
  bookingId: string
  tourTitle: string
  onSuccess?: () => void
}

export function ReviewForm({ bookingId, tourTitle, onSuccess }: ReviewFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 images")
      return
    }

    setUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB.`)
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image file.`)
        }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", "reviews")

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to upload image")
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setImages((prev) => [...prev, ...uploadedUrls])
      toast.success(`${uploadedUrls.length} image(s) uploaded`)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload images")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (content.trim().length < 10) {
      toast.error("Review must be at least 10 characters")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
          images,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const reward = data.reward
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-medium">Review submitted successfully!</span>
            {reward && (
              <span className="text-sm flex items-center gap-1">
                <Gift className="h-4 w-4 text-green-600" />
                You earned ${reward.amount} credit
                {reward.hasPhotoBonus && " (includes photo bonus!)"}
              </span>
            )}
          </div>,
          { duration: 5000 }
        )
        setRating(0)
        setTitle("")
        setContent("")
        setImages([])
        if (onSuccess) {
          onSuccess()
        }
        router.refresh()
      } else {
        toast.error(data.error || "Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const potentialReward = images.length > 0
    ? REFERRAL_CONFIG.reviewCredit + REFERRAL_CONFIG.photoBonus
    : REFERRAL_CONFIG.reviewCredit

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience with {tourTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Incentive Banner */}
        <ReviewIncentiveBanner variant="compact" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Selector */}
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} out of 5 stars
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/100 characters
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Review</Label>
            <Textarea
              id="content"
              placeholder="Tell us about your tour experience..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={2000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/2000 characters (minimum 10)
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Add Photos</Label>
              {images.length === 0 && (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <Gift className="h-3 w-3" />
                  +${REFERRAL_CONFIG.photoBonus} bonus for photos
                </span>
              )}
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {images.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                    <Image
                      src={url}
                      alt={`Review image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || images.length >= 5}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    {images.length > 0 ? "Add More Photos" : "Upload Photos"}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                {images.length}/5 images
              </p>
            </div>
          </div>

          {/* Reward Preview */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              You&apos;ll earn for this review:
            </span>
            <span className="text-lg font-bold text-green-700 dark:text-green-300">
              ${potentialReward}
            </span>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={submitting || rating === 0} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
