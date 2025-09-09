
import { siteConfig } from '@/lib/site.config'

export function Skills() {
  return (
    <section id="skills" className="snap-start">
      <div className="slope-section bg-gradient-to-b from-sky/60 to-ice/60 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-snow mb-4">
              Skills & Technologies
            </h2>
            <p className="text-xl text-snow/80 max-w-2xl mx-auto leading-relaxed">
              Technologies and tools I carve through across data science, full-stack development, and beyond.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {siteConfig.skills.map((skill) => (
              <span
                key={skill}
                className="skill-chip"
                tabIndex={0}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
