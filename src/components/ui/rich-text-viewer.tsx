"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import { cn } from "@/lib/utils"

interface RichTextViewerProps {
  content: string
  className?: string
}

export function RichTextViewer({ content, className }: RichTextViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-slate dark:prose-invert max-w-none focus:outline-none",
      },
    },
  })

  if (!editor) {
    return (
      <div
        className={cn("prose prose-slate dark:prose-invert max-w-none", className)}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  )
}
