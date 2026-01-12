"use client"

import { useState, useEffect } from "react"
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
import { Loader2, FileText } from "lucide-react"
import { format } from "date-fns"

interface Withdrawal {
  id: string
  amount: number
  currency: string
  method: string
  status: string
  mpesaPhone?: string
  bankDetails?: string
  transactionRef?: string
  rejectionReason?: string
  createdAt: string
  processedAt?: string
}

interface WithdrawalHistoryProps {
  refreshTrigger?: number
}

export function WithdrawalHistory({ refreshTrigger }: WithdrawalHistoryProps) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/agent/withdrawals?page=${page}&limit=10`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch withdrawals")
      }

      setWithdrawals(data.data)
      setTotalPages(data.meta.totalPages)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [page, refreshTrigger])

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
    > = {
      PENDING: { variant: "secondary", label: "Pending" },
      APPROVED: { variant: "default", label: "Approved" },
      PROCESSING: { variant: "default", label: "Processing" },
      COMPLETED: { variant: "default", label: "Completed" },
      REJECTED: { variant: "destructive", label: "Rejected" },
    }

    const config = statusConfig[status] || { variant: "outline", label: status }

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getMethodLabel = (method: string) => {
    return method === "mpesa" ? "M-Pesa" : "Bank Transfer"
  }

  if (loading && withdrawals.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchWithdrawals}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No Withdrawals Yet</h3>
        <p className="text-muted-foreground">
          Your withdrawal requests will appear here once you submit them.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(withdrawal.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="font-medium">
                  {withdrawal.currency} {withdrawal.amount.toFixed(2)}
                </TableCell>
                <TableCell>{getMethodLabel(withdrawal.method)}</TableCell>
                <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                <TableCell>
                  {withdrawal.transactionRef ? (
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {withdrawal.transactionRef}
                    </code>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {withdrawal.status === "REJECTED" && withdrawal.rejectionReason ? (
                    <div className="max-w-xs">
                      <p className="text-xs text-destructive">
                        {withdrawal.rejectionReason}
                      </p>
                    </div>
                  ) : withdrawal.method === "mpesa" && withdrawal.mpesaPhone ? (
                    <span className="text-xs text-muted-foreground">
                      {withdrawal.mpesaPhone}
                    </span>
                  ) : withdrawal.method === "bank" && withdrawal.bankDetails ? (
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        try {
                          const details = JSON.parse(withdrawal.bankDetails)
                          return details.bankName || "Bank Transfer"
                        } catch {
                          return "Bank Transfer"
                        }
                      })()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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
    </div>
  )
}
