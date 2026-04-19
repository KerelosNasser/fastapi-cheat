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
        <Braces size={18} style={{ color: "var(--fastapi-teal)" }} />
        <h2 className="text-[17px] font-bold text-[var(--foreground)]">API Reference</h2>
      </div>

      <div className="flex flex-col gap-3">
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
    <div className="rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
      {/* Collapsed header */}
      <button
        onClick={() => onToggle(index)}
        className="w-full flex items-center justify-between px-5 py-4 text-left
          bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-[14.5px] font-bold"
            style={{ color: "var(--fastapi-teal-light)" }}
          >
            {item.name}
          </span>
          {!isOpen && (
            <span className="text-[13px] text-[var(--muted)] truncate max-w-[400px]">
              {item.description}
            </span>
          )}
        </div>
        <span className="text-[var(--muted)] shrink-0 ml-2">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-5 pb-5 pt-4 bg-[var(--surface)] border-t border-[var(--border)]">
          <p className="text-[15px] text-[var(--foreground)] mb-4 leading-relaxed opacity-90">{item.description}</p>

          {/* Signature */}
          <div
            className="font-mono text-[13.5px] px-4 py-3 rounded-xl mb-4 leading-relaxed border border-white/5 shadow-inner"
            style={{ background: "var(--code-bg)", color: "var(--fastapi-teal-light)" }}
          >
            {item.signature}
          </div>

          {/* Parameters table */}
          {item.params.length > 0 && (
            <div className="mb-4">
              <p className="text-[11.5px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2.5 px-1">
                Parameters
              </p>
              <div className="rounded-xl overflow-hidden border border-[var(--border)] shadow-sm">
                <table className="w-full text-[13.5px]">
                  <thead>
                    <tr style={{ background: "var(--code-bar)" }}>
                      <th className="text-left px-4 py-2.5 font-semibold text-[var(--muted)] w-[120px]">Name</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-[var(--muted)] w-[130px]">Type</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-[var(--muted)] w-[110px]">Default</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-[var(--muted)]">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.params.map((param, pi) => (
                      <tr
                        key={pi}
                        className="border-t border-[var(--border)]"
                        style={{ background: pi % 2 === 0 ? "var(--code-bg)" : "var(--surface)" }}
                      >
                        <td className="px-4 py-2.5 font-mono font-medium text-[var(--fastapi-teal-light)]">{param.name}</td>
                        <td className="px-4 py-2.5 font-mono text-[#ffa657]">{param.type}</td>
                        <td className="px-4 py-2.5 font-mono text-[#a5d6ff]">{param.default}</td>
                        <td className="px-4 py-2.5 text-[var(--muted)] leading-relaxed">{param.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Returns */}
          <div className="flex items-start gap-3 mb-4 px-1">
            <span className="text-[11.5px] font-bold uppercase tracking-widest text-[var(--muted)] shrink-0 pt-0.5">
              Returns
            </span>
            <span className="text-[13.5px] font-mono font-medium text-[#a5d6ff]">{item.returns}</span>
          </div>

          {/* Used by */}
          {item.usedBy.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap px-1">
              <span className="text-[11.5px] font-bold uppercase tracking-widest text-[var(--muted)]">
                Used by
              </span>
              <div className="flex flex-wrap gap-2">
                {item.usedBy.map((id) => (
                  <button
                    key={id}
                    onClick={() => handleUsedByClick(id)}
                    className="text-[12px] px-2.5 py-1 rounded-lg font-mono transition-all
                      border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fastapi-teal-light)]
                      hover:border-[var(--fastapi-teal)] bg-[var(--surface-hover)] hover:bg-[var(--fastapi-teal-dim)]"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
