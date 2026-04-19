"use client"

import { highlight, TOKEN_COLORS } from "@/lib/highlight"

interface MarkdownRendererProps {
  content: string
  isStreaming?: boolean
}

export default function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  const blocks = parseMarkdown(content)

  return (
    <div className="text-[13px] leading-relaxed text-[var(--foreground)]">
      {blocks.map((block, i) => {
        if (block.type === "code") {
          return (
            <div key={i} className="my-3 rounded-lg overflow-hidden border border-[var(--border)]">
              <div
                className="px-3 py-1.5 text-[10px] font-mono text-[var(--muted)] uppercase tracking-wide"
                style={{ background: "var(--code-bar)" }}
              >
                {block.lang || "code"}
              </div>
              <pre
                className="p-3 overflow-x-auto text-[12px] font-mono leading-relaxed"
                style={{ background: "var(--code-bg)" }}
              >
                {highlight(block.content, block.lang || "").map((token, ti) => (
                  <span key={ti} style={{ color: TOKEN_COLORS[token.type] }}>
                    {token.value}
                  </span>
                ))}
              </pre>
            </div>
          )
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="my-2 space-y-1 pl-4">
              {block.items?.map((item, li) => (
                <li key={li} className="flex items-start gap-2">
                  <span style={{ color: "var(--fastapi-teal)" }} className="mt-1.5 shrink-0 text-[8px]">
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
              className="my-2"
              dangerouslySetInnerHTML={{ __html: inlineFormat(block.content) }}
            />
          )
        }
        return null
      })}
      {isStreaming && (
        <span className="blink-cursor inline-block w-[2px] h-[14px] bg-[var(--fastapi-teal)] ml-0.5 align-text-bottom" />
      )}
    </div>
  )
}

interface Block {
  type: "code" | "ul" | "paragraph"
  content: string
  lang?: string
  items?: string[]
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
      i++ // skip closing ```
      blocks.push({ type: "code", content: codeLines.join("\n"), lang })
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
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, `<code style="background:var(--code-bg);color:var(--fastapi-teal-light);padding:1px 5px;border-radius:4px;font-size:11px;font-family:var(--font-mono)">$1</code>`)
}
