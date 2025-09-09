
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { Skills } from '@/components/Skills'
import { ProjectsTeaser } from '@/components/ProjectsTeaser'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              About Me
            </h2>
            <div className="prose prose-lg mx-auto text-center text-gray-600 dark:text-gray-300">
              <p>
                I'm passionate about building technology that makes a real
                difference. Currently balancing academic excellence at Bath with
                hands-on experience in fraud detection at LexisNexis, I enjoy
                tackling complex problems across the full stack—from data
                pipelines to delightful user interfaces.
              </p>
              <p>
                When I'm not coding, you'll find me perfecting my typing speed
                on custom mechanical keyboards, hitting the slopes with Bath
                Snowsports, or exploring the perfect coffee brew.
              </p>
            </div>
          </div>
        </section>
        <Skills />
        <ProjectsTeaser />
        <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
              Let's Connect
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              I'm always open to discussing new opportunities, interesting
              projects, or just having a chat about technology.
            </p>
            <a
              href="mailto:owenc05dev@gmail.com"
              className="btn-primary"
              aria-label="Send email to Owen Cheung"
            >
              Get in Touch
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
