
import { siteConfig } from '@/lib/site.config'
import { CoffeeSteam } from './CoffeeSteam'
import { ScrollIndicator } from './ScrollIndicator'

export function Hero() {
  return (
    <section className="snap-start min-h-screen flex items-center justify-center relative">
      <div className="slope-section bg-gradient-to-b from-transparent to-sky/20 backdrop-blur-sm w-full">
        <div className="container max-w-6xl mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-snow mb-6 leading-tight">
                Hi, I'm{' '}
                <span className="text-foam">
                  Owen
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-snow/90 mb-8 leading-relaxed">
                {siteConfig.author.headline}
              </p>
              
              <p className="text-lg text-snow/80 mb-12 leading-relaxed">
                {siteConfig.author.oneLiner}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8">
                <a
                  href="#projects"
                  className="btn-espresso w-full sm:w-auto px-8 py-4 text-lg"
                  aria-label="View my projects"
                >
                  View Projects 🏂
                </a>
                <a
                  href="/cv/Owen_Cheung_CV.pdf"
                  className="btn-secondary w-full sm:w-auto px-8 py-4 text-lg"
                  aria-label="Download Owen Cheung's CV"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download CV
                </a>
              </div>

              <div className="text-center lg:text-left">
                <a
                  href={`mailto:${siteConfig.author.email}`}
                  className="text-foam hover:text-snow font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-foam focus:ring-offset-2 focus:ring-offset-ice rounded px-2 py-1"
                  aria-label="Send email to Owen Cheung"
                >
                  {siteConfig.author.email}
                </a>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img 
                  src="/assets/coffee-cup.svg" 
                  alt="Coffee cup" 
                  className="w-64 h-64 opacity-80"
                />
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                  <CoffeeSteam />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ScrollIndicator />
    </section>
  )
}
