# Studio v2 browser preparation

These three files are **async(page) expressions for `browser_run_code_unsafe`**, not Node CLI tests. They were adapted from the preserved v1 helpers. Only parsing/static checks have run. No runtime, asset, visual or acceptance pass is claimed.

Root owns the server/browser/build leases. Run only after S's actual async GLB integration and U assembly are frozen. No guessed asset URL is embedded. Use the current tool schema: `filename` is workspace-relative and takes precedence over `code`; only `page` is passed to the expression.

## Minimal config

Supply a JSON file in this folder named `config.json` (not provided with speculative values):

```json
{
  "baseURL": "<root-owned preview origin including actual port>",
  "previewMode": "production",
  "sceneJS": ["<actual scene chunk URL and scene dependency chunk URLs>"],
  "glbs": ["<actual loaded final GLB URL>"],
  "textures": [],
  "hashes": {"build": "<root fingerprint>", "source": "<manifest hash>", "assets": {"<GLB URL>": "<sha256>"}},
  "artifactDir": "<absolute existing path under .omx/artifacts/visual-ralph/portfolio-immersive-v2/browser-verification>"
}
```

`sceneJS` must contain the final scene JS dependency closure, including loader/Three chunks. Failure testing aborts each supplied chunk separately. Use exact requested URLs including query strings, not globs. `glbs` lists every final requested GLB. Embedded textures count inside those bytes; list external texture URLs separately. `hashes` are root-supplied provenance, **not independently verified by these browser helpers**. Bind them to the frozen build and independently hash local assets before running. The production request inventory must be reconciled with returned complete resource entries; manually supplied attribution cannot discover omitted dependencies.

## Exact invocation sequence

1. Root completes/fingerprints the integration and starts its own production preview. Capture actual loaded chunk/GLB URLs from that build. Fill config above and create its v2 artifact directory.
2. Materialize configured expression copies using PowerShell from repository root:

```powershell
$folder = Join-Path (Get-Location) 'design/studio-v2/browser-verification'
$config = Get-Content -Raw (Join-Path $folder 'config.json') | ConvertFrom-Json
$json = $config | ConvertTo-Json -Depth 20 -Compress
foreach ($name in @('failure-validation','performance-validation','dev-lifecycle-validation')) {
  $source = Get-Content -Raw (Join-Path $folder ($name + '.mjs'))
  $configured = $source.Replace('/* STUDIO_V2_CONFIG */ null', $json)
  [IO.File]::WriteAllText((Join-Path $folder ($name + '.run.mjs')), $configured)
}
```

3. Invoke isolated `browser_run_code_unsafe` sequentially with `{"filename":"design/studio-v2/browser-verification/failure-validation.run.mjs"}`, then `{"filename":"design/studio-v2/browser-verification/performance-validation.run.mjs"}`. Save returned JSON under the config artifact directory. The failure helper also writes screenshots there. These helpers do not create/start servers or write result JSON themselves.
4. Under root's lease, switch to a development preview, replace `baseURL`, set `previewMode: "development"`, refresh development chunk URLs/provenance, rerun materialization, then invoke `{"filename":"design/studio-v2/browser-verification/dev-lifecycle-validation.run.mjs"}`. Preserve production results/config separately. Never report the development lifecycle result as production timing evidence.
5. Inspect raw outputs and page/console errors; a thrown exception or unsupported CDP/Next router is a blocked check, not a pass. Restore the intended review preview under root ownership. No helper changes product files.

## Evidence boundaries and remaining adapter checks

- Lifecycle enters/leaves `/studio` five times through the installed development `window.next.router`, retaining a document token. No DOM removal or full reload substitutes for React cleanup. It reports baseline listener/observer/RAF counts, created/deleted WebGL resources and context loss. References are deliberately retained; this cannot prove JS heap collection or physical GPU memory release. Stack ownership is development-only, once/AbortSignal expiry and observer `unobserve` are not inferred. Inspect recorded contexts for StrictMode replay; the preview label alone is not proof. No undocumented router fallback is installed.
- Failure uses fresh contexts for exact chunk abort, GLB transport abort, invalid GLB body under HTTP 200, WebGL creation failure and real `WEBGL_lose_context` while the reading panel is open. It asserts current v2 panel heading/close/focus behavior, not v1 scroll-away history. Invalid GLB covers parser rejection, **not embedded image decoder rejection**. Native no-JS/full history tests remain outside this bounded adaptation.
- Delayed response holds a real fetched GLB until actual Next unmount, then releases it and observes the surviving document/DOM/errors. Failure to observe the configured request is explicit failure. A cancelled network delivery is recorded separately from parse completion. **Remaining S boundary:** adapter CPU tests must prove pending parsed geometry/material/texture/ImageBitmap disposal after cancellation and late decode. These DOM probes cannot count CPU-only resources never uploaded to WebGL; do not invent production test hooks to claim that proof. After integration, confirm status becomes ready only after required GLB attachment and first render; the harness deliberately does not accept the old procedural-only readiness as asset evidence.
- Performance uses trusted Playwright clicks on named v2 look buttons and actual viewport resizing for ten seconds; it checks yaw changes before the sample. No synthetic hover/old camera coordinates. Raw initial frame draw totals include first-frame shadow passes. Returned renderer dataset is supplementary, not a replacement for those totals. Requested-RAF request-to-start and callback-duration p95 are CPU-side measures, **not GPU time**. Inter-render intervals include automation/input gaps and are descriptive only. Compare request latency to 33ms; retain long tasks and raw frames. Peak raw calls/triangles across initial/sample must meet 200/200k; transferred encoded scene JS+GLB+external textures must meet 1.5MB. Zero resource sizes block transfer conclusions. DPR observations must meet desktop <=2 and small <=1.5. Shadow-caster count still needs source/scene inspection.
- Offscreen observation scrolls to v2 Contact rather than hidden SSR project content. Root must confirm canvas actually leaves viewport; if layout prevents that, report the offscreen case blocked and adapt this one scroll target. CDP freeze/resume is lifecycle evidence, not proof of a hidden-document event. No physical device or visual judgment is claimed.

### Embedded image decoder case

`embedded-png-decode` fetches each configured real GLB through the intercepted request, requires HTTP 200 and validates GLB version/total length, JSON/BIN chunk boundaries, embedded buffer and every bufferView bound. It supports the pilot's embedded PNG-only image set; external images, unsupported formats, no PNG, malformed chunks and overlapping mutation ranges explicitly block the case. No geometry or asset is fabricated or written.

It mutates the first PNG's first nonempty IDAT zlib compression-method byte to an invalid value and recomputes that IDAT CRC. Only that payload byte and its four CRC bytes can change. PNG signature, IHDR/dimensions, all chunk types/lengths, GLB container/JSON and buffer bounds stay byte-identical. Returned `embedded-png-corrupted` evidence captures offsets, lengths and preservation checks. Fulfilment uses decoded response bytes with stale wire compression/length/validation headers removed. A route mutation error cannot count as successful decoder injection even if transport failure subsequently shows fallback.

Root must still run this case and observe `unavailable` plus the full readable HTML panel and focus return. **Known loader uncertainty:** installed Three r187 GLTFLoader `loadTextureImage` catches image-load rejection and returns `null`; the source-image path logs the load error. Therefore a required texture decode failure may leave the GLB promise fulfilled. S's adapter must reject missing required textures or otherwise propagate this failure. The harness intentionally fails if the scene stays ready; do not weaken it to accept a missing-texture render. Console output is retained for root inspection. This case is distinct from malformed GLB parser rejection and does not claim browser decoder evidence until executed.

Static preparation check: `node design/studio-v2/browser-verification/verify-static.cjs`. This parses the expressions and runs bounded ESLint rules without executing browser code; it is not product lint/build/browser acceptance. Optionally append a real local GLB path: the CPU check extracts this exact mutation function, verifies source bytes remain unchanged, original PNG IDAT inflates, corrupted IDAT rejects, and a truncated container is blocked. No output asset is written. Checked against the existing pilot v03 with exit 0; this CPU zlib result is not browser decoding or integrated acceptance.
