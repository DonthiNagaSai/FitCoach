'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function Signup() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required'
    if (form.password.length < 8) e.password = 'At least 8 characters'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name } },
    })
    setLoading(false)
    if (error) { setErrors({ email: error.message }); return }
    router.push('/onboarding')
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value })),
    className: 'w-full px-4 py-3 rounded-xl text-sm outline-none transition-all',
    style: { background: 'var(--secondary)', border: `1px solid ${errors[key] ? 'rgba(255,80,80,0.4)' : 'var(--border)'}`, color: 'var(--foreground)' } as React.CSSProperties,
  })

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 mesh-bg">
      <div className="w-full max-w-sm fade-up">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L4 8v12l10 6 10-6V8L14 2z" fill="#c4ff47" fillOpacity="0.15" stroke="#c4ff47" strokeWidth="1.5"/>
              <circle cx="14" cy="14" r="2.5" fill="#c4ff47"/>
            </svg>
            <span className="font-display font-semibold" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>FitCoach AI</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="mb-7">
            <h1 className="font-display text-2xl font-semibold mb-1.5" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>Create your account</h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Free forever for personal use</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Full name</label>
              <input type="text" placeholder="Jordan Smith" {...field('name')} />
              {errors.name && <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Email</label>
              <input type="email" placeholder="jordan@example.com" {...field('email')} />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Password</label>
              <input type="password" placeholder="Min. 8 characters" {...field('password')} />
              {errors.password && <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-60 mt-2"
              style={{ background: '#c4ff47', color: '#08080f' }}
            >
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--muted-foreground)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#c4ff47' }}>Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
          By signing up you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  )
}
