import { createAssistantHandler } from '../../../lib/assistant/handler'
import { knowledgeHref, publishedKnowledge } from '../../../lib/knowledge/catalog'

export const runtime = 'nodejs'
export const maxDuration = 20
export const POST = createAssistantHandler({ records: publishedKnowledge, href: knowledgeHref })
