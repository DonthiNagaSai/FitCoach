'use client'

import { useState } from 'react'
import { usePlan } from '@/lib/usePlan'

export default function Workouts() {
  const { plan, loading, regenerating, error, regenerate } = usePlan()
  const weekPlan = plan?.workout?.weekPlan ?? []
  const [activeDay, setActiveDay] = useState<string | null>(null)
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({})

  const day = activeDay ?? weekPlan[0]?.day
  const selected = weekPlan.find(d => d.day === day)

  const toggleEx = (name: string) => {
    setCompletedExercises(p => ({ ...p, [`${day}-${name}`]: !p[`${day}-${name}`] }))
  }

  const doneCount = selected?.exercises.filter(e => completedExercises[`${day}-${e.name}`]).length ?? 0

  if (loading) return <div className="p-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading your plan…</div>

  if (!plan || !selected) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-20">
        <h1 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>No plan yet</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Generate a plan from the dashboard first.</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-mono mb-1" style={{ color: 'var(--muted-foreground)' }}>YOUR PLAN</p>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>Workout Plan</h1>
        </div>
        <button
          onClick={regenerate}
          disabled={regenerating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-60"
          style={{ background: 'rgba(196,255,71,0.1)', color: '#c4ff47', border: '1px solid rgba(196,255,71,0.2)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          {regenerating ? 'Regenerating…' : 'Regenerate plan'}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,80,80,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.2)' }}>{error}</div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {weekPlan.map(d => (
          <button
            key={d.day}
            onClick={() => setActiveDay(d.day)}
            className="flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl transition-all"
            style={{ background: day === d.day ? 'rgba(196,255,71,0.12)' : 'var(--card)', border: `1px solid ${day === d.day ? 'rgba(196,255,71,0.3)' : 'var(--border)'}`, minWidth: 90 }}
          >
            <span className="text-xs mb-1" style={{ color: day === d.day ? '#c4ff47' : 'var(--muted-foreground)' }}>{d.day.slice(0, 3).toUpperCase()}</span>
            <span className="text-xs font-medium" style={{ color: day === d.day ? '#c4ff47' : 'var(--foreground)' }}>{d.type}</span>
            <span className="text-base mt-1">{d.rest ? '💤' : '⚡'}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>{selected.type}</h2>
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{selected.muscle} · {selected.duration}</div>
              </div>
              {selected.exercises.length > 0 && (
                <div className="text-sm font-mono" style={{ color: 'var(--muted-foreground)' }}>{doneCount}/{selected.exercises.length}</div>
              )}
            </div>

            {selected.rest ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">💤</div>
                <div className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Rest & Recover</div>
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Muscle growth happens during rest. Stay hydrated and get 8 hours of sleep.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {selected.exercises.map((ex, i) => {
                  const key = `${day}-${ex.name}`
                  const done = !!completedExercises[key]
                  return (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: done ? 'rgba(196,255,71,0.04)' : 'var(--secondary)' }}>
                      <button onClick={() => toggleEx(ex.name)} className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: done ? '#c4ff47' : 'transparent', border: `1.5px solid ${done ? '#c4ff47' : 'var(--border)'}` }}>
                        {done && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#08080f" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: done ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: done ? 'line-through' : 'none' }}>{ex.name}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{ex.category}</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{ex.sets} sets × {ex.reps} · {ex.weight} · Rest {ex.rest}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {selected.exercises.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="h-1.5 rounded-full mb-2" style={{ background: 'var(--secondary)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(doneCount / selected.exercises.length) * 100}%`, background: '#c4ff47' }} />
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{doneCount === selected.exercises.length ? '🎉 Workout complete!' : `${selected.exercises.length - doneCount} exercises remaining`}</div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="text-xs font-mono mb-4" style={{ color: 'var(--muted-foreground)' }}>WEEK OVERVIEW</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--muted-foreground)' }}>Training days</span>
                <span className="font-mono" style={{ color: 'var(--foreground)' }}>{weekPlan.filter(d => !d.rest).length}/{weekPlan.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--muted-foreground)' }}>Plan generated</span>
                <span className="font-mono" style={{ color: 'var(--foreground)' }}>{new Date(plan.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
