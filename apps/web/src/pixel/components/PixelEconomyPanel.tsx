"use client"
import React, { useMemo } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { calculateActiveSynergies, calculateSynergyEffects } from '@/app/lib/synergies'

// Displays treasury, exchange pool caps/remaining, rates, and passive daily wealth yield from synergies
export const PixelEconomyPanel: React.FC = () => {
  const treasury = useGameStore(s => s.treasuryReserve)
  const exchangePool = useGameStore(s => s.exchangePool)
  const conversionRate = useGameStore(s => s.conversionRate)
  const wealthToCreditsRate = useGameStore(s => s.wealthToCreditsRate)
  const activeSlots = useGameStore(s => s.activeSlots)
  const activeSynergies = calculateActiveSynergies(activeSlots)
  const synergyEffects = calculateSynergyEffects(activeSynergies)

  const resetsIn = exchangePool.resetAt - Date.now()
  const resetMins = Math.max(0, Math.floor(resetsIn / 60000))
  const resetStr = resetMins > 180 ? `${Math.floor(resetMins/60)}h` : `${resetMins}m`

  const globalRemaining = Math.max(0, exchangePool.globalDailyCapWealth - exchangePool.redeemedTodayWealth)
  const userRemaining = useMemo(() => {
    const pid = useGameStore.getState().player.id
    const userMinted = exchangePool.perUserRedeemedToday[pid] || 0
    return Math.max(0, exchangePool.userDailyCapWealth - userMinted)
  }, [exchangePool])

  return (
    <div className="bg-slate-800/90 border-2 border-slate-600 p-4 font-mono space-y-3">
      <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-emerald-400 rounded-sm" /><h3 className="text-emerald-300 text-sm font-bold">ECONOMY</h3></div>
      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <div>
          <div className="text-slate-400">Treasury Credits</div>
          <div className="font-semibold text-white tabular-nums">{treasury.credits.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-slate-400">Treasury $WEALTH</div>
            <div className="font-semibold text-white tabular-nums">{treasury.wealth.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-slate-400">Rate C → W</div>
          <div className="font-semibold text-white">{conversionRate}:1</div>
        </div>
        <div>
          <div className="text-slate-400">Rate W → C</div>
          <div className="font-semibold text-white">{wealthToCreditsRate}:1</div>
        </div>
        <div>
          <div className="text-slate-400">Pool Global Rem</div>
          <div className="font-semibold text-white">{globalRemaining} / {exchangePool.globalDailyCapWealth}</div>
        </div>
        <div>
          <div className="text-slate-400">Your Daily Rem</div>
          <div className="font-semibold text-white">{userRemaining} / {exchangePool.userDailyCapWealth}</div>
        </div>
        <div>
          <div className="text-slate-400">Resets In</div>
          <div className="font-semibold text-white">{resetStr}</div>
        </div>
        <div>
          <div className="text-slate-400">Synergy Passive</div>
          <div className="font-semibold text-white">{synergyEffects.dailyWealthBonus || 0} W / day</div>
        </div>
      </div>
      {activeSynergies.length > 0 && (
        <div className="text-[10px] text-emerald-400 mt-1">
          {activeSynergies.map(s => s.emoji).join(' ')}
        </div>
      )}
    </div>
  )
}
