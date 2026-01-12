"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  MapPin,
  Clock,
  Star,
  Loader2,
  ZoomIn,
  ZoomOut,
  Locate,
  Layers,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Tour {
  id: string
  slug: string
  title: string
  subtitle: string | null
  coverImage: string | null
  destination: string
  country: string
  durationDays: number
  durationNights: number
  basePrice: number
  currency: string
  latitude: number | null
  longitude: number | null
  rating: number | null
  reviewCount: number
}

interface TourMapProps {
  tours: Tour[]
  isLoading?: boolean
  selectedTourId?: string | null
  onTourSelect?: (tourId: string | null) => void
  center?: [number, number]
  zoom?: number
}

// East Africa default center
const DEFAULT_CENTER: [number, number] = [-1.2921, 36.8219] // Nairobi
const DEFAULT_ZOOM = 6

export function TourMap({
  tours,
  isLoading = false,
  selectedTourId,
  onTourSelect,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}: TourMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mapReady, setMapReady] = useState(false)
  const [hoveredTour, setHoveredTour] = useState<Tour | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Fix default icon paths for Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current!, {
        center: center,
        zoom: zoom,
        zoomControl: false,
      })

      // Add tile layer (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      leafletMapRef.current = map
      setMapReady(true)
    }

    initMap()

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  // Update markers when tours change
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) return

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default
      const map = leafletMapRef.current

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Add new markers
      const toursWithLocation = tours.filter(
        (t) => t.latitude && t.longitude
      )

      toursWithLocation.forEach((tour) => {
        const isSelected = tour.id === selectedTourId

        // Custom icon
        const icon = L.divIcon({
          className: "custom-marker",
          html: `
            <div class="relative">
              <div class="w-8 h-8 rounded-full ${
                isSelected ? "bg-primary" : "bg-primary/80"
              } flex items-center justify-center shadow-lg border-2 border-white transform ${
            isSelected ? "scale-125" : ""
          } transition-transform">
                <span class="text-white font-bold text-xs">$${Math.round(
                  tour.basePrice
                )}</span>
              </div>
              ${isSelected ? '<div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary"></div>' : ""}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        })

        const marker = L.marker([tour.latitude!, tour.longitude!], {
          icon,
        }).addTo(map)

        // Add popup
        marker.bindPopup(
          `
          <div class="min-w-[200px] p-2">
            <h3 class="font-bold text-sm mb-1">${tour.title}</h3>
            <p class="text-xs text-gray-500 mb-2">${tour.destination}, ${tour.country}</p>
            <div class="flex items-center justify-between">
              <span class="font-bold">$${tour.basePrice.toLocaleString()}</span>
              <span class="text-xs">${tour.durationDays}D/${tour.durationNights}N</span>
            </div>
            <a href="/tours/${tour.slug}" class="block mt-2 text-center text-xs bg-primary text-white rounded py-1 hover:bg-primary/90">View Tour</a>
          </div>
        `,
          { closeButton: false }
        )

        marker.on("click", () => {
          onTourSelect?.(tour.id)
        })

        marker.on("mouseover", () => {
          setHoveredTour(tour)
          marker.openPopup()
        })

        marker.on("mouseout", () => {
          setHoveredTour(null)
        })

        markersRef.current.push(marker)
      })

      // Fit bounds if we have markers
      if (toursWithLocation.length > 0) {
        const bounds = L.latLngBounds(
          toursWithLocation.map((t) => [t.latitude!, t.longitude!])
        )
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }

    updateMarkers()
  }, [tours, mapReady, selectedTourId, onTourSelect])

  const handleZoomIn = () => {
    leafletMapRef.current?.zoomIn()
  }

  const handleZoomOut = () => {
    leafletMapRef.current?.zoomOut()
  }

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          leafletMapRef.current?.setView([latitude, longitude], 10)
        },
        () => {
          // Fallback to default center
          leafletMapRef.current?.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
        }
      )
    }
  }

  const handleResetView = () => {
    leafletMapRef.current?.setView(center, zoom)
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 shadow-md"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 shadow-md"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 shadow-md"
          onClick={handleLocate}
        >
          <Locate className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 shadow-md"
          onClick={handleResetView}
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      {/* Tour Count */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Badge variant="secondary" className="shadow-md">
          <MapPin className="h-3 w-3 mr-1" />
          {tours.filter((t) => t.latitude && t.longitude).length} tours on map
        </Badge>
      </div>

      {/* CSS for custom markers */}
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  )
}
