# Studio apprentice: production prompts, v02

15 November 2026. Claude design lane, package A. Prepared inputs only. Updated for the v02 blockout: reference links now point to the v02 renders, the upper lid is gone, and the triangle count is v02's. The prompt wording did not need to change. The v01 text is kept in [v01-docs/](v01-docs/README.md).

**Nothing here has been submitted.** No Higgsfield image job, no Meshy job, no credits spent, and I did not check a balance or ask either service for a quote. The credit figures in section 3 are copied from the price table in the connected Meshy tool's own instructions, which says it matches Meshy's pricing page as of 12 October 2026. They are not a live quote. Whoever runs a job must read the current price and get Owen's go-ahead first.

The character these prompts describe is my proposal in [design-spec.md](design-spec.md). Do not run them until Owen has reviewed the blockout and the look is settled (plan steps E and F).

## 1. Reference set

Use these images as inputs, in this order of authority:

| Role | File | Use |
| --- | --- | --- |
| Shape authority | [turnaround-front.png](blockout-v02/renders/turnaround-front.png) | Proportions, part count, eye size, gap |
| Shape authority | [turnaround-side.png](blockout-v02/renders/turnaround-side.png) | Head depth, visor wrap, fin thickness |
| Shape authority | [turnaround-three-quarter.png](blockout-v02/renders/turnaround-three-quarter.png) | How the masses overlap |
| Mood only | [../reference/robot-inspiration.png](../reference/robot-inspiration.png) | Friendly floating helper feel. It is a stock illustration with a watermark and embedded text: do not copy its wireframe, layout, text or watermark, and do not upload it as a shape reference |

The blockout renders are my own original primitive geometry, so they are safe to upload as references.

## 2. Higgsfield concept images

**Goal.** Four consistent views of one finished-looking character on a plain background, to settle surface finish and small detail. The shape is already fixed by the blockout; the images should dress it, not redesign it.

**Tool route.** Higgsfield image generation with the three blockout renders attached as references. The hosted 3D scene tools cannot import an arbitrary GLB, so they are not part of this step. Check the model list and cost in the tool at the time; I have not.

**Base prompt (use for every view):**

```text
Product-design concept render of a small friendly floating helper robot, matching the attached blockout exactly in proportions and part count. Parts, all separate and floating with clear air gaps between them: a smooth wide rounded head; a tapered shield-shaped body below it with a soft pointed bottom; two small leaf-shaped fins beside the body; a flat ring-shaped tray hovering below. The head carries a glossy near-black visor band across the front with two large glowing pale-cyan ring eyes. A small round blue disc on each side of the head and one small blue dot on the chest. Matte warm off-white ceramic-like shell (#EFE7D6), near-black satin visor and tray (#151B26), cobalt blue accents (#2F66D0), pale cyan glow (#7FE3FF) on the eyes and as one thin line on the tray. Clean simple forms, soft bevels, no panel lines. Neutral pose, eyes fully open and round, fins hanging slightly out, tray level and empty. Plain mid-grey seamless background, soft even studio light, no cast shadow on the background, whole character in frame with margin, orthographic-like long lens.
```

**View lines (append one):**

```text
View: straight front, symmetric.
View: straight left side profile.
View: straight back.
View: three-quarter front from slightly above.
```

**Negative constraints (append to every prompt, or use the negative field if the chosen model has one):**

```text
No wireframe, no low-poly mesh lines, no hologram, no particles, no glowing floor ring, no text, no logo, no watermark, no UI. No mouth, no nose, no eyebrows, no pupils inside the rings, no screen face with emoji. No arms, hands, legs, wheels, antennae, cables or thrusters. No neck or joint connecting head and body. No cards, papers or objects on the tray. No extra robots. No dark or chrome body. No transparent or glass parts. No background scene.
```

**Accept a set only if** all four views show the same character: same part count, same gap, same eye size, visor the same shape, tray the same width as the head. Reject and re-prompt rather than mixing views from different characters.

**Optional pose studies.** Only after the neutral set is accepted, and only if Owen wants to see finish on the expressive poses, attach the matching blockout pose render ([idle](blockout-v02/renders/pose-idle.png), [attention](blockout-v02/renders/pose-attention.png), [sources](blockout-v02/renders/pose-sources.png), [no match](blockout-v02/renders/pose-no-match.png), [dismissal](blockout-v02/renders/pose-dismissal.png)) and replace the "Neutral pose" sentence with a plain description of that pose. These are for review only and are never Meshy inputs.

## 3. Meshy inputs

**What to generate.** Only the shell masses: head with visor and ear discs, body with chest dot, two fins. Leave these out of the generated mesh and build them natively in Blender during cleanup:

- the eye rings and the lower lid, because they must be exact rigid parts that sit on the visor;
- the tray and its glow strip, because a flat ring is trivial to model and generators tend to fuse or thicken it;
- the source cards, because they are created at runtime from real hits.

**Input images.** Meshy multi-image takes one to four views of the same object. Use the accepted Higgsfield front, side, back and three-quarter views, edited before upload so that the tray is removed and the eye rings are plain dark visor. If that edit is not clean, generate a second Higgsfield set with "no eyes, plain dark visor, no tray" instead of retouching.

**Pose for generation.** Neutral, fins hanging 8 degrees out, with the air gaps clearly open. Open gaps are what let the parts be separated afterwards.

**Settings to choose at the time (not chosen here).**

| Choice | Option A | Option B |
| --- | --- | --- |
| Route | Multi-image, high-detail model, then decimate in Blender | Single-image smart-topology model with a polygon target |
| Fits because | Uses all four views, so the back and side match the concept | Meshy's own guidance for real-time assets; lighter mesh from the start |
| Risk | Dense mesh; needs retopology or heavy decimation | Smart topology is single-image only, so the back is guessed |
| Listed price in the tool's table, not a live quote | 30 credits with standard texture | 15 credits with standard texture |

Other inputs: symmetry on, if offered. No rigging and no animation: Meshy's automatic rigging is for bipeds, and this character moves as rigid parts on pivots. Texture: the design needs only flat colours, so a texture is optional; if one is generated, expect to replace it with the five flat materials.

**Text guidance, if the chosen route accepts a prompt:**

```text
Small floating helper robot made of four separate smooth parts with air gaps: wide rounded head with a dark visor band and two side discs, tapered shield-shaped body with a soft pointed bottom and one small chest dot, two leaf-shaped side fins. Matte off-white shell, near-black visor, blue discs. Simple clean closed surfaces.
```

**Negative constraints:**

```text
No base, stand, floor or ring. No eyes, face details or mouth. No arms, legs, wheels or antennae. No neck or struts joining the parts. No wireframe, panel lines, greebles, text or logos. No thin or transparent parts.
```

**Inspect before any retry.** A create call that times out may still have been charged; check the task list before submitting again. Download the source output and record the task id.

## 4. Cleanup targets after Meshy

Codex owns the mechanics; these are the design targets the result must meet.

- Parts and origins exactly as in [design-spec.md section 4](design-spec.md), with the same names.
- Head depth equal to head height, so the lid slides cleanly. If the generated head is not round in side view, fix it or replace it.
- Dimensions from design-spec section 2, in metres.
- Five flat opaque materials in the robot asset (the tray glow is one material at two brightness levels; card material belongs to the runtime cards). No transparency, skins or morph targets.
- If the generator fuses the fins or the head to the body, separate them and close the holes. If it cannot be separated cleanly, rebuild that part natively.

## 5. An alternative Owen should know about

The plan says to raise this as evidence rather than switch quietly. This character is five simple closed shapes plus rings and plates. The blockout already builds all of them from a short script, with exact pivots, at 12,852 triangles (v02) before any optimisation. Modelling the final asset directly in Blender, using the Higgsfield images only as a finish guide, would likely give a lighter and more controllable result than generating and repairing a mesh. Meshy remains Owen's stated preference and stays the plan unless he decides otherwise.
