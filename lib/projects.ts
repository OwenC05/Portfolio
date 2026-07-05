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
    tagline: 'Teaching risk systems to reason.',
    blurb:
      'Behavioral-engine research (multimodal contrastive learning + hyperbolic embeddings) that grew into a founded, cross-site agentic platform.',
    grade: 'black',
    lane: 'center',
    z: 16,
    year: '2025 — present',
    role: 'Data Scientist (placement)',
    stack: [
      'PyTorch',
      'Contrastive learning',
      'Hyperbolic embeddings',
      'Agentic systems',
      'Python',
      'Snowflake',
    ],
    summary:
      "My placement turned into applied AI research. I prototyped a behavioral engine that fuses heterogeneous signals with multimodal contrastive learning, and modelled their natural hierarchy with hyperbolic (Poincaré-disk) embeddings — a direction that led to a long-term-memory innovation session with the CTO. I then founded an internal initiative to automate the team's analytical work with an agentic system; it grew beyond our team into a cross-site effort with engineering in the US, and earned SVP backing.",
    highlights: [
      'Multimodal contrastive learning to fuse heterogeneous behavioral signals into one shared representation space.',
      'Hyperbolic (Poincaré-disk) embeddings to capture the hierarchy real-world behavior actually has.',
      'Presented the research direction in a long-term-memory innovation session with the CTO.',
      'Founded and led an agentic-automation initiative spanning teams and the US engineering org, with SVP backing.',
    ],
    confidential: true,
  },
  {
    id: 'typeforge',
    slug: 'typeforge',
    title: 'TypeForge',
    tagline: 'Typing practice that adapts to you.',
    blurb:
      'A typing trainer with real-time analytics and AI drills that target the keys and patterns you actually fumble.',
    grade: 'black',
    lane: 'research',
    z: 38,
    year: '2025 — present',
    role: 'Solo build',
    stack: ['React', 'Node.js', 'TypeScript', 'Real-time analytics'],
    summary:
      'A typing-speed trainer with real-time analytics on cadence, keystrokes and accuracy, plus AI-driven drills that adapt to the patterns you fumble. I built it because I type at ~180 wpm and wanted practice that targets the gaps instead of drilling what I already know.',
    highlights: [
      'Real-time analytics on cadence, keystroke timing and accuracy.',
      'Adaptive AI drills generated from your individual weak spots.',
      'Born from a keyboard-builder obsession with input mechanics.',
    ],
    repoUrl: 'https://github.com/OwenC05',
  },
  {
    id: 'sortify',
    slug: 'sortify',
    title: 'Sortify',
    tagline: 'Playlists sorted by feel.',
    blurb:
      'A Spotify tool that sorts and recommends playlists by genre, mood and danceability from audio features.',
    grade: 'blue',
    lane: 'research',
    z: 62,
    year: '2024',
    role: 'Backend + recommendations',
    stack: ['Python', 'Spotify API', 'Recommendation'],
    summary:
      "A Spotify-API app that sorts and recommends playlists by genre, mood and danceability. I built the backend recommendation logic on top of Spotify's audio-feature data to surface personalised picks for how a playlist actually feels.",
    highlights: [
      'Clusters tracks by audio features — mood, danceability, genre.',
      'Personalised recommendations from listening signals.',
      'Python backend against the Spotify Web API.',
    ],
    repoUrl: 'https://github.com/OwenC05',
  },
  {
    id: 'knowtrients',
    slug: 'knowtrients',
    title: 'Knowtrients',
    tagline: 'Nutrition tracking, built by eight.',
    blurb:
      'A micronutrient + wellbeing app built in a team of 8 on a real Scrum cadence; I owned recipe parsing and nutrition analysis.',
    grade: 'blue',
    lane: 'build',
    z: 38,
    year: '2024 — 2025',
    role: 'Full-stack + Scrum',
    stack: ['Django', 'Flutter / Dart', 'Agile / Scrum'],
    summary:
      'A micronutrient-tracking and wellbeing app built in a team of 8 using Scrum. I implemented recipe parsing and nutrition analysis end-to-end with Django and Flutter, and helped run sprint planning and stakeholder testing — we onboarded 20+ pilot users.',
    highlights: [
      'Recipe parsing + nutrition analysis, end to end.',
      'Team of 8 on a real Scrum cadence.',
      '20+ pilot users through stakeholder testing.',
    ],
    repoUrl: 'https://github.com/OwenC05',
  },
  {
    id: 'dishd',
    slug: 'dishd',
    title: "Dish'D",
    tagline: 'A social network for cooking.',
    blurb:
      'A social cooking app (Django + Flutter) where I built auth, sharing and feeds, and led the technical decisions.',
    grade: 'blue',
    lane: 'build',
    z: 62,
    year: '2024 — 2025',
    role: 'Full-Stack Developer',
    stack: ['Django', 'Flutter / Dart', 'Auth', 'Feeds'],
    summary:
      'A social cooking app where people share recipes and meal inspiration. I built core features — authentication, content sharing and interactive feeds — with Django and Flutter, and led technical decisions on scalability, usability and performance.',
    highlights: [
      'Auth, content sharing and interactive feeds.',
      'Led technical decisions on scalability + performance.',
      'Django backend, Flutter/Dart mobile client.',
    ],
  },
]

export const projectBySlug: Record<string, Project> = Object.fromEntries(
  projects.map((p) => [p.slug, p]),
)

export const getProject = (slug: string): Project | undefined => projectBySlug[slug]

// x position of a gate from its lane.
export const laneX = (lane: Lane): number =>
  lane === 'research' ? -slope.laneOffset : lane === 'build' ? slope.laneOffset : 0

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
  { id: 'about', kind: 'lodge', x: 0, z: stations.lodge.z, title: 'Base Lodge', subtitle: 'About Owen' },
  { id: 'contact', kind: 'lift', x: 0, z: stations.lift.z, title: 'The Lift', subtitle: 'Get in touch' },
]

