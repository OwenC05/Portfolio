import type { StudioProject } from './studio-contract';

export const studioProfile = {
  name: 'Owen Cheung',
  role: 'Software engineering / Applied AI',
  intro:
    'I build software around AI: retrieval, evaluation and workflows people can inspect. My experience at LexisNexis Risk Solutions includes developer enablement through instructions, scripts, skills and context management.',
  personalNote:
    "Off the clock, it's listening to and making music, coffee, custom keyboards and snowboarding.",
  links: [
    { label: 'Email Owen', href: 'mailto:oc608@bath.ac.uk' },
    { label: 'GitHub', href: 'https://github.com/OwenC05' },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/owen-cheung-472998225/',
    },
  ],
} as const satisfies {
  name: string;
  role: string;
  intro: string;
  personalNote: string;
  links: readonly { label: string; href: string }[];
};

export const studioProjects: readonly StudioProject[] = [
  {
    id: 'dissertation',
    title: 'From a model to an inspectable comparison',
    eyebrow: 'Dissertation preparation / Retrieval + evaluation',
    summary:
      'Self-hosted Qwen inference, custom retrieval and a reproducible plain-versus-RAG comparison, built as a preparatory teaching benchmark on fictional documents.',
    sections: [
      {
        heading: 'The problem',
        paragraphs: [
          'How does adding source material change a model answer, and where can the pipeline still fail? The task was to run a language model on a university GPU, add retrieval and compare the answers against evidence in a small set of fictional equipment-hire documents.',
        ],
      },
      {
        heading: 'My work',
        paragraphs: [
          'The build connects self-hosted inference, a custom paragraph-level TF-IDF retriever, prompt packing and a comparison with recorded configurations and source provenance.',
          'An early generation run produced unusable output with nonfinite model scores. A corrected attention configuration and a guard against nonfinite scores were checked before the comparison; the failed run was retained as diagnostic evidence.',
        ],
      },
      {
        heading: 'Plain and RAG architecture',
        paragraphs: [
          'Plain: question → Qwen → saved answer. The model receives the question without retrieved source documents, providing the baseline condition.',
          'RAG: question → TF-IDF paragraph retrieval → question plus selected context → the same Qwen model → saved answer and trace. Retrieval chooses whole paragraphs; prompt packing adds that evidence to the model input. Both paths save their answers for the same scoring process.',
        ],
      },
      {
        heading: 'What the comparison exposed',
        paragraphs: [
          'Retrieving the right material was only part of the problem. Answers could still contradict themselves, overlook a condition or cite an unrelated paragraph. The useful distinction was between finding evidence, reasoning with it and supporting the final claim.',
        ],
      },
      {
        heading: 'Comparison protocol',
        paragraphs: [
          'Both conditions use the same questions and matching generation settings. Reference answers and scoring labels are excluded from generation. Warm-up calls are excluded from the primary results, and the scoring convention was recorded before generation.',
          'Scoring separates required facts, unsupported claims, paragraph-ID citation support and abstention. Ambiguous answers retain their interpretation notes, so a reader can see how the scoring decision was reached.',
        ],
      },
      {
        heading: 'Reproducibility',
        paragraphs: [
          'The record pins the model snapshot, runtime and generation settings, and preserves code identities, outputs and annotations. Copied evidence was hash-checked, and the archived evaluator reproduces the recorded scoring. The model ran on demand in a bounded container, which was stopped after the work.',
        ],
      },
      {
        heading: 'Scope and limitations',
        paragraphs: [
          'These findings describe a small fictional fixture and its scoring protocol. They do not establish general model accuracy or a completed dissertation result; ambiguous abstentions also depend on how the scoring rules are interpreted.',
        ],
      },
    ],
    facts: [
      {
        label: 'Teaching scope',
        value:
          '20 questions, 40 primary outputs, 1 GPU — a fictional teaching fixture.',
      },
      {
        label: 'Comparison',
        value: 'Plain Qwen / Qwen with paragraph-level TF-IDF retrieval',
      },
      {
        label: 'Scoring',
        value: 'Facts, claim support, citations and abstention',
      },
    ],
    links: [],
  },
  {
    id: 'copilot',
    title: 'Application Copilot',
    eyebrow: 'AI workflows / In development',
    summary:
      'A local-first application workspace connecting evidence retrieval and drafting with durable jobs, recorded stages and human review.',
    sections: [
      {
        heading: 'The problem',
        paragraphs: [
          'An application draft needs evidence behind its claims and a way for the person using it to inspect the work. The project focuses on the workflow around a model call: finding relevant material, making citations inspectable and keeping human review part of drafting.',
        ],
      },
      {
        heading: 'The engineering work',
        paragraphs: [
          'Evidence retrieval, drafting and review become recorded stages. The engineering work covers durable jobs, explicit job state, idempotency and controls around selected-data model calls, so the workflow can be inspected and supervised.',
        ],
      },
      {
        heading: 'Validation so far',
        paragraphs: [
          'Synthetic tests exercise workflow behaviour. Full end-to-end recovery and semantic quality remain to be qualified; these tests do not establish live-model quality or production readiness.',
        ],
      },
    ],
    facts: [
      { label: 'Status', value: 'In development' },
      { label: 'Workflow', value: 'Durable jobs, recorded stages, human review' },
      {
        label: 'Engineering focus',
        value: 'Job state, idempotency and selected-data controls',
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
    title: 'TypeForge',
    eyebrow: 'Browser product / Applied ML',
    summary:
      'A local-first typing application connecting native browser interaction with Python model evaluation and a versioned inference artifact.',
    sections: [
      {
        heading: 'The product',
        paragraphs: [
          "TypeForge is a local-first typing application built with native browser technology and local storage. The product work keeps the typing interaction direct and the user's data close to the device.",
        ],
      },
      {
        heading: 'From evaluation to the browser',
        paragraphs: [
          'A Python benchmark compares a baseline with a candidate model. A versioned artifact carries the evaluated model into browser inference, connecting the evaluation work to the product that consumes it.',
        ],
      },
      {
        heading: 'What the evidence supports',
        paragraphs: [
          'The benchmark evaluates a model, not changes in typing speed or learning. User benefit remains unestablished; the repository documents the evaluation and deployment limitations.',
        ],
      },
    ],
    facts: [
      { label: 'Product', value: 'Local-first browser application' },
      { label: 'ML workflow', value: 'Python evaluation → versioned browser artifact' },
      { label: 'Storage', value: 'On-device browser storage' },
    ],
    links: [
      { label: 'TypeForge repository', href: 'https://github.com/OwenC05/TypeForge' },
    ],
  },
] satisfies readonly StudioProject[];
