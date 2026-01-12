"use client"

import Link from "next/link"
import { Bell, Menu, Search, Plus, Sparkles } from "lucide-react"
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
  Map,
  Calendar,
  DollarSign,
  MessageSquare,
  Settings,
  LogOut,
  Star,
  BarChart3,
  Users,
  Headphones,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface AgentHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

const mobileNavItems = [
  { title: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
  { title: "My Tours", href: "/agent/tours", icon: Map },
  { title: "Bookings", href: "/agent/bookings", icon: Calendar },
  { title: "Earnings", href: "/agent/earnings", icon: DollarSign },
  { title: "Reviews", href: "/agent/reviews", icon: Star },
  { title: "Analytics", href: "/agent/analytics", icon: BarChart3 },
  { title: "Customers", href: "/agent/customers", icon: Users },
  { title: "Messages", href: "/agent/messages", icon: MessageSquare },
  { title: "Contacts", href: "/agent/contacts", icon: Headphones },
  { title: "Settings", href: "/agent/settings", icon: Settings },
]

export function AgentHeader({ user }: AgentHeaderProps) {
  const pathname = usePathname()
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "A"

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur-md px-4 lg:px-6">
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden hover:bg-primary/10">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-gradient-to-b from-background to-muted/20">
          <SheetHeader className="border-b border-border/50 p-4">
            <SheetTitle>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-glow">
                  <span className="text-sm font-bold text-primary-foreground">S+</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold">Safari<span className="text-primary">Plus</span></span>
                  <span className="text-[10px] text-muted-foreground font-medium">Agent Portal</span>
                </div>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className="p-3 border-b border-border/50">
            <Button className="w-full shadow-glow h-10" asChild>
              <Link href="/agent/tours/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Tour
              </Link>
            </Button>
          </div>
          <nav className="flex-1 space-y-1 p-2">
            {mobileNavItems.map((item, index) => {
              const isActive = pathname === item.href
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
                        : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </motion.div>
              )
            })}
          </nav>
          <div className="border-t border-border/50 p-4 bg-gradient-to-t from-muted/30 to-transparent">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tours, bookings..."
            className="pl-9 h-10 rounded-xl border-border/50 bg-muted/30 focus:bg-background focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Create Tour Button (Desktop) */}
        <Button size="sm" className="hidden md:flex h-9 px-4 rounded-xl shadow-glow" asChild>
          <Link href="/agent/tours/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Tour
          </Link>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-primary/10">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl border-border/50">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              <div className="p-6 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary cursor-pointer py-3" asChild>
              <Link href="/agent/notifications">View all notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-border/50 hover:ring-primary/50 transition-all">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.image || undefined} alt={user.name || "Agent"} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-orange-500 text-primary-foreground font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-xl border-border/50">
            <DropdownMenuLabel className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image || undefined} alt={user.name || "Agent"} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-orange-500 text-primary-foreground font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <Badge variant="secondary" className="mt-3 w-full justify-center text-xs bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Agent Account
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="py-2.5 px-4 cursor-pointer">
              <Link href="/agent/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="py-2.5 px-4 cursor-pointer">
              <Link href="/" target="_blank">
                <Map className="mr-2 h-4 w-4" />
                View Public Site
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="py-2.5 px-4 text-destructive focus:text-destructive cursor-pointer focus:bg-destructive/10"
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
