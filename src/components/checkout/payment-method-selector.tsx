"use client"

import { useState } from "react"
import { CreditCardIcon, SmartphoneIcon } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type PaymentMethod = "MPESA" | "CARD"

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
  phoneNumber: string
  onPhoneNumberChange: (phone: string) => void
  phoneNumberError?: string
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  phoneNumber,
  onPhoneNumberChange,
  phoneNumberError,
}: PaymentMethodSelectorProps) {
  const [isFocused, setIsFocused] = useState(false)

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // If starts with 254, keep it
    if (digits.startsWith("254")) {
      return digits.slice(0, 12) // 254XXXXXXXXX (12 digits)
    }

    // If starts with 0, replace with 254
    if (digits.startsWith("0")) {
      return "254" + digits.slice(1, 10) // 254XXXXXXXXX
    }

    // If starts with 7, prepend 254
    if (digits.startsWith("7")) {
      return "254" + digits.slice(0, 9) // 254XXXXXXXXX
    }

    // Otherwise, prepend 254
    return "254" + digits.slice(0, 9)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    onPhoneNumberChange(formatted)
  }

  return (
    <div className="space-y-4">
      <RadioGroup value={selectedMethod} onValueChange={(value) => onMethodChange(value as PaymentMethod)}>
        {/* M-Pesa Option */}
        <div
          className={cn(
            "relative flex items-start space-x-3 rounded-lg border p-4 transition-all hover:bg-accent/50",
            selectedMethod === "MPESA" && "border-primary bg-accent/50 ring-2 ring-primary/20"
          )}
        >
          <RadioGroupItem value="MPESA" id="mpesa" className="mt-1" />
          <div className="flex-1 space-y-3">
            <Label
              htmlFor="mpesa"
              className="flex items-center gap-3 cursor-pointer text-base font-medium"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <SmartphoneIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div>M-Pesa</div>
                <div className="text-xs text-muted-foreground font-normal">
                  Pay with M-Pesa mobile money
                </div>
              </div>
            </Label>

            {selectedMethod === "MPESA" && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="phone" className="text-sm">
                  M-Pesa Phone Number
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">+254</span>
                    <span className="text-muted-foreground/50">|</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="712 345 678"
                    value={phoneNumber.startsWith("254") ? phoneNumber.slice(3) : phoneNumber}
                    onChange={handlePhoneChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={cn(
                      "pl-20",
                      phoneNumberError && "border-destructive focus-visible:ring-destructive/20"
                    )}
                    aria-invalid={!!phoneNumberError}
                  />
                </div>
                {phoneNumberError && (
                  <p className="text-xs text-destructive">{phoneNumberError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  You'll receive an M-Pesa prompt to complete payment
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card Option */}
        <div
          className={cn(
            "relative flex items-start space-x-3 rounded-lg border p-4 transition-all hover:bg-accent/50",
            selectedMethod === "CARD" && "border-primary bg-accent/50 ring-2 ring-primary/20"
          )}
        >
          <RadioGroupItem value="CARD" id="card" className="mt-1" />
          <div className="flex-1">
            <Label
              htmlFor="card"
              className="flex items-center gap-3 cursor-pointer text-base font-medium"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <CreditCardIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div>Credit / Debit Card</div>
                <div className="text-xs text-muted-foreground font-normal">
                  Visa, Mastercard, and more
                </div>
              </div>
            </Label>

            {selectedMethod === "CARD" && (
              <div className="mt-3 rounded-md bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">
                  You'll be redirected to our secure payment partner to complete your card payment.
                </p>
              </div>
            )}
          </div>
        </div>
      </RadioGroup>

      {/* Payment Security Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>Secured by Pesapal - Your payment information is encrypted</span>
      </div>
    </div>
  )
}
