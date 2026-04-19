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
    <div ref={containerRef} className="relative w-[320px]">
      {/* Input */}
      <div
        className={`flex items-center gap-2 px-3 h-8 rounded-lg border transition-colors
          ${
            isOpen
              ? "border-[var(--fastapi-teal)] bg-[var(--surface)]"
              : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--fastapi-teal)]/50"
          }`}
      >
        <Search size={13} className="text-[var(--muted)] shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="Search docs..."
          aria-label="Search documentation"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
          className="flex-1 bg-transparent text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted)]
            outline-none border-none"
        />
        {query ? (
          <button
            onClick={handleClose}
            aria-label="Clear search"
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={12} />
          </button>
        ) : (
          <span className="text-[10px] font-mono text-[var(--muted)] shrink-0 hidden sm:block">⌘K</span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <SearchDropdown query={debouncedQuery} onClose={handleClose} onAskAI={handleAskAI} />
      )}
    </div>
  )
}
