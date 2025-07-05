"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  const [copied, setCopied] = React.useState(false)

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
      <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
        <code className={language ? `language-${language}` : ""}>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  )
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split("\n")
    const elements: React.ReactNode[] = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i]

      // Code blocks (\`\`\`)
      if (line.trim().startsWith("```")) {
        const language = line.trim().slice(3).trim()
        const codeLines: string[] = []
        i++

        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i])
          i++
        }

        elements.push(
          <CodeBlock key={`code-${elements.length}`} code={codeLines.join("\n")} language={language || undefined} />,
        )
        i++
        continue
      }

      // Headers
      if (line.startsWith("#")) {
        const level = line.match(/^#+/)?.[0].length || 1
        const text = line.replace(/^#+\s*/, "")
        const HeaderTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements

        elements.push(
          <HeaderTag
            key={`header-${elements.length}`}
            className={cn(
              "font-bold mt-6 mb-3 first:mt-0",
              level === 1 && "text-2xl",
              level === 2 && "text-xl",
              level === 3 && "text-lg",
              level >= 4 && "text-base",
            )}
          >
            {parseInlineMarkdown(text)}
          </HeaderTag>,
        )
        i++
        continue
      }

      // Lists
      if (line.match(/^[\s]*[-*+]\s/) || line.match(/^[\s]*\d+\.\s/)) {
        const listItems: string[] = []
        const isOrdered = line.match(/^[\s]*\d+\.\s/)
        const baseIndent = line.match(/^[\s]*/)?.[0].length || 0

        while (i < lines.length) {
          const currentLine = lines[i]
          const currentIndent = currentLine.match(/^[\s]*/)?.[0].length || 0

          if (currentLine.trim() === "") {
            i++
            continue
          }

          if (
            currentIndent >= baseIndent &&
            (currentLine.match(/^[\s]*[-*+]\s/) || currentLine.match(/^[\s]*\d+\.\s/))
          ) {
            listItems.push(currentLine.replace(/^[\s]*[-*+]\s/, "").replace(/^[\s]*\d+\.\s/, ""))
            i++
          } else if (currentIndent > baseIndent) {
            // Continuation of list item
            listItems[listItems.length - 1] += "\n" + currentLine.trim()
            i++
          } else {
            break
          }
        }

        const ListTag = isOrdered ? "ol" : "ul"
        elements.push(
          <ListTag
            key={`list-${elements.length}`}
            className={cn("my-4 ml-6", isOrdered ? "list-decimal" : "list-disc")}
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="mb-1">
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ListTag>,
        )
        continue
      }

      // Blockquotes
      if (line.startsWith(">")) {
        const quoteLines: string[] = []

        while (i < lines.length && (lines[i].startsWith(">") || lines[i].trim() === "")) {
          if (lines[i].startsWith(">")) {
            quoteLines.push(lines[i].replace(/^>\s?/, ""))
          } else {
            quoteLines.push("")
          }
          i++
        }

        elements.push(
          <blockquote
            key={`quote-${elements.length}`}
            className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 italic text-slate-600 dark:text-slate-400"
          >
            {parseInlineMarkdown(quoteLines.join("\n"))}
          </blockquote>,
        )
        continue
      }

      // Tables
      if (line.includes("|") && lines[i + 1]?.includes("|") && lines[i + 1]?.includes("-")) {
        const tableLines: string[] = []

        while (i < lines.length && lines[i].includes("|")) {
          tableLines.push(lines[i])
          i++
        }

        if (tableLines.length >= 2) {
          const headers = tableLines[0]
            .split("|")
            .map((h) => h.trim())
            .filter((h) => h)
          const rows = tableLines.slice(2).map((row) =>
            row
              .split("|")
              .map((cell) => cell.trim())
              .filter((cell) => cell),
          )

          elements.push(
            <div key={`table-${elements.length}`} className="my-4 overflow-x-auto">
              <table className="min-w-full border border-slate-200 dark:border-slate-700 rounded-lg">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    {headers.map((header, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-2 text-left font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700"
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

      // Horizontal rules
      if (line.trim().match(/^[-*_]{3,}$/)) {
        elements.push(
          <hr key={`hr-${elements.length}`} className="my-6 border-t border-slate-200 dark:border-slate-700" />,
        )
        i++
        continue
      }

      // Regular paragraphs
      if (line.trim()) {
        const paragraphLines: string[] = [line]
        i++

        while (i < lines.length && lines[i].trim() && !isSpecialLine(lines[i])) {
          paragraphLines.push(lines[i])
          i++
        }

        elements.push(
          <p key={`p-${elements.length}`} className="mb-4 leading-relaxed">
            {parseInlineMarkdown(paragraphLines.join(" "))}
          </p>,
        )
        continue
      }

      // Empty lines
      i++
    }

    return elements
  }

  const isSpecialLine = (line: string): boolean => {
    return (
      line.startsWith("#") ||
      line.startsWith(">") ||
      line.match(/^[\s]*[-*+]\s/) !== null ||
      line.match(/^[\s]*\d+\.\s/) !== null ||
      line.trim().startsWith("```") ||
      line.includes("|") ||
      line.trim().match(/^[-*_]{3,}$/) !== null
    )
  }

  const parseInlineMarkdown = (text: string): React.ReactNode => {
    if (!text) return text

    // Split by code spans first to avoid processing markdown inside them
    const parts = text.split(/(`[^`]+`)/)

    return parts.map((part, index) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        // Inline code
        return (
          <code
            key={index}
            className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200 dark:border-slate-700"
          >
            {part.slice(1, -1)}
          </code>
        )
      }

      // Process other inline markdown
      let processed: React.ReactNode = part

      // Bold (**text** or __text__)
      processed = processInlinePattern(processed, /(\*\*|__)(.*?)\1/g, (match, _, content) => (
        <strong key={`bold-${Math.random()}`} className="font-bold">
          {content}
        </strong>
      ))

      // Italic (*text* or _text_)
      processed = processInlinePattern(processed, /(\*|_)(.*?)\1/g, (match, _, content) => (
        <em key={`italic-${Math.random()}`} className="italic">
          {content}
        </em>
      ))

      // Links [text](url)
      processed = processInlinePattern(processed, /\[([^\]]+)\]$$([^)]+)$$/g, (match, text, url) => (
        <a
          key={`link-${Math.random()}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {text}
        </a>
      ))

      // Strikethrough ~~text~~
      processed = processInlinePattern(processed, /~~(.*?)~~/g, (match, content) => (
        <del key={`strike-${Math.random()}`} className="line-through">
          {content}
        </del>
      ))

      return processed
    })
  }

  const processInlinePattern = (
    text: React.ReactNode,
    pattern: RegExp,
    replacer: (match: string, ...groups: string[]) => React.ReactNode,
  ): React.ReactNode => {
    if (typeof text !== "string") return text

    const parts = text.split(pattern)
    if (parts.length === 1) return text

    const result: React.ReactNode[] = []
    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 0) {
        // Regular text
        if (parts[i]) result.push(parts[i])
      } else if (i % 3 === 2) {
        // Matched content
        const fullMatch = parts[i - 1] + parts[i] + (parts[i + 1] || "")
        result.push(replacer(fullMatch, parts[i - 1], parts[i]))
      }
    }

    return result
  }

  return <div className={cn("prose prose-slate dark:prose-invert max-w-none", className)}>{parseMarkdown(content)}</div>
}
