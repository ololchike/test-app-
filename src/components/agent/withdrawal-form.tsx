"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Download, Loader2 } from "lucide-react"

interface WithdrawalFormProps {
  availableBalance: number
  currency?: string
  onSuccess?: () => void
}

export function WithdrawalForm({
  availableBalance,
  currency = "USD",
  onSuccess,
}: WithdrawalFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Form state
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<"mpesa" | "bank">("mpesa")
  const [mpesaPhone, setMpesaPhone] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [branchCode, setBranchCode] = useState("")
  const [swiftCode, setSwiftCode] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate amount
      const amountValue = parseFloat(amount)
      if (isNaN(amountValue) || amountValue <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount",
          variant: "destructive",
        })
        return
      }

      if (amountValue > availableBalance) {
        toast({
          title: "Insufficient Balance",
          description: `You can only withdraw up to ${currency} ${availableBalance.toFixed(2)}`,
          variant: "destructive",
        })
        return
      }

      // Build request payload
      const payload: any = {
        amount: amountValue,
        currency,
        method,
      }

      if (method === "mpesa") {
        if (!mpesaPhone) {
          toast({
            title: "Missing Information",
            description: "Please enter your M-Pesa phone number",
            variant: "destructive",
          })
          return
        }
        payload.mpesaPhone = mpesaPhone
      } else {
        if (!bankName || !accountNumber || !accountName) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required bank details",
            variant: "destructive",
          })
          return
        }
        payload.bankDetails = {
          bankName,
          accountNumber,
          accountName,
          branchCode: branchCode || undefined,
          swiftCode: swiftCode || undefined,
        }
      }

      // Submit withdrawal request
      const response = await fetch("/api/agent/withdrawals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit withdrawal request")
      }

      toast({
        title: "Success",
        description: "Your withdrawal request has been submitted successfully",
      })

      // Reset form
      setAmount("")
      setMpesaPhone("")
      setBankName("")
      setAccountNumber("")
      setAccountName("")
      setBranchCode("")
      setSwiftCode("")
      setOpen(false)

      // Call onSuccess callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-3 w-3 mr-2" />
          Request Withdrawal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Withdrawal</DialogTitle>
          <DialogDescription>
            Request a withdrawal from your available balance. Processing typically takes 1-3 business days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({currency})</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={availableBalance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Available balance: {currency} {availableBalance.toFixed(2)}
            </p>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup value={method} onValueChange={(value: any) => setMethod(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mpesa" id="mpesa" />
                <Label htmlFor="mpesa" className="font-normal cursor-pointer">
                  M-Pesa
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="font-normal cursor-pointer">
                  Bank Transfer
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* M-Pesa Details */}
          {method === "mpesa" && (
            <div className="space-y-2">
              <Label htmlFor="mpesaPhone">M-Pesa Phone Number</Label>
              <Input
                id="mpesaPhone"
                type="tel"
                placeholder="+254712345678 or 0712345678"
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter your registered M-Pesa phone number
              </p>
            </div>
          )}

          {/* Bank Details */}
          {method === "bank" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="e.g., Equity Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="Full name as registered"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="branchCode">Branch Code (Optional)</Label>
                  <Input
                    id="branchCode"
                    placeholder="Branch Code"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="swiftCode">SWIFT Code (Optional)</Label>
                  <Input
                    id="swiftCode"
                    placeholder="SWIFT Code"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
