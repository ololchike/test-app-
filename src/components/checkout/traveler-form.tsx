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
import { UserIcon, Users, MessageSquare, AlertCircle, Calendar, Mail, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

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
    <div className="space-y-8">
      {/* Lead Traveler Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border/50">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Lead Traveler Details</h3>
            <p className="text-sm text-muted-foreground">
              This person will be the main contact for the booking
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="leadTraveler.firstName" className="text-sm font-medium flex items-center gap-1">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="leadTraveler.firstName"
              {...register("leadTraveler.firstName")}
              placeholder="John"
              className={cn(
                "h-12 rounded-xl border-border/50 focus:border-primary/50 transition-all duration-300",
                errors.leadTraveler?.firstName && "border-destructive focus-visible:ring-destructive/20"
              )}
              aria-invalid={!!errors.leadTraveler?.firstName}
            />
            {errors.leadTraveler?.firstName && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.leadTraveler.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadTraveler.lastName" className="text-sm font-medium flex items-center gap-1">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="leadTraveler.lastName"
              {...register("leadTraveler.lastName")}
              placeholder="Doe"
              className={cn(
                "h-12 rounded-xl border-border/50 focus:border-primary/50 transition-all duration-300",
                errors.leadTraveler?.lastName && "border-destructive focus-visible:ring-destructive/20"
              )}
              aria-invalid={!!errors.leadTraveler?.lastName}
            />
            {errors.leadTraveler?.lastName && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.leadTraveler.lastName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadTraveler.email" className="text-sm font-medium flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="leadTraveler.email"
              type="email"
              {...register("leadTraveler.email")}
              placeholder="john.doe@example.com"
              className={cn(
                "h-12 rounded-xl border-border/50 focus:border-primary/50 transition-all duration-300",
                errors.leadTraveler?.email && "border-destructive focus-visible:ring-destructive/20"
              )}
              aria-invalid={!!errors.leadTraveler?.email}
            />
            {errors.leadTraveler?.email && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.leadTraveler.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadTraveler.phone" className="text-sm font-medium flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="leadTraveler.phone"
              type="tel"
              {...register("leadTraveler.phone")}
              placeholder="+254 712 345 678"
              className={cn(
                "h-12 rounded-xl border-border/50 focus:border-primary/50 transition-all duration-300",
                errors.leadTraveler?.phone && "border-destructive focus-visible:ring-destructive/20"
              )}
              aria-invalid={!!errors.leadTraveler?.phone}
            />
            {errors.leadTraveler?.phone && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.leadTraveler.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadTraveler.dateOfBirth" className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Date of Birth <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Input
              id="leadTraveler.dateOfBirth"
              type="date"
              {...register("leadTraveler.dateOfBirth")}
              className="h-12 rounded-xl border-border/50 focus:border-primary/50 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Additional Travelers Section */}
      {additionalTravelersCount > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Additional Travelers</h3>
              <p className="text-sm text-muted-foreground">
                Provide details for the other {additionalTravelersCount}{" "}
                {additionalTravelersCount === 1 ? "traveler" : "travelers"}
              </p>
            </div>
          </div>

          <Accordion type="multiple" className="w-full space-y-3">
            {Array.from({ length: additionalTravelersCount }, (_, index) => {
              const hasError = !!errors.additionalTravelers?.[index]

              return (
                <AccordionItem
                  key={index}
                  value={`traveler-${index}`}
                  className={cn(
                    "border rounded-xl px-5 transition-all duration-300",
                    hasError
                      ? "border-destructive/50 bg-destructive/5"
                      : "border-border/50 hover:border-primary/30"
                  )}
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-sm font-semibold",
                        hasError
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {index + 2}
                      </div>
                      <span className="font-medium">Traveler {index + 2}</span>
                      {hasError && (
                        <span className="ml-2 text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Incomplete
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-5 sm:grid-cols-2 pt-4 pb-2">
                      <div className="space-y-2">
                        <Label htmlFor={`additionalTravelers.${index}.firstName`} className="text-sm font-medium flex items-center gap-1">
                          First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`additionalTravelers.${index}.firstName`}
                          {...register(`additionalTravelers.${index}.firstName`)}
                          placeholder="First name"
                          className={cn(
                            "h-12 rounded-xl border-border/50 focus:border-primary/50 transition-all duration-300",
                            errors.additionalTravelers?.[index]?.firstName && "border-destructive"
                          )}
                          aria-invalid={!!errors.additionalTravelers?.[index]?.firstName}
                        />
                        {errors.additionalTravelers?.[index]?.firstName && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.additionalTravelers[index]?.firstName?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`additionalTravelers.${index}.lastName`} className="text-sm font-medium flex items-center gap-1">
                          Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`additionalTravelers.${index}.lastName`}
                          {...register(`additionalTravelers.${index}.lastName`)}
                          placeholder="Last name"
                          className={cn(
                            "h-12 rounded-xl border-border/50 focus:border-primary/50 transition-all duration-300",
                            errors.additionalTravelers?.[index]?.lastName && "border-destructive"
                          )}
                          aria-invalid={!!errors.additionalTravelers?.[index]?.lastName}
                        />
                        {errors.additionalTravelers?.[index]?.lastName && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.additionalTravelers[index]?.lastName?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`additionalTravelers.${index}.email`} className="text-sm font-medium">
                          Email Address <span className="text-muted-foreground text-xs">(Optional)</span>
                        </Label>
                        <Input
                          id={`additionalTravelers.${index}.email`}
                          type="email"
                          {...register(`additionalTravelers.${index}.email`)}
                          placeholder="email@example.com"
                          className="h-12 rounded-xl border-border/50 focus:border-primary/50 transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`additionalTravelers.${index}.phone`} className="text-sm font-medium">
                          Phone Number <span className="text-muted-foreground text-xs">(Optional)</span>
                        </Label>
                        <Input
                          id={`additionalTravelers.${index}.phone`}
                          type="tel"
                          {...register(`additionalTravelers.${index}.phone`)}
                          placeholder="Phone"
                          className="h-12 rounded-xl border-border/50 focus:border-primary/50 transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`additionalTravelers.${index}.dateOfBirth`} className="text-sm font-medium">
                          Date of Birth
                          {index < children && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </Label>
                        <Input
                          id={`additionalTravelers.${index}.dateOfBirth`}
                          type="date"
                          {...register(`additionalTravelers.${index}.dateOfBirth`)}
                          className="h-12 rounded-xl border-border/50 focus:border-primary/50 transition-all duration-300"
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
              )
            })}
          </Accordion>
        </div>
      )}

      {/* Special Requests */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border/50">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Special Requests</h3>
            <p className="text-sm text-muted-foreground">
              Let us know if you have any dietary requirements, accessibility needs, or other special requests
            </p>
          </div>
        </div>

        <Textarea
          {...register("specialRequests")}
          placeholder="Enter any special requests or requirements..."
          rows={4}
          className="resize-none rounded-xl border-border/50 focus:border-primary/50 transition-all duration-300"
        />
      </div>
    </div>
  )
}
