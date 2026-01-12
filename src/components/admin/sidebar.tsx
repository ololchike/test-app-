"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Map,
  Calendar,
  DollarSign,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  BarChart3,
  FileText,
  Bell,
  HelpCircle,
  Mail,
  Star,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface AdminSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

const adminNavItems = [
  {
    section: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    section: "Management",
    items: [
      {
        title: "Agents",
        href: "/admin/agents",
        icon: Shield,
        badge: 3,
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Tours",
        href: "/admin/tours",
        icon: Map,
      },
      {
        title: "Bookings",
        href: "/admin/bookings",
        icon: Calendar,
      },
      {
        title: "Reviews",
        href: "/admin/reviews",
        icon: Star,
      },
    ],
  },
  {
    section: "Financial",
    items: [
      {
        title: "Transactions",
        href: "/admin/transactions",
        icon: DollarSign,
      },
      {
        title: "Withdrawals",
        href: "/admin/withdrawals",
        icon: CreditCard,
        badge: 5,
      },
    ],
  },
  {
    section: "Communication",
    items: [
      {
        title: "Contact Messages",
        href: "/admin/contacts",
        icon: Mail,
      },
      {
        title: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
      },
    ],
  },
  {
    section: "System",
    items: [
      {
        title: "Reports",
        href: "/admin/reports",
        icon: FileText,
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
      {
        title: "Support",
        href: "/admin/support",
        icon: HelpCircle,
      },
    ],
  },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
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
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {adminNavItems.map((section) => (
          <div key={section.section} className="mb-4">
            {!collapsed && (
              <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.section}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/")
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
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant={isActive ? "secondary" : "destructive"}
                            className="h-5 min-w-5 flex items-center justify-center text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
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
              <p className="text-sm font-medium truncate">{user.name}</p>
              <Badge variant="destructive" className="text-[10px] h-4">
                Admin
              </Badge>
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
