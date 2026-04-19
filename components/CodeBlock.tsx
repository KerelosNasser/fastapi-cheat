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
    <div className="rounded-lg overflow-hidden border border-[var(--border)] text-[13px]">
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "var(--code-bar)" }}
      >
        <span className="text-[var(--muted)] font-medium text-[12px]">{block.label}</span>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wide"
            style={{
              color: "var(--fastapi-teal-light)",
              background: "var(--fastapi-teal-dim)",
              border: "1px solid rgba(0,150,136,0.2)",
            }}
          >
            {block.language}
          </span>
          <button
            onClick={handleCopy}
            aria-label="Copy code"
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors
              text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/10"
          >
            {copied ? (
              <>
                <Check size={11} className="text-[var(--fastapi-teal)]" />
                <span className="text-[var(--fastapi-teal)]">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code area */}
      <div
        className="overflow-x-auto p-4"
        style={{ background: "var(--code-bg)" }}
      >
        <pre className="font-mono text-[12.5px] leading-relaxed whitespace-pre">
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
