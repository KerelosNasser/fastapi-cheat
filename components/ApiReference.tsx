"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronRight, Braces } from "lucide-react"
import type { ApiReference as ApiRefType } from "@/types/docs"
import { getTopicById } from "@/lib/docs"

interface ApiReferenceProps {
  items: ApiRefType[]
}

export default function ApiReference({ items }: ApiReferenceProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]))

  if (items.length === 0) return null

  const toggle = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Braces size={16} style={{ color: "var(--fastapi-teal)" }} />
        <h2 className="text-[15px] font-semibold text-[var(--foreground)]">API Reference</h2>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <ApiCard key={i} item={item} index={i} isOpen={openItems.has(i)} onToggle={toggle} />
        ))}
      </div>
    </section>
  )
}

function ApiCard({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: ApiRefType
  index: number
  isOpen: boolean
  onToggle: (i: number) => void
}) {
  const router = useRouter()

  const handleUsedByClick = (topicId: string) => {
    const result = getTopicById(topicId)
    if (result) {
      router.push(`/docs/${result.section.id}/${result.topic.id}`)
    }
  }

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={() => onToggle(index)}
        className="w-full flex items-center justify-between px-4 py-3 text-left
          bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-[13px] font-semibold"
            style={{ color: "var(--fastapi-teal-light)" }}
          >
            {item.name}
          </span>
          {!isOpen && (
            <span className="text-[12px] text-[var(--muted)] truncate max-w-[400px]">
              {item.description}
            </span>
          )}
        </div>
        <span className="text-[var(--muted)] shrink-0 ml-2">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-4 pb-4 pt-3 bg-[var(--surface)] border-t border-[var(--border)]">
          <p className="text-[13px] text-[var(--muted)] mb-3 leading-relaxed">{item.description}</p>

          {/* Signature */}
          <div
            className="font-mono text-[12px] px-3 py-2.5 rounded mb-3 leading-relaxed"
            style={{ background: "var(--code-bg)", color: "var(--fastapi-teal-light)" }}
          >
            {item.signature}
          </div>

          {/* Parameters table */}
          {item.params.length > 0 && (
            <div className="mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">
                Parameters
              </p>
              <div className="rounded overflow-hidden border border-[var(--border)]">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr style={{ background: "var(--code-bar)" }}>
                      <th className="text-left px-3 py-2 font-medium text-[var(--muted)] w-[110px]">Name</th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--muted)] w-[120px]">Type</th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--muted)] w-[100px]">Default</th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--muted)]">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.params.map((param, pi) => (
                      <tr
                        key={pi}
                        className="border-t border-[var(--border)]"
                        style={{ background: pi % 2 === 0 ? "var(--code-bg)" : "var(--surface)" }}
                      >
                        <td className="px-3 py-2 font-mono text-[var(--fastapi-teal-light)]">{param.name}</td>
                        <td className="px-3 py-2 font-mono text-[#ffa657]">{param.type}</td>
                        <td className="px-3 py-2 font-mono text-[#a5d6ff]">{param.default}</td>
                        <td className="px-3 py-2 text-[var(--muted)]">{param.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Returns */}
          <div className="flex items-start gap-2 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] shrink-0 pt-0.5">
              Returns
            </span>
            <span className="text-[12px] font-mono text-[#a5d6ff]">{item.returns}</span>
          </div>

          {/* Used by */}
          {item.usedBy.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Used by
              </span>
              {item.usedBy.map((id) => (
                <button
                  key={id}
                  onClick={() => handleUsedByClick(id)}
                  className="text-[11px] px-2 py-0.5 rounded font-mono transition-colors
                    border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fastapi-teal-light)]
                    hover:border-[var(--fastapi-teal)] bg-[var(--surface)] hover:bg-[var(--fastapi-teal-dim)]"
                >
                  {id}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
