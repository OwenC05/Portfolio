export const PROJECT_IDS = ['dissertation', 'copilot', 'typeforge'] as const;

export type ProjectId = typeof PROJECT_IDS[number];
export type SceneStatus = 'loading' | 'ready' | 'unavailable';

export interface StudioSceneProps {
  selectedProjectId: ProjectId | null;
  reducedMotion: boolean;
  onSelectProject: (id: ProjectId) => void;
  onStatusChange: (status: SceneStatus) => void;
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
