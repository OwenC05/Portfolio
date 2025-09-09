
import { siteConfig } from '@/lib/site.config'

export function Skills() {
  return (
    <section id="skills" className="py-20 bg-white dark:bg-gray-950">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Skills & Technologies
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Technologies and tools I work with across data science, full-stack development, and beyond.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {siteConfig.skills.map((skill) => (
            <span
              key={skill}
              className="skill-badge"
              tabIndex={0}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
