"use client"
import { useGameStore } from '@/lib/gameStore'
import { useMultiplayerStore } from '@/lib/multiplayerStore'
import React from 'react'
import { PixelButton } from './PixelButton'
import { useEffect, useState } from 'react'

interface AttackDef {
  key: 'standard' | 'wealth_assault' | 'land_siege' | 'business_sabotage'
  label: string
  cost: string
  desc: string
  color: string
  cooldownMs: number
}

const ATTACKS: AttackDef[] = [
  { key: 'standard', label: 'STANDARD', cost: '15C', desc: 'Light raid, steal up to 10% WEALTH', color: 'bg-red-500', cooldownMs: 4 * 60 * 60 * 1000 },
  { key: 'wealth_assault', label: 'WEALTH ASSAULT', cost: '10W', desc: 'Heavy raid, bypass shield, steal up to 25%', color: 'bg-pink-500', cooldownMs: 12 * 60 * 60 * 1000 },
  { key: 'land_siege', label: 'LAND SIEGE', cost: '25W', desc: 'Major assault, bypass shield, steal up to 35%', color: 'bg-amber-500', cooldownMs: 24 * 60 * 60 * 1000 },
  { key: 'business_sabotage', label: 'SABOTAGE', cost: '25C', desc: 'Damage enemy business output (30%)', color: 'bg-purple-500', cooldownMs: 8 * 60 * 60 * 1000 }
]

function useBattleCooldowns() {
  const battleState = useGameStore(s => s.battleState)
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])

  const lastMap: Record<string, number> = {
    standard: (battleState as any).lastStandardAttack || 0,
    wealth_assault: (battleState as any).lastWealthAssault || 0,
    land_siege: (battleState as any).lastLandSiege || 0,
    business_sabotage: (battleState as any).lastBusinessSabotage || 0
  }
  const remaining: Record<string, number> = {}
  ATTACKS.forEach(a => {
    const last = lastMap[a.key] || 0
    const elapsed = now - last
    remaining[a.key] = Math.max(0, a.cooldownMs - elapsed)
  })
  return remaining
}

export function PixelAttackPanel({ onAttack }: { onAttack: (type: AttackDef['key'], targetId: string) => void }) {
  const credits = useGameStore(s => s.player.credits)
  const wealth = useGameStore(s => s.player.wealth)
  const warScore = useGameStore(s => s.player.warScore)
  const remaining = useBattleCooldowns()
  const bypassUntil = useGameStore(s => (s as any).bypassDefensesUntil)
  const defenseBypassActive = (bypassUntil || 0) > Date.now()
  const players = useMultiplayerStore(s => s.onlinePlayers)
  const bots = useGameStore(s => s.npcBots || [])
  const [targetId, setTargetId] = useState('')

  useEffect(() => {
    if (!targetId) {
      if (players.length) setTargetId(players[0].id)
      else if (bots.length) setTargetId(bots[0].id)
    }
  }, [players, bots, targetId])

  const calcSuccessChance = (attackType: AttackDef['key']) => {
    if (!targetId) return 0.6
  const target = players.find(p => p.id === targetId)
  const bot = bots.find(b => b.id === targetId)
  const targetWar = target ? target.battlePower || 1000 : bot ? bot.warScore : 1000
    let base = 0.6 + ((warScore - targetWar) / 2000)
    return Math.max(0.05, Math.min(0.95, base))
  }

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000)
    if (s < 60) return s + 's'
    const m = Math.floor(s/60)
    if (m < 60) return m + 'm'
    const h = Math.floor(m/60)
    return h + 'h'
  }

  const regenerateBots = useGameStore(s => s.regenerateBots)
  const showDev = typeof window !== 'undefined' && (window.location.search.includes('dev=1') || process.env.NODE_ENV !== 'production')
  return (
    <div className="bg-slate-800/90 border-2 border-slate-600 p-4 font-mono">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-red-500 rounded-sm" />
        <h3 className="text-red-300 text-sm font-bold flex-1">ATTACK PANEL</h3>
        {showDev && (
          <button
            onClick={() => regenerateBots && regenerateBots()}
            title="Regenerate bot targets"
            className="text-[9px] px-2 py-1 border border-slate-600 rounded bg-slate-700/60 hover:bg-slate-600/60 text-slate-300"
          >REFRESH BOTS</button>
        )}
      </div>
      <div className="mb-3 text-[10px] flex flex-col gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-slate-400">TARGET</span>
          <select value={targetId} onChange={e => setTargetId(e.target.value)} className="bg-slate-700 border border-slate-600 px-2 py-1 text-[11px] outline-none">
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.username} ({p.wealth}W)</option>
            ))}
            {bots.length > 0 && players.length > 0 && <optgroup label="────────" />}
            {bots.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.wealth}W) [BOT]</option>
            ))}
          </select>
        </label>
        {targetId && (
          <div className="text-slate-500">
            Success chances are estimated per attack. WAR diff adjusts ±. (Base 60%)
          </div>
        )}
      </div>
      <div className="space-y-3 text-[11px]">
        {ATTACKS.map(a => {
          const rem = remaining[a.key]
          const disabled = rem > 0 || (a.key === 'standard' && credits < 15) || (a.key === 'business_sabotage' && credits < 25) || (a.key === 'wealth_assault' && wealth < 10) || (a.key === 'land_siege' && wealth < 25)
          const chance = calcSuccessChance(a.key)
          return (
            <div key={a.key} className="border border-slate-600 p-2 bg-slate-700/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 ${a.color} rounded-sm`} />
                  <span className="font-semibold text-slate-200">{a.label}</span>
                </div>
                <span className="text-slate-400">{a.cost}</span>
              </div>
              <div className="text-slate-400 mb-2 flex justify-between gap-2">
                <span className="truncate">{a.desc}</span>
                <span className="text-emerald-300 shrink-0">{Math.round(chance*100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <PixelButton size="sm" disabled={disabled || !targetId} onClick={() => !disabled && targetId && onAttack(a.key, targetId)} className="px-2 py-1">{rem>0 ? fmt(rem) : 'EXECUTE'}</PixelButton>
                {a.key !== 'wealth_assault' && a.key !== 'land_siege' && !defenseBypassActive && <span className="text-[10px] text-slate-500">Shield blocks</span>}
                {(a.key === 'wealth_assault' || a.key === 'land_siege' || defenseBypassActive) && <span className="text-[10px] text-emerald-400">Bypasses shield</span>}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 text-[10px] text-slate-500 leading-snug">
        Successful theft transfers a portion of target $WEALTH. Sabotage applies cumulative business damage (reducing work multiplier contribution).
      </div>
    </div>
  )
}
