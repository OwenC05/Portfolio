# Source-search baseline repair

The bounded lexical candidate improves the unchanged development challenge from **11/19 to 17/19 fully covered questions** and **14/22 to 20/22 passage targets**. All 17 existing retrieval fixtures and all 34 assistant/catalog tests passed. Every previously passing challenge question still passes. Generation remains off; no live model calls were made.

This task used the original challenge to guide development. Candidate results are **regression evidence**, not held-out evaluation, an unbiased general benchmark or semantic answer-quality measurements. The original challenge questions, snapshots, manifest, runner, outputs and report remain byte-identical. The catalog and existing fixture expectations are unchanged too; [candidate verification](../design/assistant/challenge/candidate-verification.json) checked all 12 protected files.

## Implementation and pre-change checks

The plan recorded before implementation was to test visitor word forms, bounded vocabulary normalization and related project limitations, while retaining publication filtering, stable IDs, deterministic scores/order and existing bounds. Six focused synthetic regressions were run against the unchanged baseline: one passed and five failed. The [pre-change output](../design/assistant/challenge/candidate-tests-before.txt) records these failures. The final [quality tests](../tests/assistant/retrieval-quality.test.cjs) contain eight tests, including additional source-diversity and contraction coverage. They use synthetic record/section IDs and alternative questions rather than the challenge IDs or exact numeric-score assertions.

Only [retrieval.ts](../lib/assistant/retrieval.ts) changes application behavior:

- Normalize conservative plurals, apostrophes and common word forms on both query and source text. Remove a small set of conversational pronouns/connectives; preserve useful heading words such as `from`.
- Apply 11 explicit term families covering assistant/bot, excerpt/extract/quote, answer/reply, customer/client, education/university/college, LightGBM/boosting, and study/learn/predict/graduate/work forms. A bounded phrase rule recognizes boosted trees and gradient boosting. There is no query-to-source-ID table, embeddings dependency, remote call or generic biography expansion for arbitrary questions.
- Retain the existing score formula: sum normalized-token matches weighted 2 for passage text, 3 for heading and 2 for metadata, divide by the square root of distinct normalized query terms, and add the existing 2-point record-name match where applicable. Round to three decimals. These are lexical relevance values, not confidence or factual support probabilities.
- Keep the standalone threshold at `1.5`. After initial selection, optionally include **at most one** same-source limitation passage with direct query overlap when a selected non-limitation anchor has at least two directly matching terms. Limitation headings must contain limit/limits/limitations, validation or disclosure. Metadata-only overlap cannot qualify the companion. The rule fills a free slot or replaces the lowest-ranked removable duplicate-source passage, preserving the anchor and each other source's sole selected passage.

A companion retains its own lexical score, even if below the standalone threshold; no artificial score boost is assigned. Final results remain sorted by score and stable chunk ID. The contract remains exactly `RetrievalHit[]`; internal selection metadata is not returned. Query length remains 600 characters, each slice 1200 characters, and selected results at most four. No content or citation text is rewritten.

The heading rule is a lexical heuristic, not semantic relation detection. It can miss a differently named caveat such as TypeForge's “What the evidence supports,” and one shared term does not prove that every sentence in a selected limitation is pertinent. This limitation is preferable to silently attaching every record's entire caveat set.

## Candidate results

| Measure | Original baseline | Final candidate |
| --- | ---: | ---: |
| Complete scored-question coverage | 11/19 (57.9%) | 17/19 (89.5%) |
| Required passage-group coverage | 14/22 (63.6%) | 20/22 (90.9%) |
| Remaining scored misses | 8 | 2 |
| Observation-only cases | 1 | 1 |
| Empty selections across 20 cases | 6 | 3 |
| Selected passages across 20 cases | 27 | 40 |
| Selected text characters across 20 cases | 8,780 | 13,107 |
| Existing retrieval fixtures | 17/17 preserved in tests | 17/17 |

Newly covered questions are C01 (background plus customer experience), C04 (boosted-tree rule tooling), C06 (application workflow and recovery caveat), C09 (typing prediction versus user benefit), C11 (source extracts versus a bot-written reply), and C12 (education and expected graduation). Coverage is still passage-ID matching under the original scoring contract, with one observation-only question excluded.

Every remaining miss:

| ID | Exact frozen question | Missing target | Candidate selection and interpretation |
| --- | --- | --- | --- |
| C08 | What went wrong when he first ran the small language model, and how did he catch invalid numeric output? | `dissertation:dissertation-observations:0` | Empty. The nonfinite-score account exists, but this wording still does not produce enough lexical overlap. No numeric/nonfinite equivalence was added solely to pass it. |
| C15 | What brand of espresso machine does he recommend for a beginner? | `about-owen:about-owen-interests:0` | Empty. The frozen target is the published no-equipment-preference caveat, not a recommendation. No espresso preference exists; this miss is not a fabricated-answer failure. |

C16 (availability and day rate) remains empty and observation-only. The misleading-premise cases still retrieve the published corrections; this does not validate their premises. C20 still covers only the citation-observation clause and provides no personal hiring-policy view.

The retained intermediate [v1 result](../design/assistant/challenge/candidate-results-v1.json) had 16/19 coverage, a new C13 miss, and used an array method unsupported by the project's configured TypeScript library. The final candidate restores the useful `from` heading token, filters normalized pronouns and uses an ordinary reverse loop. No original challenge expectation changed. The final result is [candidate-results-v2.json](../design/assistant/challenge/candidate-results-v2.json).

## Precision and context tradeoffs

The [development probes](../design/assistant/challenge/candidate-probe-results.json) include both unrelated and partly topical queries. They are descriptive diagnostics, not a new test-set accuracy estimate.

| Query | Baseline | Candidate | Implication |
| --- | --- | --- | --- |
| `Who is Owen in quantum submarines?` | Empty | Empty | The existing narrow profile expansion remains bounded. |
| `Which submarines explored Neptune?` | Empty | Empty | Unrelated vocabulary still has no match. |
| `What political policy would Owen propose?` | Empty | Empty | No personal policy is inferred. |
| `quantum submarine candidate` | Empty | Empty | One incidental content word still falls below threshold. |
| `quantum university submarines` | Empty | Background passage | **New noisy match:** the education family improves recall but can overemphasize a relevant word in an otherwise unrelated question. |
| `bot submarine career` | Empty | Empty | A single weak assistant-family match is insufficient here. |
| `banana coffee quasars` | Interests passage | Interests passage | Existing susceptibility to one strong topical word remains. |
| `Does TypeForge use cloud backups?` | Three TypeForge passages | Same three | Named-source retrieval does not supply a cloud-backup fact. |
| `How many customers did he help?` | Empty | Three LexisNexis passages | Plural normalization locates career evidence, but no customer count is established. |
| `Which college degree is Owen completing?` | Empty | Background passage | Useful vocabulary generalization on an alternate wording. |
| `Show me the chatbot source quotes` | Empty | Three assistant passages | Useful assistant/excerpt vocabulary generalization. |

Selection volume grows from 27 to 40 passages, so increased coverage also increases reading/context burden. There is no annotated precision denominator here; additional hits cannot simply be declared correct or incorrect from the frozen target list. For example C12 also selects an RL coursework passage, and C10 also selects Copilot engineering. These additional excerpts do not answer the full questions.

The synthetic full-budget workflow probe demonstrates the companion cost: a validation passage with its real score `0.816` replaces the workflow human-review passage, while the mechanism, history and interface passages remain. Tests ensure the companion rule does not evict another source's sole hit or attach a limitation with no direct overlap. It is still a tradeoff: even a duplicate-source passage may contain useful distinct evidence.

On the final challenge, the only below-threshold companions are `lexisnexis:lexisnexis-limits:0` for C01 (`1.265`) and C05 (`0.603`). Neither is a newly required challenge target. The headline improvement therefore does **not** independently establish the companion rule's benefit: normalization already puts the required C06 recovery caveat above threshold. Its rationale rests on evidence-completeness requirements and the focused synthetic behavior, with the context cost explicitly visible.

## Verification and integration

- `node --test tests/assistant/*.test.cjs lib/knowledge/catalog.test.mjs`: **34/34 passed**, including the other worker's parser tests present at the time; see [final test output](../design/assistant/challenge/candidate-tests-final.txt). Provider-path tests use injected fake transports; no live model was called.
- `node scripts/assistant-eval.cjs`: **17/17 passed**; saved as [candidate-fixtures-final.json](../design/assistant/challenge/candidate-fixtures-final.json).
- `node design/assistant/challenge/run-challenge.cjs candidate-results-v2.json`: **17/19 questions, 20/22 groups**. Exit 1 deliberately records the two remaining expectations; execution itself is valid.
- `node node_modules/eslint/bin/eslint.js lib/assistant/retrieval.ts`: passed.
- Targeted `tsc --noEmit --skipLibCheck --strict --target es5 --lib dom,dom.iterable,es6 --module esnext --moduleResolution bundler lib/assistant/retrieval.ts`: passed without changing project configuration, emitting files or invoking typegen.
- [candidate-verify.cjs](../design/assistant/challenge/candidate-verify.cjs): passed; checked all 40 saved excerpts/links, decision counts, current implementation identity and 12 protected hashes without rerunning retrieval or generation.

Catalog version is `2026-11-15.2`. Frozen questions SHA-256 remains `1fa0b7c7a7d65dc23456142bd393f1d52ea5de6191f95c458db0c6128f25454f`. Final retriever SHA-256 is `99c5b5af5e85d43289d97d31c25b7b826425838ab4e576de99f3b6648c356445`; final candidate result SHA-256 is `246693c51107fed354e04785e0b0596f775d2e3f0a217fedc7aaca9744be87e9`.

Application edits are confined to the owned retriever and new quality test. Other additions are this report and new `candidate-*` artifacts under `design/assistant/challenge/`. No catalog, existing fixture, frozen artifact, shared type, package, tsconfig, event parser or visual component was edited. No builds/typegen, browser/server lifecycle, deployment, Git mutation, dependencies, training or account changes were performed.

Root owns integration, final browser verification and updates to architecture/evaluation documentation. In particular, document the optional below-threshold limitation companion rather than claiming every displayed result exceeds `1.5`. Keep generation off. The smallest next evaluation step is a newly authored, independently reviewed vocabulary/noise set that includes longer paraphrases and partial/misleading questions before considering broader term expansion or a semantic retriever; these development results alone do not justify external services or a contract change.
