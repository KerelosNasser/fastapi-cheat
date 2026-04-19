"use client"

import Link from "next/link"
import { AlertTriangle, ChevronRight } from "lucide-react"
import type { Section, Topic } from "@/types/docs"
import CodeBlock from "./CodeBlock"
import ApiReference from "./ApiReference"
import { getTopicById } from "@/lib/docs"
import { useRouter } from "next/navigation"

interface TopicPageProps {
  section: Section
  topic: Topic
}

const HTTP_METHOD_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  GET: { bg: "rgba(0,200,83,0.1)", text: "#00c853", border: "rgba(0,200,83,0.3)" },
  POST: { bg: "rgba(33,150,243,0.1)", text: "#2196f3", border: "rgba(33,150,243,0.3)" },
  PUT: { bg: "rgba(255,152,0,0.1)", text: "#ff9800", border: "rgba(255,152,0,0.3)" },
  DELETE: { bg: "rgba(244,67,54,0.1)", text: "#f44336", border: "rgba(244,67,54,0.3)" },
  PATCH: { bg: "rgba(156,39,176,0.1)", text: "#9c27b0", border: "rgba(156,39,176,0.3)" },
}

export default function TopicPage({ section, topic }: TopicPageProps) {
  const router = useRouter()
  const methodStyle = topic.httpMethod ? HTTP_METHOD_STYLES[topic.httpMethod] : null

  const handleRelatedClick = (topicId: string) => {
    const result = getTopicById(topicId)
    if (result) {
      router.push(`/docs/${result.section.id}/${result.topic.id}`)
    }
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      {/* ① HEADER ZONE */}
      <header className="mb-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-[var(--muted)] mb-3">
          <Link href="/docs" className="hover:text-[var(--fastapi-teal)] transition-colors">
            Docs
          </Link>
          <ChevronRight size={12} />
          <Link
            href={`/docs/${section.id}/${section.topics[0]?.id}`}
            className="hover:text-[var(--fastapi-teal)] transition-colors"
          >
            {section.title}
          </Link>
          <ChevronRight size={12} />
          <span className="text-[var(--foreground)]">{topic.title}</span>
        </nav>

        {/* Title row */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-[32px] font-bold text-[var(--foreground)] text-balance leading-tight">
            {topic.title}
          </h1>
          {methodStyle && topic.httpMethod && (
            <span
              className="text-[12px] font-mono font-bold px-3 py-1 rounded uppercase tracking-wider"
              style={{
                background: methodStyle.bg,
                color: methodStyle.text,
                border: `1px solid ${methodStyle.border}`,
              }}
            >
              {topic.httpMethod}
            </span>
          )}
        </div>
      </header>

      {/* ② DESCRIPTION ZONE */}
      <section className="mb-8 flex flex-col gap-4">
        {/* Description card */}
        <div
          className="px-5 py-4 rounded-xl text-[16px] text-[var(--foreground)] leading-relaxed shadow-sm"
          style={{
            borderLeft: "4px solid var(--fastapi-teal)",
            background: "var(--fastapi-teal-dim)",
          }}
        >
          {topic.description}
        </div>

        {/* Warning cards */}
        {topic.warnings.map((warning, i) => (
          <div
            key={i}
            className="flex items-start gap-3 px-5 py-4 rounded-xl text-[15px] leading-relaxed shadow-xs"
            style={{
              borderLeft: "4px solid #f59e0b",
              background: "rgba(245,158,11,0.08)",
              color: "var(--foreground)",
            }}
          >
            <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
            <span>{warning}</span>
          </div>
        ))}
      </section>

      {/* ③ CODE ZONE */}
      {topic.codeBlocks.length > 0 && (
        <section className="mb-8 flex flex-col gap-2">
          {topic.codeBlocks.map((block, i) => (
            <CodeBlock key={i} block={block} />
          ))}
        </section>
      )}

      {/* ④ API REFERENCE ZONE */}
      {topic.apiReference.length > 0 && (
        <section className="mb-8">
          <ApiReference items={topic.apiReference} />
        </section>
      )}

      {/* ⑤ RELATED TOPICS ZONE */}
      {topic.relatedTopics.length > 0 && (
        <section>
          <h2 className="text-[13px] font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">
            Related Topics
          </h2>
          <div className="flex items-center flex-wrap gap-2">
            {topic.relatedTopics.map((topicId) => (
              <RelatedTopicChip key={topicId} topicId={topicId} onClick={handleRelatedClick} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

function RelatedTopicChip({
  topicId,
  onClick,
}: {
  topicId: string
  onClick: (id: string) => void
}) {
  const result = getTopicById(topicId)
  if (!result) return null
  return (
    <button
      onClick={() => onClick(topicId)}
      className="text-[12px] px-3 py-1 rounded-full border border-[var(--border)]
        text-[var(--muted)] hover:text-[var(--fastapi-teal-light)]
        hover:border-[var(--fastapi-teal)] hover:bg-[var(--fastapi-teal-dim)]
        bg-[var(--surface)] transition-colors"
    >
      {result.topic.title}
    </button>
  )
}
