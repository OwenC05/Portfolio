import { McpServer, fromJsonSchema } from '@modelcontextprotocol/server'
import {
  publicPortfolio,
  publicProjects,
  getPublicProject,
  searchProjects,
  type PublicProject,
} from '../publicPortfolio'
import { siteUrl } from '../siteUrl'

export const resourceValues = [
  {
    name: 'profile',
    uri: 'portfolio://profile',
    value: {
      profile: publicPortfolio.profile,
      capabilities: publicPortfolio.capabilities,
      sourceUrl: `${siteUrl}/about`,
      provenance: publicPortfolio.provenance,
    },
  },
  {
    name: 'experience',
    uri: 'portfolio://experience',
    value: {
      experience: publicPortfolio.experience,
      education: publicPortfolio.education,
      sourceUrl: `${siteUrl}/about`,
      provenance: publicPortfolio.provenance,
    },
  },
  {
    name: 'projects',
    uri: 'portfolio://projects',
    value: {
      projects: publicProjects,
      sourceUrl: `${siteUrl}/projects`,
      provenance: publicPortfolio.provenance,
    },
  },
  ...publicProjects.map((project) => ({
    name: project.slug,
    uri: `portfolio://projects/${project.slug}`,
    value: {
      project,
      sourceUrl: project.url,
      provenance: publicPortfolio.provenance,
    },
  })),
]
const annotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
}
const result = (value: Record<string, unknown>) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value) }],
  structuredContent: value,
})

// New registrations per exchange. No tools touch files, execute commands or fetch URLs.
export function buildPortfolioServer() {
  const server = new McpServer({
    name: 'owen-cheung-portfolio',
    version: '1.0.0',
  })
  for (const resource of resourceValues) {
    server.registerResource(
      resource.name,
      resource.uri,
      { title: resource.name, mimeType: 'application/json' },
      (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(resource.value),
          },
        ],
      })
    )
  }
  server.registerTool(
    'search_projects',
    {
      title: 'Search public projects',
      description:
        'Search curated project descriptions, with honest status, limitations and canonical source URLs. Owner-supplied, not independently verified.',
      annotations,
      inputSchema: fromJsonSchema<{ query: string; limit?: number }>({
        type: 'object',
        properties: {
          query: { type: 'string', maxLength: 200 },
          limit: { type: 'integer', minimum: 1, maximum: 5 },
        },
        required: ['query'],
        additionalProperties: false,
      }),
      outputSchema: fromJsonSchema<{ projects: PublicProject[] }>({
        type: 'object',
        properties: {
          projects: { type: 'array', maxItems: 5, items: { type: 'object' } },
        },
        required: ['projects'],
        additionalProperties: false,
      }),
    },
    ({ query, limit }) => result({ projects: searchProjects(query, limit) })
  )
  server.registerTool(
    'get_project',
    {
      title: 'Read a public case study',
      description:
        'Retrieve one published case study by its exact slug. Includes source URL and public evidence boundaries.',
      annotations,
      inputSchema: fromJsonSchema<{ slug: string }>({
        type: 'object',
        properties: {
          slug: { type: 'string', enum: publicProjects.map((p) => p.slug) },
        },
        required: ['slug'],
        additionalProperties: false,
      }),
      outputSchema: fromJsonSchema<{ project: PublicProject }>({
        type: 'object',
        properties: { project: { type: 'object' } },
        required: ['project'],
        additionalProperties: false,
      }),
    },
    ({ slug }) => {
      const project = getPublicProject(slug)
      return project
        ? result({ project })
        : {
            isError: true,
            content: [
              { type: 'text' as const, text: 'Unknown public project.' },
            ],
          }
    }
  )
  return server
}
