import type { Metadata } from 'next'
import Link from 'next/link'
import { publicPortfolio } from '@/lib/publicPortfolio'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Owen Cheung about applied AI work.',
  alternates: { canonical: '/contact' },
}

export default function Contact() {
  const p = publicPortfolio.profile
  return (
    <article className="page-shell contact-page">
      <header className="page-heading">
        <p className="eyebrow">Contact</p>
        <h1>
          Have a problem
          <br />
          worth investigating?
        </h1>
        <p className="lede">
          The best way to reach me is email. I’m based in Bath, UK, and open to
          a conversation about applied AI work.
        </p>
      </header>
      <section className="contact-details" aria-label="Contact details">
        <p className="about-role">
          {p.name}
          <br />
          <span>
            {p.role} · {p.location}
          </span>
        </p>
        <div>
          <div className="experience-line">
            <p className="eyebrow">Email</p>
            <h3>
              <a href={`mailto:${p.email}`}>{p.email}</a>
            </h3>
          </div>
          <div className="experience-line">
            <p className="eyebrow">GitHub</p>
            <h3>
              <a href={p.github}>
                github.com/OwenC05 <span aria-hidden="true">↗</span>
              </a>
            </h3>
          </div>
          <div className="experience-line">
            <p className="eyebrow">LinkedIn</p>
            <h3>
              <a href={p.linkedin}>
                Owen Cheung <span aria-hidden="true">↗</span>
              </a>
            </h3>
          </div>
          <div className="experience-line">
            <p className="eyebrow">Location</p>
            <h3>Bath, United Kingdom</h3>
          </div>
          <Link className="text-link" href="/projects">
            Browse selected work <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </article>
  )
}
