"use client"

import { useEffect, useState } from "react"
import { FileText, Save, Plus, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"

interface SiteContent {
  id: string
  key: string
  title: string
  content: string
  updatedAt: string
}

const PAGE_TEMPLATES = [
  { key: "privacy-policy", title: "Privacy Policy", path: "/privacy" },
  { key: "terms-of-service", title: "Terms of Service", path: "/terms" },
  { key: "cookies-policy", title: "Cookies Policy", path: "/cookies" },
]

export default function AdminSiteContentPage() {
  const [contents, setContents] = useState<SiteContent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingContent, setEditingContent] = useState<SiteContent | null>(null)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedContent, setEditedContent] = useState("")
  const [newPageDialogOpen, setNewPageDialogOpen] = useState(false)
  const [newPageKey, setNewPageKey] = useState("")

  useEffect(() => {
    fetchContents()
  }, [])

  async function fetchContents() {
    try {
      const response = await fetch("/api/admin/site-content")
      if (response.ok) {
        const data = await response.json()
        setContents(data.contents || [])
      }
    } catch (error) {
      console.error("Error fetching contents:", error)
      toast.error("Failed to load site content")
    } finally {
      setLoading(false)
    }
  }

  function startEditing(content: SiteContent) {
    setEditingContent(content)
    setEditedTitle(content.title)
    setEditedContent(content.content)
  }

  function cancelEditing() {
    setEditingContent(null)
    setEditedTitle("")
    setEditedContent("")
  }

  async function saveContent() {
    if (!editingContent) return

    setSaving(true)
    try {
      const response = await fetch("/api/admin/site-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: editingContent.key,
          title: editedTitle,
          content: editedContent,
        }),
      })

      if (response.ok) {
        toast.success("Content saved successfully")
        fetchContents()
        cancelEditing()
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Error saving content:", error)
      toast.error("Failed to save content")
    } finally {
      setSaving(false)
    }
  }

  async function createNewPage() {
    if (!newPageKey) return

    const template = PAGE_TEMPLATES.find((t) => t.key === newPageKey)
    if (!template) return

    setSaving(true)
    try {
      const response = await fetch("/api/admin/site-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: template.key,
          title: template.title,
          content: getDefaultContent(template.key),
        }),
      })

      if (response.ok) {
        toast.success(`${template.title} page created`)
        fetchContents()
        setNewPageDialogOpen(false)
        setNewPageKey("")
      } else {
        throw new Error("Failed to create")
      }
    } catch (error) {
      console.error("Error creating page:", error)
      toast.error("Failed to create page")
    } finally {
      setSaving(false)
    }
  }

  function getDefaultContent(key: string): string {
    switch (key) {
      case "privacy-policy":
        return `<h2>Privacy Policy</h2>
<p>This Privacy Policy explains how SafariPlus collects, uses, and protects your personal information.</p>
<h3>Information We Collect</h3>
<p>We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support.</p>
<h3>How We Use Your Information</h3>
<p>We use your information to process bookings, communicate with you, and improve our services.</p>
<h3>Contact Us</h3>
<p>If you have questions about this Privacy Policy, please contact us at privacy@safariplus.com.</p>`
      case "terms-of-service":
        return `<h2>Terms of Service</h2>
<p>These Terms of Service govern your use of the SafariPlus platform.</p>
<h3>Acceptance of Terms</h3>
<p>By using SafariPlus, you agree to these terms.</p>
<h3>User Responsibilities</h3>
<p>You are responsible for maintaining the confidentiality of your account.</p>
<h3>Booking Terms</h3>
<p>All bookings are subject to availability and the terms set by tour operators.</p>`
      case "cookies-policy":
        return `<h2>Cookies Policy</h2>
<p>This Cookies Policy explains how SafariPlus uses cookies and similar technologies.</p>
<h3>What Are Cookies</h3>
<p>Cookies are small text files stored on your device when you visit our website.</p>
<h3>How We Use Cookies</h3>
<p>We use cookies to remember your preferences, authenticate users, and analyze site traffic.</p>
<h3>Managing Cookies</h3>
<p>You can control cookies through your browser settings.</p>`
      default:
        return "<p>Content goes here...</p>"
    }
  }

  const existingKeys = contents.map((c) => c.key)
  const availableTemplates = PAGE_TEMPLATES.filter((t) => !existingKeys.includes(t.key))

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (editingContent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Edit {editingContent.title}</h1>
            <p className="text-muted-foreground mt-2">
              Use the rich text editor to update the content
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={cancelEditing}>
              Cancel
            </Button>
            <Button onClick={saveContent} disabled={saving}>
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Enter page title"
              />
            </div>

            <div className="space-y-2">
              <Label>Page Content</Label>
              <RichTextEditor
                content={editedContent}
                onChange={setEditedContent}
                placeholder="Enter page content..."
                className="min-h-[400px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Site Content</h1>
          <p className="text-muted-foreground mt-2">
            Manage editable pages like Privacy Policy, Terms, and Cookies
          </p>
        </div>
        {availableTemplates.length > 0 && (
          <Dialog open={newPageDialogOpen} onOpenChange={setNewPageDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Page
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Page</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Select Page Type</Label>
                  <Select value={newPageKey} onValueChange={setNewPageKey}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a page type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTemplates.map((template) => (
                        <SelectItem key={template.key} value={template.key}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={createNewPage}
                  disabled={!newPageKey || saving}
                >
                  {saving ? "Creating..." : "Create Page"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {contents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No site content created yet</p>
            <p className="text-sm text-muted-foreground">
              Click &quot;Add Page&quot; to create your first page
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contents.map((content) => {
            const template = PAGE_TEMPLATES.find((t) => t.key === content.key)
            return (
              <Card key={content.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {content.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Key: {content.key} | Last updated:{" "}
                        {format(new Date(content.updatedAt), "MMM dd, yyyy HH:mm")}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {template && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={template.path} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                      )}
                      <Button size="sm" onClick={() => startEditing(content)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
