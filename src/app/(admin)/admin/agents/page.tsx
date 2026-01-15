"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { Shield, Search, Check, X, Percent, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionError } from "@/components/error"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Agent {
  id: string
  businessName: string
  businessEmail: string | null
  city: string | null
  country: string | null
  status: string
  isVerified: boolean
  commissionRate: number
  createdAt: string
  user: {
    email: string
    name: string | null
  }
  _count: {
    tours: number
    bookings: number
  }
}

const statusConfig = {
  PENDING: { label: "Pending", color: "bg-yellow-500" },
  ACTIVE: { label: "Active", color: "bg-green-500" },
  SUSPENDED: { label: "Suspended", color: "bg-red-500" },
  DEACTIVATED: { label: "Deactivated", color: "bg-gray-500" },
}

export default function AdminAgentsPage() {
  const searchParams = useSearchParams()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
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

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"verify" | "unverify" | "suspend" | "activate">("verify")
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Commission dialog state
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false)
  const [commissionAgent, setCommissionAgent] = useState<Agent | null>(null)
  const [newCommissionRate, setNewCommissionRate] = useState("")
  const [commissionReason, setCommissionReason] = useState("")
  const [updatingCommission, setUpdatingCommission] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [statusFilter, page])

  async function fetchAgents() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (searchQuery) params.set("search", searchQuery)
      params.set("page", page.toString())
      params.set("limit", "10")

      const response = await fetch(`/api/admin/agents?${params}`)
      if (!response.ok) throw new Error("Failed to fetch agents")

      const data = await response.json()
      setAgents(data.agents || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching agents:", error)
      toast.error("Failed to load agents")
    } finally {
      setLoading(false)
    }
  }

  async function handleAgentAction() {
    if (!selectedAgent) return

    setIsProcessing(true)
    try {
      const endpointMap = {
        verify: `/api/admin/agents/${selectedAgent.id}/verify`,
        unverify: `/api/admin/agents/${selectedAgent.id}/unverify`,
        suspend: `/api/admin/agents/${selectedAgent.id}/suspend`,
        activate: `/api/admin/agents/${selectedAgent.id}/activate`,
      }
      const endpoint = endpointMap[dialogType]

      const response = await fetch(endpoint, {
        method: "PATCH",
      })

      if (!response.ok) throw new Error("Failed to update agent")

      const messageMap = {
        verify: "Agent verified",
        unverify: "Agent verification removed",
        suspend: "Agent suspended",
        activate: "Agent activated",
      }
      toast.success(messageMap[dialogType])
      setDialogOpen(false)
      fetchAgents()
    } catch (error) {
      console.error("Error updating agent:", error)
      toast.error("Failed to update agent")
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleUpdateCommission() {
    if (!commissionAgent) return

    const rate = parseFloat(newCommissionRate)
    if (isNaN(rate) || rate < 0 || rate > 50) {
      toast.error("Commission rate must be between 0% and 50%")
      return
    }

    setUpdatingCommission(true)
    try {
      const response = await fetch(`/api/admin/agents/${commissionAgent.id}/commission`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionRate: rate,
          reason: commissionReason || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update commission")
      }

      toast.success(data.message || "Commission rate updated")
      setCommissionDialogOpen(false)
      setNewCommissionRate("")
      setCommissionReason("")
      fetchAgents()
    } catch (error) {
      console.error("Error updating commission:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update commission")
    } finally {
      setUpdatingCommission(false)
    }
  }

  const openCommissionDialog = (agent: Agent) => {
    setCommissionAgent(agent)
    setNewCommissionRate(agent.commissionRate.toString())
    setCommissionReason("")
    setCommissionDialogOpen(true)
  }

  const handleSearch = () => {
    setPage(1)
    fetchAgents()
  }

  const statusCounts = agents.reduce((acc, agent) => {
    acc[agent.status] = (acc[agent.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Agent Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage tour operators, verification, and commission rates
        </p>
      </div>

      <SectionError name="Agent Stats">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5">
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              statusFilter === "all" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => {
              setStatusFilter("all")
              setPage(1)
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">All Agents</p>
                  <p className="text-2xl font-bold mt-1">{agents.length}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {Object.entries(statusConfig).map(([status, config]) => {
            const count = statusCounts[status] || 0

            return (
              <Card
                key={status}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  statusFilter === status ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => {
                  setStatusFilter(status)
                  setPage(1)
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{config.label}</p>
                      <p className="text-2xl font-bold mt-1">{count}</p>
                    </div>
                    <div className={`h-3 w-3 rounded-full ${config.color}`}></div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </SectionError>

      <SectionError name="Agents Table">
        <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Agents</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
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
          ) : agents.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No agents found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Tours</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{agent.businessName}</p>
                          {agent.businessEmail && (
                            <p className="text-xs text-muted-foreground">
                              {agent.businessEmail}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {agent.user.name || "No name"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {agent.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {agent.city && agent.country
                          ? `${agent.city}, ${agent.country}`
                          : agent.country || "Not specified"}
                      </TableCell>
                      <TableCell>{agent._count.tours}</TableCell>
                      <TableCell>{agent._count.bookings}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 font-medium"
                          onClick={() => openCommissionDialog(agent)}
                        >
                          <Percent className="h-3 w-3 mr-1" />
                          {agent.commissionRate}%
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            statusConfig[agent.status as keyof typeof statusConfig]
                              ?.color
                          } text-white border-0`}
                        >
                          {
                            statusConfig[agent.status as keyof typeof statusConfig]
                              ?.label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {agent.isVerified ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(agent.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end flex-wrap">
                          {/* Verify/Unverify button */}
                          {agent.isVerified ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAgent(agent)
                                setDialogType("unverify")
                                setDialogOpen(true)
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Unverify
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAgent(agent)
                                setDialogType("verify")
                                setDialogOpen(true)
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          )}
                          {/* Status actions */}
                          {agent.status === "ACTIVE" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAgent(agent)
                                setDialogType("suspend")
                                setDialogOpen(true)
                              }}
                            >
                              Suspend
                            </Button>
                          )}
                          {agent.status === "SUSPENDED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAgent(agent)
                                setDialogType("activate")
                                setDialogOpen(true)
                              }}
                            >
                              Activate
                            </Button>
                          )}
                          {agent.status === "PENDING" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAgent(agent)
                                setDialogType("activate")
                                setDialogOpen(true)
                              }}
                            >
                              Activate
                            </Button>
                          )}
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
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleAgentAction}
        title={
          dialogType === "verify"
            ? "Verify Agent"
            : dialogType === "unverify"
            ? "Remove Verification"
            : dialogType === "suspend"
            ? "Suspend Agent"
            : "Activate Agent"
        }
        description={
          dialogType === "verify"
            ? `Are you sure you want to verify ${selectedAgent?.businessName}? This will grant them full access to create and manage tours.`
            : dialogType === "unverify"
            ? `Are you sure you want to remove verification from ${selectedAgent?.businessName}? They will lose their verified badge.`
            : dialogType === "suspend"
            ? `Are you sure you want to suspend ${selectedAgent?.businessName}? They will not be able to access the platform.`
            : `Are you sure you want to activate ${selectedAgent?.businessName}? They will be able to access the platform again.`
        }
        confirmText={
          dialogType === "verify"
            ? "Verify Agent"
            : dialogType === "unverify"
            ? "Remove Verification"
            : dialogType === "suspend"
            ? "Suspend"
            : "Activate"
        }
        variant={dialogType === "suspend" || dialogType === "unverify" ? "danger" : "default"}
        isLoading={isProcessing}
      />

      {/* Commission Rate Dialog */}
      <Dialog open={commissionDialogOpen} onOpenChange={setCommissionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Commission Rate</DialogTitle>
            <DialogDescription>
              Set the platform commission percentage for {commissionAgent?.businessName}.
              This determines how much the platform takes from each booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <div className="relative">
                <Input
                  id="commissionRate"
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={newCommissionRate}
                  onChange={(e) => setNewCommissionRate(e.target.value)}
                  placeholder="e.g., 10"
                  className="pr-8"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Current rate: {commissionAgent?.commissionRate}%
              </p>
            </div>

            {newCommissionRate && !isNaN(parseFloat(newCommissionRate)) && (
              <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                <p className="font-medium">Example calculation for $1,000 booking:</p>
                <p>Platform fee: ${(1000 * parseFloat(newCommissionRate) / 100).toFixed(2)} ({newCommissionRate}%)</p>
                <p>Agent receives: ${(1000 - (1000 * parseFloat(newCommissionRate) / 100)).toFixed(2)} ({(100 - parseFloat(newCommissionRate)).toFixed(1)}%)</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for change (optional)</Label>
              <Input
                id="reason"
                value={commissionReason}
                onChange={(e) => setCommissionReason(e.target.value)}
                placeholder="e.g., Performance bonus, new tier, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCommissionDialogOpen(false)}
              disabled={updatingCommission}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCommission} disabled={updatingCommission}>
              {updatingCommission ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Rate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
