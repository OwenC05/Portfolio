# Independent visual recheck: selected A, candidate 001, build v02

17 November 2026. Claude visual reviewer, `task_ee4bb4859e42`. I issued the build-v01 REVISE and did not author v02. Written under `design/assistant/robot/review/build-v02/visual/` only. No asset, source, app, Git, Blender, browser, server or paid action. Every image named below was opened and looked at; the GLB was judged through its saved renders and captures, and I read its material values from the file's JSON header without opening it in a viewer.

## Verdict: PASS for isolated v02 appearance

All seven v01 visual findings are closed or reduced to low severity. The build now reads as Owen's A: wide porcelain head, dark inset face, two large bright eyes with soft raised lower lids, teardrop body, mitten hands, brass tray, one red accent. The lids, which were the main v01 failure, are fixed.

One residual is medium and should be corrected before in-room acceptance: the eyes clip to plain white in the browser. It is a single material number, not geometry, and does not need a redesign.

This pass covers isolated appearance only. It does not accept the anchor, the phone view, pose legibility at room size, interaction, markers, cost or technical validity.

## v01 findings, rechecked

| # | v01 finding | v02 status | What I saw |
| --- | --- | --- | --- |
| 1 | Lids were pill pads with a snout bump (high) | **Closed** | `APA_lid_lower_L/R` now follow the face. Front: a soft arched top edge cutting the lowest fifth of each eye, same width as the eye. Side (`renders/neutral-side.png`, `viewer/webgl-neutral-side.png`): nothing projects beyond the face outline. No pad, cheek outline or snout. Low residual below |
| 2 | Eyes flat peach, darker than porcelain (high) | **Mostly closed; medium residual** | Eyes are now the brightest thing in every capture. In WebGL they are plain white, not warm cream. See residual 1 |
| 3 | Poses did not change expression (medium) | **Closed in isolation** | `five-poses.png`: attention lifts and tips the head with raised mittens and reads as perking up; dismissal turns away with higher lids and reads as settling. Sources and no-match differ mainly by head turn. Room-size legibility is not evidenced |
| 4 | Presented tray rose into the body, cream plate, streak (medium) | **Closed** | `renders/pose-sources.png`, `renders/pose-no-match.png`: clear gap between body tip and rim; tray moves forward and down. Streak gone. Low residual below on floor tone |
| 5 | Bookmark half size, no ball top (medium) | **Closed; low residual** | Post with ball top is about 41% of head height, matching the reference (about 42%). Ribbon width and notch match. Shaft is thin |
| 6 | Seam a broken hairline (low) | **Closed** | `APA_seam` is one continuous ring crown to chin in Cycles and WebGL. Back of head plain |
| 7 | Facets on head front band (low) | **Closed** | Smooth in `renders/neutral-front.png` and `viewer/webgl-neutral-face.png` |

## Residual repairs, most severe first

| # | Severity | Part | Images | Finding | Smallest correction |
| --- | --- | --- | --- | --- | --- |
| 1 | Medium | `MAT_APA_eye_emit` on `APA_eye_L/R` | `viewer/webgl-neutral-face.png`, `webgl-neutral-front.png`, `webgl-room-desktop-home.png` | Eye pixels are (252,251,248): neutral white, cooler than the porcelain at (232,218,194). The reference eye is warm cream, about (254,248,219) at centre and (253,229,180) toward the edge. The stored colour is warm (linear 1, 0.87, 0.60) but strength 4 pushes all three channels past the tone-map ceiling, so the hue is lost. This is a material value under ACES, not geometry and not a Cycles artefact | Lower emissive strength until the centre lands near (254,240,205) in the same viewer; my estimate is strength 1 to 1.5. Keep the colour. Confirm with one new WebGL face capture. The author's "luminous cream" claim should read "luminous white" until then |
| 2 | Low | `APA_tray_glow` / `MAT_APA_tray_emit` | `viewer/webgl-neutral-quarter.png`, `webgl-sources-quarter.png`, `webgl-no-match-quarter.png` | Tray floor is a flat bright yellow, about (244,191,92), in every pose, brighter than the rim. Stored emission is tiny (0.056 linear), so this is the room's overhead light on rough brass, not glow. It is the same in sources and no-match, so it makes no false claim. It reads as a filled yellow disc more than an empty dish | Optional: darken the floor base colour by roughly a third, or lower its roughness, so the rim stays the brightest part. Not required to pass |
| 3 | Low | `APA_bookmark_post` | `renders/neutral-front.png`, `viewer/webgl-neutral-front.png` | Height is right, but the shaft is about 3.6% of head width against about 8% in the reference. It reads as an antenna more than a turned post | Thicken the shaft to roughly double, keep height and ball. Check the wall-light margin after, since width grows the sweep little but not zero |
| 4 | Low | `APA_lid_lower_L/R` | `renders/neutral-front.png`, `viewer/webgl-neutral-face.png` | Faint vertical side edges of each apron show below the eye in close-up, as a soft boxed shape. Not visible at room size | Feather or widen the apron's lower sides into the face, or match shading normals at the border |
| 5 | Low | `APA_body` | `viewer/webgl-neutral-front.png`, `webgl-room-desktop-home.png` | A small dark grey pinch at the body tip in WebGL; Cycles shows a clean warm tip | Repair normals at the tip pole |
| 6 | Low | `APA_head` | `viewer/webgl-neutral-side.png` | Slight blotchy shading on the lower shell near the chin end of the seam | Smooth normals there; cosmetic |

Taste, not required: `APA_seam` at its doubled radius is about as heavy as the face rim in close-up. The reference seam is finer. It reads correctly at room size.

## Likeness to A

Matches: head about 10% wider than tall; opaque inset face with brass rim; single coronal seam; plain back; closed brass cap; plain porcelain with no baked reflections; clear gaps at rest; pupils centred and a touch high with one fixed highlight; lids at the lowest fifth.

Still different from the reference: eye warmth (residual 1), and the lit upper edge on each lid, which in the reference comes from eye glow spilling onto the lid. That spill was ruled a render effect and is correctly not modelled. Warmer eyes will recover most of the feeling.

## Cycles versus WebGL

| Question | Cycles (AgX, studio lights) | WebGL (ACES 1.2, room lights) | Judged from |
| --- | --- | --- | --- |
| Lid shape and side profile | Clean | Clean | Both agree; geometry |
| Eye colour | Off-white | White, clipped | WebGL; material value |
| Tray floor | Tan plate | Bright yellow disc | WebGL; room lighting |
| Body tip pinch | Absent | Present | WebGL; normals |
| Porcelain tone | Cool white | Warm cream | WebGL is the truer A |

## Room capture at the fixed desktop camera

From `viewer/webgl-room-desktop-home.png` (1440x900, neutral only). Crops are in `evidence/`.

- Size: head about 130 px wide, each eye about 30 px, pupil about 12 px, highlight about 3 px. Eyes, pupils, the lid cut and the red ribbon are all readable. It reads as a small friendly character.
- Facing: the robot faces the eye.
- Wall lights: the nearest light tip is about 25 px, roughly 1.5 degrees, from the head's upper left and from the bookmark. No silhouette overlap in neutral. The -0.986 degree figure is a box warning only, and this capture agrees with that reading. Attention lifts and tips the head, and that pose was not captured from this camera.
- Clutter: the tray is seen edge-on as a thin gold line sitting just above the speaker and just left of the cymbal. Separate, but busy. The ribbon sits against the dark slatted panel and reads well.
- Placement: nothing in this capture requires a move. If root wants more room, the only supported direction is a small shift up and right, limited by the 0.5 degree speaker margin; down or left makes the tray and light crowding worse. I do not recommend a specific number.

## Limits of this pass

- Pose legibility at room size is unproven. Only neutral was captured from the fixed camera; the pose captures use a closer inspection camera. At room size the 20% to 33% lid change is about 2 to 3 px, so attention and dismissal will be carried by head tilt and mittens.
- Phone view is unassessed. `renders/isolated-mobile-fov64-at-2m.png` is a Cycles render with no room; the head is about 62 px and pupils about 6 px there.
- No motion, interruption, runtime cards, markers or UI were seen.
- Triangle and byte cost doubled from v01; that is Codex's and root's to accept.
- Geometry contracts, hinge ranges and the validator were not reviewed here.

## Pinned files

SHA-256, recomputed here. Paths under `asset-pipeline/selected-a-v01/candidate-001/build-v02/` unless noted.

| File | SHA-256 |
| --- | --- |
| `selected-a.glb` | `bc1a4d6d968dd53eda3480936959d0ebf292e76652a6bbdd201e15f4cd665270` (matches brief) |
| `profile.json` | `f5dbf7f2a9e3e57332c62c21e27013d6ce05d11085fac94ec979631e4728e33e` |
| `poses.json` | `6dd7ce35a027352b4f2cffbe673081910837e69d56c9f4ec866e970381c6e96d` |
| `manifest.json` | `5ab01dc63a952d618877e150729b443ecb4cf9922cd3bdf1df7a985e6f6f7423` |
| `README.md` | `05c2686f4ca6e8aba43d4c63a17da31f61a8bdae60fed0c62e0e0fe0330ad3e7` |
| `review-response.md` | `77fd84168c985f051b7bd46cdd88487b6f91a4a6d34124b04593559224dc7e1d` |
| `neutral-contact-sheet.png` | `bfe323dc4cf873533622110cc6892b37dae8aafee3255a77cfb2d08e2e895e02` |
| `five-poses.png` | `16c08330a246ac92c3f76b799d560cb14229550bd88bc860cfa6faa5233e931a` |
| `renders/neutral-front.png` | `55d3188e02af93f31448f00091c2f32d816845b5541bc5fd6a5397120e874338` |
| `renders/neutral-side.png` | `183ca6bc0e568a38a604fa9dcd003b9ac8c27be39062853c01be873d41ab1b27` |
| `renders/pose-sources.png` | `5260e101c833fbcaa20c0d34965649be184b9fbcb2fd5c4b2b8bf1c926358d84` |
| `renders/pose-no-match.png` | `3e5ce0204564e05db4c00f73f8a2513d01bf6b3a261b8344e0d5cf27b70f4afa` |
| `renders/pose-attention.png` | `7fa669f3e1e571015962b3899780081ed3a14773afca45c29235f722b5b70b26` |
| `renders/pose-dismissal.png` | `da50c523ee3fc0ca1ddebfe1c5909264fd6144a50cfafd7aabf2450fc41a7fd0` |
| `renders/isolated-mobile-fov64-at-2m.png` | `5ba53ded5da0f4f7e3e7017cf7e93e636be37a1c0b548d7fc9fa938379872439` |
| `viewer/webgl-neutral-face.png` | `c299855900d46629afae076ee044c44a16c8ae736092db9e56a02f43fd3af56c` |
| `viewer/webgl-neutral-side.png` | `395192b38f1c023a18cebba58c1d77981e9a06c9801fd5cdda2b2cc26c222b99` |
| `viewer/webgl-room-desktop-home.png` | `22a4b9abf97cc65c7544a44103ba24d68936deb5f31794c639dc11cf1b76ecd5` |
| `viewer/webgl-neutral-front.png` | `d7c4c4d5d9f97bf73ed2981064899f4b9db419d2dc26fed4387a533617db67cd` |
| `viewer/webgl-neutral-quarter.png` | `a702db43c781543efd3fdd1df22e7e2f9890045fd350b9f4c39e5547bd5bbbf1` |
| `viewer/webgl-attention-quarter.png` | `87a04c0e52dcee211c0c8db313432d859aa66d0dca0ba9ee34502f0755dc64a4` |
| `viewer/webgl-sources-quarter.png` | `3837e67ab7232f2530d8e2d3ccabc13b3f0c9a7e224e9f24db4337322cb56a1e` |
| `viewer/webgl-no-match-quarter.png` | `c1fddd405b42f9fe3dd86ab8165b12fb70dd99becc7524b936e11717a3bf6d58` |
| `viewer/webgl-dismissal-face.png` | `b41756e3abb99746d80175f37bf6d88b5f16dff014519e73ea07762283223bd1` |
| `higgsfield-concepts/selected-a-v01/outputs/02-front.png` (reference) | `9b94d861e18d5c95f439847e30a81aa7a036110f0105585a8914126bfc9c8cc7` |
| `review/build-v01/visual/review.md` | `9a2248c880cd407f6b57576a994733664b8f7502359bb7387c52497ae7b3ce5c` |
| `review/build-v01/visual/evidence/face-reference-vs-build-vs-side.png` | `1b16f75f6c541932fb3bc4f73e7c79df6aef99f0ce6a7135a80f7b37f912b73d` |

Not opened individually: `renders/neutral-back.png`, `neutral-three-quarter.png`, `pose-neutral.png`, `reimport-front.png`; the first three were seen inside the contact sheets. Also read: `selected-a-build-decisions.md`, `viewer/pixel-samples.json`, `placement-check.json`.

Evidence made here, in `evidence/`: `room-robot-native.png` and `room-robot-4x-nearest.png` (unsmoothed crop of the room capture), `lids-cycles-front-side-webgl-side.png` (enlarged lid crops).
