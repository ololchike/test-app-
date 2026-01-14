"use client"

import { useState, useEffect, useCallback } from "react"

interface BotProtectionState {
  honeypot: string
  loadTime: number
  isBot: boolean
}

interface BotProtectionResult {
  honeypotProps: {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    tabIndex: number
    autoComplete: string
    "aria-hidden": boolean
    style: React.CSSProperties
  }
  checkIsBot: () => boolean
  getProtectionData: () => { hp: string; lt: number }
}

const MIN_FORM_TIME_MS = 3000 // Minimum 3 seconds to fill form (bots are faster)

/**
 * Hook for bot protection on forms
 * Uses honeypot field + time-based detection
 */
export function useBotProtection(): BotProtectionResult {
  const [state, setState] = useState<BotProtectionState>({
    honeypot: "",
    loadTime: Date.now(),
    isBot: false,
  })

  // Reset load time on mount
  useEffect(() => {
    setState(prev => ({
      ...prev,
      loadTime: Date.now(),
    }))
  }, [])

  // Handle honeypot change (bots will fill this)
  const handleHoneypotChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      honeypot: e.target.value,
      isBot: e.target.value.length > 0, // Any value = bot
    }))
  }, [])

  // Check if submission looks like a bot
  const checkIsBot = useCallback(() => {
    const timeTaken = Date.now() - state.loadTime

    // Bot indicators:
    // 1. Honeypot field is filled (should be hidden/empty)
    // 2. Form submitted too quickly (< 3 seconds)
    const isTooFast = timeTaken < MIN_FORM_TIME_MS
    const isHoneypotFilled = state.honeypot.length > 0

    return isTooFast || isHoneypotFilled
  }, [state.loadTime, state.honeypot])

  // Get protection data to send with form
  const getProtectionData = useCallback(() => ({
    hp: state.honeypot,
    lt: Date.now() - state.loadTime,
  }), [state.honeypot, state.loadTime])

  return {
    honeypotProps: {
      value: state.honeypot,
      onChange: handleHoneypotChange,
      tabIndex: -1,
      autoComplete: "off",
      "aria-hidden": true,
      style: {
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        opacity: 0,
        pointerEvents: "none",
        height: 0,
        width: 0,
        overflow: "hidden",
      },
    },
    checkIsBot,
    getProtectionData,
  }
}

/**
 * Server-side validation for bot protection data
 */
export function validateBotProtection(data: { hp?: string; lt?: number }): {
  isValid: boolean
  reason?: string
} {
  // Honeypot filled = bot
  if (data.hp && data.hp.length > 0) {
    return { isValid: false, reason: "honeypot" }
  }

  // Form submitted too fast = bot
  if (data.lt && data.lt < MIN_FORM_TIME_MS) {
    return { isValid: false, reason: "too_fast" }
  }

  return { isValid: true }
}
