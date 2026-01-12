"use client"

import { useState } from "react"
import { CreditCardIcon, SmartphoneIcon, Shield, Lock, CheckCircle } from "lucide-react"
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

const paymentMethods = [
  {
    id: "MPESA" as const,
    name: "M-Pesa",
    description: "Pay with M-Pesa mobile money",
    icon: SmartphoneIcon,
    color: "emerald",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-500/30",
    ringColor: "ring-emerald-500/20",
  },
  {
    id: "CARD" as const,
    name: "Credit / Debit Card",
    description: "Visa, Mastercard, and more",
    icon: CreditCardIcon,
    color: "blue",
    bgGradient: "from-blue-500/10 to-indigo-500/10",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    borderColor: "border-blue-500/30",
    ringColor: "ring-blue-500/20",
  },
]

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
    <div className="space-y-5">
      <RadioGroup value={selectedMethod} onValueChange={(value) => onMethodChange(value as PaymentMethod)}>
        {paymentMethods.map((method) => {
          const Icon = method.icon
          const isSelected = selectedMethod === method.id

          return (
            <div
              key={method.id}
              className={cn(
                "relative flex items-start space-x-4 rounded-xl border-2 p-5 transition-all duration-300",
                isSelected
                  ? `${method.borderColor} bg-gradient-to-r ${method.bgGradient} ring-4 ${method.ringColor}`
                  : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
              )}
            >
              <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
              <div className="flex-1 space-y-3">
                <Label
                  htmlFor={method.id}
                  className="flex items-center gap-3 cursor-pointer text-base font-medium"
                >
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                    isSelected ? method.iconBg : "bg-muted/50"
                  )}>
                    <Icon className={cn(
                      "h-6 w-6 transition-colors duration-300",
                      isSelected ? method.iconColor : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {method.name}
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {method.description}
                    </div>
                  </div>
                </Label>

                {/* M-Pesa Phone Input */}
                {isSelected && method.id === "MPESA" && (
                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      M-Pesa Phone Number
                    </Label>
                    <div className="relative">
                      <div className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm transition-colors",
                        isFocused ? "text-foreground" : "text-muted-foreground"
                      )}>
                        <span className="font-semibold">+254</span>
                        <span className="text-border">|</span>
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
                          "pl-24 h-12 rounded-xl border-border/50 focus:border-primary/50 transition-all duration-300",
                          phoneNumberError && "border-destructive focus-visible:ring-destructive/20"
                        )}
                        aria-invalid={!!phoneNumberError}
                      />
                    </div>
                    {phoneNumberError && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-destructive" />
                        {phoneNumberError}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <SmartphoneIcon className="h-3 w-3" />
                      You&apos;ll receive an M-Pesa prompt to complete payment
                    </p>
                  </div>
                )}

                {/* Card Redirect Notice */}
                {isSelected && method.id === "CARD" && (
                  <div className="mt-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll be redirected to our secure payment partner to complete your card payment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </RadioGroup>

      {/* Payment Security Notice */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Lock className="h-3 w-3 text-emerald-600" />
          </div>
          <span>256-bit SSL Encryption</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Shield className="h-3 w-3 text-emerald-600" />
          </div>
          <span>Secured by Pesapal</span>
        </div>
      </div>
    </div>
  )
}
