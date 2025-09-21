"use client"
import React from 'react'
import { useGameStore } from '@/lib/gameStore'
import { calculateActiveSynergies, calculateSynergyEffects, getSynergyProgressTowardsNext } from '@/app/lib/synergies'

export const PixelSynergyBreakdown: React.FC = () => {
  const activeSlots = useGameStore(s => s.activeSlots)
  const synergies = calculateActiveSynergies(activeSlots)
  const effects = calculateSynergyEffects(synergies)
  const inactiveProgress = getSynergyProgressTowardsNext(activeSlots).slice(0, 4) // cap to top 4 closest

  return (
    <div className="space-y-3">
      {synergies.length > 0 ? (
        <div className="grid gap-2">
          {synergies.map(s => (
            <div key={s.id} className="border border-green-600/50 bg-green-900/20 p-2 rounded">
              <div className="flex items-center justify-between text-xs font-semibold text-green-200">
                <span className="flex items-center gap-1">{s.emoji}<span>{s.name}</span></span>
                <span className="text-[10px] opacity-70">P{ s.priority }</span>
              </div>
              <div className="text-[10px] text-green-300 mt-1 leading-snug">{s.description}</div>
              <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-emerald-300">
                {s.effects.workMultiplierBonus ? <span>+{s.effects.workMultiplierBonus}% WORK</span> : null}
                {s.effects.attackSuccessBonus ? <span>+{s.effects.attackSuccessBonus}% ATK%</span> : null}
                {s.effects.defenseBonus ? <span>+{s.effects.defenseBonus}% DEF</span> : null}
                {s.effects.wealthTheftBonus ? <span>+{s.effects.wealthTheftBonus}% THEFT</span> : null}
                {s.effects.dailyWealthBonus ? <span>+{s.effects.dailyWealthBonus}W/DAY</span> : null}
                {s.effects.counterAttackBonus ? <span>+{s.effects.counterAttackBonus}% COUNTER</span> : null}
                {s.effects.wealthLossReduction ? <span>-{s.effects.wealthLossReduction}% LOSS</span> : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-[11px] text-slate-400">No active synergies yet. Activate compatible enhanced businesses.</div>
      )}
      <div className="text-[10px] text-emerald-400/80 border-t border-emerald-800/40 pt-2">
        <span className="font-semibold">Totals:</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {effects.workMultiplierBonus ? <span>Work +{effects.workMultiplierBonus}%</span> : null}
          {effects.attackSuccessBonus ? <span>Atk +{effects.attackSuccessBonus}%</span> : null}
          {effects.defenseBonus ? <span>Def +{effects.defenseBonus}%</span> : null}
          {effects.wealthTheftBonus ? <span>Theft +{effects.wealthTheftBonus}%</span> : null}
          {effects.dailyWealthBonus ? <span>Daily +{effects.dailyWealthBonus}W</span> : null}
          {effects.counterAttackBonus ? <span>Counter +{effects.counterAttackBonus}%</span> : null}
          {effects.wealthLossReduction ? <span>Loss -{effects.wealthLossReduction}%</span> : null}
        </div>
      </div>
      {inactiveProgress.length > 0 && (
        <div className="mt-3 border-t border-emerald-800/40 pt-3">
          <div className="text-[10px] font-semibold text-green-300 mb-2">Incoming Synergies Progress</div>
          <div className="space-y-2">
            {inactiveProgress.map(row => {
              const perc = parseInt(row.progress.split('%')[0])
              return (
                <div key={row.synergy.id} className="p-2 rounded border border-slate-600/50 bg-slate-800/40">
                  <div className="flex items-center justify-between text-[10px] font-medium text-slate-200">
                    <span className="flex items-center gap-1">{row.synergy.emoji}<span>{row.synergy.name}</span></span>
                    <span className="text-slate-400">{row.progress}</span>
                  </div>
                  <div className="h-1 mt-1 bg-slate-700 rounded overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600" style={{ width: perc + '%' }} />
                  </div>
                  {row.missingRequirements.length > 0 && (
                    <div className="mt-1 text-[9px] text-slate-400 flex flex-wrap gap-1">
                      {row.missingRequirements.map(m => <span key={m}>{m}</span>)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
