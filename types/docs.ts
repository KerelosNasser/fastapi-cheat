export interface ApiParam {
  name: string
  type: string
  default: string
  desc: string
}

export interface ApiReference {
  name: string
  signature: string
  description: string
  params: ApiParam[]
  returns: string
  usedBy: string[]
}

export interface CodeBlock {
  label: string
  language: string
  code: string
}

export interface Topic {
  id: string
  title: string
  isOverview: boolean
  description: string
  warnings: string[]
  codeBlocks: CodeBlock[]
  apiReference: ApiReference[]
  relatedTopics: string[]
  httpMethod?: string
}

export interface Section {
  id: string
  title: string
  icon: string
  topics: Topic[]
}

export interface DocsData {
  sections: Section[]
}
