"use client"

import { useState, useEffect } from "react"
import { User, Building2, Bell, Lock, Loader2, Save, CheckCircle, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { SectionError } from "@/components/error"

interface ProfileData {
  user: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    email: string
    phone: string | null
    avatar: string | null
  }
  agent: {
    id: string
    businessName: string
    businessEmail: string | null
    businessPhone: string | null
    description: string | null
    logo: string | null
    coverImage: string | null
    address: string | null
    city: string | null
    country: string | null
    licenseNumber: string | null
    katoMember: boolean
    tatoMember: boolean
    autoMember: boolean
    isVerified: boolean
    verifiedAt: string | null
    yearsInBusiness: number | null
    toursConducted: number
    status: string
  }
}

interface NotificationPreferences {
  emailBookingConfirmation: boolean
  emailNewBooking: boolean
  emailBookingCancellation: boolean
  emailPaymentReceived: boolean
  emailNewMessage: boolean
  emailNewReview: boolean
  emailWithdrawalUpdate: boolean
  emailWeeklyReport: boolean
}

const defaultNotificationPrefs: NotificationPreferences = {
  emailBookingConfirmation: true,
  emailNewBooking: true,
  emailBookingCancellation: true,
  emailPaymentReceived: true,
  emailNewMessage: true,
  emailNewReview: true,
  emailWithdrawalUpdate: true,
  emailWeeklyReport: false,
}

export default function AgentSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  // Profile form states
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")

  // Business form states
  const [businessName, setBusinessName] = useState("")
  const [businessEmail, setBusinessEmail] = useState("")
  const [businessPhone, setBusinessPhone] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [yearsInBusiness, setYearsInBusiness] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(defaultNotificationPrefs)
  const [savingNotifications, setSavingNotifications] = useState(false)

  useEffect(() => {
    fetchProfile()
    loadNotificationPrefs()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/agent/profile")
      const data = await res.json()

      if (data.success) {
        setProfileData(data.data)
        setFirstName(data.data.user.firstName || "")
        setLastName(data.data.user.lastName || "")
        setPhone(data.data.user.phone || "")
        setBusinessName(data.data.agent.businessName || "")
        setBusinessEmail(data.data.agent.businessEmail || "")
        setBusinessPhone(data.data.agent.businessPhone || "")
        setDescription(data.data.agent.description || "")
        setAddress(data.data.agent.address || "")
        setCity(data.data.agent.city || "")
        setCountry(data.data.agent.country || "")
        setYearsInBusiness(data.data.agent.yearsInBusiness?.toString() || "")
        setLicenseNumber(data.data.agent.licenseNumber || "")
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const loadNotificationPrefs = () => {
    const saved = localStorage.getItem("agentNotificationPrefs")
    if (saved) {
      try {
        setNotificationPrefs(JSON.parse(saved))
      } catch {
        setNotificationPrefs(defaultNotificationPrefs)
      }
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/agent/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: phone || null,
          businessName,
          businessEmail: businessEmail || null,
          businessPhone: businessPhone || null,
          description: description || null,
          address: address || null,
          city: city || null,
          country: country || null,
          yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness) : null,
          licenseNumber: licenseNumber || null,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Profile updated successfully")
        setProfileData(data.data)
      } else {
        toast.error(data.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Failed to save profile:", error)
      toast.error("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch("/api/agent/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Password changed successfully")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(data.error || "Failed to change password")
      }
    } catch (error) {
      console.error("Failed to change password:", error)
      toast.error("Failed to change password")
    } finally {
      setChangingPassword(false)
    }
  }

  const updateNotificationPref = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...notificationPrefs, [key]: value }
    setNotificationPrefs(updated)
  }

  const saveNotificationPrefs = () => {
    setSavingNotifications(true)
    try {
      localStorage.setItem("agentNotificationPrefs", JSON.stringify(notificationPrefs))
      toast.success("Notification preferences saved")
    } catch {
      toast.error("Failed to save preferences")
    } finally {
      setSavingNotifications(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your account and business settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            <User className="h-4 w-4 mr-1 sm:mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="business" className="text-xs sm:text-sm">
            <Building2 className="h-4 w-4 mr-1 sm:mr-2" />
            Business
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">
            <Bell className="h-4 w-4 mr-1 sm:mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm">
            <Lock className="h-4 w-4 mr-1 sm:mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <SectionError name="Profile Settings">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData?.user.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 700 000 000"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={saveProfile} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          </SectionError>
        </TabsContent>

        <TabsContent value="business">
          <SectionError name="Business Settings">
            <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>
                      This information appears on your public operator profile
                    </CardDescription>
                  </div>
                  {profileData?.agent.isVerified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Safari Company Ltd"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">About / Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell potential customers about your company, your experience, and what makes your safaris special..."
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    {description.length}/2000 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessEmail">Business Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      placeholder="info@yoursafari.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      placeholder="+254 700 000 000"
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  Where is your business located?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Safari Road"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Nairobi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Kenya"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
                <CardDescription>
                  Additional information about your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="yearsInBusiness">Years in Business</Label>
                    <Input
                      id="yearsInBusiness"
                      type="number"
                      min="0"
                      max="100"
                      value={yearsInBusiness}
                      onChange={(e) => setYearsInBusiness(e.target.value)}
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="KTB/12345"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Memberships</Label>
                  <div className="flex flex-wrap gap-2">
                    {profileData?.agent.katoMember && (
                      <Badge variant="outline">KATO Member</Badge>
                    )}
                    {profileData?.agent.tatoMember && (
                      <Badge variant="outline">TATO Member</Badge>
                    )}
                    {profileData?.agent.autoMember && (
                      <Badge variant="outline">AUTO Member</Badge>
                    )}
                    {!profileData?.agent.katoMember &&
                      !profileData?.agent.tatoMember &&
                      !profileData?.agent.autoMember && (
                        <span className="text-sm text-muted-foreground">
                          No memberships added yet
                        </span>
                      )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Contact support to update your membership status
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Tours Conducted</Label>
                  <p className="text-2xl font-bold">
                    {profileData?.agent.toursConducted || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This count is updated automatically as you complete tours
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveProfile} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Business Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          </SectionError>
        </TabsContent>

        <TabsContent value="notifications">
          <SectionError name="Notification Settings">
            <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose which email notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Bookings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Booking</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you receive a new booking
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs.emailNewBooking}
                      onCheckedChange={(checked) => updateNotificationPref("emailNewBooking", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Booking Confirmation</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when a booking is confirmed
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs.emailBookingConfirmation}
                      onCheckedChange={(checked) => updateNotificationPref("emailBookingConfirmation", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Booking Cancellation</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when a booking is cancelled
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs.emailBookingCancellation}
                      onCheckedChange={(checked) => updateNotificationPref("emailBookingCancellation", checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Payments</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payment Received</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when a payment is received
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs.emailPaymentReceived}
                      onCheckedChange={(checked) => updateNotificationPref("emailPaymentReceived", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Withdrawal Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about withdrawal request status changes
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs.emailWithdrawalUpdate}
                      onCheckedChange={(checked) => updateNotificationPref("emailWithdrawalUpdate", checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Communication</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you receive a new message
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs.emailNewMessage}
                      onCheckedChange={(checked) => updateNotificationPref("emailNewMessage", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Reviews</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you receive a new review
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs.emailNewReview}
                      onCheckedChange={(checked) => updateNotificationPref("emailNewReview", checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Reports</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Report</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a weekly summary of your bookings and earnings
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs.emailWeeklyReport}
                      onCheckedChange={(checked) => updateNotificationPref("emailWeeklyReport", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={saveNotificationPrefs} disabled={savingNotifications}>
                  {savingNotifications ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
          </SectionError>
        </TabsContent>

        <TabsContent value="security">
          <SectionError name="Security Settings">
            <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={changePassword}
                  disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                >
                  {changingPassword ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Additional security settings for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Login History</Label>
                  <p className="text-sm text-muted-foreground">
                    View recent login activity on your account
                  </p>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active Sessions</Label>
                  <p className="text-sm text-muted-foreground">
                    Manage devices logged into your account
                  </p>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
          </SectionError>
        </TabsContent>
      </Tabs>
    </div>
  )
}
