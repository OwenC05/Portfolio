
import { siteConfig } from '@/lib/site.config'

export function Hero() {
  return (
    <section id="hero" className="pt-24 pb-20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Hi, I'm{' '}
            <span className="text-blue-600 dark:text-blue-400">
              Owen Cheung
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {siteConfig.author.headline}
          </p>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            {siteConfig.author.oneLiner}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a
              href="#projects"
              className="btn-primary w-full sm:w-auto"
              aria-label="View my projects"
            >
              View Projects
            </a>
            <a
              href="/cv/Owen_Cheung_CV.pdf"
              className="btn-secondary w-full sm:w-auto"
              aria-label="Download Owen Cheung's CV"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download CV
            </a>
          </div>

          <div className="text-center">
            <a
              href={`mailto:${siteConfig.author.email}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 rounded px-2 py-1"
              aria-label="Send email to Owen Cheung"
            >
              Email me
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
