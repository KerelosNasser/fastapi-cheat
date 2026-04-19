"use client"

import { useCallback } from "react"
import Link from "next/link"
import { ChevronRight, ChevronDown } from "lucide-react"
import type { Section, Topic } from "@/types/docs"
import { getSectionIcon } from "@/lib/sectionIcons"

interface SidebarItemProps {
  section: Section
  isExpanded: boolean
  isCollapsed: boolean
  activeSectionId: string
  activeTopicId: string
  onToggle: (sectionId: string) => void
  onNavigate?: () => void
}

export default function SidebarItem({
  section,
  isExpanded,
  isCollapsed,
  activeSectionId,
  activeTopicId,
  onToggle,
  onNavigate,
}: SidebarItemProps) {
  const isActiveSection = activeSectionId === section.id
  const Icon = getSectionIcon(section.icon)

  const handleToggle = useCallback(() => {
    onToggle(section.id)
  }, [section.id, onToggle])

  return (
    <div>
      {/* Section header */}
      <button
        onClick={handleToggle}
        title={isCollapsed ? section.title : undefined}
        aria-label={isCollapsed ? section.title : `Toggle ${section.title}`}
        aria-expanded={isExpanded}
        className={`
          relative w-full flex items-center gap-2.5 px-3 h-9 text-left
          transition-colors duration-150
          ${isActiveSection ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}
          hover:bg-white/5
        `}
      >
        {/* Active section accent bar */}
        {isActiveSection && (
          <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-[var(--fastapi-teal)]" />
        )}

        <span className="shrink-0 flex items-center justify-center w-4 h-4">
          <Icon size={15} />
        </span>

        {!isCollapsed && (
          <>
            <span className="flex-1 text-xs font-medium truncate">{section.title}</span>
            <span className="shrink-0 text-[var(--muted)]">
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
          </>
        )}
      </button>

      {/* Topic children */}
      {!isCollapsed && (
        <div
          className="sidebar-children"
          style={{ maxHeight: isExpanded ? `${section.topics.length * 32}px` : "0px", opacity: isExpanded ? 1 : 0 }}
        >
          {section.topics.map((topic) => (
            <TopicLink
              key={topic.id}
              section={section}
              topic={topic}
              isActive={isActiveSection && activeTopicId === topic.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TopicLink({
  section,
  topic,
  isActive,
  onNavigate,
}: {
  section: Section
  topic: Topic
  isActive: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={`/docs/${section.id}/${topic.id}`}
      onClick={onNavigate}
      className={`
        relative flex items-center pl-8 pr-3 h-8 text-[11px] transition-colors duration-100
        ${
          isActive
            ? "text-[var(--fastapi-teal-light)] bg-[var(--fastapi-teal-dim)] font-medium"
            : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5"
        }
      `}
    >
      {isActive && (
        <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-r bg-[var(--fastapi-teal)]" />
      )}
      <span className="truncate">
        {topic.isOverview && <span className="mr-1 opacity-60">★</span>}
        {topic.title}
      </span>
    </Link>
  )
}
