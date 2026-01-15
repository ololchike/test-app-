"use client"

import { useState, useCallback, useRef } from "react"
import { Image as ImageIcon, X, Star, Upload, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useTourForm } from "../tour-form-context"

export function ImagesStep() {
  const { formData, updateFormData } = useTourForm()
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(async (
    file: File,
    setLoading: (v: boolean) => void,
    onSuccess: (url: string) => void
  ) => {
    if (!file) return

    // Validate file
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please upload a valid image (JPG, PNG, or WebP)")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      onSuccess(data.url)
      toast.success("Image uploaded successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCoverUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file, setIsUploadingCover, (url) => {
        updateFormData("coverImage", url)
      })
    }
    e.target.value = ""
  }, [handleUpload, updateFormData])

  const handleGalleryUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remaining = 10 - formData.images.length
    if (files.length > remaining) {
      toast.error(`You can only add ${remaining} more images`)
      return
    }

    setIsUploadingGallery(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      return new Promise<string | null>((resolve) => {
        handleUpload(file, () => {}, (url) => {
          resolve(url)
        })
      })
    })

    Promise.all(uploadPromises).then((urls) => {
      const validUrls = urls.filter((url): url is string => url !== null)
      if (validUrls.length > 0) {
        updateFormData("images", [...formData.images, ...validUrls])
      }
      setIsUploadingGallery(false)
    })

    e.target.value = ""
  }, [formData.images, handleUpload, updateFormData])

  const handleRemoveImage = (url: string) => {
    updateFormData("images", formData.images.filter((img) => img !== url))
  }

  const handleSetAsCover = (url: string) => {
    // Move current cover to gallery if exists
    if (formData.coverImage && !formData.images.includes(formData.coverImage)) {
      updateFormData("images", [...formData.images, formData.coverImage])
    }
    // Remove the new cover from gallery
    updateFormData("images", formData.images.filter((img) => img !== url))
    // Set new cover
    updateFormData("coverImage", url)
  }

  return (
    <div className="space-y-8">
      {/* Cover Image */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg">Cover Image</Label>
          <p className="text-sm text-muted-foreground">
            This is the main image shown in search results and tour cards
          </p>
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverUpload}
          className="hidden"
        />

        {formData.coverImage ? (
          <div className="relative max-w-md">
            <img
              src={formData.coverImage}
              alt="Cover"
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => updateFormData("coverImage", "")}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-2 left-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs">
                <Star className="h-3 w-3 fill-current" />
                Cover Image
              </span>
            </div>
          </div>
        ) : (
          <Card
            className="max-w-md border-dashed cursor-pointer hover:border-primary transition-colors"
            onClick={() => coverInputRef.current?.click()}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                {isUploadingCover ? (
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                )}
                <p className="text-sm font-medium">
                  {isUploadingCover ? "Uploading..." : "Click to Upload Cover Image"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 1200x800px, max 5MB
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gallery Images */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg">Gallery Images</Label>
          <p className="text-sm text-muted-foreground">
            Add more photos to showcase your tour (up to 10 images)
          </p>
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleGalleryUpload}
          className="hidden"
        />

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {/* Existing Images */}
          {formData.images.map((url, index) => (
            <div key={index} className="relative group aspect-[4/3]">
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSetAsCover(url)}
                >
                  Set as Cover
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemoveImage(url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Upload New */}
          {formData.images.length < 10 && (
            <Card
              className="border-dashed aspect-[4/3] cursor-pointer hover:border-primary transition-colors"
              onClick={() => galleryInputRef.current?.click()}
            >
              <CardContent className="p-0 h-full flex flex-col items-center justify-center text-center">
                {isUploadingGallery ? (
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                )}
                <p className="text-xs font-medium">
                  {isUploadingGallery ? "Uploading..." : "Add Images"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {formData.images.length}/10 images uploaded
        </p>
      </div>

      {/* Video URL (Optional) */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg">Video URL (Optional)</Label>
          <p className="text-sm text-muted-foreground">
            Add a YouTube or Vimeo link to showcase your tour
          </p>
        </div>
        <Input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={formData.videoUrl || ""}
          onChange={(e) => updateFormData("videoUrl", e.target.value || undefined)}
          className="max-w-md"
        />
      </div>

      {/* Tips */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-sm">
        <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">Photo Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
          <li>Use high-quality, well-lit photos</li>
          <li>Show diverse aspects: landscapes, wildlife, accommodations, activities</li>
          <li>Include photos of guests enjoying the experience</li>
          <li>Avoid overly edited or filtered images</li>
        </ul>
      </div>
    </div>
  )
}
