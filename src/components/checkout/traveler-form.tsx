"use client"

import { UseFormReturn } from "react-hook-form"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UserIcon } from "lucide-react"

interface TravelerData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth?: string
}

export interface TravelerFormData {
  leadTraveler: TravelerData
  additionalTravelers: TravelerData[]
  specialRequests?: string
}

interface TravelerFormProps {
  form: UseFormReturn<TravelerFormData>
  adults: number
  children: number
  infants: number
}

export function TravelerForm({ form, adults, children, infants }: TravelerFormProps) {
  const {
    register,
    formState: { errors },
  } = form

  const additionalTravelersCount = Math.max(0, adults + children + infants - 1)

  return (
    <div className="space-y-6">
      {/* Lead Traveler Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UserIcon className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold">Lead Traveler Details</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          This person will be the main contact for the booking
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="leadTraveler.firstName">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="leadTraveler.firstName"
              {...register("leadTraveler.firstName")}
              placeholder="John"
              aria-invalid={!!errors.leadTraveler?.firstName}
            />
            {errors.leadTraveler?.firstName && (
              <p className="text-xs text-destructive">
                {errors.leadTraveler.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadTraveler.lastName">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="leadTraveler.lastName"
              {...register("leadTraveler.lastName")}
              placeholder="Doe"
              aria-invalid={!!errors.leadTraveler?.lastName}
            />
            {errors.leadTraveler?.lastName && (
              <p className="text-xs text-destructive">
                {errors.leadTraveler.lastName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadTraveler.email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="leadTraveler.email"
              type="email"
              {...register("leadTraveler.email")}
              placeholder="john.doe@example.com"
              aria-invalid={!!errors.leadTraveler?.email}
            />
            {errors.leadTraveler?.email && (
              <p className="text-xs text-destructive">
                {errors.leadTraveler.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadTraveler.phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="leadTraveler.phone"
              type="tel"
              {...register("leadTraveler.phone")}
              placeholder="+254 712 345 678"
              aria-invalid={!!errors.leadTraveler?.phone}
            />
            {errors.leadTraveler?.phone && (
              <p className="text-xs text-destructive">
                {errors.leadTraveler.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadTraveler.dateOfBirth">
              Date of Birth (Optional)
            </Label>
            <Input
              id="leadTraveler.dateOfBirth"
              type="date"
              {...register("leadTraveler.dateOfBirth")}
            />
          </div>
        </div>
      </div>

      {/* Additional Travelers Section */}
      {additionalTravelersCount > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Additional Travelers</h3>
            <p className="text-sm text-muted-foreground">
              Provide details for the other {additionalTravelersCount}{" "}
              {additionalTravelersCount === 1 ? "traveler" : "travelers"}
            </p>
          </div>

          <Accordion type="multiple" className="w-full">
            {Array.from({ length: additionalTravelersCount }, (_, index) => (
              <AccordionItem key={index} value={`traveler-${index}`}>
                <AccordionTrigger>
                  Traveler {index + 2}
                  {errors.additionalTravelers?.[index] && (
                    <span className="ml-2 text-xs text-destructive">
                      (Incomplete)
                    </span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 sm:grid-cols-2 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor={`additionalTravelers.${index}.firstName`}>
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`additionalTravelers.${index}.firstName`}
                        {...register(`additionalTravelers.${index}.firstName`)}
                        placeholder="First name"
                        aria-invalid={!!errors.additionalTravelers?.[index]?.firstName}
                      />
                      {errors.additionalTravelers?.[index]?.firstName && (
                        <p className="text-xs text-destructive">
                          {errors.additionalTravelers[index]?.firstName?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`additionalTravelers.${index}.lastName`}>
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`additionalTravelers.${index}.lastName`}
                        {...register(`additionalTravelers.${index}.lastName`)}
                        placeholder="Last name"
                        aria-invalid={!!errors.additionalTravelers?.[index]?.lastName}
                      />
                      {errors.additionalTravelers?.[index]?.lastName && (
                        <p className="text-xs text-destructive">
                          {errors.additionalTravelers[index]?.lastName?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`additionalTravelers.${index}.email`}>
                        Email Address
                      </Label>
                      <Input
                        id={`additionalTravelers.${index}.email`}
                        type="email"
                        {...register(`additionalTravelers.${index}.email`)}
                        placeholder="email@example.com (optional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`additionalTravelers.${index}.phone`}>
                        Phone Number
                      </Label>
                      <Input
                        id={`additionalTravelers.${index}.phone`}
                        type="tel"
                        {...register(`additionalTravelers.${index}.phone`)}
                        placeholder="Phone (optional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`additionalTravelers.${index}.dateOfBirth`}>
                        Date of Birth
                      </Label>
                      <Input
                        id={`additionalTravelers.${index}.dateOfBirth`}
                        type="date"
                        {...register(`additionalTravelers.${index}.dateOfBirth`)}
                      />
                      {index < children && (
                        <p className="text-xs text-muted-foreground">
                          Required for child travelers
                        </p>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Special Requests */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Special Requests (Optional)</h3>
          <p className="text-sm text-muted-foreground">
            Let us know if you have any dietary requirements, accessibility needs, or other special requests
          </p>
        </div>

        <Textarea
          {...register("specialRequests")}
          placeholder="Enter any special requests or requirements..."
          rows={4}
          className="resize-none"
        />
      </div>
    </div>
  )
}
