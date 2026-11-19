# Independent eye-material recheck: selected A, candidate 001, build v03

17 November 2026. Claude visual reviewer, `task_a97b0f1e680f`. I issued the v02 PASS with one medium eye residual and did not author v03. Written under `design/assistant/robot/review/build-v03/visual/` only. No asset, app, Git, Blender, browser or paid action. Scope is the one eye finding plus a look at the five static room endpoints. v02's closed geometry findings were not re-reviewed, and its optional low findings stay deferred.

## Verdict: PASS. The medium eye finding is closed.

At strength 1.0 the eyes in the delivered-v03 browser capture are a soft ivory, about (245,241,231), where v02 was clipped neutral white (252,251,248). They are still the brightest part of the character, pupils and highlights are crisp, and they no longer look stark or colder than the porcelain around them.

They are paler than the illustration's glowing cream. That gap is a low, optional taste item, not a defect: the remaining warmth would have to come from a more saturated base colour, which was outside this delta. I do not ask for it.

## Evidence

| Check | Result | Seen in |
| --- | --- | --- |
| Clipping | Gone. Red minus blue is about 14 to 16 at strength 1, against 3 to 4 in v02 | `viewer/webgl-neutral-face.png`; my samples (245,241,231) and (246,242,233) at eye centres, (243,238,228) lower in the disc |
| Choice of scalar | Agree with 1.0. In the side-by-side, 1.0 is visibly the warmest; 1.25 and 1.5 drift back toward white | `viewer/emission-comparison.png` |
| Readability at room size | Unchanged from v02. Eyes about 30 px, pupils and lid cut clear | `viewer/webgl-room-neutral.png` |
| Against porcelain | Eyes are lighter and less yellow than porcelain (232,218,194), and read as lit, not painted | Face capture |
| Other materials | Look identical to v02; consistent with root's byte comparison, which I did not repeat | Face and room captures |

## Five static room endpoints, fixed desktop camera

Judged from the author's crop sheet and my own unsmoothed 3x crops of the five full captures (`evidence/room-five-poses-3x-nearest.png`). Neutral and attention were also viewed full frame.

| Pose | Reads as | Note |
| --- | --- | --- |
| Neutral | Calm, facing the visitor | Baseline |
| Attention | Clearly different: head tipped up, pupils up, mittens raised | The strongest pose |
| Sources | Different from neutral: tray tilts to show its floor, head turns | Clear |
| No-match | Almost the same picture as sources; only the head turn differs | Acceptable only because cards, not the pose, carry the result. Root should know the pose alone does not separate them |
| Dismissal | Close to neutral: slight head turn, lids a little higher | Subtle at this size; fine as a settle |

Wall lights: no silhouette overlap with the nearest light in any of the five. Attention comes closest, with roughly 20 px of clear wall between the light tip and the head. No obvious composition problem beyond the tray-above-speaker crowding noted in v02.

## Not covered

Motion between poses, interruption, runtime cards, markers, phone view, final anchor, cost and technical validity. The negative swept-box margin is unresolved for anything other than these five still frames. No concrete unresolved visual defect; nothing to escalate.

## Files viewed, SHA-256 recomputed

Under `asset-pipeline/selected-a-v01/candidate-001/build-v03/`.

| File | SHA-256 |
| --- | --- |
| `selected-a.glb` (hashed, not opened) | `65f1dea3b1d35a748bdfc2089dea0feed1d054cc8b0eb957645ea2d669578a12` (matches brief) |
| `poses.json` (hashed) | `6dd7ce35a027352b4f2cffbe673081910837e69d56c9f4ec866e970381c6e96d` (same as v02) |
| `README.md` | `b069e6c13aee2d54436357f6b3b83c30a8295dc3c7528034977e452e17185b4e` |
| `viewer/emission-comparison.png` | `bdf674ce188816af2ea69c4480756aabc4efded622be2eba2bf7eec1859eeed1` |
| `viewer/webgl-neutral-face.png` | `14af4629f25adc5fa49bb307f5892d20e375a43388434061f9b40bf488d6ea16` |
| `viewer/room-pose-crops.png` | `098a312aae37245f3e2c49954b804ae400941cb40f3ed192d2ef8f85388789cf` |
| `viewer/webgl-room-neutral.png` | `ae41bf081b0cc9209746843c58d57451c3ab21cb8f91f43820b3a25043547899` |
| `viewer/webgl-room-attention.png` | `a63026e3eea422bc68ebec06a0119d1ee2caaead1fd2c9d72a3cdfc4c2a45919` |
| `viewer/webgl-room-sources.png` (robot region, via my crop) | `c17acf22c85bf34f2cdfd9bd9472170b2552b85339f63b98afd23ec0f539a095` |
| `viewer/webgl-room-no-match.png` (robot region, via my crop) | `797df0cff80778896e0fecdd1a1b2347babf523356a4fb4bc6fee37796660363` |
| `viewer/webgl-room-dismissal.png` (robot region, via my crop) | `6af04e4881d98d8d6975f3ad3e863b995704896d2586badeacf50bf343e18a9d` |

The four full-size `eye-strength-*.png` files were seen only inside the comparison sheet. Reference and v02 comparisons rely on my v02 review (`review/build-v02/visual/review.md`).
