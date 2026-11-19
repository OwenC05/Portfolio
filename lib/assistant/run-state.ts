import type {
  AssistantAnswer,
  AssistantCitation,
  AssistantEvent,
  RetrievalHit,
} from './types'

export type RunId = string
export type HitKey = string
export type Phase =
  | 'idle'
  | 'requesting'
  | 'retrieving'
  | 'retrieved'
  | 'generating' // Only the existing generation-enabled Workbench branch.
  | 'answered'
  | 'done'
  | 'cancelled'
  | 'error'
export type Cursor =
  | 'start'
  | 'retrieval'
  | 'answer'
  | 'done'
  | 'eof'
  | 'sealed'
export type Completion = 'none' | 'complete' | 'missing-done'
export type FailureKind = 'http' | 'network' | 'protocol' | 'timeout'
export type StopReason = 'user' | 'timeout' | 'superseded' | 'close' | 'unmount'
export type Pose = 'idle' | 'attention' | 'sources' | 'no-match' | 'dismissal'
export type Count = 0 | 1 | 2 | 3 | 4
export type AnswerView = Readonly<Omit<AssistantAnswer, 'citations'>> & {
  readonly citations: readonly Readonly<AssistantCitation>[]
}

export interface HitView {
  readonly key: HitKey
  readonly rank: 1 | 2 | 3 | 4
  readonly hit: Readonly<RetrievalHit>
}

export interface RunState {
  readonly runId: RunId | null
  readonly revision: number
  readonly phase: Phase
  readonly cursor: Cursor
  readonly completion: Completion
  readonly question: string
  readonly hits: readonly HitView[]
  readonly selectedKey: HitKey | null
  readonly retrievalMs?: number
  readonly totalMs?: number
  readonly answer?: AnswerView
  readonly notice?: string
  readonly failure?: FailureKind
  readonly received: boolean
  readonly generated: boolean
}

export interface PresentationSnapshot {
  readonly run: RunState
  readonly count: Count
  readonly tray: 'hidden' | 'waiting' | 'hits' | 'empty'
  readonly result: 'none' | 'pending' | 'sources' | 'no-match'
  readonly pose: Pose
}

export interface AssistantActions {
  submit(question: string): void
  cancel(): void
  close(): void
  select(runId: RunId, key: HitKey | null): void
}

export interface AssistantSession {
  readonly snapshot: PresentationSnapshot
  readonly actions: AssistantActions
}

/** Transport inputs are private to the owner; UI consumers use AssistantActions. */
export type RunAction =
  | { type: 'submit'; runId: RunId; question: string }
  | { type: 'event'; runId: RunId; event: AssistantEvent }
  | { type: 'eof'; runId: RunId }
  | { type: 'fail'; runId: RunId; failure: FailureKind; notice: string }
  | { type: 'cancel'; runId: RunId }
  | { type: 'close' }
  | { type: 'select'; runId: RunId; key: HitKey | null }

const NO_HITS: readonly HitView[] = Object.freeze([])
export const INITIAL_RUN: RunState = Object.freeze({
  runId: null,
  revision: 0,
  phase: 'idle',
  cursor: 'sealed',
  completion: 'none',
  question: '',
  hits: NO_HITS,
  selectedKey: null,
  received: false,
  generated: false,
})

export const hitKey = (hit: { sourceId: string; chunkId: string }): HitKey =>
  JSON.stringify([hit.sourceId, hit.chunkId])

function change(run: RunState, patch: Partial<RunState>): RunState {
  return Object.freeze({ ...run, ...patch, revision: run.revision + 1 })
}

function failed(
  run: RunState,
  notice: string,
  failure: FailureKind = 'protocol'
) {
  // Reset all result-bearing fields atomically, including timing and selection.
  return Object.freeze({
    ...INITIAL_RUN,
    runId: run.runId,
    question: run.question,
    revision: run.revision + 1,
    phase: 'error' as const,
    failure,
    notice,
  })
}

function freezeAnswer(answer: AssistantAnswer): AnswerView {
  return Object.freeze({
    mode: answer.mode,
    text: answer.text,
    citations: Object.freeze(
      answer.citations.map((citation) =>
        Object.freeze({
          sourceId: citation.sourceId,
          chunkId: citation.chunkId,
          title: citation.title,
          href: citation.href,
          quote: citation.quote,
        })
      )
    ),
    ...(answer.model === undefined ? {} : { model: answer.model }),
    ...(answer.fallbackReason === undefined
      ? {}
      : { fallbackReason: answer.fallbackReason }),
  })
}

function validAnswer(
  run: RunState,
  answer: AssistantAnswer,
  generationEnabled: boolean
) {
  if (!run.hits.length) {
    return (
      answer.mode === 'abstained' &&
      !answer.citations.length &&
      (answer.fallbackReason === undefined ||
        answer.fallbackReason === 'no-sources')
    )
  }
  if (answer.fallbackReason === 'no-sources') return false
  if (answer.mode === 'abstained')
    return generationEnabled && run.generated && !answer.citations.length
  if (answer.mode === 'generated' && (!generationEnabled || !run.generated))
    return false
  if (answer.mode === 'sources') {
    return (
      answer.citations.length === run.hits.length &&
      answer.citations.every((citation, i) => {
        const { hit, key } = run.hits[i]
        return (
          hitKey(citation) === key &&
          citation.title === hit.title &&
          citation.href === hit.href &&
          citation.quote === hit.text
        )
      })
    )
  }
  // The existing provider path may cite a subset, with exact substring quotes.
  const seen = new Set<HitKey>()
  return (
    answer.citations.length > 0 &&
    answer.citations.length <= run.hits.length &&
    answer.citations.every((citation) => {
      const key = hitKey(citation)
      const hit = run.hits.find((view) => view.key === key)?.hit
      if (!hit || seen.has(key)) return false
      seen.add(key)
      return (
        citation.title === hit.title &&
        citation.href === hit.href &&
        citation.quote.length > 0 &&
        hit.text.includes(citation.quote)
      )
    })
  )
}

/** Shape validation belongs to parseAssistantEvent; this checks run-local semantics. */
export function reduceAssistantRun(
  run: RunState,
  action: RunAction,
  generationEnabled = false
): RunState {
  if (action.type === 'submit') {
    return Object.freeze({
      ...INITIAL_RUN,
      runId: action.runId,
      revision: run.revision + 1,
      question: action.question,
      phase: 'requesting',
      cursor: 'start',
    })
  }
  if (action.type === 'close') {
    return Object.freeze({
      ...INITIAL_RUN,
      question: run.question,
      revision: run.revision + 1,
    })
  }
  // This check runs when applying the update, not just when queuing it.
  if (action.runId !== run.runId) return run
  if (action.type === 'select') {
    if (
      action.key === run.selectedKey ||
      (action.key !== null && !run.hits.some((hit) => hit.key === action.key))
    )
      return run
    return change(run, { selectedKey: action.key })
  }
  if (action.type === 'cancel') {
    if (
      run.phase === 'idle' ||
      run.phase === 'cancelled' ||
      run.phase === 'error'
    )
      return run
    return Object.freeze({
      ...INITIAL_RUN,
      runId: run.runId,
      question: run.question,
      revision: run.revision + 1,
      phase: 'cancelled',
      notice: 'Cancelled. Your question is still in the box.',
    })
  }
  if (run.cursor === 'sealed') return run
  if (action.type === 'fail') return failed(run, action.notice, action.failure)
  if (action.type === 'eof') {
    if (run.cursor === 'eof') return change(run, { cursor: 'sealed' })
    if (run.cursor === 'done')
      return change(run, {
        phase: 'done',
        cursor: 'sealed',
        completion: 'missing-done',
        notice:
          'The connection closed before the final event; showing what arrived.',
      })
    return failed(
      run,
      'The connection closed before an answer arrived. Please try again.'
    )
  }
  const event = action.event
  const invalid = () =>
    failed(
      run,
      'The assistant sent an inconsistent response. Please try again.'
    )
  switch (event.type) {
    case 'retrieval-start':
      if (run.cursor !== 'start' || event.question !== run.question)
        return invalid()
      return change(run, {
        phase: 'retrieving',
        cursor: 'retrieval',
        received: true,
      })
    case 'retrieval': {
      if (
        run.cursor !== 'retrieval' ||
        event.hits.length > 4 ||
        new Set(event.hits.map(hitKey)).size !== event.hits.length
      )
        return invalid()
      const hits = Object.freeze(
        event.hits.map(
          (hit, i): HitView =>
            Object.freeze({
              key: hitKey(hit),
              rank: (i + 1) as HitView['rank'],
              hit: Object.freeze({
                sourceId: hit.sourceId,
                chunkId: hit.chunkId,
                title: hit.title,
                heading: hit.heading,
                text: hit.text,
                href: hit.href,
                score: hit.score,
              }),
            })
        )
      )
      return change(run, {
        phase: 'retrieved',
        cursor: 'answer',
        hits,
        retrievalMs: event.durationMs,
      })
    }
    case 'generation':
      if (
        !generationEnabled ||
        run.cursor !== 'answer' ||
        run.generated ||
        !run.hits.length
      )
        return invalid()
      return change(run, { phase: 'generating', generated: true })
    case 'answer':
      if (
        run.cursor !== 'answer' ||
        !validAnswer(run, event.answer, generationEnabled)
      )
        return invalid()
      return change(run, {
        phase: 'answered',
        cursor: 'done',
        answer: freezeAnswer(event.answer),
      })
    case 'done':
      if (run.cursor !== 'done') return invalid()
      return change(run, {
        phase: 'done',
        cursor: 'eof',
        completion: 'complete',
        totalMs: event.durationMs,
      })
  }
}

export function presentAssistantRun(run: RunState): PresentationSnapshot {
  const count = run.hits.length as Count // reducer accepts only 0..4; never clamp.
  const inactive =
    run.phase === 'idle' || run.phase === 'cancelled' || run.phase === 'error'
  const result = inactive
    ? 'none'
    : !run.answer
      ? 'pending'
      : run.answer.mode === 'abstained'
        ? 'no-match'
        : 'sources'
  return Object.freeze({
    run,
    count,
    result,
    tray: inactive
      ? 'hidden'
      : count
        ? 'hits'
        : result === 'no-match'
          ? 'empty'
          : 'waiting',
    pose:
      run.phase === 'idle'
        ? 'idle'
        : result === 'no-match'
          ? 'no-match'
          : count
            ? 'sources'
            : 'attention',
  })
}

export const INITIAL_SNAPSHOT = presentAssistantRun(INITIAL_RUN)
