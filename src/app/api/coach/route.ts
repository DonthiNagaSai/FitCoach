import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { chat, AIError } from '@/lib/ai'
import { countToday, DAILY_CHAT_LIMIT } from '@/lib/limits'

// Proxies a chat message to the AI model with the user's profile + recent plan as
// context, so the coach can give grounded, personalized answers. The API
// key stays server-side; the client only ever talks to this route.
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if ((await countToday(supabase, 'chat_messages', user.id, { column: 'role', value: 'user' })) >= DAILY_CHAT_LIMIT) {
    return NextResponse.json(
      { error: `You've reached today's limit of ${DAILY_CHAT_LIMIT} coach messages. Please come back tomorrow.` },
      { status: 429 }
    )
  }

  const { message, history } = await req.json()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: latestPlan } = await supabase
    .from('plans')
    .select('workout, diet')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const systemPrompt = `You are FitCoach AI, an encouraging, knowledgeable fitness and nutrition coach embedded in a fitness app. You have full context on this user:

Profile: ${JSON.stringify(profile ?? {})}
Current plan: ${JSON.stringify(latestPlan ?? {})}

Give specific, actionable answers grounded in their actual profile and plan. Keep responses concise (a few short paragraphs max) and warm in tone. If they ask you to change their plan, describe exactly what you'd change — the app will let them regenerate the plan separately.`

  try {
    const text = await chat(
      [
        { role: 'system', content: systemPrompt },
        ...(history ?? []).slice(-20).map((m: { role: 'user' | 'assistant'; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user', content: message },
      ],
      { maxTokens: 1024 }
    )
    return NextResponse.json({ reply: text })
  } catch (err) {
    console.error('Coach chat failed:', err)
    const status = err instanceof AIError ? err.status : 500
    const msg = status === 429 ? (err as Error).message : 'Failed to reach the AI coach. Please try again.'
    return NextResponse.json({ error: msg }, { status })
  }
}
