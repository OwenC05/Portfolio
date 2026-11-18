'use client'

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type Ref,
} from 'react'
import type {
  AssistantActions,
  HitKey,
  Phase,
  PresentationSnapshot,
  RunState,
} from '@/lib/assistant/run-state'
import { studioProfile } from '@/lib/studio-content'
import styles from './assistant.module.css'

export interface StudioAssistantPanelProps {
  /** The one current snapshot root also hands to the scene. */
  snapshot: PresentationSnapshot
  /** The four actions of root's single mounted run. */
  actions: AssistantActions
  /** Root owns the draft so it survives closing and reopening the sheet. */
  draft: string
  setDraft: (value: string) => void
  /** Id for the heading; root passes the same id to StudioShell's dialogTitleId. */
  headingId: string
  /** Root focuses this heading when the sheet opens. */
  headingRef?: Ref<HTMLHeadingElement>
}

export const ASSISTANT_DRAFT_LIMIT = 600

const BUSY: readonly Phase[] = [
  'requesting',
  'retrieving',
  'retrieved',
  'generating',
  'answered',
]
const EXAMPLES = [
  'What has Owen worked on at LexisNexis?',
  'How was TypeForge evaluated?',
  'What does Owen do outside work?',
] as const
const MODE_LABEL = {
  generated: 'generated',
  sources: 'sources only',
  abstained: 'not supported',
} as const
const SOURCES_NOTE =
  'These are matching published passages. They do not confirm a premise in your question; check what each source establishes.'
const NO_MATCH_NOTE =
  'Owen’s portfolio sources don’t support an answer to this, so the assistant won’t guess.'

const MAILTO = 'mailto:'
const contactLink = studioProfile.links.find(
  (link) => link.href.slice(0, MAILTO.length) === MAILTO
)

const fmtMs = (n?: number) =>
  n === undefined
    ? ''
    : n < 1000
      ? `${Math.round(n)} ms`
      : `${(n / 1000).toFixed(1)} s`
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
const pad = (n: number) => String(n).padStart(2, '0')

/** Text for the single polite status region. Errors use the alert instead. */
function statusText(run: RunState): string {
  switch (run.phase) {
    case 'idle':
      return 'Ready. Ask a question to search Owen’s portfolio sources.'
    case 'requesting':
      return 'Sending your question…'
    case 'retrieving':
      return 'Searching portfolio sources…'
    case 'retrieved':
    case 'generating':
    case 'answered': {
      const timing =
        run.retrievalMs === undefined ? '' : ` in ${fmtMs(run.retrievalMs)}`
      return `Retrieved ${plural(run.hits.length, 'passage')}${timing}. Waiting for the response to finish.`
    }
    case 'done': {
      const head =
        run.totalMs === undefined
          ? 'Response received'
          : `Finished in ${fmtMs(run.totalMs)}`
      const mode = run.answer ? ` · ${MODE_LABEL[run.answer.mode]}` : ''
      return `${head}${mode}.${run.notice ? ` ${run.notice}` : ''}`
    }
    case 'cancelled':
      return 'Cancelled. Your question is still in the box.'
    case 'error':
      return ''
  }
}

/**
 * Controlled view of root's one assistant run, rendered inside StudioShell's
 * existing dialog. It owns no request, timer or store: every result on screen
 * is read from `snapshot`, and every change goes through `actions`.
 */
export default function StudioAssistantPanel({
  snapshot,
  actions,
  draft,
  setDraft,
  headingId,
  headingRef,
}: StudioAssistantPanelProps) {
  const uid = useId()
  const searchRef = useRef<HTMLButtonElement>(null)
  const { run, result } = snapshot
  const selected = run.selectedKey
  const busy = BUSY.indexOf(run.phase) !== -1
  const canSubmit = draft.trim().length > 0
  const failed = run.phase === 'error'
  const rowId = (rank: number) => `${uid}-row-${rank}`
  const passageId = (rank: number) => `${uid}-passage-${rank}`
  const toggleId = (rank: number) => `${uid}-toggle-${rank}`
  const chipId = (rank: number) => `${uid}-chip-${rank}`

  // A chip asks for focus on its row. The request names the run, key and the
  // revision that selection will produce, so a superseded, closed or reordered
  // run can never receive it. It is consumed in the commit that shows the row.
  const [focusRequest, setFocusRequest] = useState<{
    runId: string
    key: HitKey
    revision: number
  } | null>(null)

  useLayoutEffect(() => {
    if (!focusRequest) return
    setFocusRequest(null)
    if (
      run.runId !== focusRequest.runId ||
      run.revision !== focusRequest.revision ||
      run.selectedKey !== focusRequest.key
    )
      return
    let rank: number | null = null
    for (const view of run.hits)
      if (view.key === focusRequest.key) rank = view.rank
    if (rank === null) return
    const row = document.getElementById(`${uid}-row-${rank}`)
    if (
      !row ||
      row.dataset.runId !== run.runId ||
      row.dataset.hitKey !== focusRequest.key
    )
      return
    document
      .getElementById(`${uid}-toggle-${rank}`)
      ?.focus({ preventScroll: true })
    row.scrollIntoView({ block: 'nearest' })
  }, [focusRequest, run, uid])

  const submit = (question: string) => {
    if (!question.trim()) return
    actions.submit(question)
  }
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submit(draft)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Plain Enter stays a new line; only the modified chord submits.
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      submit(draft)
    }
  }
  const onCancel = () => {
    if (!busy) return
    actions.cancel()
    // The visitor's own cancellation is the one moment focus is moved.
    searchRef.current?.focus({ preventScroll: true })
  }
  const onExample = (example: string) => {
    setDraft(example)
    // The examples leave the page while a run is shown; keep focus on a
    // control that stays.
    searchRef.current?.focus({ preventScroll: true })
    actions.submit(example)
  }
  const toggle = (key: HitKey) => {
    if (!run.runId) return
    actions.select(run.runId, selected === key ? null : key)
  }
  const onChip = (key: HitKey) => {
    if (!run.runId) return
    if (selected === key) {
      actions.select(run.runId, null)
      return
    }
    setFocusRequest({ runId: run.runId, key, revision: run.revision + 1 })
    actions.select(run.runId, key)
  }
  // Left and right arrows move focus along the current chips, wrapping at the
  // ends. They never select, expand or submit. Focus moves inside the key
  // event itself, so nothing is left pending for a later run to receive; the
  // target must still be this run's chip for that hit.
  const onChipKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    key: HitKey
  ) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const count = run.hits.length
    let index = -1
    for (let i = 0; i < count; i++) if (run.hits[i].key === key) index = i
    if (!run.runId || index === -1) return
    event.preventDefault()
    const step = event.key === 'ArrowRight' ? 1 : -1
    const target = run.hits[(index + step + count) % count]
    if (target.key === key) return
    const chip = document.getElementById(chipId(target.rank))
    if (
      !chip ||
      chip.dataset.runId !== run.runId ||
      chip.dataset.hitKey !== target.key
    )
      return
    chip.focus()
  }

  const showExamples = !busy && run.hits.length === 0 && !run.answer
  // True only while the box still holds the searched question. Narrow screens
  // then hide the visual repeat; once the draft is edited it shows again, so
  // the results on screen keep the question they were found for.
  const askedRepeatsDraft = run.question.trim() === draft.trim()
  const hintId = `${uid}-hint`

  return (
    <div className={styles.sheet} data-assistant-result={result}>
      <h2
        id={headingId}
        ref={headingRef}
        className={styles.heading}
        tabIndex={-1}
      >
        Ask about Owen’s work
      </h2>
      <p className={styles.scope}>
        <span className={styles.scopeLong}>
          This searches Owen’s published portfolio sources and shows the
          matching passages. It does not write an answer.
        </span>
        <span className={styles.scopeShort}>
          Source search only. No generated answers.
        </span>
      </p>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <label className={styles.label} htmlFor={`${uid}-question`}>
          Your question
        </label>
        <textarea
          id={`${uid}-question`}
          className={styles.question}
          value={draft}
          onChange={(event) =>
            setDraft(event.target.value.slice(0, ASSISTANT_DRAFT_LIMIT))
          }
          onKeyDown={onKeyDown}
          rows={3}
          maxLength={ASSISTANT_DRAFT_LIMIT}
          placeholder="Ask about a project, role, paper or interest"
          aria-describedby={hintId}
        />
        <div className={styles.actions}>
          {/* Neither button is ever disabled or removed, so focus cannot fall
              out of the sheet; aria-disabled is enforced in the handlers. */}
          <button
            ref={searchRef}
            type="submit"
            className={styles.primary}
            aria-disabled={!canSubmit}
          >
            {failed ? 'Try again' : 'Search sources'}
          </button>
          <button
            type="button"
            className={styles.secondary}
            aria-disabled={!busy}
            onClick={onCancel}
          >
            Cancel
          </button>
          <p id={hintId} className={styles.hint}>
            <span className={styles.hintKeys}>Ctrl or Cmd + Enter · </span>
            {draft.length}/{ASSISTANT_DRAFT_LIMIT}
          </p>
        </div>
      </form>

      <p className={styles.status} role="status" aria-live="polite">
        {statusText(run)}
      </p>

      {failed && (
        <div className={styles.error} role="alert">
          <p className={styles.errorText}>
            {run.notice ?? 'Something went wrong. Please try again.'}
          </p>
          <p className={styles.errorNote}>
            Nothing is shown from the earlier search.
          </p>
        </div>
      )}

      {showExamples && (
        <div className={styles.examples}>
          <p id={`${uid}-examples`} className={styles.label}>
            Try asking
          </p>
          <ul aria-labelledby={`${uid}-examples`}>
            {EXAMPLES.map((example) => (
              <li key={example}>
                <button
                  type="button"
                  className={styles.example}
                  onClick={() => onExample(example)}
                >
                  {example}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {run.question && run.phase !== 'idle' && (
        <p className={styles.asked} data-repeats-draft={askedRepeatsDraft}>
          <span className={styles.label}>You asked</span>
          {run.question}
        </p>
      )}

      {result === 'no-match' && (
        <div className={styles.note}>
          <p className={styles.label}>No matching sources</p>
          <p>{NO_MATCH_NOTE}</p>
        </div>
      )}

      {run.hits.length > 0 && (
        <section className={styles.results} aria-labelledby={`${uid}-sources`}>
          <div className={styles.chipRow}>
            <h3 id={`${uid}-sources`} className={styles.label}>
              Sources
            </h3>
            <ul className={styles.chips}>
              {run.hits.map((view) => (
                <li key={view.key}>
                  <button
                    id={chipId(view.rank)}
                    type="button"
                    className={styles.chip}
                    data-run-id={run.runId ?? undefined}
                    data-hit-key={view.key}
                    aria-pressed={view.key === selected}
                    aria-controls={rowId(view.rank)}
                    aria-label={`Source ${view.rank}: ${view.hit.title}`}
                    onClick={() => onChip(view.key)}
                    onKeyDown={(event) => onChipKeyDown(event, view.key)}
                  >
                    {view.rank}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {result === 'sources' && (
            <p className={styles.note}>{SOURCES_NOTE}</p>
          )}

          <ol className={styles.rows}>
            {run.hits.map((view) => {
              const open = view.key === selected
              return (
                <li
                  key={view.key}
                  id={rowId(view.rank)}
                  className={styles.row}
                  data-run-id={run.runId ?? undefined}
                  data-hit-key={view.key}
                  data-selected={open}
                >
                  <span className={styles.rank} aria-hidden="true">
                    {pad(view.rank)}
                  </span>
                  <div className={styles.rowBody}>
                    <a className={styles.sourceLink} href={view.hit.href}>
                      {view.hit.title}
                    </a>
                    {view.hit.heading &&
                      view.hit.heading !== view.hit.title && (
                        <p className={styles.sourceHeading}>
                          {view.hit.heading}
                        </p>
                      )}
                    {/* The whole passage is always in the document. Closed
                        rows only clamp it visually to three lines. */}
                    <p
                      id={passageId(view.rank)}
                      className={styles.passage}
                      data-open={open}
                    >
                      {view.hit.text}
                    </p>
                    <button
                      id={toggleId(view.rank)}
                      type="button"
                      className={styles.toggle}
                      aria-expanded={open}
                      aria-controls={passageId(view.rank)}
                      onClick={() => toggle(view.key)}
                    >
                      {open ? 'Hide' : 'Show'} passage {view.rank}
                    </button>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {(result === 'sources' || result === 'no-match') && contactLink && (
        <p className={styles.contact}>
          For anything not covered here,{' '}
          <a href={contactLink.href}>
            email Owen at {contactLink.href.slice(MAILTO.length)}
          </a>
          .
        </p>
      )}
    </div>
  )
}
