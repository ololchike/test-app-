"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Loader2, MapPin, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AvailabilityCalendar } from "@/components/agent/availability-calendar"

interface Tour {
  id: string
  slug: string
  title: string
  destination: string
  status: string
  maxGroupSize: number
  _count: {
    bookings: number
  }
}

export default function AgentAvailabilityPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch("/api/agent/tours?status=ACTIVE")
        const data = await response.json()
        if (data.success) {
          setTours(data.data)
          // Auto-select first tour if available
          if (data.data.length > 0 && !selectedTourId) {
            setSelectedTourId(data.data[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching tours:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTours()
  }, [])

  const selectedTour = tours.find((t) => t.id === selectedTourId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Availability Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage tour dates, block unavailable periods, and set limited
          availability
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Tour Selection Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Select a Tour
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : tours.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active tours found</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link href="/agent/tours/new">Create your first tour</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {tours.map((tour) => (
                    <button
                      key={tour.id}
                      onClick={() => setSelectedTourId(tour.id)}
                      className={`w-full text-left p-4 hover:bg-accent transition-colors ${
                        selectedTourId === tour.id ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm line-clamp-1">
                            {tour.title}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{tour.destination}</span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 flex-shrink-0 transition-transform ${
                            selectedTourId === tour.id ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          {tour._count.bookings} bookings
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
                          Max {tour.maxGroupSize}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">Click dates</strong> to
                select them, then set their availability status.
              </p>
              <p>
                <strong className="text-foreground">Blocked dates</strong>{" "}
                prevent new bookings for those days.
              </p>
              <p>
                <strong className="text-foreground">Limited availability</strong>{" "}
                shows remaining spots to customers.
              </p>
              <p>
                <strong className="text-foreground">Blue dates</strong> indicate
                existing bookings.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Area */}
        <div className="lg:col-span-3">
          {selectedTourId && selectedTour ? (
            <AvailabilityCalendar
              tourId={selectedTourId}
              maxGroupSize={selectedTour.maxGroupSize}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {isLoading
                    ? "Loading tours..."
                    : "Select a tour from the sidebar to manage its availability"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
