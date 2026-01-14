"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  MapPin,
  Clock,
  X,
  Binoculars,
  TreePine,
  Mountain,
  Crown,
  Users,
  Heart,
  Camera,
  Compass,
  Palmtree,
  Landmark,
  Cat,
  Bird,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSearchHistory } from "@/lib/hooks/use-search-history"
import { cn } from "@/lib/utils"
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value"

interface SearchSuggestions {
  destinations: { name: string; country: string; tourCount: number }[]
  tourTypes: { value: string; label: string; icon: string }[]
  tours: { id: string; slug: string; title: string; destination: string; coverImage: string | null; basePrice: number }[]
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Binoculars,
  TreePine,
  Mountain,
  Crown,
  Users,
  Heart,
  Camera,
  Compass,
  Palmtree,
  Landmark,
  Cat,
  Bird,
}

interface SearchWithSuggestionsProps {
  placeholder?: string
  className?: string
  inputClassName?: string
  onSearch?: (query: string) => void
  variant?: "default" | "hero" | "navbar"
}

export function SearchWithSuggestions({
  placeholder = "Where do you want to go?",
  className,
  inputClassName,
  onSearch,
  variant = "default",
}: SearchWithSuggestionsProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestions | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory()

  const debouncedQuery = useDebouncedValue(query, 300)

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`)
        const data = await response.json()
        setSuggestions(data)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchSuggestions()
    }
  }, [debouncedQuery, isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    addSearch(searchQuery)
    setIsOpen(false)

    if (onSearch) {
      onSearch(searchQuery)
    } else {
      router.push(`/tours?q=${encodeURIComponent(searchQuery)}`)
    }
  }, [addSearch, onSearch, router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query)
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const showHistory = history.length > 0 && !query
  const showDestinations = suggestions?.destinations && suggestions.destinations.length > 0
  const showTourTypes = suggestions?.tourTypes && suggestions.tourTypes.length > 0
  const showTours = suggestions?.tours && suggestions.tours.length > 0

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "pl-10 pr-10",
            variant === "hero" && "h-12 border-0 bg-muted/50 text-base font-medium focus-visible:ring-primary",
            variant === "navbar" && "h-10 bg-muted",
            inputClassName
          )}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full hover:bg-muted flex items-center justify-center"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "absolute top-full left-0 right-0 mt-2 bg-card rounded-xl border border-border shadow-xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto",
              variant === "navbar" && "min-w-[300px]"
            )}
          >
            {/* Search History */}
            {showHistory && (
              <div className="p-3 border-b border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Recent Searches
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-1">
                  {history.map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between group"
                    >
                      <button
                        onClick={() => handleSearch(item)}
                        className="flex-1 flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-muted text-left"
                      >
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {item}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeSearch(item)
                        }}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Destinations */}
            {showDestinations && (
              <div className="p-3 border-b border-border/50">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  Destinations
                </div>
                <div className="space-y-1">
                  {suggestions?.destinations.map((dest) => (
                    <button
                      key={`${dest.name}-${dest.country}`}
                      onClick={() => handleSearch(dest.name)}
                      className="w-full flex items-center justify-between px-2 py-2 text-sm rounded-lg hover:bg-muted text-left"
                    >
                      <div>
                        <span className="font-medium">{dest.name}</span>
                        <span className="text-muted-foreground">, {dest.country}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {dest.tourCount} tours
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tour Types */}
            {showTourTypes && (
              <div className="p-3 border-b border-border/50">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Popular Categories
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions?.tourTypes.map((type) => {
                    const IconComponent = iconMap[type.icon] || Compass
                    return (
                      <button
                        key={type.value}
                        onClick={() => router.push(`/tours?type=${type.value}`)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted text-left border border-border/50"
                      >
                        <IconComponent className="h-4 w-4 text-primary" />
                        <span>{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Matching Tours */}
            {showTours && (
              <div className="p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Search className="h-4 w-4" />
                  Tours
                </div>
                <div className="space-y-2">
                  {suggestions?.tours.map((tour) => (
                    <Link
                      key={tour.id}
                      href={`/tours/${tour.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                    >
                      <div className="relative h-12 w-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={tour.coverImage || "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=100"}
                          alt={tour.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{tour.title}</p>
                        <p className="text-xs text-muted-foreground">{tour.destination}</p>
                      </div>
                      <div className="text-sm font-bold text-primary">
                        ${tour.basePrice}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* View All Results */}
            {query && (
              <div className="p-3 border-t border-border/50 bg-muted/30">
                <Button
                  onClick={() => handleSearch(query)}
                  variant="ghost"
                  className="w-full justify-center"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search for "{query}"
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading suggestions...
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !showHistory && !showDestinations && !showTourTypes && !showTours && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Start typing to search for destinations, tours, or experiences
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
