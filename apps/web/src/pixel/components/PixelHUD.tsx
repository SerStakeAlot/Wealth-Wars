"use client"
import { motion } from 'framer-motion'
import { pixelMotionVariants, pixelTransitions } from '../lib/motionVariants'
import { PixelGameState } from '../lib/types'
import { useGameStore } from '@/lib/gameStore'

export function PixelHUD({ gameState }: { gameState: PixelGameState }) {
  // Use granular selectors to keep referential stability and avoid warning about getSnapshot loops
  const workMult = useGameStore(s => s.getWorkMultiplier?.() || 0)
  const damage = useGameStore(s => s.battleState.businessDamage)
  const credits = useGameStore(s => s.player.credits)
  const activeSlots = useGameStore(s => s.activeSlots)
  const businesses = useGameStore(s => s.businesses)
  const enhancedBusinesses = useGameStore(s => s.enhancedBusinesses)
  const enhancedOwned = enhancedBusinesses.filter(b => b.owned && activeSlots.includes(b.id))
  const basic = businesses.reduce((acc, b) => acc + b.workMultiplier * b.outlets, 0)
  let enhancedTotal = 0
  enhancedOwned.forEach(b => { const cond = (b as any).condition ?? 100; enhancedTotal += Math.floor(b.workMultiplier * (cond/100)) })
  const govBonus = enhancedOwned.some(b => b.id === 'government_contract') ? 10 : 0
  // Synergy effect estimation not directly exposed; we approximate by difference
  const damagedBasic = Math.floor(basic * ((100 - Math.max(0, Math.min(100, damage || 0)))/100))
  const knownPortion = damagedBasic + enhancedTotal + govBonus
  const synergyPortion = Math.max(0, workMult - knownPortion)
  const tooltip = `Total Work Multiplier increases credits per Work.\n= Damaged Basic (${damagedBasic}%) + Enhanced (${enhancedTotal}%) + Gov (${govBonus}%) + Synergy (${synergyPortion}%)\nCAP 200%`
  const poolPct = ((1000 - gameState.globalPoolRemaining) / 1000) * 100
  const repairCost = Math.floor((damage || 0) * 10)
  const repairDamage = () => {
    try {
      const anyStore: any = (useGameStore as any).getState()
      if (anyStore.repairBusinessDamage) anyStore.repairBusinessDamage()
    } catch {}
  }
  return (
    <motion.div className="flex flex-wrap gap-4 md:flex-nowrap md:items-center justify-between p-4 bg-slate-900/90 border-b-2 border-slate-700 font-mono"
      variants={pixelMotionVariants.fadeAndRise} initial="initial" animate="animate" transition={pixelTransitions.medium}>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-amber-400 rounded-sm" />
  <span className="text-amber-300 text-sm font-bold">{gameState.credits.toLocaleString()}</span>
        <span className="text-amber-200/60 text-xs">CREDITS</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-yellow-500 rounded-sm" />
        <span className="text-yellow-300 text-sm font-bold">{gameState.wealth}</span>
        <span className="text-yellow-200/60 text-xs">$WEALTH</span>
      </div>
      <div className="flex items-center gap-2" title={tooltip}>
        <div className="w-4 h-4 bg-emerald-500 rounded-sm" />
  <span className="text-emerald-300 text-xs font-bold">MULTI {workMult}%</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-emerald-200/60 text-xs">POOL</span>
        <div className="w-24 h-3 bg-slate-800 border border-slate-600 rounded-sm overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${poolPct}%` }} />
        </div>
        <span className="text-emerald-300 text-xs font-bold">{gameState.globalPoolRemaining}</span>
      </div>
      {damage > 0 && (
        <div className="flex items-center gap-2 bg-slate-800/80 border border-red-500/50 px-2 py-1 rounded-sm">
          <span className="text-red-400 text-xs font-bold">DMG {damage}%</span>
          <button
            onClick={repairDamage}
            disabled={credits < repairCost}
            className={`text-[10px] px-2 py-0.5 border rounded-sm transition-colors ${credits < repairCost ? 'border-slate-600 text-slate-600' : 'border-red-400 text-red-300 hover:bg-red-500/20'}`}
            title={`Repair cost ${repairCost} credits`}
          >REPAIR</button>
        </div>
      )}
    </motion.div>
  )
}
