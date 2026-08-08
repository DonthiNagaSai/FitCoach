import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

// Lazily-created Anthropic client — server-side only, never import this from a client component.
export function getAnthropicClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.example).')
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return client
}

export const MODEL = 'claude-sonnet-5'
