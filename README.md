# Owen Cheung — AI Engineer

A human-first editorial portfolio: cool Alpine terrain, clear typography and conceptual illustrations, with readable case studies and an optional read-only interface for agents. No game, custom cursor or chatbot is needed to browse the work. Award-calibre craft is an aspiration, not an award claim.

## Run locally

Use Node.js 22.12+ (22.x) or Node.js 24+ for the application and patched test toolchain. Verification used Node.js 24.21.0; the existing Vercel project uses Node.js 22.x.

```bash
npm ci
npm run dev
```

Open http://localhost:3000. For the production preview:

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

The production site uses the existing Vercel `portfolio` project at https://owencdev.info. Publishing is separate from these local commands and does not promise comprehensive production hardening. `.vercelignore` excludes private intake files, environment files and local agent/runtime artifacts from source uploads.

## Architecture and content

- Next.js 16.3.8 App Router, React 19, strict TypeScript, Tailwind 4 and Vitest.
- `DESIGN.md` describes the editorial design system. Reading surfaces are server-rendered; illustrations are conceptual, not measurements or employer architecture.
- `lib/content.ts` and `lib/projects.ts` contain curated facts. `lib/publicPortfolio.ts` explicitly projects approved fields for both the website and machine formats, without importing the MCP SDK into human pages.
- `/`, `/projects`, three `/projects/[slug]` pages, `/about`, `/contact` and `/agents` provide ordinary navigation. The prior game modules remain as unused legacy source, not the main experience; their pure-math regression tests are retained.
- Latest owner-supplied CV facts take precedence over older portfolio copy. Current AI engineering contract and previous data-science placement are separate roles. The funded employer pilot is **building toward production**, not production-launched. TypeForge is **in development**, with a [public demo](https://typeforge-alpha.vercel.app), implemented adaptive drills and no published performance evaluation or full-product-release claim.
- Source statements are owner-supplied, not independently verified. Do not invent measurements, demo/repository links, awards or deployment status.

### Publication boundary

Never put the raw intake CV Markdown/PDF in `public/`, add a download route for it, or import it into runtime code. Phone numbers and third-party referee identities/contact information are deliberately omitted. No employer-private code, data or results are published. Only manually curated, allowlisted facts belong in the public model. Root intake documents are private working inputs, not public assets; the exact root filenames are ignored by Git and Prettier to avoid accidental publication or formatting. Review other intake files before sharing this repository itself.

## Canonical URLs

`lib/siteUrl.ts` resolves build-time configuration in this order:

1. `NEXT_PUBLIC_SITE_URL`: an HTTP(S) origin, e.g. `https://owencdev.info`.
2. `VERCEL_PROJECT_PRODUCTION_URL`: a hostname, resolved using HTTPS.
3. `VERCEL_URL`: a deployment hostname, resolved using HTTPS.
4. `http://localhost:3000` for local development.

Explicit invalid configuration fails rather than falling through. Credentials, paths (apart from a single trailing slash), query strings and fragments are rejected. Local origins may include a port. Canonical citations never derive from request Host headers. Set the explicit origin before building if previewing on a different port. Metadata, robots and sitemap share this origin; the sitemap does not invent modification dates.

## Public machine access

- `/portfolio.json`: schema-versioned public profile, experience and projects.
- `/portfolio.md`: readable Markdown of the same approved content.
- `/projects/[slug]/markdown`: individual project Markdown.
- `/llms.txt`: optional discovery index; this convention does not guarantee agent discovery.
- `/agents`: human-readable access documentation.
- `/mcp`: Web-standard Streamable HTTP using official `@modelcontextprotocol/server@2.2.0`.

MCP resources cover the profile, experience, project index and each project, with `portfolio://` resource identifiers and separate canonical website citations. Tools are `search_projects(query, limit?)` and `get_project(slug)`. Search is deterministic, limited to the three approved projects, with queries up to 200 characters and result limits 1–5. No credentials are required for these intentionally public facts.

### MCP boundary and operational limits

The handler creates a fresh server per request, with modern per-request metadata and legacy stateless initialization support. POST is the protocol entry point; stateless GET/DELETE return 405. Responses/errors are `no-store`. OPTIONS is restricted by the same configured Host/Origin policy, not wildcard/reflected arbitrary CORS.

The SDK's explicit Host/Origin guards compare **hostnames, ignoring ports**; this is not exact scheme/host/port matching. Configured canonical and local hostnames are allowed. An absent Origin is allowed for native clients only when Host is valid. Do not interpret CORS as authentication.

The original request body is bounded to 16 KiB with the official SDK reader, including streamed or falsely sized bodies. One MCP message is allowed per HTTP request: all JSON arrays (including empty and single-element arrays) are rejected with HTTP 400 before SDK execution. Approved current single-message resource/tool wire outputs are regression-tested below 64 KiB. A constant-memory, shared **per-process** token bucket allows 120 requests with 120/minute refill. This is neither per-client nor distributed protection: arbitrary forwarding headers do not create new buckets. Deploying requires an independent review of platform limits, proxy trust and public endpoint exposure.

There are no write tools, arbitrary URL fetching, shell/filesystem access, sampling, elicitation or private-data lookup. Read-only annotations describe intent; the restricted implementation is the actual boundary. Logs must contain only method, status, duration and size buckets—not request bodies, search text, raw headers or IP addresses.

## Checks

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

With the local production server running, verify real HTTP interoperability using the official SDK client:

```bash
npm run test:mcp -- http://localhost:3000/mcp
```

The endpoint argument is optional and defaults to the URL above. This exercises legacy `2025-11-25` SSE and modern `2026-07-28` JSON protocol paths, tools/resources, privacy exclusions, errors and bounded outputs.

The test suite covers content/privacy contracts, canonical URLs, MCP bounds and retained legacy pure logic. Production browser and SDK-client checks must run against the locally served build; a unit-test pass alone is not proof of browser accessibility, performance or protocol interoperability. All `.omx/` artifacts, including source snapshots and local verification evidence, are excluded from Git and source deployments. Reproduce checks using the commands here; public clones do not include local planning/QA artifacts.

The legacy unused game files currently produce 17 non-blocking ESLint warnings; the changed editorial UI files pass without warnings. A successful lint exit does not mean the entire repository has zero warnings.

### Dependency audit boundary

The 8 October 2026 security update retains Next.js and eslint-config-next **16.3.8**, upgrades Vitest to **4.1.11**, and removes the vulnerable Tinypool and braces/micromatch/fast-glob chains. The full `npm audit` (including development dependencies) reports **zero known vulnerabilities** at verification time. This is a point-in-time dependency result, not a guarantee that the application is vulnerability-free.

Next's official lint plugin still depends on unpatched `braces`, so a transparent local override points `@next/eslint-plugin-next` to [`vendor/next-eslint-plugin`](vendor/next-eslint-plugin/README.md). It preserves all 22 upstream rules, four configurations, declarations and MIT licensing; only its directory-glob helper and dependency are patched to use existing `tinyglobby@0.2.17` with tested path and error-handling compatibility. Provenance and original file hashes are included. No audit findings or lint rules are suppressed to obtain the clean result. Vendored compiled code is excluded from formatting/self-linting, not from dependency auditing or regression tests.

`lib/eslintPlugin.test.ts` verifies rule retention, actual installed-plugin selection, directory-root behavior and filesystem-error propagation. A version guard forces deliberate review when Next/config is upgraded. Replace the fork with upstream once its dependency chain is fixed; follow the vendor README's removal procedure. Keep dev/test servers local and avoid executing untrusted tests or configuration with secrets.

An optional local publication/privacy crawl is available while the production server is running:

```bash
node scripts/verify-portfolio.mjs http://localhost:3000
```

This stronger check requires the original private intake Markdown to remain locally available at its ignored root filename. It derives excluded values locally, never publishes or prints them, and checks public pages, exports, raw-source 404s and internal links. It intentionally cannot perform those source-specific privacy checks from a public clone that omits the intake document; do not copy the private CV into a shared repository merely to run it.

### Optional browser verification

With the production site and an explicitly approved local Chromium debugging endpoint already running:

```bash
node scripts/verify-browser.mjs http://127.0.0.1:3000 http://127.0.0.1:9222
```

Use Node 22+ for this optional helper's native WebSocket support. It adds no application dependency and does not download or launch a browser. Keep the debugging endpoint bound to localhost and close it after verification. Results and screenshots are written to `.omx/reports/browser/`; the helper inspects supported CDP methods before using them.

The report covers responsive screenshots, keyboard/focus, reduced motion, script-disabled reading, runtime errors and cold-navigation transfers. Its timing measurements are **unthrottled local laboratory observations**, not Lighthouse scores, mobile-network performance or field INP. The 200% layout check uses CSS zoom rather than native browser UI zoom. Lighthouse was unavailable in this environment; no Lighthouse or complete WCAG certification claim is made.

### Alpine browser checks

`scripts/verify-alpine-browser.mjs` checks the production preview across five widths, native links without JavaScript, motion preferences, focus/pointer holds, touch/no-art and CSS 200% zoom. It uses an existing Playwright installation via `PLAYWRIGHT_MODULE` and optional `PLAYWRIGHT_EXECUTABLE`; it does not install a project dependency. Run against a local production server, for example `node scripts/verify-alpine-browser.mjs http://127.0.0.1:3006`. Artifacts go to `.omx/artifacts/alpine-production/browser/`.
