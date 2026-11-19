# Independent review: selected A, refinement v01

16 November 2026. Claude visual reviewer, `task_551dd19c4ec3`. I did not author the concept or the refinement. Written under `design/assistant/robot/review/selected-a-v01/` only. No generation, paid call, Blender, browser, build, app or Git action. The five source images were read, not changed; their hashes match the author's receipts.

## Verdict: PASS for bounded visual-build readiness

The refinement keeps the character Owen chose, and the four images are enough to build from. No image needs regenerating. Every contradiction between the views sits in a part that has to be modelled by hand anyway, and each is settled by the guidance below.

Two of the author's "fixed" labels are too strong and should be corrected in the README: the finish, and the body top. Neither blocks the build.

This pass covers the look and the reference set only. It does not approve a budget, dimensions, a final mesh, runtime behaviour, phone-size or in-room legibility, or any acceptance by Owen beyond choosing direction A. None of these images shows the robot at phone size or in the room.

## Does it preserve Owen's A?

Yes. The wide porcelain head, dark face, two large warm eyes with raised lower lids, teardrop body, floating mitten hands, brass tray and single red accent are all the same character as round one. Nothing has drifted toward the v02 ring eyes or direction C. The warmth comes from the eyes and lids, and both survived intact.

## The claimed fixes, checked against the images

| Claim in the README | My finding | Evidence |
| --- | --- | --- |
| Attentive forward gaze: "mostly fixed" | **Agree.** Front: pupils centred side to side and about a fifth of the eye's height above centre. Hero: also a little to the character's upper left. It reads as looking up at the visitor, not away | `02-front.png`, `01-three-quarter.png`, face crops |
| Flag to bookmark: "fixed" | **Agree.** A narrow notched red strip hanging from a short brass post in all four views. No wave | All four |
| Calmer finish, "no window shapes on the head, body or face panel", crackle "gone" | **Overstated.** A four-pane window reflection with a clear cross bar sits on the upper body in the hero, and a fainter one on the body in the front view. Fine craze lines are still visible on the hero body. The head and hands show long strip highlights, not window grids. The face no longer shows window panes. It is much calmer than round one, but it is still a glossy glaze, not satin | Hero body crop, front body crop |
| Closed body top: "partly fixed" | **Agree, and I would put it lower.** The brass collar surrounds a flat dark disc in all four views. At a glance the body still reads as a small urn with an open neck | All four, body crops |
| Lower-lid expression kept | **Agree.** Each lid is a soft dark mound with a lit upper edge covering roughly the lowest fifth of the eye. It is the main source of the friendly look | Face crops |
| Gaps kept, tray empty, hands neutral | **Agree** | Hero, front |

Root's suspicion is correct. Use "calmer, with window reflections still on the body" in place of "no window reflections".

## Coherence between views

Pixel extents, measured from the files with a colour mask. They are approximate and the views are not true flat projections.

| | Hero | Front | Side | Back |
| --- | --- | --- | --- | --- |
| Head, width x height (px) | 753 x 657 | 738 x 668 | 611 deep x 632 | 699 x 661 |
| Tray width (px) | 668 | 664 | 652 | 666 |

| Feature | Agreement | Finding |
| --- | --- | --- |
| Head silhouette and depth | **Good, better than the README says** | The head is about 10% wider than tall from the front, and about as deep as it is tall from the side. That is one consistent shape: a ball slightly stretched sideways. The back view is a little rounder (6% wider than tall) and the side is drawn about 5% smaller. No real conflict |
| Brass seam | **Back view contradicts** | Hero, front and side agree on one ring running over the crown and under the chin, a little behind the face. The back view shows a level seam round the middle instead, and no trace of the ring |
| Face | **Side view contradicts; front views are ambiguous** | The side view shows a clear dome bulging forward with the eye inside it. The hero and front show a dark face with a glassy rim highlight, which can also be read as glass over a cavity. No view shows a plainly opaque face |
| Ribbon | **Side view contradicts** | Front, hero and back agree: the post is on the character's left of the crown, leaning outward, with the ribbon down its outer side. The side view hangs the ribbon to the rear. An outward lean would not show from the side, so the post itself does not conflict |
| Body, collar, hands | **Good** | Same teardrop, collar and mittens in all four. The side view overlaps the near hand on the body, as expected |
| Tray | **Good** | Same shallow round brass dish and rim in all four, within 3% in width. The inner glow is strong in hero and front and nearly absent in side and back |
| Camera | **Shared flaw** | Every view looks slightly down on the tray and level at the head. The hero head is tilted and is close to a front view |

## Production recommendation

Aesthetic guidance only. Input mechanics, settings and cost are Codex's.

**Canonical single image: `selected-a-v01/outputs/02-front.png`** (SHA-256 `9b94d861…8cc7`). Reasons, all visual: the head is level and symmetric, the gaze is centred, both hands are neutral and mirrored, the window reflection is fainter than in the hero, and the seam, ribbon and tray are all shown in their agreed positions. Its limit is that it carries no depth; depth comes from the guidance below, not from the image.

If Codex's provider evidence favours an angled input, `01-three-quarter.png` is the same character and is acceptable. Its tilted head, stronger window reflection and off-centre pupils must then be treated as things to correct, not to copy.

**Multi-image input.** No set of all four is coherent. The only pair I would allow is `02-front.png` with `03-side.png`: their head, body, hands and tray agree, and their two conflicts (the clear dome and the rear-hanging ribbon) fall on parts that are rebuilt by hand. **Exclude `04-back.png`** because of its level seam. Exclude the hero from any set that includes the front, since its tilt makes it a conflicting near-duplicate. Whether a pair is worth using over a single image is Codex's call.

**No regeneration is required.** The back view does not need redoing: it is excluded from generation, and the back of the head is specified below.

## Decisions to retain in the build

These settle each contradiction without changing A's identity. All are achievable in Blender.

| # | Part | Build it as |
| --- | --- | --- |
| 1 | Head shell | A ball about 10% wider than tall, depth about equal to height. Level in the neutral pose |
| 2 | Seam | One thin brass ring over the crown and under the chin, a little behind the face, as in the side view. The back of the head is plain porcelain. No level seam |
| 3 | Face | Opaque dark surface following the head's curve, set in slightly behind a thin brass rim. Not transparent, not a bulging dome, no cavity. Eyes sit on it |
| 4 | Eyes and pupils | Flat warm glowing discs; dark pupil with one small fixed highlight. Rest position centred side to side and centred or a touch high. The soft glow spilling below the eyes is a render effect; do not model it |
| 5 | Lower lids | Keep them. Face-coloured, covering roughly the lowest fifth of each eye at rest, with a soft rounded top edge. No upper lid or brow |
| 6 | Post and ribbon | Short brass post on the character's left of the crown with a slight outward lean; rigid notched red ribbon down its outer side, as in front and back |
| 7 | Body top | A closed, slightly domed cap in the collar's brass, lit like the collar. No dark disc and no recess |
| 8 | Finish | Plain warm-white porcelain with a soft, even sheen. No window reflections, no craze lines and no baked highlights in any texture taken from these images |
| 9 | Tray | Shallow round brass dish, about nine-tenths of the head's width, level at rest, empty. The inner glow is not part of the shape; how it behaves follows the existing tray contract |
| 10 | Gaps | Head, body, two hands and tray stay separate with clear space between them, as in the front view |

## Fix list

| Item | Owner | Blocking? |
| --- | --- | --- |
| Correct the README's finish row: window reflection and faint craze lines remain on the body in hero and front | Author | No |
| Correct the README's head-shape issue: the views agree within about 5 to 10% | Author | No |
| Carry decisions 1 to 10 into the build brief; exclude `04-back.png` from any generation input | Root and Codex | Needed before a generation or modelling job |
| If any texture is taken from a generated mesh, check it for the window reflection and craze lines (decision 8) | Whoever builds | At build time |
| Phone-size and in-room legibility of the pupils, lids and ribbon | Root, with real evidence | Not assessed here |

Taste, not required: the slightly upward gaze is charming and could be kept as the neutral look. Centring it is the safer default for a robot that will be seen from one fixed eye.

## Inspected files

All opened as images at full size. Paths under `design/assistant/robot/higgsfield-concepts/`.

| File | SHA-256 (start) |
| --- | --- |
| `outputs/A-porcelain-clerk.png` (round one) | `30d240dd` |
| `selected-a-v01/outputs/01-three-quarter.png` | `a1876179` |
| `selected-a-v01/outputs/02-front.png` | `9b94d861` |
| `selected-a-v01/outputs/03-side.png` | `d33e551a` |
| `selected-a-v01/outputs/04-back.png` | `d6384f1c` |

I also made temporary enlarged crops of the hero and front faces and of the three front-facing bodies to check the reflections; they were inspection aids outside the repository and are not kept here. Documents read: `selected-a-v01/README.md`, `selected-a-v01/handoff.md`, `.omx/context/robot-concept-a-refinement-task.md`. I did not read the prompt text files or re-audit receipts beyond the file hashes.
