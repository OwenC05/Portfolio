# Immersive Studio v2 — Architect review

Actual native role: `/root/immersive_v2_architect`, read-only architect.14November2026, first pass. **REVISE — A1 only blocking finding.** Root persists this returned review because the role cannot edit files.

A1: current controller.ts:175-219 raycasts only project surfaces, then projects all monitor corners into a touch rectangle without depth/clipping/occlusion eligibility. Old whole-room orthographic framing bounded this; perspective look removes that condition. Read-only installed-Three probe at390x844, eye(-0.6,2.85,4.2),yaw+64,pitch-5,FOV60, current Copilot geometry: cornerdepths-0.638..+0.133; projectedrectx-141597..7239,y-4999..6218. Music-viewcentre is falsely admitted by carried-forward expansion. This is a verified migration hazard, not an implementedv2browserdefect.

Required adjustment: S owns visibility-aware selection; behind-camera, clipped-away and foreground-occluded regions cannot activate. Touch expansion derives from finite visibleprojection; conservatively omit expansion at problematicnearplane and keep HTMLalternative. Freeze model/occludercontract within S. Tests: negative music/right-limit taps, behind/nearplane and foregroundocclusion; positivevisible targets afterlook/resize/reset.

Nonblocking implementationnotes: keep yaw/pitch through resize/visibilityresume/panelresize; current update earlyreturn based on selection must not ignore viewcommands/interactionEnabled. Usettles history/focusstate table before splitting; existing#studioarticlelinks use sameclosepath, freshdeep-link close stays onstudio. Keep earlyactualvisualgate binding; tests cannotprove artdirection.

Antithesis: customcamera/inputadds complexity where readableportfolio is the priority; maturecontrols andprovedv1reduce risk. Tradeoff: chosen fixed-eye look differs fromorbit, and enclosure/detail addsocclusioncases. Synthesis: selectedsmallfixed-eyecontroller withretainedlifecycle/eventorder, explicitvisiblepicking, constrainedlookcone and immediateHTMLaccess. No widerworkflow/dependency change required.

Inspectedrequirements/context/PRD/test/art/research/currentcode/harness; onlyread-onlyprojectionprobe, no edits/browser/build/state. ReviewedPRD55581054E24153FEA099BF4A4F9F07C803C0D7DC9889A8822D35B312F788FDDE; test367A07EED54D9BBBAC4B3284FA1D45CFC4323BA9C8DEC02CAD798A7F29837D89; art43662E21DCA731023AE2D4EA88F2B9444166C5E923315FE87F3F36CA6A7DF35E; controller728C12AFFD53A069FD684A725C53CEB39A046AD569A43314A9AC2DD5348222B0. Root must amend and obtain Architect approval before Critic.

## Final re-review: APPROVE

Actual native architect `/root/immersive_v2_architect` returned **APPROVE**, A1 resolved, no blocking architectural findings. The revised PRD requires finite visible in-front occlusion-safe picking, rejects targets-only rays, and freezes the internal S model/occluder boundary. Paired tests independently establish invalid geometry and negative music/near-plane/occlusion cases while preserving visible-positive selection. S dispatch instructions carry this into execution. Orientation retention, command processing with unchanged selection, stale-command prevention, and shared article-return/Close/Escape path are explicit. Early visual gate remains binding.

Steelmanned objection remains custom controls versus mature controls for a reading-first portfolio; selected synthesis is the bounded fixed-eye controller, preserved lifecycle/event ordering, visibility-safe picking and immediate HTML access. No additional user decision or dependency is required.

Fresh approved PRD SHA256 `1F92AED3C8B4D26628D03D856DC27C3B87EA2564770673B9D9E84CCF00A8A5ED`; test SHA256 `E5822F3D02BC17EF074F7FD6ED61A7B0F9FDE3D05E162F0F15D5823656FBAD9B`. Critic may now review sequentially. Implementation/visual completion remain unverified; reviewer made no file/runtime mutation.

