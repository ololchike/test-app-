"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  sectionName?: string
  className?: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showRetry?: boolean
  minHeight?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`SectionErrorBoundary [${this.props.sectionName || "unnamed"}] caught an error:`, error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-dashed",
            this.props.minHeight || "min-h-[200px]",
            this.props.className
          )}
        >
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground text-center mb-1">
            {this.props.sectionName
              ? `Unable to load ${this.props.sectionName}`
              : "Unable to load this section"}
          </p>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <p className="text-xs text-destructive/70 text-center mb-3 max-w-xs truncate">
              {this.state.error.message}
            </p>
          )}
          {this.props.showRetry !== false && (
            <Button variant="ghost" size="sm" onClick={this.handleReset}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for easier use
interface SectionErrorProps {
  children: ReactNode
  name?: string
  className?: string
  showRetry?: boolean
  minHeight?: string
  fallback?: ReactNode
}

export function SectionError({
  children,
  name,
  className,
  showRetry = true,
  minHeight,
  fallback,
}: SectionErrorProps) {
  return (
    <SectionErrorBoundary
      sectionName={name}
      className={className}
      showRetry={showRetry}
      minHeight={minHeight}
      fallback={fallback}
    >
      {children}
    </SectionErrorBoundary>
  )
}
