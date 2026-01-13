"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Download, Check, X, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { WithdrawalMethod, WithdrawalMethodLabels } from "@/lib/constants"

interface Withdrawal {
  id: string
  agentId: string
  agentName: string
  agentEmail: string
  amount: number
  currency: string
  method: string
  mpesaPhone?: string
  bankDetails?: {
    bankName: string
    accountNumber: string
    accountName: string
    branchCode?: string
    swiftCode?: string
  }
  status: string
  processedBy?: string
  processedAt?: string
  rejectionReason?: string
  transactionRef?: string
  createdAt: string
  updatedAt: string
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("PENDING")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusCounts, setStatusCounts] = useState<any>({})
  const { toast } = useToast()

  // Dialogs
  const [approveDialog, setApproveDialog] = useState<Withdrawal | null>(null)
  const [processDialog, setProcessDialog] = useState<Withdrawal | null>(null)
  const [rejectDialog, setRejectDialog] = useState<Withdrawal | null>(null)

  // Form states
  const [transactionRef, setTransactionRef] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })

      if (statusFilter !== "ALL") {
        queryParams.append("status", statusFilter)
      }

      const response = await fetch(`/api/admin/withdrawals?${queryParams}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch withdrawals")
      }

      setWithdrawals(data.data)
      setTotalPages(data.meta.totalPages)
      setStatusCounts(data.meta.statusCounts || {})
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [page, statusFilter])

  const handleApprove = async () => {
    if (!approveDialog) return

    try {
      setActionLoading(true)

      const response = await fetch(
        `/api/admin/withdrawals/${approveDialog.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve withdrawal")
      }

      toast({
        title: "Success",
        description: "Withdrawal approved successfully",
      })

      setApproveDialog(null)
      fetchWithdrawals()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleProcess = async () => {
    if (!processDialog || !transactionRef) return

    try {
      setActionLoading(true)

      const response = await fetch(
        `/api/admin/withdrawals/${processDialog.id}/process`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionRef }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process withdrawal")
      }

      toast({
        title: "Success",
        description: "Withdrawal marked as completed",
      })

      setProcessDialog(null)
      setTransactionRef("")
      fetchWithdrawals()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectDialog || !rejectionReason) return

    try {
      setActionLoading(true)

      const response = await fetch(
        `/api/admin/withdrawals/${rejectDialog.id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject withdrawal")
      }

      toast({
        title: "Success",
        description: "Withdrawal rejected",
      })

      setRejectDialog(null)
      setRejectionReason("")
      fetchWithdrawals()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string }> = {
      PENDING: { variant: "secondary", label: "Pending" },
      APPROVED: { variant: "default", label: "Approved" },
      PROCESSING: { variant: "default", label: "Processing" },
      COMPLETED: { variant: "default", label: "Completed" },
      REJECTED: { variant: "destructive", label: "Rejected" },
    }

    const c = config[status] || { variant: "outline", label: status }
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Withdrawal Management</h1>
        <p className="text-muted-foreground mt-1">
          Review and process agent withdrawal requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {Object.entries(statusCounts).map(([status, data]: [string, any]) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.count}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${data.totalAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>
            Click on a withdrawal to view details and take action
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <Download className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Withdrawals Found</h3>
              <p className="text-muted-foreground">
                No withdrawal requests match your current filter
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{withdrawal.agentName}</p>
                            <p className="text-xs text-muted-foreground">
                              {withdrawal.agentEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {withdrawal.currency} {withdrawal.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {WithdrawalMethodLabels[withdrawal.method as WithdrawalMethod] || withdrawal.method}
                          <br />
                          {withdrawal.method === WithdrawalMethod.MPESA && withdrawal.mpesaPhone && (
                            <span className="text-xs text-muted-foreground">
                              {withdrawal.mpesaPhone}
                            </span>
                          )}
                          {withdrawal.method === WithdrawalMethod.BANK && withdrawal.bankDetails && (
                            <span className="text-xs text-muted-foreground">
                              {withdrawal.bankDetails.bankName}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(withdrawal.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {withdrawal.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => setApproveDialog(withdrawal)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setRejectDialog(withdrawal)}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {(withdrawal.status === "APPROVED" ||
                              withdrawal.status === "PROCESSING") && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => setProcessDialog(withdrawal)}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || loading}
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

      {/* Approve Dialog */}
      <Dialog
        open={!!approveDialog}
        onOpenChange={(open) => !open && setApproveDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal</DialogTitle>
            <DialogDescription>
              Confirm approval of this withdrawal request
            </DialogDescription>
          </DialogHeader>
          {approveDialog && (
            <div className="space-y-4">
              <div>
                <Label>Agent</Label>
                <p className="font-medium">{approveDialog.agentName}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="font-medium">
                  {approveDialog.currency} {approveDialog.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <Label>Method</Label>
                <p className="font-medium">
                  {WithdrawalMethodLabels[approveDialog.method as WithdrawalMethod] || approveDialog.method}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialog(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Dialog */}
      <Dialog
        open={!!processDialog}
        onOpenChange={(open) => {
          if (!open) {
            setProcessDialog(null)
            setTransactionRef("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Withdrawal</DialogTitle>
            <DialogDescription>
              Mark this withdrawal as completed with transaction reference
            </DialogDescription>
          </DialogHeader>
          {processDialog && (
            <div className="space-y-4">
              <div>
                <Label>Agent</Label>
                <p className="font-medium">{processDialog.agentName}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="font-medium">
                  {processDialog.currency} {processDialog.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <Label htmlFor="transactionRef">Transaction Reference *</Label>
                <Input
                  id="transactionRef"
                  placeholder="e.g., TXN123456789"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the transaction ID from the payment system
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setProcessDialog(null)
                setTransactionRef("")
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcess}
              disabled={actionLoading || !transactionRef}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Mark as Completed"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={!!rejectDialog}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDialog(null)
            setRejectionReason("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this withdrawal request
            </DialogDescription>
          </DialogHeader>
          {rejectDialog && (
            <div className="space-y-4">
              <div>
                <Label>Agent</Label>
                <p className="font-medium">{rejectDialog.agentName}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="font-medium">
                  {rejectDialog.currency} {rejectDialog.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Please provide a detailed reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 10 characters
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog(null)
                setRejectionReason("")
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || rejectionReason.length < 10}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Withdrawal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
