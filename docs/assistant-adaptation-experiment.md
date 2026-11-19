# Controlled adaptation experiment

**PROPOSED — NOT RUN.** No dataset, trained adapter, hardware reservation, model licence approval or benefit is claimed. The production baseline remains lexical retrieval with optional, disabled-by-default generation. This experiment is not required to release source search.

## Question and comparison

Does adapting a small instruction model improve evidence use and calibrated abstention beyond its prompted and few-shot baselines, under the same source context and decoding constraints?

Choose one trainable base checkpoint only after its licence, acceptable data use, local hardware and inference path are established. Compare that same checkpoint in three conditions: a fixed instruction prompt; the same prompt plus a fixed small set of training-split demonstrations; and supervised fine-tuning through a LoRA adapter with the same instruction prompt. LoRA is the parameter-efficient implementation of the SFT condition, not a fourth independent treatment. The existing gateway model may be an additional reference, but cross-model differences cannot be attributed to adaptation.

Keep the catalogue snapshot, retriever, chunking, question wording, context order, context/output limits and decoding settings fixed across conditions. Use the same planned seed set if stochastic decoding is necessary. Select prompts, demonstrations, training settings and checkpoints using development data only. Record hashes/versions and actual token budgets; few-shot demonstrations must not displace evidence passages. Apply the same mechanical response validator to every condition and retain raw outputs for diagnosis.

## Data and split policy

Training targets should teach selecting evidence, preserving uncertainty, quoting valid passages, rejecting unsupported premises and abstaining. Use permissible, human-reviewed source/question/response examples with complete provenance. Prefer synthetic fictional entities or licensed public material for behavioral examples; do not train mutable personal facts into weights. Do not include raw CVs, employer-confidential documents, private notes, assessed submissions or fabricated owner opinions.

Before model tuning, group examples by underlying source, claim and question family. Keep paraphrases, common-origin rewrites and near-duplicates in one group. Allocate groups to training/development/locked test splits (proposed 70/15/15); record assignment and duplicate checks. The existing ten retrieval fixtures are developer-visible and must not serve as the locked test set. Training demonstrations come only from the training split.

Propose at least 100 independently reviewed locked-test questions spanning supported facts, absent evidence, misleading premises, hypothetical views and prompt injection. This is a collection target, not an existing dataset or a power guarantee. Review achievable group counts and uncertainty before fixing the final sample size. Freeze required facts, acceptable supporting passages and abstention expectations before inspecting model outputs. Never turn an observed test failure into training data while retaining the same test-set claim; create a new version and fresh holdout if needed.

## Separate retrieval from generation

Run each condition on each held-out question in two context settings:

- **Retrieved:** use the unchanged lexical retriever's actual top-four passages. Record whether the required evidence was retrieved.
- **Oracle:** provide human-selected sufficient evidence within the same context budget. For deliberately unanswerable questions, provide no supporting evidence and label abstention as expected; do not manufacture an answer.

Questions whose evidence cannot fit the budget should be flagged before testing, not silently given longer oracle contexts. Keep evaluation-only hostile passages outside the production catalogue. A failure with sufficient oracle context implicates generation or validation; missing retrieved evidence identifies a retrieval limitation. These are diagnostic classifications, not automatic proofs of causation.

## Measures and proposed release gate

Use the [human review rubric](assistant-evaluation.md), with paired outputs reviewed blind. For every condition and context setting, report:

- Fraction of held-out questions with all required facts supported and no unsupported additions.
- Unsupported factual claims / all factual claims, plus the count of answers containing any unsupported claim.
- Entailing citations / reviewed citations, separate from mechanical valid-ID/exact-quote rate.
- Correct abstentions on unanswerable questions and unnecessary abstentions on answerable questions.
- Injection-following count, misleading-premise acceptance count, provider failures and validator fallbacks.
- End-to-end latency, token use, training time, peak memory and actual monetary cost where measured.

Use paired question-level confidence intervals for differences, with resampling grouped by source/question family. Show category counts so an overall improvement cannot hide a safety regression. Small or inconclusive samples should remain inconclusive.

Before collecting locked-test outputs, confirm this proposed gate: promote an adapter only if the paired interval for fully supported, complete answers is above zero versus the stronger development-selected baseline on retrieved contexts; unsupported-claim and erroneous-abstention rates do not worsen; no new severe injection-following or invented personal claims occur; and deployment latency/resource limits are met. Examine oracle results to explain the mechanism. If evidence is inconclusive, retain the baseline. Do not select the comparator after inspecting test results or call a mechanical validation pass a semantic improvement.

## Execution prerequisites

The exact checkpoint and licence, permissible example sources, reviewer availability, hardware/VRAM, training configuration, adapter hosting compatibility and free-only inference eligibility remain unknown. Resolve and record them before training or live calls. There is no authorised GPU rental, payment method, paid fallback or automatic spend. If a controlled comparison cannot be run within established access, preserve this plan and the source-search baseline; do not fabricate results to complete the case study.
