"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import {
  X,
  ImageIcon,
  Video,
  Loader2,
  Plus,
  AlertCircle,
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
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { cn } from "@/lib/utils"

export interface BlogFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  coverImagePublicId: string
  images: UploadedMedia[]
  videoUrl: string
  videoPublicId: string
  authorName: string
  authorBio: string
  categoryId: string
  tags: string[]
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  isFeatured: boolean
}

export interface UploadedMedia {
  url: string
  publicId: string
  resourceType: "image" | "video"
}

export interface BlogFormErrors {
  title?: string
  slug?: string
  content?: string
  [key: string]: string | undefined
}

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
}

interface BlogFormProps {
  initialData?: Partial<BlogFormData>
  onSubmit: (data: BlogFormData) => Promise<void>
  isSubmitting?: boolean
  showAdvancedOptions?: boolean // Admin-only options like featured, author override
  showGallery?: boolean // Gallery and video upload
  categoriesEndpoint?: string
}

const defaultFormData: BlogFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  coverImagePublicId: "",
  images: [],
  videoUrl: "",
  videoPublicId: "",
  authorName: "",
  authorBio: "",
  categoryId: "",
  tags: [],
  metaTitle: "",
  metaDescription: "",
  metaKeywords: [],
  isFeatured: false,
}

export function BlogForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  showAdvancedOptions = false,
  showGallery = true,
  categoriesEndpoint = "/api/blog/categories",
}: BlogFormProps) {
  const [formData, setFormData] = useState<BlogFormData>({
    ...defaultFormData,
    ...initialData,
  })
  const [errors, setErrors] = useState<BlogFormErrors>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [newKeyword, setNewKeyword] = useState("")

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(categoriesEndpoint)
        const data = await response.json()
        if (data.categories) {
          setCategories(data.categories)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [categoriesEndpoint])

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
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
    setFormData((prev) => ({ ...prev, slug }))
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: undefined }))
    }
  }

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }))
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: undefined }))
    }
  }

  // Validate form
  const validate = (): boolean => {
    const newErrors: BlogFormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters"
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "URL slug is required"
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and dashes"
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required"
    } else if (formData.content.replace(/<[^>]*>/g, "").length < 50) {
      newErrors.content = "Content must be at least 50 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submit
  const handleSubmit = async () => {
    if (!validate()) return
    await onSubmit(formData)
  }

  // Expose submit handler
  useEffect(() => {
    // @ts-expect-error - Exposing submit method on window for parent component
    window.__blogFormSubmit = handleSubmit
    return () => {
      // @ts-expect-error - Cleanup
      delete window.__blogFormSubmit
    }
  }, [formData])

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

  // Field error component
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null
    return (
      <p className="text-sm text-destructive flex items-center gap-1 mt-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>Basic information about your post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className={cn(errors.title && "text-destructive")}>
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Enter post title"
                className={cn(errors.title && "border-destructive focus-visible:ring-destructive")}
              />
              <FieldError error={errors.title} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className={cn(errors.slug && "text-destructive")}>
                URL Slug *
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="post-url-slug"
                className={cn(errors.slug && "border-destructive focus-visible:ring-destructive")}
              />
              <p className="text-xs text-muted-foreground">
                URL: /blog/{formData.slug || "your-post-slug"}
              </p>
              <FieldError error={errors.slug} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Summary</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                placeholder="Brief summary of the post (shown in listings)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className={cn(errors.content && "text-destructive")}>Content *</Label>
              <div className={cn(errors.content && "ring-1 ring-destructive rounded-md")}>
                <RichTextEditor
                  content={formData.content}
                  onChange={handleContentChange}
                  placeholder="Write your blog post content..."
                />
              </div>
              <FieldError error={errors.content} />
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Add images and video</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cover">
              <TabsList className="mb-4">
                <TabsTrigger value="cover">Cover Image</TabsTrigger>
                {showGallery && <TabsTrigger value="gallery">Gallery</TabsTrigger>}
                {showGallery && <TabsTrigger value="video">Video</TabsTrigger>}
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

              {showGallery && (
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
              )}

              {showGallery && (
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
              )}
            </Tabs>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Search engine optimization (optional)</CardDescription>
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
                placeholder="SEO title (defaults to post title)"
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
                placeholder="SEO description (defaults to excerpt)"
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
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-destructive"
                      >
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
        {/* Status (Admin only) */}
        {showAdvancedOptions && (
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
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isFeatured: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Author (Admin only) */}
        {showAdvancedOptions && (
          <Card>
            <CardHeader>
              <CardTitle>Author Info</CardTitle>
              <CardDescription>Override default author</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="authorName">Author Name</Label>
                <Input
                  id="authorName"
                  value={formData.authorName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, authorName: e.target.value }))
                  }
                  placeholder="Guest author name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorBio">Author Bio</Label>
                <Textarea
                  id="authorBio"
                  value={formData.authorBio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, authorBio: e.target.value }))
                  }
                  placeholder="Short bio"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Export validation function for use in parent components
export function validateBlogForm(data: BlogFormData): BlogFormErrors {
  const errors: BlogFormErrors = {}

  if (!data.title.trim()) {
    errors.title = "Title is required"
  } else if (data.title.length < 5) {
    errors.title = "Title must be at least 5 characters"
  }

  if (!data.slug.trim()) {
    errors.slug = "URL slug is required"
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.slug = "Slug can only contain lowercase letters, numbers, and dashes"
  }

  if (!data.content.trim()) {
    errors.content = "Content is required"
  } else if (data.content.replace(/<[^>]*>/g, "").length < 50) {
    errors.content = "Content must be at least 50 characters"
  }

  return errors
}
