"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Plus,
  Search,
  FileText,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
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
import { format } from "date-fns"
import { SectionError } from "@/components/error"

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  status: "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED" | "REJECTED" | "ARCHIVED"
  viewCount: number
  readingTime: number | null
  rejectionReason: string | null
  category: {
    id: string
    name: string
    color: string | null
  } | null
  createdAt: string
  updatedAt: string
}

export default function AgentBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.set("status", statusFilter)
      }
      if (search) {
        params.set("search", search)
      }

      const response = await fetch(`/api/agent/blog?${params}`)
      const data = await response.json()

      if (data.posts) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Failed to load blog posts")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPosts()
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/agent/blog/${deleteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Blog post deleted successfully")
        fetchPosts()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete blog post")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete blog post")
    } finally {
      setDeleteId(null)
    }
  }

  const getStatusBadge = (status: string, rejectionReason?: string | null) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-600">Published</Badge>
      case "PENDING_APPROVAL":
        return <Badge className="bg-amber-600">Pending Approval</Badge>
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>
      case "REJECTED":
        return (
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Rejected</Badge>
            {rejectionReason && (
              <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={rejectionReason}>
                {rejectionReason}
              </span>
            )}
          </div>
        )
      case "ARCHIVED":
        return <Badge variant="outline">Archived</Badge>
      default:
        return null
    }
  }

  const pendingCount = posts.filter((p) => p.status === "PENDING_APPROVAL").length
  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length
  const rejectedCount = posts.filter((p) => p.status === "REJECTED").length

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">My Blog Posts</h1>
          <p className="text-sm text-muted-foreground">
            Write and manage your blog posts
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/agent/blog/new">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <SectionError name="Blog Stats">
        <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{posts.length}</div>
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
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCount}</div>
            </CardContent>
          </Card>
        </div>
      </SectionError>

      {/* Info Banner */}
      <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Blog Post Approval</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your blog posts will be reviewed by our team before being published.
                This usually takes 1-2 business days.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>

            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
              <TabsList className="w-full sm:w-auto overflow-x-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                <TabsTrigger value="pending_approval" className="text-xs sm:text-sm">Pending</TabsTrigger>
                <TabsTrigger value="published" className="text-xs sm:text-sm">Published</TabsTrigger>
                <TabsTrigger value="rejected" className="text-xs sm:text-sm">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <SectionError name="Blog Posts Table">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No blog posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your expertise and travel stories with our community
                </p>
                <Button asChild>
                  <Link href="/agent/blog/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Write Your First Post
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-sm text-muted-foreground">
                            /{post.slug}
                            {post.readingTime && (
                              <span className="ml-2">{post.readingTime} min read</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.category ? (
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: post.category.color || undefined,
                            color: post.category.color || undefined,
                          }}
                        >
                          {post.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(post.status, post.rejectionReason)}</TableCell>
                    <TableCell>{post.viewCount.toLocaleString()}</TableCell>
                    <TableCell>
                      {format(new Date(post.updatedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {post.status === "PUBLISHED" && (
                            <DropdownMenuItem asChild>
                              <Link href={`/blog/${post.slug}`} target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {post.status !== "PUBLISHED" && (
                            <DropdownMenuItem asChild>
                              <Link href={`/agent/blog/${post.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {post.status !== "PUBLISHED" && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(post.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
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
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog post? This action cannot
              be undone.
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
