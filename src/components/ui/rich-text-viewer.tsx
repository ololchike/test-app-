"use client"

import { cn } from "@/lib/utils"

interface RichTextViewerProps {
  content: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function RichTextViewer({ content, className, size = "lg" }: RichTextViewerProps) {
  const sizeClasses = {
    sm: "prose-sm",
    md: "prose",
    lg: "prose-lg",
  }

  return (
    <div
      className={cn(
        // Base prose styles matching the editor
        "prose dark:prose-invert max-w-none",
        sizeClasses[size],
        // Headings
        "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground",
        "prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border",
        "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3",
        "prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2",
        // Paragraphs
        "prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4",
        // Links
        "prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:underline-offset-4 prose-a:decoration-primary/30 hover:prose-a:decoration-primary prose-a:transition-colors",
        // Lists
        "prose-ul:my-6 prose-ul:pl-6 prose-li:mb-2 prose-li:text-muted-foreground",
        "prose-ol:my-6 prose-ol:pl-6",
        "prose-li:marker:text-primary",
        // Blockquotes
        "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-3 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-blockquote:font-medium",
        // Code
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-primary prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:bg-muted prose-pre:rounded-xl prose-pre:p-4 prose-pre:border prose-pre:border-border",
        // Images
        "prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8",
        // Strong/Bold
        "prose-strong:font-semibold prose-strong:text-foreground",
        // Horizontal rule
        "prose-hr:my-10 prose-hr:border-border",
        // Tables
        "prose-table:border prose-table:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-td:border-t prose-td:border-border",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
