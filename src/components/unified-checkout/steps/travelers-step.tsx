"use client"

import { User, Users, Baby, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCheckout } from "../checkout-context"
import type { Traveler } from "../types"

export function TravelersStep() {
  const { state, setTravelers, validateStep } = useCheckout()
  const { travelers } = state

  const validation = validateStep("travelers")

  const updateTraveler = (index: number, field: keyof Traveler, value: string) => {
    const updated = [...travelers]
    updated[index] = { ...updated[index], [field]: value }
    setTravelers(updated)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "adult":
        return "Adult"
      case "child":
        return "Child"
      case "infant":
        return "Infant"
      default:
        return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "adult":
        return User
      case "child":
        return Users
      case "infant":
        return Baby
      default:
        return User
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "adult":
        return "bg-blue-500/10 text-blue-600"
      case "child":
        return "bg-purple-500/10 text-purple-600"
      case "infant":
        return "bg-pink-500/10 text-pink-600"
      default:
        return "bg-muted"
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Traveler Details</h2>
        <p className="text-sm text-muted-foreground">
          Enter details for each traveler as they appear on their passport or ID.
        </p>
      </div>

      {!validation.isValid && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Missing Information</p>
            <p className="text-sm text-destructive/80">
              Please fill in the required fields marked below.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {travelers.map((traveler, index) => {
          const Icon = getTypeIcon(traveler.type)
          const hasFirstNameError = validation.errors[`traveler_${index}_firstName`]
          const hasLastNameError = validation.errors[`traveler_${index}_lastName`]

          return (
            <Card
              key={index}
              className={cn(
                "border-border/50",
                (hasFirstNameError || hasLastNameError) && "border-destructive/50"
              )}
              data-error={hasFirstNameError || hasLastNameError ? "true" : undefined}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", getTypeColor(traveler.type))}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Traveler {index + 1}
                    </CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {getTypeLabel(traveler.type)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor={`firstName-${index}`}
                      className={cn(hasFirstNameError && "text-destructive")}
                    >
                      First Name *
                    </Label>
                    <Input
                      id={`firstName-${index}`}
                      value={traveler.firstName}
                      onChange={(e) => updateTraveler(index, "firstName", e.target.value)}
                      placeholder="Enter first name"
                      className={cn(
                        hasFirstNameError && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {hasFirstNameError && (
                      <p className="text-sm text-destructive">{hasFirstNameError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor={`lastName-${index}`}
                      className={cn(hasLastNameError && "text-destructive")}
                    >
                      Last Name *
                    </Label>
                    <Input
                      id={`lastName-${index}`}
                      value={traveler.lastName}
                      onChange={(e) => updateTraveler(index, "lastName", e.target.value)}
                      placeholder="Enter last name"
                      className={cn(
                        hasLastNameError && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {hasLastNameError && (
                      <p className="text-sm text-destructive">{hasLastNameError}</p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`dateOfBirth-${index}`}>
                      Date of Birth
                    </Label>
                    <Input
                      id={`dateOfBirth-${index}`}
                      type="date"
                      value={traveler.dateOfBirth}
                      onChange={(e) => updateTraveler(index, "dateOfBirth", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`nationality-${index}`}>
                      Nationality
                    </Label>
                    <Input
                      id={`nationality-${index}`}
                      value={traveler.nationality}
                      onChange={(e) => updateTraveler(index, "nationality", e.target.value)}
                      placeholder="e.g., American"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`passportNumber-${index}`}>
                    Passport/ID Number
                  </Label>
                  <Input
                    id={`passportNumber-${index}`}
                    value={traveler.passportNumber}
                    onChange={(e) => updateTraveler(index, "passportNumber", e.target.value)}
                    placeholder="Enter passport or ID number"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional but recommended for international travel
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {travelers.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No Travelers</h3>
            <p className="text-sm text-muted-foreground">
              Please go back and select the number of travelers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
