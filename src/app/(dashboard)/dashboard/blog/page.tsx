"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PenLine,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

export default function DashboardBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/client/blog")
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
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/client/blog/${deleteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Blog post deleted")
        fetchPosts()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete")
    } finally {
      setDeleteId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-600">Published</Badge>
      case "PENDING_APPROVAL":
        return <Badge className="bg-amber-600">Pending</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">My Blog Posts</h1>
          <p className="text-sm text-muted-foreground">
            Share your travel experiences
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/blog/new">
            <Plus className="h-4 w-4 mr-2" />
            Write a Post
          </Link>
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Share Your Story</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your blog posts will be reviewed before publishing. Share your travel tips, experiences, and recommendations!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <SectionError name="Blog Posts">
        {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <PenLine className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No blog posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Share your travel stories with the community
              </p>
              <Button asChild>
                <Link href="/dashboard/blog/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Write Your First Post
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              {post.coverImage ? (
                <div className="relative aspect-video">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
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
                          <Link href={`/dashboard/blog/${post.id}`}>
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
                </div>
                <CardDescription className="line-clamp-2">
                  {post.excerpt || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm">
                  {getStatusBadge(post.status)}
                  <span className="text-muted-foreground">
                    {format(new Date(post.updatedAt), "MMM d, yyyy")}
                  </span>
                </div>
                {post.status === "REJECTED" && post.rejectionReason && (
                  <p className="text-xs text-destructive mt-2 line-clamp-2">
                    Reason: {post.rejectionReason}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </SectionError>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
