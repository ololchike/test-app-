"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaginationProps extends React.ComponentProps<"nav"> {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  ...props
}: PaginationProps) {
  const pages = React.useMemo(() => {
    const delta = 2
    const range: (number | string)[] = []
    const rangeWithDots: (number | string)[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i !== l + 1) {
          rangeWithDots.push("...")
        }
      }
      rangeWithDots.push(i)
      l = i as number
    })

    return rangeWithDots
  }, [currentPage, totalPages])

  if (totalPages <= 1) return null

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    >
      <div className="flex flex-row items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <Button
                key={`ellipsis-${index}`}
                variant="ghost"
                size="icon"
                disabled
                aria-label="More pages"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(page as number)}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Button>
          )
        })}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  )
}

interface LoadMoreButtonProps extends React.ComponentProps<typeof Button> {
  hasMore: boolean
  isLoading?: boolean
  onLoadMore: () => void
}

function LoadMoreButton({
  hasMore,
  isLoading,
  onLoadMore,
  className,
  ...props
}: LoadMoreButtonProps) {
  if (!hasMore) return null

  return (
    <div className="flex justify-center mt-8">
      <Button
        variant="outline"
        size="lg"
        onClick={onLoadMore}
        disabled={isLoading}
        className={className}
        {...props}
      >
        {isLoading ? "Loading..." : "Load More"}
      </Button>
    </div>
  )
}

export { Pagination, LoadMoreButton }
