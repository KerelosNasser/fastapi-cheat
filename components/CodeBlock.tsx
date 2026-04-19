"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { highlight, TOKEN_COLORS } from "@/lib/highlight"
import type { CodeBlock as CodeBlockType } from "@/types/docs"

interface CodeBlockProps {
  block: CodeBlockType
}

export default function CodeBlock({ block }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(block.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const tokens = highlight(block.code, block.language)

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)] text-[14px] my-4 shadow-sm">
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]"
        style={{ background: "var(--code-bar)" }}
      >
        <span className="text-[var(--muted)] font-semibold text-[13.5px]">{block.label}</span>
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] px-2 py-0.5 rounded-md font-mono uppercase tracking-wide"
            style={{
              color: "var(--fastapi-teal-light)",
              background: "var(--fastapi-teal-dim)",
              border: "1px solid rgba(0,150,136,0.3)",
            }}
          >
            {block.language}
          </span>
          <button
            onClick={handleCopy}
            aria-label="Copy code"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors
              text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/10 text-[12px]"
          >
            {copied ? (
              <>
                <Check size={12} className="text-[var(--fastapi-teal)]" />
                <span className="text-[var(--fastapi-teal)] font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code area */}
      <div
        className="overflow-x-auto p-5"
        style={{ background: "var(--code-bg)" }}
      >
        <pre className="font-mono text-[14px] leading-relaxed whitespace-pre">
          {tokens.map((token, i) => (
            <span key={i} style={{ color: TOKEN_COLORS[token.type] }}>
              {token.value}
            </span>
          ))}
        </pre>
      </div>
    </div>
  )
}
