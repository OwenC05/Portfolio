# Studio apprentice: design pack

15 November 2026. Claude design lane, package A, `task_eb9bf20f2b46`. Written under `design/assistant/robot/apprentice/` only.

**Status.** Owen chose the eager apprentice personality. This pack turns it into one concrete character and interaction proposal. The appearance is not approved, the placement (zone A) is still a proposal, and no one independent has reviewed the renders. I am the author, so my own viewing is not a review.

![Idle, attention, sources, no match, dismissal](blockout/renders/state-sheet-five-poses.png)

Primitive blockout on a stand-in backdrop. Left to right: idle, attention, sources with four real hits, no match, dismissal.

## Contents

| File | What it is |
| --- | --- |
| [design-spec.md](design-spec.md) | Proportions and dimensions, face and eye technique, parts and origins, palette, five poses, timing, interruption, reduced-motion stills, gaps |
| [storyboard.md](storyboard.md) | Turnaround, state sheet, three storyboards, timeline frames, state table |
| [ui-and-state-spec.md](ui-and-state-spec.md) | Studio-only entry, panel, tray strip, where selection and details live, keyboard, phone, reduced motion |
| [production-prompts.md](production-prompts.md) | Higgsfield concept prompts and Meshy inputs with negative constraints. Nothing submitted |
| [blockout/README.md](blockout/README.md) | Scene passport, rebuild command, render list, findings |
| [blockout/apprentice-blockout.blend](blockout/apprentice-blockout.blend) | Robot-only Blender 5.2.3 file: articulated master with keyed timeline, posed copies, cameras |
| [blockout/build_apprentice_blockout.py](blockout/build_apprentice_blockout.py) | Script that builds and renders the file |
| [blockout/renders/](blockout/renders/) | 25 PNG renders |

## The design in brief

- **One character.** A cream floating robot in three masses: a wide head with a dark visor and two cyan ring eyes, a shield body, and a flat ring tray. Two small fins. About 0.26 m wide and 0.43 m tall.
- **The ring is its tray.** Real search hits stand on it as cream index cards, one per hit, first rank on the viewer's left. An empty lit tray is "nothing matched".
- **Expression from rigid parts.** Two visor-coloured lids slide over the rings: upper lid for the settled idle look, lower lid for a smile. No morphs, skins, transparency or textures.
- **Five poses.** Idle (minding the desk), attention (head cocked, fins open), sources (tray presented, cards up), no match (empty tray, one fin pointing to the contact link), dismissal (nod and smile, back to idle).
- **Warm, not vouching.** It smiles at hello and goodbye and hands things over keenly. Nothing it does marks a passage as correct, and nothing scales with hit count or score.
- **Same data in HTML.** A tray strip in the panel repeats the tray as numbered chips. Selection and all detail live in the existing source list.

## Checks made

- Reference image viewed. Earlier placement sheet viewed; its phone frames use the staged 74-degree lens, not production's 64.
- All 25 renders viewed after the final build.
- `.blend` saved and read back: scene, collections, parents and origins match the spec table.
- Script passes `python -m py_compile`. Its command-line entry was not executed; the script ran through the background Blender session.
- Relative links in the five documents resolve.

No app build or tests were run; nothing in the application changed.

## What is left, and who it waits on

| Next | Waits on |
| --- | --- |
| Appearance review of the blockout | Owen |
| Independent visual critique | A Claude reviewer who is not me |
| Robot seen in the real room at the pinned camera | Root: room revision and camera; then plan step E |
| Placement, idle direction, panel side | Owen; zone A is not approved |
| Baked or runtime-generated cards, eyes and lids; pose blending or clips; card size by rank | Root and Codex, plan step D |
| Budgets | Codex measurement. I make no budget claim |
| Ask button fit at 320 and 390; phone focus behaviour | Interface owner, tested in the real layout |
| Any Higgsfield or Meshy job | Owen's go-ahead on a current quote |
| Meshy versus modelling directly in Blender | Owen. The evidence is in production-prompts.md section 5 |
