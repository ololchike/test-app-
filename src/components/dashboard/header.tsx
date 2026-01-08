"use client"

import Link from "next/link"
import { Bell, Menu, Search } from "lucide-react"
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
  Calendar,
  Heart,
  MessageSquare,
  User,
  Settings,
  LogOut,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

const mobileNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
  { title: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { title: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { title: "Profile", href: "/dashboard/profile", icon: User },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardHeader({ user }: HeaderProps) {
  const pathname = usePathname()
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

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
                <span className="font-bold">SafariPlus</span>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex-1 space-y-1 p-2">
            {mobileNavItems.map((item) => {
              const isActive = pathname === item.href
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
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tours, bookings..."
            className="pl-9 bg-muted/50"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = e.currentTarget.value.trim()
                if (value) {
                  window.location.href = `/tours?search=${encodeURIComponent(value)}`
                }
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                3
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                <p className="text-sm font-medium">Booking Confirmed</p>
                <p className="text-xs text-muted-foreground">
                  Your Masai Mara safari has been confirmed for Jan 15
                </p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                <p className="text-sm font-medium">New Message</p>
                <p className="text-xs text-muted-foreground">
                  Safari Adventures replied to your inquiry
                </p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                <p className="text-sm font-medium">Special Offer</p>
                <p className="text-xs text-muted-foreground">
                  20% off on Serengeti tours this month
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
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground">
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
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
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
