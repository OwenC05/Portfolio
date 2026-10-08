import Image from 'next/image'
import Link from 'next/link'
import { publicPortfolio } from '@/lib/publicPortfolio'
import { HeroReactivity } from './HeroReactivity'
import './alpine-hero.css'

const stops = [
  { left: '50%', top: '22%' },
  { left: '24%', top: '52%' },
  { left: '66%', top: '80%' },
]

export function AlpineHero() {
  const { profile, capabilities } = publicPortfolio
  return (
    <HeroReactivity>
      <div className="alpine-scene" data-alpine-scene>
        <div className="alpine-scene__media" aria-hidden="true">
          <Image
            src="/art/off-piste-terrain.webp"
            alt=""
            fill
            sizes="100vw"
            preload
          />
          <div className="alpine-scene__veil" />
        </div>
        <nav className="alpine-route" aria-label="Explore my skills">
          <svg
            className="alpine-route__piste"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path data-route-segment="research" d="M38 3 C28 11 67 11 50 22" />
            <path
              data-route-segment="ai-systems"
              d="M50 22 C32 32 8 37 24 52"
            />
            <path
              data-route-segment="data-modelling"
              d="M24 52 C36 66 83 66 66 80"
            />
            <path d="M66 80 C55 91 73 94 86 99" />
          </svg>
          {capabilities.map((skill, index) => (
            <div
              className={`alpine-route__stop${index === 2 ? ' alpine-route__stop--left' : ''}`}
              style={stops[index]}
              key={skill.id}
            >
              <a href={`#${skill.id}`} data-alpine-stop>
                <span className="alpine-route__index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="alpine-route__dot" aria-hidden="true" />
                <span className="alpine-route__text">
                  <span className="alpine-skill-name">{skill.title}</span>
                  <span className="alpine-skill-labels">
                    {skill.labels.join(' · ')}
                  </span>
                </span>
              </a>
            </div>
          ))}
        </nav>
      </div>
      <svg
        className="alpine-mobile-piste"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M55 2 C12 10 12 20 58 28 S88 46 45 55 S8 72 55 82 S90 94 52 99" />
      </svg>
      <div className="alpine-wrap alpine-hero__inner">
        <div className="alpine-identity">
          <p className="alpine-eyebrow">
            {profile.role} · {profile.location}
          </p>
          <h1 id="hero-heading">
            Applied AI,
            <br />
            made practical.
          </h1>
          <p className="alpine-intro">
            I&apos;m <strong>{profile.name}</strong>, an AI Engineer at
            LexisNexis Risk Solutions and a final-year Computer Science &amp; AI
            student at the University of Bath.
          </p>
          <ul className="alpine-waypoints" aria-label="Explore my skills">
            {capabilities.map((skill) => (
              <li key={skill.id}>
                <a href={`#${skill.id}`}>
                  <span className="alpine-skill-name">{skill.title}</span>
                  <span className="alpine-skill-labels">
                    {skill.labels.join(' · ')}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <Link className="alpine-link" href="/projects">
            Selected work <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <p className="alpine-scene__credit">
        Conceptual terrain study — inspired by snowboarding
      </p>
    </HeroReactivity>
  )
}
