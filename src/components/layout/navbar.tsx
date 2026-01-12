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
  Compass,
  MapPin,
  Sparkles,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  { name: "Tours", href: "/tours", icon: Compass },
  { name: "Destinations", href: "/destinations", icon: MapPin },
  { name: "About", href: "/about", icon: null },
  { name: "Contact", href: "/contact", icon: null },
]

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)

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
        "fixed top-0 z-50 w-full transition-all duration-500",
        isScrolled
          ? "bg-background/80 shadow-premium backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/50"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-glow"
          >
            <span className="text-lg font-bold text-primary-foreground">S+</span>
          </motion.div>
          <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            Safari<span className="text-primary">Plus</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors rounded-full",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.name}
              {/* Active indicator */}
              {pathname === item.href && (
                <motion.div
                  layoutId="navbar-active"
                  className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {/* Hover indicator */}
              <AnimatePresence>
                {hoveredItem === item.name && pathname !== item.href && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 bg-muted rounded-full -z-10"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </motion.div>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-full px-3 h-10 hover:bg-primary/10 border border-transparent hover:border-primary/20"
                  >
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-bold">
                        {userInitials || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-border/50 shadow-premium-lg">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                      {userInitials || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate">{user?.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer">
                  <Link href={getDashboardLink()} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                    </div>
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer">
                  <Link href="/dashboard/bookings" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                    <span>My Bookings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer">
                  <Link href="/dashboard/wishlist" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-rose-500" />
                    </div>
                    <span>Wishlist</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer">
                  <Link href="/dashboard/messages" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-amber-500" />
                    </div>
                    <span>Messages</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer">
                  <Link href="/dashboard/settings" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer text-destructive focus:text-destructive">
                  <Link href="/api/auth/signout" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <LogOut className="h-4 w-4 text-destructive" />
                    </div>
                    <span>Sign Out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="ghost" asChild className="rounded-full h-10 hover:bg-primary/10 hover:text-primary">
                  <Link href="/login">Sign In</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button asChild className="rounded-full h-10 shadow-glow">
                  <Link href="/signup">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Started
                  </Link>
                </Button>
              </motion.div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </motion.div>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="p-6 border-b border-border/50 bg-gradient-to-br from-primary/10 to-secondary/10">
                <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-glow">
                    <span className="text-lg font-bold text-primary-foreground">S+</span>
                  </div>
                  <span className="text-xl font-bold text-foreground">
                    Safari<span className="text-primary">Plus</span>
                  </span>
                </Link>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col gap-1 p-4">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all",
                        pathname === item.href
                          ? "text-primary bg-primary/10"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {item.icon && <item.icon className="h-5 w-5" />}
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto border-t border-border/50 p-4 bg-muted/30">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                          {userInitials || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{user?.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <nav className="flex flex-col gap-1">
                      {[
                        { href: getDashboardLink(), icon: LayoutDashboard, label: "Dashboard", iconBg: "bg-primary/10", iconColor: "text-primary" },
                        { href: "/dashboard/bookings", icon: Calendar, label: "My Bookings", iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
                        { href: "/dashboard/wishlist", icon: Heart, label: "Wishlist", iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
                        { href: "/dashboard/settings", icon: Settings, label: "Settings", iconBg: "bg-muted", iconColor: "text-muted-foreground" },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", item.iconBg)}>
                            <item.icon className={cn("h-4 w-4", item.iconColor)} />
                          </div>
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                    <Button variant="outline" asChild className="h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10">
                      <Link href="/api/auth/signout" onClick={() => setMobileMenuOpen(false)}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button variant="outline" asChild className="h-12 rounded-xl">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="h-12 rounded-xl shadow-glow">
                      <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Sparkles className="mr-2 h-4 w-4" />
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
