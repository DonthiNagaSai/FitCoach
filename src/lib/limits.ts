import type { SupabaseClient } from '@supabase/supabase-js'

// Per-user daily caps so the free AI tier isn't used up by one person.
export const DAILY_PLAN_LIMIT = Number(process.env.DAILY_PLAN_LIMIT || 5)
export const DAILY_CHAT_LIMIT = Number(process.env.DAILY_CHAT_LIMIT || 30)

function startOfTodayUTC() {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

// Counts rows the user created today in a table. RLS already limits the
// query to the signed-in user's rows; the user_id filter makes it explicit.
export async function countToday(
  supabase: SupabaseClient,
  table: 'plans' | 'chat_messages',
  userId: string,
  extra?: { column: string; value: string }
) {
  let q = supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfTodayUTC())
  if (extra) q = q.eq(extra.column, extra.value)
  const { count } = await q
  return count ?? 0
}
