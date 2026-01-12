"use client"

import { Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWishlistStatus } from "@/hooks/use-wishlist"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState } from "react"

interface WishlistButtonProps {
  tourId: string
  variant?: "icon" | "default"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function WishlistButton({
  tourId,
  variant = "icon",
  size = "icon",
  className,
}: WishlistButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { isInWishlist, isLoading, toggle } = useWishlistStatus(tourId)
  const [isToggling, setIsToggling] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user) {
      router.push("/login?callbackUrl=" + window.location.pathname)
      return
    }

    setIsToggling(true)
    await toggle()
    setIsToggling(false)
  }

  if (variant === "icon") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={size}
              onClick={handleClick}
              disabled={isLoading || isToggling}
              className={cn(
                "rounded-full bg-white/80 hover:bg-white shadow-sm",
                className
              )}
            >
              {isLoading || isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isInWishlist
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600 hover:text-red-500"
                  )}
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button
      variant={isInWishlist ? "default" : "outline"}
      size={size}
      onClick={handleClick}
      disabled={isLoading || isToggling}
      className={className}
    >
      {isLoading || isToggling ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Heart
          className={cn(
            "h-4 w-4 mr-2",
            isInWishlist && "fill-current"
          )}
        />
      )}
      {isInWishlist ? "Saved" : "Save"}
    </Button>
  )
}
