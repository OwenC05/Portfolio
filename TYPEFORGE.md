# TypeForge — Design Doc

> An adaptive typing trainer that adapts **where speed is actually won** (transitions), on **real transferable text**, with a model that has to **earn its slot against a strong heuristic** — and the honesty to say when it doesn't.

This is the build spec produced from a deep multi-angle research pass (science of typing → which ML genuinely helps → competitive landscape → end-to-end product + portfolio framing, then adversarial gimmick/feasibility/pedagogy stress-testing). It is deliberately ruthless about what *not* to build.

---

## 1. The wedge

TypeForge owns the white space between the two incumbents:

- **Keybr** — adapts to weak **keys** via Markov **pseudo-words** that *don't transfer* to real typing, and drills letters you rarely use.
- **Monkeytype** — **real words** and great analytics, but **never coaches or adapts**.

**TypeForge = a closed diagnosis→content loop that adapts at the _transition_ level (bigram, trigram-context where data allows), on _real, transferable_ text deliberately over-loaded with each user's costliest transitions, and that explains _why_ you're slow.**

The four product pillars are **not** a model zoo:
1. A validated **sub-millisecond keystroke instrument** (the rarest, hardest, most reusable artifact).
2. **Accuracy-first gating** as the core loop mechanic (errors, not finger speed, separate fast from slow — Aalto 136M keystrokes).
3. **Frequency-weighted bigram weakness ranking** — the one cheap multiply (`deficit × English-frequency`) that is the real edge over Keybr.
4. A **de-confounded transition-cost estimator** that separates motor flight time from look-away/reading pauses — without it the "costliest transition" ranking is invalid.

---

## 2. Design principles

- **Instrument before model.** Every downstream claim is worthless if timing is jittered by handler latency or React renders. Validate timing first.
- **Accuracy is the spine, not a feature.** The loop literally cannot advance the WPM target until accuracy ≥ ~97%.
- **Target transitions _inside real text_, never as isolated drills.** A 1,301-student study found isolated drills did **not** predict speed (p=0.70); volume on real text did. This transfer claim must be A/B-validated, not asserted.
- **Be honest about gimmicks.** Only use ML where it measurably beats the cheap baseline. Naming what you deliberately *didn't* build (and why) is the credibility move.

---

## 3. How typing actually improves (evidence-graded levers)

| Lever | Evidence | How a trainer targets it |
|---|---|---|
| **Accuracy-first gating** (block WPM increases until acc ≥ ~97%) | **strong** | Aalto 136M: error behavior is the #1 fast/slow differentiator; an error costs 3–5 keystrokes. Pure heuristic. Needs corrected-vs-uncorrected error capture from day one. |
| **Train the transition, not the single key** (chunking) | **strong** | Letter-pairs (same-finger, cross-hand) predict speed better than single-key stats — Keybr's blind spot. Model bigram-in-trigram-context where data allows. Target transitions *inside real text*. |
| **De-confounded transition cost** (separate motor time from reading pauses) | **strong** | Winsorize/cap IKIs, model a pause mixture, exclude word-boundary & post-pause intervals. Precondition for the headline feature. Pure statistics. |
| **Volume on real, varied text** | **strong** | The dominant real-world driver (72.7 WPM at 1000+ pages vs 44.7 at 1–5). Serve real text by default; add novelty/diversity constraints so over-loaded passages aren't memorized. |
| **Error-correction behavior / anti-perfectionist backspacing** | **strong** | Crump & Logan 2010: excessive backspacing wastes the correction loop and reinforces error+correction motor programs. For substitution-heavy users, force *slow-down-to-first-time-correct*. |
| **Spaced, short, distributed sessions** (~1×/day, 15–20 min) | **strong** | Baddeley & Longman 1978: 1hr/day beat 2×2hr/day at equal hours and retained better. Plus a within-session fatigue control chart. |
| **Cold-start population prior** (sessions 1–5) | **strong** | Bootstrap from an a-priori bigram-mechanics difficulty table (same-finger ratio, row jumps, hand alternation, frequency) before per-user weighting takes over. |
| **Deliberate practice / personalized staircase** (+5 WPM when stable at 0 errors) | **strong** | Staircase is a heuristic; the ML opening is personalizing the per-bigram "edge" (where accuracy crosses 97%) from the shrinkage model. |
| **Rhythm / IKI consistency** | moderate | Target high-variance un-chunked transitions. **Never optimize the consistency score directly** — it's partly a symptom of skill, not a cause. |
| **Plateau-aware intervention** (~120 WPM inner-loop floor) | moderate | Yamaguchi/Crump/Logan 2013: a real ~100ms/keystroke inner-loop floor. Above it, move work to the outer loop (read 2–3 words ahead). Transparent threshold rule, not a learned classifier. |
| **Don't sell a layout switch / hardware as a speed hack** | **strong** | No reliable Dvorak/Colemak advantage; top typists are mostly QWERTY on cheap boards. Stay layout-agnostic; record hardware/layout/IME as a **covariate** (different IKI/dwell distributions would pollute priors if mixed). |

---

## 4. ML/AI feature verdicts

### 🟢 Core — build first (mostly heuristics + one model)

- **Validated keystroke-timing instrument** *(heuristic, but the hard part)* — `event.timeStamp` sub-ms; separate keydown/keyup for dwell + flight; drop auto-repeat; record `code` (physical) **and** `key` (char); deltas from per-test `t0`; **no per-keystroke React render** (throttled rAF caret); server-side recompute + reject implausible sub-15ms timing; store hardware/layout/IME covariates; corrected-vs-uncorrected error flags. *Baseline (`Date.now()` + React state per keystroke) is demonstrably worse — ms jitter + dropped events.*
- **Frequency-weighted bigram weakness ranking** *(heuristic)* — `score ≈ de-confounded-deficit-vs-target × English-bigram-frequency × estimate-confidence × recency-decay`. The actual wedge over Keybr. Do **not** dress it up as ML.
- **Constrained real-text generation — LEXICON tier** *(heuristic)* — weighted sampling of real words filtered for target-bigram density (<1ms, free), with novelty/diversity + passage-reuse limits. Solves Keybr's transfer problem + Monkeytype's no-adaptivity at once.
- **De-confounded transition-cost estimator** *(statistics)* — strip reading/look-away/word-boundary pauses before trusting any ranking.
- **Accuracy-first gating** *(heuristic policy)* — the loop mechanic.

### 🔵 The one real model (v2)

- **Hierarchical / empirical-Bayes per-key + per-bigram shrinkage** *(simple-ML, closed-form, no GPU)* — `est = w·observed + (1−w)·prior`, shrinking 676+ sparse bigrams toward parent keys then the global rate (Beta-Binomial for errors, log-Normal for de-confounded flight time). Explicit `key → finger → hand → bigram` hierarchy in the prior.
  **The single place ML demonstrably beats the baseline:** raw per-bigram means on sparse per-session data rank the *wrong* drills early; shrinkage gives stable rankings. Zero cold-start, works on **N=1**. This is the one falsifiable ML claim (tested via AUC/Spearman + ECE).

### 🟡 Genuinely useful (mostly not ML)

- **Error-type attribution + confusable-pair table** — deterministic edit-distance/alignment labeling each error (substitution/transposition/insertion/omission); ~40 lines, no learning problem. Drives the *slow-down-to-first-time-correct* intervention. Nobody else does this.
- **Recency-weighted review scheduler (Leitner/SM-2)** — interleave review of weak transitions; fixes Keybr's "stuck grinding a failing pattern." Ship Leitner/recency first; **FSRS is a gated research upgrade**, not essential (a motor transition isn't recalled/forgotten binarily like a flashcard — validate the recall mapping first).
- **Within-session fatigue detection (statistical control chart)** — rolling z-score on IKI variance + error rate → suggest a break. The control chart *is* the baseline and it wins; full anomaly-detection ML adds nothing. Frame honestly as a control chart, not "AI fatigue detection."

### 🔴 Skip for the product loop — research vignettes only, each behind a hard data gate

| Feature | Why it's a gimmick at your scale | The baseline that ties/beats it |
|---|---|---|
| **Constrained-LLM premium text** | Lexicon sampling delivers ~95% of value at <1ms / $0; the "hit targets AND stay natural" eval harness is itself unsolved | Lexicon weighted sampler |
| **Power-law forecast + CUSUM** | Needs a returning longitudinal series | Polynomial regression over last ~30 sessions |
| **Thompson-sampling drill-TYPE bandit** | Reward horizon is *days*; 5 arms × (you+friends) never escapes priors before the user quits | A fixed weekly rotation |
| **Pre-error GRU over IKIs** | Shrinkage already ranks which bigrams you'll fumble — no need to predict an error 200ms early | The shrinkage ranking |
| **Hyperbolic / contrastive embedding of keys/bigrams/errors** | With ~30–40 keys you already *have* the confusion matrix; the hierarchy is depth-3 and known a priori → an embedding is lossy re-encoding | The confusion table + explicit-hierarchy shrinkage prior |
| **IRT difficulty calibration (2PL/3PL)** | **Kill entirely** — typing difficulty is *mechanistic* (same-finger ratio, row jumps, rarity), computable from content; no latent difficulty plane | A feature-weighted mechanistic difficulty score |
| **Typing-fingerprint re-identification** | Trivially high & meaningless below dozens of users | Any feature ID's 5 people |

> **The hyperbolic angle is still valuable — as an _honest negative result_.** A "Euclidean vs hyperbolic distortion on my own keystroke data" ablation, where the explicit known-hierarchy shrinkage prior ties/beats the curved-space embedding, is *stronger* research-eng signal than a flashy embedding that never beat the baseline.

---

## 5. Roadmap

### v1 — the instrument + a real heuristic product (zero ML)
Ship a correct, open-source keystroke-timing instrument feeding a real-text trainer with the accuracy gate as the core loop. No ML, no cold-start dependency, no user base required. Its real job: be a strong portfolio piece on day one **and** generate the labeled corpus.
- Open-source capture lib (see §4 core).
- Corrected-vs-uncorrected error flags + hardware/layout/IME covariates **in the schema from line one**.
- Server-side metric recompute + reject sub-15ms timing (anti-cheat / integrity).
- **Accuracy-first gating** as the core mechanic.
- De-confounded transition-cost estimator **before** any ranking is trusted.
- Frequency-weighted weak-bigram sampling + cold-start a-priori difficulty table.
- Lexicon-tier real-text generation with novelty/reuse limits; test modes (timed 15/30/60s, fixed-text, quote); real-time caret + error highlighting; end-of-test stats (net/raw WPM, accuracy, consistency, per-key heatmap).
- Leitner/recency review over weak transitions (not FSRS).
- **Anonymous instant-play** (no signup wall), local-first capture that syncs on optional signup — the one concession that can generate a corpus.
- Postgres raw-event store + per-user rolling aggregates; `drill_policy` + `policy_meta` provenance stamped on **every** session; `retention-by-arm` field from day one.
- Dashboard: WPM-over-time, weak-bigram heatmap that *cools*, streaks.

### v2 — one ML claim, evaluated OFFLINE, + the Threats-to-Validity doc
Add exactly one model on top of the working heuristic and evaluate it ruthlessly **offline on Owen's own longitudinal data** (survives cold-start entirely: N=1 + weeks).
- Hierarchical/empirical-Bayes per-bigram **shrinkage** — the single ML claim.
- Evaluate it as a **ranking/calibration** model: does it predict which bigrams Owen fumbles *next session* (AUC/Spearman) with a reliability diagram (ECE), vs the raw-mean baseline? Report beat/tie/lose honestly.
- Optional: pre-validate the difficulty prior on the public **Aalto 136M** dataset.
- Error-type attribution + confusable-pair table + the substitution-heavy intervention.
- Difficulty-band sampler (zone of proximal development = weighted sampling with a band clamp — a heuristic, not a new model).
- Diagnostic feedback that explains **why** ("your same-finger bigrams cost ~8 WPM; review queued"); CSV/JSON export; shareable result cards.
- **The "Eval & Threats to Validity" doc as a primary deliverable** (see §6) — worth more than the model.

### v3 — research vignettes (portfolio centerpiece), each behind an explicit corpus gate
None enters the product loop unless it beats shrinkage in the A/B (at placement-scale N it won't — so they ship as honest, often negative, vignettes).
- **Hyperbolic-vs-Euclidean distortion ablation** on Owen's keystroke data — a clean negative result is the win (gate: weeks of self-data; offline).
- CUSUM/BOCPD plateau & regression detector + power-law forecast (gate: returning longitudinal series).
- Constrained-LLM premium text tier with logit-biasing + eval harness, cached (gate: lexicon tier proven insufficient).
- Thompson-sampling drill-type bandit (gate: dozens of users).
- Pre-error GRU over IKIs (gate: large multi-session corpus; must beat shrinkage AUC).
- Typing-fingerprint re-ID benchmark + biometric/privacy discussion (gate: dozens of users).
- FSRS upgrade fit to motor-skill lapse data (gate: SM-2/Leitner shown to win + recall mapping validated).
- **Open-source posture:** release the capture lib + eval/threats-to-validity methodology + embedding-ablation code on an anonymized timing-only sample (`make reproduce`); keep the live stack, full corpus, and per-user models proprietary.

---

## 6. Measurement & Threats to Validity (the senior signal)

Re-anchor the **entire** eval on **offline evaluation of Owen's own data + a within-subject design**, because every online-A/B, plateau, forecast, and bandit deliverable secretly needs a returning user base that doesn't exist at placement scale.

- **Primary offline test (N=1 + weeks):** does shrinkage predict which bigrams Owen fumbles *next session* better than raw means — ranking (AUC/Spearman), calibration (ECE/reliability) — beat/tie/lose, reported honestly. *"We A/B'd the model against the heuristic, here's the lift (or honest lack of it)"* **is** the senior signal.
- **Primary online design (when users exist):** within-subject **counterbalanced crossover on disjoint key-sets** (each user is their own control: adaptive arm on set A vs heuristic on set B) — not between-user randomization, which never reaches power at N<10.
- **Metric:** net-WPM growth (or target-skill error-rate decay) on a **common neutral held-out test** identical for all arms (only the practice differs), normalized by **both** practice-minute **and** per-keystroke, with **exposure (chars seen) held constant**.
- **Delayed retention** post-test (next-day/next-week) + a **transfer test on untrained text** — the "transfers unlike Keybr" claim must be *measured*.
- **The one A/B that makes or breaks the product:** over-loaded-real-text vs plain-real-text on a neutral bigram test (isolated drills don't transfer, p=0.70 — the whole wedge hinges on this).
- A **learning-curve simulator** is a biased unit-test filter (state the bias) to kill obviously-bad policies before they touch a human.

**Enumerate the self-deception traps (this list is the seniority signal):** (1) evaluate on the neutral test, never the practiced material; (2) normalize by time *and* keystrokes *and* hold exposure constant; (3) regression-to-the-mean / selection; (4) novelty/Hawthorne (effects must persist past novelty); (5) survivorship / intent-to-treat (retention-by-arm from day one); (6) cross-arm learning leakage (disjoint key-sets); (7) ceiling (Owen at 180 WPM is near his — recruit a skill spread, report per-band); (8) data integrity (server recompute, reject sub-15ms, dedup, drop auto-repeat); (9) the look-away-pause confound — de-confound *before* trusting any ranking; (10) multiple comparisons (pre-register one primary).

---

## 7. Portfolio framing (for AI research engineering)

A typing trainer is a deceptively strong ML portfolio piece: a tight, fast, **ground-truth** feedback loop — every keystroke is a labeled event (target char, typed char, sub-ms timing). The honest reframe for a solo dev with no users: **lead with the instrument and the eval rigor, not the model zoo.**

Three artifacts → capability + rigor + research edge:
1. **Capability** — a correct, open-source browser keystroke-timing **instrument**. Rarer and harder than any model here; shippable and verifiable *without users* on day one. Most "ML typing" projects are built on garbage timing they never validated.
2. **Rigor** — one ruthlessly-evaluated **offline model** (per-bigram shrinkage) + the **Threats-to-Validity doc** + a within-subject crossover design. Survives cold-start with N=1. *Decorative ML reads junior; ruthless ML eval reads senior.*
3. **Research edge** — the hyperbolic/geometric specialty as **one clearly-labeled honest vignette**: a Euclidean-vs-hyperbolic distortion ablation where a clean negative result is *stronger* signal than a flashy embedding that never beat shrinkage.

Open-source the method + instrument + eval harness + ablation code (on an anonymized timing-only sample, `make reproduce`); keep the product, live stack, and corpus proprietary — exactly how a credible research-eng portfolio is structured.

> *"I built a validated sub-millisecond keystroke instrument, ran a within-subject A/B testing whether adaptive ML beats a strong heuristic, and showed typing errors on a hyperbolic manifold — with the honesty that the ML had to earn its slot, and the clarity to report when it didn't."*

---

## Key sources referenced
- **Dhakal et al. 2018** — "Observations on Typing from 136M Keystrokes" (Aalto): errors, not finger speed, separate fast/slow.
- **Baddeley & Longman 1978** — distributed vs massed practice.
- **Crump & Logan 2010**; **Yamaguchi, Crump & Logan 2013** — hierarchical control of skilled typing (inner/outer loop, ~100ms floor).
- The 1,301-student study (isolated drills don't transfer, p=0.70) and TypeLit's 30k-user data (volume on real text drives speed).
- Keybr (letter-by-letter adaptive pseudo-word generation) and Monkeytype (real text + analytics, no adaptivity) as the landscape anchors.
