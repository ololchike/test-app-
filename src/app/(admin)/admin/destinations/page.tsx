"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Globe,
  Star,
  MoreHorizontal,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SectionError } from "@/components/error"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface Destination {
  id: string
  slug: string
  name: string
  country: string
  region: string | null
  heroImage: string | null
  isPublished: boolean
  isFeatured: boolean
  viewCount: number
  _count: {
    faqs: number
  }
  createdAt: string
  updatedAt: string
}

export default function AdminDestinationsPage() {
  const router = useRouter()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchDestinations = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.set("status", statusFilter)
      }
      if (search) {
        params.set("search", search)
      }

      const response = await fetch(`/api/admin/destinations?${params}`)
      const data = await response.json()

      if (data.destinations) {
        setDestinations(data.destinations)
      }
    } catch (error) {
      console.error("Error fetching destinations:", error)
      toast.error("Failed to load destinations")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDestinations()
  }, [statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchDestinations()
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/admin/destinations/${deleteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Destination deleted successfully")
        fetchDestinations()
      } else {
        toast.error("Failed to delete destination")
      }
    } catch (error) {
      console.error("Error deleting destination:", error)
      toast.error("Failed to delete destination")
    } finally {
      setDeleteId(null)
    }
  }

  const togglePublish = async (destination: Destination) => {
    try {
      const response = await fetch(`/api/admin/destinations/${destination.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !destination.isPublished }),
      })

      if (response.ok) {
        toast.success(
          destination.isPublished
            ? "Destination unpublished"
            : "Destination published"
        )
        fetchDestinations()
      } else {
        toast.error("Failed to update destination")
      }
    } catch (error) {
      console.error("Error updating destination:", error)
      toast.error("Failed to update destination")
    }
  }

  const toggleFeatured = async (destination: Destination) => {
    try {
      const response = await fetch(`/api/admin/destinations/${destination.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !destination.isFeatured }),
      })

      if (response.ok) {
        toast.success(
          destination.isFeatured
            ? "Removed from featured"
            : "Added to featured"
        )
        fetchDestinations()
      } else {
        toast.error("Failed to update destination")
      }
    } catch (error) {
      console.error("Error updating destination:", error)
      toast.error("Failed to update destination")
    }
  }

  const publishedCount = destinations.filter((d) => d.isPublished).length
  const draftCount = destinations.filter((d) => !d.isPublished).length
  const featuredCount = destinations.filter((d) => d.isFeatured).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Destination Guides</h1>
          <p className="text-muted-foreground">
            Create and manage rich destination content for SEO
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/destinations/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Destination
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <SectionError name="Destination Stats">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{destinations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
              <Star className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{featuredCount}</div>
            </CardContent>
          </Card>
        </div>
      </SectionError>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search destinations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>

            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <SectionError name="Destinations Table">
        <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading destinations...
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No destinations found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first destination guide to improve SEO
              </p>
              <Button asChild>
                <Link href="/admin/destinations/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Destination
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destination</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>FAQs</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {destinations.map((destination) => (
                  <TableRow key={destination.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {destination.name}
                            {destination.isFeatured && (
                              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            /{destination.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{destination.country}</TableCell>
                    <TableCell>
                      {destination.isPublished ? (
                        <Badge variant="default" className="bg-green-600">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>{destination._count.faqs}</TableCell>
                    <TableCell>{destination.viewCount.toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/destinations/${destination.slug}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/destinations/${destination.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => togglePublish(destination)}
                          >
                            {destination.isPublished ? (
                              <>
                                <Clock className="h-4 w-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleFeatured(destination)}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            {destination.isFeatured
                              ? "Remove Featured"
                              : "Add Featured"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(destination.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </SectionError>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Destination</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this destination guide? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
