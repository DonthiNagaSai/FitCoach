'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const quickReplies = [
  'Make today easier',
  'What should I eat post-workout?',
  'How am I tracking vs my goal?',
  'Add a rest day this week',
  'Explain progressive overload',
]

export default function Coach() {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initialLoad, setInitialLoad] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setInitialLoad(false); return }
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (data && data.length > 0) {
        setMessages(data.map(m => ({ id: m.id, role: m.role, content: m.content, timestamp: new Date(m.created_at) })))
      } else {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: "Hey! 👋 I'm your FitCoach AI. Ask me anything about your plan, progress, or how you're feeling today — I've got context on your profile and current plan.",
          timestamp: new Date(),
        }])
      }
      setInitialLoad(false)
    })()
  }, [supabase])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (content: string) => {
    if (!content.trim() || loading) return
    setInput('')
    setError('')

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Coach failed to respond')

      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: json.reply, timestamp: new Date() }
      setMessages(prev => [...prev, aiMsg])

      if (user) {
        await supabase.from('chat_messages').insert([
          { user_id: user.id, role: 'user', content },
          { user_id: user.id, role: 'assistant', content: json.reply },
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const formatContent = (text: string) =>
    text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <p key={i} className={i > 0 ? 'mt-2' : ''} dangerouslySetInnerHTML={{ __html: bold }} />
    })

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 57px)' }}>
      <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(196,255,71,0.15)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4ff47" strokeWidth="1.8"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>FitCoach AI</div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#c4ff47]" />
            Online · Powered by Claude
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
        {initialLoad ? (
          <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading conversation…</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ background: 'rgba(196,255,71,0.15)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c4ff47" strokeWidth="1.8"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
                </div>
              )}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed" style={{ background: msg.role === 'user' ? '#c4ff47' : 'var(--secondary)', color: msg.role === 'user' ? '#08080f' : 'var(--foreground)' }}>
                  {formatContent(msg.content)}
                </div>
                <span className="text-xs px-1" style={{ color: 'var(--muted-foreground)' }}>{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ background: 'rgba(196,255,71,0.15)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c4ff47" strokeWidth="1.8"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
            </div>
            <div className="px-4 py-3 rounded-2xl text-sm" style={{ background: 'var(--secondary)', color: 'var(--foreground)' }}>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#c4ff47', animation: `blink 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        {error && <div className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(255,80,80,0.1)', color: '#ff6b6b' }}>{error}</div>}
        <div ref={endRef} />
      </div>

      <div className="px-4 md:px-8 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickReplies.map(r => (
            <button key={r} onClick={() => send(r)} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-8 pb-4">
        <div className="flex items-end gap-2 rounded-2xl p-2" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask your coach anything…"
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm px-2 py-1.5"
            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-body)', lineHeight: '1.5', maxHeight: 120 }}
          />
          <button onClick={() => send(input)} disabled={!input.trim() || loading} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 hover:scale-105" style={{ background: '#c4ff47' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#08080f" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--muted-foreground)' }}>Shift+Enter for new line · Enter to send</p>
      </div>
    </div>
  )
}
