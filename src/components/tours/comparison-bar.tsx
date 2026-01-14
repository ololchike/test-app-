"use client"

import { useComparison } from "@/lib/contexts/comparison-context"
import { Button } from "@/components/ui/button"
import { X, GitCompare, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function ComparisonBar() {
  const { tours, removeTour, clearAll, maxTours } = useComparison()

  if (tours.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t shadow-2xl"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Selected tours */}
            <div className="flex items-center gap-3 flex-1 overflow-x-auto">
              <div className="flex items-center gap-2 shrink-0">
                <GitCompare className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">
                  Compare ({tours.length}/{maxTours})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {tours.map((tour) => (
                  <motion.div
                    key={tour.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="relative group"
                  >
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-2 pr-8">
                      <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                        {tour.coverImage ? (
                          <Image
                            src={tour.coverImage}
                            alt={tour.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs text-primary font-bold">
                              {tour.title.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 max-w-[120px]">
                        <p className="text-sm font-medium truncate">{tour.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {tour.destination}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeTour(tour.id)}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: maxTours - tours.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-[160px] h-[56px] rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground text-xs"
                  >
                    Add tour
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button
                asChild
                disabled={tours.length < 2}
                className={cn(
                  "shadow-glow",
                  tours.length < 2 && "opacity-50 cursor-not-allowed"
                )}
              >
                <Link href={`/tours/compare?ids=${tours.map((t) => t.id).join(",")}`}>
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare {tours.length} Tours
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
