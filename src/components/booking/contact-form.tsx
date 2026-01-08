"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Contact {
  name: string
  email: string
  phone: string
  specialRequests: string
}

interface ContactFormProps {
  contact: Contact
  onChange: (contact: Contact) => void
  errors?: {
    name?: string
    email?: string
    phone?: string
  }
}

export function ContactForm({ contact, onChange, errors }: ContactFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contact-name" className={cn(errors?.name && "text-destructive")}>
          Full Name *
        </Label>
        <Input
          id="contact-name"
          value={contact.name}
          onChange={(e) => onChange({ ...contact, name: e.target.value })}
          placeholder="Enter your full name"
          className={cn(errors?.name && "border-destructive focus-visible:ring-destructive")}
        />
        {errors?.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact-email" className={cn(errors?.email && "text-destructive")}>
            Email Address *
          </Label>
          <Input
            id="contact-email"
            type="email"
            value={contact.email}
            onChange={(e) => onChange({ ...contact, email: e.target.value })}
            placeholder="your@email.com"
            className={cn(errors?.email && "border-destructive focus-visible:ring-destructive")}
          />
          {errors?.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-phone" className={cn(errors?.phone && "text-destructive")}>
            Phone Number *
          </Label>
          <Input
            id="contact-phone"
            type="tel"
            value={contact.phone}
            onChange={(e) => onChange({ ...contact, phone: e.target.value })}
            placeholder="+254 700 000 000"
            className={cn(errors?.phone && "border-destructive focus-visible:ring-destructive")}
          />
          {errors?.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        We&apos;ll use this information to send booking confirmations and trip updates.
      </p>
    </div>
  )
}
