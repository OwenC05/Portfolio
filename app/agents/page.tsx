import type { Metadata } from 'next'
import Link from 'next/link'
import { siteUrl } from '@/lib/siteUrl'
export const metadata: Metadata = {
  title: 'For agents',
  alternates: { canonical: '/agents' },
  description: 'Read-only, sourced access to Owen Cheung’s public portfolio.',
}
export default function AgentsPage() {
  return (
    <article className="page-shell reading-page">
      <header className="page-heading">
        <p className="eyebrow">Public information · open access</p>
        <h1>
          For people.
          <br />
          And their agents.
        </h1>
        <p className="lede">
          The same curated facts, without the interface. No account, credentials
          or private data.
        </p>
      </header>
      <section className="prose-section">
        <h2>Start with a document</h2>
        <p>
          <Link href="/portfolio.md">Portfolio Markdown</Link> and{' '}
          <Link href="/portfolio.json">versioned JSON</Link> are the simplest
          ways to read everything. Each project also has a Markdown URL.{' '}
          <Link href="/llms.txt">llms.txt</Link> is a proposed discovery
          convention, not a promise that agents find this site automatically.
        </p>
      </section>
      <section className="prose-section">
        <h2>Connect over MCP</h2>
        <p>Use a Streamable HTTP client with this endpoint:</p>
        <pre>
          <code>{`${siteUrl}/mcp`}</code>
        </pre>
        <p>
          The official TypeScript SDK server 2.2.0 provides stateless legacy
          initialization and modern per-request metadata. POST is supported; GET
          and DELETE return 405. JSON or server-sent event responses are
          negotiated by the SDK. This endpoint is not a browser chat interface.
        </p>
        <p>
          For a client with MCP settings, add a remote Streamable HTTP server
          using the URL above. Client-specific configuration varies; the
          repository’s{' '}
          <code>npm run test:mcp -- http://localhost:3000/mcp</code> command
          uses the official SDK client as a reproducible local check.
        </p>
      </section>
      <section className="prose-section">
        <h2>What can be read</h2>
        <ul>
          <li>
            <code>search_projects(query, limit?)</code>: deterministic project
            search; up to 200 characters and 1–5 results.
          </li>
          <li>
            <code>get_project(slug)</code>: one of the three published case
            studies, including status, limitations and source URL.
          </li>
          <li>
            Resources: <code>portfolio://profile</code>,{' '}
            <code>portfolio://experience</code>,{' '}
            <code>portfolio://projects</code> and{' '}
            <code>portfolio://projects/&#123;slug&#125;</code>.
          </li>
        </ul>
      </section>
      <section className="prose-section">
        <h2>Public, not unrestricted</h2>
        <p>
          Only manually curated portfolio content is available. There are no
          write tools, arbitrary URL fetches, filesystem access, credentials or
          employer-private materials. Descriptions are owner-supplied, not
          independent verification. Confidential work and projects in
          development are labelled as such.
        </p>
        <p>
          Requests are limited to 16 KiB. Send one MCP message per HTTP request;
          JSON arrays and batches receive HTTP 400 before execution. Current
          single-message responses are tested below 64 KiB. A single
          process-wide bucket allows 120 requests per minute, returning 429 with
          Retry-After when exhausted. It is neither per-client nor distributed
          protection; a production deployment needs platform-level rate-limit
          review.
        </p>
        <p>
          Host and Origin hostnames must match the configured site or localhost,
          127.0.0.1 or [::1]. Ports are ignored by the SDK guards. Non-browser
          clients may omit Origin but must supply a valid Host. No wildcard CORS
          is used. MCP responses are not cached; request content, IPs and
          headers are not logged by this application.
        </p>
      </section>
    </article>
  )
}
