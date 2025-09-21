"use client"
import { useGameStore } from '@/lib/gameStore'
import { PixelButton } from './PixelButton'
import { useEffect, useState, useRef } from 'react'

export function PixelManagerPanel() {
  const charges = useGameStore(s => s.manager.charges)
  const purchases = useGameStore(s => s.manager.purchases)
  const getManagerCost = useGameStore(s => s.getManagerCost)
  const hireGlobalManager = useGameStore(s => s.hireGlobalManager)
  const credits = useGameStore(s => s.player.credits)
  const [cost, setCost] = useState(0)
  const [pulse, setPulse] = useState(false)
  const prevCharges = useRef(charges)

  useEffect(() => { setCost(getManagerCost()) }, [getManagerCost, purchases])

  useEffect(() => {
    if (charges < prevCharges.current) {
      // A charge was consumed (auto work) -> pulse
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 600)
      return () => clearTimeout(t)
    }
    prevCharges.current = charges
  }, [charges])

  return (
    <div className={`bg-slate-800/90 border-2 border-slate-600 p-4 font-mono relative ${pulse ? 'ring-2 ring-amber-400 shadow-[0_0_10px_2px_rgba(251,191,36,0.4)] transition-all' : ''}`}>
      <div className="flex items-center gap-2 mb-3"><div className="w-3 h-3 bg-amber-400 rounded-sm" /><h3 className="text-amber-300 text-sm font-bold">MANAGER</h3></div>
      <div className="text-[11px] text-slate-300 mb-2">Automates Work while charges remain.</div>
      <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
        <div className="bg-slate-700/40 p-2 border border-slate-600 text-center">
          <div className="text-slate-400">CHARGES</div>
          <div className="text-white font-bold text-sm">{charges}</div>
        </div>
        <div className="bg-slate-700/40 p-2 border border-slate-600 text-center">
          <div className="text-slate-400">NEXT COST</div>
          <div className="text-white font-bold text-sm">{cost}</div>
        </div>
      </div>
      <PixelButton
        size="md"
        onClick={() => hireGlobalManager()}
        disabled={credits < cost}
        className="w-full"
      >HIRE +20 CHARGES</PixelButton>
      <div className="mt-2 text-[10px] text-slate-500 text-center">+20 charges per hire. Cost scales 15% each time.</div>
    </div>
  )
}