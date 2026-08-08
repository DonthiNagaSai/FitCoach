'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlan } from '@/lib/usePlan'

const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function Dashboard() {
  const router = useRouter()
  const { plan, loading, regenerating, regenerate } = usePlan()

  const todayName = weekdayNames[new Date().getDay()]
  const todayWorkout = useMemo(
    () => plan?.workout?.weekPlan?.find(d => d.day === todayName) ?? plan?.workout?.weekPlan?.[0],
    [plan, todayName]
  )
  const meals = plan?.diet?.meals ?? []
  const targets = plan?.diet?.targets

  const [completedExercises, setCompletedExercises] = useState<boolean[]>([])
  const [completedMeals, setCompletedMeals] = useState<boolean[]>([])

  const exercises = todayWorkout?.exercises ?? []
  const doneEx = completedExercises.filter(Boolean).length
  const toggleExercise = (i: number) =>
    setCompletedExercises(prev => {
      const next = prev.length ? [...prev] : exercises.map(() => false)
      next[i] = !next[i]
      return next
    })
  const toggleMeal = (i: number) =>
    setCompletedMeals(prev => {
      const next = prev.length ? [...prev] : meals.map(() => false)
      next[i] = !next[i]
      return next
    })

  const totalCals = meals.reduce((s, m) => s + m.items.reduce((a, it) => a + it.cals, 0), 0)
  const consumedCals = meals.reduce((s, m, i) => s + (completedMeals[i] ? m.items.reduce((a, it) => a + it.cals, 0) : 0), 0)

  if (loading) {
    return <div className="p-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading your plan…</div>
  }

  if (!plan) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-20">
        <h1 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>No plan yet</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Generate your first AI workout and diet plan to get started.</p>
        <button
          onClick={regenerate}
          disabled={regenerating}
          className="px-6 py-3 rounded-xl font-semibold text-sm"
          style={{ background: '#c4ff47', color: '#08080f' }}
        >
          {regenerating ? 'Generating…' : 'Generate my plan →'}
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-mono mb-1" style={{ color: 'var(--muted-foreground)' }}>{todayName.toUpperCase()}</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>
            Good to see you.
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Calories today', value: `${consumedCals}`, suffix: `/ ${totalCals} kcal`, color: '#c4ff47' },
          { label: 'Protein target', value: `${targets?.protein ?? '—'}g`, suffix: 'daily goal', color: '#ff8c42' },
          { label: 'Exercises', value: `${doneEx}/${exercises.length}`, suffix: 'done today', color: '#a78bfa' },
          { label: 'Calorie target', value: `${targets?.cals ?? '—'}`, suffix: 'kcal/day', color: '#38bdf8' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="text-xs mb-2 font-mono" style={{ color: 'var(--muted-foreground)' }}>{s.label.toUpperCase()}</div>
            <div className="font-display text-2xl font-semibold mb-0.5" style={{ color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.suffix}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-mono mb-0.5" style={{ color: 'var(--muted-foreground)' }}>TODAY&apos;S WORKOUT</div>
              <div className="font-semibold" style={{ color: 'var(--foreground)' }}>{todayWorkout?.type ?? 'Rest day'}</div>
            </div>
            <button onClick={() => router.push('/workouts')} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(196,255,71,0.1)', color: '#c4ff47', border: '1px solid rgba(196,255,71,0.2)' }}>
              Full plan →
            </button>
          </div>

          {exercises.length === 0 ? (
            <div className="text-sm py-6 text-center" style={{ color: 'var(--muted-foreground)' }}>Rest day — recover well 💤</div>
          ) : (
            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <button key={i} onClick={() => toggleExercise(i)} className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all" style={{ background: completedExercises[i] ? 'rgba(196,255,71,0.05)' : 'var(--secondary)' }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: completedExercises[i] ? '#c4ff47' : 'transparent', border: `1.5px solid ${completedExercises[i] ? '#c4ff47' : 'var(--border)'}` }}>
                    {completedExercises[i] && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#08080f" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: completedExercises[i] ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: completedExercises[i] ? 'line-through' : 'none' }}>{ex.name}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{ex.sets}×{ex.reps} · {ex.weight}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-mono mb-0.5" style={{ color: 'var(--muted-foreground)' }}>TODAY&apos;S MEALS</div>
              <div className="font-semibold" style={{ color: 'var(--foreground)' }}>{targets?.cals ?? '—'} kcal target</div>
            </div>
            <button onClick={() => router.push('/diet')} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,140,66,0.1)', color: '#ff8c42', border: '1px solid rgba(255,140,66,0.2)' }}>
              Full plan →
            </button>
          </div>

          <div className="space-y-2">
            {meals.map((meal, i) => {
              const cals = meal.items.reduce((a, it) => a + it.cals, 0)
              return (
                <button key={i} onClick={() => toggleMeal(i)} className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all" style={{ background: completedMeals[i] ? 'rgba(255,140,66,0.05)' : 'var(--secondary)' }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: completedMeals[i] ? '#ff8c42' : 'transparent', border: `1.5px solid ${completedMeals[i] ? '#ff8c42' : 'var(--border)'}` }}>
                    {completedMeals[i] && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#08080f" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium" style={{ color: completedMeals[i] ? 'var(--muted-foreground)' : 'var(--foreground)' }}>{meal.name}</div>
                      <div className="text-xs font-mono ml-2" style={{ color: 'var(--muted-foreground)' }}>{cals} kcal</div>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{meal.items.map(it => it.name).join(', ')}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 p-5 rounded-2xl cursor-pointer transition-all hover:border-[rgba(196,255,71,0.3)]" style={{ background: 'rgba(196,255,71,0.04)', border: '1px solid rgba(196,255,71,0.12)' }} onClick={() => router.push('/coach')}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(196,255,71,0.15)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4ff47" strokeWidth="1.8"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
          </div>
          <div className="flex-1">
            <div className="text-xs font-mono mb-1" style={{ color: '#c4ff47' }}>AI COACH</div>
            <p className="text-sm" style={{ color: 'var(--card-foreground)' }}>Ask your coach anything about today&apos;s plan, or tell it how you&apos;re feeling.</p>
            <div className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>Tap to open chat →</div>
          </div>
        </div>
      </div>
    </div>
  )
}
