# Studio v2 — user-directed agent assignment

The user's latest instruction is binding: all design work goes to Claude subagents; everything else goes to Codex subagents. This addendum overrides provider-neutral staffing in the approved PRD and earlier dispatch drafts without changing the accepted product behavior or technical interfaces. No v2 Orca implementation Run existed when this instruction arrived; prior Codex art-direction work is a historical proposal that Claude must review and own going forward.

| Work | Required Orca agent | Ownership |
|---|---|---|
| Room composition, camera framing as an artistic choice, geometry appearance, materials, textures, lighting, visual polish | `claude` | S's visual performer, before independent Claude visual critique |
| Interface visual layout, typography, colour, CSS, visual shell markup and responsive art direction | `claude` | U's visual performer, before independent Claude visual critique |
| Shared types, camera/input mechanics, visibility-safe picking, lifecycle/resource management, URL/history, modal state/focus, SSR/accessibility behavior | `codex` | S/U technical performers and technical coordinators |
| Tests, build/preview operations, performance measurement, source/evidence review, integration and technical architecture/code review | `codex` | I and scoped technical critics |
| Screenshot aesthetics, immersion/art-direction decisions and visual acceptance critique | `claude` | Independent visual reviewer; Codex may collect screenshots and verify factual requirements |

Top-level S/U/I coordinators use `--agent codex` for task coordination and technical integration. They must dispatch design performers/critics with actual `--agent claude`; naming a Codex prompt 'Claude' is not a substitute. Use `--agent codex` for all other children. On 15 November 2026 the user authorized task-specific model and effort selection for every new worker, prioritizing quality without wasted tokens. Follow [portfolio-worker-model-routing.md](portfolio-worker-model-routing.md); preserve settings of workers already running. Each child spec records its requested provider/model/effort, rationale and actual dispatch/ACK evidence.

S: Claude owns build-studio.ts, textures.ts and visual geometry/material choices; Codex owns controller.ts, adapter, tests and nonvisual resource infrastructure. Freeze helper/occluder boundaries before parallel edits. If a helper file mixes responsibilities, assign one owner at a time and route the other change through that owner; no concurrent shared-file writes. Claude reviews the existing art-direction proposal before rendering decisions become authoritative.

U: Claude owns CSS and presentation shell markup; Codex owns panel/navigation/state and accessibility/SSR mechanics. Freeze component slots, class names and DOM contract first; Codex wires events/semantics to Claude's design, not independent restyling. Keep meaningful content unchanged. Claude decides any aesthetic adjustment, including mobile framing.

I: Codex performs browser measurements/builds and technical reviews; a distinct Claude visual critic inspects actual desktop/mobile/interior/panel screenshots against the user's selected direction. Source or design fixes return to the correct provider and owner. Root coordinates/reconciles evidence without taking over visual authorship.

A missing/unavailable Claude worker is an explicit dispatch blocker; do not silently substitute Codex. Follow Orca recovery guidance without duplicate starts or terminal steering. Keep the accepted early actual-render gate and no-deploy/no-paid-generation/private-photo boundaries.

