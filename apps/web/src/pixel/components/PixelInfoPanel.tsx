"use client"
import React, { useEffect } from 'react'
import { usePixelSettings } from '../store/pixelSettingsStore'
import { useGameStore } from '@/lib/gameStore'

const LEVEL_SAMPLE_BREAKPOINTS = [1,5,10,15,20,25,30,35,40,45,50]

function computeLevelPerks(level: number) {
  const perks: string[] = []
  if ([5,10,15].includes(level)) perks.push(`Enhanced Slot Unlock`) // summary only (exact slot determined in store)
  if (level % 5 === 0) perks.push('+1 Base Defense breakpoint threshold (cumulative scaling)')
  const shieldDisc = Math.min(30, Math.floor(level / 5) * 5)
  if (shieldDisc > 0 && level % 5 === 0) perks.push(`Shield Cost Discount now ${shieldDisc}%`)
  if (level % 5 === 0) perks.push('Exchange cap increased')
  if (level % 5 === 0) perks.push('Work multiplier bonus step')
  return perks
}

export const PixelInfoPanel: React.FC = () => {
  const { reducedMotion, enableShortcuts, showAdvanced, setReducedMotion, setEnableShortcuts, setShowAdvanced, hydrate, hydrated } = usePixelSettings()
  useEffect(() => { hydrate() }, [hydrate])
  const clanId = useGameStore(s => s.player.clanId)

  return (
    <div className="font-mono text-[11px] space-y-6">
      <section>
        <h3 className="text-cyan-300 font-bold mb-2 text-xs">CONTROLS & SHORTCUTS</h3>
        <ul className="space-y-1 text-slate-300">
          <li><kbd className="px-1 py-0.5 bg-slate-700 rounded">Q</kbd> Quests</li>
          <li><kbd className="px-1 py-0.5 bg-slate-700 rounded">A</kbd> Achievements</li>
          <li><kbd className="px-1 py-0.5 bg-slate-700 rounded">B</kbd> Battle Feed</li>
          <li><kbd className="px-1 py-0.5 bg-slate-700 rounded">C</kbd> Clan Panel</li>
          <li><kbd className="px-1 py-0.5 bg-slate-700 rounded">T</kbd> Chat</li>
          <li><kbd className="px-1 py-0.5 bg-slate-700 rounded">H</kbd> Help Toast</li>
          <li><kbd className="px-1 py-0.5 bg-slate-700 rounded">I</kbd> Info / Settings (this)</li>
        </ul>
      </section>
      <section>
        <h3 className="text-emerald-300 font-bold mb-2 text-xs">CLAN XP RULES</h3>
        <p className="text-slate-300 leading-snug">Manual work grants 20% of personal XP to clan. Quest claim grants 50% of quest XP (or credits/50 fallback). Every 5 clan levels +5 max members.</p>
        {!clanId && <p className="text-slate-500 mt-1">Join a clan to start contributing.</p>}
      </section>
      <section>
        <h3 className="text-pink-300 font-bold mb-2 text-xs">LEVEL PERKS SNAPSHOT</h3>
        <div className="space-y-2 max-h-48 overflow-auto pr-1 custom-scroll">
          {LEVEL_SAMPLE_BREAKPOINTS.map(lvl => {
            const perks = computeLevelPerks(lvl)
            return (
              <div key={lvl} className="border border-slate-600 p-2 rounded bg-slate-800/60">
                <div className="text-slate-200 font-semibold">Level {lvl}</div>
                {perks.length === 0 ? <div className="text-slate-500">(Progression scaling only)</div> : (
                  <ul className="list-disc ml-4 text-slate-300 mt-1 space-y-0.5">
                    {perks.map(p => <li key={p}>{p}</li>)}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </section>
      <section>
        <h3 className="text-amber-300 font-bold mb-2 text-xs">SETTINGS</h3>
        {!hydrated && <div className="text-slate-500">Loading...</div>}
        {hydrated && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={reducedMotion} onChange={e=>setReducedMotion(e.target.checked)} className="accent-cyan-500" />
              <span className="text-slate-300">Reduced Motion</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={enableShortcuts} onChange={e=>setEnableShortcuts(e.target.checked)} className="accent-cyan-500" />
              <span className="text-slate-300">Enable Keyboard Shortcuts</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showAdvanced} onChange={e=>setShowAdvanced(e.target.checked)} className="accent-cyan-500" />
              <span className="text-slate-300">Show Advanced Metrics (future)</span>
            </label>
          </div>
        )}
      </section>
      <section>
        <h3 className="text-indigo-300 font-bold mb-2 text-xs">FORMULAS (KEY)</h3>
        <ul className="space-y-1 text-slate-300">
          <li><span className="text-slate-400">Player Level:</span> floor(xp / 1000) + 1</li>
          <li><span className="text-slate-400">Clan Level Threshold:</span> level * 500</li>
          <li><span className="text-slate-400">Work XP:</span> 25 + (workStreak * 2)</li>
          <li><span className="text-slate-400">Share Boost:</span> +50% credits (one click after share)</li>
        </ul>
      </section>
    </div>
  )
}
