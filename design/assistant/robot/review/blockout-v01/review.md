# Independent review: apprentice blockout v01

15 November 2026. Claude visual reviewer, `task_df17b74b1208`. I did not author the character. Written under `design/assistant/robot/review/blockout-v01/` only; nothing else was changed, and no Blender session, app, build or paid job was touched.

## Verdict: REVISE

This applies to the isolated concept stage only. The character direction works and should be kept. Six items need repair before money is spent on final assets: two visual (the idle face, the tray touching the body), one direction conflict (the no-match point), and three specification contradictions (stale cards, reduced motion, tray meaning). None needs a new interview with Owen. One small evidence gap is listed separately.

Not assessed here, and explicitly deferred: how the robot looks in the Studio room, under room lighting, behind real UI, and any triangle, byte, draw or frame-time acceptance. The blockout is in a stand-in scene, the phone proxy uses production's 64-degree lens at an estimated distance, and the cards in the renders are illustrations, not live retrieval evidence.

## What I viewed

All opened as images at native size unless noted. Paths are relative to `design/assistant/robot/`.

| Artifact | Note |
| --- | --- |
| `reference/robot-inspiration.png` | Original reference |
| `apprentice/blockout/renders/state-sheet-five-poses.png` | Five poses |
| `turnaround-front.png`, `turnaround-three-quarter.png`, `turnaround-side.png` | Neutral pose |
| `pose-idle.png`, `pose-attention.png`, `pose-sources.png`, `pose-sources-1.png`, `pose-sources-glance.png`, `pose-no-match.png`, `pose-dismissal.png` | All seven close-ups |
| `proxy-phone-390x844-fov64-{idle,attention,sources,no-match}-crop240.png` | All four phone proxies |
| `proxy-desktop-1440x900-fov58-{idle,sources,no-match}-crop240.png` | Three of four desktop proxies |
| `timeline-f062.png`, `timeline-f176.png` | Two of six timeline frames |
| [evidence/phone-proxies-4x-nearest.png](evidence/phone-proxies-4x-nearest.png) | My own aid: the four phone proxies cropped and enlarged 4x without smoothing, to count pixels. Derived, not a source render |

Not viewed: `proxy-desktop-…-attention`, `timeline-f015`, `f025`, `f057`, `f104`, `claude/placement-zones.png`. I make no claim about them.

Documents read: `brief.md`, `apprentice/README.md`, `design-spec.md`, `ui-and-state-spec.md`, `blockout/README.md`. I also read parts of `build_apprentice_blockout.py` (dimensions, poses, materials, proxy cameras), the lines of `storyboard.md` and `engineering-constraints.md` that the findings cite, and `view-config.ts` and `build-studio.ts:374` in the read-only Studio checkout to check the distance arithmetic.

## What works

- **The open-eyed poses read as a curious, warm junior.** Large round ring eyes, a head wider than the body and a cocked head in `pose-attention.png` do the job without any mouth. The goodbye arches in `pose-dismissal.png` are clearly a smile and are the warmest frame in the set.
- **The reference survives the change of palette.** Ring eyes on a dark face band, ear caps, a head floating apart from a tapered body, two leaf fins and a ring underneath are all present. The wireframe and the all-blue colouring are dropped on purpose. Cream shell on the olive stand-in backdrop gives a clean three-mass silhouette at both proxy sizes.
- **Four cards can be counted at phone size.** In the 4x aid the cards are about 7 to 9 px wide with clear gaps. One card (`pose-sources-1.png`) is unmistakably different from four. The author's claim holds.
- **The no-match pointing fin reads at phone size.** It breaks the silhouette cleanly in the phone and desktop proxies.
- **The author's self-assessment is accurate.** The README findings (idle slightly stern, rank size not readable at phone, sources fin faint, lid step visible) match what I see. I rate two of them more severe than the author does.
- **The dimensions hold together.** Recomputing from the part table gives a neutral height of 0.4255 m against the stated 0.425. The clearance box centred 0.03 below the root contains the largest pose. The 2.44 m proxy distance matches the fixed eye `[-0.7, 2.8, 3.4]` and the assumed anchor (4.889 scene units at 2 units per metre), and the 0.125 m camera drop matches too. "Nine transform nodes" matches the list.

## Must fix before spending on final assets

### 1. The idle face reads as a glare, and the far eye is cut off

Severity: high. Idle is the pose a visitor sees first and longest.

- `pose-idle.png`, `state-sheet-five-poses.png` (first pose) and the idle phone and desktop proxies: the upper lid flattens the top of both rings into the standard "unimpressed" eye shape. The visor highlight sits on the lid's lower edge and draws it as a brow line. With the head turned 22 degrees away, the combined read is stern and dismissive, not "minding the desk". This is stronger than the "a little stern" the spec allows for, and it survives at phone size (see the 4x aid, first robot).
- In the same frames the viewer-left ring is truncated at the visor edge, so the face shows one and a half eyes. The same clipping starts in `turnaround-three-quarter.png` and `timeline-f176.png` with no head turn at all, from a camera roughly 25 degrees off axis.

Repair: use the fallback the author already wrote in design-spec section 3 (lid at 6 degrees or less, or no idle lid), and keep both rings whole in idle by reducing the head turn or gaze offset or by extending the visor. How is the author's choice.

Recheck:
- Idle phone proxy at native size: both rings are closed loops, with no ring pixels removed by the visor edge.
- `pose-idle.png`: no highlighted straight edge crosses the eyes.
- A reviewer who has not seen this report describes the idle proxy with a neutral or friendly word, not stern, angry, bored or suspicious.

### 2. The no-match fin points away from the panel

Severity: high. It is a direction error in the one gesture meant to send people to Owen.

- Design-spec section 6 uses fin L for the point. Section 4 defines L as the viewer's right, and `pose-no-match.png` shows the fin extended to the viewer's right.
- `ui-and-state-spec.md` section 2 puts the desktop sheet on the **left**. The contact link is in that sheet.
- Design-spec section 6 says the fin "points toward wherever the panel's contact link sits". Under the placement both documents currently assume, it points the other way.

The **P** flag covers a future placement change. It does not cover the two documents disagreeing today.

Repair: mirror the pose (and the head roll that goes with it), or change the stated panel side. Recheck: both documents name the same side for the same placement, and a re-rendered `pose-no-match.png` shows the fin on that side.

### 3. Stale cards: "at once" and "over 130 ms" are both specified

Severity: high for truthfulness. This needs one answer before Codex builds it.

- Design-spec section 7: on dismissal and on stopped, "cards drop together 130".
- Design-spec section 8: "Cards for an old result are removed in the same frame the state changes."
- `ui-and-state-spec.md` section 4: "Old cards and chips go at once."

As written, a 130 ms window can show old cards in the room after the chips have gone. A smaller version of the same issue: cards rise 67 ms apart (section 7), while section 10 says the tray "never shows more or fewer cards than real hits". For about 200 ms the tray shows fewer.

Repair: state one rule. Either stale cards are gone on the next rendered frame and only the pose blends, or a short exit is allowed and its limits are written down. Say whether the entry stagger counts as an exception. Recheck: sections 7, 8 and 10 and UI section 4 give the same answer, and it can be tested as "N ms after the state change, zero cards from the previous request are drawn".

### 4. Reduced motion only applies to the next state

Severity: high for accessibility. The answer to the coordinator's question is: as written, it does not stop a gesture in flight.

- Design-spec section 9: "the next state change must respect it". `ui-and-state-spec.md` section 7 says the same.
- A no-match sequence runs about 1.1 s and the greeting about 0.8 s. Someone who switches the preference on during either keeps seeing motion until it ends.

Repair: specify what happens at the moment the preference changes. The minimal rule is that turning it on completes any running blend to its settled still on the next frame and skips remaining passing beats, and turning it off starts no motion by itself. Recheck: with the preference switched on mid-gesture, the next rendered frame equals the settled still in the section 9 table.

### 5. "Empty lit tray" means two things

Severity: medium-high.

- README: "An empty lit tray is 'nothing matched'". Storyboard: the tray "stays lit and empty so the empty result is plain to see".
- Design-spec section 6: attention also has a lit tray with no cards. That is the state before any search and while searching.
- In the phone proxies, attention and no match differ by the fin and the head tilt. The tray, the part said to carry the meaning, looks the same in both apart from 10 degrees of tilt.
- `ui-and-state-spec.md` section 4, row "New question while a result shows", has no robot entry. If the pose stays in sources with the cards removed, the robot presents an empty lit tray, which is the no-match picture, before any result exists.

Repair: give the robot an explicit pose for the resubmit row, and make the waiting tray differ from the presented-empty tray by something other than the fin. Recheck: the state map has a robot entry in every row; in phone proxies of attention and no match with the fins masked out, a reviewer can still tell them apart.

### 6. The body tip touches the tray in sources and no match

Severity: medium. Shape and occlusion artifact that will carry into the asset if the pose values are copied.

- `pose-sources.png`, `pose-no-match.png`, the matching phone and desktop proxies, and `timeline-f062.png` and `f176.png`: the body point meets or overlaps the rear of the tray ring. From the three-quarter camera the body appears to stand in the tray.
- Arithmetic agrees: with 26 degrees of tilt the rear rim rises to about 0.163 m below the root, slightly above the body tip at 0.168 m. The parts do not intersect, but there is no visible gap from in front.
- The spec protects the head/body gap in every pose. It says nothing about the body/tray gap, which is the other half of "three floating masses".

Repair: restore a visible gap in the two presenting poses (less tilt, a lower tray or more forward offset). Recheck: in the sources and no-match phone proxies, at least 2 px of backdrop separate the body tip from the tray silhouette, and the same holds in a three-quarter frame.

## Concrete document mistakes

Routine corrections. None changes the design.

| Where | Problem | Fix |
| --- | --- | --- |
| Design-spec section 5 | Says "five opaque materials" under a table of six. The blockout README says six. The script creates seven for the robot, because the tray glow is two materials | State one count and whether cards and the two glow levels are in it |
| Design-spec section 3, first paragraph | Says the face avoids morphs, skins and transparency "because the existing asset profile rejects the first three". `engineering-constraints.md` line 43 says the room profile is not the robot's loader and the robot gets its own profile; line 48 says those features "require explicit profile and cost review". They are not rejected for the robot | Reword as a design choice that avoids that review. Rigid lids are a reasonable provisional choice; the stated reason is wrong |
| Design-spec section 2 | Head is "49% of body-plus-head height". 0.16 of 0.31 is 52%; with the gap, 0.16 of 0.346 is 46% | Correct the figure or say what it measures |
| Design-spec sections 2 and 4 | Eyes "0.084 apart" but origins at ±0.0433, which is 0.0866 | Say which is centre spacing, or reconcile |
| Design-spec section 7 | No match is "about 1070" but the listed beats sum to 1140. Dismissal sums to 1000 against "about 870" unless the card drop overlaps the nod | State the overlaps |
| Design-spec section 2, "on axis" | The assumed anchor is about 35 degrees to the side of the eye's forward axis. The proxies are head-on | Say which way the root faces at the anchor. See deferred items |

Acceptable provisional choices that I am not asking to change: rigid lids instead of morphs, nine moving nodes, cards generated at runtime, pose blending over baked clips, 13,132 triangles as an unoptimised blockout count, all values marked **T**. The clearance box is fine, with one note: the pointing fin tip reaches about 0.193 m from centre against a 0.200 m half-width, so the margin on that side is about 7 mm.

## Should fix, lower priority

- **Lid seam and visor edge.** The spec says the lids are "invisible against the visor until they slide". In `pose-attention.png`, `pose-sources.png` and `pose-dismissal.png` a line crosses the top of the visor where the lid plate sits, and the visor's edge is notched in `turnaround-three-quarter.png`. Neither shows at proxy size. Both are blockout artifacts, but the seam belongs in the asset requirements: no visible lid edge on the open-eyed face at close-up.
- **Visor highlight.** A white hot spot sits above and between the eyes in every frame, and is about as large as an eye in the phone proxies. It is mild, and it comes from review lighting, so I do not rate it a defect yet. It is what exposes the lid seam and the brow line in finding 1. Recheck in the room.
- **Cards are the brightest thing in the frame.** In `pose-sources.png` they are flat, unshaded and brighter than the eyes. In the phone proxy the two outer cards touch the lit glow band, which is nearly the same brightness. Count still reads. Whether they bloom or distract depends on room lighting, so the brightness verdict is deferred; keeping card and glow from merging is worth doing now.
- **The fin toward the tray does not read.** In `pose-sources.png` the fin said to gesture at the tray looks like a resting fin, and the opposite fin is the more visible one. The tray tilt and the cards carry the hand-over alone. Either strengthen it or drop the claim.
- **Rank by card size.** Readable in `pose-sources.png`, not at either proxy size, as the author says. In `timeline-f062.png` perspective makes the fourth card much smaller than the others, so size is confounded by viewing angle. Treat room rank as decorative and let the numbered chips carry it.

## Evidence still needed for this stage

Small, and not a blocker to the repairs above.

- There is no phone or desktop proxy of the dismissal smile or the greeting. The smile is where the warmth lives, and I can only confirm it in close-up. One phone proxy of the dismissal pose would settle whether warmth reads at real size.
- There is no proxy from the side. See the first deferred item.

## Taste, not required

- The saturated blue ear discs and chest dot are the only cool matte colour. They read as a toy accent, which suits an apprentice. Earlier room review found blue goes grey there, so they may simply disappear.
- The body is shorter and blunter than the reference. I find it friendlier. A slightly longer taper would sit closer to the reference.
- In the held states the face is identical: round open eyes in attention, sources and no match. A small lower-lid lift in attention would make the listening pose warmer. It would have to stay out of the result states to keep the rule that no smile is tied to a result.

## Deferred to in-room and performance acceptance

- **Viewing angle.** At the assumed anchor the eye sees the robot from about 35 degrees to one side unless the placement wrapper turns it to face the eye. Every proxy is head-on. The far eye already clips at about 25 degrees. Fin overlap with the body, card order and the left/right meaning of the point all depend on this. It needs the composition proof in plan step E.
- Colour, emissive strength, card brightness and the visor highlight under real room lighting.
- Phone visibility. The UI spec says the robot is out of frame on phone home, so the phone proxy describes the view after a visitor turns toward it.
- Occlusion by room objects, hit-target conflicts with project screens, and the panel covering the robot.
- All budgets and frame timing. Nothing here is a performance claim.

## Unresolved handshake requirements for Codex

Behaviour only; appearance stays with the author and the later UI pass. The UI spec does preserve count correspondence in its intent: one card and one chip per real hit, no placeholders, nothing before the real `retrieval` event, and a failed request is kept distinct from no match. These points are what the spec does not yet pin down.

1. **One source for both views.** Cards and chips must derive from the same hit list in the same update. The Studio renders on demand, so every tray change, including clearing, needs a render request in the same tick. Otherwise the canvas keeps old cards after the chips have gone.
2. **Request identity.** Each run needs an id. The robot, tray and strip consume events for the current id only. Clearing happens at submit, not when the next `retrieval` arrives.
3. **What triggers no match.** The state map couples "0 hits" with `answer: abstained`. Define the result for 0 hits without abstained, and for abstained with hits.
4. **Hit cap.** The tray has four slots. Confirm the server never returns more, or define one rule that both views follow if it does.
5. **Failure after a result is shown.** For an error, malformed stream or cancel that arrives after `retrieval`, the state map empties the tray and hides the strip. Say whether the source list clears too, so the three never disagree.
6. **Panel closed during a request.** Say whether the request is aborted, and confirm late events are ignored.
7. **Reduced-motion switch mid-gesture.** Finding 4.
8. **Stale-card timing.** Finding 3, as a testable number.
9. **Selection identity.** Key selection by hit id, not slot index, and clear it on a new request.
10. **Late or failed asset load.** If the robot loads while a result is showing, it should take the current settled state without replaying a gesture.
11. **Hidden tab.** If the tab is hidden during a gesture, define the state on return. Settled still is the safe answer.

## Smallest useful next revision

One pass by the author, with no new generation and no paid job:

1. Change four pose values: idle lid and eye position (finding 1), the no-match side (finding 2), and tray clearance in the two presenting poses (finding 6).
2. Re-render `pose-idle`, `pose-no-match`, `pose-sources`, the four phone proxies and the state sheet. Add one phone proxy of dismissal and one proxy from about 35 degrees to the side.
3. Edit the two specs for findings 3, 4 and 5 and the table of document mistakes.

A second reviewer pass can then check the recheck criteria directly against those renders.
