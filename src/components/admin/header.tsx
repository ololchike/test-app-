"use client"

import Link from "next/link"
import { Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  Map,
  Calendar,
  DollarSign,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  BarChart3,
  FileText,
  Bell,
  HelpCircle,
  Mail,
  Star,
  Percent,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

const mobileNavItems = [
  {
    section: "Overview",
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    section: "Management",
    items: [
      { title: "Agents", href: "/admin/agents", icon: Shield },
      { title: "Users", href: "/admin/users", icon: Users },
      { title: "Tours", href: "/admin/tours", icon: Map },
      { title: "Bookings", href: "/admin/bookings", icon: Calendar },
      { title: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    section: "Financial",
    items: [
      { title: "Transactions", href: "/admin/transactions", icon: DollarSign },
      { title: "Withdrawals", href: "/admin/withdrawals", icon: CreditCard },
      { title: "Commission Tiers", href: "/admin/commission-tiers", icon: Percent },
    ],
  },
  {
    section: "Communication",
    items: [
      { title: "Contact Messages", href: "/admin/contacts", icon: Mail },
      { title: "Notifications", href: "/admin/notifications", icon: Bell },
    ],
  },
  {
    section: "System",
    items: [
      { title: "Reports", href: "/admin/reports", icon: FileText },
      { title: "Site Content", href: "/admin/site-content", icon: FileText },
      { title: "Settings", href: "/admin/settings", icon: Settings },
      { title: "Support", href: "/admin/support", icon: HelpCircle },
    ],
  },
]

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "A"

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const query = encodeURIComponent(searchQuery.trim())
      // Determine where to redirect based on current page
      if (pathname.includes("/agents")) {
        router.push(`/admin/agents?search=${query}`)
      } else if (pathname.includes("/users")) {
        router.push(`/admin/users?search=${query}`)
      } else if (pathname.includes("/bookings")) {
        router.push(`/admin/bookings?search=${query}`)
      } else if (pathname.includes("/tours")) {
        router.push(`/admin/tours?search=${query}`)
      } else {
        // Default to agents search
        router.push(`/admin/agents?search=${query}`)
      }
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">S+</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold">SafariPlus</span>
                  <span className="text-xs text-muted-foreground">Admin Panel</span>
                </div>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex-1 overflow-y-auto p-2">
            {mobileNavItems.map((section) => (
              <div key={section.section} className="mb-4">
                <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.section}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users, agents, tours..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50"
          />
        </div>
      </form>

      <div className="flex items-center gap-2">
        {/* System Status */}
        <Badge variant="outline" className="hidden md:flex gap-1 items-center">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          All systems operational
        </Badge>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                8
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Admin Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-[10px]">Urgent</Badge>
                </div>
                <p className="text-sm font-medium">Withdrawal request pending</p>
                <p className="text-xs text-muted-foreground">
                  Safari Adventures Kenya - $5,000
                </p>
                <p className="text-xs text-muted-foreground">10 minutes ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Badge className="text-[10px] bg-amber-500">Review</Badge>
                </div>
                <p className="text-sm font-medium">New agent registration</p>
                <p className="text-xs text-muted-foreground">
                  Kenya Wild Safaris awaiting approval
                </p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">Report</Badge>
                </div>
                <p className="text-sm font-medium">Weekly report ready</p>
                <p className="text-xs text-muted-foreground">
                  Platform performance report generated
                </p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary cursor-pointer">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.image || undefined} alt={user.name || "Admin"} />
                <AvatarFallback className="bg-destructive text-destructive-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <Badge variant="destructive" className="w-fit text-[10px]">
                  Administrator
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/" target="_blank">
                <Map className="mr-2 h-4 w-4" />
                View Public Site
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
