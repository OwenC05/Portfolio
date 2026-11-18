import { parseAssistantEvent } from './events'
import {
  INITIAL_SNAPSHOT,
  presentAssistantRun,
  reduceAssistantRun,
  type AssistantActions,
  type FailureKind,
  type PresentationSnapshot,
  type RunAction,
} from './run-state'

export const ASSISTANT_TIMEOUT_MS = 60_000
const PENDING_BUFFER_LIMIT = 100000

interface RequestEntry {
  readonly id: string
  readonly controller: AbortController
  timer?: ReturnType<typeof setTimeout>
  reader?: ReadableStreamDefaultReader<Uint8Array>
  cancellation?: Promise<void>
}

/** One local owner per mounted hook; never shared between page surfaces. */
export function createAssistantRunOwner(options: {
  onChange(snapshot: PresentationSnapshot): void
  generationEnabled?: boolean
  fetcher?: typeof fetch
}) {
  const prefix = globalThis.crypto.randomUUID()
  let ordinal = 0
  let disposed = false
  let active: RequestEntry | null = null
  let snapshot = INITIAL_SNAPSHOT

  const live = (entry: RequestEntry) =>
    !disposed && active === entry && snapshot.run.runId === entry.id

  function detach() {
    const entry = active
    active = null // Invalidate synchronously, before abort or notifications.
    if (entry) clearTimeout(entry.timer)
    return entry
  }

  function cancelReader(entry: RequestEntry) {
    if (entry.reader && !entry.cancellation) {
      // A cancellation failure must not prevent releasing the acquired lock.
      entry.cancellation = entry.reader.cancel().catch(() => {})
    }
    return entry.cancellation
  }

  function abort(entry: RequestEntry | null) {
    if (!entry) return
    entry.controller.abort()
    void cancelReader(entry)
  }

  function apply(action: RunAction) {
    if (disposed) return
    const run = reduceAssistantRun(
      snapshot.run,
      action,
      options.generationEnabled
    )
    if (run === snapshot.run) return
    const failed = run.phase === 'error' ? detach() : null
    snapshot = presentAssistantRun(run)
    options.onChange(snapshot)
    abort(failed)
  }

  function fail(entry: RequestEntry, failure: FailureKind, notice: string) {
    if (live(entry)) apply({ type: 'fail', runId: entry.id, failure, notice })
  }

  async function request(entry: RequestEntry, question: string) {
    try {
      const response = await (options.fetcher ?? fetch)('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        signal: entry.controller.signal,
      })
      if (!live(entry)) {
        await response.body?.cancel().catch(() => {})
        return
      }
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null)
        const message =
          body !== null &&
          typeof body === 'object' &&
          'error' in body &&
          typeof body.error === 'string' &&
          body.error
        fail(
          entry,
          'http',
          message || `The assistant couldn’t answer (HTTP ${response.status}).`
        )
        return
      }
      if (!response.body) {
        fail(entry, 'protocol', 'The assistant’s response was empty.')
        return
      }
      const reader = response.body.getReader()
      entry.reader = reader
      const decoder = new TextDecoder()
      let buffer = ''
      const handle = (line: string) => {
        if (!live(entry) || !line.trim()) return
        try {
          apply({
            type: 'event',
            runId: entry.id,
            event: parseAssistantEvent(line),
          })
        } catch (error) {
          fail(
            entry,
            'protocol',
            error instanceof Error
              ? error.message
              : 'The assistant sent a response this page could not read.'
          )
        }
      }
      while (live(entry)) {
        const { value, done } = await reader.read()
        if (!live(entry)) return
        if (done) {
          handle(buffer + decoder.decode())
          if (live(entry)) {
            apply({ type: 'eof', runId: entry.id })
            if (live(entry)) detach()
          }
          return
        }
        buffer += decoder.decode(value, { stream: true })
        // Preserve the Workbench pending-buffer guard, not a total-byte cap.
        if (buffer.length > PENDING_BUFFER_LIMIT) {
          fail(
            entry,
            'protocol',
            'The response exceeded the page’s limit. Please try again.'
          )
          return
        }
        let newline: number
        while (live(entry) && (newline = buffer.indexOf('\n')) !== -1) {
          handle(buffer.slice(0, newline))
          buffer = buffer.slice(newline + 1)
        }
      }
    } catch (error) {
      fail(
        entry,
        'network',
        error instanceof TypeError
          ? 'The connection to the assistant failed. Check your connection and try again.'
          : error instanceof Error && error.message
            ? error.message
            : 'Something went wrong. Please try again.'
      )
    } finally {
      clearTimeout(entry.timer)
      if (active === entry) detach()
      if (entry.reader) {
        try {
          await cancelReader(entry)
        } finally {
          entry.reader.releaseLock()
        }
      }
    }
  }

  const actions: AssistantActions = Object.freeze({
    submit(raw: string) {
      const question = raw.trim().slice(0, 600)
      if (disposed || !question) return
      const previous = detach()
      const entry: RequestEntry = {
        id: `${prefix}:${++ordinal}`,
        controller: new AbortController(),
      }
      active = entry
      entry.timer = setTimeout(() => {
        fail(
          entry,
          'timeout',
          `No complete response after ${ASSISTANT_TIMEOUT_MS / 1000} s, so the request was stopped. Please try again.`
        )
      }, ASSISTANT_TIMEOUT_MS)
      // Keep the existing wire normalization. The server trims once more after
      // the cap, which can expose trailing whitespace in programmatic input.
      apply({ type: 'submit', runId: entry.id, question: question.trim() })
      abort(previous)
      if (live(entry)) void request(entry, question)
    },
    cancel() {
      if (disposed) return
      const previous = detach()
      if (snapshot.run.runId)
        apply({ type: 'cancel', runId: snapshot.run.runId })
      abort(previous)
    },
    close() {
      if (disposed) return
      const previous = detach()
      apply({ type: 'close' })
      abort(previous)
    },
    select(runId: string, key: string | null) {
      apply({ type: 'select', runId, key })
    },
  })

  return {
    actions,
    getSnapshot: () => snapshot,
    dispose() {
      const previous = detach()
      disposed = true
      snapshot = INITIAL_SNAPSHOT
      abort(previous) // Cleanup only: no React/scene notification after unmount.
    },
  }
}
