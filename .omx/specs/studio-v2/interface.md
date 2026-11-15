# U — immersive interface secondary coordinator

You are a Codex technical coordinator. Under the latest user routing, visual layout/CSS/typography/presentation shell and visual critique MUST use `--agent claude`; panel state/history/focus/SSR/accessibility mechanics and tests MUST use `--agent codex`. Freeze shared component slots/class names/DOM contracts before parallel work; Claude owns the design, Codex wires behavior. Do not restyle independently. Read `.omx/plans/immersive-v2-agent-routing.md` and record actual provider receipts.

Read `.omx/specs/studio-v2/common.md`. Implement U lane of approved v2 PRD.

Own only `app/studio/**`, `components/studio/StudioExperience.tsx`, `components/studio/ProjectEvidence.tsx`, and `design/studio-v2/interface*` reports/subfolder. Do not edit `lib/studio-contract.ts`, content data, scene, globalCSS, package/config. Consume the PRD's exact optional viewCommand/interactionEnabled fields; S publishes actualcontract. Keep current content one source. Root owns browser/build/preview until explicit lease.

Create a child Orca Run. Split shell/server/CSS and panel/navigation performers only with disjoint files; assign ProjectEvidence to exactly one. Freeze their interface before parallel work. Independent critique is separate from writers. Avoid duplicate implementations if splitting adds coupling; serial dependent slices are acceptable, but use real bounded performers and independent critique per user instruction.

Make the enhanced room fill mainviewport with compact identity/Work/About/Contact, no bigsidehero or scene-card/frame. Provide accessible HTML project/navigation and look/reset controls, safe at320/390. Monitor/shortcut selection opens full readable project immediately on React commit, without scene/camera/timer wait or document scroll-away. Native dialog is preferred; explicit close/Escape/focus/scroll/history behavior, sameorientation afterclose. Disable scene interaction while modalopen; keep controller mounted. Correctly route freshdeep-links,back/forward,repeatselection and modifiedlinks. Never callhistory.back blindly on freshdeep-link close; preserve Nextmetadata.

Retain complete server-rendered no-JS evidence and useful graphics-failure path. Either oneDOMsubtree or reused ProjectEvidence with uniqueidprefix; no duplicate IDs, independentcopystrings or duplicateaccessible reading surface in enhancedmode. Name/role/contact remain available withoutJS. Substantial articleheading is initialfocus; visibleclose and logicalfocusreturn toHTMLinvoker/equivalentprojectshortcut aftercanvasselection. No unbounded globalkey/swipe interception. Reducedmotion noautopan/noanimationgate; nofakeaudio/player.

Send assembled-ready early for root actualvisualgate. Targeted UI checks then independent critique; report `design/studio-v2/interface-report.md` with exactownership/hashes and clear browser/test limits. Do not claim integratedbuild/performance without I's later evidence.

