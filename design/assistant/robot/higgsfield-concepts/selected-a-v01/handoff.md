# Selected A: parts, pivots, materials and expression handoff

16 November 2026. Claude visual-design lane, `task_24d63382be92`. Grounded in the four images in [outputs/](outputs/). It is a design handoff for whoever builds the asset. Nothing here is measured: there are no dimensions, and proportions are read by eye from images that are not true flat views. The v02 numbers and bindings are historical and do not describe this character.

## What must survive into the asset

- A wide, rounded porcelain head with a dark face and two large warm glowing eyes.
- The raised lower lids. They carry the keen, friendly look.
- Five pieces floating apart: head, body, two mitten hands, tray. The gaps are part of the character.
- Brass used sparingly: one head seam, the stalk, the body collar, the tray.
- One small red ribbon as the only strong colour.

## Parts and pivots

| Part | Seen in | Moves? | Pivot | Notes |
| --- | --- | --- | --- | --- |
| Root | n/a | Hover lift only | Centre of the head-to-body gap | One node for the placement wrapper to scale, turn and place |
| Head shell | All four | Tilt, nod, turn | Centre of the head | Wider than tall as in the front view. Depth is undecided (see open points) |
| Head seam | Hero, front, side | No | Head | One thin brass ring just behind the face. Ignore the level seam in the back view |
| Face panel | Hero, front | No | Head | Opaque dark surface, flush or slightly inset. Not a clear dome |
| Eye discs, left and right | Hero, front | No | Head | Flat glowing discs on the face surface |
| Pupils, left and right | Hero, front | **Yes, new** | Each eye's centre, or one shared gaze pivot | Dark disc with one small fixed highlight. Slides a short way within the eye |
| Lower lids | Hero, front | Yes | Below the eyes | Face-coloured, rising to cover the bottom of each eye. At rest they already cover roughly the lowest fifth |
| Stalk | All four | No | Head | Short brass post on the character's own left side of the crown |
| Ribbon | All four | **No** | Stalk | Rigid shaped strip. See below |
| Body | All four | Small turn and lean | Top centre of the body | Teardrop, point down |
| Body collar | All four | No | Body | Brass band with a **solid, closed** top. Model the top face as closed brass or porcelain, not a dark hole |
| Mitten hands, left and right | All four | Swing and splay | The inner upper end of each mitten, nearest the body | Float beside the body, not attached. Thumb bump faces inward |
| Tray | All four | Height, tilt, forward | Centre of the dish | Shallow round brass dish with a low rim. Empty |

Moving set: root, head, gaze (one or two pupil nodes), lower lids, body, two hands, tray. That is the v02 moving set plus gaze.

## What the pupils change

Round one's v02 eyes were rings with no pupil, so direction came only from turning the head. A has pupils, which is why it looks alive, and also why its gaze can be wrong.

- **Rest position:** centred left to right. In the images the pupils sit slightly high; I would centre them vertically too, or keep them only a touch high.
- **Use:** a small look down at the tray and back, and a look toward the visitor. Both are finite, settle, and stop.
- **Limit of travel:** the pupil must stay wholly inside the eye disc and clear of the lid edge in every pose.
- **Rule:** no idle darting, blinking or wandering. A settled state has still eyes. Reduced motion snaps the gaze with the pose.
- **Cost:** one or two more moving nodes than v02, and the pupils are two more small parts to keep crisp at small size.

## What the ribbon changes

- It is a fixed, rigid shape. No cloth, no sway, no wind, no secondary motion. It moves only because the head moves.
- It needs a sixth colour (red) that nothing else uses.
- It is thin. Give it real thickness or make it double-sided so it does not vanish edge-on.
- It adds height above the head. Clearance for A must be taken from A's own model, including the stalk.
- At small size it will be a red dot. That is acceptable; it is an accent, not a signal. It must never be used to show state.

## Materials

| Material | Used on | Finish seen in the images | Note for the build |
| --- | --- | --- | --- |
| Porcelain | Head, body, hands | Warm white, soft satin, broad highlights | Plain colour; no crackle texture needed |
| Brass | Seam, stalk, collar, tray | Warm brushed satin | Plain colour and roughness; the brushed streaks are optional |
| Face | Face panel, lids | Near-black with a warm brown cast | Opaque. Lids share it so they disappear against the face |
| Eye glow | Eye discs | Warm white, bright | Emissive. The soft bloom around the eyes in the images is a render effect and should not be modelled |
| Pupil | Pupils | Dark brown-black with a white highlight dot | Could share the face material; the highlight is a small separate white dot |
| Ribbon | Ribbon | Matte red, slight weave | Plain matte red is enough |
| Tray glow | Inside of the tray | Soft warm light on the dish floor | See "Tray and truthfulness" |

No transparency, no glass, no textures required by the design.

## Expression

- **Neutral, as drawn:** eyes open, lower lids slightly raised, pupils centred. Attentive and mildly pleased.
- **Smile:** raise the lower lids further, as v02 did. The images suggest this will read well, because the lid edge catches the eye's light.
- **Keep both eyes whole** in every held pose. Do not add an upper lid or brow; the v01 review showed that reads as a glare.
- **Head tilt** carries curiosity, as in round one. The neutral asset pose is level.
- No mouth, no voice, no speech bubble.

## Tray and truthfulness

The existing contract stands unchanged.

- The asset's tray is **empty**. Source cards are created at runtime, one per real hit, and are never baked into the model. Round one's three cards were a sample only.
- The room's cards are display only. Selection comes from the HTML chips and list.
- No permanent animation: no idle bob, blink, spin or pulse.
- The soft glow inside the tray appears in all four images as a constant. Whether it stays constant, or follows the carried and presented tray states already agreed, is for root and Codex to decide. It must not be used in a way that suggests results exist when they do not.

## What to rebuild natively in Blender

Whatever route makes the base mesh, these should be modelled by hand, because they must be exact, separate or rigid:

- Eye discs, pupils and highlights, lower lids, and the face panel.
- The head seam, stalk and ribbon.
- The body collar with its closed top.
- The tray.

That leaves only the head shell, body and two mittens as candidates for a generated mesh, and all three are simple smooth shapes. As with v02, modelling the whole character directly may be lighter and more controllable than generating and repairing it. That is evidence for Owen and root to weigh, not a decision I am making.

## Open points the images do not settle

| Point | Views disagree how | My suggestion |
| --- | --- | --- |
| Seam direction | Ring behind the face in three views; level equator in the back view | Ring behind the face |
| Head depth | Flattened from the front; a ball from the side and back | Keep the front's width-to-height look; set depth so the head reads as a slightly squashed ball |
| Face depth | Inset panel from the front; bulging clear dome from the side | Opaque, flush or slightly inset |
| Stalk lean and ribbon hang | Leaning outward with the ribbon to the side; upright with the ribbon to the rear | Slight outward lean, ribbon hanging down the outer side |
| Body top | Flat dark face in every view | Closed, and the same brass as the collar |
| Tray tilt at rest | Every image looks down on it | Level at rest; tilt only when presenting |
| Scale, clearance, phone-size legibility | Not shown at all | Take from the built model against the pinned room baseline |
