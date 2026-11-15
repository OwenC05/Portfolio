export interface RetrievalHit {
  sourceId: string
  chunkId: string
  title: string
  heading: string
  text: string
  href: string
  score: number
}

export interface AssistantCitation {
  sourceId: string
  chunkId: string
  title: string
  href: string
  quote: string
}

export type FallbackReason =
  | 'disabled'
  | 'invalid-config'
  | 'missing-credential'
  | 'authentication-error'
  | 'rate-limited'
  | 'provider-error'
  | 'timeout'
  | 'cancelled'
  | 'invalid-output'
  | 'response-too-large'
  | 'no-sources'

export interface AssistantAnswer {
  mode: 'generated' | 'sources' | 'abstained'
  text: string
  citations: AssistantCitation[]
  model?: string
  fallbackReason?: FallbackReason
}

export type AssistantEvent =
  | { type: 'retrieval-start'; question: string }
  | { type: 'retrieval'; hits: RetrievalHit[]; durationMs: number }
  | { type: 'generation' }
  | { type: 'answer'; answer: AssistantAnswer }
  | { type: 'done'; durationMs: number }
