"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Compass, Calendar, MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  isAuthenticated?: boolean
}

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    requiresAuth: false,
  },
  {
    label: "Tours",
    href: "/tours",
    icon: Compass,
    requiresAuth: false,
  },
  {
    label: "Bookings",
    href: "/dashboard/bookings",
    icon: Calendar,
    requiresAuth: true,
    authFallback: "/login",
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
    requiresAuth: true,
    authFallback: "/login",
  },
  {
    label: "Profile",
    href: "/dashboard",
    icon: User,
    requiresAuth: true,
    authFallback: "/login",
  },
]

export function MobileNav({ isAuthenticated = false }: MobileNavProps) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Hide on admin and agent routes
  const shouldShow = !pathname.startsWith("/admin") && !pathname.startsWith("/agent")

  useEffect(() => {
    if (!shouldShow) return

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [lastScrollY, shouldShow])

  if (!shouldShow) return null

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t shadow-lg transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item) => {
          // Determine the actual href based on auth state
          const href = item.requiresAuth && !isAuthenticated && item.authFallback
            ? item.authFallback
            : item.href

          // Check if this item is active
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))

          const Icon = item.icon

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
