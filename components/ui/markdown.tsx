"use client"

import React, { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { JSX } from "react/jsx-runtime"

interface MarkdownRendererProps {
  content: string
  className?: string
}

interface CodeBlockProps {
  code: string
  language?: string
}

function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  return (
    <div className="relative group">
      <div className="flex items-center justify-between bg-slate-800 dark:bg-slate-900 px-4 py-2 rounded-t-lg">
        <span className="text-xs text-slate-400 font-mono">{language || "code"}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-b-lg overflow-x-auto">
        <code className="text-sm font-mono leading-relaxed">{code}</code>
      </pre>
    </div>
  )
}

function parseMarkdown(content: string): React.ReactNode[] {
  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code blocks
    if (line.startsWith("```")) {
      const language = line.slice(3).trim()
      const codeLines: string[] = []
      i++

      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }

      elements.push(<CodeBlock key={elements.length} code={codeLines.join("\n")} language={language} />)
      i++
      continue
    }

    // Headers
    if (line.startsWith("#")) {
      const level = line.match(/^#+/)?.[0].length || 1
      const text = line.replace(/^#+\s*/, "")
      const HeaderTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements

      elements.push(
        React.createElement(
          HeaderTag,
          {
            key: elements.length,
            className: cn(
              "font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3",
              level === 1 && "text-2xl",
              level === 2 && "text-xl",
              level === 3 && "text-lg",
              level >= 4 && "text-base",
            ),
          },
          parseInlineMarkdown(text),
        ),
      )
      i++
      continue
    }

    // Lists
    if (line.match(/^[\s]*[-*+]\s/) || line.match(/^[\s]*\d+\.\s/)) {
      const listItems: string[] = []
      const isOrdered = line.match(/^[\s]*\d+\.\s/)

      while (
        i < lines.length &&
        (lines[i].match(/^[\s]*[-*+]\s/) || lines[i].match(/^[\s]*\d+\.\s/) || lines[i].trim() === "")
      ) {
        if (lines[i].trim() !== "") {
          listItems.push(lines[i].replace(/^[\s]*[-*+\d.]\s*/, ""))
        }
        i++
      }

      const ListTag = isOrdered ? "ol" : "ul"
      elements.push(
        React.createElement(
          ListTag,
          {
            key: elements.length,
            className: cn("my-4 ml-6", isOrdered ? "list-decimal" : "list-disc"),
          },
          listItems.map((item, idx) => (
            <li key={idx} className="mb-1 text-slate-700 dark:text-slate-300">
              {parseInlineMarkdown(item)}
            </li>
          )),
        ),
      )
      continue
    }

    // Blockquotes
    if (line.startsWith(">")) {
      const quoteLines: string[] = []

      while (i < lines.length && (lines[i].startsWith(">") || lines[i].trim() === "")) {
        if (lines[i].trim() !== "") {
          quoteLines.push(lines[i].replace(/^>\s*/, ""))
        }
        i++
      }

      elements.push(
        <blockquote
          key={elements.length}
          className="border-l-4 border-violet-500 pl-4 py-2 my-4 bg-slate-50 dark:bg-slate-800/50 italic text-slate-700 dark:text-slate-300"
        >
          {quoteLines.map((quoteLine, idx) => (
            <p key={idx}>{parseInlineMarkdown(quoteLine)}</p>
          ))}
        </blockquote>,
      )
      continue
    }

    // Tables
    if (line.includes("|") && lines[i + 1]?.includes("|") && lines[i + 1]?.includes("-")) {
      const tableRows: string[] = []

      while (i < lines.length && lines[i].includes("|")) {
        tableRows.push(lines[i])
        i++
      }

      if (tableRows.length > 1) {
        const headers = tableRows[0]
          .split("|")
          .map((h) => h.trim())
          .filter((h) => h)
        const rows = tableRows.slice(2).map((row) =>
          row
            .split("|")
            .map((cell) => cell.trim())
            .filter((cell) => cell),
        )

        elements.push(
          <div key={elements.length} className="overflow-x-auto my-4">
            <table className="min-w-full border border-slate-200 dark:border-slate-700 rounded-lg">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  {headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700"
                    >
                      {parseInlineMarkdown(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2 text-slate-700 dark:text-slate-300">
                        {parseInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        )
        continue
      }
    }

    // Regular paragraphs
    if (line.trim() !== "") {
      const paragraphLines: string[] = []

      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        !lines[i].startsWith("#") &&
        !lines[i].startsWith("```") &&
        !lines[i].match(/^[\s]*[-*+]\s/) &&
        !lines[i].match(/^[\s]*\d+\.\s/) &&
        !lines[i].startsWith(">")
      ) {
        paragraphLines.push(lines[i])
        i++
      }

      elements.push(
        <p key={elements.length} className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          {parseInlineMarkdown(paragraphLines.join(" "))}
        </p>,
      )
      continue
    }

    i++
  }

  return elements
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  let currentText = text
  let key = 0

  // Process inline code first
  currentText = currentText.replace(/`([^`]+)`/g, (match, code) => {
    const placeholder = `__INLINE_CODE_${key}__`
    elements.push(
      <code
        key={`code-${key}`}
        className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-violet-600 dark:text-violet-400"
      >
        {code}
      </code>,
    )
    key++
    return placeholder
  })

  // Process links
  currentText = currentText.replace(/\[([^\]]+)\]$$([^)]+)$$/g, (match, linkText, url) => {
    const placeholder = `__LINK_${key}__`
    elements.push(
      <a
        key={`link-${key}`}
        href={url}
        className="text-violet-600 dark:text-violet-400 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {linkText}
      </a>,
    )
    key++
    return placeholder
  })

  // Process bold text
  currentText = currentText.replace(/\*\*([^*]+)\*\*/g, (match, boldText) => {
    const placeholder = `__BOLD_${key}__`
    elements.push(
      <strong key={`bold-${key}`} className="font-semibold text-slate-900 dark:text-slate-100">
        {boldText}
      </strong>,
    )
    key++
    return placeholder
  })

  // Process italic text
  currentText = currentText.replace(/\*([^*]+)\*/g, (match, italicText) => {
    const placeholder = `__ITALIC_${key}__`
    elements.push(
      <em key={`italic-${key}`} className="italic">
        {italicText}
      </em>,
    )
    key++
    return placeholder
  })

  // Split by placeholders and reconstruct
  const parts = currentText.split(/(__[A-Z_]+_\d+__)/g)
  const result: React.ReactNode[] = []

  parts.forEach((part, index) => {
    if (part.startsWith("__") && part.endsWith("__")) {
      // Find the corresponding element
      const elementIndex = Number.parseInt(part.match(/_(\d+)__$/)?.[1] || "0")
      const element = elements.find((_, idx) => idx === elementIndex)
      if (element) {
        result.push(element)
      }
    } else if (part.trim()) {
      result.push(<span key={`text-${index}`}>{part}</span>)
    }
  })

  return result.length > 0 ? result : [text]
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const elements = parseMarkdown(content)

  return <div className={cn("prose prose-slate dark:prose-invert max-w-none", className)}>{elements}</div>
}
