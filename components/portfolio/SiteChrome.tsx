import Link from 'next/link'
import { NavLinks } from './NavLinks'
import { publicPortfolio } from '@/lib/publicPortfolio'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-shell header-inner">
        <Link className="wordmark" href="/" aria-label="Owen Cheung — home">
          {publicPortfolio.profile.name} <span>— AI Engineer</span>
        </Link>
        <NavLinks />
      </div>
    </header>
  )
}

export function SiteFooter() {
  const p = publicPortfolio.profile
  return (
    <footer className="site-footer">
      <div className="page-shell">
        <div className="footer-top">
          <p className="eyebrow">A conversation is a good place to start.</p>
          <p className="footer-title">
            Have a problem
            <br />
            worth investigating?
          </p>
          <a className="contact-link" href={`mailto:${p.email}`}>
            {p.email} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="footer-bottom">
          <span>
            {p.name} · {p.role}
          </span>
          <nav aria-label="Footer navigation">
            <a href={p.github}>GitHub ↗</a>
            <a href={p.linkedin}>LinkedIn ↗</a>
            <Link href="/agents">Agent access ↗</Link>
          </nav>
          <span>Bath, UK</span>
        </div>
      </div>
    </footer>
  )
}
