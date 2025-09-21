"use client"
import React, { useEffect, useState, useCallback } from 'react'
import WealthWarsLogo from '@/components/WealthWarsLogo'
import { useGameStore } from '@/lib/gameStore'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { LevelUnlockModal } from './LevelUnlockModal'

export const PixelProfileHeader: React.FC = () => {
  const credits = useGameStore(s => s.player.credits)
  const wealth = useGameStore(s => s.player.wealth)
  const level = useGameStore(s => s.player.level)
  const workMulti = useGameStore(s => s.getWorkMultiplier ? Math.round(s.getWorkMultiplier()) : 0)
  const clanTag = useGameStore(s => {
    const c = s.currentClan
    return c ? `[${c.tag}]` : ''
  })

  const { publicKey, connected, connecting, disconnect, wallet } = useWallet()
  const { connection } = useConnection()
  const initializePlayer = useGameStore(s => s.initializePlayer)
  const storedAddress = useGameStore(s => s.player.walletAddress)
  const [liveStatus, setLiveStatus] = useState<'online' | 'degraded' | 'offline' | 'unknown'>('unknown')
  const [latencyMs, setLatencyMs] = useState<number | null>(null)

  // Poll an AWS endpoint (stub): uses NEXT_PUBLIC_LIVE_STATUS_URL if provided, else falls back to internal /api/live-status
  useEffect(() => {
    let active = true
    const configured = process.env.NEXT_PUBLIC_LIVE_STATUS_URL
    const url = configured && configured.trim().length > 0 ? configured : '/api/live-status'

    const poll = async () => {
      const start = performance.now()
      try {
        const controller = new AbortController()
        const id = setTimeout(()=>controller.abort(), 5000)
        const res = await fetch(url, { cache: 'no-store', signal: controller.signal })
        clearTimeout(id)
        if (!active) return
        const elapsed = Math.round(performance.now() - start)
        setLatencyMs(elapsed)
        if (res.ok) {
          setLiveStatus(elapsed < 400 ? 'online' : elapsed < 1500 ? 'degraded' : 'offline')
        } else {
          setLiveStatus('degraded')
        }
      } catch {
        if (!active) return
        setLiveStatus('offline')
        setLatencyMs(null)
      }
      setTimeout(poll, 15000)
    }
    poll()
    return () => { active = false }
  }, [])

  // When a real wallet connects, update the game store identity (once per change)
  useEffect(() => {
    if (publicKey) {
      const addr = publicKey.toBase58()
      if (!storedAddress || storedAddress !== addr) {
        initializePlayer && initializePlayer(addr)
      }
    }
  }, [publicKey, storedAddress, initializePlayer])

  const handleDisconnect = useCallback(async () => {
    try { await disconnect(); } catch {}
  }, [disconnect])

  const statusColor = liveStatus === 'online' ? 'text-emerald-400' : liveStatus === 'degraded' ? 'text-amber-400' : liveStatus === 'offline' ? 'text-red-400' : 'text-slate-400'
  const statusLabel = liveStatus.toUpperCase()
  const pulseColor = liveStatus === 'online' ? 'bg-emerald-400' : liveStatus === 'degraded' ? 'bg-amber-400' : liveStatus === 'offline' ? 'bg-red-500' : 'bg-slate-500'
  const ringColor = liveStatus === 'online' ? 'shadow-[0_0_0_3px_rgba(16,185,129,0.25)]' : liveStatus === 'degraded' ? 'shadow-[0_0_0_3px_rgba(245,158,11,0.25)]' : liveStatus === 'offline' ? 'shadow-[0_0_0_3px_rgba(239,68,68,0.25)]' : 'shadow-[0_0_0_3px_rgba(148,163,184,0.25)]'
  const unknownHint = liveStatus === 'unknown' ? null : null

  const [showLevels, setShowLevels] = useState(false)
  return (
    <div className="pixel-profile-header sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-6 font-mono">
        <WealthWarsLogo className="text-xl" />
        <div className="hidden md:flex items-center gap-5 text-[10px] tracking-wide">
          <InfoBlock label="CREDITS" value={credits.toLocaleString()} color="text-amber-300" />
          <InfoBlock label="$WEALTH" value={wealth.toLocaleString()} color="text-yellow-300" />
          <button onClick={()=>setShowLevels(true)} className="flex flex-col items-start leading-tight min-w-[60px] text-left group">
            <span className="text-[9px] text-slate-500">LEVEL</span>
            <span className="text-[11px] font-bold text-cyan-300 group-hover:text-cyan-200 underline decoration-dotted">{level}</span>
          </button>
          <InfoBlock label="MULTI" value={workMulti + '%'} color="text-green-300" />
          {clanTag && <InfoBlock label="CLAN" value={clanTag} color="text-emerald-300" />}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className={`px-2 py-1 rounded border text-[10px] ${statusColor} border-slate-600 bg-slate-800/60 flex items-center gap-2 relative`}> 
            <span className="flex items-center gap-1">
              <span className={`relative inline-flex w-2.5 h-2.5 rounded-full ${pulseColor} ${ringColor} animate-pulse`}> 
                <span className={`absolute inset-0 rounded-full ${pulseColor} opacity-70 animate-ping`}></span>
              </span>
              LIVE
            </span>
            <span className="text-slate-500">{statusLabel}</span>
            {latencyMs!==null && <span className="text-slate-500">{latencyMs}ms</span>}
            {unknownHint && <span className="hidden sm:inline text-[9px] text-slate-500 ml-1">{unknownHint}</span>}
          </div>
          {/* Wallet connect control */}
          <div className="flex items-center">
            {/* The default multi button includes connect / select / disconnect flows. */}
            <WalletMultiButton className="!bg-indigo-600/20 !text-indigo-300 !border !border-indigo-500 !text-[10px] !px-3 !py-1 hover:!bg-indigo-600/40" />
            {connected && publicKey && (
              <button onClick={handleDisconnect} className="ml-2 px-2 py-1 text-[10px] rounded border border-red-500 text-red-300 hover:bg-red-500/20">DISC</button>
            )}
          </div>
        </div>
      </div>
      <LevelUnlockModal open={showLevels} onClose={()=>setShowLevels(false)} />
    </div>
  )
}

const InfoBlock: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
  <div className="flex flex-col items-start leading-tight min-w-[60px]">
    <span className="text-[9px] text-slate-500">{label}</span>
    <span className={`text-[11px] font-bold ${color||'text-slate-200'}`}>{value}</span>
  </div>
)
