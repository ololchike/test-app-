"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CreditCard,
  Percent,
  Tag,
  CheckCircle,
  AlertCircle,
  Lock,
  Shield,
  Sparkles,
  X,
  Clock,
  Calendar,
  Smartphone,
  Wallet,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useCheckout } from "../checkout-context"
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_CONFIG,
  PAYMENT_TYPES,
  type PaymentMethod,
} from "../types"

export function PaymentStep() {
  const { state, setPaymentType, setPaymentMethod, applyPromoCode, removePromoCode, acceptedTerms, setAcceptedTerms } = useCheckout()
  const { tour, pricing, promoCode, paymentType, paymentMethod } = state

  const [promoInput, setPromoInput] = useState("")
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)
  const [promoError, setPromoError] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) {
      setPromoError("Please enter a promo code")
      return
    }

    setIsValidatingPromo(true)
    setPromoError(null)

    try {
      const success = await applyPromoCode(promoInput)
      if (!success) {
        setPromoError("Invalid or expired promo code")
      } else {
        setPromoInput("")
      }
    } catch (err) {
      setPromoError("Failed to validate promo code")
    } finally {
      setIsValidatingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    removePromoCode()
    setPromoInput("")
    setPromoError(null)
  }

  if (!tour) return null

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Payment Options</h2>
        <p className="text-sm text-muted-foreground">
          Choose your preferred payment option and apply any discount codes.
        </p>
      </div>

      {/* Promo Code Section */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Tag className="h-4 w-4 text-amber-600" />
            </div>
            Promo Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          {promoCode ? (
            <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold">{promoCode.code}</p>
                  <p className="text-sm text-emerald-600">
                    {formatCurrency(pricing.discount)} discount applied
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePromo}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase())
                    setPromoError(null)
                  }}
                  disabled={isValidatingPromo}
                  className="flex-1"
                />
                <Button
                  onClick={handleApplyPromo}
                  disabled={isValidatingPromo || !promoInput.trim()}
                >
                  {isValidatingPromo ? "Validating..." : "Apply"}
                </Button>
              </div>
              {promoError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {promoError}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Option Selection */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-emerald-600" />
            </div>
            Payment Option
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Full Payment */}
          <div
            onClick={() => setPaymentType("FULL")}
            className={cn(
              "flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all",
              paymentType === "FULL"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className={cn(
              "p-2 rounded-full shrink-0",
              paymentType === "FULL" ? "bg-primary text-white" : "bg-muted"
            )}>
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">Pay in Full</p>
                {paymentType === "FULL" && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Pay the full amount of {formatCurrency(pricing.total)} now
              </p>
            </div>
          </div>

          {/* Deposit Payment - only show if deposit is enabled */}
          {tour.depositEnabled && (
            <div
              onClick={() => setPaymentType("DEPOSIT")}
              className={cn(
                "flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all",
                paymentType === "DEPOSIT"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className={cn(
                "p-2 rounded-full shrink-0",
                paymentType === "DEPOSIT" ? "bg-primary text-white" : "bg-muted"
              )}>
                <Percent className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">Pay Deposit ({tour.depositPercentage}%)</p>
                  {paymentType === "DEPOSIT" && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Pay {formatCurrency(pricing.depositAmount)} now,{" "}
                  {formatCurrency(pricing.balanceAmount)} balance due later
                </p>
              </div>
            </div>
          )}

          {/* Book Now, Pay Later */}
          <div
            onClick={() => setPaymentType("PAY_LATER")}
            className={cn(
              "flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all",
              paymentType === "PAY_LATER"
                ? "border-amber-500 bg-amber-500/5"
                : "border-border hover:border-amber-500/50"
            )}
          >
            <div className={cn(
              "p-2 rounded-full shrink-0",
              paymentType === "PAY_LATER" ? "bg-amber-500 text-white" : "bg-muted"
            )}>
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">Book Now, Pay Later</p>
                {paymentType === "PAY_LATER" && (
                  <CheckCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Reserve your spot now and pay before your trip
              </p>
            </div>
          </div>

          {/* Payment Info Messages */}
          {paymentType === "DEPOSIT" && tour.depositEnabled && (
            <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-2">
              <p>
                <strong>Deposit:</strong> {formatCurrency(pricing.depositAmount)} due today
              </p>
              <p>
                <strong>Balance:</strong> {formatCurrency(pricing.balanceAmount)} due {tour.freeCancellationDays} days before your trip
              </p>
              <p className="text-muted-foreground">
                Free cancellation available up to {tour.freeCancellationDays} days before your trip starts.
              </p>
            </div>
          )}

          {paymentType === "PAY_LATER" && (
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-sm space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Calendar className="h-4 w-4" />
                <strong>No payment required today</strong>
              </div>
              <p className="text-amber-600 dark:text-amber-400/80">
                Your booking will be confirmed and you&apos;ll receive payment instructions.
                Full payment of {formatCurrency(pricing.total)} is due {tour.freeCancellationDays} days before your trip.
              </p>
              <p className="text-muted-foreground">
                Free cancellation available up to {tour.freeCancellationDays} days before your trip starts.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Selection - only show if not PAY_LATER */}
      {paymentType !== PAYMENT_TYPES.PAY_LATER && (
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.keys(PAYMENT_METHODS) as Array<keyof typeof PAYMENT_METHODS>).map((method) => {
              const config = PAYMENT_METHOD_CONFIG[method]
              const isSelected = paymentMethod === method
              const isDisabled = !config.available

              return (
                <div
                  key={method}
                  onClick={() => !isDisabled && setPaymentMethod(method)}
                  className={cn(
                    "flex items-start gap-4 p-4 border rounded-xl transition-all",
                    isDisabled
                      ? "opacity-50 cursor-not-allowed border-border bg-muted/30"
                      : "cursor-pointer",
                    isSelected && !isDisabled
                      ? "border-primary bg-primary/5"
                      : !isDisabled && "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-full shrink-0",
                    isSelected && !isDisabled ? "bg-primary text-white" : "bg-muted"
                  )}>
                    {config.icon === "smartphone" && <Smartphone className="h-5 w-5" />}
                    {config.icon === "wallet" && <Wallet className="h-5 w-5" />}
                    {config.icon === "credit-card" && <CreditCard className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{config.label}</p>
                      {isSelected && !isDisabled && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                      {isDisabled && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Terms & Conditions */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
              className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="space-y-1">
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                I accept the terms and conditions
              </Label>
              <p className="text-sm text-muted-foreground">
                By proceeding, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <div className="space-y-3 p-4 rounded-xl bg-muted/30">
        <div className="flex items-center gap-3 text-sm">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Lock className="h-4 w-4 text-emerald-600" />
          </div>
          <span>256-bit SSL Encryption</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-emerald-600" />
          </div>
          <span>Secure Payment Processing</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <span>Money-Back Guarantee</span>
        </div>
      </div>

      {/* Payment Amount Summary */}
      <div className={cn(
        "p-4 rounded-xl border",
        paymentType === "PAY_LATER"
          ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20"
          : "bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {paymentType === "PAY_LATER" ? (
              <Clock className="h-5 w-5 text-amber-500" />
            ) : (
              <Sparkles className="h-5 w-5 text-primary" />
            )}
            <span className="font-semibold">
              {paymentType === "PAY_LATER"
                ? "Due Today"
                : paymentType === "DEPOSIT" && tour.depositEnabled
                ? "Amount Due Today"
                : "Total Amount"}
            </span>
          </div>
          <span className={cn(
            "text-2xl font-bold",
            paymentType === "PAY_LATER" ? "text-amber-500" : "text-primary"
          )}>
            {paymentType === "PAY_LATER"
              ? formatCurrency(0)
              : formatCurrency(
                  paymentType === "DEPOSIT" && tour.depositEnabled
                    ? pricing.depositAmount
                    : pricing.total
                )}
          </span>
        </div>
        {paymentType === "DEPOSIT" && tour.depositEnabled && (
          <p className="text-sm text-muted-foreground mt-2">
            + {formatCurrency(pricing.balanceAmount)} balance due before trip
          </p>
        )}
        {paymentType === "PAY_LATER" && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
            {formatCurrency(pricing.total)} due before your trip
          </p>
        )}
      </div>
    </div>
  )
}

