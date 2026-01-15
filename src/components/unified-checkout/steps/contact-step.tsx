"use client"

import { Mail, Phone, User, MessageSquare, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useCheckout } from "../checkout-context"

export function ContactStep() {
  const { state, setContact, validateStep } = useCheckout()
  const { contact } = state

  const validation = validateStep("contact")

  const updateContact = (field: keyof typeof contact, value: string) => {
    setContact({ ...contact, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Contact Information</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ll use this information to send booking confirmations and trip updates.
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

      <Card className="border-border/50" data-error={!validation.isValid ? "true" : undefined}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            Primary Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="contact-name"
              className={cn(validation.errors.contact_name && "text-destructive")}
            >
              Full Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="contact-name"
                value={contact.name}
                onChange={(e) => updateContact("name", e.target.value)}
                placeholder="Enter your full name"
                className={cn(
                  "pl-10",
                  validation.errors.contact_name && "border-destructive focus-visible:ring-destructive"
                )}
              />
            </div>
            {validation.errors.contact_name && (
              <p className="text-sm text-destructive">{validation.errors.contact_name}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="contact-email"
                className={cn(validation.errors.contact_email && "text-destructive")}
              >
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-email"
                  type="email"
                  value={contact.email}
                  onChange={(e) => updateContact("email", e.target.value)}
                  placeholder="your@email.com"
                  className={cn(
                    "pl-10",
                    validation.errors.contact_email && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </div>
              {validation.errors.contact_email && (
                <p className="text-sm text-destructive">{validation.errors.contact_email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="contact-phone"
                className={cn(validation.errors.contact_phone && "text-destructive")}
              >
                Phone Number *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-phone"
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => updateContact("phone", e.target.value)}
                  placeholder="+254 700 000 000"
                  className={cn(
                    "pl-10",
                    validation.errors.contact_phone && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </div>
              {validation.errors.contact_phone && (
                <p className="text-sm text-destructive">{validation.errors.contact_phone}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </div>
            Special Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={contact.specialRequests}
            onChange={(e) => updateContact("specialRequests", e.target.value)}
            placeholder="Any dietary requirements, accessibility needs, or special requests..."
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Special requests cannot be guaranteed but we&apos;ll do our best to accommodate them.
          </p>
        </CardContent>
      </Card>

      <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <p>
          By providing your contact information, you agree to receive booking-related
          communications via email and SMS. Your information is protected and will not
          be shared with third parties.
        </p>
      </div>
    </div>
  )
}
