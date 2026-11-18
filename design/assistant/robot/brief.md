# Studio assistant robot: working brief

Updated 15 November 2026. Status: Owen selected the apprentice personality and requested a detailed plan with delegated work. Final appearance, placement and asset remain to be developed.

## Confirmed by Owen

- The assistant is a floating robot **inside the 3D studio only**. It is not a persistent widget across the portfolio.
- Visitors should be able to interact with it and ask about Owen, his projects, experience and published material. The existing assistant remains the functional baseline.
- Show how retrieval works through a visualization associated with the assistant. Show actual application events, not invented reasoning.
- Explain only what the published sources establish; suggest contacting Owen for unsupported questions.
- Keep model generation disabled. The current experience returns matching sources and excerpts.
- Retrieval is good enough for this stage. Prioritize robot design now.
- Develop the design together before producing the final asset. Owen proposed Higgsfield/Blender, then Meshy.
- Use Orca orchestration: actual Claude for design, Codex for engineering and verification.
- Owen selected the **eager apprentice** direction after reviewing its source-tray and gesture concept. This settles personality; it does not select every material, dimension or placement detail.

## Reference and workspace boundaries

Owen supplied the robot reference on 15 November and asked: "something like this but how do we give it personality?" The unchanged image is saved at [reference/robot-inspiration.png](reference/robot-inspiration.png). It depicts a floating blue robot with a rounded head, a dark face panel, two luminous circular eyes, a tapered body, small side appendages, a wireframe treatment and a luminous ring below. These are observations, not an approved final design. The image is inspiration; its embedded stock-image text and watermark are not portfolio artwork.

All new work is in `C:/Users/Owenc/orca/Portfolio-assistant`, branch `feature/portfolio-assistant`. The separately active Studio checkout at `C:/Users/Owenc/orca/Portfolio` is read-only context. Do not edit its scene, worktree, server or application state. The Studio has newer scene work than this assistant branch; date and identify the exact source used when describing its constraints.

## Proposed production sequence

1. Claude reviews the actual current Studio captures and the recovered robot reference, then proposes the character, placement, interaction and retrieval visualization.
2. Review a small concept or blockout with Owen. Resolve silhouette, materials, expression and motion before committing to final generation.
3. Use the chosen concept as the Meshy input, selecting settings and credit cost against the agreed asset requirements.
4. In Blender, inspect geometry, materials, proportions, separate moving parts/pivots, simplify where needed, animate and export a browser-ready GLB.
5. Integrate with the existing assistant API and real retrieval events. Verify at actual room scale on desktop/mobile and with reduced motion, keyboard interaction and the Studio performance contract.

This sequence is a proposal, not a claim that every stage is already available or completed. Tool and output constraints may make direct Blender construction a better fit for some parts; evaluate against the approved design without silently replacing Owen's chosen workflow.

## Verified tool constraints

- Higgsfield hosted 3D Jutsu tools are available. Their current instructions allow curated catalog imports but do not support importing an arbitrary user/Meshy GLB. Hosted blockout and local final cleanup are therefore separate stages.
- The connected-app status check on 15 November reported Blender and 3D Blocking Studio disconnected. This does not establish whether a local Blender executable is installed. Do not take over another agent's active scene.
- Meshy's multi-image tool supports 1-4 views of the same object. Generation settings and credits must be inspected before any job; no robot generation has been submitted.
- Meshy's automatic rigging targets humanoid/biped characters. A floating nonhumanoid design may instead use object pivots and transform animation in Blender; do not promise automatic rigging before the design is known.

## Outputs and review criteria

Claude owns visual and interaction proposals; Codex owns technical constraints and integration planning. They write separate reports. Shared criteria: recognizable/readable at the real Studio camera scale, deliberate discoverability, unobstructed portfolio navigation, source-grounded behavior, truthful retrieval states, accessible alternatives and a small runtime cost. Numerical asset budgets must come from current measured Studio evidence rather than assigning the entire scene budget to the robot.

The next checkpoint is a reviewable design direction and a feasible asset specification. No final model, live generation, production deployment or changes to the shared Studio are part of this preparation pass.

## Preparation reports received

Both Orca preparation tasks completed on 15 November:

- [Claude design direction](design-direction.md), with a [placement comparison](claude/placement-zones.png) based on viewed M3 v03 captures. Claude recommends zone A above the right speaker/headphones; this is a proposal, not Owen's selected placement. Its historical missing-reference caveat is resolved by the image supplied afterward.
- [Codex engineering constraints](engineering-constraints.md), with [validation evidence](engineering/validation.json) covering 65 source paths, snapshot stability, links and budget arithmetic. No application or runtime acceptance is claimed.

Integration qualifications from the technical report:

- The newer full-room scene is staged, while production code still loads the pilot. The design sheet depicts the staged M3 assembly rather than the currently integrated production room.
- The viewed phone assembly uses a 74-degree field of view; production currently uses 64 degrees. Placement and phone visibility must be checked against the eventual production camera before being finalized.
- The earlier M3 transfer forecast was 351 bytes above its 1,500,000-byte gate. Package B's newer M4 evidence supersedes it: 1,462,612 gzip bytes in the point estimate, and 1,559,302 in the sensitivity case. Neither is measured final transfer or an assigned robot allowance. Reserve space for the model, retrieval visuals and assistant JavaScript together after measurement. This does not block concept design.
- The current renderer is demand-driven and its picker recognizes project surfaces only. Robot interaction, an accessible HTML entry point, reusable assistant run state and any animation need explicit implementation work. Do not assume a GLB drop-in provides those behaviors.

The apprentice is now selected. Its production design pack, asset pipeline specification, and integration and verification plan were delegated in parallel and are complete as preparation deliverables. The consolidated [delivery plan](delivery-plan.md) defines subsequent dependencies and completion evidence. No additional retrieval work is needed for this checkpoint.

Package B is complete: [authoring readiness](asset-pipeline/readiness.md), [draft asset contract](asset-pipeline/asset-contract.md), [production runbook](asset-pipeline/production-runbook.md), and [budget/validation handoff](asset-pipeline/budget-and-validation.md). Its evidence verifies an installed Blender 5.2.3 LTS executable and Meshy authenticated read access; the disconnected cloud bridge is separate from the design author's local Blender server. The example profile/manifest remain explicitly non-production. Final production waits on the repaired design, reconciled runtime contract and measured allocation.

A v02 and package C are now received. See the [revised design pack](apprentice/README.md), [integration handoff](integration/integration-handoff.md), and [coordinator decisions D1](integration-decisions.md). The [independent v02 review](review/blockout-v02/review.md) passed the isolated concept, and the author completed the text alignment with D1. The [candidate-v02 asset handoff](asset-pipeline/v02/alignment.md) passed 29 preparation checks and replaces the old binding table for implementation planning. User appearance review, actual-room composition and measured final allocation remain pending. No production robot or app integration is claimed by these documents.

Latest steering: Owen asked to proceed and break the next task into subtasks first. The [in-room prototype breakdown](prototype-subtasks.md) uses v02 as the working candidate, with final appearance still revisable. It separates export, composition, shared assistant state, scene behavior, accessible UI, integration and independent review; implementation has not started in this breakdown turn.
