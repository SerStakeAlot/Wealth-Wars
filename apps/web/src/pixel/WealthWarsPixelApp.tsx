'use client'
import { usePixelGameAdapter } from './hooks/usePixelGameState'
import { useGameStore } from '@/lib/gameStore'
import { useParticleEmitterSimple } from './hooks/useParticleEmitterSimple'
import { PixelHUD } from './components/PixelHUD'
import { PixelExchangePanel } from './components/PixelExchangePanel'
import { PixelBusinessList } from './components/PixelBusinessList'
import { PixelLotteryPanel } from './components/PixelLotteryPanel'
import { PixelButton } from './components/PixelButton'
import { ParticleRenderer } from './components/ParticleRenderer'
import { PixelBattleFeed } from './components/PixelBattleFeed'
import { useNotificationStore } from '@/lib/notificationStore'
import { PixelManagerPanel } from './components/PixelManagerPanel'
import { PixelAttackPanel } from './components/PixelAttackPanel'
import { PixelAchievements } from './components/PixelAchievements'
import { PixelEconomyPanel } from './components/PixelEconomyPanel'
import { PixelQuestsPanel } from './components/PixelQuestsPanel'
import { PixelSidePanel, PixelPanelDock, PixelPanelDockButton } from './components/PixelSidePanels'
import { PixelClanPanel } from './components/PixelClanPanel'
import { PixelChatPanel } from './components/PixelChatPanel'
import { pixelMotionVariants, pixelTransitions } from './lib/motionVariants'
import { motion } from 'framer-motion'
import { PixelSynergyBreakdown } from './components/PixelSynergyBreakdown'
import { useEffect, useRef, useState, useMemo } from 'react'
import { PixelInfoPanel } from './components/PixelInfoPanel'
import { usePixelSettings } from './store/pixelSettingsStore'

// Removed WorkPayoutBreakdown component to prevent additional store subscription churn.

function SynergyBar() {
  const rapidProcessingUntil = useGameStore(s => (s as any).rapidProcessingUntil)
  const compoundActiveUntil = useGameStore(s => (s as any).compoundActiveUntil)
  const conversionBoostUntil = useGameStore(s => (s as any).conversionBoostUntil)
  const shareBoostActive = useGameStore(s => (s as any).shareBoostActive)
  const shieldExpires = useGameStore(s => s.battleState?.activeShield?.expires)
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])

  // Known total durations (ms)
  const DURATIONS: Record<string, number> = {
    rapid: 24 * 60 * 60 * 1000,
    compound: 7 * 24 * 60 * 60 * 1000,
    conversion: 8 * 60 * 60 * 1000,
    share: 60 * 1000, // ephemeral share indicator (1 min visual)
    shield: 0 // dynamic; total derived below depending on type
  }

  // Determine shield total duration by comparing now to expires; use known buckets 1h/24h/72h heuristic
  let shieldTotal = 0
  if (shieldExpires && shieldExpires > now) {
    const remaining = shieldExpires - now
    if (remaining <= 3600000) shieldTotal = 3600000
    else if (remaining <= 86400000) shieldTotal = 86400000
    else shieldTotal = 72 * 60 * 60 * 1000
  }
  if (shieldTotal > 0) DURATIONS.shield = shieldTotal

  const items = [
    { key: 'rapid', label: 'RAPID PROC', until: rapidProcessingUntil, color: 'bg-emerald-400', desc: 'Faster work cooldown' },
    { key: 'compound', label: 'COMPOUND', until: compoundActiveUntil, color: 'bg-purple-400', desc: 'Bank accrual active' },
    { key: 'conversion', label: 'CONVERSION', until: conversionBoostUntil, color: 'bg-pink-400', desc: 'Credit→$ bonus' },
    { key: 'share', label: 'SOCIAL BOOST', until: shareBoostActive ? now + DURATIONS.share : undefined, color: 'bg-yellow-400', desc: 'Share reward' },
    { key: 'shield', label: 'SHIELD', until: shieldExpires, color: 'bg-blue-400', desc: 'Defense active' }
  ]

  const formatRemain = (until?: number) => {
    if (!until) return null
    const ms = until - now
    if (ms <= 0) return null
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    if (m >= 60) { const h = Math.floor(m/60); const rm = m%60; return `${h}h${rm}m` }
    return `${m}m${s.toString().padStart(2,'0')}s`
  }

  const calcWidth = (key: string, until?: number) => {
    if (!until) return 0
    const total = DURATIONS[key] || (until - now)
    const remaining = until - now
    if (remaining <= 0) return 0
    const pct = (remaining / total) * 100
    return Math.max(2, Math.min(100, pct))
  }

  const [showDetails, setShowDetails] = useState(false)
  // Hydrate persisted preference
  useEffect(() => {
    try { const v = localStorage.getItem('ww_pixel_synergyDetails'); if (v === '1') setShowDetails(true) } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem('ww_pixel_synergyDetails', showDetails ? '1' : '0') } catch {}
  }, [showDetails])
  return (
    <div className="bg-slate-800/90 border-2 border-slate-600 p-4 font-mono mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-green-300">SYNERGY BOOSTS</h3>
        <button onClick={() => setShowDetails(s=>!s)} className="text-[10px] px-2 py-1 border border-green-500/50 rounded hover:bg-green-500/10 text-green-300">{showDetails ? 'HIDE' : 'DETAILS'}</button>
      </div>
      <div className="space-y-2">
        {items.map(it => {
          const active = !!(it.until && it.until > now)
          const remain = formatRemain(it.until)
          return (
            <div key={it.key} className="text-[10px]">
              <div className="flex items-center justify-between mb-1">
                <span className={active ? 'text-white' : 'text-slate-500'}>{it.label}</span>
                <span className={active ? 'text-emerald-300' : 'text-slate-600'}>{remain || (active ? '...' : 'INACTIVE')}</span>
              </div>
              <div className="h-1.5 bg-slate-700 relative overflow-hidden">
                {active && (
                  <div
                    className={`${it.color} absolute inset-y-0 left-0 transition-all`}
                    style={{ width: `${calcWidth(it.key, it.until)}%` }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
      {showDetails && (
        <div className="mt-4 border-t border-green-700/40 pt-3">
          <PixelSynergyBreakdown />
        </div>
      )}
    </div>
  )
}

export function WealthWarsPixelApp() {
  const { gameState, lottery, actions, meta } = usePixelGameAdapter()
  const shareBoostActive = useGameStore(s => (s as any).shareBoostActive)
  const { emit, getParticleData } = useParticleEmitterSimple()
  const [now, setNow] = useState(Date.now())
  const clockInBtnRef = useRef<HTMLButtonElement | null>(null)
  const [devBypassCooldown, setDevBypassCooldown] = useState(false)
  // Persist dev bypass (dev only toggle) locally separate from settings store
  useEffect(() => {
    try { const storedBypass = localStorage.getItem('ww_devBypassWorkCooldown'); if (storedBypass === '1') setDevBypassCooldown(true) } catch {}
  }, [])
  useEffect(() => { try { localStorage.setItem('ww_devBypassWorkCooldown', devBypassCooldown ? '1':'0') } catch {} }, [devBypassCooldown])
  // Settings store (reduced motion + shortcut enable)
  const reducedMotion = usePixelSettings(s => s.reducedMotion)
  const enableShortcuts = usePixelSettings(s => s.enableShortcuts)
  const setReducedMotion = usePixelSettings(s => s.setReducedMotion)
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])

  const workRemaining = meta.workRemaining || 0
  const formatMs = (ms: number) => {
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    if (m >= 60) { const h = Math.floor(m / 60); const rm = m % 60; return `${h}h ${rm}m` }
    return `${m}m ${s.toString().padStart(2,'0')}s`
  }

  const handleClockIn = (e?: React.MouseEvent) => {
    if (workRemaining > 0 && !devBypassCooldown) return
    // Determine emission origin: prefer click coordinates relative to viewport, fallback to button center
    let x: number; let y: number
    if (e) {
      x = e.clientX; y = e.clientY
    } else if (clockInBtnRef.current) {
      const r = clockInBtnRef.current.getBoundingClientRect()
      x = r.left + r.width / 2; y = r.top + r.height / 2
    } else {
      x = window.innerWidth / 2; y = window.innerHeight / 2
    }
    if (!reducedMotion) emit(x, y, 'credit', 6, '$')
    actions.clockIn()
  }

  const twitterShare = () => {
    const text = encodeURIComponent(`Building my Wealth Wars empire: ${gameState.credits} credits / ${gameState.wealth} $WEALTH. Join the battle!`)
    const url = encodeURIComponent('https://wealthwars.game')
    const intent = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=WealthWars,PlayToEarn`
    window.open(intent, '_blank')
  }

  // Panel toggles (local UI state; not persisted for now to keep ephemeral)
  const [openPanel, setOpenPanel] = useState<null | 'quests' | 'achievements' | 'battle' | 'managers' | 'clans' | 'chat' | 'info'>(null)

  // Derived counts for dock badges
  const questsActive = useGameStore(s => s.questsActive)
  const unclaimedQuests = questsActive ? questsActive.filter(q => q.complete && !q.claimed).length : 0
  // Return a primitive count directly to keep selector referentially stable (avoid array creation per render)
  const unclaimedAchievements = useGameStore(s => {
    const fn = s.getActiveAchievementStages
    if (!fn) return 0
    const stages = fn() // internal array creation is fine since we only return a number primitive
    let count = 0
    for (const st of stages) { if (st.unlocked && !st.claimed) count++ }
    return count
  })
  // Derive battle-related notification count from notification store (primitive only)
  const unseenBattles = useNotificationStore(nState => {
    // For now treat all unread battle-like notifications as unseen; we identify by keyword like in PixelBattleFeed
    const isBattle = (nt: any) => {
      const t = (nt.title + ' ' + (nt.message || '')).toLowerCase()
      return /attack|attacked|defend|defended|shield|raid|battle/.test(t)
    }
    let count = 0
    for (const n of nState.notifications) {
      if (!n.read && isBattle(n)) count++
    }
    return count
  })

  const pendingInvites = useGameStore(s => (s.clanInvites || []).length)
  // Unread chat counts (primitive derivation):
  const globalChatUnread = useGameStore(s => {
    const total = (s.globalChat || []).length
    return Math.max(0, total - (s.lastSeenGlobalChatCount || 0))
  })
  const clanChatUnread = useGameStore(s => {
    const cid = s.player.clanId
    if (!cid) return 0
    const list = (s.clanChat && s.clanChat[cid]) ? s.clanChat[cid] : []
    const lastSeen = (s.lastSeenClanChatCounts || {})[cid] || 0
    return Math.max(0, list.length - lastSeen)
  })
  const totalChatUnread = (globalChatUnread + clanChatUnread)
  const markGlobalChatRead = useGameStore(s => s.markGlobalChatRead)
  const markClanChatRead = useGameStore(s => s.markClanChatRead)
  const togglePanel = (id: typeof openPanel) => {
    setOpenPanel(p => {
      const next = p === id ? null : id
      return next
    })
  }

  // Keyboard shortcuts include new I for info; can be disabled in settings
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return
      if (!enableShortcuts) return
      const key = e.key.toLowerCase()
      const map: Record<string, typeof openPanel> = {
        q: 'quests',
        a: 'achievements',
        b: 'battle',
        c: 'clans',
        t: 'chat',
        i: 'info'
      }
      if (key in map) {
        e.preventDefault()
        togglePanel(map[key])
      } else if (key === 'h') {
        try { useNotificationStore.getState().push({ type: 'info', title: 'Shortcuts', message: 'Q A B C T I toggle panels', showInBanner: false }) } catch {}
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enableShortcuts])

  // Mark chats read after render when chat panel becomes active to avoid store updates during render phase
  useEffect(() => {
    if (openPanel === 'chat') {
      try { if (globalChatUnread > 0 && markGlobalChatRead) markGlobalChatRead() } catch {}
      try {
        if (clanChatUnread > 0 && markClanChatRead) {
          const cid = useGameStore.getState().player.clanId
          if (cid) markClanChatRead(cid)
        }
      } catch {}
    }
  }, [openPanel, globalChatUnread, clanChatUnread, markGlobalChatRead, markClanChatRead])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <PixelHUD gameState={gameState} />
      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div className="space-y-4" variants={reducedMotion ? undefined : pixelMotionVariants.fadeAndRise} initial={reducedMotion ? undefined : 'initial'} animate={reducedMotion ? undefined : 'animate'} transition={pixelTransitions.medium}>
          <SynergyBar />
          <div className="bg-slate-800/90 border-2 border-slate-600 p-6 font-mono text-center">
            <h3 className="text-cyan-300 text-sm font-bold mb-4">CLOCK IN STATION</h3>
            {gameState.expectedWorkPayout && <PayoutExpectedBlock expected={gameState.expectedWorkPayout} />}
            {workRemaining > 0 && !devBypassCooldown && <div className="text-[11px] text-amber-400 mb-2">Cooldown: {formatMs(workRemaining)}</div>}
            <PixelButton onClick={handleClockIn} size="lg" className={`w-full text-lg ${shareBoostActive ? 'ring-2 ring-yellow-400 animate-pulse shadow-[0_0_8px_2px_rgba(250,204,21,0.6)]' : ''}`} disabled={workRemaining>0 && !devBypassCooldown} ref={clockInBtnRef as any}>CLOCK IN</PixelButton>
            <div className="mt-2 flex items-center justify-center gap-4 flex-wrap">
              <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer select-none">
                <input type="checkbox" checked={devBypassCooldown} onChange={e => setDevBypassCooldown(e.target.checked)} className="accent-yellow-500" />
                BYPASS COOLDOWN
              </label>
              <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer select-none">
                <input type="checkbox" checked={reducedMotion} onChange={e => setReducedMotion(e.target.checked)} className="accent-green-500" />
                REDUCED MOTION
              </label>
            </div>
            <div className="mt-2 text-xs text-slate-400">Earn credits + business bonuses</div>
            <div className='mt-3 flex gap-2 justify-center'>
              <PixelButton size='sm' variant='wealth' onClick={twitterShare}>SHARE</PixelButton>
            </div>
          </div>
          <PixelBusinessList
            businesses={gameState.businesses}
            credits={gameState.credits}
            wealth={gameState.wealth}
            onPurchase={actions.buyBusiness}
            onPurchaseEnhanced={actions.buyEnhancedBusiness}
            activeSlots={meta.activeSlots}
            maxSlots={meta.maxSlots}
            onToggleSlot={actions.toggleSlot}
            onActivateAbility={actions.activateAbility}
          />
        </motion.div>
        <motion.div className="space-y-4" variants={reducedMotion ? undefined : pixelMotionVariants.fadeAndRise} initial={reducedMotion ? undefined : 'initial'} animate={reducedMotion ? undefined : 'animate'} transition={{ delay: 0.1, ...pixelTransitions.medium }}>
          <PixelExchangePanel gameState={gameState} onConvert={(credits) => actions.convertCredits(credits)} />
          <PixelEconomyPanel />
          <div className="bg-slate-800/90 border-2 border-slate-600 p-4 font-mono">
            <div className="flex items-center gap-2 mb-4"><div className="w-3 h-3 bg-blue-400 rounded-sm" /><h3 className="text-blue-300 text-sm font-bold">DEFENSE SHIELDS</h3></div>
            <div className="grid grid-cols-3 gap-2">
              <PixelButton size='sm' onClick={() => actions.purchaseShield(1)} disabled={gameState.wealth < 5} className='text-xs'>1H<br/>5W</PixelButton>
              <PixelButton size='sm' onClick={() => actions.purchaseShield(24)} disabled={gameState.wealth < 20} className='text-xs'>24H<br/>20W</PixelButton>
              <PixelButton size='sm' onClick={() => actions.purchaseShield(72)} disabled={gameState.wealth < 50} className='text-xs'>72H<br/>50W</PixelButton>
            </div>
            {gameState.shieldExpiresAt && gameState.shieldExpiresAt > Date.now() && <div className='mt-2 text-xs text-blue-300 text-center'>Shield Active</div>}
          </div>
        </motion.div>
        <motion.div className="space-y-4" variants={reducedMotion ? undefined : pixelMotionVariants.fadeAndRise} initial={reducedMotion ? undefined : 'initial'} animate={reducedMotion ? undefined : 'animate'} transition={{ delay: 0.2, ...pixelTransitions.medium }}>
          <PixelLotteryPanel lotteryState={lottery} wealth={gameState.wealth} onEnterLottery={actions.enterLottery} />
          <PixelManagerPanel />
          <PixelAttackPanel onAttack={(type, targetId) => actions.performAttack(type, targetId)} />
          {/* Removed inline Achievements, Battle Feed, Quests to reduce scroll - now in side panels */}
        </motion.div>
      </div>
      {!reducedMotion && <ParticleRenderer particles={getParticleData()} />}

      {/* Floating Dock */}
      <PixelPanelDock>
        <PixelPanelDockButton
          active={openPanel === 'quests'}
          count={unclaimedQuests}
          onClick={() => togglePanel('quests')}
          label="QUESTS"
          icon={<span className="text-pink-300">📜</span>}
        />
        <PixelPanelDockButton
          active={openPanel === 'info'}
          onClick={() => togglePanel('info')}
          label="INFO"
          icon={<span className="text-cyan-300">ℹ️</span>}
        />
        <PixelPanelDockButton
          active={openPanel === 'achievements'}
            count={unclaimedAchievements}
          onClick={() => togglePanel('achievements')}
          label="ACHV"
          icon={<span className="text-amber-300">★</span>}
        />
        <PixelPanelDockButton
          active={openPanel === 'battle'}
          count={unseenBattles}
          onClick={() => togglePanel('battle')}
          label="BATTLE"
          icon={<span className="text-red-300">⚔️</span>}
        />
        <PixelPanelDockButton
          active={openPanel === 'clans'}
          count={pendingInvites > 0 ? pendingInvites : undefined}
          onClick={() => togglePanel('clans')}
          label="CLAN"
          icon={<span className="text-emerald-300">♟️</span>}
        />
        <PixelPanelDockButton
          active={openPanel === 'chat'}
          count={totalChatUnread > 0 ? totalChatUnread : undefined}
          onClick={() => togglePanel('chat')}
          label="CHAT"
          icon={<span className="text-indigo-300">💬</span>}
        />
      </PixelPanelDock>

      {/* Panels */}
      <PixelSidePanel
        id="quests"
        title="Active Quests"
        open={openPanel === 'quests'}
        onClose={() => setOpenPanel(null)}
        icon={<span>📜</span>}
        width={420}
      >
        <PixelQuestsPanel />
      </PixelSidePanel>
      <PixelSidePanel
        id="achievements"
        title="Achievements"
        open={openPanel === 'achievements'}
        onClose={() => setOpenPanel(null)}
        icon={<span>★</span>}
        width={420}
      >
        <PixelAchievements />
      </PixelSidePanel>
      <PixelSidePanel
        id="battle"
        title="Battle Feed"
        open={openPanel === 'battle'}
        onClose={() => setOpenPanel(null)}
        icon={<span>⚔️</span>}
        width={500}
      >
        <PixelBattleFeed />
      </PixelSidePanel>
      <PixelSidePanel
        id="clans"
        title="Clans"
        open={openPanel === 'clans'}
        onClose={() => setOpenPanel(null)}
        icon={<span>♟️</span>}
        width={440}
      >
        <PixelClanPanel />
      </PixelSidePanel>
      <PixelSidePanel
        id="chat"
        title="Chat"
        open={openPanel === 'chat'}
        onClose={() => setOpenPanel(null)}
        icon={<span>💬</span>}
        width={420}
      >
        <PixelChatPanel />
      </PixelSidePanel>
      <PixelSidePanel
        id="info"
        title="Info & Settings"
        open={openPanel === 'info'}
        onClose={() => setOpenPanel(null)}
        icon={<span>ℹ️</span>}
        width={460}
      >
        <PixelInfoPanel />
      </PixelSidePanel>
    </div>
  )
}

// Extracted expected payout block to keep main component lean and minimize re-renders.
function PayoutExpectedBlock({ expected }: { expected: number }) {
  const getWorkMultiplier = useGameStore(s => s.getWorkMultiplier)
  const playerLevel = useGameStore(s => s.player.level)
  const shareBoost = useGameStore(s => (s as any).shareBoostActive)
  const enhancedBusinesses = useGameStore(s => s.enhancedBusinesses)
  const [hover, setHover] = useState(false)

  const breakdown = useMemo(() => {
    const activeEnhanced = enhancedBusinesses.filter(b => b.owned && b.active)
    const base = 25
    const wmPct = getWorkMultiplier ? getWorkMultiplier() : 0
    let levelBonusPct = 0
    if (playerLevel) {
      const lvl = playerLevel
      if (lvl <= 50) levelBonusPct = lvl * 0.5
      else {
        levelBonusPct = 50 * 0.5
        const extra = lvl - 50
        let sum = 0
        for (let i=0;i<extra;i++) sum += 0.25 * Math.pow(0.98, i)
        levelBonusPct += sum
      }
      levelBonusPct = Math.min(levelBonusPct, 200)
    }
    const enhancedFlatBonus = activeEnhanced.reduce((acc,b)=> acc + (b.workMultiplier||0),0)
    const baseWithMultiplier = base + Math.floor(base * (wmPct / 100))
    const projected = shareBoost ? Math.floor(baseWithMultiplier * 1.5) : baseWithMultiplier
    return { base, wmPct, levelBonusPct, enhancedFlatBonus, baseWithMultiplier, projected }
  }, [enhancedBusinesses, getWorkMultiplier, playerLevel, shareBoost])

  return (
    <div className="text-[11px] text-slate-400 mb-1 flex flex-col gap-1 items-center">
      <span className="relative inline-flex items-center gap-1"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        Expected: <span className="text-white font-bold">+{Math.round(expected)} credits</span>
        <span className="w-3 h-3 bg-slate-600 text-[9px] leading-3 flex items-center justify-center rounded cursor-default hover:bg-cyan-500" title="Breakdown">i</span>
        {hover && (
          <span className="pointer-events-none animate-fadeIn absolute top-full mt-1 left-1/2 -translate-x-1/2 z-20 w-56 text-left bg-slate-900 border border-cyan-600/40 rounded p-2 shadow-lg">
            <div className="text-[10px] space-y-1">
              <div className="flex justify-between"><span>Base</span><span>{breakdown.base}</span></div>
              <div className="flex justify-between"><span>Total Mult %</span><span>{breakdown.wmPct.toFixed(2)}%</span></div>
              <div className="pl-2 text-[9px] text-slate-400 space-y-0.5">
                <div className="flex justify-between"><span>Level Bonus</span><span>{breakdown.levelBonusPct.toFixed(2)}%</span></div>
                <div className="flex justify-between"><span>Enhanced</span><span>{breakdown.enhancedFlatBonus.toFixed(2)}%</span></div>
              </div>
              <div className="flex justify-between"><span>After Mult</span><span>{breakdown.baseWithMultiplier}</span></div>
              {shareBoost && <div className="flex justify-between text-amber-300"><span>Share Boost</span><span>x1.5</span></div>}
              <div className="flex justify-between font-semibold text-cyan-300"><span>Projected</span><span>{breakdown.projected}</span></div>
            </div>
          </span>
        )}
      </span>
      <span className="text-[10px] text-slate-500">Lifetime Credits: <span className="text-slate-300">{(useGameStore.getState() as any).player?.totalCreditsEarned || 0}</span></span>
    </div>
  )
}
