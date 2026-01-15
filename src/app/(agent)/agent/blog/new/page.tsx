"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Send,
  X,
  ImageIcon,
  Video,
  Loader2,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionError } from "@/components/error"
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

export default function AgentNewBlogPage() {
  const router = useRouter()
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
    categoryId: "",
    tags: [] as string[],
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [] as string[],
  })

  const [newTag, setNewTag] = useState("")

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/blog/categories")
        const data = await response.json()
        if (data.categories) {
          setCategories(data.categories)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  // Generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }, [])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }))
  }

  // Upload handlers
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

  // Tag handlers
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

  // Submit handler
  const handleSubmit = async () => {
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
      const response = await fetch("/api/agent/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: formData.images.map((img) => img.url),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create blog post")
      }

      toast.success("Blog post submitted for approval!")
      router.push("/agent/blog")
    } catch (error) {
      console.error("Error creating blog post:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create blog post")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SectionError name="Blog Post Editor">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/agent/blog">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold">Write a Blog Post</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Share your travel expertise</p>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Submit for Approval
          </Button>
        </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
              <CardDescription>Write your blog post content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Enter post title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="post-url-slug"
                />
                <p className="text-xs text-muted-foreground">
                  URL: /blog/{formData.slug || "your-post-slug"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Summary</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  placeholder="Brief summary of your post (shown in listings)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Content *</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) =>
                    setFormData((prev) => ({ ...prev, content }))
                  }
                  placeholder="Write your blog post content..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Add images and video to your post</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cover">
                <TabsList className="mb-4 w-full sm:w-auto">
                  <TabsTrigger value="cover" className="text-xs sm:text-sm flex-1 sm:flex-none">Cover</TabsTrigger>
                  <TabsTrigger value="gallery" className="text-xs sm:text-sm flex-1 sm:flex-none">Gallery</TabsTrigger>
                  <TabsTrigger value="video" className="text-xs sm:text-sm flex-1 sm:flex-none">Video</TabsTrigger>
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
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
                            Click to upload video (max 100MB)
                          </span>
                        </>
                      )}
                    </label>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, categoryId: value }))
                }
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

          {/* Tags */}
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
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))
                  }
                  placeholder="SEO title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metaDescription: e.target.value,
                    }))
                  }
                  placeholder="SEO description"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </SectionError>
  )
}
