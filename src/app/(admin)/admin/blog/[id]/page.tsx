"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  X,
  ImageIcon,
  Video,
  Loader2,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
}

interface UploadedMedia {
  url: string
  publicId: string
  resourceType: "image" | "video"
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  images: string[]
  videoUrl: string | null
  authorName: string | null
  authorBio: string | null
  authorAvatar: string | null
  categoryId: string | null
  tags: string[]
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string[]
  status: "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED" | "REJECTED" | "ARCHIVED"
  isFeatured: boolean
  submittedBy: "ADMIN" | "AGENT" | "CLIENT"
  submitterId: string | null
  submitter: { name: string | null; email: string } | null
  rejectionReason: string | null
}

export default function AdminEditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    coverImagePublicId: "",
    images: [] as UploadedMedia[],
    videoUrl: "",
    videoPublicId: "",
    authorName: "",
    authorBio: "",
    authorAvatar: "",
    categoryId: "",
    tags: [] as string[],
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [] as string[],
    status: "DRAFT" as BlogPost["status"],
    isFeatured: false,
    submittedBy: "ADMIN" as BlogPost["submittedBy"],
    submitter: null as BlogPost["submitter"],
    rejectionReason: "",
  })

  const [newTag, setNewTag] = useState("")
  const [newKeyword, setNewKeyword] = useState("")
  const [rejectReason, setRejectReason] = useState("")

  // Fetch post and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/admin/blog/${postId}`),
          fetch("/api/admin/blog/categories"),
        ])

        if (!postResponse.ok) {
          throw new Error("Post not found")
        }

        const postData = await postResponse.json()
        const categoriesData = await categoriesResponse.json()

        if (postData.post) {
          const post: BlogPost = postData.post
          setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || "",
            content: post.content,
            coverImage: post.coverImage || "",
            coverImagePublicId: "",
            images: post.images.map((url) => ({ url, publicId: "", resourceType: "image" as const })),
            videoUrl: post.videoUrl || "",
            videoPublicId: "",
            authorName: post.authorName || "",
            authorBio: post.authorBio || "",
            authorAvatar: post.authorAvatar || "",
            categoryId: post.categoryId || "",
            tags: post.tags,
            metaTitle: post.metaTitle || "",
            metaDescription: post.metaDescription || "",
            metaKeywords: post.metaKeywords,
            status: post.status,
            isFeatured: post.isFeatured,
            submittedBy: post.submittedBy,
            submitter: post.submitter,
            rejectionReason: post.rejectionReason || "",
          })
        }

        if (categoriesData.categories) {
          setCategories(categoriesData.categories)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load blog post")
        router.push("/admin/blog")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [postId, router])

  // Upload handlers (same as new page)
  const uploadFile = async (
    file: File,
    type: "cover" | "gallery" | "video"
  ): Promise<UploadedMedia | null> => {
    const formDataUpload = new FormData()
    formDataUpload.append("file", file)
    formDataUpload.append("type", type === "video" ? "video" : "image")

    try {
      const response = await fetch("/api/upload/blog", {
        method: "POST",
        body: formDataUpload,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      return {
        url: data.url,
        publicId: data.publicId,
        resourceType: data.resourceType,
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Upload failed")
      return null
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    const result = await uploadFile(file, "cover")
    if (result) {
      setFormData((prev) => ({
        ...prev,
        coverImage: result.url,
        coverImagePublicId: result.publicId,
      }))
      toast.success("Cover image uploaded")
    }
    setUploadingCover(false)
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploadingImages(true)
    const newImages: UploadedMedia[] = []

    for (const file of Array.from(files)) {
      const result = await uploadFile(file, "gallery")
      if (result) {
        newImages.push(result)
      }
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }))
    toast.success(`${newImages.length} image(s) uploaded`)
    setUploadingImages(false)
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingVideo(true)
    const result = await uploadFile(file, "video")
    if (result) {
      setFormData((prev) => ({
        ...prev,
        videoUrl: result.url,
        videoPublicId: result.publicId,
      }))
      toast.success("Video uploaded")
    }
    setUploadingVideo(false)
  }

  const removeImage = async (index: number) => {
    const image = formData.images[index]

    if (image.publicId) {
      try {
        await fetch("/api/upload/blog", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: image.publicId }),
        })
      } catch (error) {
        console.error("Error deleting image:", error)
      }
    }

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const removeCover = async () => {
    if (formData.coverImagePublicId) {
      try {
        await fetch("/api/upload/blog", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: formData.coverImagePublicId }),
        })
      } catch (error) {
        console.error("Error deleting cover:", error)
      }
    }
    setFormData((prev) => ({
      ...prev,
      coverImage: "",
      coverImagePublicId: "",
    }))
  }

  const removeVideo = async () => {
    if (formData.videoPublicId) {
      try {
        await fetch("/api/upload/blog", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicId: formData.videoPublicId,
            resourceType: "video"
          }),
        })
      } catch (error) {
        console.error("Error deleting video:", error)
      }
    }
    setFormData((prev) => ({
      ...prev,
      videoUrl: "",
      videoPublicId: "",
    }))
  }

  // Tag and keyword handlers
  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const addKeyword = () => {
    if (newKeyword && !formData.metaKeywords.includes(newKeyword)) {
      setFormData((prev) => ({
        ...prev,
        metaKeywords: [...prev.metaKeywords, newKeyword],
      }))
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter((k) => k !== keyword),
    }))
  }

  // Submit handler
  const handleSubmit = async (newStatus?: BlogPost["status"]) => {
    if (!formData.title) {
      toast.error("Title is required")
      return
    }
    if (!formData.slug) {
      toast.error("Slug is required")
      return
    }
    if (!formData.content) {
      toast.error("Content is required")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: newStatus || formData.status,
          images: formData.images.map((img) => img.url),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update blog post")
      }

      toast.success("Blog post updated successfully")
      router.push("/admin/blog")
    } catch (error) {
      console.error("Error updating blog post:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update blog post")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Approve/Reject handlers
  const handleApprove = async () => {
    await handleSubmit("PUBLISHED")
  }

  const handleReject = async () => {
    if (!rejectReason) {
      toast.error("Please provide a rejection reason")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REJECTED",
          rejectionReason: rejectReason,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject post")
      }

      toast.success("Blog post rejected")
      router.push("/admin/blog")
    } catch (error) {
      console.error("Error rejecting post:", error)
      toast.error("Failed to reject post")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete handler
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      toast.success("Blog post deleted")
      router.push("/admin/blog")
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete post")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isPendingApproval = formData.status === "PENDING_APPROVAL"
  const isFromExternalSubmitter = formData.submittedBy !== "ADMIN"

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blog">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Blog Post</h1>
            <p className="text-muted-foreground">
              {isPendingApproval ? "Review and approve this submission" : "Update blog post"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPendingApproval ? (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Blog Post</AlertDialogTitle>
                    <AlertDialogDescription>
                      Please provide a reason for rejection. This will be shared with the author.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    rows={3}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground">
                      Reject
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={handleApprove} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve & Publish
              </Button>
            </>
          ) : (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this blog post? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="outline"
                onClick={() => handleSubmit("DRAFT")}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Draft
              </Button>
              <Button onClick={() => handleSubmit("PUBLISHED")} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                {formData.status === "PUBLISHED" ? "Update" : "Publish"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Submission Info Banner */}
      {isFromExternalSubmitter && (
        <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">
                  Submitted by {formData.submittedBy === "AGENT" ? "Agent" : "Client"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formData.submitter?.name || formData.submitter?.email || "Unknown user"}
                </p>
              </div>
              <Badge variant="outline" className="ml-auto">
                {formData.status.replace("_", " ")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Same as new page */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
              <CardDescription>Basic information about the blog post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter post title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="post-url-slug"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief summary of the post"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Content *</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                  placeholder="Write your blog post content..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Cover image, gallery, and video</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cover">
                <TabsList className="mb-4">
                  <TabsTrigger value="cover">Cover Image</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  <TabsTrigger value="video">Video</TabsTrigger>
                </TabsList>

                <TabsContent value="cover" className="space-y-4">
                  {formData.coverImage ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <Image
                        src={formData.coverImage}
                        alt="Cover"
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeCover}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverUpload}
                        disabled={uploadingCover}
                      />
                      {uploadingCover ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload cover image
                          </span>
                        </>
                      )}
                    </label>
                  )}
                </TabsContent>

                <TabsContent value="gallery" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border"
                      >
                        <Image
                          src={image.url}
                          alt={`Gallery ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleGalleryUpload}
                        disabled={uploadingImages}
                      />
                      {uploadingImages ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Plus className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Add images</span>
                        </>
                      )}
                    </label>
                  </div>
                </TabsContent>

                <TabsContent value="video" className="space-y-4">
                  {formData.videoUrl ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border bg-black">
                      <video
                        src={formData.videoUrl}
                        controls
                        className="w-full h-full"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeVideo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoUpload}
                        disabled={uploadingVideo}
                      />
                      {uploadingVideo ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Video className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload video
                          </span>
                        </>
                      )}
                    </label>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="SEO title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="SEO description"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Meta Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                  />
                  <Button type="button" onClick={addKeyword} variant="secondary">
                    Add
                  </Button>
                </div>
                {formData.metaKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.metaKeywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary">
                        {keyword}
                        <button onClick={() => removeKeyword(keyword)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured Post</Label>
                <Switch
                  id="featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked }))}
                />
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Current Status: <Badge variant="outline">{formData.status.replace("_", " ")}</Badge>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="icon" variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Author Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="authorName">Author Name</Label>
                <Input
                  id="authorName"
                  value={formData.authorName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, authorName: e.target.value }))}
                  placeholder="Guest author name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorBio">Author Bio</Label>
                <Textarea
                  id="authorBio"
                  value={formData.authorBio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, authorBio: e.target.value }))}
                  placeholder="Short bio"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
