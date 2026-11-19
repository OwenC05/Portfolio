# Independent visual review: selected A, candidate 001, build v01

16 November 2026. Claude visual reviewer, `task_701d7d7b17b3`. I did not build this asset. Written under `design/assistant/robot/review/build-v01/visual/` only. No source file, scene, app or Git change; no generation, paid call, Blender or browser session. The author's own inspection is not used as evidence here.

## Verdict: REVISE

This applies to the isolated candidate's appearance only. The build is recognisably Owen's A in layout and proportion, and most of the build decisions are met. It does not yet carry A's warmth. The face is where the likeness is lost: the lower lids are separate dark pads, the eyes read as flat peach discs and not as warm lights, and the poses barely change the expression.

All repairs are local to named parts or pose values. None redesigns A, and none needs a new image.

Not assessed: room or phone placement, browser material fidelity, performance, budget, and the technical validity of the GLB. The 2 m mobile projection is a sensitivity study and I treat it as one.

## What matches the chosen A

| Aspect | Finding | Evidence |
| --- | --- | --- |
| Silhouette and proportions | Head about 10% wider than tall, depth about equal to height. Body, mittens and tray are in the reference's proportions; the tray is about nine-tenths of the head width | `neutral-front.png`, `neutral-side.png`, profile `appearanceConstraints` |
| Face | Opaque, dark, slightly inset behind a thin brass rim. No dome, no cavity | `neutral-front.png`, `neutral-side.png` |
| Back of head | Plain porcelain, no level seam | `neutral-contact-sheet.png` (back panel) |
| Body top | Closed, domed brass cap. The open-urn reading is gone | All neutral views |
| Finish | Plain porcelain and brass. No window reflections, no craze lines, no textures | All renders; manifest lists 0 textures |
| Separation at rest | Clear gaps between head, body, both mittens and tray | `neutral-front.png` |
| Gaze at rest | Pupils centred side to side and slightly high, as agreed | `neutral-front.png` |
| Bookmark position | Character's left of the crown, leaning outward, ribbon on the outer side, notched | `neutral-front.png`, `neutral-three-quarter.png` |
| Export | `reimport-front.png` is visually the same as `neutral-front.png` | Both viewed |

## Root's concern about the lids

Root is right, and I rate it the main defect. Each lid is a closed, pill-shaped pad with its own visible lower edge. It is wider than the eye it belongs to, and it stands off the face far enough to show as a snout-like bump in the side view. In the reference the lid has only a top edge: it is a soft rise of the face itself that fades into the face below. The build's pads read as cheeks, bags under the eyes, or a moustache, depending on the angle.

The amount of eye covered is correct, about a fifth. The shape is the problem, not the coverage. See [evidence/face-reference-vs-build-vs-side.png](evidence/face-reference-vs-build-vs-side.png): reference, build front, build side.

## Repairs, by severity

Values are quoted from `build_asset.py`, `profile.json` and `poses.json` at the pinned hashes. "Raw" means the script's raw units; the profile's scale is 0.603 m per raw unit.

### 1. High: lower lids read as separate pads

- **Nodes:** `APA_lid_lower_L`, `APA_lid_lower_R`. Material `MAT_APA_ink`.
- **Seen in:** `neutral-front.png`, `neutral-three-quarter.png`, `neutral-side.png`, all five pose renders.
- **Cause, in the geometry:** the lid patch is 1.16 times the eye's half-width, 0.024 raw in half-height (about 29 mm tall) and bulges 0.009 raw (about 5 mm). It is a complete ellipse sitting on the face.
- **Smallest change:** keep the top edge and the coverage. Make the lid no wider than the eye, and let it fade into the face at its sides and bottom so that no lower outline exists. Reduce how far it stands off the face.
- **Accept when:** in the neutral front render no closed lid outline is visible below either eye; in the neutral side render the lid does not project forward of the eye disc as a separate bump; the lid still covers about the lowest fifth of each eye.

### 2. High: the eyes do not read as warm lights

- **Nodes:** `APA_eye_L`, `APA_eye_R`. Material `MAT_APA_eye_emit`.
- **Seen in:** every render. The eye discs are a flat pale peach and are darker than the porcelain around the face. In the reference they are the brightest thing in the picture.
- **Rendering or material?** Both, and they must be kept apart. The reference's soft halo is a render bloom that was correctly left out. The grey studio light and Cycles tone mapping also flatten the eyes. But the material value itself is a saturated orange (linear base colour 1.0, 0.52, 0.15 at strength 2.5), while the reference eye is a warm cream. Cycles shows peach; a browser may show orange or yellow. Neither is the reference.
- **Smallest change:** move the eye colour toward warm cream, and judge the result in the actual runtime, not in Cycles.
- **Accept when:** in a browser capture under the room's lighting, the eyes are the brightest part of the robot and read as warm cream, not peach, orange or yellow. I cannot verify this from the present renders, so this item is a required check as much as a repair.
- **Eye scale:** correct. The discs are about 23% of the head width each, as in the reference. The pupils are a little smaller (about 42% of the eye width against roughly 48%), which adds a slightly startled look. Enlarging `PUPIL_R` a little is optional.

### 3. Medium: the poses do not change the expression

- **Values:** lid travel is ±1.2 mm on a 71 mm eye (`lidLimits`, used in attention and dismissal). Pupil shifts are 2.4 mm. Head rotations are 2 to 6 degrees. Mittens move 3 to 12 degrees. Root lift is 3 to 4 mm.
- **Seen in:** `five-poses.png`. Neutral, attention and dismissal are nearly the same picture. Sources and no match differ from them by the tray, and from each other only slightly.
- **Why it matters:** the agreed warmth lives in the perk-up and in the hello and goodbye smile. A 1.2 mm lid move is not a smile.
- **Smallest change:** raise the lids visibly for the smile, to roughly a third of the eye, stopping short of the pupil. Give attention a head tilt and hand lift that can be seen in the contact sheet. Exact amounts are the author's.
- **Accept when:** in a five-pose contact sheet at the current size, each pose can be named without its label, and the dismissal face is visibly smiling compared with neutral.
- **Note for root, not a defect:** no match has no gesture of its own. The earlier blockout pointed toward the panel. Whether A needs that is root's decision.

### 4. Medium: presented tray closes the body gap, and its floor reads as a filled plate

- **Nodes:** `APA_tray`, `APA_tray_glow`. Material `MAT_APA_tray_emit`.
- **Seen in:** `pose-sources.png`, `pose-no-match.png`, and [evidence/sources-tray-closeup.png](evidence/sources-tray-closeup.png).
- **Gap:** sources raises the tray 18 mm and tilts it 16 degrees; no match raises it 12 mm and tilts it 12 degrees. In both renders the body tip overlaps the tray and appears to rest in it. This is the same fault the v01 blockout review found. The pose camera looks slightly down, which makes it worse, but the raise is what removes the gap.
- **Floor:** the tray's inner disc is a flat pale cream. It reads as paper or a filled plate, not as a lit brass dish. On an asset whose tray must look empty until real results arrive, that is worth fixing. A bright radial streak also crosses the disc; that is a shading artifact in `APA_tray_glow`.
- **Smallest change:** present the tray by tilting and moving it forward without raising it toward the body. Make the floor read as brass with a soft warm light, and remove the streak.
- **Accept when:** backdrop is visible between the body tip and the tray in the sources and no-match renders from the same camera; the tray floor reads as brass; no streak.
- **Note for root:** tray emission is 0.8 for sources and 0.55 for no match. That makes glow brightness depend on whether results exist. Check it against the agreed tray rules.

### 5. Medium: the bookmark is about half the reference's size

- **Nodes:** `APA_bookmark_post`, `APA_bookmark_ribbon`. Material `MAT_APA_ribbon`.
- **Seen in:** `neutral-front.png`, `neutral-three-quarter.png`, `neutral-side.png`.
- **Finding:** post and ribbon are each about a fifth of the head's height. In the reference they are roughly two-fifths. The reference's ball top is missing. The bookmark is A's one accent and part of its outline; here it is a small tick.
- **Smallest change:** scale the post and ribbon up to about the reference's size and add the rounded top.
- **Accept when:** in the neutral front render the post and ribbon are each about a third or more of the head's height.
- **Colour:** the ribbon renders salmon pink, but its stored colour is a deep red. That is the lighting. Check it in the browser.

### 6. Low: the seam is a broken hairline

- **Node:** `APA_seam`. A 0.0024 raw-radius tube (under 3 mm across), 1 mm off the shell.
- **Seen in:** `neutral-side.png`, where it runs from the crown to about eye level and stops; `neutral-three-quarter.png`, where it wavers.
- **Smallest change:** make it a continuous, even band all the way round, thick enough to read as brass. The reference band is roughly twice as wide.
- **Accept when:** the side render shows one unbroken ring from crown to chin.

### 7. Low: faint facets on the head's front band

- **Node:** `APA_head`, the rebuilt band between the face rim and the seam.
- **Seen in:** `neutral-front.png`, as vertical streaks above the face.
- **Smallest change:** smooth the shading there. Not visible at small size.

## Does it still feel like the eager apprentice?

The body does. The head shape, floating parts, cap and tray are A. The face does not yet. With flat peach eyes, pad lids and slightly small pupils, the look is blank and a little tired, where the reference is bright and keen. Repairs 1 to 3 are what restore the character; 4 to 7 are finish.

## Material defaults and room lighting

From the stored values only. Cycles does not show what a browser will.

- **Porcelain** (roughness 0.37, warm cream base): a sensible default. It should hold as a light shape in a dim warm room. It renders cooler here than its stored colour because of the grey studio light.
- **Brass** (metallic 0.78, roughness 0.30): depends on what the room gives it to reflect. Without an environment it may go dark or flat. Check in the browser.
- **Ink** (near black, roughness 0.58): fine for the face. It will hide the lids, which is what repair 1 wants.
- **Eye and tray emission:** the two values most likely to look different in the browser. See repairs 2 and 4.

## Mobile sensitivity projection

In `isolated-mobile-fov64-at-2m.png` the robot is roughly 120 px tall. The three masses, the two eyes with pupils and the red accent can be made out. The lids merge into the face. This is one assumed distance with no room drawn, so it supports no placement or phone claim.

## Smallest next step

One revision by the asset author covering repairs 1 to 5, with 6 and 7 if convenient, coordinated through root. Then re-render the same neutral views and five poses from the same cameras. Repair 2 also needs one browser capture before it can be closed.

## Files inspected

Asset directory: `design/assistant/robot/asset-pipeline/selected-a-v01/candidate-001/build-v01/`.

| File | SHA-256 | How used |
| --- | --- | --- |
| `selected-a.glb` | `775733a18559d7f52dd6bd71e7ec518a9783ef3c9e95dd753b3072e553587232` | Hash checked; judged through its renders, not opened in a viewer |
| `profile.json` | `3c8d967715892f5ee2430b252bafdc3d1a55c767fb949cf55f6475b260c6f550` | Read: materials, constraints |
| `poses.json` | `6e32e89bd68e47ea2638302211e0d45da38f078e9201e6c71b903ca4c05aacc6` | Read: all five poses, eye constraints |
| `manifest.json` | `c6c53f0748d228e159ea6e883dd0624ced59e832096c09f72c0f01c91c5d1e68` | Read |
| `neutral-contact-sheet.png` | `cf65edf645cd34ffed793c3e4f8d816852861f5c372ac2fbc0bf162afaaa2ff6` | Viewed |
| `five-poses.png` | `551db1ccd3ef705088b37849394d3f8098f8efb5c7a730ecad6e8dd8c6fe8f34` | Viewed |
| `renders/reimport-front.png` | `1c23461bbf6f2445fbfac31e31beedaa043229709f2328864cbf048cefbbd433` | Viewed |
| `renders/isolated-mobile-fov64-at-2m.png` | `dc4e60c44556fdcc5a859dda877131d4271bb1f0bcae011ab1843de8f64e4894` | Viewed |
| `renders/neutral-front.png` | `506b2e20ea33a52c349aa62616ae690e064e0247151402890d2d10d361dc3a36` | Viewed at full size |
| `renders/neutral-three-quarter.png` | `b15d7ed171227f24b5e7ec19069ba83f74a1b9dbe165ed74d24b0e38a2b976fe` | Viewed at full size |
| `renders/neutral-side.png` | `8cdd2d95d3e264cd7bdef7f4647e1e32fd1856e6a9b690eceadb03079e33ef56` | Viewed at full size |
| `renders/pose-sources.png` | `74e66c8c776e51635da5c97ac0109fa85a20e6ccb0d1c4b22bd8845177c19e8d` | Viewed at full size |
| `renders/pose-no-match.png` | `bfb26b2ae468628fd23e168ce950e6fb59dfe706f829e657a46bc01340ff5735` | Viewed at full size |

Reference: `higgsfield-concepts/selected-a-v01/outputs/02-front.png`, SHA-256 `9b94d861e18d5c95f439847e30a81aa7a036110f0105585a8914126bfc9c8cc7`, viewed at full size.

Seen only inside the contact sheets, not at full size: `neutral-back.png`, `pose-neutral.png`, `pose-attention.png`, `pose-dismissal.png`. Not opened: the raw clay renders and `selected-a.blend`.

Also read: the build `README.md`, the constants and pose lines of `build_asset.py`, my `review/selected-a-v01/review.md`, and `selected-a-build-decisions.md`.

My two evidence images are crops and enlargements of the files above, made for comparison. They are derived, not source renders.
