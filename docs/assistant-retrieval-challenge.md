# Independent source-search challenge

On 15 November 2026, the current lexical retriever found every predeclared passage target for **11/19 scored questions (57.9%)**, covering **14/22 required evidence groups (63.6%)**. Eight scored questions missed at least one target. One further question about availability and pricing was observation-only. These are source-navigation results from a small, catalog-informed challenge, not general answer accuracy.

The practical gaps are ordinary paraphrases and incomplete evidence coverage. The retriever returned no passages for a graduation question despite a published graduation year, and it omitted relevant limitations when retrieving Copilot engineering and TypeForge product passages. No retriever tuning, application changes or generation calls were performed.

## Freeze and provenance

The worker authored 20 questions from the published catalog and documented public behavior before inspecting retrieval implementation, the test loader, evaluation scripts or fixture contents. The question set and its scoring rules were saved and hashed before any retrieval execution. Filename discovery and documentation searches occurred before the freeze; those documentation excerpts included the public passage-ID convention and slicing description. This is independence from implementation and fixture inspection during question authoring, not a claim of complete methodological blindness.

| Item | Recorded value |
| --- | --- |
| Catalog version | `2026-11-15.2` |
| Frozen at UTC | `2026-11-15T16:14:52.4859000Z` |
| Retrieval started UTC | `2026-11-15T16:16:18.340Z` |
| Questions SHA-256 | `1fa0b7c7a7d65dc23456142bd393f1d52ea5de6191f95c458db0c6128f25454f` |
| Catalog SHA-256 | `145e04a8296e8815ff6c4f9da94f663df3c5a993223a5fb1b41c365a2b09d52b` |
| Retriever SHA-256 | `a412f1c32a67e33a69940c6137bbd6a38b61a8089a2cae8e0846e9eee7ee644d` |
| Runtime | Windows, Node `v24.21.0`, TypeScript `5.9.2` |
| Existing fixtures checked after freeze | Version `2026-11-15.3`, 17 questions, zero normalized exact question overlaps |

The byte hashes establish artifact identity. The recorded freeze/run sequence and tool history establish ordering; this is not an external preregistration or a signed timestamp. The exact-match audit does not establish semantic independence: this challenge and the fixtures necessarily share catalog topics.

## Declared scoring and execution

Each question has an answerability explanation, expected source IDs and zero or more required passage groups in [the frozen set](../design/assistant/challenge/frozen-questions.json). A group is covered when any listed passage ID appears in the selected results. A question passes only if all its groups are covered. There is no ranking, precision, numeric-score, latency or answer-quality target. Source IDs provide context; the scored target is passage coverage.

The unsupported and misleading-premise cases target published caveats or corrections where available. Finding those passages does **not** support the requested missing fact or misleading premise. No case demands an empty result. C16 has no published availability/pricing evidence or specific caveat and is excluded from pass-rate denominators. C20 scores only its answerable citation-observation clause; Owen's personal hiring-policy view remains unsupported.

The [runner](../design/assistant/challenge/run-challenge.cjs) calls the existing `createLoader()` and `retrieve(question, publishedKnowledge, knowledgeHref)` without overrides. It records complete selected excerpts, source/passage IDs, links and lexical scores in [results.json](../design/assistant/challenge/results.json). Catalog and dependency hashes were unchanged during execution. The current retriever selects at most four passages; none of its options or constants were modified.

| Frozen answerability label | Questions | Full target coverage | Evidence groups covered |
| --- | ---: | ---: | ---: |
| Supported | 8 | 4/8 | 4/8 |
| Qualified | 5 | 2/5 | 5/8 |
| Unsupported | 4 | 2/3 scored; 1 observation-only | 2/3 |
| Misleading premise | 2 | 2/2 | 2/2 |
| Mixed supported fact and missing view | 1 | 1/1 | 1/1 |
| **Total** | **20** | **11/19** | **14/22** |

The 13 supported/qualified questions achieved full target coverage in 6 cases. Six of all 20 questions returned no passages: C04, C08, C11, C12, C15 and C16. Four of those six asked about facts that do have published evidence. These empty-selection counts are descriptive observations, not additional pass/fail criteria.

## Case results

Question text, rationale, exact target IDs and selected text remain in the JSON artifacts. The following labels are compact descriptions, not rewritten test inputs.

| ID | Visitor question topic | Target groups found | Frozen result |
| --- | --- | ---: | --- |
| C01 | Software/applied-AI background and customer experience | 1/2 | Miss: employment passage absent |
| C02 | Continuing with employer after placement | 1/1 | Pass |
| C03 | Financial-analysis languages and data platform | 1/1 | Pass |
| C04 | Helping colleagues extract rules from boosted trees | 0/1 | Miss: no passages |
| C05 | Funded employer pilot versus organisation-wide rollout | 1/1 | Pass |
| C06 | Inspectable repeated/interrupted application-drafting steps | 1/2 | Miss: recovery caveat absent |
| C07 | Matching questions/settings in language-model comparison | 1/1 | Pass |
| C08 | Initial invalid numeric model output | 0/1 | Miss: no passages |
| C09 | Typing-model prediction versus faster learning | 0/1 | Miss: benefit caveat absent |
| C10 | On-device typing data and development status | 2/2 | Pass |
| C11 | Source extracts instead of a bot-written reply | 0/1 | Miss: no passages |
| C12 | Expected graduation and degree subject | 0/1 | Miss: no passages |
| C13 | Interests away from programming | 1/1 | Pass |
| C14 | Paper that changed Owen's approach and his personal view | 1/1 | Pass: publication gap located, requested view absent |
| C15 | Espresso-machine recommendation | 0/1 | Miss: preference caveat absent; no passages |
| C16 | Freelance availability and day rate | — | Observation-only: no passages |
| C17 | Employer customer names and fraud-detection results | 1/1 | Pass: disclosure limit located, details absent |
| C18 | Assumed RL training and achieved score | 1/1 | Pass: no-training/score-claim correction located |
| C19 | Assumed assistant training and measured gain | 1/1 | Pass: no-training/improvement-claim correction located |
| C20 | Qwen citation observations plus personal hiring-policy view | 1/1 | Pass for citation clause only; personal view absent |

## Consequential misses

- **C12 — “When is Owen due to finish university, and what is he studying?”** returned nothing. `about-owen:about-owen-background:0` supplies the degree, university and expected 2027 graduation. A basic career question loses accessible evidence.
- **C01 — broad background and customer experience** returned only `about-owen:about-owen-background:0` (score `2.714`). It missed `lexisnexis:lexisnexis-role:0`, which explicitly describes customer-facing work. A related profile hit does not cover the whole question.
- **C04 — “How has he helped colleagues get usable rules out of boosted-tree models?”** returned nothing, missing `lexisnexis:lexisnexis-tooling:0`. The catalog calls this LightGBM rule mining; a visitor need not know that exact name.
- **C06 — repeated/interrupted application drafting** selected `copilot:copilot-problem:0` (`3.015`), `copilot:copilot-engineering:0` (`2.412`) and `about-owen:about-owen-reading:0` (`1.508`). It missed `copilot:copilot-limits:0`, which says full end-to-end recovery remains to be qualified. Finding idempotency and durable jobs does not establish tested recovery.
- **C09 — prediction versus learning benefit** selected only `typeforge:typeforge-product:0` (`1.897`), missing `typeforge:typeforge-limits:0`. The returned product passage does contain a narrower warning about a timing model and practice-selection policy, so this is not a total absence of caution; it still misses the frozen target that names transition-timing prediction and explicitly limits claims about typing speed, learning and user benefit.
- **C11 — extracts instead of a bot-written reply** returned nothing, missing `portfolio-assistant:portfolio-assistant-design:0`. The source explaining disabled generation and citations exists, but the question's everyday vocabulary did not reach it.

C08 also missed the published numeric-output failure account. C15 missed the published no-equipment-preference caveat, but its empty result is not evidence of a fabricated recommendation or a safety failure. The declared metric measures whether the caveat can be found, not whether an unsupported question is appropriately refused.

## Interpretation and recommendation

Post-freeze implementation inspection shows exact lexical tokens, a minimum score, and expansions for a few complete profile/education phrasings. These mechanisms are consistent with paraphrase and longer-question misses, but this run does not isolate their causal contributions or compare alternative retrievers. It also does not measure the quality of a generated response because none was generated.

Prioritize broader visitor vocabulary and complete evidence coverage: evaluate general normalization/query expansion for career and tooling paraphrases, and evaluate whether directly relevant limitation passages should accompany project-mechanism passages. Check the resulting precision and context-budget tradeoffs on a newly authored set before adopting changes. Avoid solving only these 20 wordings; if they guide development, label them regression evidence thereafter. No implementation change is proposed as proven by this study.

The set was authored and labeled by one model worker after reading the catalog, with no visitor sampling or independent label adjudication. It has only 20 questions, uneven category sizes, deliberately chosen caveats and one observation-only case. Passage choices are author judgments fixed before execution, not exhaustive alternative evidence sets. Accordingly, the percentages describe this set only. They do not estimate general visitor success, factual entailment, semantic answer quality, UI contact behavior, injection resistance, accessibility or production readiness. Related excerpts on unsupported topics remain related excerpts, not missing personal views or facts.

## Evidence and verification

All new evidence is confined to `design/assistant/challenge/` and this report. The published catalog, application, fixtures and packages were not edited. No Git mutation, server action, browser automation, `.next` command, deployment, live inference, training, payment or private-source ingestion was performed.

- [frozen-questions.json](../design/assistant/challenge/frozen-questions.json): immutable questions, answerability explanations and scoring contract.
- [freeze-manifest.json](../design/assistant/challenge/freeze-manifest.json): pre-run hashes, catalog version, counts, timestamp and input boundary.
- [catalog.snapshot.ts](../design/assistant/challenge/catalog.snapshot.ts): exact catalog bytes used to author and run the set.
- [retrieval.snapshot.ts](../design/assistant/challenge/retrieval.snapshot.ts) and [assistant-loader.snapshot.cjs](../design/assistant/challenge/assistant-loader.snapshot.cjs): byte-identical execution-source copies for provenance.
- [run-challenge.cjs](../design/assistant/challenge/run-challenge.cjs): offline scorer using the existing loader and current retriever.
- [results.json](../design/assistant/challenge/results.json): every selected passage and score, case decisions, counts, fixture overlap audit and dependency hashes.
- [verify-evidence.cjs](../design/assistant/challenge/verify-evidence.cjs) and [verification.json](../design/assistant/challenge/verification.json): separate saved-result validation of hashes, target decisions and all 27 selected excerpts and links.

`node --check design/assistant/challenge/run-challenge.cjs` passed. The challenge process exited **1 because eight frozen expectations were missed**, while successfully writing a valid report; the runner uses exit 2 for execution/integrity failures. No expectation was relaxed after the run. Saved-result validation passed without rerunning retrieval or invoking generation. Application build/typecheck and browser checks were outside this worker's scope.

To reproduce against the same current source/catalog, use a new output filename so the original evidence cannot be overwritten:

```powershell
node design/assistant/challenge/run-challenge.cjs results-repeat.json
```

The runner verifies the frozen question/catalog hashes and records execution dependency hashes. Compare the retriever hash with the original before treating a later run as a reproduction; a later implementation is a new evaluation run. A changed catalog requires a separately documented study rather than editing this frozen set.
