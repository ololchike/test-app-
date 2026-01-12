"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Map,
  Calendar,
  CalendarDays,
  DollarSign,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  BarChart3,
  Users,
  Star,
  Headphones,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { UnreadBadge } from "@/components/messages/unread-badge"
import type { LucideIcon } from "lucide-react"

interface AgentSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
  agent?: {
    businessName?: string
    isVerified?: boolean
  }
}

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: number
  showUnreadBadge?: boolean
}

const agentNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/agent/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Tours",
    href: "/agent/tours",
    icon: Map,
  },
  {
    title: "Bookings",
    href: "/agent/bookings",
    icon: Calendar,
  },
  {
    title: "Availability",
    href: "/agent/availability",
    icon: CalendarDays,
  },
  {
    title: "Earnings",
    href: "/agent/earnings",
    icon: DollarSign,
  },
  {
    title: "Reviews",
    href: "/agent/reviews",
    icon: Star,
  },
  {
    title: "Analytics",
    href: "/agent/analytics",
    icon: BarChart3,
  },
  {
    title: "Customers",
    href: "/agent/customers",
    icon: Users,
  },
  {
    title: "Messages",
    href: "/agent/messages",
    icon: MessageSquare,
    showUnreadBadge: true,
  },
  {
    title: "Contacts",
    href: "/agent/contacts",
    icon: Headphones,
  },
]

const bottomNavItems: NavItem[] = [
  {
    title: "Settings",
    href: "/agent/settings",
    icon: Settings,
  },
]

export function AgentSidebar({ user, agent }: AgentSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r bg-background transition-all duration-300 h-screen",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">S+</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-foreground leading-none">SafariPlus</span>
              <span className="text-xs text-muted-foreground">Agent Portal</span>
            </div>
          )}
        </Link>
      </div>

      {/* Quick Action */}
      {!collapsed && (
        <div className="p-3 border-b shrink-0">
          <Button className="w-full" asChild>
            <Link href="/agent/tours/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Tour
            </Link>
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-1 p-2">
        {agentNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2 relative"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge
                      variant={isActive ? "secondary" : "default"}
                      className="h-5 min-w-5 flex items-center justify-center text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {item.showUnreadBadge && (
                    <UnreadBadge variant={isActive ? "secondary" : "default"} />
                  )}
                </>
              )}
              {collapsed && item.showUnreadBadge && (
                <UnreadBadge className="absolute -top-1 -right-1 h-4 min-w-4 text-[10px]" />
              )}
            </Link>
          )
        })}

        <div className="pt-4 mt-4 border-t">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t p-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>

      {/* User Section */}
      <div className="border-t p-4 shrink-0">
        {!collapsed && (
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">
                {agent?.businessName || user.name}
              </p>
              {agent?.isVerified && (
                <Badge variant="secondary" className="text-[10px] h-4">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-destructive hover:text-destructive",
            collapsed && "justify-center px-2"
          )}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </aside>
  )
}
