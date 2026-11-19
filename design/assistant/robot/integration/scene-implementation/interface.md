# G2 optional scene interface

18 November 2026. Frozen public interface for root integration; staged implementation is not production acceptance.

`StudioSceneProps.assistant?: StudioAssistantInput` contains `snapshot: PresentationSnapshot` (from the real G1 `lib/assistant/run-state.ts`), `panelOpen: boolean`, `presentationEpoch: number`, and `attentionRequested?: boolean`. Optional callbacks are `onActivateAssistant(): void`, `onAssistantHoverChange(hovered: boolean): void`, and `onRobotStatusChange(status: SceneStatus): void` (`loading | ready | unavailable`). Existing `reducedMotion` and `interactionEnabled` remain the only motion/input preference sources.

Root supplies the same snapshot object to panel and scene. StudioScene delivers committed props in a layout effect; the next rendered frame uses that snapshot. No transport/store/parser or source-selection action lives in the scene. Absent assistant input performs no robot dynamic import or asset load. Existing callers remain valid; G2 does not edit StudioExperience.

Root combines qualified robot hover and HTML Ask focus into attentionRequested and owns the presentation epoch. PanelOpen suppresses robot activation even if interactionEnabled is mistakenly true; root disables all scene interaction for either modal. Robot ready follows a successful visible scene render containing the validated attachment. Robot unavailable is separate from room status and never closes HTML.

G2a checkpoint: pinned loader, separate lifetime/resource owner, current-state adoption, provisional wrapper and composed pointer activation. G2b checkpoint: finite interruptible five-target poses and immediate 0..4 display-only markers. Both have targeted CPU verification; root retains all build/browser, independent review and placement/performance acceptance gates.
