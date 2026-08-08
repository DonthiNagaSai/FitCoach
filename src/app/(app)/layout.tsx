'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: GridIcon },
  { href: '/workouts', label: 'Workouts', icon: DumbbellIcon },
  { href: '/diet', label: 'Diet', icon: LeafIcon },
  { href: '/coach', label: 'AI Coach', icon: SparkleIcon },
  { href: '/progress', label: 'Progress', icon: ChartIcon },
  { href: '/settings', label: 'Settings', icon: GearIcon },
]

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  )
}
function DumbbellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v16M18 4v16M4 8h4M16 8h4M4 16h4M16 16h4M8 12h8"/>
    </svg>
  )
}
function LeafIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  )
}
function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
    </svg>
  )
}
function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}
function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 2L4 8v12l10 6 10-6V8L14 2z" fill="#c4ff47" fillOpacity="0.15" stroke="#c4ff47" strokeWidth="1.5"/>
      <path d="M14 7l-6 3.5v7L14 21l6-3.5v-7L14 7z" fill="#c4ff47" fillOpacity="0.3"/>
      <circle cx="14" cy="14" r="2.5" fill="#c4ff47"/>
    </svg>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userLabel, setUserLabel] = useState({ initials: '··', name: 'Loading…' })
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      const name = (user.user_metadata?.name as string) || user.email || 'You'
      const initials = name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
      setUserLabel({ initials, name })
    })
  }, [router, supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const currentPage = navItems.find(i => pathname?.startsWith(i.href))?.label ?? 'FitCoach AI'

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 220, background: 'var(--card)', borderRight: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <LogoMark />
          <div>
            <div className="font-display text-sm font-semibold" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>FitCoach</div>
            <div className="text-xs" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>AI-Powered</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname?.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${isActive ? 'font-medium' : 'font-normal'}`}
                style={{ background: isActive ? 'rgba(196,255,71,0.1)' : 'transparent', color: isActive ? '#c4ff47' : 'var(--muted-foreground)' }}
              >
                <Icon />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: 'rgba(196,255,71,0.2)', color: '#c4ff47' }}>
              {userLabel.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{userLabel.name}</div>
              <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>Welcome back</div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full mt-3 text-xs py-1.5 rounded-md transition-colors"
            style={{ color: 'var(--muted-foreground)', background: 'transparent', border: '1px solid var(--border)' }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="flex-1 flex flex-col lg:ml-[220px]">
        <header className="flex items-center justify-between px-4 py-3 lg:hidden" style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-md" style={{ color: 'var(--muted-foreground)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <span className="font-display text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{currentPage}</span>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: 'rgba(196,255,71,0.2)', color: '#c4ff47' }}>{userLabel.initials}</div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
