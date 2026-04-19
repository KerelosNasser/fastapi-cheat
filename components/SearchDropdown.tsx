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
      className="search-dropdown absolute top-[calc(100%+8px)] left-0
        w-[500px] rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl z-50"
      style={{ background: "var(--surface)", backdropFilter: "blur(8px)" }}
      role="listbox"
      aria-label="Search results"
    >
      {/* Topic results */}
      {results.length > 0 && (
        <div className="py-3">
          <p className="px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-[var(--fastapi-teal-light)] opacity-80">
            Documentation
          </p>
          {results.map((result) => (
            <button
              key={`${result.section.id}-${result.topic.id}`}
              onClick={() => handleTopicClick(result.section.id, result.topic.id)}
              role="option"
              className="w-full flex items-center gap-4 px-4 py-3 text-left
                hover:bg-[var(--fastapi-teal-dim)] transition-colors group"
            >
              <FileText size={16} className="shrink-0 text-[var(--muted)] group-hover:text-[var(--fastapi-teal)]" />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[14px] text-[var(--muted)] shrink-0 max-w-[150px] truncate group-hover:text-[var(--foreground)]">
                  {result.section.title}
                </span>
                <span className="text-[var(--muted)] text-[12px] opacity-50">›</span>
                <span className="text-[14px] text-[var(--foreground)] font-medium truncate">{result.topic.title}</span>
              </div>
              {result.matchType === "api" && (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-md font-mono shrink-0 border border-[var(--fastapi-teal)]/30"
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
        <div className="py-3">
          <p className="px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-[var(--fastapi-teal-light)] opacity-80">
            Popular Topics
          </p>
          {popular.map((result) => (
            <button
              key={`${result.section.id}-${result.topic.id}`}
              onClick={() => handleTopicClick(result.section.id, result.topic.id)}
              className="w-full flex items-center gap-4 px-4 py-3 text-left
                hover:bg-[var(--fastapi-teal-dim)] transition-colors group"
            >
              <FileText size={16} className="shrink-0 text-[var(--muted)] group-hover:text-[var(--fastapi-teal)]" />
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[14px] text-[var(--muted)] shrink-0 group-hover:text-[var(--foreground)]">{result.section.title}</span>
                <span className="text-[var(--muted)] text-[12px] opacity-50">›</span>
                <span className="text-[14px] text-[var(--foreground)] font-medium">{result.topic.title}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {query.trim() && results.length === 0 && (
        <div className="py-10 text-center">
          <p className="text-[15px] font-medium text-[var(--foreground)]">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-[14px] text-[var(--muted)] mt-2">Try asking the AI assistant below</p>
        </div>
      )}

      {/* Divider + AI row */}
      <div className="border-t border-[var(--border)] bg-[var(--fastapi-teal-dim)]/20">
        <button
          onClick={handleAIClick}
          className="w-full flex items-center gap-4 px-4 py-4 text-left
            hover:bg-[var(--fastapi-teal-dim)] transition-colors group"
        >
          <Sparkles size={18} style={{ color: "var(--fastapi-teal)" }} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[14px] font-semibold text-[var(--foreground)] group-hover:text-[var(--fastapi-teal)] transition-colors">
              Ask AI Agent
            </span>
            <div className="text-[13px] text-[var(--muted)] truncate mt-0.5 group-hover:text-[var(--foreground)]">
              &ldquo;{query || "How do I get started with FastAPI?"}&rdquo;
            </div>
          </div>
          <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded border border-[var(--fastapi-teal)]/30 text-[var(--fastapi-teal)] shrink-0">
            ENTER
          </span>
        </button>
      </div>
    </div>
  )
}
