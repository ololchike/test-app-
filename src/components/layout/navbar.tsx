"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Menu,
  X,
  Search,
  User,
  ChevronDown,
  LogOut,
  Settings,
  LayoutDashboard,
  Heart,
  Calendar,
  MessageSquare,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navigation = [
  { name: "Tours", href: "/tours" },
  { name: "Destinations", href: "/destinations" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isAuthenticated = status === "authenticated"
  const user = session?.user
  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const getDashboardLink = () => {
    if (user?.role === "ADMIN") return "/admin/dashboard"
    if (user?.role === "AGENT") return "/agent/dashboard"
    return "/dashboard"
  }

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto flex h-18 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">S+</span>
          </div>
          <span className="text-xl font-bold text-foreground">SafariPlus</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 lg:flex">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-full px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {userInitials || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userInitials || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()} className="flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookings" className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist" className="flex items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/messages" className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/signout" className="flex items-center text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col gap-6 pt-6">
              {/* Mobile Navigation Links */}
              <nav className="flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      pathname === item.href
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="border-t pt-6">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {userInitials || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <nav className="flex flex-col gap-2">
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </Link>
                      <Link
                        href="/bookings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted"
                      >
                        <Calendar className="h-5 w-5" />
                        My Bookings
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted"
                      >
                        <Heart className="h-5 w-5" />
                        Wishlist
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted"
                      >
                        <Settings className="h-5 w-5" />
                        Settings
                      </Link>
                    </nav>
                    <Button variant="outline" asChild className="mt-2">
                      <Link href="/api/auth/signout">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button variant="outline" asChild>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
