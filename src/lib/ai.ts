// Server-side helper for Groq's OpenAI-compatible chat API (free tier).
// Never import this from a client component: it reads GROQ_API_KEY.

export const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export class AIError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

export async function chat(
  messages: ChatMessage[],
  opts: { maxTokens?: number; json?: boolean } = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new AIError('GROQ_API_KEY is not set. Add it to .env.local (see .env.example).')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: 0.6,
      // gpt-oss models think before answering; keep that short so replies stay fast
      ...(MODEL.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {}),
      ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
    }),
  })

  if (res.status === 429) throw new AIError('The free AI quota is used up for now. Please try again in a few minutes.', 429)
  if (!res.ok) throw new AIError(`AI request failed (${res.status}): ${(await res.text()).slice(0, 200)}`)

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

// Pull the first JSON object out of a model reply, even if it added extra text.
export function parseJsonObject(text: string) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in AI reply')
  return JSON.parse(text.slice(start, end + 1))
}
