'use client'

import dynamic from 'next/dynamic'
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import {
  projectAnchor,
  projectIdFromHash,
  type ProjectId,
  type SceneStatus,
  type StudioSceneProps,
} from '@/lib/studio-contract'
import styles from '@/app/studio/studio.module.css'

const StudioScene = dynamic<StudioSceneProps>(() => import('./StudioScene'), {
  ssr: false,
  loading: () => null,
})

class SceneErrorBoundary extends Component<
  { children: ReactNode; onUnavailable: () => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onUnavailable()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function hashTarget(hash: string): HTMLElement | null {
  const projectId = projectIdFromHash(hash)
  if (projectId) {
    return document.getElementById(
      `${projectAnchor(projectId).slice(1)}-heading`
    )
  }
  return hash === '#studio' || hash === '#work'
    ? document.getElementById(hash.slice(1))
    : null
}

export default function StudioExperience({
  introduction,
  children,
}: {
  introduction: ReactNode
  children: ReactNode
}) {
  const [selectedProjectId, setSelectedProjectId] = useState<ProjectId | null>(
    null
  )
  const [sceneStatus, setSceneStatus] = useState<SceneStatus>('loading')
  // SSR and the first client render are motionless until the preference is known.
  const [reducedMotion, setReducedMotion] = useState(true)
  const motionPreference = useRef(true)
  const lastAppliedHash = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      motionPreference.current = query.matches
      setReducedMotion(query.matches)
    }
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const applyLocation = useCallback((allowMotion: boolean) => {
    const hash = window.location.hash
    const returningToLanding =
      hash === '' &&
      lastAppliedHash.current !== null &&
      lastAppliedHash.current !== ''
    lastAppliedHash.current = hash
    setSelectedProjectId(projectIdFromHash(hash))
    if (returningToLanding) {
      // Restore keyboard position while leaving native history scroll restoration
      // intact. A fresh bare-route load must not take focus from the visitor.
      document.getElementById('studio')?.focus({ preventScroll: true })
      return
    }
    const target = hashTarget(hash)
    if (!target) return
    target.focus({ preventScroll: true })
    target.scrollIntoView({
      block: 'start',
      // `auto` would inherit the site's global smooth-scroll rule.
      behavior: allowMotion && !motionPreference.current ? 'smooth' : 'instant',
    })
  }, [])

  useEffect(() => {
    let frame: number | null = null
    const synchronize = () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      // Coalesce popstate + hashchange and run after native fragment navigation.
      frame = window.requestAnimationFrame(() => {
        frame = null
        if (lastAppliedHash.current !== window.location.hash)
          applyLocation(false)
      })
    }
    synchronize()
    window.addEventListener('hashchange', synchronize)
    window.addEventListener('popstate', synchronize)
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      window.removeEventListener('hashchange', synchronize)
      window.removeEventListener('popstate', synchronize)
    }
  }, [applyLocation])

  const navigateToHash = useCallback(
    (hash: string) => {
      if (!hashTarget(hash)) return false
      if (window.location.hash !== hash) {
        // Preserve Next's current history metadata and avoid identical entries.
        window.history.pushState(window.history.state, '', hash)
      }
      applyLocation(true)
      return true
    },
    [applyLocation]
  )

  const selectProject = useCallback(
    (id: ProjectId) => {
      navigateToHash(projectAnchor(id))
    },
    [navigateToHash]
  )

  const enhanceAnchor = (event: MouseEvent<HTMLDivElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return

    const anchor =
      event.target instanceof Element ? event.target.closest('a[href]') : null
    if (
      !(anchor instanceof HTMLAnchorElement) ||
      !event.currentTarget.contains(anchor) ||
      anchor.hasAttribute('download') ||
      (anchor.target && anchor.target.toLowerCase() !== '_self')
    )
      return

    const destination = new URL(anchor.href)
    if (
      destination.origin !== window.location.origin ||
      destination.pathname !== window.location.pathname ||
      destination.search !== window.location.search
    )
      return

    if (navigateToHash(destination.hash)) event.preventDefault()
  }

  const markUnavailable = useCallback(() => setSceneStatus('unavailable'), [])

  return (
    <div
      className={styles.studioPage}
      data-selected-project={selectedProjectId ?? undefined}
      onClick={enhanceAnchor}
    >
      <a className={styles.skipLink} href="#work">
        Skip to selected work
      </a>
      <section
        id="studio"
        className={styles.studioLanding}
        tabIndex={-1}
        aria-labelledby="studio-title"
      >
        {introduction}
        <figure className={styles.sceneFrame}>
          <div className={styles.sceneViewport} data-scene-status={sceneStatus}>
            <div
              className={styles.sceneFallback}
              hidden={sceneStatus === 'ready'}
            >
              <span className={styles.fallbackLabel}>
                The studio / a still sketch
              </span>
              <div className={styles.fallbackDrawing} aria-hidden="true">
                <span className={styles.sketchLight} />
                <span className={styles.sketchMonitor} />
                <span className={styles.sketchPortrait} />
                <span className={styles.sketchDesk} />
                <span className={styles.sketchKeys} />
              </div>
              <div className={styles.fallbackContent}>
                <p>
                  Built here.
                  <br />
                  <em>Explained below.</em>
                </p>
                <span>Find every project and its evidence below.</span>
              </div>
            </div>
            <div className={styles.sceneLayer} aria-hidden="true">
              <SceneErrorBoundary onUnavailable={markUnavailable}>
                <StudioScene
                  selectedProjectId={selectedProjectId}
                  reducedMotion={reducedMotion}
                  onSelectProject={selectProject}
                  onStatusChange={setSceneStatus}
                />
              </SceneErrorBoundary>
            </div>
          </div>
          <figcaption className={styles.sceneCaption}>
            <span>After hours</span>
            <p role="status" aria-live="polite">
              {sceneStatus === 'ready'
                ? 'Select a screen in the studio, or follow a project link.'
                : sceneStatus === 'unavailable'
                  ? 'The studio is unavailable. Reload to try again, or read every project below.'
                  : 'A still sketch of the studio. Every project is available below.'}
            </p>
          </figcaption>
        </figure>
      </section>
      {children}
    </div>
  )
}
