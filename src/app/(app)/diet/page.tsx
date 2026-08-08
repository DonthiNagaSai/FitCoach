'use client'

import { useState } from 'react'
import { usePlan } from '@/lib/usePlan'

function totalMacro(items: { cals: number; protein: number; carbs: number; fat: number }[]) {
  return items.reduce((a, b) => ({ cals: a.cals + b.cals, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat }), { cals: 0, protein: 0, carbs: 0, fat: 0 })
}

export default function Diet() {
  const { plan, loading, regenerating, error, regenerate } = usePlan()
  const meals = plan?.diet?.meals ?? []
  const targets = plan?.diet?.targets
  const [openMeal, setOpenMeal] = useState<number | null>(0)
  const [logged, setLogged] = useState<boolean[]>([])

  const isLogged = (i: number) => !!logged[i]
  const toggleLogged = (i: number) => setLogged(l => {
    const next = l.length ? [...l] : meals.map(() => false)
    next[i] = !next[i]
    return next
  })

  const consumed = meals.reduce((a, m, i) => {
    if (!isLogged(i)) return a
    const t = totalMacro(m.items)
    return { cals: a.cals + t.cals, protein: a.protein + t.protein, carbs: a.carbs + t.carbs, fat: a.fat + t.fat }
  }, { cals: 0, protein: 0, carbs: 0, fat: 0 })

  const macros = targets ? [
    { label: 'Calories', consumed: consumed.cals, target: targets.cals, suffix: 'kcal', color: '#c4ff47' },
    { label: 'Protein', consumed: consumed.protein, target: targets.protein, suffix: 'g', color: '#ff8c42' },
    { label: 'Carbs', consumed: consumed.carbs, target: targets.carbs, suffix: 'g', color: '#38bdf8' },
    { label: 'Fat', consumed: consumed.fat, target: targets.fat, suffix: 'g', color: '#a78bfa' },
  ] : []

  if (loading) return <div className="p-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading your plan…</div>

  if (!plan) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-20">
        <h1 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>No plan yet</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Generate a plan from the dashboard first.</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-mono mb-1" style={{ color: 'var(--muted-foreground)' }}>NUTRITION PLAN</p>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>Daily Meals</h1>
        </div>
        <button
          onClick={regenerate}
          disabled={regenerating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
          style={{ background: 'rgba(255,140,66,0.1)', color: '#ff8c42', border: '1px solid rgba(255,140,66,0.2)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          {regenerating ? 'Regenerating…' : 'Regenerate meals'}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,80,80,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.2)' }}>{error}</div>
      )}

      <div className="glass rounded-2xl p-5 mb-6">
        <div className="text-xs font-mono mb-4" style={{ color: 'var(--muted-foreground)' }}>TODAY&apos;S MACROS</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {macros.map(m => (
            <div key={m.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--muted-foreground)' }}>{m.label}</span>
                <span className="font-mono" style={{ color: m.color }}>{Math.round(m.consumed)}/{m.target}{m.suffix}</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'var(--secondary)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((m.consumed / m.target) * 100, 100)}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {meals.map((meal, i) => {
          const mealTotal = totalMacro(meal.items)
          const isOpen = openMeal === i
          return (
            <div key={i} className="glass rounded-2xl overflow-hidden">
              <button onClick={() => setOpenMeal(isOpen ? null : i)} className="w-full flex items-center gap-4 p-4">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{meal.name}</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{meal.time}</span>
                    {isLogged(i) && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(196,255,71,0.1)', color: '#c4ff47' }}>✓ Logged</span>}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{mealTotal.cals} kcal · {mealTotal.protein}g protein · {mealTotal.carbs}g carbs · {mealTotal.fat}g fat</div>
                </div>
                <div style={{ color: 'var(--muted-foreground)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="pt-4 space-y-2 mb-4">
                    {meal.items.map((item, j) => (
                      <div key={j} className="flex items-center justify-between py-2" style={{ borderBottom: j < meal.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <span className="text-sm" style={{ color: 'var(--foreground)' }}>{item.name}</span>
                        <div className="flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
                          <span>{item.cals} kcal</span>
                          <span style={{ color: '#ff8c42' }}>{item.protein}g P</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => toggleLogged(i)} className="w-full py-2 rounded-xl text-sm font-medium transition-all" style={{ background: isLogged(i) ? 'rgba(196,255,71,0.1)' : '#c4ff47', color: isLogged(i) ? '#c4ff47' : '#08080f', border: isLogged(i) ? '1px solid rgba(196,255,71,0.3)' : 'none' }}>
                    {isLogged(i) ? '✓ Meal logged' : 'Mark as eaten'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
