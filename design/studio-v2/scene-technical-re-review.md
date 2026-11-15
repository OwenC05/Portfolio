# Independent S technical repair re-review

**APPROVE — bounded S-T1, S-T2 and S-T3 repairs.** Both previously blocking medium findings are resolved, and the low-severity inventory recommendation is resolved by the documented model-owner exception plus a sensitive inventory regression. No unresolved finding remains within this re-review. This verdict does not approve the asset pilot, live scene integration, visual quality or final product acceptance.

Reviewer: actual Orca `codex`, no model/effort override or helpers; current task `task_1707db15bd3d`, dispatch `ctx_b7c401f35669`, terminal `term_ceb33f2720b6755f50ef24ccf04c884a`. Current coordinator instruction `msg_68338ce925cf` was retrieved and acknowledged as `msg_118c01f712c7`. This is new repaired-source evidence, not a resubmission of the original verdict. No product or performer file was changed.

## Closure evidence

### S-T1 — resolved: opaque target backs block expansion under the finger

`components/studio/scene/picking.ts:123-126,146-148` now queries the original finger ray against opaque ordinary occluders **and target surfaces**. Selection eligibility remains separate: the exact path at lines 129-143 still rejects a back face, while its opaque depth can reject expansion at lines 171-177. Existing visibility, side, opacity and clip filtering is retained.

The new independent probe reproduces the original geometry and its horizontal mirror at CSS x=270 and x=230, y=250, in a 500x500 viewport. Raw Three intersections establish that each finger ray hits the narrow other-target back, misses the rear plane, and leaves the rear center visible. Foreground distance is **3.003198295151354**, camera depth is approximately **3**, back-facing normal dot ray is **0.9989350369715786**, and the clear rear center is at distance **5**.

For both cases, the repaired expanded result is **null**. Exact back-face selection is also null; clear rear exact selection, expanded selection with the foreground ancestor hidden, and expanded selection with translucent foreground all return **dissertation**. Turning the foreground to face the viewer preserves exact selection of **copilot**. Reverting only the repaired finger-blocker query **in memory** makes expanded picking incorrectly return dissertation again. The test therefore distinguishes the repair from simply disabling selection.

The performer's combined regression at `verify-controller.mjs:1303-1330` also establishes independent ray, normal and depth preconditions with clear positives. The reviewer used a separate geometry fixture; no picker helper establishes the expected occlusion.

### S-T2 — resolved: invalid-click tests reach their intended guards

`components/studio/scene/verify-controller.mjs:415-443` now proves a valid trusted sequence first, creates a fresh completed gesture, and supplies trusted compatibility mousedown at line 430 before altering the candidate click. The absent/untrusted-mousedown cases remain separate at lines 1094-1107. The production controller is unchanged from the first review.

The independent runner executes only the named current test, without modifying its text. Its unmutated ten-case matrix passes. Separate in-memory controller mutations demonstrate:

| Removed condition | Observed test failure |
| --- | --- |
| Pointer-ID comparison only | `wrong-id`: actual `[dissertation]`, expected `[]` |
| Pointer-type comparison only | `wrong-type`: actual `[dissertation]`, expected `[]` |
| Click displacement rejection | `wrong-position`: actual `[dissertation]`, expected `[]` |
| Mousedown prerequisite, in the separate mousedown test | `absent`: actual `[dissertation]`, expected `[]` |

Every mutant failure is the intended `deepStrictEqual` selection assertion, not a VM/setup error. The unmutated separate mousedown test passes. The performer's own sensitivity test at lines 1362-1398 independently checks whole-identity and displacement guard removal. These tests now provide meaningful regression evidence for the original coverage gap.

### S-T3 — resolved for the current procedural model only

`scene-coordination/contracts.md:11` explicitly records model-owner approval **msg_c3afbb1cc9b3** for exactly the three dedicated unlit border planes, identified by each target's border material and positioned behind its face (local z=0.049 versus 0.054). It expressly denies a general `userData.interactive` exemption for future decorations/assets. The `StudioModel.occluders` comment at `scene/types.ts:14` is consistent with that agreement. The appended performer report records S's confirmation **msg_1997366ba81d** and the comment-only hash change.

The new inventory regression at `verify-controller.mjs:1333-1359` independently traverses live effectively visible meshes, handles material arrays, and checks opacity without relying on the collector's `interactive` flag. It requires exactly three omitted target objects plus one omitted dedicated border per target, shared monitor parent, and border-behind-face placement; every registered blocker must be live.

The reviewer executed that inventory test against the current model: **pass**. An in-memory builder mutation adds one extra opaque mesh marked `interactive` after collection. The same test then fails specifically with **7 omissions versus 6**, “No arbitrary opaque interactive decoration may be omitted.” This proves that the documented exception does not mask an arbitrary additional omission.

`build-studio.ts:550-560` is unchanged. The original 3,023-point border differential remains historical evidence, not a newly repeated exhaustive proof; the model hash is unchanged. No collector redesign or aesthetic change is requested by this bounded review.

## Commands and evidence provenance

Fresh independent command:

```text
node design/studio-v2/scene-coordination/technical-re-review-repair-probes.mjs
```

**Exit 0**, Node **v24.21.0**. The shell captured and returned `LASTEXITCODE`, and wrote UTF-8 output to [technical-re-review-repair-probes.json](scene-coordination/technical-re-review-repair-probes.json). The runner asserts each expected mutation failure before returning success. Source: [technical-re-review-repair-probes.mjs](scene-coordination/technical-re-review-repair-probes.mjs). Only the named repair-relevant tests ran through the review VM; no broad suite was repeated.

Read and hash-bound performer records:

- `node --test components/studio/scene/verify-controller.mjs`: recorded exit 0, **54/54 pass**, zero failures/skips, in `scene-technical-repair-tests.md`.
- `node components/studio/scene/verify-types.mjs`: recorded exit 0, zero scene/import-root diagnostics, in `scene-technical-repair-types.md`.
- Scoped installed ESLint API invocation, `useEslintrc:false`, installed TypeScript parser and `next/core-web-vitals`: recorded exit 0 for picker/tests, zero errors/warnings, in `scene-technical-repair-lint.md`; exact invocation remains in `scene-technical-report.md`.
- Configured lint's historical missing `@typescript-eslint/eslint-plugin` failure remains explicit; it was not rerun or represented as passing.

Read-only inspection used numbered `Get-Content`, `Get-FileHash`, `git status --short` and `rg`. One initial exploratory `rg` call used a literal Windows wildcard path and returned OS error 123; direct reads of the exact contract, report and source paths then succeeded. This was an inspection-path error, not a product/test failure.

## Exact reviewed hashes

The independent JSON contains SHA256 for all 15 inspected source/evidence inputs and the four preserved original critique artifacts. Principal repaired/contract inputs:

| File | SHA256 |
| --- | --- |
| `components/studio/scene/picking.ts` | `C427B0553DD2403500F7AC0E306A42C5B1476A6A8AB3175186704261D638261C` |
| `components/studio/scene/verify-controller.mjs` | `3CAC02D52E2B36F57CAD0AE53486DA8FDF289A1AFA6CDF2B978B45B7C983CE44` |
| `components/studio/scene/types.ts` | `0085B8D6B3ACF8E545B38EF58463D1A1BD82AF4F5CAA2E88002F40EC6E271104` |
| `components/studio/scene/controller.ts` | `F04F7E9F2B4CA082C81A5447343D825B34602CA6BE2B09B3EDD5610EFA6B4847` |
| `components/studio/scene/build-studio.ts` | `364DA680F5111138207A03A72579D7E6491A5E4FC09F8786B5DE794D69FB1EC3` |
| `design/studio-v2/scene-coordination/contracts.md` | `4C3237391ED2245FE1FF8DA5F073B92F127B937DDD7FA5B7D808A78B045E9B39` |
| `design/studio-v2/scene-technical-report.md` | `EB069CFE8CBBD12EADFAA2D7B9D125C8D3EA340F957DFABAD62A412B6470C422` |

All inspected input and historical artifact hashes were unchanged across the probe. The original `scene-technical-critique.md`, `technical-critique-probes.mjs`, `technical-critique-probes.json`, and `technical-critique-hashes.json` are preserved intact, including the original failures. New writes are limited to this report and the two `technical-re-review-repair-probes` evidence files.

The geometry uses installed Three raycasting without WebGL. Event trust, bubbling and lifecycle are CPU-modeled; this does not establish actual browser focus ordering, physical pen/touch behavior, GPU/performance results or art quality. No browser, build, server, asset integration, package or product edit occurred. S may close these three technical findings; live scene integration and asset-pilot acceptance remain separate root-owned gates.
