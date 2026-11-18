# Studio apprentice: storyboard and state sheet

15 November 2026. Claude design lane, package A. Proposal, not approved, not independently reviewed.

All images are renders of the primitive blockout in [blockout/](blockout/README.md) against a flat stand-in backdrop. They show the robot alone. They do not show the Studio room, the panel or real lighting. Pose values and timing are in [design-spec.md](design-spec.md); panel behaviour is in [ui-and-state-spec.md](ui-and-state-spec.md).

## Turnaround, neutral pose

| Front | Three-quarter | Side |
| --- | --- | --- |
| ![Front](blockout/renders/turnaround-front.png) | ![Three-quarter](blockout/renders/turnaround-three-quarter.png) | ![Side](blockout/renders/turnaround-side.png) |

Front and side are orthographic at the same scale. The side view shows the fins edge-on, the visor wrap and the tray's 14-degree rest tilt.

## State sheet

![Five poses in a row](blockout/renders/state-sheet-five-poses.png)

Idle, attention, sources with 4 real hits, no match, dismissal. Camera is 0.10 m below the hover root, close to the assumed Studio eye height.

## Storyboard

### A. A visitor asks and sources come back

| 1. Idle | 2. Addressed | 3. Sources arrive | 4. Settled |
| --- | --- | --- | --- |
| ![](blockout/renders/pose-idle.png) | ![](blockout/renders/pose-attention.png) | ![](blockout/renders/pose-sources-glance.png) | ![](blockout/renders/pose-sources.png) |
| Head turned to Owen's screens. Eyes half-lidded. Tray dim and empty. Completely still. | Hover, focus or the Ask button. Head turns and cocks, body follows, fins open, tray lights. A short smile, then round eyes. | The real `retrieval` event arrives. It glances at the tray while one card per real hit stands up, first rank first. | It looks back at the visitor. One fin stays toward the tray. Cards stay until the panel closes or a new question replaces them. |
| Trigger: none | Trigger: pointer, focus or panel open | Trigger: `retrieval`, 1 to 4 hits | Holds |

Between 2 and 3 the robot does nothing new. A question in flight has no thinking pose; it simply keeps attending.

One hit looks like this. Same pose, same eagerness, one card:

![One hit](blockout/renders/pose-sources-1.png)

### B. Nothing matches

| 1. Addressed | 2. Empty tray | 3. Points to Owen |
| --- | --- | --- |
| ![](blockout/renders/pose-attention.png) | ![](blockout/renders/timeline-f176.png) | ![](blockout/renders/pose-no-match.png) |
| As above. | `retrieval` with 0 hits. It glances at the empty tray, looks up with the head tipped the other way, and opens both fins once. | One fin points toward the contact link in the panel. Eyes stay round. The tray stays lit and empty so the empty result is plain to see. |

No sad face and no apology loop. The panel carries the server's message and the contact link.

### C. The visitor leaves

| 1. Any state | 2. Goodbye | 3. Idle |
| --- | --- | --- |
| ![](blockout/renders/pose-sources.png) | ![](blockout/renders/pose-dismissal.png) | ![](blockout/renders/pose-idle.png) |
| Escape or Close. | Cards drop at once. One nod with a smile. | Back to the desk. Nothing from the last result stays on show. |

### D. Stopped: cancel, timeout, error, too many requests

No new pose. Cards drop at once, the tray dims, and the robot returns to the attention pose. It does not shrug, because a failed request is not the same as "nothing matched". The panel shows the existing notice and Try again.

## Frames from the keyed timeline

These come from the 30 fps blocking on `APR_master`, viewed from the three-quarter camera. They show parts in transit, which the posed copies above cannot.

| Frame 15 | Frame 25 | Frame 57 | Frame 62 | Frame 104 | Frame 176 |
| --- | --- | --- | --- | --- | --- |
| ![](blockout/renders/timeline-f015.png) | ![](blockout/renders/timeline-f025.png) | ![](blockout/renders/timeline-f057.png) | ![](blockout/renders/timeline-f062.png) | ![](blockout/renders/timeline-f104.png) | ![](blockout/renders/timeline-f176.png) |
| Turning from idle to the visitor | Greeting smile | Glance down, first card just starting | Cards rising in rank order | Cards cleared, goodbye smile beginning | Shrug settling into the point |

I viewed every image on this page after the final build. In frame 57 the first card is only a speck, and frame 104 catches the lower lid part-way up, so the eyes look odd in that single frame.

## State table

One row per real event or client condition. The robot column is the only thing the 3D layer does.

| State | Real trigger | Pose | Tray | Cards |
| --- | --- | --- | --- | --- |
| Idle | Panel closed, no hover or focus | Idle | Dim | None |
| Attention | Hover, focus, or panel open with no result | Attention | Lit | None |
| Sent | Request sent, no event yet | Attention (unchanged) | Lit | None |
| Received | `retrieval-start` | Attention (unchanged) | Lit | None |
| Sources | `retrieval` with 1 to 4 hits | Sources | Lit | Exactly one per hit, rank 1 on the viewer's left |
| No match | `retrieval` with 0 hits, `answer: abstained` | No match | Lit | None |
| Finished | `done` | Unchanged | Unchanged | Unchanged |
| Stopped | Cancel, 60 s timeout, connection error, 429, malformed stream | Attention | Dim | None |
| Superseded | A newer question was sent | Attention, then the new result | Lit | Old cards removed at once |
| Dismissed | Escape, Close, unmount | Dismissal, then idle | Dim | None |
