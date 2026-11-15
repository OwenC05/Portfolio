# Studio v1 integrated asset provenance

Independent static review, 14 November 2026. Task `task_48a0b6981832`, dispatch `ctx_2647d9b48a74`. Scope: the root Next application and additive `/studio` route. This is source/package evidence, not a browser request capture or a deployed-artifact certification.

## Result

**No new nonprocedural media or font file is shipped by Studio v1.** The scene uses authored geometry and runtime Canvas2D drawing; the fallback uses HTML/CSS. No private room photograph, reference-site image, downloaded model, HDRI, audio, video, generated illustration or copied font enters the route's source/import/public-file boundary. Three.js is the sole added runtime code dependency and has its MIT license retained in the installed package.

There is one inherited public file: `public/favicon.ico` is a 129-byte text placeholder, not an image. Its source history is established, but no standalone license record was found; do not represent the inherited site as having a fully verified asset-license inventory. This is a baseline limitation, not a newly introduced Studio asset.

## Asset register

| File or element | Source / reuse basis | Modifications and shipped status |
| --- | --- | --- |
| New nonprocedural Studio files | None found in `public`, `app/studio`, `components/studio`, or their runtime imports | Empty inventory: no new raster/vector media, mesh, HDRI, audio/video or font binaries. `public/studio` does not exist. |
| Room and equipment geometry | `components/studio/scene/build-studio.ts:8`; original procedural assembly, corroborated by `scene-asset-provenance.md:7` | Authored locally using Three primitives and the official rounded-box helper. Internally labelled stylised; no claim of exact manufacturer geometry, product revision or logo fidelity. |
| Timber grain and contact shading | `components/studio/scene/textures.ts:16` and `:33` | Generated with lines and radial gradients on local canvases. No sampled image, `drawImage`, image loader or asset download. |
| Three project screens and upper decorative screen | `components/studio/scene/textures.ts:45` | Canvas text and diagrams; no captured output or benchmark screenshot. Copilot screen says in development. TypeForge phrases and the upper sinusoidal graphic are decorative, with no metric, recording, player or live-activity claim. |
| Fallback and page decoration | `components/studio/StudioExperience.tsx:203`; `app/studio/studio.module.css` | Authored HTML/CSS. The fallback is a drawn sketch, not a copied photograph or pre-rendered image. |
| Typography | `app/studio/studio.module.css:11`, `:130`, `:149`; `textures.ts:60`, `:68`; root `app/layout.tsx` and `tailwind.config.ts` | Installed system/generic Arial/Helvetica, Courier, Georgia/Times and sans/serif/monospace stacks. No font file is redistributed; no Studio OFL file is needed. |
| `three@0.187.0`, including `three/addons/geometries/RoundedBoxGeometry.js` | `package.json:16`; `package-lock.json:5519`; `node_modules/three/LICENSE` | MIT, copyright 2010-2026 three.js authors. Installed license is present (1,081 bytes). The source imports the official addon at `components/studio/scene/resources.ts:2`; it is not a separately downloaded model. Source-level use only was checked; no packaged/deployed-license-notice claim is made. |
| `@types/three@0.187.0` | `package.json:22`; `package-lock.json:596`; `node_modules/@types/three/LICENSE` | Development-only MIT definitions, with license present (1,141 bytes). The six required transitive packages are listed in the static review; none is imported into application runtime source. They are code dependencies, not artistic assets. |
| `public/favicon.ico` | Unchanged tracked file introduced by commit `733e2a99098e6cee277dbe892baaa8421ce758e7` (Initial Commit) | 129 bytes of instructions to replace the favicon with a personal monogram; not valid ICO image data. No new change, graphical content or known private image. No explicit license/author evidence beyond repository history was located. Baseline P3 in the static review. |

Favicon SHA-256: `65f9c208d088eb7e9e1a8a10d7468e8a6afffd7328d4a82953a2abafcd5f732c`.

## Preserved references that are not Studio assets

- The private room photo identified in `.omx/context/after-hours-studio-v1-20261114.md:7` remains a layout reference. Runtime source scans found no photo filename/path, image loader, embedded image data or public copy. The photo itself was not opened, copied or transformed by this review.
- Matthis Garnier/Hanusek research screenshots stay under `.omx/context/references-after-hours-v1/`. The recorded inspiration concerns object specificity, material contrast and direct navigation; no reference screenshot is imported or served by this route. Source inspection does not independently prove the full history of artistic authorship.
- The older working-table concept retains `manrope.ttf`, `bodoni-moda.ttf`, `mechanical-key-study.png` and both OFL records under `.omx/artifacts/visual-ralph/portfolio-studio-v3/concept/assets/`. Neither the fonts nor the generated illustration is referenced by the root application. The retained Manrope and Bodoni files identify SIL OFL 1.1 and their respective project authors. No new permission for reuse of the old generated illustration is inferred from its provenance record.
- `design/portfolio-draft` and the older concept remain separate artifacts. Their preview processes were not accessed or changed. This manifest is not a relicensing of those drafts.

## Verification and limits

Fresh checks: enumerate `public/app/components/lib`; inspect root layout/config and Studio imports; scan those runtime trees for external URLs, embedded data, CSS URLs, font declarations/imports, media/asset extensions, loaders, fetch and playback APIs; inspect complete Canvas2D texture source; compare `git diff HEAD -- public`; inspect installed dependency manifests/licenses and parsed lockfile additions. `public` contains only the unchanged placeholder above. Runtime source contains supplied contact/repository destinations, but no remote media/font fetch or private evidence import. No private logs, fixture files, annotations or output excerpts were copied into either report.

This supports absence within the current static serving/import boundary. Browser network requests, final output packaging, and any future deployment remain integration-owner evidence. No build, preview, browser, dependency install, source edit or helper agent was used in this review.
