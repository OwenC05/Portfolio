# Right-limit pilot in the real renderer — independent visual critique (Claude)

15 November 2026. Task `task_9560165b832f`, dispatch `ctx_defc23196721`, actual Claude, no overrides or helpers. ACK sent to S as `msg_944ca4b7e2a9` before inspection. Reviewer is separate from the runtime artist (`task_2e77d7178fc2`). Report only: no source, asset, config, browser, server, build, render or generation.

**Verdict: APPROVE FOR BOUNDED PILOT RUNTIME — the v02 state (`build-studio.ts` `E23588E2…`).** v01 (`D8ABF67F…`) would have been REQUEST CHANGES.

Scope of the approval: the imported door and floor lamp, and the pilot-only light and material changes, as seen in root's development captures. It is not full-room acceptance, not G003, not mobile framing, and not browser, device, performance or product approval.

## Source binding

Hashed by me before and after the review; identical both times, and equal to the v02 manifest. No drift.

| File | SHA256 |
| --- | --- |
| `scene/build-studio.ts` | `E23588E2702ECE52C5B8A2ED25ADB2DEBAC366FDF90C66609A5EF4299FFC11AE` |
| `scene/controller.ts` | `CC76055EA4BFE596E0D3AB49C84CA55C55B8A9BAD3B33627E08ADEB78F0969F0` |
| `scene/load-pilot.ts` | `B5CD61C682DD69D2336B10B508B516999E72D73A00EDBD6E2CEBCF0323D39D11` |
| `public/studio/pilot-right-limit-v03.glb` | `2B9A4182C3024485680C1E066C8A22EF0DC0F541ACCA4BD958486BCED2C4063E` |
| `scene/textures.ts`, `scene/view-config.ts` | `09F6FF6C…`, `1FEA7ADB…` (unchanged since the prototype) |

Manifests: v01 `4939e287…1955be`, v02 `bef69d51…801537`. **The manifests record poses and source hashes but no per-image hashes**, contrary to the task brief. I hashed all 30 PNGs myself and saved them in `scene-coordination/runtime-visual-critique-hashes.json`. So the link from image to source rests on the manifest's word and on folder placement, not on a recorded image hash.

Manifest poses, all DPR 1, development preview, zero recorded errors, GLB 200: right-up yaw 58 pitch 12; right-down 58/−16; music 44/−8; home −4/−6 (1440) and −13/−8 (390, 320). Eye and bounds unchanged.

## Images actually opened

| Set | Opened at native size | Measured only (not opened) |
| --- | --- | --- |
| v02 | `right-up`, `right-down`, `music`, `home`, `project-open` at 1440; `right-up`, `right-down`, `music` at 390 and at 320; `home-320` | `home-390`, `project-open-390`, `project-open-320` |
| v01 | `right-up-1440`, `right-down-1440` | `music-1440` and all 390/320 and home/panel files |
| Prototype `early/` | `right-up-1440` and `right-down-1440` re-measured; opened in earlier reviews | |
| Blender v03 stills | Not re-opened; figures from my pilot critique | |

Enlarged crops of the shade and door were used to confirm what is visible at normal size.

## Three pipelines, four states

Luminance 0–255 at 1440×900, approximate crops. Blender is path-traced with bounce under AgX; the other three are the real renderer.

| Region (`right-up` unless noted) | Prototype | Blender v03 | Runtime v01 | Runtime v02 |
| --- | --- | --- | --- | --- |
| Door, upper panel | 3 | about 37 | 40 | 78 |
| Door, lower panel (`right-down`) | 2 | about 33 | 34 | 43 |
| Architrave, left | 15 | — | 22 | 47 |
| Knob | 26, mostly dark | — | 28; 44% of pixels below 10 | 67; 3% below 10 |
| Shade, all channels ≥250 | 16–17% | 0% | 11–12% | 0.04–0.06% |
| Shade range (5th–95th percentile) | 72–255 | 130–227 | 73–255 | 96–231 |
| Wall between window and door | 23 | 25 | 23 | 32 |
| Same wall, `right-down` | 9 | 24 | 9 | 13; 38% below 10 |
| Right ceiling | 7; 78% below 10 | 28 | 7; 78% below 10 | 14; 41% below 10 |

## Findings on v02

### Passes

1. **Door reads as a door in the real renderer.** `right-up-1440` and `right-down-1440` show a honey oak leaf with two raised fields, lock rail, visible grain and a top-to-bottom light falloff (78 upper, 43 lower). This is better than the Blender still, which was flat at about 33. The risk I rated highest in the pilot critique, panels flattening under direct light, did not happen.
2. **Frame separates from the wall.** The architrave is now clearly lighter than the wall and darker than the leaf; the head cap reads in `right-up`.
3. **Hardware reads as brass.** The knob is a lit brass ball with a rose, and the keyhole plate is visible. In v01 it was a black ball.
4. **Shade is fixed.** The burnt white disc of v01 is gone and clipping is effectively zero, well inside the author's 2% limit. The shade shows a taper, trim bands, a seam, a brass finial and a lit lower opening. At 390 and 320 it reads the same.
5. **Wall pool is not hot.** The author feared a blown wall behind the lamp. The wall above the shade peaks around 122, with a soft falloff.
6. **No visible spill damage.** Blind, stool, rug and floor change by one to three luminance levels between v01 and v02; nothing is washed out. The floor by the door loses its black patch.
7. **Lit shade interior.** The bright ellipse at the bottom opening, another risk the author flagged, reads as the inside of a lit shade, not as a fault.
8. **No regression elsewhere.** v01 to v02: `home` changes in 0.02% of pixels at 1440 and none at 390/320; `project-open` changes in none. v02 `home-1440` against the prototype `initial-1440`: 0.02%. `home-320` is a clean capture with no veil, and the open panel is intact at 1440.
9. **Contact.** The lamp base sits on the rug edge with its contact shadow; the door sits inside its frame above the floor with a shadow line beneath. Nothing floats or z-fights in these views.

### Non-blocking defects, for the artist through S

| # | Severity | Where | Finding | Suitable repair |
| --- | --- | --- | --- | --- |
| 1 | Medium | `right-down-1440`, strip between window and door | The door is now three to six times brighter than the wall beside it; that strip is still mean 13 with 38% of pixels below 10, so the door stands against a near-black band | Belongs with the right-wall lighting already deferred; if touched in the pilot, move or widen the existing fill, do not add a light |
| 2 | Low | `right-up-1440` | Architrave is a desaturated grey-brown (about 58, 46, 29) while the window frame beside it is red-brown; two trim timbers in one view | Shift `lib_dark_oak` hue toward the window frame's |
| 3 | Low | Door crops at DPR 1 | Thin moulding edges show stair-stepping | Check at DPR 2 before changing anything |
| 4 | Low | All shade views | Gradient is present but mild; no weave is visible; the shade is a slightly cool cream | Optional: a little more warmth; weave cannot resolve at about 85 px |
| 5 | Low | `right-down` | Lower door panel is about half the upper panel's brightness | Acceptable as falloff; revisit only with finding 1 |

None of these stops the bounded pilot.

### Not in scope, still open (G003 or other lanes)

- **Right wall and ceiling.** Improved as a side effect (ceiling pixels below 10 fell from 78% to 41%) but the wall below the sill is unchanged (about 20–26) and the upper right corner of `right-up-1440` is still dark. My baseline blocker "right limit near-black" is reduced, not closed.
- **Wall triangles, 320 monitor framing, equipment upgrades.** Untouched. `home-320` still cuts the central monitor bezel on both sides.
- **Interface.** In `right-up-1440` the hint pill sits beside the knob and over the keyhole. The earlier 320 overlap of Projects and the look controls is no longer present in these captures. For U through root.

### Not evidenced

- **The door on narrow screens.** At 390 and 320 the door is outside the frame in all three captured right-side poses. Its appearance there is unreviewed.
- **Anything between the captured poses**, DPR above 1, production build, touch, physical devices.
- **Cost of the extra light.** Draw calls and triangles are identical between v01 and v02 in the manifests, as expected for a light and material change, but the fill adds a fifth point light to every lit material. Frame time was not measured by anyone and I make no performance claim.
- **Image-to-source binding by hash**, as noted above.

## Position on the artist's flagged uncertainties

| Hypothesis | What I see |
| --- | --- |
| Hand estimate may be off | Shade landed close to the estimate; the door came out brighter than estimated, which helps |
| Hot wall at the shade edge | Not present |
| Bright sliver through the shade opening | Present, reads naturally |
| Fill spill on blind, stool, floor | Measurable, not visible as a fault |
| Extra light cost | Untested |

## What this approval does and does not settle

Settled for the bounded pilot: the Blender-to-GLB-to-runtime path produces a door and lamp that are clear improvements on the prototype pair in the real renderer, with pilot-only tuning that causes no regression in the home or panel views.

Not settled: the right limit as a whole, any other asset, mobile framing, the full look cone, performance, and product acceptance. Root owns those.
