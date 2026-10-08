import { about, contact, site } from './content'
import { projects } from './projects'
import { siteUrl } from './siteUrl'

export type PublicProject = {
  id: string
  slug: string
  title: string
  tagline: string
  blurb: string
  year: string
  role: string
  stack: string[]
  summary: string
  highlights: string[]
  status: string
  context: string
  contribution: string
  approach: string[]
  evidence: string[]
  limitations: string[]
  confidential: boolean
  selected: boolean
  url: string
  markdownUrl: string
  repoUrl?: string
  liveUrl?: string
}

const caseStudies: Record<
  string,
  Pick<
    PublicProject,
    | 'status'
    | 'context'
    | 'contribution'
    | 'approach'
    | 'evidence'
    | 'limitations'
    | 'selected'
  >
> = {
  'lexisnexis-applied-ai': {
    status: 'Internal pilot · toward production',
    selected: true,
    context:
      'Fraud-model optimisation combines analysis, modelling and decisions that need accountable human review.',
    contribution:
      'Architected a solution designed for organisation-wide use, built an end-to-end demonstration, and presented its concept, value and scaling approach to senior stakeholders. Retained after placement to develop the funded internal pilot.',
    approach: [
      'Custom Python orchestration and reusable Copilot skills coordinate work with persistent SQLite state.',
      'Audit trails and mandatory review gates keep human judgement in the workflow.',
      'DVC and Papermill make notebook-based work recoverable; LightGBM discovers candidate rules, with constrained logistic regression for policy weighting.',
    ],
    evidence: [
      'End-to-end working demo delivered by the end of the placement. Presented the core concept, value and scaling approach to senior stakeholders.',
      'Retained as an AI engineering contractor in August 2026 to develop a capital-funded internal pilot.',
    ],
    limitations: [
      'Employer-confidential work: no source code, transaction data or internal evaluation results are published.',
      'This describes a pilot building toward production, not a launched production platform.',
      'Organisation-wide use describes the intended architectural scope, not a claim of organisation-wide deployment or tested production scale.',
      'Descriptions are owner-supplied; no independently verified performance uplift is claimed.',
    ],
  },
  'lexisnexis-ml': {
    status: 'Industrial placement',
    selected: true,
    context:
      'Fraud modelling involves understanding complex financial behaviour, developing useful features and evaluating changes carefully.',
    contribution:
      'Completed two fraud-model optimisations and analysed large-scale financial data. Researched self-supervised representations alongside practical modelling work.',
    approach: [
      'Used Python, SQL and Snowflake to analyse large-scale financial data.',
      'Worked across feature engineering, model tuning and evaluation for fraud-model optimisation.',
      'Investigated graph embeddings, contrastive learning and non-Euclidean geometry as approaches to self-supervised fraud representations.',
      'Gained practical experience in GPU compute and batch training.',
    ],
    evidence: [
      'Two fraud-model optimisations completed during the industrial placement, July 2025 to August 2026.',
      'Research into self-supervised fraud representations accompanied applied data-science work.',
    ],
    limitations: [
      'Employer-confidential work: no transaction data, source code or internal evaluation results are published.',
      'Research directions are not claims of deployed models or measured performance uplift.',
      'Descriptions are owner-supplied; no independently verified results are claimed.',
    ],
  },
  typeforge: {
    status: 'In development',
    selected: true,
    context:
      'Typing practice can focus on a headline speed rather than the particular weaknesses a person needs to practise.',
    contribution:
      'Designing and building a React/Node.js typing application, including implemented AI-driven adaptive drills.',
    approach: [
      'Developing real-time analytics for cadence, keystrokes and accuracy.',
      'Adaptive drills target user weaknesses.',
      'Personal typing and keyboard-building experience informs the product direction.',
    ],
    evidence: [
      'Adaptive AI-driven drills designed and implemented, as described in my current project record.',
    ],
    limitations: [
      'A public demo is available; the product is still in development, not a full product release.',
      'No measured learning uplift, timing precision or model benchmark is published.',
    ],
  },
}

// Explicit allowlist: never serialize a source object or read the raw CV at runtime.
export const publicProjects: PublicProject[] = projects.map((p) => {
  if (!p.role?.trim())
    throw new Error('Public project is missing a curated role.')
  const c = caseStudies[p.slug]
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    blurb: p.blurb,
    year: p.year,
    role: p.role,
    stack: [...p.stack],
    summary: p.summary,
    highlights: [...p.highlights],
    status: c.status,
    context: c.context,
    contribution: c.contribution,
    approach: [...c.approach],
    evidence: [...c.evidence],
    limitations: [...c.limitations],
    confidential: p.confidential === true,
    selected: c.selected,
    url: `${siteUrl}/projects/${p.slug}`,
    markdownUrl: `${siteUrl}/projects/${p.slug}/markdown`,
    ...(!p.confidential && p.liveUrl ? { liveUrl: p.liveUrl } : {}),
  }
})
export const selectedProjects = publicProjects.filter((p) => p.selected)
export const getPublicProject = (slug: string) =>
  publicProjects.find((p) => p.slug === slug)
export const publicPortfolio = {
  schemaVersion: '1.0',
  provenance:
    'Owner-supplied professional and project descriptions; earlier non-conflicting portfolio material retained. Not independent verification.',
  profile: {
    name: site.name,
    role: 'AI Engineer',
    tagline: site.tagline,
    intro: site.intro,
    heroHeadline: site.heroHeadline,
    heroContext: site.heroContext,
    location: site.location,
    email: contact.email,
    github: contact.github,
    linkedin: contact.linkedin,
    bio: [...about.bio],
  },
  experience: about.experience.map((e) => ({
    org: e.org,
    role: e.role,
    period: e.period,
    location: e.location,
    note: e.note,
  })),
  education: about.education.map((e) => ({
    org: e.org,
    detail: e.detail,
    period: e.period,
    note: e.note,
  })),
  skills: Object.fromEntries(
    Object.entries(about.skills).map(([category, values]) => [
      category,
      [...values],
    ])
  ),
  capabilities: [
    {
      id: 'research',
      title: 'ML Research',
      labels: ['PyTorch', 'Multimodal contrastive learning (study)'],
      summary:
        'Following a question beyond the obvious answer. My research explores how models learn useful representations of complex behaviour.',
      evidence: [
        'Researched self-supervised representations using graph embeddings, contrastive learning and non-Euclidean geometry.',
        'Used the autonomy of my role to investigate emerging methods and experiment with their application to practical problems.',
        'Multimodal contrastive learning is an area of study, not a claim of an implemented or deployed multimodal system.',
      ],
    },
    {
      id: 'ai-systems',
      title: 'AI Systems',
      labels: ['Python', 'Agent orchestration', 'Human review'],
      summary:
        'Taking an idea from architecture to an end-to-end demonstration, and making its value clear to the people deciding what comes next.',
      evidence: [
        'Designed an agentic solution for organisation-wide use, with persistent state, audit trails and mandatory human-review gates.',
        'Built an end-to-end working demonstration. Presented the core concept, value and scaling approach to senior stakeholders.',
        'Retained to develop a funded internal pilot. Intended scope is not a claim of organisation-wide deployment.',
      ],
    },
    {
      id: 'data-modelling',
      title: 'Data & Modelling',
      labels: ['SQL', 'GPU compute', 'Batch training'],
      summary:
        'Working with large-scale financial data, then connecting analysis, modelling and evaluation to a concrete problem.',
      evidence: [
        'Analysed financial transaction data with Python, SQL and Snowflake, and completed two fraud-model optimisations during placement.',
        'Applied feature engineering, hyperparameter tuning and performance evaluation.',
        'Gained experience in GPU compute and batch training; no public throughput or model-performance benchmark is claimed.',
      ],
    },
  ],
  interests: about.hobbies.map((h) => ({ label: h.label, note: h.note })),
  projects: publicProjects,
}

export function searchProjects(query: string, limit = 5): PublicProject[] {
  if (typeof query !== 'string' || query.length > 200)
    throw new Error('Query must be at most 200 characters.')
  if (!Number.isInteger(limit) || limit < 1 || limit > 5)
    throw new Error('Limit must be an integer from 1 to 5.')
  const tokens = query.toLocaleLowerCase('en').match(/[\p{L}\p{N}]+/gu) ?? []
  if (!tokens.length && query.trim()) return []
  return publicProjects
    .map((project) => {
      const text = [
        project.title,
        project.blurb,
        project.summary,
        project.context,
        project.contribution,
        ...project.stack,
        ...project.approach,
      ]
        .join(' ')
        .toLocaleLowerCase('en')
      return {
        project,
        score: tokens.filter((token) => text.includes(token)).length,
      }
    })
    .filter((item) => !tokens.length || item.score === tokens.length)
    .sort(
      (a, b) =>
        b.score - a.score || a.project.slug.localeCompare(b.project.slug, 'en')
    )
    .slice(0, limit)
    .map((item) => item.project)
}

export const escapeMarkdown = (value: string) =>
  value.replace(/([\\`*_{}\[\]<>#+.!|])/g, '\\$1').replace(/[\r\n]+/g, ' ')
const bullets = (values: string[]) =>
  values.map((v) => `- ${escapeMarkdown(v)}`).join('\n')
export function projectMarkdown(p: PublicProject): string {
  const liveDemo =
    !p.confidential && p.liveUrl ? `Live demo: <${p.liveUrl}>\n\n` : ''
  return `# ${escapeMarkdown(p.title)}\n\n${escapeMarkdown(p.status)} · ${escapeMarkdown(p.year)}\n\nRole: ${escapeMarkdown(p.role)}\nStack: ${p.stack.map(escapeMarkdown).join(', ')}\n\n${escapeMarkdown(p.summary)}\n\n${liveDemo}## Context\n${escapeMarkdown(p.context)}\n\n## My contribution\n${escapeMarkdown(p.contribution)}\n\n## Approach\n${bullets(p.approach)}\n\n## Highlights\n${bullets(p.highlights)}\n\n## Evidence\n${bullets(p.evidence)}\n\n## Limitations\n${bullets(p.limitations)}\n\nSource: <${p.url}>\n\n${escapeMarkdown(publicPortfolio.provenance)}\n`
}
export function portfolioMarkdown(): string {
  const p = publicPortfolio
  return `# ${escapeMarkdown(p.profile.name)} — AI Engineer\n\n${escapeMarkdown(p.profile.intro)}\n\n${p.profile.bio.map(escapeMarkdown).join('\n\n')}\n\nContact: ${escapeMarkdown(p.profile.email)}\nLinkedIn: <${p.profile.linkedin}>\nGitHub: <${p.profile.github}>\n\n## Experience\n${p.experience.map((e) => `### ${escapeMarkdown(e.role)} — ${escapeMarkdown(e.org)}\n${escapeMarkdown(e.period)}\n\n${escapeMarkdown(e.note ?? '')}`).join('\n\n')}\n\n## Education\n${p.education.map((e) => `${escapeMarkdown(e.org)} — ${escapeMarkdown(e.detail)} · ${escapeMarkdown(e.period)} · ${escapeMarkdown(e.note ?? '')}`).join('\n\n')}\n\n## Skills\n${Object.entries(
    p.skills
  )
    .map(
      ([category, skills]) =>
        `- ${escapeMarkdown(category)}: ${skills.map(escapeMarkdown).join(', ')}`
    )
    .join(
      '\n'
    )}\n\n## Capabilities\n${p.capabilities.map((c) => `### ${escapeMarkdown(c.title)}\n${c.labels.map(escapeMarkdown).join(' · ')}\n\n${escapeMarkdown(c.summary)}\n\n${bullets(c.evidence)}`).join('\n\n')}\n\n## Interests\n${p.interests.map((i) => `- ${escapeMarkdown(i.label)}: ${escapeMarkdown(i.note)}`).join('\n')}\n\n## Projects\n${p.projects.map(projectMarkdown).join('\n')}\n`
}
