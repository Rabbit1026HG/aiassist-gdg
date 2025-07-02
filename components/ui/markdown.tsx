"use client"

import type React from "react"
import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // Simple markdown parser
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n")
    const elements: React.ReactNode[] = []
    let currentList: string[] = []
    let currentCodeBlock: { language: string; code: string } | null = null
    let inCodeBlock = false

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-3">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-sm sm:text-base">
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ul>,
        )
        currentList = []
      }
    }

    const flushCodeBlock = () => {
      if (currentCodeBlock) {
        const codeId = `code-${elements.length}`
        elements.push(
          <div key={codeId} className="my-4 rounded-lg overflow-hidden bg-slate-900 dark:bg-slate-950">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 dark:bg-slate-900 border-b border-slate-700">
              <span className="text-xs text-slate-300 font-mono">{currentCodeBlock.language || "code"}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(currentCodeBlock!.code, codeId)}
                className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              >
                {copiedCode === codeId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className="text-sm text-slate-100 font-mono whitespace-pre">{currentCodeBlock.code}</code>
            </pre>
          </div>,
        )
        currentCodeBlock = null
      }
    }

    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          flushCodeBlock()
          inCodeBlock = false
        } else {
          flushList()
          const language = line.slice(3).trim()
          currentCodeBlock = { language, code: "" }
          inCodeBlock = true
        }
        return
      }

      if (inCodeBlock && currentCodeBlock) {
        currentCodeBlock.code += (currentCodeBlock.code ? "\n" : "") + line
        return
      }

      // Handle headers
      if (line.startsWith("#")) {
        flushList()
        const level = line.match(/^#+/)?.[0].length || 1
        const text = line.replace(/^#+\s*/, "")
        const HeaderTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements
        elements.push(
          <HeaderTag
            key={`header-${elements.length}`}
            className={cn(
              "font-bold mt-6 mb-3",
              level === 1 && "text-xl sm:text-2xl",
              level === 2 && "text-lg sm:text-xl",
              level === 3 && "text-base sm:text-lg",
              level >= 4 && "text-sm sm:text-base",
            )}
          >
            {parseInlineMarkdown(text)}
          </HeaderTag>,
        )
        return
      }

      // Handle lists
      if (line.match(/^[\s]*[-*+]\s/)) {
        const item = line.replace(/^[\s]*[-*+]\s/, "")
        currentList.push(item)
        return
      }

      // Handle numbered lists
      if (line.match(/^[\s]*\d+\.\s/)) {
        flushList()
        const item = line.replace(/^[\s]*\d+\.\s/, "")
        currentList.push(item)
        return
      }

      // Handle blockquotes
      if (line.startsWith(">")) {
        flushList()
        const text = line.replace(/^>\s*/, "")
        elements.push(
          <blockquote
            key={`quote-${elements.length}`}
            className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-3 italic text-slate-600 dark:text-slate-400"
          >
            {parseInlineMarkdown(text)}
          </blockquote>,
        )
        return
      }

      // Handle regular paragraphs
      if (line.trim()) {
        flushList()
        elements.push(
          <p key={`p-${elements.length}`} className="text-sm sm:text-base mb-3 leading-relaxed">
            {parseInlineMarkdown(line)}
          </p>,
        )
      } else if (currentList.length === 0) {
        // Empty line - add spacing
        elements.push(<div key={`space-${elements.length}`} className="h-2" />)
      }
    })

    // Flush any remaining content
    flushList()
    flushCodeBlock()

    return elements
  }

  const parseInlineMarkdown = (text: string): React.ReactNode => {
    // Handle inline code
    text = text.replace(
      /`([^`]+)`/g,
      '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
    )

    // Handle bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')

    // Handle italic
    text = text.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')

    // Handle links
    text = text.replace(
      /\[([^\]]+)\]$$([^)]+)$$/g,
      '<a href="$2" class="text-violet-600 dark:text-violet-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>',
    )

    return <span dangerouslySetInnerHTML={{ __html: text }} />
  }

  return <div className="markdown-content">{parseMarkdown(content)}</div>
}
