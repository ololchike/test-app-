"use client"

import { useState } from "react"
import { Plus, Trash2, GripVertical, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { toast } from "sonner"

interface FAQ {
  id: string
  question: string
  answer: string
  order: number
  isPublished: boolean
}

interface DestinationFAQManagerProps {
  destinationId: string
  faqs: FAQ[]
  onUpdate: () => void
}

export function DestinationFAQManager({
  destinationId,
  faqs: initialFaqs,
  onUpdate,
}: DestinationFAQManagerProps) {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs)
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" })
  const [isAdding, setIsAdding] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const handleAddFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error("Please fill in both question and answer")
      return
    }

    try {
      setIsAdding(true)

      const response = await fetch(
        `/api/admin/destinations/${destinationId}/faqs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: newFaq.question,
            answer: newFaq.answer,
            order: faqs.length,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to add FAQ")
      }

      const data = await response.json()
      setFaqs([...faqs, data.faq])
      setNewFaq({ question: "", answer: "" })
      toast.success("FAQ added successfully")
      onUpdate()
    } catch (error) {
      console.error("Error adding FAQ:", error)
      toast.error("Failed to add FAQ")
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdateFaq = async (faq: FAQ) => {
    try {
      setSavingId(faq.id)

      const response = await fetch(
        `/api/admin/destinations/${destinationId}/faqs/${faq.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: faq.question,
            answer: faq.answer,
            isPublished: faq.isPublished,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update FAQ")
      }

      toast.success("FAQ updated")
      onUpdate()
    } catch (error) {
      console.error("Error updating FAQ:", error)
      toast.error("Failed to update FAQ")
    } finally {
      setSavingId(null)
    }
  }

  const handleDeleteFaq = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(
        `/api/admin/destinations/${destinationId}/faqs/${deleteId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to delete FAQ")
      }

      setFaqs(faqs.filter((f) => f.id !== deleteId))
      toast.success("FAQ deleted")
      onUpdate()
    } catch (error) {
      console.error("Error deleting FAQ:", error)
      toast.error("Failed to delete FAQ")
    } finally {
      setDeleteId(null)
    }
  }

  const updateFaqField = (
    id: string,
    field: keyof FAQ,
    value: string | boolean
  ) => {
    setFaqs(
      faqs.map((faq) =>
        faq.id === id ? { ...faq, [field]: value } : faq
      )
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Destination FAQs</CardTitle>
          <CardDescription>
            Add frequently asked questions. These will appear on the destination
            page and generate FAQ schema markup for SEO.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing FAQs */}
          {faqs.length > 0 ? (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-2 cursor-grab">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label>Question {index + 1}</Label>
                        <Input
                          value={faq.question}
                          onChange={(e) =>
                            updateFaqField(faq.id, "question", e.target.value)
                          }
                          placeholder="Enter the question..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Answer</Label>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) =>
                            updateFaqField(faq.id, "answer", e.target.value)
                          }
                          placeholder="Enter the answer..."
                          rows={4}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={faq.isPublished}
                            onCheckedChange={(checked) =>
                              updateFaqField(faq.id, "isPublished", checked)
                            }
                          />
                          <Label className="text-sm">Published</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateFaq(faq)}
                            disabled={savingId === faq.id}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {savingId === faq.id ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setDeleteId(faq.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No FAQs added yet. Add your first FAQ below.
            </div>
          )}

          {/* Add New FAQ */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-4">Add New FAQ</h4>
            <div className="space-y-4">
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
              <Button onClick={handleAddFaq} disabled={isAdding}>
                <Plus className="h-4 w-4 mr-2" />
                {isAdding ? "Adding..." : "Add FAQ"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
