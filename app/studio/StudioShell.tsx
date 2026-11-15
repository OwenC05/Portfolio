'use client'

import {
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactEventHandler,
  type ReactNode,
  type RefObject,
} from 'react'
import { studioProfile, studioProjects } from '@/lib/studio-content'
import {
  projectAnchor,
  type ProjectId,
  type SceneStatus,
  type StudioViewAction,
} from '@/lib/studio-contract'
import styles from './studio.module.css'

export interface StudioShellProps {
  enhanced: boolean
  selectedProjectId: ProjectId | null
  sceneStatus: SceneStatus
  scene: ReactNode
  evidence: ReactNode
  children: ReactNode
  projectContent: ReactNode
  dialogRef: RefObject<HTMLDialogElement | null>
  dialogTitleId: string | undefined
  onNavigate: MouseEventHandler<HTMLDivElement>
  onViewCommand: (action: StudioViewAction) => void
  onRequestClose: () => void
  onDialogCancel: ReactEventHandler<HTMLDialogElement>
  onDialogClose: ReactEventHandler<HTMLDialogElement>
  projectsOpen: boolean
  projectsToggleRef: RefObject<HTMLButtonElement | null>
  panelScrollRef: RefObject<HTMLDivElement | null>
  onToggleProjects: () => void
  onFocusProjects: () => void
  onProjectsKeyDown: KeyboardEventHandler<HTMLElement>
  onScenePointerDown: PointerEventHandler<HTMLDivElement>
  onLookKeyDown: KeyboardEventHandler<HTMLDivElement>
}

type RoomState = 'still' | SceneStatus

const LOOK_DIRECTIONS: ReadonlyArray<{
  action: Exclude<StudioViewAction, 'reset'>
  label: string
  turn: number
}> = [
  { action: 'left', label: 'Look left', turn: 180 },
  { action: 'up', label: 'Look up', turn: 270 },
  { action: 'down', label: 'Look down', turn: 90 },
  { action: 'right', label: 'Look right', turn: 0 },
]

function roomMessage(state: RoomState): string {
  switch (state) {
    case 'ready':
      return 'Drag to look · Select a screen'
    case 'loading':
      return 'Setting up the studio · Projects are ready to open'
    case 'unavailable':
      return 'The 3D studio could not start here. Reload the page to try again. Every project still opens in full from the project list.'
    default:
      return 'A still view of the studio · Every project is written out below'
  }
}

function ArrowIcon({ turn }: { turn: number }) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={{ transform: `rotate(${turn}deg)` }}
    >
      <path d="M5 12h13M12.5 6l6 6-6 6" />
    </svg>
  )
}

export default function StudioShell({
  enhanced,
  selectedProjectId,
  sceneStatus,
  scene,
  evidence,
  children,
  projectContent,
  dialogRef,
  dialogTitleId,
  onNavigate,
  onViewCommand,
  onRequestClose,
  onDialogCancel,
  onDialogClose,
  projectsOpen,
  projectsToggleRef,
  panelScrollRef,
  onToggleProjects,
  onFocusProjects,
  onProjectsKeyDown,
  onScenePointerDown,
  onLookKeyDown,
}: StudioShellProps) {
  const roomState: RoomState = enhanced ? sceneStatus : 'still'
  const lookDisabled = !enhanced || selectedProjectId !== null

  return (
    <div
      className={styles.studioPage}
      data-enhanced={enhanced}
      data-selected-project={selectedProjectId ?? undefined}
      onClick={onNavigate}
    >
      <a className={styles.skipLink} href="#work">
        Skip to selected work
      </a>

      <main className={styles.main}>
        <section
          id="studio"
          className={styles.room}
          tabIndex={-1}
          aria-labelledby="studio-title"
          data-room-state={roomState}
        >
          <header className={styles.topbar}>
            <div className={styles.identity}>
              <h1 id="studio-title" className={styles.name}>
                {studioProfile.name}
              </h1>
              <p className={styles.role}>{studioProfile.role}</p>
            </div>
            <nav className={styles.sectionNav} aria-label="Studio sections">
              <a href="#work">Work</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </nav>
          </header>

          <div
            className={styles.sceneViewport}
            data-scene-status={sceneStatus}
            onPointerDown={onScenePointerDown}
          >
            <div className={styles.sceneLayer}>{scene}</div>
          </div>

          <div className={styles.dock} data-projects-open={projectsOpen}>
            <p className={styles.status} role="status" aria-live="polite">
              {roomMessage(roomState)}
            </p>

            <button
              ref={projectsToggleRef}
              type="button"
              className={styles.projectsToggle}
              aria-expanded={projectsOpen}
              aria-controls="studio-projects"
              onClick={onToggleProjects}
            >
              Projects
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M6 14.5l6-6 6 6" />
              </svg>
            </button>

            <nav
              id="studio-projects"
              className={styles.projects}
              tabIndex={-1}
              aria-label="Selected projects"
              onFocus={onFocusProjects}
              onKeyDown={onProjectsKeyDown}
            >
              <p className={styles.projectsLabel} aria-hidden="true">
                Selected work
              </p>
              <ol className={styles.projectList}>
                {studioProjects.map((project, index) => (
                  <li key={project.id}>
                    <a
                      id={`studio-shortcut-${project.id}`}
                      className={styles.projectLink}
                      href={projectAnchor(project.id)}
                      aria-current={
                        selectedProjectId === project.id ? 'true' : undefined
                      }
                    >
                      <span className={styles.projectNumber} aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className={styles.projectLinkLabel}>
                        {project.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div
              className={styles.look}
              role="group"
              aria-label="Look around the studio"
              onKeyDown={onLookKeyDown}
            >
              {LOOK_DIRECTIONS.map((direction) => (
                <button
                  key={direction.action}
                  type="button"
                  className={styles.lookButton}
                  aria-label={direction.label}
                  title={direction.label}
                  disabled={lookDisabled}
                  onClick={() => onViewCommand(direction.action)}
                >
                  <ArrowIcon turn={direction.turn} />
                </button>
              ))}
              <button
                type="button"
                className={`${styles.lookButton} ${styles.lookReset}`}
                aria-label="Reset view"
                title="Reset view"
                disabled={lookDisabled}
                onClick={() => onViewCommand('reset')}
              >
                <svg
                  className={styles.icon}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M5.5 12a6.5 6.5 0 1 0 2.2-4.9M5 4.5v3.2h3.2" />
                </svg>
                <span className={styles.lookResetText} aria-hidden="true">
                  Reset
                </span>
              </button>
            </div>
          </div>
        </section>

        <div className={styles.evidenceSlot} hidden={enhanced}>
          {evidence}
        </div>
      </main>

      {children}

      <dialog
        ref={dialogRef}
        className={styles.panel}
        aria-labelledby={dialogTitleId}
        onCancel={onDialogCancel}
        onClose={onDialogClose}
      >
        <div className={styles.panelBar}>
          <p className={styles.panelLabel} aria-hidden="true">
            Selected work
          </p>
          <button
            type="button"
            className={styles.panelClose}
            onClick={onRequestClose}
          >
            Close
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
            </svg>
          </button>
        </div>
        <div ref={panelScrollRef} className={styles.panelScroll}>{projectContent}</div>
      </dialog>
    </div>
  )
}
