import type { KnowledgeRecord } from './types'

// An explicit publication allowlist. Local editorial drafts are never imported.
// Bump this version when published passages change; keep passage IDs stable.
export const knowledgeVersion = '2026-11-15.2'

export const publishedKnowledge: readonly KnowledgeRecord[] = [
  {
    id: 'lexisnexis',
    slug: 'lexisnexis',
    title: 'LexisNexis Risk Solutions',
    summary:
      'Customer-facing data science, ML tooling and an internal AI engineering pilot.',
    category: 'experience',
    publication: 'published',
    status: 'Internal pilot in development',
    updatedAt: '2026-11-15',
    evidenceKind: 'owner-reported',
    tags: [
      'experience',
      'customer-facing',
      'fraud modelling',
      'LightGBM',
      'Python',
      'SQL',
      'Snowflake',
      'human review',
    ],
    sections: [
      {
        id: 'lexisnexis-role',
        heading: 'Placement and continuing work',
        text: 'Owen worked as a Data Scientist on industrial placement at LexisNexis Risk Solutions from July 2025 to August 2026, then continued as an AI engineering contractor from August 2026. His owner-supplied account describes two fraud-model optimisations, financial-data analysis using Python, SQL and Snowflake, and research into self-supervised representations. Much of his Lexis work is customer-facing.',
      },
      {
        id: 'lexisnexis-tooling',
        heading: 'ML tooling for the team',
        text: 'Owen reports responsibility for ML tooling, including improving the speed, quality and ease of use of LightGBM rule mining for the team’s data scientists. No numerical speed-up, quality metric or customer-specific result is supplied. Detailed case studies still need a publishable problem statement, personal contribution, constraints and outcome evidence.',
      },
      {
        id: 'lexisnexis-pilot',
        heading: 'From demonstration to internal pilot',
        text: 'According to Owen’s account, he architected an AI workflow intended for organisation-wide use, built an end-to-end demonstration and presented the concept, value and scaling approach to senior stakeholders. He was retained to develop a funded internal pilot toward production. Persistent state, audit trails and human-review gates are part of the described approach. Intended scope does not establish organisation-wide deployment or tested production scale.',
      },
      {
        id: 'lexisnexis-limits',
        heading: 'Evidence and disclosure',
        text: 'These employment and contribution claims are Owen’s account, not independently verified performance results. Employer code, transaction data, customer identities and internal evaluation results are not published here. Production monitoring and retraining remain gaps in the experience described; this page does not claim ownership of a deployed monitoring or retraining system.',
      },
    ],
    links: [
      {
        label: 'Owner account and disclosure limits',
        href: '/work/lexisnexis#lexisnexis-limits',
      },
    ],
  },
  {
    id: 'portfolio-assistant',
    slug: 'portfolio-assistant',
    title: 'An inspectable portfolio assistant',
    summary:
      'Search this portfolio’s published sources and inspect the passages behind each result.',
    category: 'project',
    publication: 'published',
    status: 'Source-search preview',
    updatedAt: '2026-11-15',
    evidenceKind: 'artifact-backed',
    tags: [
      'assistant',
      'RAG',
      'retrieval',
      'evaluation',
      'citations',
      'portfolio',
    ],
    sections: [
      {
        id: 'portfolio-assistant-purpose',
        heading: 'The question',
        text: 'Can a visitor explore Owen’s work through a conversational interface while inspecting the evidence behind each answer? This preview searches a curated public source catalog and shows the retrieved passages, their source pages and a map of the retrieval process.',
      },
      {
        id: 'portfolio-assistant-design',
        heading: 'Current behaviour',
        text: 'The preview uses deterministic lexical retrieval and displays source excerpts with citations. Generated answers are switched off at Owen’s request. When no passages match, it suggests contacting Owen. Drafts, employer-confidential material and private study notes are excluded from the public catalog. An optional generation path is implemented but has not been evaluated with a live model.',
      },
      {
        id: 'portfolio-assistant-evaluation',
        heading: 'Evaluation and limits',
        text: 'Offline checks cover retrieval, citation validation, failure handling and the source-only interface. The retrieval fixtures are a developer-visible regression suite, not a held-out measure of general answer quality. Live generated answers, semantic support and injection resistance still require model evaluation and human review. A small-model adaptation experiment is planned as a separate comparison; no training or improvement is claimed.',
      },
    ],
    links: [
      { label: 'Explore the assistant', href: '/ask' },
      { label: 'Browse its public sources', href: '/work' },
    ],
  },
  {
    id: 'dissertation',
    slug: 'dissertation',
    title: 'Dissertation preparation: plain versus RAG',
    summary:
      'A preparatory teaching benchmark using self-hosted Qwen and fictional equipment-hire documents.',
    category: 'research',
    publication: 'published',
    status: 'Preparatory benchmark completed; research in progress',
    updatedAt: '2026-11-15',
    evidenceKind: 'owner-reported',
    tags: [
      'dissertation',
      'research',
      'Qwen',
      'TF-IDF',
      'retrieval',
      'RAG',
      'evaluation',
      'GPU',
    ],
    sections: [
      {
        id: 'dissertation-scope',
        heading: 'Teaching scope',
        text: 'The preparatory build compares plain Qwen inference with the same model given context from a paragraph-level TF-IDF retriever. It uses fictional equipment-hire documents, 20 questions and 40 primary outputs on a university GPU. This is preparation for dissertation work, not a completed dissertation result or a general model-accuracy benchmark.',
      },
      {
        id: 'dissertation-method',
        heading: 'Making the comparison inspectable',
        text: 'Both conditions use the same questions and matching generation settings. Reference answers and scoring labels are excluded from generation; warm-up calls are excluded from primary results. Saved answers, configuration and source provenance support inspection. Scoring separates required facts, unsupported claims, paragraph-ID citation support and abstention.',
      },
      {
        id: 'dissertation-observations',
        heading: 'What the exercise exposed',
        text: 'An early run produced unusable output with nonfinite model scores; a corrected attention configuration and a nonfinite-score guard were checked before the comparison. The exercise also exposed answers that contradicted themselves, missed a condition or cited an unrelated paragraph. Finding evidence and supporting an answer are separate problems.',
      },
      {
        id: 'dissertation-limits',
        heading: 'Limits of the public account',
        text: 'The current public evidence is Owen’s curated project account in the Studio. The underlying research materials and assessment submissions are not published here. Findings concern a small fictional fixture and its scoring protocol; ambiguous abstentions depend on interpretation of the scoring rules. No dissertation novelty, general performance uplift or final research outcome is claimed.',
      },
    ],
    links: [{ label: 'Studio project overview', href: '/studio' }],
  },
  {
    id: 'copilot',
    slug: 'copilot',
    title: 'Application Copilot',
    summary:
      'A local-first application workspace connecting evidence retrieval, drafting and human review.',
    category: 'project',
    publication: 'published',
    status: 'In development',
    updatedAt: '2026-11-15',
    evidenceKind: 'mixed',
    tags: [
      'applications',
      'copilot',
      'AI workflows',
      'durable jobs',
      'retrieval',
      'human review',
    ],
    sections: [
      {
        id: 'copilot-problem',
        heading: 'Evidence behind a draft',
        text: 'Application Copilot focuses on the workflow around a model call: finding relevant evidence, making citations inspectable and keeping human review part of application drafting.',
      },
      {
        id: 'copilot-engineering',
        heading: 'Recorded stages',
        text: 'The engineering work connects retrieval, drafting and review through durable jobs, explicit job state, idempotency and controls around selected-data model calls. The aim is a workflow that can be inspected and supervised.',
      },
      {
        id: 'copilot-limits',
        heading: 'Validation so far',
        text: 'The curated project account reports synthetic tests of workflow behaviour. Full end-to-end recovery and semantic quality remain to be qualified. Synthetic tests do not establish live-model quality or production readiness; the linked repository is implementation evidence, not proof of those outcomes.',
      },
    ],
    links: [
      {
        label: 'Application Copilot repository',
        href: 'https://github.com/OwenC05/applications',
      },
    ],
  },
  {
    id: 'typeforge',
    slug: 'typeforge',
    title: 'TypeForge',
    summary:
      'A local-first typing application with Python model evaluation and a versioned browser inference artifact.',
    category: 'project',
    publication: 'published',
    status: 'In development',
    updatedAt: '2026-11-15',
    evidenceKind: 'mixed',
    tags: [
      'typing',
      'TypeScript',
      'Python',
      'machine learning',
      'browser',
      'local-first',
      'evaluation',
    ],
    sections: [
      {
        id: 'typeforge-product',
        heading: 'The product',
        text: 'TypeForge is a browser-local typing application using native browser interaction and on-device storage. Current product priorities are daily practice and feature polish. Owen describes the current experience as a typing test with a disconnected ML study; a trained timing model is not automatically a useful practice-selection policy.',
      },
      {
        id: 'typeforge-model',
        heading: 'From evaluation to inference',
        text: 'A Python benchmark compares a baseline with a candidate model. A versioned model artifact supports browser inference. The public benchmark and methods are linked below; this page does not independently reproduce their results.',
      },
      {
        id: 'typeforge-limits',
        heading: 'What the evidence supports',
        text: 'The benchmark evaluates transition-timing prediction, not changes in typing speed, practice selection or learning. User benefit remains unestablished. The public demo and repository describe work in development, not a completed product release.',
      },
    ],
    links: [
      {
        label: 'TypeForge repository',
        href: 'https://github.com/OwenC05/TypeForge',
      },
      {
        label: 'Pinned benchmark report',
        href: 'https://github.com/OwenC05/TypeForge/blob/de69444a6201da96281ca9ad88088904477775a2/typing-app/client/src/generated/benchmark.json#L231-L270',
      },
      {
        label: 'Pinned methods and reproduction instructions',
        href: 'https://github.com/OwenC05/TypeForge/blob/de69444a6201da96281ca9ad88088904477775a2/ml/README.md#L24-L46',
      },
    ],
  },
  {
    id: 'reinforcement-learning',
    slug: 'reinforcement-learning',
    title: 'Reinforcement learning coursework',
    summary:
      'A place for a future account of the coursework, its methods and attributable results.',
    category: 'research',
    publication: 'published',
    status: 'Write-up in preparation',
    updatedAt: '2026-11-15',
    evidenceKind: 'owner-reported',
    tags: ['reinforcement learning', 'RL', 'coursework', 'study'],
    sections: [
      {
        id: 'reinforcement-learning-status',
        heading: 'Publication status',
        text: 'A substantive public coursework write-up is not yet available. A local study companion is separate from the coursework itself. This entry does not claim that Owen trained an RL agent, achieved a particular score or authored an unreviewed coursework artifact.',
      },
      {
        id: 'reinforcement-learning-next',
        heading: 'What a write-up needs',
        text: 'A publishable account needs the actual task, Owen’s personal contribution, permitted artifacts, evaluation conditions and limitations. Assessment submissions and learner notes are not reproduced in this portfolio.',
      },
    ],
    links: [{ label: 'Writing and future notes', href: '/writing' }],
  },
  {
    id: 'about-owen',
    slug: 'about-owen',
    title: 'About Owen',
    summary:
      'Software engineering, applied AI, and a few interests away from the screen.',
    category: 'about',
    publication: 'published',
    status: 'Public profile',
    updatedAt: '2026-11-15',
    evidenceKind: 'owner-reported',
    tags: [
      'about',
      'education',
      'Bath',
      'interests',
      'music',
      'coffee',
      'keyboards',
      'snowboarding',
      'reading',
    ],
    sections: [
      {
        id: 'about-owen-background',
        heading: 'Background',
        text: 'Owen Cheung is a final-year Computer Science and Artificial Intelligence student at the University of Bath, with graduation expected in 2027. His work combines software engineering and applied AI, including retrieval, evaluation and workflows people can inspect.',
      },
      {
        id: 'about-owen-reading',
        heading: 'Reading and application',
        text: 'Owen reads and applies research papers. Specific titles, personal opinions and accounts of how an individual paper changed his work have not yet been supplied for publication. The writing section will hold reviewed research notes, experiments, engineering and personal writing.',
      },
      {
        id: 'about-owen-interests',
        heading: 'Away from the screen',
        text: 'Owen’s interests include listening to and making music, specialty coffee, custom mechanical keyboards and snowboarding with Bath Snowsports. This public profile does not imply preferences for particular artists, equipment or destinations.',
      },
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/OwenC05' },
      { label: 'Contact Owen', href: 'mailto:oc608@bath.ac.uk' },
    ],
  },
]

export function findPublishedKnowledge(
  slug: string
): KnowledgeRecord | undefined {
  return publishedKnowledge.find(
    (record) => record.publication === 'published' && record.slug === slug
  )
}

export function knowledgeHref(
  record: KnowledgeRecord
): `/writing/${string}` | `/work/${string}` {
  return record.category === 'writing'
    ? `/writing/${record.slug}`
    : `/work/${record.slug}`
}
