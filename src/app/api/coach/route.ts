import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODEL } from '@/lib/ai'

// Proxies a chat message to Claude with the user's profile + recent plan as
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
    const anthropic = getAnthropicClient()
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...(history ?? []).map((m: { role: 'user' | 'assistant'; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user', content: message },
      ],
    })

    const text = response.content.find((b) => b.type === 'text')?.text ?? ''
    return NextResponse.json({ reply: text })
  } catch (err) {
    console.error('Coach chat failed:', err)
    return NextResponse.json(
      { error: 'Failed to reach the AI coach. Check ANTHROPIC_API_KEY is set correctly.' },
      { status: 500 }
    )
  }
}
