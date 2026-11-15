import type { KnowledgeRecord } from '../knowledge/types'
import type { RetrievalHit } from './types'

export const MAX_QUESTION_CHARS = 600
export const MAX_HITS = 4
export const MAX_PASSAGE_CHARS = 1200
// Drop weak incidental overlap in multi-term questions; not a semantic confidence score.
export const MIN_LEXICAL_SCORE = 1.5
const RECORD_IDENTITY_BOOST = 2
const stop = new Set(
  'a an the is are was were be been what which who how does do did can could would should will has have had of on in at to for and or with about me tell owen owens his he you your please'.split(
    ' '
  )
)

function tokens(text: string): string[] {
  return Array.from(
    new Set(
      (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
        (word) => word.length > 1 && !stop.has(word)
      )
    )
  )
}

function queryTokens(question: string): string[] {
  const normalized = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^please /, '')
  // Expand only complete profile questions. Unrelated or qualified questions
  // retain their original terms rather than receiving a generic biography.
  if (
    /^(?:who is owen(?: cheung)?|tell me about owen(?: cheung)?|what does owen(?: cheung)? do)$/.test(
      normalized
    )
  ) {
    return tokens(
      'background software engineering university student placement'
    )
  }
  if (
    /^(?:(?:where (?:did|does) owen(?: cheung)? study)|(?:what is owens? (?:education|educational background))|(?:tell me about owens? education))$/.test(
      normalized
    )
  ) {
    return tokens('university education computer science student graduation')
  }
  return tokens(question)
}

function mentionsRecord(question: string, record: KnowledgeRecord): boolean {
  const words = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
  const normalized = ` ${words(question)} `
  // Whole slug/title phrases identify a record independently of incidental
  // question words. A named record's sections should survive the threshold
  // even when a short section does not repeat the employer/project name.
  return [record.slug, record.title].some((value) => {
    const identity = words(value)
    return identity.length > 0 && normalized.includes(` ${identity} `)
  })
}

/** Publication is checked here even when callers already supply a public catalogue. */
export function retrieve(
  question: string,
  records: readonly KnowledgeRecord[],
  href: (record: KnowledgeRecord) => string
): RetrievalHit[] {
  const query = queryTokens(question.slice(0, MAX_QUESTION_CHARS))
  if (!query.length) return []
  const hits: RetrievalHit[] = []
  for (const record of records) {
    if (record.publication !== 'published') continue
    const identityBoost = mentionsRecord(
      question.slice(0, MAX_QUESTION_CHARS),
      record
    )
      ? RECORD_IDENTITY_BOOST
      : 0
    const metadata = new Set(tokens([record.title, ...record.tags].join(' ')))
    for (const section of record.sections) {
      // Fixed-size slices have deterministic IDs; no filesystem or hidden content is indexed.
      for (
        let offset = 0;
        offset < section.text.length;
        offset += MAX_PASSAGE_CHARS
      ) {
        const text = section.text.slice(offset, offset + MAX_PASSAGE_CHARS)
        const passage = new Set(tokens(text))
        const heading = new Set(tokens(section.heading))
        const matched = query.filter(
          (word) => passage.has(word) || heading.has(word) || metadata.has(word)
        )
        if (!matched.length) continue
        const score =
          identityBoost +
          query.reduce(
            (sum, word) =>
              sum +
              (passage.has(word) ? 2 : 0) +
              (heading.has(word) ? 3 : 0) +
              (metadata.has(word) ? 2 : 0),
            0
          ) /
            Math.sqrt(query.length)
        hits.push({
          sourceId: record.id,
          chunkId: `${record.id}:${section.id}:${offset / MAX_PASSAGE_CHARS}`,
          title: record.title,
          heading: section.heading,
          text,
          href: `${href(record)}#${section.id}`,
          score: Math.round(score * 1000) / 1000,
        })
      }
    }
  }
  return hits
    .filter((hit) => hit.score >= MIN_LEXICAL_SCORE)
    .sort((a, b) => b.score - a.score || a.chunkId.localeCompare(b.chunkId))
    .slice(0, MAX_HITS)
}
