"use client"

import { useState, useEffect } from "react"
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Star,
  Heart,
  Loader2,
  Camera,
  Edit,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface ProfileData {
  id: string
  email: string
  name: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  avatar: string | null
  createdAt: string
  stats: {
    totalBookings: number
    completedBookings: number
    upcomingBookings: number
    reviewsWritten: number
    savedTours: number
    destinationsVisited: number
    countriesVisited: number
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/client/profile")
      const data = await response.json()
      if (data.success) {
        setProfile(data.data)
        setFormData({
          firstName: data.data.firstName || "",
          lastName: data.data.lastName || "",
          phone: data.data.phone || "",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/client/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) {
        setProfile((prev) => prev ? { ...prev, ...data.data } : null)
        setIsEditing(false)
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-32 mt-4" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar || undefined} />
                  <AvatarFallback className="text-2xl">
                    {profile.name?.[0]?.toUpperCase() || (
                      <User className="h-8 w-8" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-semibold mt-4">
                {profile.name || "Traveler"}
              </h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Member since {format(new Date(profile.createdAt), "MMMM yyyy")}
              </p>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Travel Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Total Trips
                </span>
                <span className="font-medium">
                  {profile.stats.totalBookings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Destinations
                </span>
                <span className="font-medium">
                  {profile.stats.destinationsVisited}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Countries
                </span>
                <span className="font-medium">
                  {profile.stats.countriesVisited}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Reviews Written
                </span>
                <span className="font-medium">
                  {profile.stats.reviewsWritten}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Saved Tours
                </span>
                <span className="font-medium">{profile.stats.savedTours}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Card */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="+254 700 000 000"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">First Name</p>
                      <p className="font-medium">
                        {profile.firstName || "Not set"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Last Name</p>
                      <p className="font-medium">
                        {profile.lastName || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </p>
                    <p className="font-medium">{profile.email}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </p>
                    <p className="font-medium">{profile.phone || "Not set"}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Trips Preview */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-bold text-primary">
                    {profile.stats.upcomingBookings}
                  </p>
                  <p className="text-sm text-muted-foreground">Upcoming Trips</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-bold text-green-600">
                    {profile.stats.completedBookings}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completed Trips
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-bold text-orange-500">
                    {profile.stats.savedTours}
                  </p>
                  <p className="text-sm text-muted-foreground">Saved Tours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
