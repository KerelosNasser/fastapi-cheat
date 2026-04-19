"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { getAllSections } from "@/lib/docs"
import SidebarItem from "./SidebarItem"
import { useSidebarState } from "@/hooks/useSidebar"
import { useIsMobile } from "@/hooks/use-mobile"

interface SidebarProps {
  activeSectionId: string
  activeTopicId: string
  onNavigate?: () => void
}

export default function Sidebar({ activeSectionId, activeTopicId, onNavigate }: SidebarProps) {
  const sections = getAllSections()
  const isMobile = useIsMobile()
  const { isOpen: isMobileOpen, closeSidebar } = useSidebarState()

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
      window.dispatchEvent(new Event("sidebar-toggle"))
      return next
    })
  }

  const handleSectionToggle = useCallback((sectionId: string) => {
    setExpandedSection((prev) => (prev === sectionId ? "" : sectionId))
  }, [])

  const handleNavigate = useCallback(() => {
    if (isMobile) closeSidebar()
    onNavigate?.()
  }, [isMobile, closeSidebar, onNavigate])

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-[35] bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`
          fixed top-[52px] bottom-0 z-[40] flex flex-col
          bg-[var(--sidebar-bg)] border-r border-[var(--border)]
          transition-all duration-300 overflow-hidden
          ${isMobile 
            ? `left-0 w-[280px] ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`
            : `left-0 ${isCollapsed ? "w-[60px]" : "w-[260px]"} translate-x-0`
          }
        `}
      >
        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={closeSidebar}
            className="absolute top-3 right-3 p-2 rounded-lg bg-[var(--surface-hover)] text-[var(--muted)]"
          >
            <X size={18} />
          </button>
        )}

        {/* Collapse toggle (Desktop only) */}
        {!isMobile && (
          <button
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`
              absolute top-3 z-10 flex items-center justify-center w-6 h-6 rounded-lg
              bg-[var(--surface-hover)] border border-[var(--border)]
              text-[var(--muted)] hover:text-[var(--fastapi-teal)] hover:border-[var(--fastapi-teal)]/50
              transition-all shadow-sm
              ${isCollapsed ? "right-[18px]" : "right-3"}
            `}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}

        {/* Section list */}
        <nav
          className={`flex-1 overflow-y-auto overflow-x-hidden ${isMobile ? "pt-12" : "pt-9"} pb-4`}
          aria-label="Documentation sections"
        >
          {sections.map((section) => (
            <SidebarItem
              key={section.id}
              section={section}
              isExpanded={expandedSection === section.id && (!isCollapsed || isMobile)}
              isCollapsed={isCollapsed && !isMobile}
              activeSectionId={activeSectionId}
              activeTopicId={activeTopicId}
              onToggle={handleSectionToggle}
              onNavigate={handleNavigate}
            />
          ))}
        </nav>
      </aside>
    </>
  )
}
