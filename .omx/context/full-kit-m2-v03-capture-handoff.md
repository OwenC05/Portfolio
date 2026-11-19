# M2 v03 material repair: actual-render handoff

15 November 2026. Root captured the exact v03 candidate through the existing real loader, certificate, binder and authored full builder. This is focused material evidence, not production integration or final room/performance acceptance.

- GLB SHA256: `7c0d30428065d0024bb1c4a631a3b54504008edcccab91c75e7367a53fa57752`.
- Paired manifest SHA256: `5e1cb075b377c3ce3d7656601eef55afdd5d59aeef5be6d3c4b28500f83228d9`.
- Capture receipt: `.omx/context/full-kit-m2-v03-runtime-capture-v01.json`, SHA256 `6ba13644b5217383ff4bf70706f2d5468fe287ed92c40b9d7f324a510994bb8c`.
- Images: `.omx/artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m2-v03/`. Each of the18 saved PNGs is byte-counted and SHA-256-bound in the receipt.
- Script: `.omx/context/full-kit-m2-v03-capture-v01.mjs`. The isolated server selected `--stage M2 --revision v03`; v02 remains the default M2 candidate.

## Coverage

Thirteen actual scene images:1440 home, music, left-up, right-up, right-down, mid-left, mid-right;1024 home;390 home, music, left-up;320x844 home;320x568 home. The seven pendant views requested by the critic are included, plus left-up390 and shared-material lamp/PC/wall views. Phone pose is74/-13.5/-7; desktop camera and look poses are unchanged. DPR1, reduced motion, provisional lighting and remaining proxies.

Five additional static comparisons place the viewport-sized v03 PNG at1:1 beneath the actual product DOM/CSS:1440 home/music/mid-right,1024 home and390 music. The product itself still loads the pilot; these are labeled composites, not v03 integration, picking or interaction evidence.

## Technical result and limits

All13 scene captures and five composites completed. No capture failures, page errors or source-hash drift. Before/after source verification includes the snapshot inputs and four actual UI source files. S independently checked the paired v02/v03 material/BIN/flag delta before capture; geometry, bindings and resource identity evidence is separate from material appearance.

The captured console error now includes its location: `http://127.0.0.1:4182/favicon.ico` returns404 in the isolated preview. This identifies the v03 warning; it does not retroactively prove the cause of v02's locationless warning. No failed HTTP response was emitted through the captured Playwright response events. A separate `net::ERR_ABORTED` fetch of the existing product's `pilot-right-limit-v03.glb` was recorded while preparing UI comparisons; the real product reached `ready` for every composite. Do not report zero network errors or infer the cause of that abort from this record.

Root used one browser context at a time, closed the contexts and browser page, then stopped only its verified capture-server PID26744. The main4181 preview remains running. No Blender, production build, dependency install or asset edit ran as part of the capture. The candidate hold can be released for separately authorized new versioned work; preserve this v03 candidate and evidence unchanged.

Independent actual-Claude Fable must inspect the images and rerun its consistent pixel measurements: pendant clipping under2% in the requested views, luminous ends/body edge, and collateral floor-lamp bulb, PC glow and wall-triangle proxy response. No visual pass is claimed by this technical handoff. The unperformed PC front UV/glow relocation remains a distinct proposed change.
