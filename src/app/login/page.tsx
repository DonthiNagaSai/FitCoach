'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function Login() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      <div className="hidden lg:flex flex-col justify-between w-96 p-10 mesh-bg" style={{ borderRight: '1px solid var(--border)' }}>
        <div>
          <div className="flex items-center gap-2 mb-16">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L4 8v12l10 6 10-6V8L14 2z" fill="#c4ff47" fillOpacity="0.15" stroke="#c4ff47" strokeWidth="1.5"/>
              <circle cx="14" cy="14" r="2.5" fill="#c4ff47"/>
            </svg>
            <span className="font-display font-semibold" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>FitCoach AI</span>
          </div>
          <blockquote className="font-display text-2xl italic font-light" style={{ color: 'var(--foreground)', lineHeight: '1.5' }}>
            &quot;The best workout plan is the one that actually fits your life.&quot;
          </blockquote>
        </div>
        <div className="space-y-4">
          {['23-day streak maintained', 'AI-adjusted plan 3 times', 'Down 8.2 lbs in 6 weeks'].map(s => (
            <div key={s} className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ color: '#c4ff47' }}>✓</span> {s}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm fade-up">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold mb-2" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>Welcome back</h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Sign in to your FitCoach account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,80,80,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.2)' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jordan@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Password</label>
                <Link href="/forgot-password" className="text-xs" style={{ color: '#c4ff47' }}>Forgot password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 mt-2"
              style={{ background: '#c4ff47', color: '#08080f' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--muted-foreground)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#c4ff47' }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
