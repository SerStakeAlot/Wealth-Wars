'use client'
import React from 'react'
import { WealthWarsPixelApp } from './WealthWarsPixelApp'
import WealthWarsLogo from '@/components/WealthWarsLogo'
import { useGameStore } from '@/lib/gameStore'
import { PixelProfileHeader } from './components/PixelProfileHeader'

// Minimal recreation of the original header structure (subset) for reuse without full SparkGameUI complexity.
function FullGameHeader() {
  // Granular selectors to avoid pulling whole store (prevents potential cascading updates)
  const credits = useGameStore(s => s.player.credits)
  const wealth = useGameStore(s => s.player.wealth)
  const getWorkMultiplier = useGameStore(s => s.getWorkMultiplier)
  const multi = getWorkMultiplier ? Math.round(getWorkMultiplier()) : 0
  return (
    <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur z-40 sticky top-0">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
        <WealthWarsLogo className="text-2xl" />
        <div className="flex items-center gap-6 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1"><span className="text-amber-300 font-bold">{credits.toLocaleString()}</span><span>CREDITS</span></div>
          <div className="flex items-center gap-1"><span className="text-yellow-400 font-bold">{wealth.toLocaleString()}</span><span>$WEALTH</span></div>
          <div className="hidden md:flex items-center gap-1"><span className="text-cyan-300 font-bold">{multi}%</span><span>MULTI</span></div>
        </div>
        <div className="ml-auto flex items-center gap-3 text-[11px] font-mono">
          <ShieldStatus />
        </div>
      </div>
    </div>
  )
}

function ShieldStatus() {
  const shield = useGameStore(s => s.battleState.activeShield)
  if (shield && shield.expires > Date.now()) {
    const remainingMs = shield.expires - Date.now()
    const mins = Math.floor(remainingMs / 60000)
    return <div className="px-2 py-1 rounded border border-blue-700 bg-blue-900/30 text-blue-300">Shield {mins}m</div>
  }
  return <div className="px-2 py-1 rounded border border-slate-700 bg-slate-800 text-slate-400">No Shield</div>
}

export function PixelWrapper() {
  return (
    <div className='wwars-pixel-ui min-h-screen flex flex-col'>
      <PixelProfileHeader />
      <div className='flex-1'>
        <WealthWarsPixelApp />
      </div>
    </div>
  )
}
