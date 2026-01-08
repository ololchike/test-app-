"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Baby } from "lucide-react"
import { cn } from "@/lib/utils"

interface Traveler {
  type: "adult" | "child"
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  passportNumber: string
}

interface TravelerFormProps {
  travelers: Traveler[]
  onChange: (travelers: Traveler[]) => void
  errors?: Record<number, { firstName?: string; lastName?: string }>
}

export function TravelerForm({ travelers, onChange, errors }: TravelerFormProps) {
  const updateTraveler = (index: number, field: keyof Traveler, value: string) => {
    const updated = [...travelers]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  return (
    <div className="space-y-6">
      {travelers.map((traveler, index) => {
        const travelerErrors = errors?.[index]
        const hasErrors = travelerErrors?.firstName || travelerErrors?.lastName

        return (
          <div
            key={index}
            className={cn(
              "border rounded-lg p-4 space-y-4",
              hasErrors && "border-destructive"
            )}
          >
            <div className="flex items-center gap-2">
              {traveler.type === "adult" ? (
                <User className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Baby className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium">Traveler {index + 1}</span>
              <Badge variant={traveler.type === "adult" ? "default" : "secondary"}>
                {traveler.type === "adult" ? "Adult" : "Child"}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor={`firstName-${index}`}
                  className={cn(travelerErrors?.firstName && "text-destructive")}
                >
                  First Name *
                </Label>
                <Input
                  id={`firstName-${index}`}
                  value={traveler.firstName}
                  onChange={(e) => updateTraveler(index, "firstName", e.target.value)}
                  placeholder="As shown on passport"
                  className={cn(travelerErrors?.firstName && "border-destructive focus-visible:ring-destructive")}
                />
                {travelerErrors?.firstName && (
                  <p className="text-sm text-destructive">{travelerErrors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor={`lastName-${index}`}
                  className={cn(travelerErrors?.lastName && "text-destructive")}
                >
                  Last Name *
                </Label>
                <Input
                  id={`lastName-${index}`}
                  value={traveler.lastName}
                  onChange={(e) => updateTraveler(index, "lastName", e.target.value)}
                  placeholder="As shown on passport"
                  className={cn(travelerErrors?.lastName && "border-destructive focus-visible:ring-destructive")}
                />
                {travelerErrors?.lastName && (
                  <p className="text-sm text-destructive">{travelerErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`dob-${index}`}>Date of Birth</Label>
                <Input
                  id={`dob-${index}`}
                  type="date"
                  value={traveler.dateOfBirth}
                  onChange={(e) => updateTraveler(index, "dateOfBirth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`nationality-${index}`}>Nationality</Label>
                <Input
                  id={`nationality-${index}`}
                  value={traveler.nationality}
                  onChange={(e) => updateTraveler(index, "nationality", e.target.value)}
                  placeholder="e.g., Kenyan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`passport-${index}`}>Passport Number</Label>
                <Input
                  id={`passport-${index}`}
                  value={traveler.passportNumber}
                  onChange={(e) => updateTraveler(index, "passportNumber", e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
