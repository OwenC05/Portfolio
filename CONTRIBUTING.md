# Development workflow

This repository contains the portfolio application and the editable sources, scripts and evidence used to build the studio. The immersive studio is work in progress; its current state and outstanding acceptance checks live in [the studio work log](design/studio-v2/work-log.md).

## Branches and checkpoints

- Continue the studio on `feature/studio-v2-after-hours`, with a draft pull request targeting `main`.
- Commit at meaningful handoffs: a bounded implementation, an asset version with its source and manifest, or its independent verification. Use clear messages such as `fix: ...`, `feat: ...`, `test: ...` and `docs: ...`.
- Push those checkpoints so GitHub reflects local progress. Before pushing, inspect the staged diff, check for credentials or unrelated changes, and run checks appropriate to the change. Report failures as failures; an uploaded checkpoint is not release approval.
- The coordinating agent owns Git staging, commits and pushes in the shared checkout. Workers own assigned files and report ready artifacts. Do not reset, rewrite another worker's changes, or switch branches without coordinating.
- Before a shared source file passes to a different owner for edits, preserve its exact pre-change bytes in a Git checkpoint or a named, hash-verified source snapshot. Record the ownership handoff and compare the resulting diff against that baseline. A hash without the recoverable file is insufficient for a claim that only the delegated section changed.
- Keep the PR description current, including remaining work and verification limits. Merge only after the applicable technical and visual reviews and product acceptance checks pass. Do not force-push or publish to production as part of checkpointing.

The initial studio history includes a large recovery checkpoint. Preserve that history; keep subsequent changes focused so they can be reviewed independently.

## What belongs in Git

Track application code, the dependency lockfile, design decisions, asset-authoring scripts, editable `.blend` files, paired `.glb` exports and manifests, provenance, useful screenshots and review reports. Preserve recorded hashes and the byte-bound files they identify; `.gitattributes` deliberately disables newline conversion for those paths.

Do not track credentials, environment files, dependencies, build output, compiler caches, temporary browser logs or agent runtime/session state. The narrow `.gitignore` rules intentionally keep design and verification artifacts visible. Check individual asset sizes before committing; introduce a coordinated storage strategy if assets become large rather than silently dropping editable sources or evidence.

## Local checks

Use Node.js 24 and the committed lockfile for reproducible installation:

```sh
npm ci
npm run dev
```

Run checks from the repository root:

```sh
npx tsc --noEmit --incremental false
node --test components/studio/scene/verify-controller.mjs components/studio/scene/verify-pilot.mjs components/studio/scene/verify-full-kit.mjs
npm run lint
npm run build
```

Only one local process should write `.next` at a time: coordinate stopping the development server before a production build. Hosted CI builds in its own checkout. The node tests cover technical behavior using documented CPU/image shims; they do not prove browser rendering, GPU cleanup, interaction or performance.

At the current checkpoint, configured lint cannot load `@typescript-eslint/eslint-plugin`. This remains a visible blocker; do not remove rules, ignore failures or claim lint passed. Dependency changes must be deliberate and include the lockfile. The final build and browser acceptance gates also remain open.

## Asset and product acceptance

Pair each asset export with its editable source, authoring script, manifest and validation report. Keep failed versions when they explain a repair, and label proposals and proxies honestly. Independent Claude review owns visual judgment; Codex verifies implementation and technical evidence. Authors do not approve their own stage.

Final acceptance requires the approved room in the actual product, readable and accessible project content, desktop/mobile input and navigation checks, lifecycle/failure handling, measured performance and independent review. Isolated renders and static UI composites are useful evidence but do not establish production integration. Follow the existing [acceptance checklist](.omx/context/immersive-v2-acceptance-checklist.md) and [test specification](.omx/plans/test-spec-immersive-studio-v2.md).
