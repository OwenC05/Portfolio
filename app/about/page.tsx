import type { Metadata } from 'next'
import { publicPortfolio } from '@/lib/publicPortfolio'
export const metadata: Metadata = {
  title: 'About',
  description:
    'The experience, interests and approach behind Owen Cheung’s work in AI engineering.',
  alternates: { canonical: '/about' },
}
export default function About() {
  const p = publicPortfolio
  return (
    <article className="page-shell about-page">
      <header className="page-heading">
        <p className="eyebrow">Behind the work</p>
        <h1>A little context.</h1>
        <div className="about-intro">
          <p className="about-role">
            {p.profile.name}
            <br />
            <span>
              {p.profile.role} · {p.profile.location}
            </span>
          </p>
          <div>
            {p.profile.bio.map((line) => (
              <p className="lede" key={line}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </header>
      <section className="about-section">
        <div>
          <p className="eyebrow">01 / Experience</p>
          <h2>Learning by doing.</h2>
        </div>
        <div>
          {p.experience.map((e) => (
            <div className="experience-line" key={`${e.org}-${e.role}`}>
              <p className="eyebrow">
                {e.period}
                {e.location && ` / ${e.location}`}
              </p>
              <h3>{e.role}</h3>
              <p className="org-name">{e.org}</p>
              {e.note && <p className="muted">{e.note}</p>}
            </div>
          ))}
        </div>
      </section>
      <section className="about-section">
        <div>
          <p className="eyebrow">02 / Education</p>
          <h2>The foundations.</h2>
        </div>
        <div>
          {p.education.map((e) => (
            <div className="experience-line" key={e.org}>
              <p className="eyebrow">{e.period}</p>
              <h3>{e.org}</h3>
              <p>{e.detail}</p>
              {e.note && <p className="muted">{e.note}</p>}
            </div>
          ))}
        </div>
      </section>
      <section className="about-section">
        <div>
          <p className="eyebrow">03 / Toolkit</p>
          <h2>Methods before buzzwords.</h2>
        </div>
        <dl className="skills-list">
          {Object.entries(p.skills).map(([name, skills]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{skills.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="about-section interests-section">
        <div>
          <p className="eyebrow">04 / Off-screen</p>
          <h2>Still curious.</h2>
        </div>
        <div>
          {p.interests.map((i) => (
            <div className="interest" key={i.label}>
              <h3>{i.label}</h3>
              <p>{i.note}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
