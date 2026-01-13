"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

interface Tour {
  id: string
  slug: string
  title: string
  destination: string
  country: string
  coverImage: string | null
  basePrice: number
  durationDays: number
  durationNights: number
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED"
  featured: boolean
  viewCount: number
  createdAt: string
  _count: {
    bookings: number
    reviews: number
  }
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  PAUSED: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  ARCHIVED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
}

export default function AgentToursPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState("all")

  // Sync search from URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search") || ""
    if (urlSearch !== search) {
      setSearch(urlSearch)
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchTours() {
      try {
        const res = await fetch("/api/agent/tours")
        if (res.ok) {
          const data = await res.json()
          setTours(data.tours)
        }
      } catch (error) {
        console.error("Failed to fetch tours:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchTours()
    }
  }, [session?.user?.id])

  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.title.toLowerCase().includes(search.toLowerCase()) ||
      tour.destination.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || tour.status === statusFilter.toUpperCase()
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: tours.length,
    active: tours.filter((t) => t.status === "ACTIVE").length,
    draft: tours.filter((t) => t.status === "DRAFT").length,
    totalViews: tours.reduce((sum, t) => sum + t.viewCount, 0),
    totalBookings: tours.reduce((sum, t) => sum + t._count.bookings, 0),
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Tours</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage and track your tour listings
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/agent/tours/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Tour
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tours</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">Active ({stats.active})</TabsTrigger>
            <TabsTrigger value="draft" className="text-xs sm:text-sm">Draft ({stats.draft})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tours Grid */}
      {filteredTours.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tours found</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first tour listing"}
            </p>
            {!search && statusFilter === "all" && (
              <Button asChild>
                <Link href="/agent/tours/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Tour
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  )
}

function TourCard({ tour }: { tour: Tour }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/10]">
        {tour.coverImage ? (
          <Image
            src={tour.coverImage}
            alt={tour.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <MapPin className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge className={statusColors[tour.status]}>{tour.status}</Badge>
          {tour.featured && <Badge className="bg-primary">Featured</Badge>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/tours/${tour.slug}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Public Page
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/agent/tours/${tour.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Tour
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardContent className="p-4">
        <Link href={`/agent/tours/${tour.id}/edit`} className="hover:underline">
          <h3 className="font-semibold line-clamp-1">{tour.title}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {tour.destination}, {tour.country}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {tour.durationDays}D/{tour.durationNights}N
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            ${tour.basePrice}
          </span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {tour.viewCount} views
          </span>
          <span>{tour._count.bookings} bookings</span>
        </div>
      </CardContent>
    </Card>
  )
}
