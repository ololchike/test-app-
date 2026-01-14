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
  Sparkles,
  Megaphone,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { UnreadBadge } from "@/components/messages/unread-badge"
import { motion, AnimatePresence } from "framer-motion"
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
  {
    title: "Marketing",
    href: "/agent/marketing",
    icon: Megaphone,
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
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "hidden lg:flex flex-col border-r bg-gradient-to-b from-background via-background to-muted/20 h-screen relative overflow-hidden"
      )}
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border/50 px-4 shrink-0 relative z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-glow"
          >
            <span className="text-sm font-bold text-primary-foreground">S+</span>
          </motion.div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <span className="font-bold text-foreground leading-none group-hover:text-primary transition-colors">
                  Safari<span className="text-primary">Plus</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">Agent Portal</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Quick Action */}
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="p-3 border-b border-border/50 shrink-0 relative z-10"
          >
            <Button className="w-full shadow-glow h-10" asChild>
              <Link href="/agent/tours/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Tour
              </Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-1 p-2 relative z-10">
        {agentNavItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                  collapsed && "justify-center px-2 relative"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "drop-shadow-sm")} />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && item.badge && (
                  <Badge
                    variant={isActive ? "secondary" : "default"}
                    className="h-5 min-w-5 flex items-center justify-center text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
                {!collapsed && item.showUnreadBadge && (
                  <UnreadBadge variant={isActive ? "secondary" : "default"} />
                )}
                {collapsed && item.showUnreadBadge && (
                  <UnreadBadge className="absolute -top-1 -right-1 h-4 min-w-4 text-[10px]" />
                )}
              </Link>
            </motion.div>
          )
        })}

        <div className="pt-4 mt-4 border-t border-border/50">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-border/50 p-2 shrink-0 relative z-10">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center hover:bg-primary/10"
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
      <div className="border-t border-border/50 p-4 shrink-0 relative z-10 bg-gradient-to-t from-muted/30 to-transparent">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-3"
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate">
                  {agent?.businessName || user.name}
                </p>
                {agent?.isVerified && (
                  <Badge variant="secondary" className="text-[10px] h-5 bg-green-500/10 text-green-600 border-green-500/20">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </motion.aside>
  )
}
