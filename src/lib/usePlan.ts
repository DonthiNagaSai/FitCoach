'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Plan } from '@/lib/types'

// Fetches the user's most recently generated plan, and exposes a
// `regenerate` function that calls the AI plan-generation API route and
// refreshes state. Shared by Dashboard, Workouts, and Diet.
export function usePlan() {
  const supabase = createClient()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    setPlan(data as Plan | null)
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const regenerate = async () => {
    setRegenerating(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const res = await fetch('/api/plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile ?? {}),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to regenerate plan')
      setPlan(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setRegenerating(false)
    }
  }

  return { plan, loading, regenerating, error, regenerate }
}
