"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Loader2,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Copy,
  Trash2,
  MoreHorizontal,
  Users,
  Share2,
  QrCode,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Tour {
  id: string
  title: string
}

interface PromoCode {
  id: string
  code: string
  discountType: "PERCENTAGE" | "FIXED_AMOUNT"
  discountValue: number
  minBookingAmount: number | null
  maxDiscountAmount: number | null
  maxUses: number | null
  usesPerUser: number
  usedCount: number
  validFrom: string
  validUntil: string | null
  tourIds: string[]
  isActive: boolean
  createdAt: string
}

interface PromoCodeCreatorProps {
  tours?: Tour[]
  onCodeCreated?: () => void
}

export function PromoCodeCreator({ tours = [], onCodeCreated }: PromoCodeCreatorProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loadingCodes, setLoadingCodes] = useState(true)
  const [deleteCodeId, setDeleteCodeId] = useState<string | null>(null)
  const { toast } = useToast()

  // Form state
  const [code, setCode] = useState("")
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE")
  const [discountValue, setDiscountValue] = useState("")
  const [minBookingAmount, setMinBookingAmount] = useState("")
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [usesPerUser, setUsesPerUser] = useState("1")
  const [validFrom, setValidFrom] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [selectedTourIds, setSelectedTourIds] = useState<string[]>([])

  // Fetch existing promo codes
  const fetchPromoCodes = async () => {
    try {
      const response = await fetch("/api/agent/promo-codes")
      const data = await response.json()
      if (response.ok) {
        setPromoCodes(data.promoCodes || [])
      }
    } catch (error) {
      console.error("Error fetching promo codes:", error)
    } finally {
      setLoadingCodes(false)
    }
  }

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  // Generate random code
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCode(result)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: Record<string, unknown> = {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        usesPerUser: parseInt(usesPerUser) || 1,
      }

      if (minBookingAmount) {
        payload.minBookingAmount = parseFloat(minBookingAmount)
      }
      if (maxDiscountAmount && discountType === "PERCENTAGE") {
        payload.maxDiscountAmount = parseFloat(maxDiscountAmount)
      }
      if (maxUses) {
        payload.maxUses = parseInt(maxUses)
      }
      if (validFrom) {
        payload.validFrom = new Date(validFrom).toISOString()
      }
      if (validUntil) {
        payload.validUntil = new Date(validUntil).toISOString()
      }
      if (selectedTourIds.length > 0) {
        payload.tourIds = selectedTourIds
      }

      const response = await fetch("/api/agent/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create promo code")
      }

      toast({
        title: "Promo code created!",
        description: `Code ${data.promoCode.code} is now active.`,
      })

      // Reset form
      setCode("")
      setDiscountType("PERCENTAGE")
      setDiscountValue("")
      setMinBookingAmount("")
      setMaxDiscountAmount("")
      setMaxUses("")
      setUsesPerUser("1")
      setValidFrom("")
      setValidUntil("")
      setSelectedTourIds([])
      setOpen(false)

      // Refresh codes list
      fetchPromoCodes()
      onCodeCreated?.()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create promo code"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Toggle code active status
  const toggleCodeStatus = async (codeId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/agent/promo-codes/${codeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update promo code")
      }

      setPromoCodes((codes) =>
        codes.map((c) => (c.id === codeId ? { ...c, isActive: !isActive } : c))
      )

      toast({
        title: isActive ? "Promo code deactivated" : "Promo code activated",
        description: `The promo code is now ${isActive ? "inactive" : "active"}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update promo code",
        variant: "destructive",
      })
    }
  }

  // Delete promo code
  const deleteCode = async (codeId: string) => {
    try {
      const response = await fetch(`/api/agent/promo-codes/${codeId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete promo code")
      }

      setPromoCodes((codes) => codes.filter((c) => c.id !== codeId))
      setDeleteCodeId(null)

      toast({
        title: "Promo code deleted",
        description: "The promo code has been removed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete promo code",
        variant: "destructive",
      })
    }
  }

  // Copy code to clipboard
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied!",
      description: `Promo code ${code} copied to clipboard.`,
    })
  }

  // Share code via WhatsApp
  const shareViaWhatsApp = (promoCode: PromoCode) => {
    const discount = promoCode.discountType === "PERCENTAGE"
      ? `${promoCode.discountValue}% off`
      : `$${promoCode.discountValue} off`
    const message = `Use my promo code ${promoCode.code} to get ${discount} on your next safari booking! Book now at ${window.location.origin}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Promo Codes</h2>
          <p className="text-sm text-muted-foreground">
            Create promotional codes to attract more bookings
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Promo Code</DialogTitle>
              <DialogDescription>
                Create a promotional code for your tours. Share it with customers to offer discounts.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Promo Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    placeholder="SUMMER2024"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="uppercase"
                    required
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Uppercase letters and numbers only
                </p>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={discountType}
                    onValueChange={(value: "PERCENTAGE" | "FIXED_AMOUNT") => setDiscountType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">
                        <div className="flex items-center">
                          <Percent className="h-3 w-3 mr-2" />
                          Percentage
                        </div>
                      </SelectItem>
                      <SelectItem value="FIXED_AMOUNT">
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-2" />
                          Fixed Amount
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    {discountType === "PERCENTAGE" ? "Percentage (%)" : "Amount (USD)"}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    step={discountType === "PERCENTAGE" ? "1" : "0.01"}
                    min="0"
                    max={discountType === "PERCENTAGE" ? "100" : undefined}
                    placeholder={discountType === "PERCENTAGE" ? "10" : "25.00"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Min/Max amounts */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="minBookingAmount">Min Booking (USD)</Label>
                  <Input
                    id="minBookingAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Optional"
                    value={minBookingAmount}
                    onChange={(e) => setMinBookingAmount(e.target.value)}
                  />
                </div>
                {discountType === "PERCENTAGE" && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscountAmount">Max Discount (USD)</Label>
                    <Input
                      id="maxDiscountAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Optional"
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Usage limits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Total Uses Limit</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usesPerUser">Uses Per Customer</Label>
                  <Input
                    id="usesPerUser"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={usesPerUser}
                    onChange={(e) => setUsesPerUser(e.target.value)}
                  />
                </div>
              </div>

              {/* Validity dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valid From</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>

              {/* Tour selection */}
              {tours.length > 0 && (
                <div className="space-y-2">
                  <Label>Apply to Tours (Optional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Leave empty to apply to all your tours
                  </p>
                  <div className="border rounded-md max-h-32 overflow-y-auto p-2 space-y-1">
                    {tours.map((tour) => (
                      <label
                        key={tour.id}
                        className="flex items-center gap-2 p-1 hover:bg-muted rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTourIds.includes(tour.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTourIds([...selectedTourIds, tour.id])
                            } else {
                              setSelectedTourIds(selectedTourIds.filter((id) => id !== tour.id))
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm truncate">{tour.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
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
                      Creating...
                    </>
                  ) : (
                    "Create Code"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Promo codes list */}
      {loadingCodes ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : promoCodes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Tag className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="font-medium">No promo codes yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first promo code to start attracting more customers
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {promoCodes.map((promoCode) => (
            <Card key={promoCode.id} className={!promoCode.isActive ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-mono">{promoCode.code}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => copyCode(promoCode.code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={promoCode.isActive}
                      onCheckedChange={() => toggleCodeStatus(promoCode.id, promoCode.isActive)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => shareViaWhatsApp(promoCode)}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share via WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyCode(promoCode.code)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteCodeId(promoCode.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1">
                  {promoCode.discountType === "PERCENTAGE" ? (
                    <>
                      <Percent className="h-3 w-3" />
                      {promoCode.discountValue}% off
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-3 w-3" />
                      ${promoCode.discountValue} off
                    </>
                  )}
                  {promoCode.minBookingAmount && (
                    <span className="text-xs">
                      {" "}(min ${promoCode.minBookingAmount})
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>
                      {promoCode.usedCount}
                      {promoCode.maxUses ? `/${promoCode.maxUses}` : ""} uses
                    </span>
                  </div>
                  {promoCode.validUntil && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Expires {formatDate(promoCode.validUntil)}</span>
                    </div>
                  )}
                </div>
                {promoCode.tourIds.length > 0 && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {promoCode.tourIds.length} tour{promoCode.tourIds.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                )}
                {!promoCode.isActive && (
                  <Badge variant="outline" className="mt-2">
                    Inactive
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteCodeId} onOpenChange={() => setDeleteCodeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete promo code?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The promo code will be permanently deleted and cannot be used for future bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCodeId && deleteCode(deleteCodeId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
