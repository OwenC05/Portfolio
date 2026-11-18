# Shared run and robot presentation contract

15 November 2026. Proposed G1/G2/G3/G4 contract, not implemented. Source references S1–S10 resolve in the [implementation plan](implementation-plan.md). This is a small hook/reducer plus typed scene props, with one transport owner; there is no event bus, global store or second stream consumer.

## One lifecycle and source of truth

`StudioExperience` mounts `useAssistantRun` once. `/ask` mounts the same hook for its separate page instance. The hook extracts the existing Workbench request loop and calls `parseAssistantEvent` once per complete nonblank NDJSON line. A pure run reducer checks ordering/semantics and produces one immutable snapshot. Root passes that **same snapshot revision** to the HTML panel and scene adapter. Neither the robot nor Claude's view fetches, parses, reranks or stores its own hits. Text generation remains off, and the Studio has no generated-answer/progress UI.

Keep the 600-character normalization, same-origin `POST /api/assistant`, JSON question, 60-second client timeout, 100000-unit pending-buffer guard, decoder flush at EOF, reader cancellation/release and HTTP JSON error handling from S1. Do not describe the pending-buffer guard as a total response-byte cap. No retry timers or retry-on-asset-load; Retry is a new explicit submission of the retained draft with a new run identity.

The generic wire parser still recognizes the existing event union, including generation, because its shape contract and existing tests are broader. The Studio/shared source-only transition path rejects `generation` and `answer.mode=generated`. Preserve the Workbench prop API and any existing generation-enabled branch without enabling it or adding a new provider path. This package specifies and verifies the source-only branch only.

## Non-executable interface sketch

The following is a type sketch for the frozen boundary, not production code. `AssistantEvent`, `RetrievalHit`, `AssistantAnswer`, `ProjectId`, `SceneStatus` and `Object3D` refer to existing types; immutable projections must not mutate their source arrays.

```ts
type RunId = string; // mount-unique prefix + monotonically increasing ordinal
type HitKey = string; // canonical JSON.stringify([sourceId, chunkId])
type Phase = 'idle' | 'requesting' | 'retrieving' | 'retrieved'
  | 'answered' | 'done' | 'cancelled' | 'error';
type Cursor = 'start' | 'retrieval' | 'answer' | 'done' | 'eof' | 'sealed';
type Completion = 'none' | 'complete' | 'missing-done';
type StopReason = 'user' | 'timeout' | 'superseded' | 'close' | 'unmount';
type FailureKind = 'http' | 'network' | 'protocol' | 'timeout';
type Pose = 'idle' | 'attention' | 'sources' | 'no-match' | 'dismissal';
type Panel = { kind: 'none' } | { kind: 'assistant' }
  | { kind: 'project'; projectId: ProjectId };
type RobotStatus = 'loading' | 'ready' | 'unavailable';
type PresentationMode = 'closed' | 'ready' | 'fallback';
type MotionDirective = 'transition' | 'settle';
type Count = 0 | 1 | 2 | 3 | 4;

interface HitView {
  readonly key: HitKey;
  readonly rank: 1 | 2 | 3 | 4;
  readonly hit: Readonly<RetrievalHit>;
}
interface RunState {
  readonly runId: RunId | null;
  readonly revision: number; // increases on every accepted state/selection change
  readonly phase: Phase;
  readonly cursor: Cursor;
  readonly completion: Completion;
  readonly question: string;
  readonly hits: readonly HitView[];
  readonly selectedKey: HitKey | null;
  readonly retrievalMs?: number;
  readonly totalMs?: number;
  readonly answer?: Readonly<AssistantAnswer>;
  readonly notice?: string;
  readonly failure?: FailureKind;
}
interface PresentationSnapshot {
  readonly run: RunState;
  readonly count: Count; // checked length of run.hits; never a separate counter
  readonly tray: 'hidden' | 'waiting' | 'hits' | 'empty';
  readonly result: 'none' | 'pending' | 'sources' | 'no-match';
  readonly pose: Pose;
}
interface AssistantActions {
  submit(question: string): void;
  cancel(): void;
  close(): void; // invalidate/abort and reset result, keep input draft
  select(runId: RunId, key: HitKey | null): void;
}
interface AssistantSession {
  readonly snapshot: PresentationSnapshot;
  readonly actions: AssistantActions;
}
interface RobotInput {
  readonly snapshot: PresentationSnapshot;
  readonly mode: PresentationMode;
  readonly attentionRequested: boolean; // qualified robot hover or HTML Ask focus
  readonly reducedMotion: boolean;
  readonly motion: MotionDirective;
  readonly presentationEpoch: number; // panel/pose invalidation identity
}
type SceneActivation = { kind: 'project'; projectId: ProjectId }
  | { kind: 'assistant' }; // no source-card target in this slice
interface RobotAsset {
  readonly root: Object3D;
  dispose(): void;
}
interface RobotPresentation {
  apply(input: RobotInput): void; // replace snapshot, mark scene dirty
  settle(): void; // sample newest target, invalidate old transition token
  advance(nowMs: number): boolean; // true only while finite motion remains
  dispose(): void;
}
// Proposed scene prop additions, owned by G2 alongside existing StudioSceneProps:
interface AssistantSceneProps {
  readonly assistant: RobotInput;
  onActivateAssistant(): void;
  onAssistantHoverChange(hovered: boolean): void;
  onRobotStatusChange(status: RobotStatus): void;
}
// Private hook operation after shape validation; never exposed as a UI action:
type ParsedInput = { runId: RunId; event: AssistantEvent };
```

`RobotStatus` describes the optional asset; it never substitutes for existing `SceneStatus`. `PresentationMode` is derived by root: closed when assistant is not the active panel, ready when both scene and robot are ready, fallback otherwise. Fallback includes loading: HTML never waits for either asset. `snapshot.pose` is the run's target while open; mode closed normally overrides it to idle (or finite dismissal on a new close). While no modal is open, qualified visible robot hover or HTML Ask focus can request finite attention, then a settled hold; hover/focus exit returns to idle. Root combines those two signals into `attentionRequested`, advances presentation epoch on a target change, and suppresses them while a project modal is active. G2 reports hover changes only on edges and clears hover through existing cancel/disable/hidden paths. Runtime readiness changes do not fabricate run revisions or API events.

## Wire order, results and terminal handling

Current source-only server evidence is decisive: S3 `handler` sends start → retrieval → answer → done; `MAX_HITS=4`; `sourcesAnswer([])` returns abstained/no-sources/empty citations, and nonempty hits produce sources with one exact citation per hit. G1 enforces that existing behavior; it does not change search or create stronger factual claims.

| Input / allowed predecessor | New phase, data and observable presentation |
| --- | --- |
| Valid submit from any open state | Invalidate old live token before abort, issue new `runId`, reset cursor=start. Phase requesting; empty hits/selection/answer/timings; waiting tray, attention. Clear old list/chips/markers at submit, without waiting for server start. Empty local input creates no run. |
| `retrieval-start` at cursor=start | Require echoed question equals the normalized submitted question. Phase retrieving, cursor=retrieval. Real search-start status; no synthetic progress. |
| `retrieval` at cursor=retrieval, 1–4 distinct keys | Keep returned order, score and exact content; assign ranks 1–N. Phase retrieved, cursor=answer, result pending, tray hits, pose sources. Publish all N markers/chips/list rows together. No citation/answer claim yet. |
| `retrieval` at cursor=retrieval, 0 hits | Phase retrieved, cursor=answer, count 0, result pending, waiting tray, attention. Say zero passages retrieved with measured time and response still pending; do not use the no-match gesture/contact emphasis yet. |
| `answer` at cursor=answer, nonempty hits | Require mode sources and one corresponding citation per hit (same key/title/href, quote equals hit text; no duplicate/missing/foreign keys). Phase answered, cursor=done, result sources, unchanged count and pose. Preserve unsupported-premise caution. |
| `answer` at cursor=answer, zero hits | Require mode abstained and no citations. If fallbackReason is present it must be no-sources. Phase answered, cursor=done, result no-match, empty tray and no-match pose. Show server source-only message plus contact. |
| `done` at cursor=done | Phase done, cursor=eof, completion complete, actual totalMs. Keep hit/result/pose snapshot; it is not an animation trigger. Drain/validate trailing stream content until EOF; no UI stage delay. |
| Clean EOF at cursor=eof | Seal and release the live transport token; keep completed result. |
| Clean EOF at cursor=done (complete validated answer, no done event) | Preserve current Workbench compatibility: phase done, completion missing-done, cursor sealed, retain hits/answer and a connection-closed-before-final-event warning. No totalMs or claim of measured full completion. This is an explicitly incomplete receipt, not a failure being hidden as success. |
| EOF before answer, invalid/truncated JSON, invalid shape, nonblank extra event after done, duplicate/out-of-order event or contradictory answer | Protocol failure: seal/abort the request, phase error, clear hits/selection/answer/retrievalMs/totalMs, result none, hidden strip, empty dim tray, attention. Retry remains possible. Never call a failed search no-match. |
| HTTP non-OK / absent body / fetch or reader failure / timeout | Same immediate failure clearing; retain draft and truthful error class/message. 429 uses server retry guidance, not a made-up countdown. Timeout remains 60 seconds. A fresh valid retry starts a new run. |
| Cancel | Seal live token and clear all result views immediately before abort; phase cancelled with notice and retained draft, attention. Does not depend on fetch rejecting promptly. |
| Close/Escape/project takeover/unmount | Seal live token before abort; clear result and pending focus work. Close resets the session result to idle and mode closed; reopening is ready/empty with retained draft and no automatic request. Unmount performs cleanup only, without React or scene notifications afterward. |

Source-only `abstained` **with hits**, `sources` **without hits**, generated events, mismatched citation identity/content and more than four hits are recoverable protocol errors. The current server cannot legitimately emit those combinations. **Do not silently truncate five hits**, deduplicate them, discard hits to imitate abstention, or clamp only the ring; all views fail and clear together. If the service changes later, root revises the contract and design together. Partial bytes at EOF are still parsed: a complete final line without a newline is valid; a cut-off JSON object is not. Blank lines are ignored, including trailing blanks. A valid answer followed by malformed bytes fails and clears; it is distinct from the clean missing-done case above.

## Identity and same-frame synchronization

1. A mount-unique prefix plus monotonic sequence makes each submission distinct, including identical question text. The active transport entry holds its controller and token. A callback must match that entry, current run ID and mounted lifetime before doing work. The reducer checks the ID **when applying** a queued update, not only before queuing it. Cancel/close/failure invalidates the entry synchronously; stale readers, catches, timers and finally blocks cannot clear a newer controller or result.
2. Store selection as `(runId, HitKey)`, where `HitKey` encodes `[sourceId, chunkId]` without delimiter ambiguity. Rank is presentation only. One snapshot supplies all three views and their order. Clear selection at new submit, cancellation, failure and close. A same-key passage in a later run is not the previous selection. A selection action for an old ID or missing key is ignored.
3. Selection-driven focus/scroll is a single cancellable post-commit callback. Check panel-open identity, run ID, hit key and revision before resolving the current DOM node; do not capture rank and focus whatever occupies that slot later. No animation-completion callback selects a source or publishes results.
4. Snapshot publication is urgent local state, never deferred by a transition, debounce, fade or minimum-stage timer. Root/`StudioScene` use commit-phase delivery: HTML commits the new snapshot and a layout/commit effect calls controller `update` with that same revision and `invalidate()` in that commit, before paint. Replace the current passive `StudioScene` update for this boundary. The controller stores only the newest revision; every frame reads it at render time, not a snapshot captured when RAF was queued. A pre-existing RAF therefore cannot redraw old markers after the clearing commit.
5. Every clear is a scene invalidation even if the target pose remains attention. Next rendered frame contains zero old markers; every new valid retrieval frame contains all N current markers. There is no millisecond grace period, stagger or shrinking-card exit. Hidden/offscreen has no forced draw: mutate the latest snapshot and dirty flag immediately; first resumed frame renders only that snapshot. DOM and canvas are judged at committed snapshots/paint, not by requiring a hidden browser to render.
6. Fast events may coalesce into one React commit. Show the latest real snapshot and timings without forcing intermediate gestures. Transitions are keyed by run/presentation epoch and target pose, not every revision; done or source selection cannot replay the sources gesture. A new run interrupts previous motion from its current transform, but removes old data immediately. Close increments presentation epoch even after transport completion, so dismissal callbacks cannot change a reopened panel's state.

## Activation, panels, focus and history

Root owns one `Panel` discriminant and a separate monotonically increasing panel epoch. G3's dialog view accepts `dialogRef`, title ID, content/actions and guarded cancel/close handlers; it does not call `showModal`, acquire scroll locks or own another request hook. Root applies the existing commit-phase modality/heading-focus pattern in S4. Focus the substantive assistant heading on desktop and phone; the textarea is next in logical order. Do not focus it automatically on phone. Canvas remains aria-hidden and outside Tab order.

The dock Ask button and qualified robot activation call the same root action. Capture the HTML invoker; a mesh click uses Ask as its return target. Opening Ask collapses the project disclosure. While any modal is open, disable room activation/look and clear in-flight gesture/capture/qualified clicks. A second Ask activation is idempotent. Normal background input cannot open a project through an assistant modal.

Project hash/deep-link/navigation is authoritative. A navigation event selecting a project closes/aborts the assistant before showing that project, with no intermediate focus return to Ask. In-place panel replacement releases/reacquires or transfers the single scroll lock in the same commit; final close restores once. Opening Ask while a project modal is active is refused rather than editing project history or showing two modals. If a queued Ask action races a project activation, the project wins. No assistant hash/history entry is added: close/reopen preserves the existing URL, scroll and camera. Any `popstate`/`hashchange` closes an open assistant and then runs existing project synchronization; ordinary navigation must not be intercepted as assistant history.

On Close/Escape use the panel epoch/kind and actual dialog.open state to reject queued native close events from a prior opening (extend S4 L300). Return focus only for an ordinary assistant close, to its still-connected visible invoker or Ask fallback. On source navigation or project takeover let the destination receive focus; do not yank focus back after route change. If native dialog enhancement fails, offer the existing `/ask` route and contact/published content rather than exposing a nominal modal without keyboard containment.

**Scope decision:** 3D cards are display-only. G3 supplies ordinary chip buttons and source-disclosure buttons sharing selection; chips support the requested arrow navigation without removing ordinary Tab access. Mouse/pen/touch can activate the robot silhouette when no panel is open. Source card picking from A v01 conflicts with modal background inertness and disabled scene input; it is deferred, not a reason to punch a hole in modality. No invisible robot bounding box and no source text solely in WebGL.

## Robot scheduling and asset lifetime

G2 composes a discriminated activation result without changing `PROJECT_IDS` or replacing `pickProject` controls. Exact robot intersections must be on visible, rendered head/body geometry, inside camera clipping, with room/project opaque depth respected. Add opaque robot meshes and visible runtime markers to the live blocker set so project touch expansion cannot click through them, including the original finger ray. A tap near but outside the robot silhouette does not activate an invisible box. The existing 44px project expansion remains; the 44px HTML Ask button supplies accessible robot access. Compare direct targets by visible depth; do not run two independent click listeners. Preserve mouse/pen precision, drag axis locks, compatibility mousedown qualification and cancelled-pointer rejection.

The single controller frame function calls `advance(now)` before rendering and reschedules only while an approved finite transition remains, the scene is visible/nonzero/in view, motion is allowed and the controller is alive. Settled idle/attention/results contain no periodic blink/bob timer. Pose interpolation owns transforms only; count/identity never waits for it. Use authored pose data in B's verified axes, not a new animation framework. No new Mixer requirement, lights or postprocessing is introduced. Initial noncasting robot behavior is provisional pending A/B/root; a casting change requires fresh refresh-cost evidence, not a silent shadow-loop change.

Live reduced-motion **ON** interrupts any active transition, invalidates its token and snaps all robot/selection transforms to the latest settled target on the next rendered frame. G3 also disables panel/chip motion immediately. **OFF** starts no motion; only a later semantic action may trigger one. Closing under reduced motion settles idle directly, without a dismissal gesture. Hiding/offscreen/zero-size cancels scheduled frames and discards remaining gesture time; on return apply the latest settled state once, with no catch-up/replay. The request may continue while hidden and updates the authoritative snapshot normally. A result arriving while hidden cannot start a deferred entrance animation.

Robot loading has its own abort controller and controller-generation guard. `ready` means validated asset bound and included in a successful visible render, not fetch resolved. If loading completes during an existing run, apply the current settled pose/selection and exactly its current count, without greeting/presentation replay. A load failure disposes all owned partial resources and reports robot unavailable while leaving a healthy room and HTML working. A late result after scene disposal is disposed without attachment/callback. Context loss follows existing scene unavailable/disposal behavior and leaves the request/panel usable through HTML; no autonomous reload loop.

Imported geometries/materials/textures/bitmaps/temporary URLs belong to the robot loader; runtime marker resources belong to its presentation owner. Do not register the same object with both. Register allocations before successful parse, validate required decoded texture slots, drain noncancellable pending dependencies and dispose each owned shared resource once; preserve borrowed images. Dispose in independently guarded steps so one exception cannot skip renderer/listener/RAF cleanup. Remount/StrictMode uses a fresh owner/generation; no cached resource object transfers between mounts. Asset status changes only appearance/fallback, never run ID or retrieval state.

## Eleven review handshakes resolved

| Review item | Concrete resolution |
| --- | --- |
| H1 same source/update | One immutable snapshot; commit-phase scene update and invalidation; no private hit lists. |
| H2 request identity | Mount + run sequence, live-entry guard, reducer-time ID check; clear at submit. |
| H3 zero/abstained | Zero retrieval waits; zero + abstained becomes no-match; contradictory combinations fail and clear. |
| H4 hit cap | Existing MAX_HITS=4; overflow is a protocol error across all views, never a display clamp. |
| H5 failure after retrieval | Clear list, answer/citations, chips, markers, selected key and timings together. |
| H6 close during request | Invalidate then abort, clear, reject late events; reopen empty without refetch. |
| H7 motion preference | ON snaps next rendered frame; OFF starts nothing. |
| H8 stale timing | Zero stale markers next rendered frame, no exit duration; first visible frame after suspension uses latest data. |
| H9 selection | Run ID + canonical source/chunk key; no persistent slot index. |
| H10 late/failed load | Adopt current settled snapshot without replay; failure preserves full HTML. |
| H11 hidden tab | Stop RAF, discard transition remainder, resume latest settled snapshot once. |
