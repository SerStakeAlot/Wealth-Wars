"use client"
import { useEffect, useMemo, useState } from 'react'
import { useMultiplayerStore } from '@/lib/multiplayerStore'
import { useGameStore } from '@/lib/gameStore'

type SortKey = 'wealth' | 'war' | 'credits'

export function PixelLeaderboard() {
  const players = useMultiplayerStore(s => s.onlinePlayers)
  const localPlayer = useGameStore(s => s.player)
  const [sortKey, setSortKey] = useState<SortKey>('wealth')
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(id) }, [])

  const data = useMemo(() => {
    const base = players && players.length ? players : [{ id: localPlayer.id, username: 'You', wealth: localPlayer.wealth, credits: localPlayer.credits, battlePower: localPlayer.warScore, lastSeen: Date.now(), isOnline: true } as any]
    return base.map(p => ({
      id: p.id,
      name: p.username || p.id,
      wealth: p.wealth || 0,
      credits: p.credits || 0,
      war: p.battlePower || 0,
      lastSeen: p.lastSeen || Date.now(),
      online: p.isOnline
    }))
  }, [players, localPlayer])

  const sorted = useMemo(() => {
    const copy = [...data]
    copy.sort((a,b) => (b as any)[sortKey] - (a as any)[sortKey])
    return copy.slice(0, 10)
  }, [data, sortKey])

  const rankOfLocal = sorted.findIndex(p => p.id === localPlayer.id)

  const fmtAgo = (ts: number) => {
    const diff = Math.max(0, now - ts)
    const m = Math.floor(diff/60000)
    if (m < 1) return 'now'
    if (m < 60) return m + 'm'
    const h = Math.floor(m/60)
    return h + 'h'
  }

  const headers: { key: SortKey; label: string }[] = [
    { key: 'wealth', label: 'WEALTH' },
    { key: 'war', label: 'WAR' },
    { key: 'credits', label: 'CREDITS' }
  ]

  return (
    <div className="bg-slate-800/90 border-2 border-slate-600 p-4 font-mono">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded-sm" /><h3 className="text-green-300 text-sm font-bold">LEADERBOARD</h3></div>
        <div className="flex gap-1">
          {headers.map(h => (
            <button key={h.key} onClick={() => setSortKey(h.key)} className={`text-[10px] px-2 py-1 border ${sortKey===h.key? 'bg-green-500/20 border-green-400 text-green-300':'bg-slate-700/40 border-slate-600 text-slate-400 hover:text-white'}`}>{h.label}</button>
          ))}
        </div>
      </div>
      <div className="text-[10px] grid grid-cols-5 gap-2 text-slate-400 mb-1">
        <div>RANK</div><div>PLAYER</div><div className="text-right">WEALTH</div><div className="text-right">WAR</div><div className="text-right">CREDITS</div>
      </div>
      <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
        {sorted.map((p, idx) => {
          const isSelf = p.id === localPlayer.id
          return (
            <div key={p.id} className={`grid grid-cols-5 gap-2 text-[10px] items-center px-2 py-1 border ${isSelf? 'border-green-400 bg-green-500/10':'border-slate-600 bg-slate-700/30'}`}>
              <div className="font-bold text-slate-300">#{idx+1}</div>
              <div className="truncate flex items-center gap-1">{p.name}{p.online && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}</div>
              <div className="text-right text-slate-200">{p.wealth.toLocaleString()}</div>
              <div className="text-right text-slate-200">{p.war}</div>
              <div className="text-right text-slate-400">{p.credits}</div>
            </div>
          )
        })}
        {sorted.length === 0 && <div className="text-center text-[10px] text-slate-500 py-4">No players</div>}
      </div>
      {rankOfLocal === -1 && (
        <div className="mt-2 text-[10px] text-slate-500">You are outside top 10.</div>
      )}
      <div className="mt-2 text-[9px] text-slate-500">Sorted by {sortKey.toUpperCase()} • updates every 30s</div>
    </div>
  )
}
