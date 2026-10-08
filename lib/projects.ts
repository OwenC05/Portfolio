// The run's checkpoints — Owen's curated work, ordered down the slope.
// Single source of truth for: the 3D gates, the in-run project panels,
// the case-study pages, and the trail-map fallback.
//
// Narrative: the summit is the flagship (LexisNexis applied-AI). From there
// the slope splits into two pistes — a RESEARCH lane (left) and a BUILD lane
// (right) — so a visitor can pick the line they care about, or weave across.

export type Grade = 'green' | 'blue' | 'black'
export type Lane = 'research' | 'build' | 'center'

export type Project = {
  id: string
  slug: string
  title: string
  tagline: string // one-line hook shown on the gate / panel header
  blurb: string // 1–2 sentence summary for the panel + trail-map
  grade: Grade // ski-trail difficulty: green easy, blue intermediate, black advanced
  lane: Lane
  z: number // depth down the slope where this gate sits (see slope.length)
  year: string
  role?: string
  stack: string[]
  summary: string // opening paragraph of the case study
  highlights: string[] // the wins
  repoUrl?: string
  liveUrl?: string
  confidential?: boolean // internal/NDA work — no external links
}

// Slope geometry, shared by the scene layout and the descent telemetry.
export const slope = {
  length: 112, // total downhill distance (world units, summit z=0 -> base z=112)
  halfWidth: 15, // how far the player can steer either side of centre
  laneOffset: 9, // x of the research(-) / build(+) pistes
  grade: 0.16, // how steeply the slope drops in y per unit z
  startAltitude: 2480, // metres at the summit (alpine flavour for telemetry)
  verticalDrop: 760, // metres lost from summit to base
}

// Special non-project stations near the bottom of the run.
export const stations = {
  lodge: { z: 86 }, // About — the Base Lodge
  lift: { z: 104 }, // Contact — the Chairlift back up
}

export const projects: Project[] = [
  {
    id: 'lexisnexis',
    slug: 'lexisnexis-applied-ai',
    title: 'LexisNexis — Applied AI',
    tagline: 'From an idea to an end-to-end demonstration.',
    blurb:
      'Architecture, an end-to-end demo and senior-stakeholder communication. A self-initiated idea progressing into a funded internal pilot.',
    grade: 'black',
    lane: 'center',
    z: 16,
    year: 'Jul 2025 — present',
    role: 'AI Engineer (Agentic AI) · previously Data Scientist',
    stack: ['Python', 'SQLite', 'DVC', 'Papermill', 'LightGBM'],
    summary:
      'I architected a fraud-model optimisation solution designed for organisation-wide use and built an end-to-end working demonstration. I presented its core concept, business value and approach to scaling to senior stakeholders. After my placement, I was retained as an AI engineering contractor to develop the funded internal pilot toward production.',
    highlights: [
      'Custom Python orchestration, reusable Copilot skills, persistent SQLite state, audit trails and mandatory human review gates.',
      'Recoverable DVC/Papermill workflows with LightGBM candidate-rule discovery and constrained logistic-regression policy weighting.',
      'Built an end-to-end demonstration and presented the core concept, business value and scaling approach to senior stakeholders.',
    ],
    confidential: true,
  },
  {
    id: 'lexisnexis-ml',
    slug: 'lexisnexis-ml',
    title: 'LexisNexis — ML',
    tagline: 'Understanding fraud through data and representation.',
    blurb:
      'Fraud-model optimisation, financial-data analysis and research into self-supervised representations during my industrial placement.',
    grade: 'black',
    lane: 'research',
    z: 38,
    year: 'Jul 2025 — Aug 2026',
    role: 'Data Scientist · Industrial placement',
    stack: [
      'Python',
      'SQL',
      'Snowflake',
      'Feature engineering',
      'Representation learning',
    ],
    summary:
      'During my industrial placement at LexisNexis Risk Solutions, I completed two fraud-model optimisations and analysed large-scale financial data using Python, SQL and Snowflake. Alongside this applied work, I researched self-supervised fraud representations and gained practical experience in GPU compute and batch training.',
    highlights: [
      'Completed two fraud-model optimisations, working across feature engineering, tuning and evaluation.',
      'Analysed large-scale financial data using Python, SQL and Snowflake.',
      'Researched graph embeddings, contrastive learning and non-Euclidean geometry for self-supervised fraud representations.',
      'Gained practical experience in GPU compute and batch training.',
    ],
    confidential: true,
  },
  {
    id: 'typeforge',
    slug: 'typeforge',
    title: 'TypeForge',
    tagline: 'Practice that adapts to the way you type.',
    blurb:
      'A typing application in development, with implemented adaptive AI drills and real-time analytics being developed.',
    grade: 'black',
    lane: 'research',
    z: 38,
    year: 'Jul 2025 — present',
    role: 'Solo developer',
    stack: ['React', 'Node.js', 'TypeScript', 'Keystroke analytics'],
    summary:
      'I am developing a typing application that tracks cadence, keystrokes and accuracy, with AI-driven drills designed and implemented to adapt to user weaknesses. It comes from building mechanical keyboards and reaching 193 wpm. A public demo is available; the product remains in development, with no public evaluation or full product release claimed.',
    highlights: [
      'Designed and implemented adaptive AI-driven drills.',
      'Developing real-time cadence, keystroke and accuracy analytics.',
      'A personal exploration of more targeted typing practice.',
    ],
    liveUrl: 'https://typeforge-alpha.vercel.app',
  },
]

export const projectBySlug: Record<string, Project> = Object.fromEntries(
  projects.map((p) => [p.slug, p])
)

export const getProject = (slug: string): Project | undefined =>
  projectBySlug[slug]

// x position of a gate from its lane.
export const laneX = (lane: Lane): number =>
  lane === 'research'
    ? -slope.laneOffset
    : lane === 'build'
      ? slope.laneOffset
      : 0

export type StationKind = 'project' | 'lodge' | 'lift'

export type RunStation = {
  id: string
  kind: StationKind
  x: number
  z: number
  title: string
  subtitle?: string
  grade?: Grade
  slug?: string
}

// The full ordered set of things you can ride up to on the slope: the project
// gates plus the Base Lodge (About) and the Lift (Contact) near the bottom.
export const runStations: RunStation[] = [
  ...projects.map((p) => ({
    id: p.id,
    kind: 'project' as const,
    x: laneX(p.lane),
    z: p.z,
    title: p.title,
    subtitle: p.tagline,
    grade: p.grade,
    slug: p.slug,
  })),
  {
    id: 'about',
    kind: 'lodge',
    x: 0,
    z: stations.lodge.z,
    title: 'Base Lodge',
    subtitle: 'About Owen',
  },
  {
    id: 'contact',
    kind: 'lift',
    x: 0,
    z: stations.lift.z,
    title: 'The Lift',
    subtitle: 'Get in touch',
  },
]
