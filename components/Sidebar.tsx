"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getAllSections } from "@/lib/docs"
import SidebarItem from "./SidebarItem"

interface SidebarProps {
  activeSectionId: string
  activeTopicId: string
  onNavigate?: () => void
}

export default function Sidebar({ activeSectionId, activeTopicId, onNavigate }: SidebarProps) {
  const sections = getAllSections()

  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string>(activeSectionId)

  // Restore collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed")
    if (stored === "true") setIsCollapsed(true)
  }, [])

  // Auto-expand the active section when navigation changes
  useEffect(() => {
    setExpandedSection(activeSectionId)
  }, [activeSectionId])

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem("sidebar-collapsed", String(next))
      return next
    })
  }

  const handleSectionToggle = useCallback((sectionId: string) => {
    setExpandedSection((prev) => (prev === sectionId ? "" : sectionId))
  }, [])

  return (
    <aside
      className={`
        fixed top-[52px] left-0 bottom-0 z-30 flex flex-col
        bg-[var(--sidebar-bg)] border-r border-[var(--border)]
        transition-all duration-200 overflow-hidden
        ${isCollapsed ? "w-[52px]" : "w-[220px]"}
      `}
    >
      {/* Collapse toggle */}
      <button
        onClick={toggleCollapsed}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`
          absolute top-2 z-10 flex items-center justify-center w-5 h-5 rounded
          bg-[var(--surface)] border border-[var(--border)]
          text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]
          transition-colors
          ${isCollapsed ? "right-2" : "right-2"}
        `}
      >
        {isCollapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>

      {/* Section list */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden pt-9 pb-4"
        aria-label="Documentation sections"
      >
        {sections.map((section) => (
          <SidebarItem
            key={section.id}
            section={section}
            isExpanded={expandedSection === section.id && !isCollapsed}
            isCollapsed={isCollapsed}
            activeSectionId={activeSectionId}
            activeTopicId={activeTopicId}
            onToggle={handleSectionToggle}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </aside>
  )
}
