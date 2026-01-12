"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageLightboxProps {
  images: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)

  // Reset index when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setIsZoomed(false)
    }
  }, [isOpen, initialIndex])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          goToPrevious()
          break
        case "ArrowRight":
          goToNext()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, currentIndex])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setIsZoomed(false)
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setIsZoomed(false)
  }, [images.length])

  if (!isOpen || images.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 z-10 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Zoom button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white hover:bg-white/20"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
      </Button>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12"
            onClick={goToNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Main image */}
      <div
        className="h-full w-full flex items-center justify-center p-4 md:p-16"
        onClick={(e) => {
          // Close if clicking outside the image
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        <div
          className={cn(
            "relative transition-all duration-300",
            isZoomed ? "w-full h-full" : "max-w-5xl max-h-[80vh] w-full h-full"
          )}
        >
          <Image
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            fill
            className={cn(
              "transition-all duration-300",
              isZoomed ? "object-contain" : "object-contain"
            )}
            sizes="100vw"
            priority
          />
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-[90vw] overflow-x-auto p-2 bg-black/50 rounded-lg">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsZoomed(false)
              }}
              className={cn(
                "relative w-16 h-12 rounded overflow-hidden shrink-0 transition-all",
                currentIndex === index
                  ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
