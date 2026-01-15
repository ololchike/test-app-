"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { Users, Search, Shield, User, UserCog } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SectionError } from "@/components/error"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

interface User {
  id: string
  email: string
  name: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: string
  status: string
  createdAt: string
  _count: {
    bookings: number
    reviews: number
  }
  agent: {
    id: string
    businessName: string
    isVerified: boolean
  } | null
}

const roleConfig = {
  CLIENT: { label: "Client", color: "bg-blue-500", icon: User },
  AGENT: { label: "Agent", color: "bg-purple-500", icon: UserCog },
  ADMIN: { label: "Admin", color: "bg-red-500", icon: Shield },
}

const statusConfig = {
  PENDING: { label: "Pending", color: "bg-yellow-500" },
  ACTIVE: { label: "Active", color: "bg-green-500" },
  SUSPENDED: { label: "Suspended", color: "bg-red-500" },
  DEACTIVATED: { label: "Deactivated", color: "bg-gray-500" },
}

export default function AdminUsersPage() {
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Sync search from URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search") || ""
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

  const [changeDialogOpen, setChangeDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<string>("")
  const [newStatus, setNewStatus] = useState<string>("")
  const [changeType, setChangeType] = useState<"role" | "status">("role")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [roleFilter, page])

  async function fetchUsers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (roleFilter !== "all") params.set("role", roleFilter)
      if (searchQuery) params.set("search", searchQuery)
      params.set("page", page.toString())
      params.set("limit", "10")

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error("Failed to fetch users")

      const data = await response.json()
      setUsers(data.users || [])
      setRoleCounts(data.roleCounts || {})
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  async function handleChangeUser() {
    if (!selectedUser) return

    setIsProcessing(true)
    try {
      const body =
        changeType === "role" ? { role: newRole } : { status: newStatus }

      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error("Failed to update user")

      toast.success(
        `User ${changeType === "role" ? "role" : "status"} updated`
      )
      setChangeDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Failed to update user")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">Manage all platform users</p>
      </div>

      <SectionError name="User Stats">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              roleFilter === "all" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => {
              setRoleFilter("all")
              setPage(1)
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">All Users</p>
                  <p className="text-2xl font-bold mt-1">
                    {Object.values(roleCounts).reduce((a, b) => a + b, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {Object.entries(roleConfig).map(([role, config]) => {
            const Icon = config.icon
            const count = roleCounts[role] || 0

            return (
              <Card
                key={role}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  roleFilter === role ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => {
                  setRoleFilter(role)
                  setPage(1)
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {config.label}s
                      </p>
                      <p className="text-2xl font-bold mt-1">{count}</p>
                    </div>
                    <Icon className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </SectionError>

      <SectionError name="Users Table">
        <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Users</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch} variant="secondary" className="w-full sm:w-auto">
                Search
              </Button>
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
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name || "No name"}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                          {user.agent && (
                            <p className="text-xs text-muted-foreground">
                              Agent: {user.agent.businessName}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            roleConfig[user.role as keyof typeof roleConfig]
                              ?.color
                          } text-white border-0`}
                        >
                          {
                            roleConfig[user.role as keyof typeof roleConfig]
                              ?.label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            statusConfig[user.status as keyof typeof statusConfig]
                              ?.color
                          } text-white border-0`}
                        >
                          {
                            statusConfig[user.status as keyof typeof statusConfig]
                              ?.label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{user._count.bookings} bookings</p>
                          <p className="text-xs text-muted-foreground">
                            {user._count.reviews} reviews
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user)
                              setNewRole(user.role)
                              setChangeType("role")
                              setChangeDialogOpen(true)
                            }}
                          >
                            Change Role
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user)
                              setNewStatus(
                                user.status === "ACTIVE"
                                  ? "SUSPENDED"
                                  : "ACTIVE"
                              )
                              setChangeType("status")
                              setChangeDialogOpen(true)
                            }}
                          >
                            {user.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
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
      </SectionError>

      <ConfirmationDialog
        isOpen={changeDialogOpen}
        onClose={() => setChangeDialogOpen(false)}
        onConfirm={handleChangeUser}
        title={`Change User ${changeType === "role" ? "Role" : "Status"}`}
        description={`Are you sure you want to ${
          changeType === "role"
            ? `change ${selectedUser?.email}'s role to ${
                roleConfig[newRole as keyof typeof roleConfig]?.label
              }`
            : `change ${selectedUser?.email}'s status to ${
                statusConfig[newStatus as keyof typeof statusConfig]?.label
              }`
        }?`}
        confirmText="Confirm Change"
        variant="warning"
        isLoading={isProcessing}
      />
    </div>
  )
}
