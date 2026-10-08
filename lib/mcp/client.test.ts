import { expect, it } from 'vitest'
import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client'
import { createPortfolioHandler } from './handler'

it.each(['legacy', { pin: '2026-07-28' }] as const)(
  'official client negotiates %j and reads the public dataset',
  async (mode) => {
    const handle = createPortfolioHandler()
    const formats = new Set<string>()
    const transport = new StreamableHTTPClientTransport(
      new URL('http://localhost/mcp'),
      {
        fetch: async (input, init) => {
          const request = new Request(input, init)
          request.headers.set('host', 'localhost')
          const response = await handle(request)
          if (response.ok && response.headers.get('content-type'))
            formats.add(response.headers.get('content-type')!.split(';')[0])
          expect(Buffer.byteLength(await response.clone().text())).toBeLessThan(
            65536
          )
          return response
        },
      }
    )
    const client = new Client(
      { name: 'test', version: '1' },
      { capabilities: {}, versionNegotiation: { mode } }
    )
    try {
      await client.connect(transport)
      expect(
        (await client.listTools()).tools.map((t) => t.name).sort()
      ).toEqual(['get_project', 'search_projects'])
      const resources = (await client.listResources()).resources
      expect(resources).toHaveLength(6)
      for (const resource of resources)
        expect(
          (await client.readResource({ uri: resource.uri })).contents
        ).toHaveLength(1)
      const all = await client.callTool({
        name: 'search_projects',
        arguments: { query: '   ', limit: 5 },
      })
      expect(all.structuredContent).toHaveProperty('projects.length', 3)
      const found = await client.callTool({
        name: 'get_project',
        arguments: { slug: 'typeforge' },
      })
      expect(found.structuredContent).toMatchObject({
        project: { slug: 'typeforge', status: 'In development' },
      })
      expect(
        (
          await client.callTool({
            name: 'get_project',
            arguments: { slug: '../private' },
          })
        ).isError
      ).toBe(true)
      expect(
        (
          await client.callTool({
            name: 'search_projects',
            arguments: { query: '', limit: 6 },
          })
        ).isError
      ).toBe(true)
      await expect(
        client.readResource({ uri: 'file:///private' })
      ).rejects.toThrow()
      expect(
        formats.has(
          mode === 'legacy' ? 'text/event-stream' : 'application/json'
        )
      ).toBe(true)
    } finally {
      await client.close()
    }
  },
  20000
)
