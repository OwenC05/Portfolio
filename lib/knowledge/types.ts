export type KnowledgeCategory = 'experience' | 'project' | 'research' | 'writing' | 'about'

export interface KnowledgeSection {
  id: string
  heading: string
  text: string
}

export interface KnowledgeRecord {
  id: string
  slug: string
  title: string
  summary: string
  category: KnowledgeCategory
  publication: 'published' | 'draft'
  status: string
  updatedAt: string
  evidenceKind: 'owner-reported' | 'artifact-backed' | 'mixed'
  tags: readonly string[]
  sections: readonly KnowledgeSection[]
  links: readonly { label: string; href: string }[]
}
