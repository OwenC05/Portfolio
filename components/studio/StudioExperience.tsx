'use client'

import dynamic from 'next/dynamic'
import {
  Component,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactEventHandler,
  type ReactNode,
} from 'react'
import StudioShell from '@/app/studio/StudioShell'
import { createPanelNavigation } from '@/app/studio/panel-navigation'
import { lockPanelScroll } from '@/app/studio/panel-scroll'
import { studioProjects } from '@/lib/studio-content'
import {
  projectAnchor,
  projectIdFromHash,
  type ProjectId,
  type SceneStatus,
  type StudioSceneProps,
  type StudioViewAction,
  type StudioViewCommand,
} from '@/lib/studio-contract'
import ProjectEvidence from './ProjectEvidence'

const StudioScene = dynamic<StudioSceneProps>(() => import('./StudioScene'), {
  ssr: false,
  loading: () => null,
})
const useCommitEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect
const LOOK_KEYS: Readonly<Record<string, StudioViewAction>> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  Home: 'reset',
}

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

export default function StudioExperience({
  evidence,
  children,
}: {
  evidence: ReactNode
  children: ReactNode
}) {
  const [enhanced, setEnhanced] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<ProjectId | null>(
    null
  )
  const [sceneStatus, setSceneStatus] = useState<SceneStatus>('loading')
  const [reducedMotion, setReducedMotion] = useState(true)
  const [viewCommand, setViewCommand] = useState<StudioViewCommand | null>(null)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const projectsToggleRef = useRef<HTMLButtonElement>(null)
  const panelScrollRef = useRef<HTMLDivElement>(null)
  const navigation = useRef<ReturnType<typeof createPanelNavigation> | null>(
    null
  )
  const returnTarget = useRef<HTMLElement | null>(null)
  const returnProject = useRef<ProjectId | null>(null)
  const focusedProject = useRef<ProjectId | null>(null)
  const fallbackProject = useRef<ProjectId | null>(null)
  const enhancementFailed = useRef(false)
  const releaseScroll = useRef<(() => void) | null>(null)
  const stopNavigation = useRef<(() => void) | null>(null)
  const sequence = useRef(0)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', update)
      return () => query.removeEventListener('change', update)
    }
    query.addListener(update)
    return () => query.removeListener(update)
  }, [])

  useCommitEffect(() => {
    const dialog = dialogRef.current
    if (
      !dialog ||
      typeof dialog.showModal !== 'function' ||
      typeof dialog.close !== 'function'
    )
      return
    // This object intentionally lasts only for this mount, including StrictMode
    // effect replays. A fresh page never trusts history's serialized ownership.
    navigation.current ??= createPanelNavigation(
      window.history,
      window.location
    )
    const synchronize = () => {
      if (enhancementFailed.current) return
      const id = navigation.current!.read()
      if (id) {
        returnProject.current = id
        returnTarget.current = document.getElementById(`studio-shortcut-${id}`)
      } else {
        // Unlock during the history event, before native restoration. React's
        // later commit must not overwrite a different section's saved position
        // when a traversal skips the panel's original base entry.
        releaseScroll.current?.()
        releaseScroll.current = null
      }
      setSelectedProjectId(id)
    }
    // Navigation scopes manual restoration to project entries; ordinary
    // About/Contact entries keep the browser's saved positions.
    // Before hydration a fresh fragment may have scrolled to the SSR article.
    // Once that article becomes a modal, retain the room as its background.
    if (projectIdFromHash(window.location.hash)) {
      const studio = document.getElementById('studio')
      if (studio) {
        window.scrollTo({
          left: window.scrollX,
          top: studio.getBoundingClientRect().top + window.scrollY,
          behavior: 'instant',
        })
      }
    }
    setEnhanced(true)
    synchronize()
    window.addEventListener('popstate', synchronize)
    window.addEventListener('hashchange', synchronize)
    let stopped = false
    const stop = () => {
      if (stopped) return
      stopped = true
      window.removeEventListener('popstate', synchronize)
      window.removeEventListener('hashchange', synchronize)
      navigation.current?.dispose()
    }
    stopNavigation.current = stop
    return stop
  }, [])

  const restoreFocus = useCallback(() => {
    const target = returnTarget.current?.isConnected
      ? returnTarget.current
      : (document.getElementById(`studio-shortcut-${returnProject.current}`) ??
        document.getElementById('studio-projects'))
    setProjectsOpen(true)
    target?.focus({ preventScroll: true })
  }, [])

  // Native modality and substantive heading focus happen in the same React
  // commit as the selected article, regardless of scene or reduced-motion state.
  useCommitEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (enhanced && selectedProjectId) {
      releaseScroll.current ??= lockPanelScroll(document, window)
      try {
        if (!dialog.open) dialog.showModal()
      } catch {
        // Keep the URL and reveal its complete server article if native modality
        // is unavailable or fails. Never strand content behind hidden fallback.
        fallbackProject.current = selectedProjectId
        enhancementFailed.current = true
        stopNavigation.current?.()
        setEnhanced(false)
        setSelectedProjectId(null)
        return
      }
      if (focusedProject.current !== selectedProjectId) {
        const heading = document.getElementById(
          `panel-project-${selectedProjectId}-heading`
        )
        if (panelScrollRef.current) panelScrollRef.current.scrollTop = 0
        heading?.focus({ preventScroll: true })
        focusedProject.current = selectedProjectId
      }
      return
    }
    const wasOpen = focusedProject.current !== null
    if (dialog.open) dialog.close()
    releaseScroll.current?.()
    releaseScroll.current = null
    focusedProject.current = null
    if (fallbackProject.current) {
      const heading = document.getElementById(
        `project-${fallbackProject.current}-heading`
      )
      fallbackProject.current = null
      heading?.focus({ preventScroll: true })
      heading?.scrollIntoView({ block: 'start', behavior: 'instant' })
    } else if (wasOpen) {
      restoreFocus()
    }
  }, [enhanced, selectedProjectId, restoreFocus])

  useCommitEffect(() => {
    const dialog = dialogRef.current
    return () => {
      if (dialog?.open) dialog.close()
      releaseScroll.current?.()
      releaseScroll.current = null
      focusedProject.current = null
    }
  }, [])

  const selectProject = useCallback(
    (id: ProjectId, invoker?: HTMLElement) => {
      if (!enhanced) {
        window.location.hash = projectAnchor(id)
        document
          .getElementById(`project-${id}-heading`)
          ?.focus({ preventScroll: true })
        return
      }
      returnTarget.current =
        invoker ?? document.getElementById(`studio-shortcut-${id}`)
      returnProject.current = id
      navigation.current!.open(id)
      setSelectedProjectId(id)
    },
    [enhanced]
  )

  const closeProject = useCallback(() => {
    if (!enhanced || !selectedProjectId) return
    navigation.current!.close()
    setSelectedProjectId(null)
  }, [enhanced, selectedProjectId])

  const onNavigate = (event: MouseEvent<HTMLDivElement>) => {
    if (
      !enhanced ||
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
    const id = projectIdFromHash(destination.hash)
    if (id) {
      event.preventDefault()
      selectProject(id, anchor)
    } else if (destination.hash === '#studio' && selectedProjectId) {
      event.preventDefault()
      closeProject()
    } else if (destination.hash === '#work') {
      event.preventDefault()
      setProjectsOpen(true)
      document.getElementById('studio-projects')?.focus({ preventScroll: true })
    }
  }

  const onDialogCancel: ReactEventHandler<HTMLDialogElement> = (event) => {
    event.preventDefault()
    closeProject()
  }
  const onDialogClose: ReactEventHandler<HTMLDialogElement> = () => {
    // close events are queued natively: a stale event must not close a new panel.
    if (!dialogRef.current?.open) closeProject()
  }
  const onViewCommand = (action: StudioViewAction) => {
    if (enhanced && !selectedProjectId) {
      setViewCommand({ action, sequence: ++sequence.current })
    }
  }
  const onLookKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !enhanced ||
      selectedProjectId ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return
    const action = LOOK_KEYS[event.key]
    if (!action) return
    event.preventDefault()
    onViewCommand(action)
  }
  const collapseProjects = () => {
    const projects = document.getElementById('studio-projects')
    if (projects?.contains(document.activeElement)) {
      const toggle = projectsToggleRef.current
      const target =
        toggle && toggle.offsetParent !== null
          ? toggle
          : document.getElementById('studio')
      target?.focus({ preventScroll: true })
      // Failed focus must not advertise a collapse while :focus-within still
      // reveals the navigation. Work/Tab/panel-return can expand it as before.
      if (projects.contains(document.activeElement)) return
    }
    setProjectsOpen(false)
  }
  const onProjectsKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const toggle = projectsToggleRef.current
    if (event.key !== 'Escape' || !toggle || toggle.offsetParent === null)
      return
    event.stopPropagation()
    collapseProjects()
  }
  const markUnavailable = useCallback(() => setSceneStatus('unavailable'), [])
  const projectIndex = studioProjects.findIndex(
    (project) => project.id === selectedProjectId
  )
  const project = studioProjects[projectIndex]

  return (
    <StudioShell
      enhanced={enhanced}
      selectedProjectId={selectedProjectId}
      sceneStatus={sceneStatus}
      scene={
        <SceneErrorBoundary onUnavailable={markUnavailable}>
          <StudioScene
            selectedProjectId={selectedProjectId}
            reducedMotion={reducedMotion}
            onSelectProject={selectProject}
            onStatusChange={setSceneStatus}
            viewCommand={viewCommand}
            interactionEnabled={!selectedProjectId}
          />
        </SceneErrorBoundary>
      }
      evidence={evidence}
      projectContent={
        enhanced && project ? (
          <ProjectEvidence
            project={project}
            index={projectIndex}
            idPrefix="panel-"
          />
        ) : null
      }
      dialogRef={dialogRef}
      dialogTitleId={
        enhanced && project ? `panel-project-${project.id}-heading` : undefined
      }
      onNavigate={onNavigate}
      onViewCommand={onViewCommand}
      onRequestClose={closeProject}
      onDialogCancel={onDialogCancel}
      onDialogClose={onDialogClose}
      projectsOpen={projectsOpen}
      projectsToggleRef={projectsToggleRef}
      panelScrollRef={panelScrollRef}
      onToggleProjects={() => {
        if (projectsOpen) collapseProjects()
        else setProjectsOpen(true)
      }}
      onFocusProjects={() => setProjectsOpen(true)}
      onProjectsKeyDown={onProjectsKeyDown}
      onScenePointerDown={collapseProjects}
      onLookKeyDown={onLookKeyDown}
    >
      {children}
    </StudioShell>
  )
}
