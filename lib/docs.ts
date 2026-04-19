import docsData from "@/data/docs.json"
import type { DocsData, Section, Topic } from "@/types/docs"

const data = docsData as DocsData

export function getAllSections(): Section[] {
  return data.sections
}

export function getSection(sectionId: string): Section | undefined {
  return data.sections.find((s) => s.id === sectionId)
}

export function getTopic(sectionId: string, topicId: string): { section: Section; topic: Topic } | undefined {
  const section = getSection(sectionId)
  if (!section) return undefined
  const topic = section.topics.find((t) => t.id === topicId)
  if (!topic) return undefined
  return { section, topic }
}

export function getTopicById(topicId: string): { section: Section; topic: Topic } | undefined {
  for (const section of data.sections) {
    const topic = section.topics.find((t) => t.id === topicId)
    if (topic) return { section, topic }
  }
  return undefined
}

export interface SearchResult {
  section: Section
  topic: Topic
  matchType: "title" | "description" | "api"
  score: number
}

function fuzzyScore(text: string, query: string): number {
  const t = text.toLowerCase()
  const q = query.toLowerCase()
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 60
  // Check each word
  const words = q.split(/\s+/)
  const matched = words.filter((w) => t.includes(w))
  if (matched.length === words.length) return 40
  if (matched.length > 0) return 20 * (matched.length / words.length)
  return 0
}

export function searchTopics(query: string): SearchResult[] {
  if (!query.trim()) return []

  const results: SearchResult[] = []

  for (const section of data.sections) {
    for (const topic of section.topics) {
      const titleScore = fuzzyScore(topic.title, query)
      const descScore = fuzzyScore(topic.description, query) * 0.6
      const apiScore = Math.max(
        0,
        ...topic.apiReference.map((a) => fuzzyScore(a.name, query) * 0.8),
      )
      const bestScore = Math.max(titleScore, descScore, apiScore)

      if (bestScore > 0) {
        let matchType: "title" | "description" | "api" = "description"
        if (titleScore >= descScore && titleScore >= apiScore) matchType = "title"
        else if (apiScore >= titleScore && apiScore >= descScore) matchType = "api"

        results.push({ section, topic, matchType, score: bestScore })
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 8)
}

export function getPopularTopics(): { section: Section; topic: Topic }[] {
  const popularIds = [
    { sectionId: "getting-started", topicId: "overview" },
    { sectionId: "routing", topicId: "path-parameters" },
    { sectionId: "request-response", topicId: "request-body" },
    { sectionId: "dependency-injection", topicId: "depends" },
    { sectionId: "authentication", topicId: "jwt-tokens" },
  ]
  return popularIds
    .map(({ sectionId, topicId }) => getTopic(sectionId, topicId))
    .filter((r): r is { section: Section; topic: Topic } => r !== undefined)
}
