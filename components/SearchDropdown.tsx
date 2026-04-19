"use client"

import { useRouter } from "next/navigation"
import { Sparkles, FileText } from "lucide-react"
import { searchTopics, getPopularTopics } from "@/lib/docs"
import type { SearchResult } from "@/lib/docs"

interface SearchDropdownProps {
  query: string
  onClose: () => void
  onAskAI: (question: string) => void
}

export default function SearchDropdown({ query, onClose, onAskAI }: SearchDropdownProps) {
  const router = useRouter()
  const results: SearchResult[] = query.trim() ? searchTopics(query) : []
  const popular = getPopularTopics()
  const showPopular = !query.trim()

  const handleTopicClick = (sectionId: string, topicId: string) => {
    router.push(`/docs/${sectionId}/${topicId}`)
    onClose()
  }

  const handleAIClick = () => {
    onAskAI(query || "How do I get started with FastAPI?")
    onClose()
  }

  return (
    <div
      className="search-dropdown absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2
        w-[420px] rounded-xl border border-[var(--border)] overflow-hidden shadow-2xl z-50"
      style={{ background: "var(--surface)" }}
      role="listbox"
      aria-label="Search results"
    >
      {/* Topic results */}
      {results.length > 0 && (
        <div className="py-2">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
            Topics
          </p>
          {results.map((result) => (
            <button
              key={`${result.section.id}-${result.topic.id}`}
              onClick={() => handleTopicClick(result.section.id, result.topic.id)}
              role="option"
              className="w-full flex items-center gap-3 px-3 py-2 text-left
                hover:bg-white/5 transition-colors"
            >
              <FileText size={13} className="shrink-0 text-[var(--muted)]" />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[12px] text-[var(--muted)] shrink-0 max-w-[120px] truncate">
                  {result.section.title}
                </span>
                <span className="text-[var(--muted)] text-[11px]">›</span>
                <span className="text-[12px] text-[var(--foreground)] truncate">{result.topic.title}</span>
              </div>
              {result.matchType === "api" && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0"
                  style={{ color: "var(--fastapi-teal-light)", background: "var(--fastapi-teal-dim)" }}
                >
                  API
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Popular topics (empty state) */}
      {showPopular && (
        <div className="py-2">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
            Popular Topics
          </p>
          {popular.map((result) => (
            <button
              key={`${result.section.id}-${result.topic.id}`}
              onClick={() => handleTopicClick(result.section.id, result.topic.id)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left
                hover:bg-white/5 transition-colors"
            >
              <FileText size={13} className="shrink-0 text-[var(--muted)]" />
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[12px] text-[var(--muted)] shrink-0">{result.section.title}</span>
                <span className="text-[var(--muted)] text-[11px]">›</span>
                <span className="text-[12px] text-[var(--foreground)]">{result.topic.title}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {query.trim() && results.length === 0 && (
        <div className="py-6 text-center">
          <p className="text-[13px] text-[var(--muted)]">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-[12px] text-[var(--muted)] mt-1 opacity-70">Try asking the AI instead</p>
        </div>
      )}

      {/* Divider + AI row */}
      <div className="border-t border-[var(--border)]">
        <button
          onClick={handleAIClick}
          className="w-full flex items-center gap-3 px-3 py-3 text-left
            hover:bg-white/5 transition-colors group"
        >
          <Sparkles size={14} style={{ color: "var(--fastapi-teal)" }} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[12px] text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
              Ask AI:
            </span>{" "}
            <span
              className="text-[12px] font-medium"
              style={{ color: "var(--fastapi-teal-light)" }}
            >
              &ldquo;{query || "How do I get started with FastAPI?"}&rdquo;
            </span>
          </div>
          <span className="text-[10px] text-[var(--muted)] shrink-0">↵</span>
        </button>
      </div>
    </div>
  )
}
