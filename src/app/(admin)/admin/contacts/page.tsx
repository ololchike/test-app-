"use client"

import { useEffect, useState, useRef } from "react"
import { format } from "date-fns"
import {
  Mail,
  Search,
  Filter,
  Eye,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  UserPlus,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ForwardToAgentDialog } from "@/components/admin/forward-to-agent-dialog"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: "NEW" | "READ" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "ACKNOWLEDGED" | "NEEDS_INFO"
  adminNotes: string | null
  respondedBy: string | null
  respondedAt: string | null
  assignedAgentId: string | null
  assignedAt: string | null
  adminNote: string | null
  agentResponse: string | null
  agentUpdatedAt: string | null
  forwardedTo: string | null
  forwardedAt: string | null
  createdAt: string
  updatedAt: string
  assignedAgent?: {
    businessName: string
    user: {
      email: string
    }
  } | null
}

interface ContactMessageReply {
  id: string
  contactMessageId: string
  senderId: string
  senderRole: "ADMIN" | "AGENT"
  message: string
  createdAt: string
  sender: {
    id: string
    name: string | null
    email: string
    role: string
    agent?: {
      businessName: string
    } | null
  }
}

interface StatusCounts {
  NEW?: number
  READ?: number
  IN_PROGRESS?: number
  RESOLVED?: number
  CLOSED?: number
  ACKNOWLEDGED?: number
  NEEDS_INFO?: number
}

const statusConfig = {
  NEW: { label: "New", color: "bg-blue-500", icon: AlertCircle },
  READ: { label: "Read", color: "bg-yellow-500", icon: Eye },
  IN_PROGRESS: { label: "In Progress", color: "bg-orange-500", icon: Clock },
  ACKNOWLEDGED: { label: "Acknowledged", color: "bg-purple-500", icon: CheckCircle2 },
  NEEDS_INFO: { label: "Needs Info", color: "bg-amber-500", icon: AlertCircle },
  RESOLVED: { label: "Resolved", color: "bg-green-500", icon: CheckCircle2 },
  CLOSED: { label: "Closed", color: "bg-gray-500", icon: XCircle },
}

export default function AdminContactsPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isForwardDialogOpen, setIsForwardDialogOpen] = useState(false)
  const [messageToForward, setMessageToForward] = useState<string | null>(null)

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Chat-related states
  const [replies, setReplies] = useState<ContactMessageReply[]>([])
  const [newReplyMessage, setNewReplyMessage] = useState("")
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [statusFilter])

  async function fetchMessages() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.set("status", statusFilter)
      }

      const response = await fetch(`/api/admin/contacts?${params}`)
      if (!response.ok) throw new Error("Failed to fetch messages")

      const data = await response.json()
      setMessages(data.messages || [])
      setStatusCounts(data.statusCounts || {})
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error("Failed to load contact messages")
    } finally {
      setLoading(false)
    }
  }

  async function handleViewMessage(message: ContactMessage) {
    setSelectedMessage(message)
    setAdminNotes(message.adminNotes || "")
    setIsDetailModalOpen(true)

    // Fetch replies if message is forwarded to an agent
    if (message.assignedAgentId) {
      await fetchReplies(message.id)
      // Start polling for new replies
      startPolling(message.id)
    }
  }

  async function fetchReplies(messageId: string) {
    setIsLoadingReplies(true)
    try {
      const response = await fetch(`/api/admin/contacts/${messageId}/replies`)
      if (!response.ok) throw new Error("Failed to fetch replies")

      const data = await response.json()
      setReplies(data.replies || [])

      // Auto-scroll to latest message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch (error) {
      console.error("Error fetching replies:", error)
      toast.error("Failed to load conversation")
    } finally {
      setIsLoadingReplies(false)
    }
  }

  function startPolling(messageId: string) {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    // Poll every 10 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchReplies(messageId)
    }, 10000)
  }

  function stopPolling() {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  async function handleSendReply() {
    if (!selectedMessage || !newReplyMessage.trim()) return

    setIsSendingReply(true)
    try {
      const response = await fetch(`/api/admin/contacts/${selectedMessage.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newReplyMessage.trim() }),
      })

      if (!response.ok) throw new Error("Failed to send reply")

      const data = await response.json()

      // Add the new reply to the list
      setReplies([...replies, data.reply])
      setNewReplyMessage("")

      toast.success("Message sent to agent")

      // Auto-scroll to latest message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch (error) {
      console.error("Error sending reply:", error)
      toast.error("Failed to send message")
    } finally {
      setIsSendingReply(false)
    }
  }

  // Cleanup polling on modal close
  useEffect(() => {
    if (!isDetailModalOpen) {
      stopPolling()
      setReplies([])
      setNewReplyMessage("")
    }
  }, [isDetailModalOpen])

  async function handleUpdateStatus(status: ContactMessage["status"]) {
    if (!selectedMessage) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/contacts/${selectedMessage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      })

      if (!response.ok) throw new Error("Failed to update message")

      toast.success("Message status updated")
      setIsDetailModalOpen(false)
      fetchMessages()
    } catch (error) {
      console.error("Error updating message:", error)
      toast.error("Failed to update message")
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleDeleteMessage() {
    if (!messageToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/contacts/${messageToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete message")

      toast.success("Message deleted")
      setDeleteDialogOpen(false)
      setMessageToDelete(null)
      fetchMessages()
    } catch (error) {
      console.error("Error deleting message:", error)
      toast.error("Failed to delete message")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredMessages = messages.filter((message) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      message.name.toLowerCase().includes(query) ||
      message.email.toLowerCase().includes(query) ||
      message.subject.toLowerCase().includes(query) ||
      message.message.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <p className="text-muted-foreground mt-2">
          Manage and respond to customer inquiries
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon
          const count = statusCounts[status as keyof StatusCounts] || 0

          return (
            <Card
              key={status}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                statusFilter === status ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setStatusFilter(status)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className="text-2xl font-bold mt-1">{count}</p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${config.color}/10`}
                  >
                    <Icon className={`h-6 w-6 text-${config.color.split('-')[1]}-500`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Messages</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="READ">Read</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No messages found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(message.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">{message.name}</TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {message.subject}
                      </TableCell>
                      <TableCell>
                        {message.assignedAgent ? (
                          <div className="text-sm">
                            <div className="font-medium">{message.assignedAgent.businessName}</div>
                            <div className="text-muted-foreground text-xs">
                              {message.assignedAgent.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${statusConfig[message.status].color} text-white border-0`}
                        >
                          {statusConfig[message.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewMessage(message)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!message.assignedAgentId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setMessageToForward(message.id)
                                setIsForwardDialogOpen(true)
                              }}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setMessageToDelete(message.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>Contact Message Details</DialogTitle>
                <DialogDescription>
                  Received on {format(new Date(selectedMessage.createdAt), "PPP")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium mt-1">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium mt-1">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium mt-1">{selectedMessage.phone}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${statusConfig[selectedMessage.status].color} text-white border-0`}>
                        {statusConfig[selectedMessage.status].label}
                      </Badge>
                      {selectedMessage.assignedAgentId && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Forwarded
                        </Badge>
                      )}
                    </div>
                  </div>
                  {selectedMessage.assignedAgent && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Assigned Agent</Label>
                      <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                        <p className="font-medium">{selectedMessage.assignedAgent.businessName}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedMessage.assignedAgent.user.email}
                        </p>
                        {selectedMessage.assignedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Forwarded on {format(new Date(selectedMessage.assignedAt), "PPP")}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium mt-1">{selectedMessage.subject}</p>
                </div>

                {/* Original Customer Message */}
                <div>
                  <Label className="text-muted-foreground">Original Customer Message</Label>
                  <div className="mt-1 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">Customer</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(selectedMessage.createdAt), "PPP 'at' p")}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm">{selectedMessage.message}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Note to Agent (shown when forwarding) */}
                {selectedMessage.adminNote && (
                  <div>
                    <Label className="text-muted-foreground">Your Forwarding Note to Agent</Label>
                    <div className="mt-1 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg whitespace-pre-wrap text-sm">
                      {selectedMessage.adminNote}
                    </div>
                  </div>
                )}

                {/* Conversation Thread (if forwarded) */}
                {selectedMessage.assignedAgentId && (
                  <div>
                    <Label className="text-muted-foreground">Conversation with Agent</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      {/* Messages Container */}
                      <div className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 space-y-3">
                        {isLoadingReplies && replies.length === 0 ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : replies.length === 0 ? (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            No messages yet. Start the conversation below.
                          </div>
                        ) : (
                          <>
                            {replies.map((reply) => {
                              const isAdmin = reply.senderRole === "ADMIN"
                              const senderName = isAdmin
                                ? reply.sender.name || "Admin"
                                : reply.sender.agent?.businessName || reply.sender.name || "Agent"

                              return (
                                <div
                                  key={reply.id}
                                  className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                                >
                                  <div className={`max-w-[80%] ${isAdmin ? "items-end" : "items-start"} flex flex-col`}>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge
                                        variant={isAdmin ? "default" : "secondary"}
                                        className="text-xs"
                                      >
                                        {isAdmin ? "You (Admin)" : senderName}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(reply.createdAt), "MMM dd, p")}
                                      </span>
                                    </div>
                                    <div
                                      className={`rounded-lg px-4 py-2 ${
                                        isAdmin
                                          ? "bg-blue-600 text-white"
                                          : "bg-white dark:bg-gray-800 border"
                                      }`}
                                    >
                                      <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                            <div ref={messagesEndRef} />
                          </>
                        )}
                      </div>

                      {/* Reply Input */}
                      <div className="p-4 bg-white dark:bg-gray-950 border-t">
                        <div className="flex gap-2">
                          <Textarea
                            value={newReplyMessage}
                            onChange={(e) => setNewReplyMessage(e.target.value)}
                            placeholder="Type your message to the agent..."
                            rows={2}
                            className="resize-none"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSendReply()
                              }
                            }}
                          />
                          <Button
                            onClick={handleSendReply}
                            disabled={isSendingReply || !newReplyMessage.trim()}
                            size="sm"
                            className="self-end"
                          >
                            {isSendingReply ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Press Enter to send, Shift+Enter for new line
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Notes (internal) */}
                <div>
                  <Label htmlFor="adminNotes">Internal Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes (not visible to agent)..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Update Status */}
                <div>
                  <Label>Update Status</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={selectedMessage.status === status ? "default" : "outline"}
                        onClick={() => handleUpdateStatus(status as ContactMessage["status"])}
                        disabled={isUpdating}
                      >
                        {config.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                {!selectedMessage.assignedAgentId && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMessageToForward(selectedMessage.id)
                      setIsForwardDialogOpen(true)
                      setIsDetailModalOpen(false)
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Forward to Agent
                  </Button>
                )}
                <div className="flex gap-2 sm:ml-auto">
                  <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedMessage.status)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Saving..." : "Save Notes"}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Forward to Agent Dialog */}
      {messageToForward && (
        <ForwardToAgentDialog
          open={isForwardDialogOpen}
          onOpenChange={setIsForwardDialogOpen}
          messageId={messageToForward}
          onSuccess={() => {
            fetchMessages()
            setMessageToForward(null)
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setMessageToDelete(null)
        }}
        onConfirm={handleDeleteMessage}
        title="Delete Contact Message"
        description="Are you sure you want to delete this contact message? This action cannot be undone and will permanently remove all associated replies."
        confirmText="Delete Message"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
