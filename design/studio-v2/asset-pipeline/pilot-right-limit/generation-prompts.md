# Generation prompt handoff — one Higgsfield frame, one Meshy mouse

14 November 2026. Claude art author, task `task_a8910075c00f`. **Drafts for root's quote only. No job was submitted, nothing was uploaded, no credit was spent.** Neither Higgsfield nor Meshy is reachable from my session; I cannot confirm models, prices or balances. Figures below marked "root" come from root's handoff and `.omx/context/higgsfield-studio-reference-quote.json`.

## 1. Higgsfield look frame C — right limit

| Item | Value |
| --- | --- |
| Mode | Text-to-image, single still. **Text only is enough**; no reference image. |
| Model / cost (root) | `gpt_image_2_6`, quality high, 2k, PNG, count 1, quoted 2.75 credits. Not verified by me. |
| Aspect / crop | 16:10 landscape, 1440×900, matching the desktop `right-up` capture. Use an explicit 16:10 ratio rather than `auto` if the tool allows. |
| References | None sent. Do not upload root's captures (they show the owner's name and project titles) or the private room photo. |
| Deliverable | One PNG saved locally under `pilot-right-limit/look-frames/` with the exact prompt, model, seed if exposed, and cost recorded beside it. |

Prompt — revised from the plan's frame C after seeing the pilot renders, so it describes the room as built instead of "same room":

> Interior of a small cosy home music studio at night, eye-level view from a seated position looking toward the right-hand wall and slightly upward. On the right, a closed warm oak frame-and-panel door with two raised rectangular panels, dark oak architrave and a round brass knob; the timber grain and the panel mouldings are clearly visible and softly lit. Left of the door, a square window with a dark oak frame, an ivory slatted blind drawn halfway, and a deep blue dusk sky with a low dark roofline and a few small lit windows. Left of the window, a slim floor lamp with a pale metal pole and a tapered linen drum shade: the shade glows warm at its centre and falls darker toward its top and bottom rims, with visible fabric weave, a trim band at each rim and a vertical seam. The lamp throws a soft warm pool onto the olive-charcoal plaster wall. Overhead, exposed dark timber ceiling beams catch warm light along their lower edges; a plain cornice joins wall and ceiling; dark skirting runs along a smoked timber floor. Every surface in view is readable; the darkest areas still show form.
>
> Stylised 3D illustration, clean hand-modelled forms with soft bevels, matte painted materials with gentle roughness variation, warm tungsten practical lighting with one cool dusk-blue counterpoint. Soft contact shadows, light pooling on walls, no bloom blowout.

Negative constraints (as a negative prompt if supported, otherwise appended as "No …"):

> people, logos, brand names, readable text, signage, neon, cyberpunk, photorealism, fisheye, wide-angle distortion, exterior view, cutaway, dollhouse, isometric, extra furniture, instruments, posters, wall art, glass door, door window, black door, blown-out white lamp, lens flare, heavy bloom, fog

Use: a look target for door timber tone, shade form and wall light pooling, compared by eye with `renders/v03-right-up.png`. Geometry is never taken from it.

Stop criteria: **one image, no retries without a new approval.** Keep it if it shows a lit panelled door, a shade with gradient and no flat white patch, and no added objects or text. If it fails those, record why and stop; do not iterate prompts on credits.

## 2. Meshy mouse — one untextured base mesh

| Item | Value |
| --- | --- |
| Mode | Text-to-3D, geometry only (preview/mesh stage, no texture stage). **Text only is enough**; no reference image. |
| Cost (root) | Smart-topology mesh quoted at 5 credits against a balance of 75; textured would be 15. Not verified by me. Request the untextured option. |
| Topology | Quad-dominant / smart topology if offered, lowest polygon target available (about 3–5k faces); symmetry on. |
| References | None. No brand photos, no product names. |
| Deliverable | One GLB or OBJ saved locally under `pilot-right-limit/meshy-raw/`, untouched, with prompt, settings and cost recorded. Cleanup happens in Blender afterwards. |

Prompt:

> A simple modern computer mouse, generic unbranded design. Smooth low symmetrical ambidextrous shell with a gently arched back that is highest just behind the middle and tapers toward the front. Two flat primary buttons separated by a thin straight groove, a small rubber scroll wheel set in a slot between them, a subtle seam line around the lower edge, flat underside. Clean hard-surface product model, soft rounded edges, single solid object resting flat on the ground, about 10 cm long, 6 cm wide, 3.5 cm tall.

Negative constraints:

> cable, wire, logo, text, side buttons, thumb rest, gaming mouse, RGB lights, vents, holes, mouse pad, hand, desk, multiple objects, base plate, stand, sharp edges, noisy surface, baked lighting

Blender cleanup after delivery (no cost): scale to 0.10 m length, origin at ground contact, remove floaters and internal faces, reduce to under 1.5k triangles, one UV set, assign the shared ivory and rubber library materials, model the wheel as a separate clean cylinder if the generated one is mushy.

Stop criteria: **one generation, no retries without a new approval.** Pass if the silhouette reads as a mouse from the desk eye point at about 30 px wide, the shell is a single closed surface, and cleanup takes under an hour. If it fails, the mouse is hand-modelled in Blender instead and Meshy is reconsidered for the remaining props before any further spend.

## 3. Order

Neither job is needed for the door and lamp pilot, which is already built locally. Both wait on: the pilot's independent visual review, root's explicit approval with a current quote, and tool access in whichever session runs them.
