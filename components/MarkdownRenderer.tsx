"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { highlight, TOKEN_COLORS } from "@/lib/highlight"

interface MarkdownRendererProps {
  content: string
  isStreaming?: boolean
}

export default function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  const blocks = parseMarkdown(content)

  return (
    <div className="text-[15px] leading-relaxed text-[var(--foreground)] space-y-4">
      {blocks.map((block, i) => {
        if (block.type === "code") {
          return <CodeBlock key={i} content={block.content} lang={block.lang} />
        }
        if (block.type === "h3") {
          return (
            <h3
              key={i}
              className="text-[18px] font-bold text-[var(--foreground)] mt-6 mb-2 flex items-center gap-2"
              dangerouslySetInnerHTML={{ __html: inlineFormat(block.content) }}
            />
          )
        }
        if (block.type === "h4") {
          return (
            <h4
              key={i}
              className="text-[16px] font-bold text-[var(--foreground)] mt-4 mb-1"
              dangerouslySetInnerHTML={{ __html: inlineFormat(block.content) }}
            />
          )
        }
        if (block.type === "hr") {
          return <hr key={i} className="my-6 border-t border-[var(--border)] opacity-50" />
        }
        if (block.type === "table") {
          return (
            <div key={i} className="my-4 rounded-xl overflow-hidden border border-[var(--border)] shadow-sm">
              <table className="w-full text-[14px] border-collapse">
                <thead>
                  <tr style={{ background: "var(--code-bar)" }}>
                    {block.headers?.map((header, hi) => (
                      <th
                        key={hi}
                        className="text-left px-4 py-2.5 font-bold text-[var(--muted)] border-b border-[var(--border)]"
                        dangerouslySetInnerHTML={{ __html: inlineFormat(header) }}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows?.map((row, ri) => (
                    <tr
                      key={ri}
                      className="border-t border-[var(--border)]"
                      style={{ background: ri % 2 === 0 ? "var(--surface)" : "transparent" }}
                    >
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-4 py-2.5 text-[var(--foreground)] opacity-90"
                          dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="my-3 space-y-2 pl-4">
              {block.items?.map((item, li) => (
                <li key={li} className="flex items-start gap-3">
                  <span style={{ color: "var(--fastapi-teal)" }} className="mt-2 shrink-0 text-[10px]">
                    ●
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
                </li>
              ))}
            </ul>
          )
        }
        if (block.type === "paragraph") {
          return (
            <p
              key={i}
              className="leading-relaxed"
              dangerouslySetInnerHTML={{ __html: inlineFormat(block.content) }}
            />
          )
        }
        return null
      })}
      {isStreaming && (
        <span className="blink-cursor inline-block w-[2px] h-[16px] bg-[var(--fastapi-teal)] ml-0.5 align-text-bottom" />
      )}
    </div>
  )
}

function CodeBlock({ content, lang }: { content: string; lang?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[var(--border)] shadow-sm group">
      <div
        className="px-4 py-2 text-[11px] font-mono text-[var(--muted)] uppercase tracking-widest border-b border-[var(--border)]
          flex items-center justify-between"
        style={{ background: "var(--code-bar)" }}
      >
        <span>{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-[var(--fastapi-teal)]" />
              <span className="text-[var(--fastapi-teal)] font-bold">COPIED</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span className="font-bold">COPY</span>
            </>
          )}
        </button>
      </div>
      <pre
        className="p-5 overflow-x-auto text-[14.5px] font-mono leading-relaxed"
        style={{ background: "var(--code-bg)" }}
      >
        {highlight(content, lang || "").map((token, ti) => (
          <span key={ti} style={{ color: TOKEN_COLORS[token.type] }}>
            {token.value}
          </span>
        ))}
      </pre>
    </div>
  )
}

interface Block {
  type: "code" | "ul" | "paragraph" | "h3" | "h4" | "table" | "hr"
  content: string
  lang?: string
  items?: string[]
  headers?: string[]
  rows?: string[][]
}

function parseMarkdown(text: string): Block[] {
  const blocks: Block[] = []
  const lines = text.split("\n")
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      i++
      blocks.push({ type: "code", content: codeLines.join("\n"), lang })
      continue
    }

    // Headers
    if (line.startsWith("#### ")) {
      blocks.push({ type: "h4", content: line.slice(5).trim() })
      i++
      continue
    }
    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", content: line.slice(4).trim() })
      i++
      continue
    }

    // Horizontal Rule
    if (line.trim() === "---" || line.trim() === "***") {
      blocks.push({ type: "hr", content: "" })
      i++
      continue
    }

    // Tables
    if (line.trim().startsWith("|") && lines[i + 1]?.trim().includes("|---")) {
      const headers = line.split("|").filter(Boolean).map(s => s.trim())
      i += 2 // skip header and separator row
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i].split("|").filter(Boolean).map(s => s.trim()))
        i++
      }
      blocks.push({ type: "table", content: "", headers, rows })
      continue
    }

    // Bullet list
    if (line.match(/^[-*]\s/)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        items.push(lines[i].replace(/^[-*]\s/, ""))
        i++
      }
      blocks.push({ type: "ul", content: "", items })
      continue
    }

    // Empty line
    if (!line.trim()) {
      i++
      continue
    }

    // Paragraph
    blocks.push({ type: "paragraph", content: line })
    i++
  }

  return blocks
}

function inlineFormat(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong style='color:var(--foreground); font-weight:700'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, `<code style="background:var(--fastapi-teal-dim);color:var(--fastapi-teal-light);padding:2px 6px;border-radius:6px;font-size:13.5px;font-family:var(--font-mono);border:1px solid rgba(0,150,136,0.2)">$1</code>`)
}
