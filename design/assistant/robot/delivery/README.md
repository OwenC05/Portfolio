# Studio apprentice checkpoint

18 November 2026. The selected **A / Porcelain clerk** robot is implemented inside the Studio and connected to the portfolio's source-search assistant. The current local candidate is build `KEhdfJ0NJBO2q0ASaHcHN` on `feature/portfolio-assistant`. This is a reviewable development checkpoint. **Desktop performance acceptance remains open; do not treat this as release or merge approval.**

## What visitors can do

Click the robot or use the labelled Ask button to search published portfolio material. The robot presents the actual number of retrieved passages; the accessible panel shows the same passage keys, source links and selection. New requests, cancellation, failure and closing clear stale results. Unsupported topics offer contact rather than invented answers. The HTML entry remains usable when the avatar is outside the view or WebGL fails. `/ask` remains available.

The shared request owner serves both interfaces. Generation remains disabled, with no model calls, paid generation, model training or new claims about Owen's work introduced by this integration. The character's finite gestures express attention and source presentation; they do not represent hidden model reasoning.

## Evidence and limits

| Area | Current disposition |
| --- | --- |
| Source and build | Root reviewed the final renderer-only DPR cap change; 14 focused density/resize/picking tests, direct TypeScript and scoped lint passed. Fresh production build, including type/lint checks, passed; all 83 inputs stayed unchanged. [v04 receipt](../integration/verification-g4-v04/README.md) |
| Shared lifecycle and runtime | Earlier full checks include 113 assistant tests, 17 retrieval fixtures and 105 runtime/cleanup probes. The v03 complete browser flow passed 15 checks, including native robot activation, source selection, cancel/error/no-match, project takeover and navigation. The v04 density change additionally passed native activation, real four-source agreement and clearing. These are different suites/versions, not one summed pass count. [v03 evidence](../integration/verification-g4-v03/README.md) |
| Failure and motion preferences | Browser evidence covers live reduced motion, finite settling, offscreen/zero-size suspension, robot-load failure with a healthy room, and WebGL-loss HTML recovery. [Bounded browser evidence](../integration/final-browser-v01/handoff.md) |
| Visual quality | Actual Claude passed the reviewed phone/source/look states, the requested attention-clearance stills and the final native-DPR-2 HTML over a DPR-1.5 canvas. No further density image is requested. [Final density review](../review/density-source-v04/review.md), [attention review](../review/density-attention-v01/review.md) |
| Assets and export checks | Approved v03 public GLB is paired with editable Blender source, authoring script, profile, poses and manifest. The two known reusable export-validator defects were repaired and independently rechecked. [Asset package](../asset-pipeline/selected-a-v01/candidate-001/build-v03/README.md), [validator review](../review/export-validator-v03/review.md) |
| Transfer and drawing | Fresh v04 cold-context inventory after Ask and real source completion: **1,191,785 encoded bytes**, 12 JavaScript URLs and 2 GLBs, all positive sizes; under the 1,500,000-byte scene budget. Observed peak **125 calls / 98,876 triangles**, under 200/200,000. This is the current pilot-room integration, not a future full-kit allocation. [Transfer receipt](../integration/verification-g4-v04/transfer-inventory.json) |
| Desktop scheduling | **Unaccepted.** Fresh native-DPR-2 windows recorded request-delay p95 **10.9 ms** and **41.6 ms**, against 33 ms; the small viewport recorded 11.7 ms. The failed repeat remains a failure. [Independent measurement audit](../review/g4-v04-performance/review.md) |

The single subsequent diagnostic recorded p95 10.4 ms but retained eight long waits. Their timing overlaps Chromium's Windows presentation-path spans by 88.1–98.2%. This localizes observed browser waiting; it does not establish GPU saturation, a driver fault or an application contract violation. No further source patch or benchmark is justified by that handoff. Keep the candidate and the failed gate documented for any future platform investigation. [Trace handoff](../integration/resize-wait-trace-v01/handoff.md)

Still unverified: continuous/interrupted clearance between sampled poses, physical touch/pen, phone software keyboard, screen-reader use, actual development StrictMode and GPU timing/reclamation. Static reviews do not certify those. Deferred low cosmetics are the phone no-match contact wrapping, card tint and the subtle tray selection cue; the panel remains authoritative.

## Reproduction and evidence storage

Use the repository's normal typecheck, assistant tests/evaluation, relevant scene tests, lint and build commands in [CONTRIBUTING](../../../../CONTRIBUTING.md). Only one process may write `.next`; preview ownership receipts are retained with each build. Run browser helpers against a new evidence directory and the pinned build. Historical build-bound reports should stay unchanged.

The checkpoint extends `.gitattributes` to preserve the reviewed source bytes across checkouts. Sixteen inherited inputs previously differed from Git's stored form only by automatic CRLF normalization; their working content and behavior are unchanged. The stored versions now match the build receipts exactly, alongside the new assistant files.

The 98,562,463-byte diagnostic trace is preserved losslessly as `integration/resize-wait-trace-v01/chromium-trace.json.gz` (9,186,683 bytes), with [archive identity](trace-archive.json). The original raw trace remains local and its recorded hash is unchanged. Git carries the archive; restore the exact JSON before following historical raw-trace links or rerunning its offline parser:

```powershell
node design/assistant/robot/delivery/trace-archive.mjs restore
```

`verify` checks the decompressed byte count and SHA-256 without restoring a file. Restoration refuses to overwrite a different raw trace. Editable assets, useful screenshots, original failed evidence and independent reports remain included; compression does not discard or redact evidence.

The separate Studio branch, main-worktree application and production deployment remain under their own acceptance process. This checkpoint neither spends room reserves nor promotes the branch to production.
