"use client"
import React, { useEffect } from 'react'
import { useGameStore } from '@/lib/gameStore'

interface LevelUnlockModalProps {
  open: boolean
  onClose: () => void
}

// Centralized perk computation mirroring logic in gameStore _applyWork
function getLevelPerks(level: number) {
  const perks: string[] = []
  if ([5,10,15].includes(level)) perks.push(`Enhanced Slot ${[5,10,15].indexOf(level)+2} Unlocked`)
  if (level % 5 === 0) perks.push('+1 Base Defense (cumulative)')
  const shieldDisc = Math.min(30, Math.floor(level / 5) * 5)
  if (shieldDisc > 0 && level % 5 === 0) perks.push(`Shield Cost Discount now ${shieldDisc}%`)
  if (level % 5 === 0) perks.push('Exchange Daily Cap Increased')
  if (level % 5 === 0) perks.push('Work Multiplier Bonus Step')
  return perks
}

export const LevelUnlockModal: React.FC<LevelUnlockModalProps> = ({ open, onClose }) => {
  const level = useGameStore(s => s.player.level)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])
  if (!open) return null
  const upcoming = [] as Array<{ lvl: number; perks: string[] }>
  for (let l = level; l <= level + 15; l++) {
    const perks = getLevelPerks(l)
    if (perks.length > 0 || l === level) upcoming.push({ lvl: l, perks })
  }
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto bg-slate-900 border-2 border-cyan-600 rounded-lg shadow-xl p-5 font-mono text-[11px] animate-fadeIn">
        <h2 className="text-cyan-300 font-bold text-sm mb-3">LEVEL {level} PROGRESSION</h2>
        <p className="text-slate-300 mb-4 leading-snug">Each 5 levels trigger key milestone perks. This panel shows recent and upcoming unlocks plus core formulas.</p>
        <div className="max-h-64 overflow-auto pr-1 space-y-2">
          {upcoming.map(row => (
            <div key={row.lvl} className={`border p-2 rounded ${row.lvl===level?'border-cyan-500 bg-cyan-500/10':'border-slate-600 bg-slate-800/60'}`}> 
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Level {row.lvl}</span>
                {row.lvl===level && <span className="text-cyan-400 text-[10px]">CURRENT</span>}
              </div>
              {row.perks.length ? (
                <ul className="list-disc ml-4 mt-1 space-y-0.5 text-slate-300">{row.perks.map(p=> <li key={p}>{p}</li>)}</ul>
              ) : <div className="text-slate-500 text-[10px] mt-1">Progress scaling only</div>}
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-slate-700 pt-3 space-y-1 text-slate-300">
          <div><span className="text-slate-400">Level Formula:</span> floor(xp / 1000) + 1</div>
          <div><span className="text-slate-400">Work XP:</span> 25 + (workStreak * 2)</div>
          <div><span className="text-slate-400">User Exchange Cap Growth:</span> +1 per 2 levels to 40, then +1 per 5</div>
          <div><span className="text-slate-400">Shield Discount:</span> 5% every 5 levels (cap 30%)</div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 text-[10px] rounded border border-cyan-500 text-cyan-300 hover:bg-cyan-600/20">CLOSE (ESC)</button>
        </div>
      </div>
    </div>
  )
}
