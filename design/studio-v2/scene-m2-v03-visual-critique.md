# M2 v03 pendant and shared-material repair — independent actual-image rereview (Claude)

15 November 2026. Task `task_76847bdd1353`, dispatch `ctx_a9e053890019`, root release `msg_389d425f9d5c`, governed by `scene-coordination/m2-v03-visual-rereview-task.md`. Same retained reviewer session as the first review (`task_5437cd5dfec3` / `ctx_a9a533c5bf49`), separate from the v03 author (`task_e0a4ef11c0ca`). No helpers, no overrides.

Model and effort. Observed: the same process as the first review, argv `--model claude-fable-5-2 --effort high`; the session identifies itself as `claude-fable-5-2`. `CLAUDE_CODE_EFFORT_LEVEL` and `ANTHROPIC_MODEL` are unset. The effort level is a request I can see, not an effective value I can prove. ACK sent as `msg_1c4e3807d339` before inspection.

I wrote only this report and `scene-coordination/m2-v03-visual-review-*`. I started no browser, server, build, Blender or capture, and changed no source, asset, report or Git state (one read-only `git status`). The first review and its v02 evidence are untouched; their hashes still match root's disposition record.

## Verdict

**APPROVE, bounded: the v03 pendant and shared-material repair.**

- The pendant lens passes the clip gate in all seven required views and in `left-up-390`: 0.00–0.28% of the lens crop clipped, against 22.3–26.7% in v02 and a gate of under 2%. No pixel of the lens material itself clips; the few clipped pixels belong to an unchanged surface beside it.
- The ends are still luminous and the body-to-lens edge is still a hard one-pixel edge.
- The flat strip is acceptable at actual size. The planned ramp is not materially necessary, and I do not request it.
- The five wall-triangle proxies changed and did not regress on clipping. They did lose their shading, which matters only to the M5 owner.
- The floor-lamp bulb and the PC glow are not visible in any of the 18 images. I can report no regression for them, and I cannot report an appearance.

This covers the v03 material repair only. It does not approve the PC front or glow, an uncaptured v04, the room, the product, lighting, the interface or any budget. No budget waiver is given.

No blocker was found, so I sent no early blocker message.

## Evidence I inspected

- Capture record `.omx/context/full-kit-m2-v03-runtime-capture-v01.json`: SHA256 `6ba13644…0994bb8c`, re-hashed by me, matches the task. Zero recorded failures, zero page errors, no source drift after capture.
- All 18 PNG hashes match the record: 13 scene renders and 5 static UI composites, DPR 1. I opened all 18 at native size, then 2× to 4× nearest-neighbour crops of the pendant, wall proxies, lamp and PC, each paired with the same crop from v02.
- Before images: the 13 same-named v02 renders in `full-kit-m2-v02/`. All 13 still match the v02 capture record (`1da664b9…6add49b2`).
- Candidate under test: GLB `7c0d3042…3fa57752` and manifest `5e1cb075…f83228d9`, both re-hashed by me and both named in the capture record's provenance. Builder `build-full-studio.ts` is `5a4e8296…21c0f02f`, the same hash as at the v02 capture.
- Console: seven scene records (every 1440×900 render) and the three 1440 composites each carry one "404 (Not Found)" whose recorded location is `http://127.0.0.1:4182/favicon.ico`. That identifies the v03 warning only. The cause of v02's locationless warning stays unknown.
- Network: the handoff records one `net::ERR_ABORTED` fetch of the product's pilot GLB while the composites were prepared. I make no zero-network-error claim and infer no cause.
- Composites are a v03 image under the real product DOM and CSS at 1:1. They show overlap. They do not show v03 integration, input, picking or focus.
- Read, not opened as images: the capture handoff, `scene-m2-v03-delta-check.md` and `.json` (`7951594a…272612c6`), `m2-material-repair-report.md`, `m2-root-visual-disposition.md`, `m2-pc-repair-scope.md` and the v03 manifest's `lib_glow` entry.
- Reproducible numbers: `scene-coordination/m2-v03-visual-review-measure.py` writes `m2-v03-visual-review-measurements.json` (full hashes and every reading below) and `m2-v03-visual-review-crops.png` (thirteen labelled crops, v02 above v03).

| Scene render (`full-kit-m2-v03/`) | Pose yaw/pitch, FOV | SHA256 prefix | What it shows of `lib_glow` |
| --- | --- | --- | --- |
| `scene-home-1440x900-f58` | −4/−6, 58 | `a89bdf6a` | pendant, five wall proxies |
| `scene-home-1024x768-f58` | −4/−6, 58 | `770e221c` | pendant, five wall proxies |
| `scene-mid-left-1440x900-f58` | −20/−6, 58 | `78c80209` | pendant, five wall proxies |
| `scene-left-up-1440x900-f58` | −38/12, 58 | `8c656a49` | pendant, edge of one proxy |
| `scene-home-320x844-f74` | −13.5/−7, 74 | `d9bb31c0` | pendant |
| `scene-home-390x844-f74` | −13.5/−7, 74 | `24f61506` | pendant, edge of one proxy |
| `scene-home-320x568-f74` | −13.5/−7, 74 | `2ed26b3c` | pendant, edge of two proxies |
| `scene-left-up-390x844-f74` | −38/12, 74 | `04329224` | left part of the pendant |
| `scene-music-1440x900-f58` | 44/−8, 58 | `031c02c6` | five wall proxies |
| `scene-mid-right-1440x900-f58` | 30/−6, 58 | `7c9454d3` | five wall proxies |
| `scene-right-up-1440x900-f58` | 58/12, 58 | `a892e071` | two wall proxies |
| `scene-right-down-1440x900-f58` | 58/−16, 58 | `9abd7986` | corner of one proxy |
| `scene-music-390x844-f74` | 44/−8, 74 | `e3c5270e` | nothing; byte-identical to the v02 file |

| UI composite | Scene beneath | SHA256 prefix |
| --- | --- | --- |
| `chrome-home-default-1440x900` | home-1440 | `4f993f1e` |
| `chrome-home-default-1024x768` | home-1024 | `511c018a` |
| `chrome-music-default-1440x900` | music-1440 | `2b721aeb` |
| `chrome-mid-right-default-1440x900` | mid-right-1440 | `ce720121` |
| `chrome-music-closed-390x844` | music-390 | `84b64b03` |

## Method

I reused the v02 method without change, so both columns below come from one rule.

- Lens pixels are those inside a fixed crop box with luminance (mean of R, G, B) above 150 and R ≥ B.
- A pixel is clipped when all three channels are at or above 250, as in `render-gates.md`. The gate is under 2% of the emitter's pixels.
- The eight pendant crop boxes, the two wall crops and the two lamp crops are the v02 boxes. The script re-measures v02 and reproduces the first review's figures.

I added one check that the first review could not make: a whole-frame difference between each v02 and v03 render. The renders are deterministic (one frame is byte-identical across versions) and only `lib_glow` differs between the candidates. So every changed pixel is a visible `lib_glow` pixel or its anti-aliased edge, and a pixel that is identical in both versions has no `lib_glow` in it. This locates each visible consumer from the images, not from the author's list. It also splits the lens mask into lens material and neighbouring bright surfaces.

## Pendant lens

### Clipping, before and after

| View | v02 clipped | v03 clipped | v03 clipped pixels in the crop | Of those, lens material | Luminance p10/p50/p90, v02 → v03 |
| --- | ---: | ---: | --- | ---: | --- |
| `home-1440` (required) | 26.0% | **0.28%** | 19 of 6,907 | 0 | 217/241/255 → 211/221/223 |
| `home-1024` (required) | 25.8% | **0.22%** | 11 of 5,035 | 0 | 211/241/255 → 205/221/223 |
| `mid-left-1440` (required) | 25.6% | **0.15%** | 10 of 6,567 | 0 | 219/241/255 → 215/221/223 |
| `left-up-1440` (required) | 24.1% | **0.14%** | 9 of 6,345 | 0 | 201/240/255 → 201/221/223 |
| `home-320x844` (required) | 26.7% | **0.07%** | 2 of 2,964 | 0 | 210/242/255 → 209/221/224 |
| `home-390` (required) | 25.2% | **0.06%** | 2 of 3,148 | 0 | 207/241/255 → 203/221/224 |
| `home-320x568` (required) | 24.8% | **0.00%** | 0 of 1,408 | 0 | 197/240/255 → 191/221/223 |
| `left-up-390` (additional) | 22.3% | **0.00%** | 0 of 921 | 0 | 196/241/254 → 194/221/221 |

The percentages use the v02 mask, so they compare like with like. That mask also takes in a thin bright line on the fixture beside the lens, 7–11% of the masked pixels. The last column counts only pixels that changed from v02, which are the lens material.

The pass has margin. With the threshold lowered to all channels ≥ 240, v02 has 36–40% of masked pixels over it and v03 has at most 0.84%.

On the centre line of `home-1440` (y = 44), v02 ran from (248, 235, 204) at the left end to (255, 255, 255) across x = 530–570. v03 reads (237, 225, 201) from x = 330 to 450 and from 690 to 730, and peaks at (239, 227, 205) across x = 530–570.

### Luminous ends

Yes. Both ends read (237, 225, 201), luminance 221. Across the seven required views the mean luminance of the outer fifths is 214–219 and of the centre fifth 219–221. In v02 the outer fifths were 223–235 and the centre 242–244.

The lens is the brightest surface in every frame it appears in, level with the wall proxies. The dark body beside it is at luminance 10–14 and the wall below it at 52–68.

### Body and lens edge

Readable, and unchanged in kind. In all eight views the step from body to lens is complete within one pixel, as it was in v02. The step is now about 208 levels (body 10–14, lens 221) where it was about 232. The pale lip line under the lens and the end caps are unchanged pixels.

### Two small residues, neither a defect

**A faint lift inside the lens.** The lens is not perfectly flat. In `home-1440`, 804 of its 6,264 lens-material pixels (13%) are brighter than the flat value. They sit in the centre, x = 497–614, strongest along the upper edge. Away from anti-aliased edges the brightest lens pixel is (242, 232, 213), luminance 229 against 221 for flat. The other views read the same, at (238–242, 226–232, 203–213).

Cause, inferred and not tested: a residual grazing reflection of the pendant practical, which sits just under the lens. The wall proxies carry the same material and show no pixel above the flat value, which fits a reflection that depends on view angle.

**A bright line on the fixture beside the lens.** One or two pixel rows along the lens's long edges, at the centre, reach (254, 253, 250). In `home-1440` that is 68 pixels above luminance 240 at x = 515–558, y = 36–37, and 19 of them clip. These pixels are identical in v02 and v03, so they are not `lib_glow`. They clipped in v02 as well, hidden inside the white bar. I read them as the housing lip catching the practical at close range; that reading is inferred.

Together the two read as a faint sheen where the lens meets the body. I judge it harmless, and slightly helpful: it keeps the centre a little livelier than the ends. The lip line is part of the M2 pendant under provisional lighting, and belongs with the M6 lighting pass, not with this repair.

### Flat strip or ramp

The flat strip is acceptable at actual size. The ramp is not materially necessary.

- The lens is 11–13 pixels thick in the desktop views and 6–9 pixels on phones. A core-to-rim ramp would have two to four pixels a side to work in.
- The ramp was proposed in the first review as the second step of the clipping repair. The clipping is gone without it.
- The strip reads as a lit diffuser panel, which is close to uniform in a real fixture of this kind. The remaining sheen gives a slight centre accent.
- What v03 gives up is heat. The v02 lens read as a hot light; the v03 lens reads as a pale cream panel that is lit. With no bloom in the renderer, the sense of emission comes from its contrast with the body and from the lit wall and desk beneath it. That contrast is enough in every view I opened.

The ramp stays an optional polish item for the M6 lighting pass. I am not asking for the sixth image or the lens UV change it needs.

## Shared-material consumers

`lib_glow` has eight consumers. Across the 13 scene renders the difference check finds 106,411 changed pixels, all inside regions I identified by eye as the pendant lens or the wall proxies. No changed region is unassigned. Nothing else in any frame moved by a single level.

### Visible: five wall-triangle proxies (`fix_wall_triangles__proxy_light_1…5`)

All five are visible in `home-1440`, `home-1024`, `mid-left-1440`, `mid-right-1440` and `music-1440`. Parts of them are visible in five more frames.

| View | v02 p10/p50/p90 | v02 pixels with a channel ≥ 250 | v03 p10/p50/p90 | v03 maximum | Clipped, v02 → v03 |
| --- | --- | ---: | --- | --- | --- |
| `home-1440` | 221/241/247 | 88.3% | 221/221/221 | (237, 225, 201) | 0.0% → 0.0% |
| `music-1440` | 219/241/247 | 88.2% | 221/221/221 | (237, 225, 201) | 0.0% → 0.0% |
| `mid-right-1440` | 218/241/247 | 87.6% | 221/221/221 | (237, 225, 201) | 0.0% → 0.0% |
| `mid-left-1440` | 219/241/247 | 88.5% | 221/221/221 | (237, 225, 201) | 0.0% → 0.0% |
| `home-1024` | 209/241/247 | 87.1% | 220/221/221 | (237, 225, 201) | 0.0% → 0.0% |

- No clipping regression. v02 had the red channel at 255 on most of each panel; v03 has no channel above 237.
- The panels are now a single colour. About 90% of their pixels are exactly (237, 225, 201) and the rest are edge pixels. In v02 the thin side faces were a shade darker than the fronts, so the panels read as thin slabs. In v03 the sides match the fronts and the panels read as flat cards.
- They are about 20 levels dimmer, so their step above the lit wall around them (median 113–118) fell from about 125 levels to about 105. They are still clearly the lightest things on that wall, and the warm halo around them, which comes from the wall practical, is unchanged.

This is a small loss of form in a grey-box proxy that M5 replaces. It is not a v03 defect.

### Not visible: floor-lamp bulb (`fix_floor_lamp__bulb`)

The lamp appears in five frames: `right-down-1440`, `right-up-1440`, `music-1440`, `mid-right-1440` and `music-390`. In all five, no pixel in the lamp crop changed between v02 and v03, and `music-390` is byte-identical. A visible bulb pixel would have changed, because the material's emission colour changed. So the bulb is hidden by the shade from the eye at every captured pose, including both pitch extremes at the right look limit.

The shade itself (`lib_linen_shade`, not a `lib_glow` consumer) is unchanged: 0.04–0.07% clipped, luminance 166–170/204–209/232–233.

I report no visible regression. I cannot say how the bulb looks, and neither could the first review.

### Not visible: PC glow (`pc_tower__glow`)

The PC front is visible in `mid-right-1440`, `music-1440`, `right-down-1440`, `home-1440`, `home-1024` and `music-390`. In all six PC crops no pixel changed, no pixel is within three levels of the emission colour, and the maximum luminance is the v02 figure (199–215). The strip is still hidden behind the front panel, as the first review found.

This is the known, unchanged finding 2 from the first review. It is not a v03 failure, and v03 does nothing for it.

## The author's predictions against the captures

The task asked for appearance evidence in place of the author's arithmetic. Four predictions can be checked.

| Author's prediction | Captured result |
| --- | --- |
| Emission maps to about sRGB (237, 225, 201) | Confirmed to the digit. That is the value of every unlit `lib_glow` pixel. |
| An emission-only surface at this level cannot reach the clip threshold | Confirmed for the lens material: no `lib_glow` pixel clips in any view. The 0 to 19 clipped pixels per crop are the unchanged line beside the lens. |
| The lens shows no gradient from the light under it | A small one remains: 13% of lens pixels in `home-1440` are above flat, by 8 luminance levels at most away from edges. |
| The new value is brighter than v02's ends at every point | Not borne out. The ends went from luminance 229–231 to 221, measured at x = 330 and 730 on the centre line. The loss is not visible as a fault. |

None of these changes the verdict.

## Remaining conditions, by owner

Nothing below blocks v03.

1. **M2 author (actual Claude Opus).** No further change to v03 is requested. Carry `lib_glow` into v04 with the v03 values unchanged. Optionally correct the two report sentences in the table above.
2. **M2 author, for v04.** The relocated PC strip will render at the same flat (237, 225, 201), luminance 221. That is the brightest tone in any frame, placed in the darkest corner of the frame. The material is shared, so the strip cannot be dimmed on its own; restraint has to come from how much of the strip is visible and at what angle. I will judge that from v04 captures. Nothing here approves it.
3. **Root.** This v03 pendant and collateral evidence carries to v04 only while `lib_glow` and the builder lights are unchanged, as `m2-pc-repair-scope.md` already says. Both residues depend on the provisional pendant practical; re-measure the lens and the line beside it when M6 changes that light. The ledger and budget gates and the M3 hold are independent of this verdict.
4. **M5 owner.** The wall-triangle proxies are now flat single-colour cards. Decide their final material and form when the proxies are replaced.
5. **Floor-lamp owner and M6.** The bulb is unobserved. If a later camera, look limit or shade change exposes it, it needs its own capture.
6. **Interface, no action from this review.** In the static composites the brand plate covers the left 8% of the lens pixels at `home-1440` and the left 40% at `home-1024`. That overlap is the same as in v02 and is outside this scope.

P1 is fixed by root at FOV 74, yaw −13.5, pitch −7 and was not re-reviewed. The phone renders here use that pose.

## Limits

- All images are DPR 1 with provisional lighting, reduced motion and the remaining proxies. Higher-DPR and device rendering are not covered.
- "Not visible" means not visible at the 13 captured poses. Those include the desktop home, mid and corner poses named above, not every pose inside the look limits.
- The lens mask counts anti-aliased edge pixels and the bright line beside the lens, as it did for v02, so percentages are comparable between versions and slightly conservative.
- The causes of the two residues are inferred from where they appear. I did not test them. That the clipped pixels are not `lib_glow` is measured, not inferred.
- I measured appearance only. Geometry, bindings, counts and budgets rest on the separate Codex delta check and are not re-verified here.
