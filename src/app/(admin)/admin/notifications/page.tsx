"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
  Bell,
  Check,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCheck,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

interface TypeCounts {
  BOOKING?: number
  PAYMENT?: number
  REVIEW?: number
  SYSTEM?: number
  AGENT?: number
  USER?: number
  WITHDRAWAL?: number
  MESSAGE?: number
}

const typeConfig = {
  BOOKING: { label: "Booking", color: "bg-blue-500" },
  PAYMENT: { label: "Payment", color: "bg-green-500" },
  REVIEW: { label: "Review", color: "bg-purple-500" },
  SYSTEM: { label: "System", color: "bg-gray-500" },
  AGENT: { label: "Agent", color: "bg-orange-500" },
  USER: { label: "User", color: "bg-cyan-500" },
  WITHDRAWAL: { label: "Withdrawal", color: "bg-amber-500" },
  MESSAGE: { label: "Message", color: "bg-pink-500" },
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [typeCounts, setTypeCounts] = useState<TypeCounts>({})
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [readFilter, setReadFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [typeFilter, readFilter, page])

  async function fetchNotifications() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter !== "all") {
        params.set("type", typeFilter)
      }
      if (readFilter !== "all") {
        params.set("isRead", readFilter)
      }
      params.set("page", page.toString())
      params.set("limit", "20")

      const response = await fetch(`/api/admin/notifications?${params}`)
      if (!response.ok) throw new Error("Failed to fetch notifications")

      const data = await response.json()
      setNotifications(data.notifications || [])
      setTypeCounts(data.typeCounts || {})
      setUnreadCount(data.unreadCount || 0)
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      })

      if (!response.ok) throw new Error("Failed to update notification")

      toast.success("Marked as read")
      fetchNotifications()
    } catch (error) {
      console.error("Error updating notification:", error)
      toast.error("Failed to update notification")
    }
  }

  async function handleMarkAllAsRead() {
    try {
      const response = await fetch("/api/admin/notifications/mark-all-read", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to mark all as read")

      toast.success("All notifications marked as read")
      fetchNotifications()
    } catch (error) {
      console.error("Error marking all as read:", error)
      toast.error("Failed to mark all as read")
    }
  }

  async function handleDeleteNotification() {
    if (!selectedNotification) return

    setIsProcessing(true)
    try {
      const response = await fetch(
        `/api/admin/notifications/${selectedNotification.id}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) throw new Error("Failed to delete notification")

      toast.success("Notification deleted")
      setDeleteDialogOpen(false)
      fetchNotifications()
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error("Failed to delete notification")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            typeFilter === "all" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => {
            setTypeFilter("all")
            setPage(1)
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">All</p>
                <p className="text-2xl font-bold mt-1">
                  {Object.values(typeCounts).reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {Object.entries(typeConfig)
          .slice(0, 4)
          .map(([type, config]) => {
            const count = typeCounts[type as keyof TypeCounts] || 0

            return (
              <Card
                key={type}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  typeFilter === type ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => {
                  setTypeFilter(type)
                  setPage(1)
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {config.label}
                      </p>
                      <p className="text-2xl font-bold mt-1">{count}</p>
                    </div>
                    <div className={`h-3 w-3 rounded-full ${config.color}`}></div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Your Notifications</CardTitle>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(typeConfig).map(([type, config]) => (
                    <SelectItem key={type} value={type}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="false">Unread</SelectItem>
                  <SelectItem value="true">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No notifications found</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border transition-all hover:bg-muted/50",
                      !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
                    )}
                  >
                    {/* Type Badge */}
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                        typeConfig[notification.type as keyof typeof typeConfig]
                          ?.color || "bg-gray-500"
                      )}
                    >
                      <Bell className="h-5 w-5 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">
                              {notification.title}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {
                                typeConfig[
                                  notification.type as keyof typeof typeConfig
                                ]?.label
                              }
                            </Badge>
                            {!notification.isRead && (
                              <Badge variant="default" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(
                              new Date(notification.createdAt),
                              "MMM dd, yyyy 'at' h:mm a"
                            )}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                          {notification.link && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={notification.link}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedNotification(notification)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteNotification}
        title="Delete Notification"
        description="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  )
}
