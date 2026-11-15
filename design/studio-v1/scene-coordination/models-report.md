# Authored studio model — child M

Completed 14 November 2026. This report covers model construction and static checks only; it does not claim a browser render, GPU measurement, screenshot approval, or integrated route completion.

## Owned files

- `components/studio/scene/build-studio.ts` — new synchronous `createStudio(resources): StudioModel` implementation.
- `design/studio-v1/scene-coordination/models-report.md` — this report.

No helpers, dependencies, contract, UI, content, planning, runtime records, or external assets were modified. No preview/browser was started. The existing package changes and other workers' files were preserved.

## Authored result

The open dark-neutral room has a timber workstation centered at x=-1.35, a tabletop at y=1.5, a low left return wall, acoustic slats, warm triangular wall panels, and local procedural contact shadows. Materials distinguish timber, fabric, rubber, cream plastics, metal, and brass; amber lighting uses one shadow-casting directional light, two unshadowed point lights, and a hemisphere light.

The workstation contains a central landscape dissertation monitor, left Copilot and right TypeForge portrait monitors, and a raised decorative after-hours monitor. All have modeled cases and supports. The three selectable surfaces face +z, retain their project IDs, and have separate MeshBasicMaterial borders; both surfaces and borders are excluded from instancing. The raised fourth screen is unselectable.

Details include a frosted-looking compact keyboard shell over an opaque insert, individually arranged cream/pastel keycaps and spacebar, a mouse and desk mat, a white tower with three five-blade fans, side-panel internals, bolts and vents, an articulated microphone arm and mic, headphones, a mug/coaster, and a small unbranded snowboard with bindings. Frosting uses ordinary roughness/opacity; no physical transmission or postprocessing pass is used.

The right-side white controller has exactly 29 white and 20 black keys in the repeating two/three black-key pattern, eight pads, eight knobs, wheel details and a double-X stand. Behind it, the electronic drum kit has four tilted pads with rims, three cymbals, a kick trigger/pedal, control module, sticks, rack joints and feet. Geometry is deliberately stylised, with no claims of exact manufacturer fidelity.

All constructed geometries/materials/textures enter the frozen resource ledger immediately. `instanceStaticMeshes` runs once after final transforms. No renderer, camera, event listeners, asset fetches, animation loop or asynchronous model work is created here. The scene background remains null/transparent.

## Verification evidence

Fresh checks executed through the current PowerShell execution tool:

| Check | Result |
| --- | --- |
| TypeScript program rooted at `build-studio.ts`, using repository compiler options with `incremental:false,noEmit:true` | **Passed: zero diagnostics**, including imported frozen helpers and contract |
| Runtime model construction using installed TypeScript transpilation, real installed Three.js, and a stub 2D canvas | **Passed** |
| Exactly three IDs; unique basic border materials; surface/border interactive flags; surface +z normals; targets remain ordinary meshes after batching | **Passed** |
| Every final mesh geometry/material and referenced texture registered in ledger | **Passed** |
| Disposal events for every ledger resource; repeat disposal; construction failure when canvas context is unavailable followed by cleanup | **Passed** |
| Pre-instancing key inspection | **Passed: 29 white + 20 black = 49 keys** |
| CPU rays from nominal desktop `[-8,6.5,11.5]` and mobile `[-4,7,12]` positions toward each target's center | **Passed: all six rays first hit the intended screen after transparent meshes are excluded** |
| Geometry bounds | **Passed:** x approximately `[-4.500001,5.100001]`, y `[0,4.390001]`, z `[-2.260001,2.25]` |
| `.\node_modules\.bin\tsc.cmd --noEmit --incremental false` | **Integration check failed:** `app/studio/page.tsx(3,30)` could not resolve the sibling-owned `StudioExperience` module at check time; no scene diagnostics were reported |
| `.\node_modules\.bin\next.cmd lint --file components/studio/scene/build-studio.ts` | **Could not run lint:** existing `.eslintrc.json` references missing `@typescript-eslint/eslint-plugin`; no package change attempted |
| `git diff --check -- components/studio/scene/build-studio.ts` | Exit 0; the new file was still untracked, so this is not substantive whitespace coverage |

The construction check transpiled the three modules in memory, resolved their Three imports to the installed package, and supplied no-op canvas drawing methods plus gradients. It traversed actual Three meshes and instanced meshes, counted indexed/non-indexed triangles multiplied by instance counts, and added a second draw/triangle count for every shadow caster. This checks scene construction and budgets, not canvas texture pixels or actual rendering. The key check inspected the scene immediately before the frozen batching helper ran; the temporary instrumentation existed only in memory.

### Conservative static cost estimate

| Metric | Main pass | One shadow pass | Combined |
| --- | ---: | ---: | ---: |
| Draw calls, before camera/light frustum culling | 60 | 40 | **100 / 200 budget** |
| Triangles, before culling | 65,542 | 55,876 | **121,418 / 200,000 budget** |

There are 384 original mesh instances, 37 instanced batches, nine geometries, 27 materials, and six canvas textures. Only three final draws use transparent materials: the batched contact shadows, compact keyboard shell, and tower side panel; they use FrontSide. These estimates assume the controller's current PCF shadow mode and standard single-pass materials. They are **not renderer.info, GPU timing, transferred-byte, or physical-device measurements**.

## Sources and procedural status

- Requirements and layout: `.omx/specs/studio-v1/common.md`, `.omx/context/after-hours-studio-v1-20261114.md`, `.omx/plans/prd-after-hours-studio-v1.md`, `.omx/plans/test-spec-after-hours-studio-v1.md`, this lane's `models-task.md`, and `lib/studio-contract.ts`.
- Reference synthesis: `.omx/context/references-after-hours-v1/findings.md`; inspected `matthis-3d-desktop.jpeg` and `hanusek-desktop.jpeg` for object specificity, warm/dark material contrast, and readable composition. No images, models, textures, layouts, or code were copied from those sites.
- All shipped model geometry is original procedural assembly. Wood, contact shadows and four screen diagrams use the already-provided frozen `textures.ts`; screen imagery is decorative architecture, not claimed project outputs. No additional asset files, fonts, logos, private photos, or licenses are introduced.
- Task-specific AgentMemory search returned no matches; current shared planning/contract files supplied the working context.

## Handoff and remaining limits

The controller may use the documented room bounds and three returned targets without a contract change. It owns shadow-render-target disposal in addition to the shared geometry/material/texture/instance ledger. Material selection colors remain controller-owned. Model groups are static and may contain no children after batching; interactive targets remain directly accessible through the returned references.

The integration owner still needs to verify actual warm-light balance, desktop/mobile silhouettes, screen readability and selection, raycast behavior with the real fitted orthographic camera, transparency sorting, shadow quality, GPU counters, transfer size and timings. The CPU center-ray check does not establish the full clickable screen area or visual quality. Full lint/typecheck/build should be rerun after the sibling UI and foundation tooling are complete. No build or browser session was launched by this leaf worker, per ownership boundaries.
