"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageLightbox } from "@/components/ui/image-lightbox"
import { Camera } from "lucide-react"

interface TourGalleryProps {
  images: string[]
  title: string
}

export function TourGallery({ images, title }: TourGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if (images.length === 0) {
    return (
      <div className="h-[400px] lg:h-[500px] bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No images available</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative grid grid-cols-4 gap-4 h-[400px] lg:h-[500px]">
        {/* Main large image */}
        <button
          onClick={() => openLightbox(0)}
          className="col-span-4 lg:col-span-2 relative rounded-xl overflow-hidden group cursor-pointer"
        >
          <Image
            src={images[0]}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

          {/* Mobile: Show all photos button */}
          {images.length > 1 && (
            <div className="lg:hidden absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              <Camera className="h-4 w-4 inline-block mr-2" />
              View all {images.length} photos
            </div>
          )}
        </button>

        {/* Secondary images grid */}
        <div className="hidden lg:grid col-span-2 grid-cols-2 gap-4">
          {images.slice(1, 5).map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index + 1)}
              className="relative rounded-xl overflow-hidden group cursor-pointer"
            >
              <Image
                src={image}
                alt={`${title} ${index + 2}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

              {/* Show +X photos on the last visible image if there are more */}
              {index === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/60 transition-colors">
                  <span className="text-white font-semibold text-lg">
                    +{images.length - 5} photos
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
