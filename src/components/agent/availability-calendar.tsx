"use client"

import { useState, useEffect, useCallback } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Users,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface AvailabilityEntry {
  id: string
  date: string
  type: "AVAILABLE" | "BLOCKED" | "LIMITED"
  spotsAvailable: number | null
  notes: string | null
}

interface BookingEntry {
  id: string
  startDate: string
  endDate: string
  guests: number
  status: string
}

interface AvailabilityCalendarProps {
  tourId: string
  maxGroupSize?: number
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function AvailabilityCalendar({
  tourId,
  maxGroupSize = 20,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([])
  const [bookings, setBookings] = useState<BookingEntry[]>([])
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editType, setEditType] = useState<"AVAILABLE" | "BLOCKED" | "LIMITED">(
    "AVAILABLE"
  )
  const [spotsAvailable, setSpotsAvailable] = useState(maxGroupSize)
  const [notes, setNotes] = useState("")
  const [tourTitle, setTourTitle] = useState("")

  const fetchAvailability = useCallback(async () => {
    try {
      setIsLoading(true)
      const monthOffset =
        (currentMonth.getFullYear() - new Date().getFullYear()) * 12 +
        currentMonth.getMonth() -
        new Date().getMonth()

      const response = await fetch(
        `/api/agent/tours/${tourId}/availability?monthOffset=${monthOffset}`
      )
      const data = await response.json()

      if (data.success) {
        setAvailability(data.data.availability)
        setBookings(data.data.bookings)
        setTourTitle(data.data.tour.title)
        if (data.data.tour.maxGroupSize) {
          setSpotsAvailable(data.data.tour.maxGroupSize)
        }
      }
    } catch (error) {
      console.error("Error fetching availability:", error)
    } finally {
      setIsLoading(false)
    }
  }, [tourId, currentMonth])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const getDateStatus = (date: Date) => {
    const dateStr = startOfDay(date).toISOString()

    // Check if there's a custom availability entry
    const entry = availability.find(
      (a) => startOfDay(new Date(a.date)).toISOString() === dateStr
    )

    // Check if date has bookings
    const hasBooking = bookings.some((b) => {
      const start = new Date(b.startDate)
      const end = new Date(b.endDate)
      return date >= start && date <= end
    })

    return {
      entry,
      hasBooking,
      isBlocked: entry?.type === "BLOCKED",
      isLimited: entry?.type === "LIMITED",
      isAvailable: !entry || entry.type === "AVAILABLE",
    }
  }

  const handleDateClick = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return

    setSelectedDates((prev) => {
      const isSelected = prev.some((d) => isSameDay(d, date))
      if (isSelected) {
        return prev.filter((d) => !isSameDay(d, date))
      }
      return [...prev, date]
    })
  }

  const handleSelectRange = (startDate: Date, days: number) => {
    const dates: Date[] = []
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      if (!isBefore(date, startOfDay(new Date()))) {
        dates.push(date)
      }
    }
    setSelectedDates(dates)
  }

  const handleOpenDialog = () => {
    if (selectedDates.length === 0) return
    setShowDialog(true)
  }

  const handleSaveAvailability = async () => {
    if (selectedDates.length === 0) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/agent/tours/${tourId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dates: selectedDates.map((d) => d.toISOString()),
          type: editType,
          spotsAvailable: editType === "LIMITED" ? spotsAvailable : undefined,
          notes: notes || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        await fetchAvailability()
        setSelectedDates([])
        setShowDialog(false)
        setNotes("")
      }
    } catch (error) {
      console.error("Error saving availability:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate padding days for the first week
  const firstDayOfWeek = monthStart.getDay()
  const paddingDays = Array(firstDayOfWeek).fill(null)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Availability Calendar</CardTitle>
            {tourTitle && (
              <p className="text-sm text-muted-foreground mt-1">{tourTitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border border-green-500" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-100 border border-red-500" />
                  <span>Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-500" />
                  <span>Limited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 border border-blue-500" />
                  <span>Has Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded ring-2 ring-primary" />
                  <span>Selected</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Weekday Headers */}
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center py-2 text-sm font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}

                {/* Padding Days */}
                {paddingDays.map((_, index) => (
                  <div key={`padding-${index}`} className="aspect-square" />
                ))}

                {/* Calendar Days */}
                {days.map((day) => {
                  const status = getDateStatus(day)
                  const isSelected = selectedDates.some((d) => isSameDay(d, day))
                  const isPast = isBefore(day, startOfDay(new Date()))

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDateClick(day)}
                      disabled={isPast}
                      className={cn(
                        "aspect-square p-1 relative rounded-lg transition-all text-sm",
                        "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary",
                        !isSameMonth(day, currentMonth) && "text-muted-foreground",
                        isPast && "opacity-50 cursor-not-allowed",
                        isToday(day) && "font-bold",
                        isSelected && "ring-2 ring-primary ring-offset-2",
                        status.isBlocked && "bg-red-100 text-red-700",
                        status.isLimited && "bg-yellow-100 text-yellow-700",
                        status.isAvailable && !status.hasBooking && "bg-green-50",
                        status.hasBooking && "bg-blue-100 text-blue-700"
                      )}
                    >
                      <span className="block">{format(day, "d")}</span>
                      {status.entry?.notes && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gray-500" />
                      )}
                      {status.isLimited && status.entry?.spotsAvailable && (
                        <span className="absolute bottom-0.5 right-0.5 text-[10px]">
                          {status.entry.spotsAvailable}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">{selectedDates.length}</span> date(s)
              selected
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleSelectRange(startOfMonth(currentMonth), 7)
                }
              >
                Select First Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allDays = days.filter(
                    (d) => !isBefore(d, startOfDay(new Date()))
                  )
                  setSelectedDates(allDays)
                }}
              >
                Select All Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDates([])}
              >
                Clear Selection
              </Button>
            </div>
            <div className="flex-1" />
            <Button
              onClick={handleOpenDialog}
              disabled={selectedDates.length === 0}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Set Availability
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Availability</DialogTitle>
            <DialogDescription>
              Configure availability for {selectedDates.length} selected date(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Availability Type</Label>
              <Select
                value={editType}
                onValueChange={(v) =>
                  setEditType(v as "AVAILABLE" | "BLOCKED" | "LIMITED")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Available
                    </div>
                  </SelectItem>
                  <SelectItem value="BLOCKED">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-600" />
                      Blocked
                    </div>
                  </SelectItem>
                  <SelectItem value="LIMITED">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-yellow-600" />
                      Limited Availability
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editType === "LIMITED" && (
              <div className="space-y-2">
                <Label>Available Spots</Label>
                <Input
                  type="number"
                  min={1}
                  max={maxGroupSize}
                  value={spotsAvailable}
                  onChange={(e) => setSpotsAvailable(parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum group size: {maxGroupSize}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Add any notes about this availability..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium mb-2">Selected Dates:</p>
              <div className="flex flex-wrap gap-1">
                {selectedDates.slice(0, 10).map((date) => (
                  <Badge key={date.toISOString()} variant="secondary">
                    {format(date, "MMM d")}
                  </Badge>
                ))}
                {selectedDates.length > 10 && (
                  <Badge variant="secondary">
                    +{selectedDates.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAvailability} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Availability"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
