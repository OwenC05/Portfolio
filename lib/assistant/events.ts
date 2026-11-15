import type {
  AssistantAnswer,
  AssistantCitation,
  AssistantEvent,
  FallbackReason,
  RetrievalHit,
} from './types'

const fallbackReasons = {
  disabled: true,
  'invalid-config': true,
  'missing-credential': true,
  'authentication-error': true,
  'rate-limited': true,
  'provider-error': true,
  timeout: true,
  cancelled: true,
  'invalid-output': true,
  'response-too-large': true,
  'no-sources': true,
} satisfies Record<FallbackReason, true>

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isMeasurement(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isCitation(value: unknown): value is AssistantCitation {
  return (
    isObject(value) &&
    typeof value.sourceId === 'string' &&
    typeof value.chunkId === 'string' &&
    typeof value.title === 'string' &&
    typeof value.href === 'string' &&
    typeof value.quote === 'string'
  )
}

function isHit(value: unknown): value is RetrievalHit {
  return (
    isObject(value) &&
    typeof value.sourceId === 'string' &&
    typeof value.chunkId === 'string' &&
    typeof value.title === 'string' &&
    typeof value.heading === 'string' &&
    typeof value.text === 'string' &&
    typeof value.href === 'string' &&
    isMeasurement(value.score)
  )
}

function isAnswer(value: unknown): value is AssistantAnswer {
  return (
    isObject(value) &&
    (value.mode === 'generated' ||
      value.mode === 'sources' ||
      value.mode === 'abstained') &&
    typeof value.text === 'string' &&
    Array.isArray(value.citations) &&
    value.citations.every(isCitation) &&
    (value.model === undefined || typeof value.model === 'string') &&
    (value.fallbackReason === undefined ||
      (typeof value.fallbackReason === 'string' &&
        Object.prototype.hasOwnProperty.call(
          fallbackReasons,
          value.fallbackReason
        )))
  )
}

function isEvent(value: unknown): value is AssistantEvent {
  if (!isObject(value)) return false
  switch (value.type) {
    case 'retrieval-start':
      return typeof value.question === 'string'
    case 'retrieval':
      return (
        Array.isArray(value.hits) &&
        value.hits.every(isHit) &&
        isMeasurement(value.durationMs)
      )
    case 'generation':
      return true
    case 'answer':
      return isAnswer(value.answer)
    case 'done':
      return isMeasurement(value.durationMs)
    default:
      return false
  }
}

/** Validate each complete NDJSON event before it reaches component state. */
export function parseAssistantEvent(line: string): AssistantEvent {
  try {
    const event: unknown = JSON.parse(line)
    if (isEvent(event)) return event
  } catch {
    // Invalid JSON and invalid payloads use the same recoverable UI error.
  }
  throw new Error('The assistant sent a response this page could not read.')
}
