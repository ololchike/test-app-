"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  HelpCircle,
  Edit,
  Trash2,
  Save,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  order: number
  isPublished: boolean
}

const FAQ_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "booking", label: "Booking" },
  { value: "payment", label: "Payment" },
  { value: "tours", label: "Tours" },
  { value: "cancellation", label: "Cancellation" },
  { value: "safety", label: "Safety" },
]

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editFaq, setEditFaq] = useState<FAQ | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newFaq, setNewFaq] = useState({
    category: "general",
    question: "",
    answer: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const fetchFaqs = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== "all") {
        params.set("category", selectedCategory)
      }

      const response = await fetch(`/api/admin/faqs?${params}`)
      const data = await response.json()

      if (data.faqs) {
        setFaqs(data.faqs)
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error)
      toast.error("Failed to load FAQs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [selectedCategory])

  const handleAddFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error("Please fill in both question and answer")
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFaq),
      })

      if (response.ok) {
        toast.success("FAQ added successfully")
        setIsAddDialogOpen(false)
        setNewFaq({ category: "general", question: "", answer: "" })
        fetchFaqs()
      } else {
        toast.error("Failed to add FAQ")
      }
    } catch (error) {
      console.error("Error adding FAQ:", error)
      toast.error("Failed to add FAQ")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateFaq = async () => {
    if (!editFaq) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/admin/faqs/${editFaq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: editFaq.category,
          question: editFaq.question,
          answer: editFaq.answer,
          isPublished: editFaq.isPublished,
        }),
      })

      if (response.ok) {
        toast.success("FAQ updated successfully")
        setEditFaq(null)
        fetchFaqs()
      } else {
        toast.error("Failed to update FAQ")
      }
    } catch (error) {
      console.error("Error updating FAQ:", error)
      toast.error("Failed to update FAQ")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteFaq = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/admin/faqs/${deleteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("FAQ deleted successfully")
        fetchFaqs()
      } else {
        toast.error("Failed to delete FAQ")
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error)
      toast.error("Failed to delete FAQ")
    } finally {
      setDeleteId(null)
    }
  }

  const togglePublished = async (faq: FAQ) => {
    try {
      const response = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !faq.isPublished }),
      })

      if (response.ok) {
        toast.success(faq.isPublished ? "FAQ unpublished" : "FAQ published")
        fetchFaqs()
      } else {
        toast.error("Failed to update FAQ")
      }
    } catch (error) {
      console.error("Error updating FAQ:", error)
      toast.error("Failed to update FAQ")
    }
  }

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = []
    }
    acc[faq.category].push(faq)
    return acc
  }, {} as Record<string, FAQ[]>)

  const publishedCount = faqs.filter((f) => f.isPublished).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Site FAQs</h1>
          <p className="text-muted-foreground">
            Manage frequently asked questions for the FAQ page
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faqs.length}</div>
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
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(groupedFaqs).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">All Categories</TabsTrigger>
          {FAQ_CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* FAQs List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading FAQs...
          </CardContent>
        </Card>
      ) : faqs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No FAQs found</h3>
            <p className="text-muted-foreground mb-4">
              Add your first FAQ to help visitors
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize">{category}</CardTitle>
                <CardDescription>
                  {categoryFaqs.length} question{categoryFaqs.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {faq.isPublished ? (
                            <Badge className="bg-green-600">Published</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                        </div>
                        <h4 className="font-medium">{faq.question}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {faq.answer}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditFaq(faq)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePublished(faq)}
                        >
                          {faq.isPublished ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setDeleteId(faq.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add FAQ Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New FAQ</DialogTitle>
            <DialogDescription>
              Add a frequently asked question to help visitors
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={newFaq.category}
                onValueChange={(value) =>
                  setNewFaq({ ...newFaq, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FAQ_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Question</Label>
              <Input
                value={newFaq.question}
                onChange={(e) =>
                  setNewFaq({ ...newFaq, question: e.target.value })
                }
                placeholder="Enter the question..."
              />
            </div>
            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea
                value={newFaq.answer}
                onChange={(e) =>
                  setNewFaq({ ...newFaq, answer: e.target.value })
                }
                placeholder="Enter the answer..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFaq} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={!!editFaq} onOpenChange={() => setEditFaq(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>Update the FAQ details</DialogDescription>
          </DialogHeader>
          {editFaq && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={editFaq.category}
                  onValueChange={(value) =>
                    setEditFaq({ ...editFaq, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={editFaq.question}
                  onChange={(e) =>
                    setEditFaq({ ...editFaq, question: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  value={editFaq.answer}
                  onChange={(e) =>
                    setEditFaq({ ...editFaq, answer: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editFaq.isPublished}
                  onCheckedChange={(checked) =>
                    setEditFaq({ ...editFaq, isPublished: checked })
                  }
                />
                <Label>Published</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFaq(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFaq} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFaq}
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
