'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Section = 'profile' | 'account'

const sectionLabels: Record<Section, string> = {
  profile: 'Profile',
  account: 'Account & Security',
}

interface ProfileForm {
  name: string
  email: string
  age: string
  weight: string
  height: string
  units: string
  goal: string
  activity_level: string
}

const emptyProfile: ProfileForm = { name: '', email: '', age: '', weight: '', height: '', units: 'metric', goal: '', activity_level: 'moderate' }

export default function Settings() {
  const supabase = createClient()
  const [activeSection, setActiveSection] = useState<Section>('profile')
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      setProfile({
        name: (user.user_metadata?.name as string) ?? '',
        email: user.email ?? '',
        age: data?.age?.toString() ?? '',
        weight: data?.weight?.toString() ?? '',
        height: data?.height?.toString() ?? '',
        units: data?.units ?? 'metric',
        goal: data?.goal ?? '',
        activity_level: data?.activity_level ?? 'moderate',
      })
      setLoading(false)
    })()
  }, [])

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({
      user_id: user.id,
      age: Number(profile.age) || null,
      weight: Number(profile.weight) || null,
      height: Number(profile.height) || null,
      units: profile.units,
      goal: profile.goal,
      activity_level: profile.activity_level,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return <div className="p-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading…</div>

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-mono mb-1" style={{ color: 'var(--muted-foreground)' }}>YOUR ACCOUNT</p>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <nav className="space-y-1">
          {(Object.keys(sectionLabels) as Section[]).map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all"
              style={{ background: activeSection === s ? 'rgba(196,255,71,0.1)' : 'transparent', color: activeSection === s ? '#c4ff47' : 'var(--muted-foreground)', border: `1px solid ${activeSection === s ? 'rgba(196,255,71,0.2)' : 'transparent'}` }}
            >
              {sectionLabels[s]}
            </button>
          ))}
        </nav>

        <div className="md:col-span-3 space-y-4">
          {activeSection === 'profile' && (
            <>
              <div className="glass rounded-2xl p-6">
                <div className="text-xs font-mono mb-5" style={{ color: 'var(--muted-foreground)' }}>PERSONAL DETAILS</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Full name</label>
                    <input value={profile.name} disabled className="w-full px-3 py-2.5 rounded-xl text-sm outline-none opacity-60" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Email</label>
                    <input value={profile.email} disabled className="w-full px-3 py-2.5 rounded-xl text-sm outline-none opacity-60" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  </div>
                  {[
                    { key: 'age', label: 'Age' },
                    { key: 'weight', label: `Weight (${profile.units === 'metric' ? 'kg' : 'lbs'})` },
                    { key: 'height', label: `Height (${profile.units === 'metric' ? 'cm' : 'in'})` },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                      <input
                        type="number"
                        value={profile[key as keyof ProfileForm]}
                        onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Units</label>
                    <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      {['metric', 'imperial'].map(u => (
                        <button key={u} onClick={() => setProfile(p => ({ ...p, units: u }))} className="flex-1 py-2.5 text-sm capitalize transition-all" style={{ background: profile.units === u ? '#c4ff47' : 'transparent', color: profile.units === u ? '#08080f' : 'var(--muted-foreground)' }}>
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="text-xs font-mono mb-5" style={{ color: 'var(--muted-foreground)' }}>FITNESS PROFILE</div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Primary goal</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ id: 'lose', label: '🔥 Lose fat' }, { id: 'build', label: '💪 Build muscle' }, { id: 'endurance', label: '🏃 Endurance' }, { id: 'maintain', label: '⚖️ Maintain' }].map(g => (
                        <button key={g.id} onClick={() => setProfile(p => ({ ...p, goal: g.id }))} className="py-2.5 rounded-xl text-sm transition-all" style={{ background: profile.goal === g.id ? 'rgba(196,255,71,0.1)' : 'var(--secondary)', border: `1px solid ${profile.goal === g.id ? '#c4ff47' : 'var(--border)'}`, color: 'var(--foreground)' }}>
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Activity level</label>
                    <select value={profile.activity_level} onChange={e => setProfile(p => ({ ...p, activity_level: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                      <option value="sedentary">Sedentary</option>
                      <option value="light">Lightly active</option>
                      <option value="moderate">Moderately active</option>
                      <option value="very">Very active</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={saveProfile} className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: '#c4ff47', color: '#08080f' }}>
                  Save changes
                </button>
                {saved && <span className="text-sm" style={{ color: '#c4ff47' }}>✓ Saved!</span>}
              </div>
            </>
          )}

          {activeSection === 'account' && (
            <div className="glass rounded-2xl p-6">
              <div className="text-xs font-mono mb-4" style={{ color: 'var(--muted-foreground)' }}>ACCOUNT</div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Password changes and account deletion go through Supabase Auth. Add a password-reset flow via the &quot;Forgot password&quot; link on the login page, or wire up additional account management calls here as needed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
