# Portfolio assistant architecture

Implementation snapshot: 15 November 2026. The available baseline is published-source search. Owen chose to keep generation off after account onboarding required card verification. No inference calls, card entry or credit purchase formed part of this delivery. Live answer quality remains unverified.

## Sources and retrieval

`lib/knowledge/catalog.ts` is the explicit, versioned publication allowlist. Pages and the assistant share its records. Retrieval checks `publication === 'published'` again at its own boundary. It does not scan the filesystem, ingest a CV, or index editorial drafts, employer files or learner notes. See [content authoring](content-authoring.md).

`lib/assistant/retrieval.ts` implements lexical matching, not embeddings or a vector database. Queries and sources share conservative plural/apostrophe normalization, a fixed stop-word list and eleven explicit term families for common visitor vocabulary. A bounded phrase rule recognizes boosted trees and gradient boosting. Each distinct normalized query term contributes 2 points for passage presence, 3 for heading presence and 2 for title/tag presence. The sum is divided by the square root of the query term count. Scores measure this matching rule, not factual confidence. Unlisted synonyms, paraphrases and non-English text can still be missed; broader matching can also return incidental context.

Standalone hits require a score of at least 1.5. Selection may include at most one directly overlapping limitation passage from an already matched source, retaining its real lexical score even below that threshold. Its anchor must have two direct term matches; the companion needs one and a heading containing limit/limits/limitations, validation or disclosure. It fills a free slot or replaces a removable duplicate-source hit, preserving the anchor and other sources' sole hits. This is a coverage heuristic, not proof of semantic relevance; it can displace useful context. Final passages sort by score, then chunk ID, with at most four hits. See the [retrieval repair evidence](assistant-retrieval-repair.md) for measured coverage and context costs.

Sections are sliced at fixed 1200 JavaScript string units. IDs are `record-id:section-id:slice-index`; links point to the published section anchor. Stable IDs identify locations, not immutable content: record the catalogue version when evaluating. Slices can split a sentence; that is a baseline limitation. Selected passage text totals at most 4800 string units.

Complete profile and education questions receive bounded query expansion. An exact normalized record slug or title adds two points per passage after the normalized token score, so a named employer's sections need not repeat its name. These are transparent lexical heuristics, not semantic embeddings.

## Request and event path

`POST /api/assistant` accepts only `{"question":"..."}` as JSON. It validates the canonical Origin against the request scheme and Host authority, falling back to the URL host only when Host is absent. This handles Next.js reconstructing a local URL with `localhost` while the browser uses `127.0.0.1`. Forwarded host/protocol headers are ignored; opaque, malformed and cross-site browser origins are rejected. This is not authentication. Bodies are limited to 4096 bytes, with a nonempty question of at most 600 JavaScript string units after trimming. Errors use a JSON `{error}` response with 400, 403, 413, 415 or 429 status.

Successful responses use newline-delimited JSON, with these actual events:

1. `retrieval-start` carries the question.
2. `retrieval` carries selected hits and measured retrieval duration.
3. `generation` appears only when a configured provider call is started.
4. `answer` carries `sources`, `generated` or `abstained` mode, text and citations.
5. `done` carries elapsed request-processing duration.

The contract is exported from `lib/assistant/types.ts`. No artificial delays or reasoning trace are produced. Request or response cancellation aborts an active provider request. Responses are marked `no-store`; application code does not log credentials or conversations. This does not describe the hosting provider's separate logging or retention configuration.

The client validates complete event payloads before updating render state: required fields, nested hits/citations, answer modes and finite nonnegative measurements. Malformed JSON and malformed shapes use the existing recoverable error. This does not validate event ordering, cross-event citation membership or semantic support.

## Optional generation

`lib/assistant/generation.ts` sends native fetch requests only to `https://ai-gateway.vercel.sh/v1/chat/completions`. Request data cannot choose the endpoint or model. All of these are required:

- `ASSISTANT_GENERATION_ENABLED=true`.
- `ASSISTANT_MODEL` matches the code allowlist: `openai/gpt-4o-mini` or `google/gemini-2.5-flash-lite`.
- A credential exists: when `VERCEL=1`, the current request's `x-vercel-oidc-token`; otherwise local `VERCEL_OIDC_TOKEN` or `AI_GATEWAY_API_KEY`.

These are implementation choices, not proof that either model is available or free for the account. Do not enable inference until permitted free-only access is established. Tokens stay server-side. The implementation uses no retry or automatic alternative model. A call has a 12-second timeout, 700 output-token limit and 32000-byte response limit. The route declares a 20-second maximum duration.

The system instruction treats questions and passages as untrusted data, prohibits unsupported personal facts or hypothetical views, and asks for abstention when evidence is missing. The requested model schema is `{answer, abstain, citations:[{chunkId, quote}]}`. Validation checks exact keys and types, answer and citation bounds, selected chunk IDs, duplicate IDs and verbatim quote membership. Non-abstaining answers require citations. These checks cannot establish that a quote entails the answer or that a model resisted prompt injection.

Missing configuration, provider errors/timeouts and invalid replies return actual source excerpts with an explicit generated-answer-unavailable message. The optional `fallbackReason` enum distinguishes disabled/configuration/credential problems, authentication, rate limits, provider failure, timeout, cancellation, invalid/oversized output and missing sources. It contains no raw provider messages, prompts or tokens. No hits produce an abstention and contact suggestion. A provider abstention uses fixed application text. Related excerpts never establish a misleading question's premise.

## Operational limits and runbook

Throttling allows 12 requests per minute per key in one process and stores at most 512 active keys. Vercel mode uses `x-vercel-forwarded-for`; other environments share a local key. It depends on the platform supplying a trustworthy proxy header. Process restarts, parallel instances and different client keys bypass any global limit. This is neither a distributed quota nor a spend cap; shared abuse controls and deployment account settings need separate verification before enabling public inference.

1. Keep generation disabled while installing dependencies and running the [evaluation checks](assistant-evaluation.md).
2. Start the application with `npm run dev`. Use its `/ask` page for same-origin requests. A direct HTTP test must set Origin to the exact scheme, host and port it requests.
3. Check the browser network stream: source mode should have no `generation` event and should link to published section anchors.
4. For 403, check Origin/proxy URL handling; for 400/413/415, check request shape and bounds; for 429, wait for the process window to expire. An unavailable generated answer is an expected fallback, not proof of a provider outage.
5. Only after account eligibility is established, configure an allowlisted model and perform a separately recorded live evaluation. Never put credential variables in browser code or use a paid fallback to make the check pass.
6. Disable generation again if live validation fails; source search remains available. Record catalogue version, model/configuration and validation evidence without secrets.
