"use client";
import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../lib/gameStore'

export const PixelQuestsPanel: React.FC = () => {
  const quests = useGameStore(s => s.questsActive)
  const initQuests = useGameStore(s => s.initQuests)
  const refresh = useGameStore(s => s.refreshQuestRotations)
  const claimQuest = useGameStore(s => s.claimQuest)
  const dailyResetAt = useGameStore(s => s.questDailyResetAt)
  const weeklyResetAt = useGameStore(s => s.questWeeklyResetAt)

  useEffect(() => {
    if (!quests || quests.length === 0) {
      initQuests && initQuests()
    }
  }, [quests, initQuests])

  useEffect(() => {
    const id = setInterval(() => {
      refresh && refresh()
    }, 60000)
    return () => clearInterval(id)
  }, [refresh])

  if (!quests) return null

  const now = Date.now()
  const formatRemaining = (ts?: number) => {
    if (!ts) return ''
    const diff = ts - now
    if (diff <= 0) return 'Resetting...'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const [tab, setTab] = useState<'all' | 'daily' | 'weekly' | 'chain'>('all')
  const daily = useMemo(()=>quests.filter(q => q.type === 'daily'),[quests])
  const weekly = useMemo(()=>quests.filter(q => q.type === 'weekly'),[quests])
  const chain = useMemo(()=>quests.filter(q => q.type === 'chain'),[quests])
  const claimAll = () => {
    const target = quests.filter(q => q.complete && !q.claimed)
    target.forEach(q => claimQuest && claimQuest(q.id))
  }

  const renderQuest = (q: any) => {
    const pct = Math.min(100, Math.floor((q.progress / q.target) * 100))
    return (
      <motion.div
        key={q.id}
        layout
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.9 }}
        whileHover={{ y: -2, boxShadow: '0 4px 12px -4px rgba(0,0,0,0.5)' }}
        className={`pxq-card ${q.complete? 'pxq-complete':''} ${q.claimed? 'pxq-claimed':''}`}> 
        <div className="pxq-row">
          <span className="pxq-title">{q.description}</span>
          <span className="pxq-progress">{q.progress}/{q.target}</span>
        </div>
        <div className="pxq-bar"><div className="pxq-fill" style={{width: pct+"%"}} /></div>
        <div className="pxq-rewards">{q.reward.credits?`+${q.reward.credits}C `:''}{q.reward.wealth?`+${q.reward.wealth}W `:''}{q.reward.xp?`+${q.reward.xp}XP `:''}{q.reward.shieldHours?`Shield ${q.reward.shieldHours}h`:''}</div>
        <div className="pxq-actions">
          {q.complete && !q.claimed && <button onClick={()=>claimQuest && claimQuest(q.id)} className="pxq-claim">Claim</button>}
          {q.claimed && <span className="pxq-claimed-label">Claimed</span>}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="pxq-wrapper">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <h2 className="pxq-header m-0">📜 Quests</h2>
        <div className="flex items-center gap-1">
          {(['all','daily','weekly','chain'] as const).map(t => (
            <button key={t} onClick={()=>setTab(t)} className={`px-2 py-1 rounded text-[10px] font-semibold border ${tab===t? 'border-indigo-400 text-indigo-200 bg-indigo-700/40':'border-slate-600 text-slate-400 hover:bg-slate-700/40'}`}>{t.toUpperCase()}</button>
          ))}
          <button onClick={claimAll} disabled={!quests.some(q=>q.complete && !q.claimed)} className="ml-2 px-2 py-1 rounded text-[10px] font-semibold border border-emerald-500 text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-600/20">CLAIM ALL</button>
        </div>
      </div>
      <div className="pxq-sections">
        {(tab==='all' || tab==='daily') && (
          <div className="pxq-section">
            <h3>Daily <span className="pxq-reset">{formatRemaining(dailyResetAt)}</span></h3>
            <AnimatePresence mode="popLayout">{daily.map(renderQuest)}</AnimatePresence>
          </div>) }
        {(tab==='all' || tab==='weekly') && (
          <div className="pxq-section">
            <h3>Weekly <span className="pxq-reset">{formatRemaining(weeklyResetAt)}</span></h3>
            <AnimatePresence mode="popLayout">{weekly.map(renderQuest)}</AnimatePresence>
          </div>) }
        {(tab==='all' || tab==='chain') && (
          <div className="pxq-section">
            <h3>Chain</h3>
            <AnimatePresence mode="popLayout">{chain.map(renderQuest)}</AnimatePresence>
          </div>) }
      </div>
      <style jsx>{`
        .pxq-wrapper { background:#1e293b; border:2px solid #6366f1; padding:16px; border-radius:12px; color:#f1f5f9; font-family: system-ui, sans-serif; }
  .pxq-header { margin:0; font-size:18px; font-weight:600; }
        .pxq-sections { display:grid; gap:16px; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); }
        .pxq-section h3 { margin:0 0 8px; font-size:16px; display:flex; justify-content:space-between; align-items:center; color:#93c5fd; }
        .pxq-reset { font-size:12px; color:#64748b; }
  .pxq-card { background:#0f172a; border:1px solid #334155; padding:10px 12px; border-radius:10px; display:flex; flex-direction:column; gap:6px; will-change: transform, box-shadow; }
        .pxq-card.pxq-complete { border-color:#10b981; }
        .pxq-card.pxq-claimed { opacity:0.55; }
        .pxq-row { display:flex; justify-content:space-between; font-size:13px; }
        .pxq-title { font-weight:500; }
        .pxq-progress { color:#94a3b8; }
        .pxq-bar { height:6px; background:#1e293b; border-radius:4px; overflow:hidden; }
        .pxq-fill { height:100%; background:linear-gradient(90deg,#6366f1,#8b5cf6); }
        .pxq-rewards { font-size:12px; color:#cbd5e1; }
        .pxq-actions { display:flex; }
        .pxq-claim { background:#10b981; border:none; color:#062c22; font-size:12px; padding:4px 10px; border-radius:6px; cursor:pointer; font-weight:600; }
        .pxq-claim:hover { filter:brightness(1.1); }
        .pxq-claimed-label { font-size:11px; color:#64748b; }
      `}</style>
    </div>
  )
}
