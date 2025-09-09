
import { siteConfig } from '@/lib/site.config'

export function ProjectsTeaser() {
  return (
    <section id="projects" className="snap-start">
      <div className="slope-section bg-gradient-to-b from-ice/60 to-sky/60 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-snow mb-4">
              Featured Projects
            </h2>
            <p className="text-xl text-snow/80 max-w-2xl mx-auto leading-relaxed">
              A selection of projects showcasing my runs across different domains and technologies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {siteConfig.projects.map((project) => (
              <article key={project.title} className="project-card">
                <h3 className="text-2xl font-semibold text-snow mb-3">
                  {project.title}
                </h3>
                <p className="text-snow/80 mb-4 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs font-medium text-snow/90 bg-ice/60 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href="/projects"
                  className="text-foam hover:text-snow font-medium transition-colors inline-flex items-center focus:outline-none focus:ring-2 focus:ring-foam focus:ring-offset-2 focus:ring-offset-ice rounded px-2 py-1"
                  aria-label={`Learn more about ${project.title}`}
                >
                  Learn more
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
