"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Agent {
  id: string
  businessName: string
  email: string
  businessEmail?: string | null
  isVerified: boolean
  status: string
}

interface ForwardToAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messageId: string
  onSuccess?: () => void
}

export function ForwardToAgentDialog({
  open,
  onOpenChange,
  messageId,
  onSuccess,
}: ForwardToAgentDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [adminNote, setAdminNote] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isForwarding, setIsForwarding] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)

  // Search agents when query changes
  useEffect(() => {
    const searchAgents = async () => {
      if (searchQuery.length < 2) {
        setAgents([])
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch(
          `/api/admin/agents/search?q=${encodeURIComponent(searchQuery)}`
        )
        if (!response.ok) throw new Error("Failed to search agents")

        const data = await response.json()
        setAgents(data.agents || [])
      } catch (error) {
        console.error("Error searching agents:", error)
        toast.error("Failed to search agents")
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchAgents, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleForward = async () => {
    if (!selectedAgent) {
      toast.error("Please select an agent")
      return
    }

    setIsForwarding(true)
    try {
      const response = await fetch(`/api/admin/contacts/${messageId}/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          adminNote: adminNote.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to forward message")
      }

      toast.success(`Message forwarded to ${selectedAgent.businessName}`)
      onOpenChange(false)

      // Reset form
      setSelectedAgent(null)
      setAdminNote("")
      setSearchQuery("")
      setAgents([])

      onSuccess?.()
    } catch (error) {
      console.error("Error forwarding message:", error)
      toast.error(error instanceof Error ? error.message : "Failed to forward message")
    } finally {
      setIsForwarding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Forward to Agent</DialogTitle>
          <DialogDescription>
            Select an agent to handle this customer inquiry
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Agent Selection */}
          <div className="space-y-2">
            <Label>Select Agent</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  {selectedAgent ? (
                    <div className="flex items-center gap-2">
                      <span className="truncate">{selectedAgent.businessName}</span>
                      {selectedAgent.isVerified && (
                        <Badge variant="secondary" className="text-[10px] h-4">
                          Verified
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Search for an agent...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search agents by name or email..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {isSearching ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Searching...
                        </span>
                      </div>
                    ) : agents.length === 0 && searchQuery.length >= 2 ? (
                      <CommandEmpty>No agents found.</CommandEmpty>
                    ) : agents.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        Type to search for agents
                      </div>
                    ) : (
                      <CommandGroup>
                        {agents.map((agent) => (
                          <CommandItem
                            key={agent.id}
                            value={agent.id}
                            onSelect={() => {
                              setSelectedAgent(agent)
                              setComboboxOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedAgent?.id === agent.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">
                                  {agent.businessName}
                                </span>
                                {agent.isVerified && (
                                  <Badge variant="secondary" className="text-[10px] h-4">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                {agent.email}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedAgent && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedAgent.businessName} ({selectedAgent.email})
              </p>
            )}
          </div>

          {/* Admin Note */}
          <div className="space-y-2">
            <Label htmlFor="adminNote">
              Note to Agent <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="adminNote"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add any instructions or context for the agent..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This note will be included in the email sent to the agent
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isForwarding}
          >
            Cancel
          </Button>
          <Button onClick={handleForward} disabled={!selectedAgent || isForwarding}>
            {isForwarding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Forwarding...
              </>
            ) : (
              "Forward to Agent"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
