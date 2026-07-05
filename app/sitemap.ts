import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/siteUrl'
import { projects } from '@/lib/projects'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/` },
    { url: `${siteUrl}/projects` },
    { url: `${siteUrl}/about` },
  ]

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${siteUrl}/projects/${p.slug}`,
  }))

  return [...staticRoutes, ...projectRoutes]
}
