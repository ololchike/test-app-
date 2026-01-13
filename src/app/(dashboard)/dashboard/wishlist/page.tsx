"use client"

import { Heart, MapPin, Clock, Star, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useWishlist } from "@/hooks/use-wishlist"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function WishlistPage() {
  const { items, isLoading, meta, removeItem, goToPage } = useWishlist()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Wishlist</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Tours you have saved for later
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Wishlist</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Tours you have saved for later
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start exploring tours and save the ones you love to your wishlist.
            </p>
            <Button asChild>
              <Link href="/tours">Browse Tours</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Wishlist</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {meta.total} tour{meta.total !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden group">
            <div className="relative">
              <Link href={`/tours/${item.tour.slug}`}>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.tour.coverImage || "/images/placeholder-tour.jpg"}
                    alt={item.tour.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              </Link>

              {/* Remove button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove from wishlist?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove &quot;{item.tour.title}&quot; from
                      your wishlist?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => removeItem(item.tourId)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Price badge */}
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="bg-white text-foreground">
                  From ${item.tour.basePrice.toLocaleString()}
                </Badge>
              </div>
            </div>

            <CardContent className="p-3 sm:p-4">
              <Link href={`/tours/${item.tour.slug}`}>
                <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors text-sm sm:text-base">
                  {item.tour.title}
                </h3>
              </Link>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {item.tour.destination}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {item.tour.durationDays}D/{item.tour.durationNights}N
                </span>
              </div>

              {item.tour.rating && (
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {item.tour.rating.toFixed(1)}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    ({item.tour.reviewCount} reviews)
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-4 pt-4 border-t">
                <span className="text-xs sm:text-sm text-muted-foreground truncate">
                  by {item.tour.agent.businessName}
                </span>
                <Button size="sm" asChild className="w-full sm:w-auto text-xs sm:text-sm">
                  <Link href={`/tours/${item.tour.slug}`}>
                    View Tour
                    <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => goToPage(meta.page - 1)}
            disabled={meta.page === 1}
            size="sm"
            className="text-xs sm:text-sm"
          >
            Previous
          </Button>
          <span className="flex items-center px-3 sm:px-4 text-xs sm:text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => goToPage(meta.page + 1)}
            disabled={meta.page === meta.totalPages}
            size="sm"
            className="text-xs sm:text-sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
