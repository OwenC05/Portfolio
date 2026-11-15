'use client'

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import type {
  AssistantAnswer,
  AssistantEvent,
  RetrievalHit,
} from '@/lib/assistant/types'
import styles from './assistant.module.css'

type Phase =
  | 'idle'
  | 'requesting'
  | 'retrieving'
  | 'retrieved'
  | 'generating'
  | 'answered'
  | 'done'
  | 'error'
  | 'cancelled'
type AbortReason = 'user' | 'timeout' | 'superseded' | 'unmount'
type StepState = 'pending' | 'active' | 'complete' | 'skipped' | 'stopped'
type Mode = AssistantAnswer['mode']

interface Run {
  phase: Phase
  question: string
  hits: RetrievalHit[]
  retrievalMs?: number
  generated: boolean
  received: boolean
  answer?: AssistantAnswer
  totalMs?: number
  notice?: string
}

const IDLE: Run = {
  phase: 'idle',
  question: '',
  hits: [],
  generated: false,
  received: false,
}
const CONTACT = 'oc608@bath.ac.uk'
const TIMEOUT_MS = 60_000
const BUSY: Phase[] = [
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
]
const MODE_LABEL: Record<Mode, string> = {
  generated: 'generated',
  sources: 'sources only',
  abstained: 'not supported',
}
const MODE_NOTE: Record<Mode, string> = {
  generated:
    'Generated from the retrieved passages. Check each claim against the citations below.',
  sources:
    'These are matching published passages. They do not confirm a premise in your question; check what each source establishes.',
  abstained:
    'Owen’s portfolio sources don’t support an answer to this, so the assistant won’t guess.',
}
const MODE_CLASS: Record<Mode, string> = {
  generated: styles.bannerGenerated,
  sources: styles.bannerSources,
  abstained: styles.bannerAbstained,
}
const STEP_CLASS: Record<StepState, string> = {
  pending: styles.stepPending,
  active: styles.stepActive,
  complete: styles.stepComplete,
  skipped: styles.stepSkipped,
  stopped: styles.stepStopped,
}

const keyOf = (h: { sourceId: string; chunkId: string }) =>
  `${h.sourceId}::${h.chunkId}`
const fmtMs = (n?: number) =>
  n === undefined
    ? ''
    : n < 1000
      ? `${Math.round(n)} ms`
      : `${(n / 1000).toFixed(1)} s`
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`

function parseLine(line: string): AssistantEvent {
  try {
    return JSON.parse(line) as AssistantEvent
  } catch {
    throw new Error('The assistant sent a response this page could not read.')
  }
}

function statusText(run: Run): string {
  switch (run.phase) {
    case 'idle':
      return 'Ready. Ask a question to search Owen’s portfolio sources.'
    case 'requesting':
      return 'Sending your question…'
    case 'retrieving':
      return 'Searching portfolio sources…'
    case 'retrieved':
      return `Retrieved ${plural(run.hits.length, 'passage')} in ${fmtMs(run.retrievalMs)}. Waiting for the answer.`
    case 'generating':
      return 'Writing an answer from the retrieved passages…'
    case 'answered':
      return 'Answer received.'
    case 'done': {
      const head =
        run.totalMs !== undefined
          ? `Finished in ${fmtMs(run.totalMs)}`
          : 'Response received'
      return `${head}${run.answer ? ` · ${MODE_LABEL[run.answer.mode]}` : ''}.${run.notice ? ` ${run.notice}` : ''}`
    }
    case 'error':
      return run.notice ?? 'Something went wrong. Please try again.'
    case 'cancelled':
      return 'Cancelled. Your question is still in the box.'
  }
}

function steps(run: Run) {
  const { phase, answer: a } = run
  const halted = phase === 'error' || phase === 'cancelled'
  const retrieved = run.retrievalMs !== undefined
  const mk = (label: string, state: StepState, detail: string) => {
    const s: StepState = halted && state === 'active' ? 'stopped' : state
    return { label, state: s, detail: s === 'stopped' ? 'stopped' : detail }
  }
  return [
    mk(
      'Question',
      run.received ? 'complete' : phase === 'idle' ? 'pending' : 'active',
      run.received ? 'received' : phase === 'idle' ? 'waiting' : 'sending'
    ),
    mk(
      'Retrieve',
      retrieved ? 'complete' : run.received ? 'active' : 'pending',
      retrieved
        ? `${plural(run.hits.length, 'hit')} · ${fmtMs(run.retrievalMs)}`
        : !run.received
          ? 'waiting'
          : 'searching'
    ),
    mk(
      'Generate',
      run.generated
        ? a
          ? a.mode === 'sources'
            ? 'stopped'
            : 'complete'
          : 'active'
        : a
          ? 'skipped'
          : 'pending',
      run.generated
        ? a?.mode === 'sources'
          ? 'unavailable'
          : (a?.model ?? 'model call')
        : a
          ? 'not used'
          : 'waiting'
    ),
    mk(
      'Answer',
      a ? 'complete' : 'pending',
      a ? MODE_LABEL[a.mode] : 'waiting'
    ),
  ]
}

function Constellation({
  run,
  cited,
  selected,
  onSelect,
}: {
  run: Run
  cited: Set<string>
  selected: string | null
  onSelect: (k: string) => void
}) {
  const titleId = useId()
  const { hits, answer, phase } = run
  const preview = phase === 'idle'
  const max = Math.max(0, ...hits.map((h) => h.score)) || 1
  const slots = preview ? 4 : hits.length
  const pts = Array.from({ length: slots }, (_, i) => {
    const t = slots === 1 ? 0.5 : i / (slots - 1)
    const hit: RetrievalHit | undefined = preview ? undefined : hits[i]
    return {
      hit,
      x: 180 + (i % 2 ? 28 : -28),
      y: 44 + t * 196,
      r: hit ? 6 + (6 * Math.max(0, hit.score)) / max : 7,
    }
  })
  const citedCount = hits.filter((h) => cited.has(keyOf(h))).length
  const title = preview
    ? 'Process preview: a question is matched to retrieved passages, which feed the answer. No sources yet.'
    : `Retrieval map: ${plural(hits.length, 'retrieved passage')}${answer ? `, ${citedCount} cited in the answer` : ''}.`
  const caption = preview
    ? 'preview · passages appear here'
    : phase === 'retrieving'
      ? 'searching…'
      : hits.length
        ? 'retrieved passages'
        : 'no passages matched'

  return (
    <svg
      className={styles.map}
      viewBox="0 0 360 280"
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>{title}</title>
      {pts.map(({ hit, x, y }, i) => {
        const k = hit ? keyOf(hit) : `ghost-${i}`
        const on = k === selected
        const showOut = preview || (answer && cited.has(k))
        return (
          <g key={`e-${k}`}>
            <path
              pathLength={1}
              d={`M34 140 C110 140 ${x - 70} ${y} ${x} ${y}`}
              className={
                preview
                  ? styles.edgeGhost
                  : `${styles.edge} ${on ? styles.edgeOn : ''}`
              }
            />
            {showOut && (
              <path
                pathLength={1}
                d={`M${x} ${y} C${x + 70} ${y} 250 140 326 140`}
                className={
                  preview
                    ? styles.edgeGhost
                    : `${styles.edgeOut} ${on ? styles.edgeOn : ''}`
                }
              />
            )}
          </g>
        )
      })}
      <circle
        cx={34}
        cy={140}
        r={9}
        className={`${styles.hub} ${phase === 'retrieving' ? styles.pulse : ''}`}
      />
      <circle
        cx={326}
        cy={140}
        r={9}
        className={
          answer
            ? answer.mode === 'abstained'
              ? styles.hubAbstained
              : styles.hub
            : `${styles.hubPending} ${phase === 'generating' ? styles.pulse : ''}`
        }
      />
      {pts.map(({ hit, x, y, r }, i) => {
        if (!hit)
          return (
            <circle
              key={`g-${i}`}
              cx={x}
              cy={y}
              r={r}
              className={styles.ghost}
            />
          )
        const k = keyOf(hit)
        return (
          <g key={k} className={styles.nodeGroup} onClick={() => onSelect(k)}>
            <circle cx={x} cy={y} r={r + 9} className={styles.hitArea} />
            <circle
              cx={x}
              cy={y}
              r={r}
              className={`${styles.node} ${cited.has(k) ? styles.nodeCited : ''} ${k === selected ? styles.nodeOn : ''}`}
            />
            <text x={x + r + 5} y={y + 4} className={styles.rank}>
              {i + 1}
            </text>
          </g>
        )
      })}
      <text x={48} y={168} textAnchor="middle" className={styles.mapLabel}>
        question
      </text>
      <text x={312} y={168} textAnchor="middle" className={styles.mapLabel}>
        answer
      </text>
      <text x={180} y={20} textAnchor="middle" className={styles.mapLabel}>
        {caption}
      </text>
    </svg>
  )
}

export default function AssistantWorkbench({
  generationEnabled = false,
}: {
  generationEnabled?: boolean
}) {
  const uid = useId()
  const [question, setQuestion] = useState('')
  const [run, setRun] = useState<Run>(IDLE)
  const [selected, setSelected] = useState<string | null>(null)
  const runId = useRef(0)
  const ctrlRef = useRef<{ c: AbortController; reason?: AbortReason } | null>(
    null
  )

  const stop = useCallback((reason: AbortReason) => {
    const cur = ctrlRef.current
    if (!cur) return
    cur.reason = reason
    cur.c.abort()
    ctrlRef.current = null
  }, [])

  useEffect(
    () => () => {
      runId.current += 1
      stop('unmount')
    },
    [stop]
  )

  const ask = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, 600)
      if (!text) return
      stop('superseded')
      const id = ++runId.current
      const entry: { c: AbortController; reason?: AbortReason } = {
        c: new AbortController(),
      }
      ctrlRef.current = entry
      const timer = window.setTimeout(() => {
        entry.reason = 'timeout'
        entry.c.abort()
      }, TIMEOUT_MS)
      const live = () => id === runId.current
      const patch = (fn: (r: Run) => Run) => {
        if (live()) setRun(fn)
      }
      setSelected(null)
      setRun({ ...IDLE, phase: 'requesting', question: text })
      try {
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: text }),
          signal: entry.c.signal,
        })
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as {
            error?: string
          } | null
          throw new Error(
            body?.error || `The assistant couldn’t answer (HTTP ${res.status}).`
          )
        }
        if (!res.body) throw new Error('The assistant’s response was empty.')
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let finished = false
        const handle = (line: string) => {
          if (!line.trim() || !live()) return
          const ev = parseLine(line)
          if (ev.type === 'retrieval-start') {
            patch((r) => ({ ...r, phase: 'retrieving', received: true }))
          } else if (ev.type === 'retrieval') {
            const { hits, durationMs } = ev
            patch((r) => ({
              ...r,
              phase: 'retrieved',
              hits,
              retrievalMs: durationMs,
            }))
          } else if (ev.type === 'generation') {
            patch((r) => ({ ...r, phase: 'generating', generated: true }))
          } else if (ev.type === 'answer') {
            const { answer } = ev
            patch((r) => ({ ...r, phase: 'answered', answer }))
          } else if (ev.type === 'done') {
            finished = true
            const { durationMs } = ev
            patch((r) =>
              r.answer
                ? { ...r, phase: 'done', totalMs: durationMs }
                : {
                    ...r,
                    phase: 'error',
                    notice: 'The assistant finished without sending an answer.',
                  }
            )
          }
        }
        try {
          for (;;) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            if (buffer.length > 100000)
              throw new Error(
                'The response exceeded the page’s limit. Please try again.'
              )
            let nl: number
            while ((nl = buffer.indexOf('\n')) !== -1) {
              handle(buffer.slice(0, nl))
              buffer = buffer.slice(nl + 1)
            }
          }
          handle(buffer + decoder.decode())
        } finally {
          await reader.cancel().catch(() => {})
          reader.releaseLock()
        }
        if (!finished) {
          patch((r) =>
            r.answer
              ? {
                  ...r,
                  phase: 'done',
                  notice:
                    'The connection closed before the final event; showing what arrived.',
                }
              : {
                  ...r,
                  phase: 'error',
                  notice:
                    'The connection closed before an answer arrived. Please try again.',
                }
          )
        }
      } catch (err) {
        if (
          !live() ||
          entry.reason === 'superseded' ||
          entry.reason === 'unmount'
        )
          return
        const notice =
          entry.reason === 'timeout'
            ? `No complete response after ${TIMEOUT_MS / 1000} s, so the request was stopped. Please try again.`
            : err instanceof TypeError
              ? 'The connection to the assistant failed. Check your connection and try again.'
              : err instanceof Error && err.message
                ? err.message
                : 'Something went wrong. Please try again.'
        setRun((r) => ({
          ...r,
          phase: entry.reason === 'user' ? 'cancelled' : 'error',
          notice,
        }))
      } finally {
        window.clearTimeout(timer)
        if (ctrlRef.current === entry) ctrlRef.current = null
      }
    },
    [stop]
  )

  const busy = BUSY.includes(run.phase)
  const a = run.answer
  const cited = useMemo(
    () => new Set((run.answer?.citations ?? []).map(keyOf)),
    [run.answer]
  )
  const rankOf = useMemo(
    () => new Map(run.hits.map((h, i) => [keyOf(h), i + 1])),
    [run.hits]
  )

  const reveal = (k: string) => {
    const rank = rankOf.get(k)
    if (!rank) return
    setSelected(k)
    requestAnimationFrame(() => {
      const row = document.getElementById(`${uid}-s-${rank}`)
      row?.querySelector('button')?.focus({ preventScroll: true })
      row?.scrollIntoView({ block: 'nearest' })
    })
  }
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void ask(question)
  }
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      void ask(question)
    }
  }

  return (
    <section className={styles.root} aria-labelledby={`${uid}-title`}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Ask the archive · follow the sources</p>
        <h1 id={`${uid}-title`} className={styles.title}>
          Ask about Owen’s work
        </h1>
        <p className={styles.lede}>
          Explore Owen’s experience, projects and interests through published
          sources. Open any passage to check the detail. If the sources don’t
          cover your question, contact Owen directly. Questions aren’t saved by
          this application.
        </p>
        {!generationEnabled && (
          <p className={styles.previewNote}>
            Source-search preview. Generated answers are not enabled in this
            deployment.
          </p>
        )}
      </header>

      <div className={styles.layout}>
        <div className={styles.column}>
          <form className={styles.form} onSubmit={onSubmit}>
            <label htmlFor={`${uid}-q`} className={styles.label}>
              Your question
            </label>
            <textarea
              id={`${uid}-q`}
              className={styles.input}
              rows={3}
              maxLength={600}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onKeyDown}
              aria-describedby={`${uid}-hint`}
              placeholder="Ask about a project, role, paper or interest"
            />
            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.primary}
                disabled={!question.trim()}
              >
                Ask
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => stop('user')}
                disabled={!busy}
              >
                Cancel
              </button>
              <span id={`${uid}-hint`} className={styles.hint}>
                Ctrl / ⌘ + Enter to ask · {question.length}/600
              </span>
            </div>
          </form>

          <div className={styles.examples}>
            <p id={`${uid}-ex`} className={styles.label}>
              Try asking
            </p>
            <ul aria-labelledby={`${uid}-ex`}>
              {EXAMPLES.map((ex) => (
                <li key={ex}>
                  <button
                    type="button"
                    className={styles.example}
                    onClick={() => {
                      setQuestion(ex)
                      void ask(ex)
                    }}
                  >
                    {ex}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <article className={styles.sheet} aria-labelledby={`${uid}-ans`}>
            <h2 id={`${uid}-ans`} className={styles.sheetTitle}>
              {a?.mode === 'sources' || !generationEnabled
                ? 'Results'
                : 'Answer'}
            </h2>
            {run.question && (
              <p className={styles.asked}>
                <span className={styles.meta}>You asked</span>
                {run.question}
              </p>
            )}
            {!a && run.phase === 'idle' && (
              <p className={styles.placeholder}>
                Your answer will appear here, with links to the exact passages
                it draws on.
              </p>
            )}
            {!a && busy && (
              <p className={styles.placeholder}>
                No answer yet. Progress is shown in the panel alongside.
              </p>
            )}
            {(run.phase === 'error' || run.phase === 'cancelled') && (
              <div className={styles.notice}>
                <p>{statusText(run)}</p>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => void ask(run.question)}
                >
                  Try again
                </button>
              </div>
            )}
            {a && (
              <>
                <p className={`${styles.banner} ${MODE_CLASS[a.mode]}`}>
                  <span className={styles.meta}>
                    {MODE_LABEL[a.mode]}
                    {a.model ? ` · ${a.model}` : ''}
                  </span>
                  {MODE_NOTE[a.mode]}
                </p>
                {a.text && a.mode !== 'sources' && (
                  <p className={styles.answerText}>{a.text}</p>
                )}
                {a.mode !== 'generated' && (
                  <p className={styles.contact}>
                    For anything not covered here, email Owen at{' '}
                    <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
                  </p>
                )}
                {a.citations.length > 0 && (
                  <>
                    <h3 className={styles.subTitle}>Cited passages</h3>
                    <ol className={styles.citations}>
                      {a.citations.map((c, i) => {
                        const rank = rankOf.get(keyOf(c))
                        return (
                          <li
                            key={`${keyOf(c)}-${i}`}
                            className={styles.citation}
                          >
                            <blockquote className={styles.quote}>
                              {c.quote}
                            </blockquote>
                            <p className={styles.citeMeta}>
                              <a href={c.href}>{c.title}</a>
                              {rank && (
                                <button
                                  type="button"
                                  className={styles.linkButton}
                                  onClick={() => reveal(keyOf(c))}
                                >
                                  Show passage {rank}
                                </button>
                              )}
                            </p>
                          </li>
                        )
                      })}
                    </ol>
                  </>
                )}
              </>
            )}
          </article>
        </div>

        <section className={styles.panel} aria-labelledby={`${uid}-map`}>
          <h2 id={`${uid}-map`} className={styles.panelTitle}>
            {a?.mode === 'sources' || !generationEnabled
              ? 'How these sources were found'
              : 'How this answer was found'}
          </h2>
          <ol className={styles.pipeline}>
            {steps(run).map((s) => (
              <li
                key={s.label}
                className={`${styles.step} ${STEP_CLASS[s.state]}`}
              >
                <span className={styles.stepLabel}>{s.label}</span>
                <span className={styles.stepDetail}>{s.detail}</span>
              </li>
            ))}
          </ol>
          <p role="status" aria-live="polite" className={styles.status}>
            {statusText(run)}
          </p>

          <Constellation
            run={run}
            cited={cited}
            selected={selected}
            onSelect={(k) => (k === selected ? setSelected(null) : reveal(k))}
          />

          <h3 className={styles.listTitle}>Retrieved sources</h3>
          {run.hits.length > 0 ? (
            <>
              <p className={styles.listNote}>
                Relevance scores rank passages for this question; they aren’t
                probabilities.
              </p>
              <ol className={styles.sourceList}>
                {run.hits.map((h, i) => {
                  const k = keyOf(h)
                  const open = k === selected
                  const pid = `${uid}-p-${i + 1}`
                  return (
                    <li
                      key={k}
                      id={`${uid}-s-${i + 1}`}
                      className={styles.source}
                    >
                      <button
                        type="button"
                        className={styles.sourceButton}
                        aria-expanded={open}
                        aria-controls={pid}
                        onClick={() => setSelected(open ? null : k)}
                      >
                        <span className={styles.rankTag}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className={styles.sourceName}>
                          <span className={styles.sourceTitle}>
                            {h.heading}
                          </span>
                          <span className={styles.sourceHeading}>
                            {h.title}
                          </span>
                        </span>
                        <span className={styles.sourceMeta}>
                          {cited.has(k) && (
                            <span className={styles.citedTag}>cited</span>
                          )}
                          <span>relevance {h.score.toFixed(2)}</span>
                        </span>
                      </button>
                      <div id={pid} className={styles.passage} hidden={!open}>
                        <span className={styles.meta}>
                          Passage {i + 1} · {h.heading} · relevance score{' '}
                          {h.score.toFixed(2)}
                        </span>
                        <p className={styles.passageText}>{h.text}</p>
                        <a className={styles.sourceLink} href={h.href}>
                          Open “{h.title}”
                        </a>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </>
          ) : (
            <p className={styles.empty}>
              {run.phase === 'idle'
                ? 'Sources appear here after a question is searched. Nothing above is a real source yet.'
                : run.phase === 'retrieving'
                  ? 'Searching…'
                  : run.retrievalMs !== undefined
                    ? 'No passages matched this question.'
                    : 'No sources were retrieved.'}
            </p>
          )}
        </section>
      </div>
    </section>
  )
}
