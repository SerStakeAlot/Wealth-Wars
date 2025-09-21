"use client"
import { useEffect, useState } from 'react'
import { useNotificationStore, AppNotification } from '@/lib/notificationStore'

// Simple heuristic: treat any notification with attack/defend/shield keywords or type=warning/error related to battle as battle feed entry
function isBattleNotification(n: AppNotification) {
  const t = (n.title + ' ' + (n.message || '')).toLowerCase()
  return /attack|attacked|defend|defended|shield|raid|battle|achievement/.test(t)
}

// Determine a style variant for richer pixel feed highlighting
function classify(n: AppNotification): { variant: string; icon: string } {
  const title = n.title.toLowerCase()
  const msg = (n.message || '').toLowerCase()
  if (title.includes('attack report')) return { variant: 'attack-report', icon: '⚔️' }
  if (/shield/.test(title) || /shield/.test(msg)) return { variant: 'shield', icon: '🛡️' }
  if (title.includes('achievement claimed')) return { variant: 'achievement', icon: '🏆' }
  if (/success|stole|damage/.test(msg) || /attack/.test(title)) return { variant: 'attack', icon: '⚔️' }
  if (/defend|defended/.test(title)) return { variant: 'defense', icon: '🛡️' }
  return { variant: 'generic', icon: '⚔️' }
}

export function PixelBattleFeed() {
  const notifications = useNotificationStore(s => s.notifications)
  const [now, setNow] = useState(Date.now())
  const [filters, setFilters] = useState({ attack: true, defense: true, achievement: true, shield: true })
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 10000); return () => clearInterval(id) }, [])
  // Hydrate filters
  useEffect(() => {
    try { const raw = localStorage.getItem('ww_pixel_battleFilters'); if (raw) {
      const parsed = JSON.parse(raw)
      setFilters(f => ({ ...f, ...parsed }))
    }} catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem('ww_pixel_battleFilters', JSON.stringify(filters)) } catch {}
  }, [filters])

  const allBattle = notifications.filter(isBattleNotification).slice(0, 100)
  const battle = allBattle.filter(n => {
    const { variant } = classify(n)
    if (variant === 'attack-report' || variant === 'attack') return filters.attack
    if (variant === 'defense') return filters.defense
    if (variant === 'achievement') return filters.achievement
    if (variant === 'shield') return filters.shield
    return true
  }).slice(0, 25)

  if (!battle.length) {
    return <div className="text-xs text-slate-400 text-center py-4">No recent battle activity</div>
  }

  const formatTimeAgo = (ts: number) => {
    const diff = Math.max(0, now - ts)
    const s = Math.floor(diff / 1000)
    if (s < 60) return s + 's'
    const m = Math.floor(s/60)
    if (m < 60) return m + 'm'
    const h = Math.floor(m/60)
    return h + 'h'
  }

  return (
    <div className="text-[11px] space-y-1 max-h-72 overflow-y-auto pr-1">
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur border border-slate-600 rounded px-2 py-1 mb-1 flex flex-wrap gap-2">
        {(['attack','defense','achievement','shield'] as const).map(key => (
          <button
            key={key}
            onClick={() => setFilters(f => ({ ...f, [key]: !f[key] }))}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition ${filters[key] ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200' : 'bg-slate-700/40 border-slate-600 text-slate-400 line-through'}`}
          >{key.toUpperCase()}</button>
        ))}
      </div>
      {battle.length === 0 && (
        <div className="text-slate-500 italic text-xs py-2">No recent battle events. Use the ATTACK panel to initiate one.</div>
      )}
      {battle.map(n => {
        const { variant, icon } = classify(n)
        const base = 'text-[10px] flex justify-between gap-2 px-2 py-1 rounded border overflow-hidden'
        const styleByVariant: Record<string,string> = {
          'attack-report': 'bg-gradient-to-r from-rose-800/60 to-rose-700/30 border-rose-500/60 shadow-[0_0_6px_-1px_rgba(244,63,94,0.5)]',
          'attack': 'bg-rose-900/30 border-rose-600/50',
          'defense': 'bg-blue-900/30 border-blue-600/50',
          'shield': 'bg-indigo-900/30 border-indigo-500/50',
          'achievement': 'bg-amber-900/30 border-amber-500/60 animate-pulse',
          'generic': 'bg-slate-700/40 border-slate-600'
        }
        const cls = `${base} ${styleByVariant[variant] || styleByVariant.generic}`
        return (
          <div key={n.id} className={cls}>
            <div className="truncate flex-1">
              <span className="mr-1" aria-hidden>{icon}</span>
              <span className="font-semibold text-slate-200">{n.title}</span>
              {n.message && <span className="text-slate-300">: {n.message}</span>}
            </div>
            <span className="text-slate-400 shrink-0">{formatTimeAgo(n.createdAt)}</span>
          </div>
        )
      })}
    </div>
  )
}