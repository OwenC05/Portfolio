import type { KnowledgeRecord } from '../knowledge/types'
import type { RetrievalHit } from './types'

export const MAX_QUESTION_CHARS = 600
export const MAX_HITS = 4
export const MAX_PASSAGE_CHARS = 1200
// Drop weak incidental overlap in multi-term questions; not a semantic confidence score.
export const MIN_LEXICAL_SCORE = 1.5
const RECORD_IDENTITY_BOOST = 2
const stop = new Set(
  'a an the is are was were be been am what which who how when where why does do did can could would should will has have had of on in at to for and or with about me tell owen owens his he you your please i im my it its they them their this that these those as by than then rather'.split(
    ' '
  )
)

// Small, explicit term families, applied equally to query and source text.
// They broaden lexical navigation, not factual equivalence or answer support.
const termFamilies = [
  ['assistant', 'bot', 'chatbot'],
  ['excerpt', 'extract', 'quotation', 'quote'],
  ['answer', 'reply', 'response'],
  ['customer', 'client'],
  ['education', 'university', 'college'],
  ['boosting', 'lightgbm'],
  ['study', 'studied', 'studying'],
  ['learn', 'learned', 'learning'],
  ['predict', 'predicted', 'predicting', 'prediction'],
  ['graduate', 'graduated', 'graduating', 'graduation'],
  ['work', 'worked', 'working'],
]
const canonicalTerms = new Map(
  termFamilies.flatMap(([canonical, ...forms]) =>
    forms.map((form) => [form, canonical] as const)
  )
)

function normalizeWord(word: string): string {
  // Conservative plurals; avoid turning analysis/status/process into fragments.
  const singular =
    word.endsWith('ies') && word.length > 4
      ? `${word.slice(0, -3)}y`
      : word.endsWith('s') && word.length > 3 && !/(ss|us|is)$/.test(word)
        ? word.slice(0, -1)
        : word
  return canonicalTerms.get(singular) || singular
}

function tokens(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(
      /\b(?:boosted[- ]trees?|gradient[- ]boost(?:ed|ing))\b/g,
      'boosting'
    )
  return Array.from(
    new Set(
      (normalized.match(/[a-z0-9]+/g) || [])
        .filter((word) => word.length > 1 && !stop.has(word))
        .map(normalizeWord)
        .filter((word) => !stop.has(word))
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

interface ScoredPassage {
  hit: RetrievalHit
  directMatches: number
  limitation: boolean
}

const comparePassages = (a: ScoredPassage, b: ScoredPassage) =>
  b.hit.score - a.hit.score || a.hit.chunkId.localeCompare(b.hit.chunkId)

function selectPassages(candidates: ScoredPassage[]): RetrievalHit[] {
  const ranked = candidates.sort(comparePassages)
  const selected = ranked
    .filter(({ hit }) => hit.score >= MIN_LEXICAL_SCORE)
    .slice(0, MAX_HITS)

  // Reserve at most one slot for a directly overlapping limitation from a
  // matched source. Do not attach caveats based on metadata alone, replace the
  // anchor, or evict the only selected passage of another source.
  for (const anchor of selected) {
    if (anchor.limitation || anchor.directMatches < 2) continue
    if (
      selected.some(
        (item) => item.limitation && item.hit.sourceId === anchor.hit.sourceId
      )
    )
      continue
    const context = ranked.find(
      (item) =>
        item.limitation &&
        item.directMatches > 0 &&
        item.hit.sourceId === anchor.hit.sourceId &&
        !selected.includes(item)
    )
    if (!context) continue
    if (selected.length < MAX_HITS) {
      selected.push(context)
    } else {
      let replace = -1
      for (let index = selected.length - 1; index >= 0; index--) {
        const item = selected[index]
        if (
          item !== anchor &&
          selected.some(
            (other) =>
              other !== item && other.hit.sourceId === item.hit.sourceId
          )
        ) {
          replace = index
          break
        }
      }
      if (replace < 0) continue
      selected[replace] = context
    }
    break
  }
  // Context keeps its measured lexical score, even below the standalone-hit
  // threshold. Selection is evidence-aware; final ordering stays score-based.
  return selected.sort(comparePassages).map(({ hit }) => hit)
}

/** Publication is checked here even when callers already supply a public catalogue. */
export function retrieve(
  question: string,
  records: readonly KnowledgeRecord[],
  href: (record: KnowledgeRecord) => string
): RetrievalHit[] {
  const query = queryTokens(question.slice(0, MAX_QUESTION_CHARS))
  if (!query.length) return []
  const hits: ScoredPassage[] = []
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
          hit: {
            sourceId: record.id,
            chunkId: `${record.id}:${section.id}:${offset / MAX_PASSAGE_CHARS}`,
            title: record.title,
            heading: section.heading,
            text,
            href: `${href(record)}#${section.id}`,
            score: Math.round(score * 1000) / 1000,
          },
          directMatches: query.filter(
            (word) => passage.has(word) || heading.has(word)
          ).length,
          limitation: /\b(limit(?:s|ations)?|validation|disclosure)\b/i.test(
            section.heading
          ),
        })
      }
    }
  }
  return selectPassages(hits)
}
