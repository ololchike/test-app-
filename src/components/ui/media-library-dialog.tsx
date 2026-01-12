"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, Image as ImageIcon, Check, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Image from "next/image"

interface CloudinaryImage {
  url: string
  publicId: string
  width: number
  height: number
  format: string
  size: number
  createdAt: string
  thumbnail: string
}

interface MediaLibraryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedImages: string[]
  onSelectImages: (urls: string[]) => void
  maxSelection?: number
}

export function MediaLibraryDialog({
  open,
  onOpenChange,
  selectedImages,
  onSelectImages,
  maxSelection,
}: MediaLibraryDialogProps) {
  const [images, setImages] = useState<CloudinaryImage[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInDialog, setSelectedInDialog] = useState<string[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  // Load images from Cloudinary
  const loadImages = async (cursor?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        max_results: "30",
      })
      if (cursor) {
        params.set("next_cursor", cursor)
      }

      const response = await fetch(`/api/cloudinary/images?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load images")
      }

      if (cursor) {
        // Append to existing images for pagination
        setImages((prev) => [...prev, ...data.images])
      } else {
        // Replace images for initial load
        setImages(data.images)
      }

      setNextCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load media library")
    } finally {
      setLoading(false)
    }
  }

  // Load images when dialog opens
  useEffect(() => {
    if (open) {
      loadImages()
      setSelectedInDialog([...selectedImages])
    }
  }, [open])

  const filteredImages = images.filter((img) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      img.publicId.toLowerCase().includes(searchLower) ||
      img.format.toLowerCase().includes(searchLower)
    )
  })

  const toggleImageSelection = (url: string) => {
    if (selectedInDialog.includes(url)) {
      setSelectedInDialog(selectedInDialog.filter((u) => u !== url))
    } else {
      if (maxSelection && selectedInDialog.length >= maxSelection) {
        toast.error(`You can only select up to ${maxSelection} images`)
        return
      }
      setSelectedInDialog([...selectedInDialog, url])
    }
  }

  const handleAddSelected = () => {
    onSelectImages(selectedInDialog)
    onOpenChange(false)
    toast.success(`${selectedInDialog.length} image${selectedInDialog.length > 1 ? "s" : ""} added`)
  }

  const handleLoadMore = () => {
    if (nextCursor && !loading) {
      loadImages(nextCursor)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
          <DialogDescription>
            Select images from your Cloudinary media library
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by filename or format..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Selection Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {selectedInDialog.length} image{selectedInDialog.length !== 1 ? "s" : ""} selected
              {maxSelection && ` (max ${maxSelection})`}
            </span>
            {selectedInDialog.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedInDialog([])}
              >
                Clear selection
              </Button>
            )}
          </div>

          {/* Image Grid */}
          <ScrollArea className="flex-1 pr-4">
            {loading && images.length === 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No images found matching your search" : "No images in your media library yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredImages.map((image) => {
                    const isSelected = selectedInDialog.includes(image.url)
                    const isAlreadySelected = selectedImages.includes(image.url) && !selectedInDialog.includes(image.url)

                    return (
                      <div
                        key={image.publicId}
                        className={cn(
                          "group relative aspect-square overflow-hidden rounded-lg border-2 transition-all cursor-pointer",
                          isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent hover:border-muted-foreground/50"
                        )}
                        onClick={() => toggleImageSelection(image.url)}
                      >
                        <Image
                          src={image.thumbnail}
                          alt={image.publicId}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />

                        {/* Selection Checkbox */}
                        <div className="absolute right-2 top-2 z-10">
                          <div
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all",
                              isSelected
                                ? "bg-primary border-primary"
                                : "bg-background/80 backdrop-blur-sm border-border opacity-0 group-hover:opacity-100"
                            )}
                          >
                            {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
                          </div>
                        </div>

                        {/* Already Selected Badge */}
                        {isAlreadySelected && (
                          <div className="absolute left-2 top-2 rounded bg-green-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            Selected
                          </div>
                        )}

                        {/* Image Info Overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="text-xs font-medium text-white truncate">
                            {image.publicId.split("/").pop()}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-white/80">
                            <span>{image.width}×{image.height}</span>
                            <span>•</span>
                            <span>{formatFileSize(image.size)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronRight className="mr-2 h-4 w-4" />
                          Load More
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddSelected}
            disabled={selectedInDialog.length === 0}
          >
            Add Selected ({selectedInDialog.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
