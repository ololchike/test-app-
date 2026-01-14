"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "safariplus_search_history"
const MAX_HISTORY = 5

interface SearchHistoryItem {
  query: string
  timestamp: number
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored) as SearchHistoryItem[]
        // Filter out old searches (older than 30 days)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        const recentHistory = data.filter(item => item.timestamp > thirtyDaysAgo)
        setHistory(recentHistory)
      } catch {
        setHistory([])
      }
    }
    setIsLoaded(true)
  }, [])

  const addSearch = useCallback((query: string) => {
    if (!query.trim()) return

    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: Date.now(),
    }

    setHistory(prev => {
      // Remove duplicates and add new item at the beginning
      const filtered = prev.filter(item => item.query.toLowerCase() !== query.toLowerCase())
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeSearch = useCallback((query: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.query !== query)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  return {
    history: history.map(item => item.query),
    isLoaded,
    addSearch,
    removeSearch,
    clearHistory,
  }
}
