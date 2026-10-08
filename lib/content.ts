// Manually curated public facts. Never import the raw CV into application code.

export const site = {
  name: 'Owen Cheung',
  sub: 'AI Engineer @ LexisNexis · CS & AI @ Bath',
  location: 'Bath, UK',
  tagline: 'AI systems, built with judgement.',
  intro:
    'AI Engineer at LexisNexis Risk Solutions, building human-governed workflows for fraud-model optimisation. Final-year Computer Science & AI student at the University of Bath.',
  heroHeadline: 'Human-reviewed AI workflows.\nApplied research, made useful.',
  heroContext: 'LexisNexis Risk Solutions / CS & AI at Bath',
  coords: 'BATH · 51.38°N',
}

export const contact = {
  email: 'oc608@bath.ac.uk',
  github: 'https://github.com/OwenC05',
  githubHandle: 'OwenC05',
  linkedin: 'https://www.linkedin.com/in/owen-cheung-472998225/',
  linkedinHandle: 'owen-cheung-472998225',
  cvUrl: undefined as string | undefined, // no public CV yet — chip auto-appears when a PDF path is set
  blurb:
    'Interested in thoughtful AI engineering, data science and useful systems.',
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
    "I'm Owen, an AI Engineer at LexisNexis Risk Solutions and a final-year Computer Science & AI student at the University of Bath. I stayed on as a contractor after my industrial placement to develop a self-initiated prototype into a funded internal pilot.",
    'I enjoy the freedom to investigate a problem, explore emerging methods and put promising ideas to the test. My work connects representation-learning research with practical AI engineering: from graph and contrastive methods to recoverable, human-governed systems.',
    'Away from the screen I snowboard with Bath Snowsports, pull a lot of espresso, and build mechanical keyboards — which is how I ended up typing at 193 wpm (and designing TypeForge).',
  ],
  experience: [
    {
      org: 'LexisNexis Risk Solutions',
      role: 'AI Engineer (Agentic AI)',
      period: 'Aug 2026 — present · Contract',
      location: 'London',
      note: 'Architected a solution designed for organisation-wide use, built an end-to-end demo, and presented the concept, value and scaling approach to senior stakeholders. Now developing the funded internal pilot toward production.',
    },
    {
      org: 'LexisNexis Risk Solutions',
      role: 'Data Scientist',
      period: 'Jul 2025 — Aug 2026 · Industrial placement',
      note: 'Large-scale financial data analysis, two fraud-model optimisations and self-directed representation-learning research. Gained experience in GPU compute and batch training, and initiated an agentic working demo.',
    },
    {
      org: "Dish'D",
      role: 'Full-Stack Developer',
      period: 'Jan 2024 — Feb 2025',
      location: 'London',
      note: 'Built a social cooking app end-to-end with Django + Flutter; led technical decisions.',
    },
    {
      org: 'Kinetix',
      role: 'System Tester',
      period: 'Jul 2024 — Aug 2024',
      location: 'Hong Kong',
      note: 'QA for Census & Statistics Department systems — validated functionality against spec.',
    },
    {
      org: 'DXC Technology',
      role: 'AI Project Intern',
      period: 'Jul 2022 — Aug 2022',
      location: 'Hong Kong',
      note: 'Drafted technical proposals for enterprise bids (AI-assisted mapping, OpenBIM.AI).',
    },
  ] as ExperienceItem[],
  education: [
    {
      org: 'University of Bath',
      detail:
        'BSc (Hons) Computer Science & Artificial Intelligence, with placement',
      period: 'Sept 2023 — 2027 (expected)',
      note: 'Expected 2:1',
    },
    {
      org: 'Wellington College',
      detail: 'A-Levels — Maths, Further Maths, Physics, Computer Science',
      period: 'Aug 2021 — Aug 2023',
    },
  ] as EducationItem[],
  skills: {
    'AI / ML': [
      'PyTorch',
      'Contrastive learning',
      'Hyperbolic embeddings',
      'Agentic systems',
      'Deep learning',
      'Multimodal contrastive learning (study)',
    ],
    Languages: ['Python', 'TypeScript', 'Haskell', 'Dart', 'SQL'],
    Frameworks: ['React / Node', 'Django', 'Flutter', 'Next.js'],
    Data: [
      'SQL',
      'Snowflake',
      'LightGBM',
      'Statistical modelling',
      'Data analysis',
    ],
    Compute: ['GPU compute', 'Batch training'],
    'Cloud / AI': [
      'Azure OpenAI',
      'Azure Foundry and AWS S3 (workshop experience)',
    ],
  } as Record<string, string[]>,
  // Earlier work that adds range without cluttering the main run.
  archive: [
    {
      title: 'JTutors',
      period: 'Aug 2021 — Aug 2023',
      note: 'Tutoring platform with payments, real-time chat, video calls and an infinite collaborative whiteboard (JavaScript / Node).',
    },
  ],
  languages: ['English', 'Mandarin', 'Cantonese'],
  hobbies: [
    {
      label: 'Snowboarding',
      note: 'Carving and freestyle with Bath Snowsports — away from the screen.',
    },
    { label: 'Specialty coffee', note: 'Chasing brew methods and flavour.' },
    {
      label: 'Mechanical keyboards',
      note: 'Built several from scratch; reached 193 wpm.',
    },
  ],
}
