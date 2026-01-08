"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"

const countries = ["Kenya", "Tanzania", "Uganda", "Rwanda"]
const tourTypes = [
  "Safari",
  "Beach",
  "Mountain",
  "Cultural",
  "Adventure",
  "Wildlife",
  "Gorilla Trekking",
  "Bird Watching",
  "Photography",
  "Honeymoon",
  "Family",
  "Luxury",
  "Budget",
]
const durations = [
  { label: "1-3 Days", value: "1-3" },
  { label: "4-7 Days", value: "4-7" },
  { label: "8-14 Days", value: "8-14" },
  { label: "15+ Days", value: "15+" },
]

export function TourFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("q") || "")
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get("minPrice") || "0"),
    parseInt(searchParams.get("maxPrice") || "10000"),
  ])
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    searchParams.get("countries")?.split(",").filter(Boolean) || []
  )
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get("types")?.split(",").filter(Boolean) || []
  )
  const [selectedDuration, setSelectedDuration] = useState<string>(
    searchParams.get("duration") || ""
  )
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured")

  // Sync URL params to state when they change
  useEffect(() => {
    setSearch(searchParams.get("q") || "")
    setPriceRange([
      parseInt(searchParams.get("minPrice") || "0"),
      parseInt(searchParams.get("maxPrice") || "10000"),
    ])
    setSelectedCountries(
      searchParams.get("countries")?.split(",").filter(Boolean) || []
    )
    setSelectedTypes(
      searchParams.get("types")?.split(",").filter(Boolean) || []
    )
    setSelectedDuration(searchParams.get("duration") || "")
    setSortBy(searchParams.get("sort") || "featured")
  }, [searchParams])

  const activeFiltersCount =
    selectedCountries.length +
    selectedTypes.length +
    (selectedDuration ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (sortBy && sortBy !== "featured") params.set("sort", sortBy)
    if (selectedCountries.length) params.set("countries", selectedCountries.join(","))
    if (selectedTypes.length) params.set("types", selectedTypes.join(","))
    if (selectedDuration) params.set("duration", selectedDuration)
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString())
    if (priceRange[1] < 10000) params.set("maxPrice", priceRange[1].toString())

    router.push(`/tours?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    setSearch("")
    setPriceRange([0, 10000])
    setSelectedCountries([])
    setSelectedTypes([])
    setSelectedDuration("")
    setSortBy("featured")
    router.push("/tours")
  }

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    )
  }

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tours, destinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-96 overflow-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Narrow down your search results
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <FilterContent
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  selectedCountries={selectedCountries}
                  toggleCountry={toggleCountry}
                  selectedTypes={selectedTypes}
                  toggleType={toggleType}
                  selectedDuration={selectedDuration}
                  setSelectedDuration={setSelectedDuration}
                />
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={clearFilters} className="flex-1">
                    Clear All
                  </Button>
                  <Button onClick={handleSearch} className="flex-1">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedCountries.map((country) => (
            <Badge key={country} variant="secondary" className="gap-1">
              {country}
              <button onClick={() => toggleCountry(country)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedTypes.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type}
              <button onClick={() => toggleType(type)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedDuration && (
            <Badge variant="secondary" className="gap-1">
              {durations.find((d) => d.value === selectedDuration)?.label}
              <button onClick={() => setSelectedDuration("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(priceRange[0] > 0 || priceRange[1] < 10000) && (
            <Badge variant="secondary" className="gap-1">
              ${priceRange[0]} - ${priceRange[1]}
              <button onClick={() => setPriceRange([0, 10000])}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}

// Desktop Sidebar Filter Content
export function TourFiltersSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get("minPrice") || "0"),
    parseInt(searchParams.get("maxPrice") || "10000"),
  ])
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    searchParams.get("countries")?.split(",").filter(Boolean) || []
  )
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get("types")?.split(",").filter(Boolean) || []
  )
  const [selectedDuration, setSelectedDuration] = useState<string>(
    searchParams.get("duration") || ""
  )

  // Sync URL params to state when they change
  useEffect(() => {
    setPriceRange([
      parseInt(searchParams.get("minPrice") || "0"),
      parseInt(searchParams.get("maxPrice") || "10000"),
    ])
    setSelectedCountries(
      searchParams.get("countries")?.split(",").filter(Boolean) || []
    )
    setSelectedTypes(
      searchParams.get("types")?.split(",").filter(Boolean) || []
    )
    setSelectedDuration(searchParams.get("duration") || "")
  }, [searchParams])

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    )
  }

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleApply = () => {
    const params = new URLSearchParams(searchParams)

    // Reset to page 1 when filters change
    params.delete("page")

    if (selectedCountries.length) {
      params.set("countries", selectedCountries.join(","))
    } else {
      params.delete("countries")
    }
    if (selectedTypes.length) {
      params.set("types", selectedTypes.join(","))
    } else {
      params.delete("types")
    }
    if (selectedDuration) {
      params.set("duration", selectedDuration)
    } else {
      params.delete("duration")
    }
    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString())
    } else {
      params.delete("minPrice")
    }
    if (priceRange[1] < 10000) {
      params.set("maxPrice", priceRange[1].toString())
    } else {
      params.delete("maxPrice")
    }

    router.push(`/tours?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    setPriceRange([0, 10000])
    setSelectedCountries([])
    setSelectedTypes([])
    setSelectedDuration("")
    router.push("/tours")
  }

  return (
    <div className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Filters</h3>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>

        <FilterContent
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          selectedCountries={selectedCountries}
          toggleCountry={toggleCountry}
          selectedTypes={selectedTypes}
          toggleType={toggleType}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
        />

        <Button onClick={handleApply} className="w-full">
          Apply Filters
        </Button>
      </div>
    </div>
  )
}

// Shared filter content component
function FilterContent({
  priceRange,
  setPriceRange,
  selectedCountries,
  toggleCountry,
  selectedTypes,
  toggleType,
  selectedDuration,
  setSelectedDuration,
}: {
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  selectedCountries: string[]
  toggleCountry: (country: string) => void
  selectedTypes: string[]
  toggleType: (type: string) => void
  selectedDuration: string
  setSelectedDuration: (duration: string) => void
}) {
  return (
    <>
      {/* Price Range */}
      <div className="space-y-3">
        <Label>Price Range</Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={10000}
          step={100}
          className="py-4"
        />
        <div className="flex items-center justify-between text-sm">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}+</span>
        </div>
      </div>

      {/* Countries */}
      <div className="space-y-3">
        <Label>Countries</Label>
        <div className="space-y-2">
          {countries.map((country) => (
            <div key={country} className="flex items-center gap-2">
              <Checkbox
                id={`country-${country}`}
                checked={selectedCountries.includes(country)}
                onCheckedChange={() => toggleCountry(country)}
              />
              <label
                htmlFor={`country-${country}`}
                className="text-sm cursor-pointer"
              >
                {country}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-3">
        <Label>Duration</Label>
        <Select
          value={selectedDuration || "all"}
          onValueChange={(value) => setSelectedDuration(value === "all" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any duration</SelectItem>
            {durations.map((duration) => (
              <SelectItem key={duration.value} value={duration.value}>
                {duration.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tour Types */}
      <div className="space-y-3">
        <Label>Tour Type</Label>
        <div className="flex flex-wrap gap-2">
          {tourTypes.map((type) => (
            <Badge
              key={type}
              variant={selectedTypes.includes(type) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleType(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>
    </>
  )
}
