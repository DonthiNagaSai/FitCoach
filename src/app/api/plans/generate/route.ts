import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { chat, parseJsonObject, AIError } from '@/lib/ai'
import { countToday, DAILY_PLAN_LIMIT } from '@/lib/limits'

// Generates a personalized workout + diet plan by prompting the AI model with the
// user's profile, parses the structured JSON it returns, and stores it in
// the `plans` table. Called from Onboarding (first plan) and the
// "Regenerate plan" buttons on Workouts/Diet.
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if ((await countToday(supabase, 'plans', user.id)) >= DAILY_PLAN_LIMIT) {
    return NextResponse.json(
      { error: `You've generated ${DAILY_PLAN_LIMIT} plans today. Please try again tomorrow.` },
      { status: 429 }
    )
  }

  const profile = await req.json()

  const prompt = `You are a certified personal trainer and nutritionist. Generate a 7-day workout plan and a daily diet plan for this person:

${JSON.stringify(profile, null, 2)}

Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "workout": {
    "weekPlan": [
      { "day": "Monday", "type": "Push Day", "muscle": "Chest, Shoulders, Triceps", "duration": "55 min", "rest": false,
        "exercises": [ { "name": "Bench Press", "sets": 4, "reps": "8", "weight": "80kg", "rest": "90s", "category": "Compound" } ] }
    ]
  },
  "diet": {
    "targets": { "cals": 2120, "protein": 174, "carbs": 210, "fat": 65 },
    "meals": [
      { "name": "Breakfast", "time": "7:30 AM", "items": [ { "name": "Rolled oats (80g)", "cals": 288, "protein": 10, "carbs": 50, "fat": 5 } ] }
    ]
  }
}

Include all 7 days (use "rest": true and an empty exercises array for rest days). Tailor exercises to the person's equipment access and activity level, and tailor meals to their dietary restrictions. Base calorie/macro targets on their weight, height, age, and goal.`

  let workout, diet
  try {
    const text = await chat([{ role: 'user', content: prompt }], { maxTokens: 6000, json: true })
    const parsed = parseJsonObject(text)
    workout = parsed.workout
    diet = parsed.diet
    if (!workout?.weekPlan || !diet?.meals) throw new Error('AI reply was missing the workout or diet section')
  } catch (err) {
    console.error('Plan generation failed:', err)
    const status = err instanceof AIError ? err.status : 500
    const message = status === 429 ? (err as Error).message : 'Failed to generate plan. Please try again.'
    return NextResponse.json({ error: message }, { status })
  }

  const { data, error } = await supabase
    .from('plans')
    .insert({ user_id: user.id, workout, diet })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
