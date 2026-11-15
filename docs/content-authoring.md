# Publishing portfolio content

`lib/knowledge/catalog.ts` is the explicit public allowlist shared by source pages and assistant retrieval. `content/drafts/` contains local editorial templates only: no runtime imports, directory scanning, markdown loaders or API endpoints read it. Changing a draft's frontmatter alone does not publish anything.

## Publication procedure

1. Complete the relevant draft using Owen's actual account and approved public sources. Writing categories include research notes, experiments, engineering and personal writing. No category requires placeholder posts.
2. Review contribution, source attribution, outcome evidence and disclosure. Keep paper claims separate from Owen's take. Do not reproduce assessment submissions, learner notes, employer files, customer details, raw CVs, referee contacts or photos.
3. Manually add only approved text as a `KnowledgeRecord` in `publishedKnowledge`, with `publication: 'published'`. Draft records and draft text must never be placed in this array.
4. Use unique stable lowercase hyphenated record IDs/slugs and globally unique section IDs prefixed with the record ID. Preserve section IDs when editing so citation anchors survive. Bump `knowledgeVersion` and the record's `updatedAt` when published text changes.
5. Label evidence honestly: `owner-reported` for personal accounts, `artifact-backed` for claims directly supported by linked artifacts, `mixed` when both are present. An artifact link is not independent reproduction. Give each record source or context links and explicit limitations.
6. Run `node --test lib/knowledge/catalog.test.mjs`, typecheck and the application build. Verify the rendered page and section anchors. Root owns integrated assistant evaluation and deployment.

Writing records resolve to `/writing/[slug]`; other categories resolve to `/work/[slug]`. Both routes look up the explicit published catalog and reject unknown slugs or the wrong category. The writing index has an editorial empty state until a reviewed writing record exists.

## Current provenance

- Dissertation, Copilot and TypeForge accounts were curated from `lib/studio-content.ts`.
- Lexis employment history and high-level contributions were curated from the separate reference checkout's `lib/publicPortfolio.ts` and `lib/content.ts`; these remain owner accounts. The owner additionally reported customer-facing work and responsibility for ML tooling, including improving LightGBM rule-mining speed, quality and usability. No numerical results were provided.
- TypeForge source and benchmark links point to public artifacts already cited in the curated reference. No independent reproduction is claimed.
- Assistant status describes an in-progress project and its intended behaviour. Update with actual validation and deployment evidence only when available.
- RL coursework has no substantive approved public artifact here. Its status remains “Write-up in preparation”; a study companion is not evidence of coursework implementation.
- Research-paper titles, opinions and personal application stories await Owen's input. Templates do not establish reading history.
