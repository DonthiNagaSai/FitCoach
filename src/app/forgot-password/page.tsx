'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPassword() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 mesh-bg">
      <div className="w-full max-w-sm fade-up">
        <div className="glass rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(196,255,71,0.1)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c4ff47" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h2 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Check your inbox</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>We&apos;ve sent a reset link to <strong style={{ color: 'var(--foreground)' }}>{email}</strong>.</p>
              <Link href="/login" className="text-sm" style={{ color: '#c4ff47' }}>← Back to sign in</Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="font-display text-2xl font-semibold mb-1.5" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>Reset password</h1>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Enter your email and we&apos;ll send you a link</p>
              </div>
              {error && (
                <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ background: 'rgba(255,80,80,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.2)' }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jordan@example.com"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: '#c4ff47', color: '#08080f' }}
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
              <p className="text-center text-sm mt-5" style={{ color: 'var(--muted-foreground)' }}>
                <Link href="/login" style={{ color: '#c4ff47' }}>← Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
