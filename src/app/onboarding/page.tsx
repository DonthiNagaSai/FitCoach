'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const steps = [
  { id: 'basics', label: 'About you' },
  { id: 'goal', label: 'Your goal' },
  { id: 'activity', label: 'Activity level' },
  { id: 'diet', label: 'Dietary needs' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'done', label: 'Generating' },
]

const goals = [
  { id: 'lose', emoji: '🔥', title: 'Lose fat', desc: 'Reduce body fat while preserving muscle' },
  { id: 'build', emoji: '💪', title: 'Build muscle', desc: 'Increase lean mass and strength' },
  { id: 'endurance', emoji: '🏃', title: 'Improve endurance', desc: 'Better cardiovascular performance' },
  { id: 'maintain', emoji: '⚖️', title: 'Maintain & tone', desc: 'Stay fit and feel great' },
]

const activityLevels = [
  { id: 'sedentary', title: 'Sedentary', desc: 'Desk job, little movement' },
  { id: 'light', title: 'Lightly active', desc: '1–3 workouts/week' },
  { id: 'moderate', title: 'Moderately active', desc: '3–5 workouts/week' },
  { id: 'very', title: 'Very active', desc: '6+ workouts/week or physical job' },
]

const dietOptions = ['None', 'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-free', 'Dairy-free', 'Keto', 'Paleo', 'Halal', 'Kosher']

const equipmentOptions = [
  { id: 'none', emoji: '🏠', label: 'No equipment / bodyweight only' },
  { id: 'minimal', emoji: '🪢', label: 'Resistance bands & dumbbells' },
  { id: 'home_gym', emoji: '🏋️', label: 'Home gym (rack, barbell, plates)' },
  { id: 'commercial', emoji: '🏢', label: 'Full commercial gym access' },
]

interface Profile {
  units: 'metric' | 'imperial'
  age: string
  weight: string
  height: string
  goal: string
  activityLevel: string
  dietRestrictions: string[]
  equipment: string
}

const initialProfile: Profile = {
  units: 'metric', age: '', weight: '', height: '', goal: '', activityLevel: '', dietRestrictions: [], equipment: '',
}

export default function Onboarding() {
  const router = useRouter()
  const supabase = createClient()
  const [stepIdx, setStepIdx] = useState(0)
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [genProgress, setGenProgress] = useState(0)
  const [genLabel, setGenLabel] = useState('Analyzing your profile and goals')
  const [genError, setGenError] = useState('')

  const next = () => {
    if (stepIdx === steps.length - 2) {
      startGeneration()
    } else {
      setStepIdx(i => i + 1)
    }
  }
  const back = () => setStepIdx(i => Math.max(0, i - 1))

  const startGeneration = async () => {
    setStepIdx(steps.length - 1)
    setGenError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')

      setGenProgress(15)
      setGenLabel('Saving your profile')
      const { error: profileError } = await supabase.from('profiles').upsert({
        user_id: user.id,
        age: Number(profile.age),
        weight: Number(profile.weight),
        height: Number(profile.height),
        units: profile.units,
        goal: profile.goal,
        activity_level: profile.activityLevel,
        diet_restrictions: profile.dietRestrictions,
        equipment: profile.equipment,
      })
      if (profileError) throw profileError

      setGenProgress(40)
      setGenLabel('AI is designing your workout split')
      const res = await fetch('/api/plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      setGenProgress(85)
      setGenLabel('Finalizing and personalizing')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to generate plan')

      setGenProgress(100)
      await new Promise(r => setTimeout(r, 400))
      router.push('/dashboard')
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const toggleDiet = (d: string) => {
    setProfile(p => ({
      ...p,
      dietRestrictions: p.dietRestrictions.includes(d)
        ? p.dietRestrictions.filter(x => x !== d)
        : [...p.dietRestrictions, d],
    }))
  }

  const unitLabel = profile.units === 'metric' ? { weight: 'kg', height: 'cm' } : { weight: 'lbs', height: 'in' }

  const canProceed = (): boolean => {
    switch (steps[stepIdx].id) {
      case 'basics': return !!profile.age && !!profile.weight && !!profile.height
      case 'goal': return !!profile.goal
      case 'activity': return !!profile.activityLevel
      case 'diet': return true
      case 'equipment': return !!profile.equipment
      default: return true
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 mesh-bg">
      <div className="w-full max-w-lg fade-up">
        <div className="flex items-center justify-center gap-2 mb-10">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L4 8v12l10 6 10-6V8L14 2z" fill="#c4ff47" fillOpacity="0.15" stroke="#c4ff47" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="2.5" fill="#c4ff47"/>
          </svg>
          <span className="font-display font-semibold" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>FitCoach AI</span>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>
            <span>Step {Math.min(stepIdx + 1, steps.length - 1)} of {steps.length - 1}</span>
            <span>{steps[stepIdx].label}</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: 'var(--secondary)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(stepIdx / (steps.length - 2)) * 100}%`, background: '#c4ff47' }} />
          </div>
        </div>

        <div className="glass rounded-2xl p-8">
          {steps[stepIdx].id === 'basics' && (
            <div>
              <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>Tell us about yourself</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Used to calibrate your plans — never shared</p>

              <div className="flex rounded-xl overflow-hidden mb-6" style={{ border: '1px solid var(--border)' }}>
                {(['metric', 'imperial'] as const).map(u => (
                  <button key={u} onClick={() => setProfile(p => ({ ...p, units: u }))} className="flex-1 py-2.5 text-sm font-medium capitalize transition-all" style={{ background: profile.units === u ? '#c4ff47' : 'transparent', color: profile.units === u ? '#08080f' : 'var(--muted-foreground)' }}>
                    {u}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {[
                  { key: 'age', label: 'Age', type: 'number', placeholder: '28', suffix: 'years' },
                  { key: 'weight', label: 'Weight', type: 'number', placeholder: profile.units === 'metric' ? '75' : '165', suffix: unitLabel.weight },
                  { key: 'height', label: 'Height', type: 'number', placeholder: profile.units === 'metric' ? '178' : '70', suffix: unitLabel.height },
                ].map(({ key, label, type, placeholder, suffix }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type={type}
                          value={profile[key as keyof Profile] as string}
                          onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                          style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                        <span className="text-sm w-10" style={{ color: 'var(--muted-foreground)' }}>{suffix}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {steps[stepIdx].id === 'goal' && (
            <div>
              <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>What&apos;s your primary goal?</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Your entire plan will be built around this</p>
              <div className="grid grid-cols-2 gap-3">
                {goals.map(g => (
                  <button key={g.id} onClick={() => setProfile(p => ({ ...p, goal: g.id }))} className="p-4 rounded-xl text-left transition-all" style={{ background: profile.goal === g.id ? 'rgba(196,255,71,0.1)' : 'var(--secondary)', border: `1px solid ${profile.goal === g.id ? '#c4ff47' : 'var(--border)'}` }}>
                    <div className="text-xl mb-2">{g.emoji}</div>
                    <div className="text-sm font-medium mb-0.5" style={{ color: 'var(--foreground)' }}>{g.title}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {steps[stepIdx].id === 'activity' && (
            <div>
              <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>How active are you now?</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Be honest — your plan adapts as you progress</p>
              <div className="space-y-2.5">
                {activityLevels.map(a => (
                  <button key={a.id} onClick={() => setProfile(p => ({ ...p, activityLevel: a.id }))} className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all" style={{ background: profile.activityLevel === a.id ? 'rgba(196,255,71,0.1)' : 'var(--secondary)', border: `1px solid ${profile.activityLevel === a.id ? '#c4ff47' : 'var(--border)'}` }}>
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: profile.activityLevel === a.id ? '#c4ff47' : 'var(--border)' }}>
                      {profile.activityLevel === a.id && <div className="w-2 h-2 rounded-full" style={{ background: '#c4ff47' }} />}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{a.title}</div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{a.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {steps[stepIdx].id === 'diet' && (
            <div>
              <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>Any dietary needs?</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Select all that apply — you can edit anytime</p>
              <div className="flex flex-wrap gap-2">
                {dietOptions.map(d => (
                  <button key={d} onClick={() => toggleDiet(d)} className="px-4 py-2 rounded-full text-sm transition-all" style={{ background: profile.dietRestrictions.includes(d) ? 'rgba(196,255,71,0.15)' : 'var(--secondary)', border: `1px solid ${profile.dietRestrictions.includes(d) ? '#c4ff47' : 'var(--border)'}`, color: profile.dietRestrictions.includes(d) ? '#c4ff47' : 'var(--muted-foreground)' }}>
                    {d}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>Skipping this is fine — your plan will be balanced for general nutrition</p>
            </div>
          )}

          {steps[stepIdx].id === 'equipment' && (
            <div>
              <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>What equipment do you have?</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Your workouts will only use what you have access to</p>
              <div className="space-y-2.5">
                {equipmentOptions.map(e => (
                  <button key={e.id} onClick={() => setProfile(p => ({ ...p, equipment: e.id }))} className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all" style={{ background: profile.equipment === e.id ? 'rgba(196,255,71,0.1)' : 'var(--secondary)', border: `1px solid ${profile.equipment === e.id ? '#c4ff47' : 'var(--border)'}` }}>
                    <span className="text-xl">{e.emoji}</span>
                    <span className="text-sm" style={{ color: 'var(--foreground)' }}>{e.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {steps[stepIdx].id === 'done' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(196,255,71,0.1)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c4ff47" strokeWidth="1.5" strokeLinecap="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
              </div>
              <h2 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>Building your plan…</h2>
              <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>AI is generating your personalized workout and meal plan</p>

              {genError ? (
                <div className="px-4 py-3 rounded-xl text-sm text-left" style={{ background: 'rgba(255,80,80,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.2)' }}>
                  {genError}. You can{' '}
                  <button onClick={startGeneration} className="underline">try again</button>.
                </div>
              ) : (
                <>
                  <div className="h-1.5 rounded-full mb-4" style={{ background: 'var(--secondary)' }}>
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${genProgress}%`, background: 'linear-gradient(90deg, #c4ff47, #80ffb4)' }} />
                  </div>
                  <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{genLabel}…</div>
                </>
              )}
            </div>
          )}
        </div>

        {steps[stepIdx].id !== 'done' && (
          <div className="flex items-center gap-3 mt-6">
            {stepIdx > 0 && (
              <button onClick={back} className="px-5 py-3 rounded-xl text-sm transition-colors" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                Back
              </button>
            )}
            <button onClick={next} disabled={!canProceed()} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-40" style={{ background: '#c4ff47', color: '#08080f' }}>
              {stepIdx === steps.length - 2 ? 'Generate my plan →' : 'Continue →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
