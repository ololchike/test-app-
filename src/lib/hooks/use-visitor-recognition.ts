"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "safariplus_visitor"

interface VisitorData {
  firstVisit: number
  lastVisit: number
  visitCount: number
  hasBooked: boolean
  name?: string
}

interface UseVisitorRecognitionReturn {
  isReturningVisitor: boolean
  isLoaded: boolean
  visitorData: VisitorData | null
  visitCount: number
  daysSinceLastVisit: number
  markAsBooked: () => void
  setVisitorName: (name: string) => void
}

export function useVisitorRecognition(): UseVisitorRecognitionReturn {
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const stored = localStorage.getItem(STORAGE_KEY)
    const now = Date.now()

    if (stored) {
      try {
        const data = JSON.parse(stored) as VisitorData
        // Update last visit and increment count
        const updatedData: VisitorData = {
          ...data,
          lastVisit: now,
          visitCount: data.visitCount + 1,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
        setVisitorData(updatedData)
      } catch {
        // Invalid data, create new
        const newData: VisitorData = {
          firstVisit: now,
          lastVisit: now,
          visitCount: 1,
          hasBooked: false,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
        setVisitorData(newData)
      }
    } else {
      // First time visitor
      const newData: VisitorData = {
        firstVisit: now,
        lastVisit: now,
        visitCount: 1,
        hasBooked: false,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
      setVisitorData(newData)
    }

    setIsLoaded(true)
  }, [])

  const markAsBooked = useCallback(() => {
    if (!visitorData) return
    const updatedData = { ...visitorData, hasBooked: true }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
    setVisitorData(updatedData)
  }, [visitorData])

  const setVisitorName = useCallback((name: string) => {
    if (!visitorData) return
    const updatedData = { ...visitorData, name }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
    setVisitorData(updatedData)
  }, [visitorData])

  const isReturningVisitor = visitorData ? visitorData.visitCount > 1 : false
  const visitCount = visitorData?.visitCount || 0

  // Calculate days since last visit (for returning visitors)
  const daysSinceLastVisit = visitorData && visitorData.visitCount > 1
    ? Math.floor((Date.now() - visitorData.lastVisit) / (1000 * 60 * 60 * 24))
    : 0

  return {
    isReturningVisitor,
    isLoaded,
    visitorData,
    visitCount,
    daysSinceLastVisit,
    markAsBooked,
    setVisitorName,
  }
}
