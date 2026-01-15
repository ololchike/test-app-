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
  CheckCircle,
  Clock,
  Archive,
  Star,
  XCircle,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SectionError } from "@/components/error"
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

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  status: "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED" | "REJECTED" | "ARCHIVED"
  isFeatured: boolean
  viewCount: number
  readingTime: number | null
  submittedBy: "ADMIN" | "AGENT" | "CLIENT"
  rejectionReason: string | null
  category: {
    id: string
    name: string
    color: string | null
  } | null
  submitter: {
    id: string
    name: string | null
    email: string
  } | null
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

export default function AdminBlogPage() {
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

      const response = await fetch(`/api/admin/blog?${params}`)
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
      const response = await fetch(`/api/admin/blog/${deleteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Blog post deleted successfully")
        fetchPosts()
      } else {
        toast.error("Failed to delete blog post")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete blog post")
    } finally {
      setDeleteId(null)
    }
  }

  const toggleStatus = async (post: BlogPost, newStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    try {
      const response = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success(`Post ${newStatus.toLowerCase()}`)
        fetchPosts()
      } else {
        toast.error("Failed to update post")
      }
    } catch (error) {
      console.error("Error updating post:", error)
      toast.error("Failed to update post")
    }
  }

  const toggleFeatured = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !post.isFeatured }),
      })

      if (response.ok) {
        toast.success(
          post.isFeatured ? "Removed from featured" : "Added to featured"
        )
        fetchPosts()
      } else {
        toast.error("Failed to update post")
      }
    } catch (error) {
      console.error("Error updating post:", error)
      toast.error("Failed to update post")
    }
  }

  const handleReject = async (postId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REJECTED",
          rejectionReason: reason
        }),
      })

      if (response.ok) {
        toast.success("Post rejected")
        fetchPosts()
      } else {
        toast.error("Failed to reject post")
      }
    } catch (error) {
      console.error("Error rejecting post:", error)
      toast.error("Failed to reject post")
    }
  }

  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length
  const pendingCount = posts.filter((p) => p.status === "PENDING_APPROVAL").length
  const draftCount = posts.filter((p) => p.status === "DRAFT").length
  const rejectedCount = posts.filter((p) => p.status === "REJECTED").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-600">Published</Badge>
      case "PENDING_APPROVAL":
        return <Badge className="bg-amber-600">Pending</Badge>
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>
      case "ARCHIVED":
        return <Badge variant="outline">Archived</Badge>
      default:
        return null
    }
  }

  const getSubmitterBadge = (submittedBy: string) => {
    switch (submittedBy) {
      case "ADMIN":
        return <Badge variant="outline" className="text-xs">Admin</Badge>
      case "AGENT":
        return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Agent</Badge>
      case "CLIENT":
        return <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">Client</Badge>
      default:
        return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">
            Create and manage blog content
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <SectionError name="Blog Stats">
        <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{posts.length}</div>
            </CardContent>
          </Card>
          <Card className={pendingCount > 0 ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20" : ""}>
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
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftCount}</div>
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
                <TabsTrigger value="pending_approval" className="text-xs sm:text-sm">
                  Pending {pendingCount > 0 && <span className="ml-1 text-amber-600">({pendingCount})</span>}
                </TabsTrigger>
                <TabsTrigger value="published" className="text-xs sm:text-sm">Published</TabsTrigger>
                <TabsTrigger value="draft" className="text-xs sm:text-sm">Drafts</TabsTrigger>
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
              <h3 className="font-semibold mb-2">No blog posts found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first blog post to engage visitors
              </p>
              <Button asChild>
                <Link href="/admin/blog/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Submitted By</TableHead>
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
                          <div className="font-medium flex items-center gap-2">
                            {post.title}
                            {post.isFeatured && (
                              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                            )}
                          </div>
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
                      <div className="flex flex-col gap-1">
                        {getSubmitterBadge(post.submittedBy)}
                        {post.submitter && post.submittedBy !== "ADMIN" && (
                          <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={post.submitter.email}>
                            {post.submitter.name || post.submitter.email}
                          </span>
                        )}
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
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(post.status)}
                        {post.status === "REJECTED" && post.rejectionReason && (
                          <span className="text-xs text-muted-foreground truncate max-w-[100px]" title={post.rejectionReason}>
                            {post.rejectionReason}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{post.viewCount.toLocaleString()}</TableCell>
                    <TableCell>
                      {post.publishedAt
                        ? format(new Date(post.publishedAt), "MMM d, yyyy")
                        : format(new Date(post.updatedAt), "MMM d, yyyy")}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/blog/${post.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {post.status === "PENDING_APPROVAL" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => toggleStatus(post, "PUBLISHED")}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve & Publish
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  const reason = prompt("Enter rejection reason:")
                                  if (reason) {
                                    handleReject(post.id, reason)
                                  }
                                }}
                                className="text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {post.status === "DRAFT" && (
                            <DropdownMenuItem
                              onClick={() => toggleStatus(post, "PUBLISHED")}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {post.status === "PUBLISHED" && (
                            <DropdownMenuItem
                              onClick={() => toggleStatus(post, "DRAFT")}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Unpublish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => toggleFeatured(post)}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            {post.isFeatured ? "Remove Featured" : "Add Featured"}
                          </DropdownMenuItem>
                          {post.status !== "ARCHIVED" && (
                            <DropdownMenuItem
                              onClick={() => toggleStatus(post, "ARCHIVED")}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(post.id)}
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
