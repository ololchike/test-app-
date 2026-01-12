"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Upload, X, Loader2, Image as ImageIcon, Library, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Image from "next/image"
import { MediaLibraryDialog } from "@/components/ui/media-library-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
  disabled?: boolean
  className?: string
}

export function ImageUploader({
  value = [],
  onChange,
  maxFiles = 10,
  disabled = false,
  className,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<{ url: string; index: number } | null>(null)
  const [deletingFromCloudinary, setDeletingFromCloudinary] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Use ref to always have current value
  const currentValueRef = useRef(value)
  useEffect(() => {
    currentValueRef.current = value
  }, [value])

  const handleFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files)
      const currentImages = currentValueRef.current

      // Check max files limit
      if (currentImages.length + fileArray.length > maxFiles) {
        toast.error(`You can only upload up to ${maxFiles} images`)
        return
      }

      // Validate files
      const validFiles: File[] = []
      for (const file of fileArray) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          toast.error(`${file.name} is not a valid image format`)
          continue
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit`)
          continue
        }
        validFiles.push(file)
      }

      if (validFiles.length === 0) return

      setUploadingCount(validFiles.length)

      // Upload all files
      const uploadPromises = validFiles.map(async (file) => {
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

          return data.url as string
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`)
          return null
        }
      })

      const results = await Promise.all(uploadPromises)
      const successfulUrls = results.filter((url): url is string => url !== null)

      setUploadingCount(0)

      if (successfulUrls.length > 0) {
        // Get current value again to avoid stale closure
        const latestImages = currentValueRef.current
        const newImages = [...latestImages, ...successfulUrls]
        onChange(newImages)
        toast.success(`${successfulUrls.length} image${successfulUrls.length > 1 ? "s" : ""} uploaded and selected`)
      }
    },
    [maxFiles, onChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return

      const { files } = e.dataTransfer
      if (files && files.length > 0) {
        handleFiles(files)
      }
    },
    [disabled, handleFiles]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target
      if (files && files.length > 0) {
        handleFiles(files)
      }
      e.target.value = ""
    },
    [handleFiles]
  )

  const handleRemoveImage = useCallback(
    (index: number) => {
      const newUrls = value.filter((_, i) => i !== index)
      onChange(newUrls)
      toast.success("Image removed from selection")
    },
    [value, onChange]
  )

  const extractPublicIdFromUrl = (url: string): string | null => {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
      if (match && match[1]) {
        return match[1]
      }
      return null
    } catch {
      return null
    }
  }

  const handleDeleteFromCloudinary = async () => {
    if (!imageToDelete) return

    setDeletingFromCloudinary(true)

    try {
      const publicId = extractPublicIdFromUrl(imageToDelete.url)

      if (!publicId) {
        toast.error("Unable to identify image for deletion")
        return
      }

      const response = await fetch("/api/cloudinary/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete image")
      }

      const newUrls = value.filter((_, i) => i !== imageToDelete.index)
      onChange(newUrls)
      toast.success("Image deleted from Cloudinary")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete image")
    } finally {
      setDeletingFromCloudinary(false)
      setDeleteDialogOpen(false)
      setImageToDelete(null)
    }
  }

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleLibrarySelect = useCallback(
    (urls: string[]) => {
      onChange(urls)
      toast.success("Images updated from library")
    },
    [onChange]
  )

  const isUploading = uploadingCount > 0
  const canUploadMore = value.length < maxFiles

  return (
    <>
      <div className={cn("space-y-4", className)}>
        {/* Upload/Browse Actions */}
        <div className="flex flex-wrap gap-2">
          {canUploadMore && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleBrowseClick}
                disabled={disabled || !canUploadMore || isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload New Images
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setLibraryOpen(true)}
                disabled={disabled}
              >
                <Library className="mr-2 h-4 w-4" />
                Browse Media Library
              </Button>
            </>
          )}
        </div>

        {/* Drop Zone */}
        {canUploadMore && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative rounded-lg border-2 border-dashed transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              disabled={disabled || !canUploadMore}
              className="sr-only"
            />

            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div
                className={cn(
                  "mb-4 rounded-full p-4",
                  isDragging ? "bg-primary/10" : "bg-muted"
                )}
              >
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <h3 className="mb-2 text-lg font-semibold">
                {isUploading ? `Uploading ${uploadingCount} image${uploadingCount > 1 ? "s" : ""}...` : "Drop images here"}
              </h3>

              <p className="text-sm text-muted-foreground">
                or click the button above to browse (max {maxFiles} images, 5MB each)
              </p>

              <p className="mt-3 text-xs text-muted-foreground">
                Supported formats: JPG, PNG, WebP
              </p>
            </div>
          </div>
        )}

        {/* Image Preview Grid */}
        {value.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-green-600">
                ✓ Selected Images ({value.length} / {maxFiles})
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {value.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border-2 border-green-500 bg-muted"
                >
                  <Image
                    src={url}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {/* Action Buttons */}
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      disabled={disabled}
                      className={cn(
                        "rounded-full bg-orange-500 p-1.5 text-white shadow-lg transition-colors hover:bg-orange-600",
                        disabled && "cursor-not-allowed opacity-50"
                      )}
                      title="Remove from selection"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setImageToDelete({ url, index })
                        setDeleteDialogOpen(true)
                      }}
                      disabled={disabled}
                      className={cn(
                        "rounded-full bg-destructive p-1.5 text-destructive-foreground shadow-lg transition-colors hover:bg-destructive/90",
                        disabled && "cursor-not-allowed opacity-50"
                      )}
                      title="Delete from Cloudinary permanently"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Cover Badge */}
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                      Cover
                    </div>
                  )}

                  {/* Selected indicator */}
                  <div className="absolute left-2 top-2 rounded bg-green-500 px-2 py-1 text-xs font-medium text-white">
                    ✓
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {value.length === 0 && !isUploading && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
            <ImageIcon className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No images selected yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload new images or browse your media library
            </p>
          </div>
        )}

        {/* Upload Status */}
        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading {uploadingCount} image{uploadingCount > 1 ? "s" : ""}...</span>
          </div>
        )}
      </div>

      {/* Media Library Dialog */}
      <MediaLibraryDialog
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        selectedImages={value}
        onSelectImages={handleLibrarySelect}
        maxSelection={maxFiles}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image from Cloudinary</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the image from your Cloudinary account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingFromCloudinary}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFromCloudinary}
              disabled={deletingFromCloudinary}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingFromCloudinary ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
