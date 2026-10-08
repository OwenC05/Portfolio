import Image from 'next/image'
import Link from 'next/link'
import { publicPortfolio, publicProjects } from '@/lib/publicPortfolio'
import { AlpineHero } from '@/components/portfolio/AlpineHero'

const headings: Record<string, string> = {
  research: 'Representation learning, tested honestly.',
  'ai-systems': 'Human-governed, built to be recovered.',
  'data-modelling': 'From large-scale data to a model you can defend.',
}

export default function Home() {
  const work = ['lexisnexis', 'lexisnexis-ml', 'typeforge']
    .map((id) => publicProjects.find((project) => project.id === id))
    .filter((project) => project !== undefined)
  return (
    <div className="alpine-home">
      <AlpineHero />
      {publicPortfolio.capabilities.map((skill, index) => (
        <section
          className="alpine-evidence"
          id={skill.id}
          aria-labelledby={`${skill.id}-title`}
          key={skill.id}
        >
          <div className="alpine-wrap alpine-evidence__grid">
            <div>
              <p className="alpine-eyebrow">
                {String(index + 1).padStart(2, '0')} — {skill.title}
              </p>
              <h2 id={`${skill.id}-title`}>{headings[skill.id]}</h2>
            </div>
            <div className="alpine-evidence__body">
              <p className="alpine-evidence__lede">{skill.summary}</p>
              {skill.evidence.map((item) => (
                <p key={item}>{item}</p>
              ))}
              <ul className="alpine-evidence__labels">
                {skill.labels.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
              <Link
                className="alpine-link"
                href={`/projects/${skill.id === 'ai-systems' ? 'lexisnexis-applied-ai' : 'lexisnexis-ml'}`}
              >
                Read the {skill.id === 'ai-systems' ? 'Applied AI' : 'ML'} case
                study <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      ))}
      <section
        className="alpine-work"
        id="selected-work"
        aria-labelledby="work-title"
      >
        <div className="alpine-wrap">
          <p className="alpine-eyebrow">Selected work</p>
          <h2 id="work-title">Three projects, stated plainly.</h2>
          <div className="alpine-work__grid">
            <ul className="alpine-work__list">
              {work.map((project) => (
                <li key={project.id}>
                  <Link href={`/projects/${project.slug}`}>
                    {project.title}
                  </Link>
                  <span>{project.status}</span>
                </li>
              ))}
            </ul>
            <figure className="alpine-work__figure">
              <Image
                src="/art/typeforge-demo.webp"
                width={1200}
                height={833}
                sizes="(min-width: 56rem) 40vw, 100vw"
                alt="TypeForge public demo landing page"
                loading="lazy"
              />
              <figcaption>
                TypeForge public demo · In development. The image is a product
                view, not evidence of learning uplift.
              </figcaption>
            </figure>
          </div>
          <Link className="alpine-link" href="/projects">
            All case studies <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
