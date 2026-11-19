import type { KnowledgeRecord } from '../knowledge/types'
import {
  generate,
  generationConfig,
  generationUnavailableReason,
  sourcesAnswer,
} from './generation'
import { MAX_QUESTION_CHARS, retrieve } from './retrieval'
import type { AssistantEvent } from './types'

export const MAX_BODY_BYTES = 4096
const WINDOW_MS = 60000
const MAX_REQUESTS = 12
const MAX_CLIENTS = 512

function hasSameOrigin(request: Request): boolean {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    const source = new URL(origin)
    const requestUrl = new URL(request.url)
    if (
      !['http:', 'https:'].includes(source.protocol) ||
      !['http:', 'https:'].includes(requestUrl.protocol) ||
      source.origin !== origin
    )
      return false
    // Next may reconstruct the URL with an internal hostname. Host carries the
    // public authority and browsers cannot override it. Keep the request URL's
    // scheme; arbitrary forwarded host/protocol headers are not trusted here.
    const authority = request.headers.get('host') ?? requestUrl.host
    if (!authority || /[\/\\?#@\s,]/.test(authority)) return false
    const target = new URL(`${requestUrl.protocol}//${authority}`)
    return target.origin === source.origin
  } catch {
    return false
  }
}

/** Per-process best effort only; not a distributed serverless quota or spend cap. */
export function createThrottle() {
  const clients = new Map<string, { count: number; expires: number }>()
  return (key: string, now = Date.now()): boolean => {
    clients.forEach((value, id) => {
      if (value.expires <= now) clients.delete(id)
    })
    const entry = clients.get(key)
    if (entry) {
      entry.count++
      return entry.count <= MAX_REQUESTS
    }
    if (clients.size >= MAX_CLIENTS) return false
    clients.set(key, { count: 1, expires: now + WINDOW_MS })
    return true
  }
}

async function readQuestion(request: Request): Promise<string> {
  if (
    !request.headers
      .get('content-type')
      ?.toLowerCase()
      .startsWith('application/json')
  )
    throw new Error('415')
  const length = Number(request.headers.get('content-length'))
  if (length > MAX_BODY_BYTES) throw new Error('413')
  if (!request.body) throw new Error('400')
  const reader = request.body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let bytes = 0
  let body = ''
  try {
    while (true) {
      const part = await reader.read()
      if (part.done) break
      bytes += part.value.byteLength
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel()
        throw new Error('413')
      }
      body += decoder.decode(part.value, { stream: true })
    }
    body += decoder.decode()
  } finally {
    reader.releaseLock()
  }
  const data = JSON.parse(body)
  if (
    !data ||
    typeof data.question !== 'string' ||
    Object.keys(data).length !== 1
  )
    throw new Error('400')
  const question = data.question.trim()
  if (
    !question ||
    question.length > MAX_QUESTION_CHARS ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(question)
  )
    throw new Error('400')
  return question
}

export function createAssistantHandler(options: {
  records: readonly KnowledgeRecord[]
  href: (record: KnowledgeRecord) => string
  env?: NodeJS.ProcessEnv
  fetcher?: typeof fetch
}) {
  const throttle = createThrottle()
  return async (request: Request): Promise<Response> => {
    const error = (status: number, message: string) =>
      Response.json(
        { error: message },
        { status, headers: { 'Cache-Control': 'no-store' } }
      )
    // Browser callers must supply their origin. This is not authentication.
    if (!hasSameOrigin(request))
      return error(403, 'Use the assistant from this website.')
    const env = options.env || process.env
    // Trust a proxy-provided client key only in the Vercel runtime, never an arbitrary local header.
    const key =
      env.VERCEL === '1'
        ? (request.headers.get('x-vercel-forwarded-for') || 'shared').slice(
            0,
            128
          )
        : 'local'
    if (!throttle(key))
      return error(429, 'Too many requests. Please try again in a minute.')
    let question: string
    try {
      question = await readQuestion(request)
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : ''
      return error(
        code === '413' ? 413 : code === '415' ? 415 : 400,
        'Send one question of 1–600 characters as JSON (maximum 4096 bytes).'
      )
    }
    const controller = new AbortController()
    const abort = () => controller.abort()
    request.signal.addEventListener('abort', abort, { once: true })
    if (request.signal.aborted) abort()
    const started = Date.now()
    let cancelled = false
    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(output) {
        const send = (event: AssistantEvent) => {
          if (!controller.signal.aborted)
            output.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
        }
        try {
          if (controller.signal.aborted) return
          send({ type: 'retrieval-start', question })
          const retrievalStarted = Date.now()
          const hits = retrieve(question, options.records, options.href)
          send({
            type: 'retrieval',
            hits,
            durationMs: Date.now() - retrievalStarted,
          })
          const config = generationConfig(request, env)
          let answer = sourcesAnswer(
            hits,
            generationUnavailableReason(request, env)
          )
          if (config && hits.length && !controller.signal.aborted) {
            send({ type: 'generation' })
            answer = await generate(
              question,
              hits,
              config,
              controller.signal,
              options.fetcher
            )
          }
          send({ type: 'answer', answer })
          send({ type: 'done', durationMs: Date.now() - started })
        } finally {
          request.signal.removeEventListener('abort', abort)
          if (!cancelled) output.close()
        }
      },
      cancel() {
        cancelled = true
        controller.abort()
        request.signal.removeEventListener('abort', abort)
      },
    })
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-store, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }
}
