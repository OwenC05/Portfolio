# Studio robot: design direction (Claude design lane)

15 November 2026. Design preparation for task_2cb979d0ec37. Nothing here is a finished robot, and no asset was generated, no account or library was touched, and no application code was changed.

**Status of the character itself: blocked on the reference.** Owen's earlier robot image has not been recovered. I have not seen it, I do not describe it, and nothing below claims to resemble it. Shape and material notes are constraints from the room, marked provisional.

## Decisions needed from Owen

1. **Re-upload the robot reference**, with one line on what you like about it (shape, face, material or mood). This unblocks all character work.
2. **Placement:** A, B or C in [the placement sheet](claude/placement-zones.png). I recommend A.
3. **Where the retrieval visual lives:** small source markers around the robot (my recommendation), or on the raised fourth screen (needs the Studio team's agreement).
4. **Idle motion:** the room currently has no animation at all. Is a slowly floating robot welcome as its first moving object, or should it stay still until addressed?

## 1. What I looked at

**Studio captures, viewed at native size.** All from `C:/Users/Owenc/orca/Portfolio/.omx/artifacts/visual-ralph/portfolio-immersive-v2/`, written 15 November 2026 between 15:59 and 16:33. They are the newest capture folders there and show the accepted M3 v03 desk-equipment candidate.

| Capture | Folder |
| --- | --- |
| `chrome-home-default-1440x900.png` | `full-kit-m3-v03/` |
| `chrome-mid-right-default-1440x900.png` | `full-kit-m3-v03/` |
| `chrome-music-default-1440x900.png` | `full-kit-m3-v03/` |
| `chrome-home-closed-390x844.png`, `chrome-home-open-390x844.png` | `full-kit-m3-v03/` |
| `chrome-home-closed-320x844.png` | `full-kit-m3-v03/` |
| `chrome-mid-right-closed-390x844.png` | `full-kit-m3-v03-phone-mid-right-v02/` |

**Studio documents read:** `scene-art-direction.md` (14 Nov), `scene-m3-v03-visual-critique.md`, `scene-m3-v03-phone-discoverability-review.md` and `scene-coordination/m3-v03-stage-disposition-and-m4-release.md` (all 15 Nov), plus the focus rows of `interface/contract.md`.

**Assistant, in this worktree:** `lib/assistant/types.ts`, `events.ts`, `handler.ts`, `generation.ts` (source-only path), `retrieval.ts` (limits), `components/assistant/AssistantWorkbench.tsx`, and the capture `design/assistant/validation-20261115-v2/mobile-trace.png`.

**Gaps.**

- No `AGENTS.md` exists in this worktree, in `C:/Users/Owenc/orca` or in the Studio checkout, so I followed the task and `brief.md` only.
- The captures are composites: a saved render under the real page. They show overlap, not picking, focus or touch.
- The room is mid-production. M4 (drums, controller) is released but not captured, and lighting is provisional until M6. The right side of the room will change.
- I did not view the left-down, right-down or 1024x768 frames, or any 320-wide frame other than home.
- I did not check Blender or Meshy connectivity or balance in this pass.

### Room findings that shape the robot

- **The eye never moves.** Visitors only turn their head: yaw -38 to +58, pitch -16 to +12. The robot is always seen from one point, so it is a panorama element, not something to walk around.
- **Three screens are the project targets.** Nothing may cover them. The raised fourth screen ("A little room to think") is decorative, with no target.
- **The clearest empty backdrop is the blank acoustic panels** right of the TypeForge screen, above the speaker and headphones. They are in frame at desktop home, mid-right and music, and at phone mid-right.
- **Phone home shows much less.** At 390 and 320 wide, only the centre screen, raised screen, keyboard and mouse are in frame. The speaker, headphones and mug appear only after looking right (yaw 30).
- **The phone control area is full.** Projects and the look buttons fill the bottom row at 390 and two rows at 320. There is no spare slot for another control.
- **Light shapes read; dark shapes merge.** The white speaker, cream wall tiles and cream keycaps are the clearest objects. The review found the dark headphone cup merges with the dark woofer at phone size, and that blue accents turn grey under the warm light.
- **Nothing in the room moves.** The art direction specifies no animation and no post-processing.
- **There is no spare transfer budget.** The disposition forecasts 111 of 120 main draw calls, 141 of 165 refresh calls, 96,936 of 140,000 weighted triangles, and a gzip size of 1,500,351 bytes against a 1,500,000 hard gate. The robot's allowance is for Codex and root to set from measurement; I assume it is small.
- **The centre screen already shows a diagram** reading QUESTION, RETRIEVAL, QWEN for the dissertation project. The robot's visual must not look like that pipeline, or visitors will think the robot runs a model.

### Assistant findings that shape the visual

- **Events actually sent while generation is off:** `retrieval-start` (question), `retrieval` (0 to 4 hits, each with title, heading, text, link and score, plus duration), `answer` (mode `sources` or `abstained`), `done` (total duration). No `generation` event is sent.
- **Search is nearly instant.** The viewed capture shows "4 hits · 9 ms". There is no real waiting period to dramatise.
- **In source-only mode every hit is also a citation.** The current page tags all four "cited", which carries no information. The robot view should not show a cited/uncited distinction.
- **Scores rank passages; they are not probabilities.** The page says so and the robot view must keep saying so.
- **Zero hits returns `abstained`** with a fixed message to contact Owen.
- **Client-only states exist:** sending, cancelled, 60-second timeout, connection error, and a 429 "too many requests" reply.

## 2. Visitor flow

| Step | What the visitor sees | Rule |
| --- | --- | --- |
| **Discover** | The robot in the room, plus an HTML "Ask" control that does not depend on the camera | The robot never opens itself, speaks first, or covers a project screen |
| **Address** | Hover or focus shows a short label: "Ask about Owen's work · searches published sources" | Says "searches", never "knows" or "thinks" |
| **Ask** | An HTML sheet opens: question box, the three existing example questions, and the line "Source search. Generated answers are off." | Scene look is disabled while it is open, as it is for project panels |
| **Sources** | Up to four source markers appear by the robot. The sheet lists the same passages with rank, heading, score, text and link | Markers and list are the same data; selecting one highlights the other |
| **Missing evidence** | No markers. The sheet shows the `abstained` message and the contact link | Calm and neutral. No apology animation, no guess |
| **Close** | Escape or Close. Markers clear, focus returns to the control that opened the sheet, the robot returns to idle | The last result is not kept on show in the room |

All text stays in HTML. The 3D layer carries count, rank and state only, because text in the scene would be about 10 px tall on a phone.

**Open item for the interface owner:** where the HTML "Ask" control goes on phones. My proposal is a single chip above the look bar that replaces the "Drag to look" hint after first use. I have not tested this against the 320 layout.

## 3. Retrieval states

Each state is driven by one real event or one real client condition. The 3D column is described by behaviour only; its look waits for the character.

| State | Trigger | In the room | In the sheet (also the reduced-motion and screen-reader path) |
| --- | --- | --- | --- |
| Idle | none | Robot at rest, no markers | "Ready. Ask a question to search Owen's published sources." |
| Sent | request sent, no event yet | Robot attends to the visitor; lasts only as long as the network does | "Sending your question…" |
| Received | `retrieval-start` | Usually too brief to see; no separate animation | "Searching published sources…" |
| Sources found | `retrieval` with 1 to 4 hits | One marker per real hit, in rank order, sized by score relative to the top hit | "4 passages · 9 ms" using the real numbers, then the list |
| Nothing found | `retrieval` with 0 hits, then `answer: abstained` | No markers; robot returns to rest | The server's message and the contact link |
| Finished | `done` | Markers stay until the sheet closes | "Finished in 9 ms · sources only" |
| Stopped | cancel, timeout, connection error, 429 | Markers clear; robot at rest | The existing notice and "Try again" |

**Honesty rules.**

- The reveal starts when `retrieval` arrives and is a display of a finished result. It is short (my suggestion: under one second) and skippable, and it never loops as fake progress.
- No thinking dots, typing effect, or model-like behaviour. There is no `generation` state to draw while generation is off, and I am deliberately not designing one now.
- Marker count always equals hit count. No decorative extra markers, and no placeholder markers before a real search.
- No line from markers to an "answer" node. In this mode there is no answer, only passages.

**Reduced motion.** The robot holds one still pose. State changes are instant swaps. Markers appear without travel. The sheet text carries every state, so nothing is lost.

**Keyboard.** The entry point is a real HTML button in the tab order after the project shortcuts, not only a clickable mesh. Enter opens, Escape closes, focus returns. Markers are not separate tab stops; the list in the sheet is.

**Phone.** The sheet rises from the bottom like the Projects list and may cover the robot. That is acceptable because the list carries everything. The camera does not need to turn to the robot before asking.

## 4. Placement and character

### Placement (provisional, reference-independent)

See [claude/placement-zones.png](claude/placement-zones.png). The boxes are hand-placed over the real captures. They are not projected from scene coordinates and are not a drawing of the robot.

| | A. Right shoulder | B. Beside the raised screen | C. Desk companion |
| --- | --- | --- | --- |
| Where | Floating over the headphones and speaker, in front of the blank panels | Left of the decorative fourth screen | Low over the desk, right of the mouse |
| Desktop home | In frame, right side, clear of UI | In frame, clear of UI | In frame, close to the TypeForge stand |
| Desktop mid-right, music | In frame, near centre | Off-frame | Under the project list, then off-frame |
| Phone home | Off-frame | In frame but about 85 px wide at 390, less at 320 | Cropped by the right edge |
| Phone mid-right | In frame | Off-frame | Off-frame |
| For | Largest plain backdrop; seen in the most poses; sits between work and music; far from all three targets | Visible on first load on every device; could use the fourth screen as its display | Nearest the eye, so largest and most detailed |
| Against | Phone visitors must look right or use the HTML control. M4 will change what is behind it | Small on phones; close to the Copilot screen's top edge; the fourth screen belongs to the Studio team | Crowds the approved desk gear; risks covering the TypeForge screen when it rises; hidden by UI in other poses |

**Recommendation: A**, with the HTML "Ask" control doing the discovery work on phones. Choose B if seeing the robot on first load on a phone matters more than its size.

### Character: what can be said without the reference

I am not proposing robot designs. A sketch now would be a generic robot standing in for the one Owen has in mind. These are constraints from the viewed room, and each is an assumption to test against the reference:

- **Size on screen.** In zone A the robot would be roughly 150 px tall on desktop and 90 px on a phone (my estimate from the headphones and mug in the captures, not a measurement). The design has to read as two or three large masses at 90 px.
- **Tone.** A light body will read against the olive panels. A dark body risks merging, as the headphone cup does.
- **State colour.** Do not rely on blue to signal state under the current light. Recheck after M6 lighting.
- **Parts.** Meshy's automatic rigging is for bipeds. A floating robot is better built as a few rigid parts with pivots, animated by hand in Blender.
- **Cost.** Assume one or two materials and one small texture until Codex gives a measured allowance.

**Three questions the reference will answer**, which decide the build:

1. Is it one body, or a body with separate floating parts?
2. Does it have a face or screen that can change, or is it expressionless?
3. Is it matte and soft like the room's gear, or glossy and emissive? The room has no environment map, so glossy metal will look flat.

## 5. Production handoff

| Stage | Tool | Output | Gate before the next stage |
| --- | --- | --- | --- |
| 0. Reference | Owen | The image, saved under `design/assistant/robot/reference/` | Owen confirms it is the right image |
| 1. Read the reference | Claude | Short written reading: silhouette, parts, face, materials, and what must change for 90 px legibility | Owen agrees with the reading |
| 2. Blockout | Blender, primitives only | Grey volume at room scale in the chosen zone, rendered from the Studio eye at desktop and phone lenses | Owen approves size and position. Uses a separate file, never the Studio team's scene |
| 3. Concept views | Higgsfield image tools | Front, side, back and three-quarter views of one consistent design on a plain background | Owen approves the design and the credit cost before any generation |
| 4. Mesh | Meshy | Textured model | Owen confirms model choice and credits (see below) |
| 5. Cleanup | Blender | Scale to Studio units (2 units is about 1 m), origin at the float centre, parts separated with pivots, materials merged, idle and state poses, GLB export | Codex validates against the Studio asset contract and the measured allowance |
| 6. Integration | Codex | Robot wired to the real events above | Checked on desktop, phone, reduced motion and keyboard |

**Notes on the tools, from the brief and the connected tool instructions (not re-verified by running them):**

- Higgsfield's hosted 3D scene tools cannot import an arbitrary GLB, so they suit stage 3, not stage 5.
- Meshy multi-image accepts one to four views of the same object. Listed prices: 30 credits for the high-detail model with texture; 15 for the low-polygon "smart topology" model with texture, which takes a single image only. Meshy's own guidance is to use smart topology with a polygon target for a real-time asset. That trades multi-view fidelity for a lighter mesh, and is a choice to make at stage 4 with the reference in hand.
- If the reference turns out to be simple geometric forms, modelling it directly in Blender may beat generation on both weight and control. I will say so at stage 1 if that is the case; the choice stays with Owen.

## Files

- `design/assistant/robot/design-direction.md` (this report)
- `design/assistant/robot/claude/placement-zones.png` (1758x1638, authored locally from the captures listed in section 1; the source captures are unchanged)
