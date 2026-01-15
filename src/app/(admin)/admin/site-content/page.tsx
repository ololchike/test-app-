"use client"

import { useEffect, useState } from "react"
import { FileText, Save, ExternalLink, Plus } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Badge } from "@/components/ui/badge"
import { SectionError } from "@/components/error"
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
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedContent, setEditedContent] = useState("")

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

  function startEditing(key: string) {
    const template = PAGE_TEMPLATES.find((t) => t.key === key)
    const existing = contents.find((c) => c.key === key)

    setEditingKey(key)
    setEditedTitle(existing?.title || template?.title || "")
    setEditedContent(existing?.content || getDefaultContent(key))
  }

  function cancelEditing() {
    setEditingKey(null)
    setEditedTitle("")
    setEditedContent("")
  }

  async function saveContent() {
    if (!editingKey) return

    setSaving(true)
    try {
      const response = await fetch("/api/admin/site-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: editingKey,
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

  function getExistingContent(key: string) {
    return contents.find((c) => c.key === key)
  }

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

  // Editing mode
  if (editingKey) {
    const template = PAGE_TEMPLATES.find((t) => t.key === editingKey)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Edit {template?.title}</h1>
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

        <SectionError name="Content Editor">
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
        </SectionError>
      </div>
    )
  }

  // List view - show ALL pages (both existing and available to create)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Site Content</h1>
        <p className="text-muted-foreground mt-2">
          Manage editable pages like Privacy Policy, Terms, and Cookies
        </p>
      </div>

      <SectionError name="Site Content Pages">
        <div className="grid gap-4">
        {PAGE_TEMPLATES.map((template) => {
          const existing = getExistingContent(template.key)
          const hasContent = !!existing

          return (
            <Card key={template.key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {template.title}
                        {hasContent ? (
                          <Badge variant="default" className="text-xs">Published</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Default Content</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {hasContent
                          ? `Last updated: ${format(new Date(existing.updatedAt), "MMM dd, yyyy HH:mm")}`
                          : "Using default content - click Edit to customize"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={template.path} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button size="sm" onClick={() => startEditing(template.key)}>
                      {hasContent ? "Edit" : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Customize
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
        </div>
      </SectionError>
    </div>
  )
}
