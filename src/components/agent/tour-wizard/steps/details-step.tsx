"use client"

import dynamic from "next/dynamic"
import { DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useTourForm } from "../tour-form-context"
import { COUNTRIES } from "../types"
import {
  DifficultyLevel,
  DifficultyLevelLabels,
  getEnumValues,
} from "@/lib/constants"

// Dynamic import for RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  { ssr: false, loading: () => <div className="h-[200px] rounded-md border animate-pulse bg-muted" /> }
)

const DIFFICULTIES = getEnumValues(DifficultyLevel).map((value) => ({
  value,
  label: DifficultyLevelLabels[value],
}))

export function DetailsStep() {
  const { formData, updateFormData, errors } = useTourForm()

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Tour Title *</Label>
        <Input
          id="title"
          placeholder="e.g., 7-Day Masai Mara Safari Adventure"
          value={formData.title}
          onChange={(e) => updateFormData("title", e.target.value)}
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Subtitle */}
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle (Optional)</Label>
        <Input
          id="subtitle"
          placeholder="e.g., Experience the magic of the African savannah"
          value={formData.subtitle}
          onChange={(e) => updateFormData("subtitle", e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description *</Label>
        <RichTextEditor
          content={formData.description}
          onChange={(content) => updateFormData("description", content)}
          placeholder="Describe your tour in detail... Use formatting to highlight key features, include lists of activities, and make the description engaging."
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
      </div>

      {/* Destination & Country */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="destination">Destination *</Label>
          <Input
            id="destination"
            placeholder="e.g., Masai Mara"
            value={formData.destination}
            onChange={(e) => updateFormData("destination", e.target.value)}
            className={errors.destination ? "border-destructive" : ""}
          />
          {errors.destination && (
            <p className="text-sm text-destructive">{errors.destination}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Select
            value={formData.country}
            onValueChange={(value) => updateFormData("country", value)}
          >
            <SelectTrigger className={errors.country ? "border-destructive" : ""}>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-sm text-destructive">{errors.country}</p>
          )}
        </div>
      </div>

      {/* Duration & Group Size */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="durationDays">Duration (Days) *</Label>
          <Input
            id="durationDays"
            type="number"
            min={1}
            max={30}
            value={formData.durationDays}
            onChange={(e) => updateFormData("durationDays", parseInt(e.target.value) || 1)}
            className={errors.durationDays ? "border-destructive" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="durationNights">Nights</Label>
          <Input
            id="durationNights"
            type="number"
            min={0}
            max={30}
            value={formData.durationNights}
            onChange={(e) => updateFormData("durationNights", parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxGroupSize">Max Group Size</Label>
          <Input
            id="maxGroupSize"
            type="number"
            min={1}
            max={50}
            value={formData.maxGroupSize}
            onChange={(e) => updateFormData("maxGroupSize", parseInt(e.target.value) || 12)}
          />
        </div>
      </div>

      {/* Base Price & Difficulty */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="basePrice">Adult Price (USD) *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="basePrice"
              type="number"
              min={0}
              value={formData.basePrice}
              onChange={(e) => updateFormData("basePrice", parseFloat(e.target.value) || 0)}
              className={cn("pl-9", errors.basePrice ? "border-destructive" : "")}
            />
          </div>
          {errors.basePrice && (
            <p className="text-sm text-destructive">{errors.basePrice}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => updateFormData("difficulty", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Guest Type Pricing */}
      <div className="space-y-3">
        <Label>Guest Type Pricing</Label>
        <p className="text-sm text-muted-foreground">
          Set different prices for children and infants (optional)
        </p>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="childPrice" className="text-sm">Child Price (2-11 yrs)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="childPrice"
                type="number"
                min={0}
                placeholder="Optional"
                value={formData.childPrice ?? ""}
                onChange={(e) => updateFormData("childPrice", e.target.value ? parseFloat(e.target.value) : null)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="infantPrice" className="text-sm">Infant Price (0-2 yrs)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="infantPrice"
                type="number"
                min={0}
                placeholder="Optional"
                value={formData.infantPrice ?? ""}
                onChange={(e) => updateFormData("infantPrice", e.target.value ? parseFloat(e.target.value) : null)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="singleSupplement" className="text-sm">Single Supplement</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="singleSupplement"
                type="number"
                min={0}
                placeholder="Optional"
                value={formData.singleSupplement ?? ""}
                onChange={(e) => updateFormData("singleSupplement", e.target.value ? parseFloat(e.target.value) : null)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Deposit & Cancellation */}
      <div className="space-y-4 p-4 rounded-lg bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Deposit Payment</Label>
            <p className="text-sm text-muted-foreground">
              Allow customers to pay a deposit instead of full amount
            </p>
          </div>
          <Switch
            checked={formData.depositEnabled}
            onCheckedChange={(checked) => updateFormData("depositEnabled", checked)}
          />
        </div>

        {formData.depositEnabled && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 pt-2">
            <div className="space-y-2">
              <Label htmlFor="depositPercentage">Deposit Percentage (%)</Label>
              <Input
                id="depositPercentage"
                type="number"
                min={10}
                max={90}
                value={formData.depositPercentage}
                onChange={(e) => updateFormData("depositPercentage", parseInt(e.target.value) || 30)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="freeCancellationDays">Free Cancellation (Days Before)</Label>
              <Input
                id="freeCancellationDays"
                type="number"
                min={0}
                max={60}
                value={formData.freeCancellationDays}
                onChange={(e) => updateFormData("freeCancellationDays", parseInt(e.target.value) || 14)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
