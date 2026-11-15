**Experience architecture and feasibility — independent research, 14 November 2026**

**Recommendation:** discuss a readable portfolio with a substantial spatial entrance using layered 2.5D: authored images or rendered layers with limited depth and object interaction. Preserve ambition through composition, lighting, personal objects and meaningful responses. Full 3D remains credible if exploration itself matters most. Neither direction is approved.

My lens is whether an expressive experience survives a phone, keyboard, slow connection and future content edits. Recommendations below are design/engineering judgments, not measured performance results.

**Verified local context**

`package.json` declares Next.js 14.0.4, React 18, TypeScript and Tailwind 3, with no graphics library. `design/portfolio-draft/package.json` separately pins UI SDK core/web 0.1.0-beta.1. Its README describes a standalone Web Components preview and reports a React 19 adapter requirement; I have not independently qualified that adapter. The draft is not evidence of production compatibility, and does not justify a framework migration.

The working-table HTML contains project links, a skip link, focus styles and a reduced-motion rule. Its material illustration is explicitly not Owen's hardware, according to `concept/brand-spec.md`. This is source inspection, not a browser audit; the palette and serif remain proposals. No root `AGENTS.md` exists on disk; supplied instructions and version-matched Orca guidance applied. Project-scoped AgentMemory retrieval returned no matches.

**Three approaches compared**

The following costs are relative judgments for this portfolio, not universal properties or estimates of working hours.

| Dimension | Full real-time room/workbench | Layered 2.5D scene | Readable content + rich spatial entrance |
|---|---|---|---|
| Expressive ceiling | Free viewpoints, coherent occlusion, lighting and object manipulation; strongest sense of inhabiting a place | Carefully directed depth and tactile reactions; constrained camera can still feel distinctive | High-impact opening followed by readable case studies; entrance can use either rendering approach |
| Asset authoring | Geometry, materials, UVs, export, camera, interaction states and web optimization | Separated foreground/background, clean masks, consistent perspective and shadows; alternate crops | One cohesive vignette plus normal project media; effort concentrated in a limited area |
| Accessibility | Need semantic controls and content outside the rendered scene; camera movement adds complexity | Real HTML controls can overlay art; visual order and reading order still need deliberate alignment | Shared HTML navigation and case studies provide the primary route through the whole site |
| Touch/keyboard | Orbit, zoom and selection can compete with page gestures; offer explicit view controls | Tappable objects with visible labels; hover may enrich but cannot reveal essential functionality | Normal scrolling and links; optional entrance interactions have equivalent controls |
| Loading/runtime | Geometry, textures, shaders and ongoing rendering require separate budgets | Image decoding and large transparent layers can still be expensive; no guaranteed speed advantage | Content need not wait for scene code; hero imagery can still become the loading bottleneck |
| Maintenance | Changes may involve both scene and content pipelines | Recomposition or relighting can require re-exporting layers | Case-study copy evolves independently; one source of truth supplies links and labels |
| Fallback | Poster plus complete HTML; handle graphics failure after startup too | Flattened illustration plus working links | Same composition and content remain useful before enhancement arrives |

**Documentation findings and implications**

Next.js 14 documents deferred Client Component/library loading through `next/dynamic`. Proposed boundary: server-render identity, work links and case-study content; isolate browser-only scene behavior in a client component. Disabling SSR for that enhancement must retain the content shell. Context7 corroborated the 14.2.35 documentation; installed 14.0.4 remains untested. No upgrade is proposed. [Next.js 14 lazy loading](https://nextjs.org/docs/14/app/building-your-application/optimizing/lazy-loading).

MDN recommends controlling rendering resolution, batching draw calls and avoiding synchronous WebGL operations that stall the main thread. Therefore, a beautiful Blender render cannot establish browser feasibility. A real-time prototype must test its exported asset, device resolution and interaction together. My proposed fallback is a retained poster and independent HTML links whenever graphics initialization or subsequent rendering fails. [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices).

WCAG 2.2 requires keyboard access, visible focus, and non-drag single-pointer alternatives where dragging is not essential. Its AA target-size criterion is 24 CSS pixels with exceptions; I propose 44-pixel scene controls as a usability target. Ordinary reading content must reflow at 320 CSS pixels. Do not use a scene's spatial-layout exception to excuse unreadable project text. These constraints favour deliberate alternative controls, not a separate impoverished mobile site. [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

**Sensible production roles, after discussion**

- **Authored Blender assets:** establish consistent geometry, camera, lighting and reusable objects. One scene can supply stills and separated layers; a real-time version needs export qualification. The official manual's indexed text notes possible vertex increases from UV/edge discontinuities. Blender full-page retrieval failed; exact exporter settings remain unverified. [Blender glTF manual](https://docs.blender.org/manual/en/5.1/addons/import_export/scene_gltf2.html).
- **Higgsfield imagery:** propose it for mood studies, material exploration or clearly illustrative supporting imagery. Review perspective, edge quality, crop resilience, text artifacts and provenance before adoption. An attractive generated keyboard does not establish what Owen owns; a flat image does not supply coherent unseen sides for an orbiting camera.
- **OpenDesign composition:** propose it for comparing typography, hierarchy, spacing and desktop/mobile compositions using selected assets. Treat output as review material requiring implementation review. This lane did not test tool availability, exports or asset readiness.

**Ranked recommendations**

1. **Readable site with a layered spatial entrance.** Let objects offer optional personal stories while work and contact remain plainly reachable. Keep expressive imagery on mobile through intentional framing, not just by deleting the scene.
2. **A broader 2.5D working-table experience.** Choose this if object discovery should recur across the page. Its main risk is becoming several decorative layers with no stronger personal meaning.
3. **Full real-time 3D.** Choose this if walking/orbiting and spatial discovery are central to the desired experience, and ongoing asset work is acceptable. Start with one corner, not an entire room.

Audio should include both listening and making music. An optional user-started excerpt could express the latter if Owen supplies publishable work; headphone imagery alone would omit it. Snowboarding, coffee and keyboards need not each become a navigation button. Specific stories and actual objects can connect them more naturally than four generic hobby icons.

**Proposed proof of concept and acceptance gates**

After discussion, inventory personal assets and compare one desktop/mobile composition. Then build one scene interaction, one genuine project destination and the full fallback before expanding scope. No code, assets or benchmarks were produced here.

Proposed pass conditions:

- **Identity:** Owen explicitly recognizes the composition as personal; each depicted personal object has confirmation or is labelled illustrative. At least one detail reflects music-making as well as listening.
- **Findability:** in a small formative test, four of five unfamiliar viewers reach a selected project and contact within 15 seconds without instructions. This is a proposed gate, not statistical proof.
- **Input/access:** all actions work by keyboard and touch; focus stays visible; no required hover, drag or camera travel. Test at 320, 390, 768 and 1440 CSS pixels and 400% zoom. Reduced motion removes parallax and automatic camera movement. Audio starts only on request and has a visible stop control.
- **Resilience:** disabling JavaScript, failing an image request and rejecting graphics initialization each leave identity, project links and contact usable. Test interrupted rendering too if using WebGL.
- **Performance:** identify physical test devices and network conditions before measurement. Target LCP ≤2.5 seconds, INP ≤200 ms and CLS ≤0.1; eventual field assessment uses the 75th percentile separately for mobile/desktop. Lab measurements can guide the prototype but cannot certify field performance. Record transfer sizes and responsiveness against the readable baseline. [Google's Web Vitals guidance](https://web.dev/articles/vitals).
- **Maintenance:** demonstrate changing a project title/link without re-exporting imagery or editing independent navigation copies.

**Opposing view and remaining decisions**

This recommendation may overvalue recruiter efficiency. A memorable explorable place could communicate craftsmanship and enthusiasm better than an efficient entrance; a weak 2.5D compromise could retain the generic feeling Owen dislikes. If free exploration is the emotional appeal, test that directly before ruling it out. Architecture alone will not fix generic art direction.

The coordinator should establish whether the attraction is navigation, sculptural materials or personal storytelling. Unknowns include equipment, music-production practice and publishable excerpts, photographs, coffee rituals and snowboarding memories. Personal imagery and stories must precede an autobiographical scene; neutral geometry can validate navigation.

Handoff: discuss the ranking and asset questions with Owen, then commission only the selected bounded prototype. Verified here: local declarations and candidate HTML, Orca protocol, Next.js/MDN/WCAG/Web Vitals documentation; Blender evidence is limited to indexed official text. Browser control remained untouched, and no runtime performance, complete accessibility conformance or production asset readiness is claimed.
