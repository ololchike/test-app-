"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2, Percent, Users, DollarSign } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SectionError } from "@/components/error"

interface CommissionTier {
  id: string
  name: string
  minBookings: number
  minRevenue: number | null
  commissionRate: number
  description: string | null
  color: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const defaultColors = [
  { name: "Bronze", color: "#CD7F32" },
  { name: "Silver", color: "#C0C0C0" },
  { name: "Gold", color: "#FFD700" },
  { name: "Platinum", color: "#E5E4E2" },
]

export default function CommissionTiersPage() {
  const [tiers, setTiers] = useState<CommissionTier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingTier, setEditingTier] = useState<CommissionTier | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    minBookings: 0,
    minRevenue: "",
    commissionRate: 12,
    description: "",
    color: "#CD7F32",
    isActive: true,
  })

  useEffect(() => {
    fetchTiers()
  }, [])

  const fetchTiers = async () => {
    try {
      const response = await fetch("/api/admin/commission-tiers")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setTiers(data.tiers)
    } catch {
      toast.error("Failed to load commission tiers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (tier?: CommissionTier) => {
    if (tier) {
      setEditingTier(tier)
      setFormData({
        name: tier.name,
        minBookings: tier.minBookings,
        minRevenue: tier.minRevenue?.toString() || "",
        commissionRate: tier.commissionRate,
        description: tier.description || "",
        color: tier.color || "#CD7F32",
        isActive: tier.isActive,
      })
    } else {
      setEditingTier(null)
      setFormData({
        name: "",
        minBookings: 0,
        minRevenue: "",
        commissionRate: 12,
        description: "",
        color: "#CD7F32",
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        name: formData.name,
        minBookings: formData.minBookings,
        minRevenue: formData.minRevenue ? parseFloat(formData.minRevenue) : null,
        commissionRate: formData.commissionRate,
        description: formData.description || null,
        color: formData.color,
        isActive: formData.isActive,
      }

      const url = editingTier
        ? `/api/admin/commission-tiers/${editingTier.id}`
        : "/api/admin/commission-tiers"

      const response = await fetch(url, {
        method: editingTier ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save")

      toast.success(editingTier ? "Tier updated" : "Tier created")
      setIsDialogOpen(false)
      fetchTiers()
    } catch {
      toast.error("Failed to save commission tier")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/commission-tiers/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast.success("Tier deleted")
      setDeleteConfirmId(null)
      fetchTiers()
    } catch {
      toast.error("Failed to delete commission tier")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Commission Tiers</h1>
          <p className="text-muted-foreground">
            Configure automatic commission rates based on agent performance
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tier
        </Button>
      </div>

      <SectionError name="Commission Tiers Table">
        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tiers</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tiers.length}</div>
            <p className="text-xs text-muted-foreground">
              {tiers.filter(t => t.isActive).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lowest Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tiers.length > 0
                ? Math.min(...tiers.map(t => t.commissionRate)).toFixed(1)
                : "0"}%
            </div>
            <p className="text-xs text-muted-foreground">For top performers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Highest Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tiers.length > 0
                ? Math.max(...tiers.map(t => t.commissionRate)).toFixed(1)
                : "0"}%
            </div>
            <p className="text-xs text-muted-foreground">For new agents</p>
          </CardContent>
        </Card>
      </div>

      {/* Tiers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Tiers</CardTitle>
          <CardDescription>
            Agents automatically qualify for tiers based on their booking count
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tiers.length === 0 ? (
            <div className="text-center py-12">
              <Percent className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No commission tiers</h3>
              <p className="text-muted-foreground mb-4">
                Create tiers to reward high-performing agents with lower commission rates
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Tier
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier</TableHead>
                  <TableHead>Min. Bookings</TableHead>
                  <TableHead>Min. Revenue</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers.map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: tier.color || "#888" }}
                        />
                        <div>
                          <div className="font-medium">{tier.name}</div>
                          {tier.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {tier.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{tier.minBookings}</TableCell>
                    <TableCell>
                      {tier.minRevenue ? `$${tier.minRevenue.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tier.commissionRate}%</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tier.isActive ? "default" : "outline"}>
                        {tier.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(tier)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmId(tier.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </SectionError>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTier ? "Edit Commission Tier" : "Create Commission Tier"}
            </DialogTitle>
            <DialogDescription>
              {editingTier
                ? "Update the commission tier settings"
                : "Create a new commission tier for agents"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tier Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Gold"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <div className="flex gap-1">
                    {defaultColors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: c.color }}
                        onClick={() => setFormData({ ...formData, color: c.color, name: formData.name || c.name })}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minBookings">Minimum Bookings</Label>
                <Input
                  id="minBookings"
                  type="number"
                  min="0"
                  value={formData.minBookings}
                  onChange={(e) => setFormData({ ...formData, minBookings: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minRevenue">Minimum Revenue (optional)</Label>
                <Input
                  id="minRevenue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minRevenue}
                  onChange={(e) => setFormData({ ...formData, minRevenue: e.target.value })}
                  placeholder="e.g., 10000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Platform takes this percentage of each booking
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this tier..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingTier ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Commission Tier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tier? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
