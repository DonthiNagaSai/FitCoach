'use client'

import { useEffect, useState } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { createClient } from '@/lib/supabase/client'

const customTooltipStyle = {
  background: '#1e1e2a',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  color: '#e8e8f0',
  fontSize: 12,
  fontFamily: 'DM Mono, monospace',
}

interface WeightLog {
  id: string
  weight: number
  logged_at: string
}

export default function Progress() {
  const supabase = createClient()
  const [logs, setLogs] = useState<WeightLog[]>([])
  const [loading, setLoading] = useState(true)
  const [newWeight, setNewWeight] = useState('')
  const [logged, setLogged] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: true })
    setLogs(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const logWeight = async () => {
    if (!newWeight) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('weight_logs').insert({ user_id: user.id, weight: Number(newWeight) })
    setLogged(true)
    setNewWeight('')
    await load()
    setTimeout(() => setLogged(false), 2000)
  }

  const chartData = logs.map(l => ({
    date: new Date(l.logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: l.weight,
  }))

  const starting = logs[0]?.weight
  const current = logs[logs.length - 1]?.weight
  const delta = starting != null && current != null ? (current - starting).toFixed(1) : null

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-mono mb-1" style={{ color: 'var(--muted-foreground)' }}>YOUR TRACKING</p>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>Progress</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Starting weight', value: starting != null ? `${starting}kg` : '—' },
          { label: 'Current weight', value: current != null ? `${current}kg` : '—', sub: delta != null ? `${Number(delta) > 0 ? '+' : ''}${delta}kg total` : undefined, color: '#c4ff47' },
          { label: 'Entries logged', value: `${logs.length}` },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="text-xs font-mono mb-2" style={{ color: 'var(--muted-foreground)' }}>{s.label.toUpperCase()}</div>
            <div className="font-display text-xl font-semibold" style={{ color: s.color ?? 'var(--foreground)', letterSpacing: '-0.02em' }}>{s.value}</div>
            {s.sub && <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5 mb-6">
        <div className="text-xs font-mono mb-2" style={{ color: 'var(--muted-foreground)' }}>LOG TODAY&apos;S WEIGHT</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            placeholder="82.4"
            className="w-28 px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>kg</span>
          <button onClick={logWeight} className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: '#c4ff47', color: '#08080f' }}>
            Log
          </button>
          {logged && <span className="text-xs" style={{ color: '#c4ff47' }}>✓ Logged!</span>}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="text-xs font-mono mb-4" style={{ color: 'var(--muted-foreground)' }}>WEIGHT TREND (kg)</div>
        {loading ? (
          <div className="text-sm py-10 text-center" style={{ color: 'var(--muted-foreground)' }}>Loading…</div>
        ) : chartData.length === 0 ? (
          <div className="text-sm py-10 text-center" style={{ color: 'var(--muted-foreground)' }}>Log your weight to start seeing a trend here.</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c4ff47" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#c4ff47" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#7070a0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7070a0', fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 0.5', 'dataMax + 0.3']} />
              <Tooltip contentStyle={customTooltipStyle} cursor={{ stroke: 'rgba(196,255,71,0.2)' }} formatter={(v) => [`${v}kg`, 'Weight']} />
              <Area type="monotone" dataKey="weight" stroke="#c4ff47" strokeWidth={2} fill="url(#weightGrad)" dot={{ fill: '#c4ff47', r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
