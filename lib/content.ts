// Global, stack-agnostic site content. The voice and facts live here so the
// 3D run, the Base Lodge (About) and the case studies all read from one place.

export const site = {
  name: 'Owen Cheung',
  sub: 'Applied AI @ LexisNexis · CS & AI @ Bath',
  location: 'Bath, UK',
  // The summit line — what the run is about.
  tagline: 'I build systems that learn — and ride mountains for the rest.',
  intro:
    'Computer Science & AI at the University of Bath, on placement turning risk-analytics research into applied AI. Heading for AI research and engineering.',
}

export const contact = {
  email: 'owencheung2@gmail.com',
  github: 'https://github.com/OwenC05',
  githubHandle: 'OwenC05',
  linkedin: 'https://www.linkedin.com/in/owencheungcs/',
  linkedinHandle: 'owencheungcs',
  cvUrl: '/owen-cheung-cv.pdf', // reserved — file to be uploaded
}

export type ExperienceItem = {
  org: string
  role: string
  period: string
  location?: string
  note?: string
}

export type EducationItem = {
  org: string
  detail: string
  period: string
  note?: string
}

export const about = {
  bio: [
    "I'm Owen — a Computer Science & AI student at the University of Bath, currently on placement as a Data Scientist at LexisNexis Risk Solutions, where the work turned toward applied AI research.",
    'I care about systems that learn: representation learning, embeddings with the right geometry, and agentic systems that do real work. I’m heading toward AI research and engineering.',
    'Away from the screen I snowboard with Bath Snowsports, pull a lot of espresso, and build mechanical keyboards — which is how I ended up typing at ~180 wpm (and building TypeForge).',
  ],
  experience: [
    {
      org: 'LexisNexis Risk Solutions',
      role: 'Data Scientist → Applied AI (placement)',
      period: '2025 — present',
      location: 'London',
      note: 'Behavioral-engine research and a founded, cross-site agentic-automation initiative.',
    },
    {
      org: "Dish'D",
      role: 'Full-Stack Developer',
      period: '2024 — 2025',
      location: 'London',
      note: 'Built a social cooking app end-to-end with Django + Flutter; led technical decisions.',
    },
    {
      org: 'Kinetix',
      role: 'System Tester',
      period: '2024',
      location: 'Hong Kong',
      note: 'QA for Census & Statistics Department systems — validated functionality against spec.',
    },
    {
      org: 'DXC Technology',
      role: 'Intern',
      period: '2022',
      location: 'Hong Kong',
      note: 'Drafted technical proposals for enterprise bids (AI-assisted mapping, OpenBIM.AI).',
    },
  ] as ExperienceItem[],
  education: [
    {
      org: 'University of Bath',
      detail: 'BSc (Hons) Computer Science & Artificial Intelligence, with placement',
      period: '2023 — 2027',
      note: 'Predicted 2:1',
    },
    {
      org: 'Wellington College',
      detail: 'A-Levels — Maths, Further Maths, Physics, Computer Science',
      period: '2021 — 2023',
    },
  ] as EducationItem[],
  skills: {
    'AI / ML': [
      'PyTorch',
      'Contrastive learning',
      'Hyperbolic embeddings',
      'Agentic systems',
      'Deep learning',
    ],
    Languages: ['Python', 'TypeScript', 'Haskell', 'Dart', 'SQL'],
    Frameworks: ['React / Node', 'Django', 'Flutter', 'Next.js'],
    Data: ['Snowflake', 'Statistical modelling', 'Data analysis'],
  } as Record<string, string[]>,
  // Earlier work that adds range without cluttering the main run.
  archive: [
    {
      title: 'JTutors',
      period: '2021 — 2023',
      note: 'Tutoring platform with payments, real-time chat, video calls and an infinite collaborative whiteboard (JavaScript / Node).',
    },
  ],
  languages: ['English', 'Mandarin', 'Cantonese'],
  hobbies: [
    {
      label: 'Snowboarding',
      note: 'Carving and freestyle with Bath Snowsports — the reason this site is a mountain.',
    },
    { label: 'Specialty coffee', note: 'Chasing brew methods and flavour.' },
    {
      label: 'Mechanical keyboards',
      note: 'Built several from scratch; types at ~180 wpm.',
    },
  ],
}
