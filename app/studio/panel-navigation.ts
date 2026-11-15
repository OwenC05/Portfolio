import {
  projectAnchor,
  projectIdFromHash,
  type ProjectId,
} from '@/lib/studio-contract'

const ENTRY_KEY = '__studioPanelEntry'

type HistoryPort = Pick<
  History,
  'state' | 'pushState' | 'replaceState' | 'back' | 'scrollRestoration'
>
type LocationPort = Pick<Location, 'href'>
type OwnedEntry = { url: string; base: string }

/** Only this mounted experience can prove ownership; serialized state alone cannot. */
export function createPanelNavigation(
  history: HistoryPort,
  location: LocationPort
) {
  const previousRestoration = history.scrollRestoration
  const owned = new Map<string, OwnedEntry>()
  const session =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}:${Math.random()}`
  let sequence = 0
  let closing = false
  let pendingProject: ProjectId | null = null
  const currentUrl = () => new URL(location.href)
  const synchronizeRestoration = () => {
    // Restoration belongs to the active entry, not the whole mounted page.
    // A panel can save a fixed body's zero scroll offset; do not replay that
    // offset on Forward. Ordinary section entries retain native restoration.
    history.scrollRestoration = projectIdFromHash(currentUrl().hash)
      ? 'manual'
      : 'auto'
  }
  const entryToken = () => {
    const state: unknown = history.state
    return state && typeof state === 'object' && ENTRY_KEY in state
      ? (state as Record<string, unknown>)[ENTRY_KEY]
      : null
  }
  const currentEntry = () => {
    const token = entryToken()
    const entry = typeof token === 'string' ? owned.get(token) : undefined
    return entry?.url === location.href ? entry : undefined
  }
  const sameDocument = (a: URL, b: URL) =>
    a.origin === b.origin && a.pathname === b.pathname && a.search === b.search

  const open = (id: ProjectId) => {
    // A rapid reopen still renders immediately; finish its URL update after the
    // already-requested Back traversal, rather than overwriting that destination.
    if (closing) {
      pendingProject = id
      return
    }
    const url = currentUrl()
    const previousProject = projectIdFromHash(url.hash)
    const hash = projectAnchor(id)
    if (url.hash === hash) {
      synchronizeRestoration()
      return
    }
    const entry = currentEntry()
    url.hash = hash
    if (previousProject) {
      history.replaceState(history.state, '', url.href)
      if (entry) entry.url = url.href
      synchronizeRestoration()
      return
    }
    const token = `${session}:${++sequence}`
    const base = location.href
    // Next's routing metadata and unrelated consumers' fields survive intact.
    history.pushState({ ...history.state, [ENTRY_KEY]: token }, '', url.href)
    owned.set(token, { url: url.href, base })
    // Set manual only after push, leaving the ordinary base entry untouched.
    synchronizeRestoration()
  }

  return {
    open,
    read() {
      closing = false
      if (pendingProject) {
        const id = pendingProject
        pendingProject = null
        open(id)
      }
      synchronizeRestoration()
      return projectIdFromHash(currentUrl().hash)
    },
    close() {
      if (closing) {
        pendingProject = null
        return
      }
      const url = currentUrl()
      if (!projectIdFromHash(url.hash)) return
      const entry = currentEntry()
      const base = entry ? new URL(entry.base) : null
      if (base && sameDocument(url, base) && !projectIdFromHash(base.hash)) {
        closing = true
        history.back()
      } else {
        url.hash = '#studio'
        history.replaceState(history.state, '', url.href)
        synchronizeRestoration()
      }
    },
    dispose() {
      history.scrollRestoration = previousRestoration
    },
  }
}
