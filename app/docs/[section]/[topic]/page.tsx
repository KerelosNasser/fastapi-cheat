import { notFound } from "next/navigation"
import { getTopic, getAllSections } from "@/lib/docs"
import Sidebar from "@/components/Sidebar"
import TopicPage from "@/components/TopicPage"
import type { Metadata } from "next"

interface PageParams {
  params: Promise<{ section: string; topic: string }>
}

export async function generateStaticParams() {
  const sections = getAllSections()
  return sections.flatMap((section) =>
    section.topics.map((topic) => ({
      section: section.id,
      topic: topic.id,
    })),
  )
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { section, topic } = await params
  const result = getTopic(section, topic)
  if (!result) return { title: "Not Found" }
  return {
    title: `${result.topic.title} — ${result.section.title} | FastAPI Docs`,
    description: result.topic.description.slice(0, 160),
  }
}

export default async function TopicRoute({ params }: PageParams) {
  const { section, topic } = await params
  const result = getTopic(section, topic)
  if (!result) notFound()

  return (
    <div className="flex pt-[52px]">
      <Sidebar
        activeSectionId={result.section.id}
        activeTopicId={result.topic.id}
      />
      <main className="flex-1 min-h-[calc(100vh-52px)] overflow-y-auto transition-all duration-200"
        style={{ marginLeft: "220px" }}>
        <TopicPage section={result.section} topic={result.topic} />
      </main>
    </div>
  )
}
