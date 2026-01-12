"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  Moon,
  Sun,
  Globe,
  DollarSign,
  Bell,
  Shield,
  Loader2,
  Check,
  Monitor,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface UserPreferences {
  currency: string
  language: string
  emailNotifications: boolean
  marketingEmails: boolean
  bookingReminders: boolean
  reviewRequests: boolean
}

const currencies = [
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
  { value: "KES", label: "Kenyan Shilling (KSh)", symbol: "KSh" },
  { value: "TZS", label: "Tanzanian Shilling (TSh)", symbol: "TSh" },
  { value: "UGX", label: "Ugandan Shilling (USh)", symbol: "USh" },
  { value: "ZAR", label: "South African Rand (R)", symbol: "R" },
]

const languages = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "sw", label: "Kiswahili" },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    currency: "USD",
    language: "en",
    emailNotifications: true,
    marketingEmails: false,
    bookingReminders: true,
    reviewRequests: true,
  })
  const { toast } = useToast()

  // Ensure theme component is mounted before rendering to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem("userPreferences")
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences))
      } catch (e) {
        console.error("Error parsing preferences:", e)
      }
    }
  }, [])

  const handlePreferenceChange = (key: keyof UserPreferences, value: string | boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const handleSavePreferences = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage for now
      localStorage.setItem("userPreferences", JSON.stringify(preferences))

      // In a real app, you'd also save to the server
      // await fetch("/api/client/preferences", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(preferences),
      // })

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how SafariPlus looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
                {theme === "light" && <Check className="h-4 w-4 ml-1" />}
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
                {theme === "dark" && <Check className="h-4 w-4 ml-1" />}
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
                {theme === "system" && <Check className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Settings
          </CardTitle>
          <CardDescription>
            Set your preferred currency and language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Currency
              </Label>
              <Select
                value={preferences.currency}
                onValueChange={(value) => handlePreferenceChange("currency", value)}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Prices will be displayed in your preferred currency
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => handlePreferenceChange("language", value)}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose your preferred language for the website
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage how you receive updates and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive important updates about your bookings via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                handlePreferenceChange("emailNotifications", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="booking-reminders">Booking Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminders before your upcoming trips
              </p>
            </div>
            <Switch
              id="booking-reminders"
              checked={preferences.bookingReminders}
              onCheckedChange={(checked) =>
                handlePreferenceChange("bookingReminders", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="review-requests">Review Requests</Label>
              <p className="text-sm text-muted-foreground">
                Receive requests to review tours after completion
              </p>
            </div>
            <Switch
              id="review-requests"
              checked={preferences.reviewRequests}
              onCheckedChange={(checked) =>
                handlePreferenceChange("reviewRequests", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive promotional offers and special deals
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={preferences.marketingEmails}
              onCheckedChange={(checked) =>
                handlePreferenceChange("marketingEmails", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Change Password</Label>
              <p className="text-sm text-muted-foreground">
                Update your account password
              </p>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-destructive">Delete Account</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  )
}
