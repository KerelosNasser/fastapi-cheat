"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Search, X } from "lucide-react"
import SearchDropdown from "./SearchDropdown"
import { useAIPanel } from "@/hooks/useAIPanel"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { openAI } = useAIPanel()

  // Debounce query
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 150)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [query])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const handleFocus = useCallback(() => setIsOpen(true), [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setQuery("")
    setDebouncedQuery("")
  }, [])

  const handleAskAI = useCallback(
    (question: string) => {
      openAI(question)
      handleClose()
    },
    [openAI, handleClose],
  )

  return (
    <div ref={containerRef} className="relative w-[400px]">
      {/* Input */}
      <div
        className={`flex items-center gap-3 px-4 h-10 rounded-xl border transition-all shadow-sm
          ${
            isOpen
              ? "border-[var(--fastapi-teal)] bg-[var(--surface-hover)] ring-2 ring-[var(--fastapi-teal)]/20"
              : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--fastapi-teal)]/60"
          }`}
      >
        <Search size={16} className={isOpen ? "text-[var(--fastapi-teal)]" : "text-[var(--muted)]"} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="Search documentation..."
          aria-label="Search documentation"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
          className="flex-1 bg-transparent text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)]
            outline-none border-none font-medium"
        />
        {query ? (
          <button
            onClick={handleClose}
            aria-label="Clear search"
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1"
          >
            <X size={16} />
          </button>
        ) : (
          <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded border border-[var(--border)] text-[var(--muted)] bg-[var(--surface-hover)] shrink-0 hidden sm:block">
            ⌘K
          </span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <SearchDropdown query={debouncedQuery} onClose={handleClose} onAskAI={handleAskAI} />
      )}
    </div>
  )
}
