# Studio scene asset provenance

14 November 2026. Scope: the scene lane only; interface fonts and other page assets belong to their owners' manifests.

No external image, model, HDRI, audio, video, font or other binary asset is shipped by this lane. `public/studio/scene/` was not needed. The private room photograph was not copied, transformed, embedded or published.

| Scene element | Source and construction | Reuse / qualification |
| --- | --- | --- |
| Room, workstation, monitors, music controller, drums and personal accents | Original procedural geometry authored in `components/studio/scene/build-studio.ts` with shared primitive helpers in `resources.ts` | Authored for this project. Stylised approximations; no exact manufacturer, model revision or product fidelity claims. No logos. |
| Timber grain | Original deterministic Canvas2D line drawing in `textures.ts` | Generated locally at runtime; no sampled photograph or downloaded texture. |
| Soft contact shading | Original radial Canvas2D gradient in `textures.ts` | Generated locally at runtime; supplementary to one real shadow-casting light. |
| Three project screens and decorative upper monitor | Original Canvas2D typography and diagrams in `textures.ts`, drawn with generic browser monospace/sans-serif | Decorative project identifiers and architecture/workflow illustration, not captured outputs, measured results, playing audio or live activity. Full evidence remains HTML outside the canvas. No font file bundled by the scene. |
| Basic primitive and rounded-box geometry implementation | Installed `three@0.187.0`; `RoundedBoxGeometry` from its official addon | Existing authorized MIT-licensed dependency, with license retained in `node_modules/three/LICENSE`; no additional runtime dependency. |

The user's layout brief determined the equipment arrangement, warm palette and right-hand music corner. Reference findings and the Matthis Garnier/Hanusek screenshots were used only to assess specificity, material contrast and parallel navigation. No reference-site assets, code, layouts or subject matter were copied into the scene. Their screenshots remain research evidence outside the public scene assets.

Implementation references consulted: official Three.js render-on-demand examples, cleanup/disposal source and picking guidance, plus the installed r187 renderer/addon source. These informed integration behavior, not third-party artistic assets. The retained `PCFShadowMap` setting follows the installed r187 implementation; the removed soft-shadow constant was corrected after the first browser preview.
