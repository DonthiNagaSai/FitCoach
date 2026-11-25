'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const features = [
  { icon: '⚡', title: 'AI-Generated Plans', desc: 'A 7-day workout split and a meal plan tailored to your body, goal, activity level and equipment. Regenerate it any time.' },
  { icon: '🤖', title: 'Conversational Coach', desc: 'Chat with an AI coach that knows your profile and current plan, and get specific answers instead of generic advice.' },
  { icon: '📈', title: 'Progress Tracking', desc: 'Log your weight and see the trend over time on a chart.' },
  { icon: '🥗', title: 'Smart Nutrition', desc: 'Meals built around your dietary restrictions, with daily calorie, protein, carb and fat targets.' },
  { icon: '📅', title: 'Weekly View', desc: 'See the full week of workouts at a glance, with sets, reps, weights and rest times for each exercise.' },
  { icon: '🔒', title: 'Private by Design', desc: 'Supabase Row Level Security means each account can only ever read and write its own data.' },
]

const steps = [
  { step: '1', title: 'Tell it about you', desc: 'Age, height, weight, goal, activity level, diet restrictions and the equipment you have.' },
  { step: '2', title: 'Get your plan', desc: 'The AI builds a 7-day workout split and a daily meal plan with calorie and macro targets.' },
  { step: '3', title: 'Ask your coach', desc: 'Chat with an AI coach that knows your profile and current plan, and log your weight to track progress.' },
]

const stats = [
  { value: '7-day', label: 'workout split in every plan' },
  { value: '4', label: 'daily macro targets' },
  { value: 'Free', label: 'to sign up and use' },
  { value: '<2min', label: 'to generate your first plan' },
]

function RotatingWord() {
  const words = ['stronger', 'leaner', 'faster', 'balanced', 'consistent']
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % words.length)
        setVisible(true)
      }, 300)
    }, 2500)
    return () => clearInterval(t)
  }, [])

  return (
    <span
      className="gradient-text font-display italic"
      style={{ display: 'inline-block', minWidth: '200px', transition: 'opacity 0.3s', opacity: visible ? 1 : 0 }}
    >
      {words[idx]}
    </span>
  )
}

export default function Landing() {
  const router = useRouter()

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <nav className="flex items-center justify-between px-6 md:px-16 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L4 8v12l10 6 10-6V8L14 2z" fill="#c4ff47" fillOpacity="0.15" stroke="#c4ff47" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="2.5" fill="#c4ff47"/>
          </svg>
          <span className="font-display font-semibold text-base" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>FitCoach AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/login')} className="px-4 py-2 text-sm rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)', background: 'transparent' }}>
            Sign in
          </button>
          <button onClick={() => router.push('/signup')} className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:scale-105" style={{ background: '#c4ff47', color: '#08080f' }}>
            Get started free
          </button>
        </div>
      </nav>

      <section className="mesh-bg relative px-6 md:px-16 pt-24 pb-32 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(196,255,71,0.04) 1.2px, transparent 1.2px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-4xl mx-auto fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-8" style={{ background: 'rgba(196,255,71,0.1)', color: '#c4ff47', border: '1px solid rgba(196,255,71,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#c4ff47] animate-pulse" />
            Powered by Llama 3.3 on Groq · Portfolio demo
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-semibold mb-4" style={{ color: 'var(--foreground)', letterSpacing: '-0.04em', lineHeight: '1.05' }}>
            Become{' '}
            <RotatingWord />
            <br />
            <span style={{ color: 'var(--foreground)' }}>with a coach that learns.</span>
          </h1>

          <p className="text-lg md:text-xl mt-8 mb-10 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)', lineHeight: '1.65' }}>
            FitCoach AI builds a personalized workout and diet plan from your profile, then answers your questions through chat with your plan as context.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => router.push('/signup')} className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 glow-primary" style={{ background: '#c4ff47', color: '#08080f' }}>
              Build my first plan — free
            </button>
            <button onClick={() => router.push('/dashboard')} className="px-8 py-3.5 rounded-xl text-sm font-medium transition-colors" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
              See a demo →
            </button>
          </div>

          <p className="mt-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>No credit card required · Free portfolio demo</p>
        </div>

        <div className="relative max-w-5xl mx-auto mt-20">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
            <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
              <span className="ml-3 text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>fitcoach.ai/dashboard</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
              <div className="col-span-2 p-6" style={{ background: 'var(--card)' }}>
                <div className="text-xs font-mono mb-4" style={{ color: 'var(--muted-foreground)' }}>TODAY&apos;S WORKOUT — PUSH DAY</div>
                {['Bench Press 4×8 @ 80%', 'Overhead Press 3×10', 'Incline DB Fly 3×12', 'Tricep Dips 3×failure', 'Cable Lateral Raise 4×15'].map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="w-4 h-4 rounded flex items-center justify-center text-xs" style={{ background: i < 2 ? '#c4ff47' : 'var(--secondary)', border: i < 2 ? 'none' : '1px solid var(--border)' }}>
                      {i < 2 && <svg width="8" height="8" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#08080f" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
                    </div>
                    <span className="text-sm" style={{ color: i < 2 ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: i < 2 ? 'line-through' : 'none' }}>{ex}</span>
                  </div>
                ))}
              </div>
              <div className="p-6" style={{ background: 'var(--card)' }}>
                <div className="text-xs font-mono mb-4" style={{ color: 'var(--muted-foreground)' }}>DAILY MACROS</div>
                {[{ label: 'Protein', val: 162, max: 180, color: '#c4ff47' }, { label: 'Carbs', val: 210, max: 280, color: '#ff8c42' }, { label: 'Fat', val: 68, max: 80, color: '#a78bfa' }].map(m => (
                  <div key={m.label} className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                      <span>{m.label}</span>
                      <span className="font-mono">{m.val}g</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--secondary)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(m.val/m.max)*100}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
                <div className="mt-6 p-3 rounded-xl text-xs" style={{ background: 'rgba(196,255,71,0.08)', border: '1px solid rgba(196,255,71,0.15)' }}>
                  <div className="font-medium mb-1" style={{ color: '#c4ff47' }}>AI Coach</div>
                  <span style={{ color: 'var(--muted-foreground)' }}>Great push session today! Based on your plan, I&apos;d keep tomorrow light and focus on mobility...</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-12 blur-3xl rounded-full" style={{ background: 'rgba(196,255,71,0.15)' }} />
        </div>
      </section>

      <section className="px-6 md:px-16 py-16" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl md:text-4xl font-semibold gradient-text mb-2">{s.value}</div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-16 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono mb-4" style={{ color: '#c4ff47', letterSpacing: '0.1em' }}>WHAT&apos;S INCLUDED</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>
              Everything you need.<br />
              <span className="gradient-text italic">Nothing you don&apos;t.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(f => (
              <div key={f.title} className="glass p-6 rounded-2xl hover:border-[rgba(196,255,71,0.2)] transition-all group" style={{ borderColor: 'var(--border)' }}>
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-16 py-24" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-semibold" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>How it works.<br /><span className="gradient-text italic">Three steps.</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map(st => (
              <div key={st.step} className="glass p-6 rounded-2xl">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold mb-4" style={{ background: 'rgba(196,255,71,0.15)', color: '#c4ff47' }}>{st.step}</div>
                <div className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>{st.title}</div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--card-foreground)' }}>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-16 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-12 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(196,255,71,0.08) 0%, rgba(255,140,66,0.05) 100%)', border: '1px solid rgba(196,255,71,0.15)' }}>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>Your plan is waiting.</h2>
            <p className="mb-8" style={{ color: 'var(--muted-foreground)' }}>Answer 8 quick questions. Get a full workout and diet plan in under 2 minutes.</p>
            <button onClick={() => router.push('/signup')} className="px-10 py-4 rounded-xl font-semibold transition-all hover:scale-105 glow-primary" style={{ background: '#c4ff47', color: '#08080f' }}>
              Start for free →
            </button>
          </div>
        </div>
      </section>

      <footer className="px-6 md:px-16 py-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-display text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>FitCoach AI</span>
          <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>© 2026 · Built with Next.js, Supabase and Groq</span>
        </div>
      </footer>
    </div>
  )
}
