import type { MetadataRoute } from 'next'
import { publicProjects } from '@/lib/publicPortfolio'
import { siteUrl } from '@/lib/siteUrl'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...['', '/projects', '/about', '/contact', '/agents'].map((path) => ({
      url: `${siteUrl}${path}`,
    })),
    ...publicProjects.map((project) => ({ url: project.url })),
  ]
}
