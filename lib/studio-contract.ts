import type { PresentationSnapshot } from './assistant/run-state';

export const PROJECT_IDS = ['dissertation', 'copilot', 'typeforge'] as const;

export type ProjectId = typeof PROJECT_IDS[number];
export type SceneStatus = 'loading' | 'ready' | 'unavailable';

export type StudioViewAction = 'reset' | 'left' | 'right' | 'up' | 'down';
export interface StudioViewCommand { action: StudioViewAction; sequence: number; }

/** Root supplies the exact immutable snapshot also passed to the HTML panel. */
export interface StudioAssistantInput {
  readonly snapshot: PresentationSnapshot;
  readonly panelOpen: boolean;
  readonly presentationEpoch: number;
  readonly attentionRequested?: boolean;
}

export interface StudioSceneProps {
  selectedProjectId: ProjectId | null;
  reducedMotion: boolean;
  onSelectProject: (id: ProjectId) => void;
  onStatusChange: (status: SceneStatus) => void;
  viewCommand?: StudioViewCommand | null;
  interactionEnabled?: boolean;
  /** Absent means no robot import, request, allocation or behavior. */
  assistant?: StudioAssistantInput;
  onActivateAssistant?: () => void;
  onAssistantHoverChange?: (hovered: boolean) => void;
  onRobotStatusChange?: (status: SceneStatus) => void;
}

export interface StudioProject {
  id: ProjectId;
  title: string;
  eyebrow: string;
  summary: string;
  sections: ReadonlyArray<{ heading: string; paragraphs: ReadonlyArray<string> }>;
  facts: ReadonlyArray<{ label: string; value: string }>;
  links: ReadonlyArray<{ label: string; href: string }>;
}

export function projectAnchor(id: ProjectId): string {
  return `#project-${id}`;
}

export function projectIdFromHash(hash: string): ProjectId | null {
  return PROJECT_IDS.find((id) => projectAnchor(id) === hash) ?? null;
}
