"use client"
import React, { useMemo } from 'react'
import { useGameStore } from '@/lib/gameStore'

// Minimal pixel style achievements panel using dynamic tier system
// Shows claimed history (dim) and next unclaimed tier per chain.
export const PixelAchievements: React.FC = () => {
  const getActiveAchievementStages = useGameStore(s => s.getActiveAchievementStages)
  const claimAchievement = useGameStore(s => s.claimAchievement as (id: string) => { success: boolean; reason?: string })
  const stages = getActiveAchievementStages ? getActiveAchievementStages() : []

  const chainsOrdered = ['business_owned','credits_earned','battles_won'] as const
  const grouped = useMemo(() => {
    return chainsOrdered.map(chain => ({
      chain,
      rows: stages.filter(s => s.chain === chain).sort((a,b)=>a.order-b.order)
    }))
  }, [stages])

  return (
    <div className="pixel-panel space-y-4">
      <h2 className="text-sm font-bold tracking-wide bg-black/50 px-2 py-1 rounded">ACHIEVEMENTS</h2>
      {grouped.map(({ chain, rows }) => {
        return (
          <div key={chain} className="space-y-1">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-amber-300 mt-2">{chain.replace('_',' ')}</div>
            {rows.map(r => {
              const lockedFuture = !r.claimed && !r.unlocked
              const pct = r.progress
              return (
                <div key={r.id} className={`flex items-center gap-2 px-2 py-1 rounded border text-xs transition ${r.claimed ? 'opacity-40 border-green-600 bg-green-900/20' : r.unlocked ? 'border-yellow-500 bg-yellow-900/20 animate-pulse' : 'border-neutral-700 bg-neutral-800/40'} ${lockedFuture ? 'grayscale' : ''}`}> 
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate max-w-[120px]" title={r.description}>{r.name}</span>
                      <span className="text-[10px] tabular-nums">{pct}%</span>
                    </div>
                    <div className="w-full h-1 bg-neutral-700 rounded overflow-hidden mt-1">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: pct + '%' }} />
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-1 flex flex-wrap gap-1">
                      {r.reward.credits ? <span>+{r.reward.credits}C</span> : null}
                      {r.reward.wealth ? <span>+{r.reward.wealth}W</span> : null}
                      {r.reward.xp ? <span>+{r.reward.xp}XP</span> : null}
                      {r.reward.shieldHours ? <span>Shield {r.reward.shieldHours}h</span> : null}
                    </div>
                  </div>
                  <button
                    disabled={!r.unlocked || r.claimed}
                    onClick={() => claimAchievement(r.id)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold border shadow ${r.claimed ? 'border-neutral-600 text-neutral-500' : r.unlocked ? 'border-amber-400 text-amber-200 hover:bg-amber-500/20' : 'border-neutral-700 text-neutral-600'}`}
                  >
                    {r.claimed ? 'CLAIMED' : r.unlocked ? 'CLAIM' : 'LOCKED'}
                  </button>
                </div>
              )
            })}
          </div>
        )
      })}
      {stages.length === 0 && <div className="text-xs text-neutral-500">No achievement data.</div>}
    </div>
  )
}
