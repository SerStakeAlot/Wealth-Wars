"use client"
import React, { useState, useMemo } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { motion, AnimatePresence } from 'framer-motion'

// Minimal clan system UI: create, list, join, leave.
export const PixelClanPanel: React.FC = () => {
  const clans = useGameStore(s => s.clans || [])
  const player = useGameStore(s => s.player)
  const currentClan = useGameStore(s => s.currentClan)
  const createClan = useGameStore(s => s.createClan)
  const joinClan = useGameStore(s => s.joinClan)
  const leaveClan = useGameStore(s => s.leaveClan)
  const promote = useGameStore(s => s.promoteMember)
  const demote = useGameStore(s => s.demoteMember)
  const kick = useGameStore(s => s.kickMember)
  const invites = useGameStore(s => s.clanInvites || [])
  const acceptInvite = useGameStore(s => s.acceptClanInvite)
  const declineInvite = useGameStore(s => s.declineClanInvite)

  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [desc, setDesc] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState<'rank' | 'members' | 'wealth'>('rank')

  const canCreate = !player.clanId
  const filtered = useMemo(() => {
    let rows = clans.slice()
    if (filter === 'open') rows = rows.filter(c => c.members < c.maxMembers)
    if (sort === 'members') rows.sort((a,b)=>b.members - a.members)
    else if (sort === 'wealth') rows.sort((a,b)=>b.totalWealth - a.totalWealth)
    else rows.sort((a,b)=>a.rank - b.rank)
    return rows
  }, [clans, filter, sort])

  const handleCreate = () => {
    if (!createClan) return
    const r = createClan(name, tag, desc)
    if (r.success) { setName(''); setTag(''); setDesc('') }
  }

  const leave = () => { leaveClan && leaveClan() }

  return (
    <div className="text-[11px] space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={()=>setFilter('all')} className={`px-2 py-1 rounded border text-[10px] ${filter==='all'?'border-indigo-400 text-indigo-200 bg-indigo-900/40':'border-slate-600 text-slate-400 hover:bg-slate-700/40'}`}>ALL</button>
        <button onClick={()=>setFilter('open')} className={`px-2 py-1 rounded border text-[10px] ${filter==='open'?'border-indigo-400 text-indigo-200 bg-indigo-900/40':'border-slate-600 text-slate-400 hover:bg-slate-700/40'}`}>OPEN</button>
        <select value={sort} onChange={e=>setSort(e.target.value as any)} className="px-2 py-1 rounded border border-slate-600 bg-slate-800 text-[10px]">
          <option value="rank">RANK</option>
          <option value="members">MEMBERS</option>
            <option value="wealth">WEALTH</option>
        </select>
      </div>

      {currentClan ? (
        <div className="p-3 rounded border border-emerald-500/50 bg-emerald-900/20 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-emerald-300">{currentClan.name} <span className="text-emerald-500">[{currentClan.tag}]</span></h3>
            <div className="flex gap-2 items-center">
              <span className="text-[10px] text-slate-400">Lv {currentClan.level}</span>
              <button onClick={leave} className="px-2 py-1 rounded border border-red-500 text-red-300 text-[10px] hover:bg-red-500/20">LEAVE</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div><span className="text-slate-400">Members:</span> {currentClan.members}/{currentClan.maxMembers}</div>
            <div><span className="text-slate-400">Wealth:</span> {currentClan.totalWealth}</div>
            <div><span className="text-slate-400">Trophies:</span> {currentClan.trophies}</div>
          </div>
          {/* Clan XP Progress */}
          <ClanXpBar level={currentClan.level} xp={currentClan.xp || 0} />
          {currentClan.description && <p className="text-slate-300 leading-snug">{currentClan.description}</p>}
          <ClanMemberList
            playerId={player.id}
            playerRole={player.clanRole as any}
            clan={currentClan}
            onPromote={(id)=>promote && promote(currentClan.id, id)}
            onDemote={(id)=>demote && demote(currentClan.id, id)}
            onKick={(id)=>kick && kick(currentClan.id, id)}
          />
        </div>
      ) : canCreate && (
        <div className="p-3 rounded border border-slate-600 bg-slate-800/60 space-y-2">
          <h3 className="font-semibold text-indigo-300">Create Clan</h3>
          <div className="grid gap-2">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="px-2 py-1 rounded bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none" />
            <input value={tag} onChange={e=>setTag(e.target.value)} placeholder="TAG" className="px-2 py-1 rounded bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none" />
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={2} placeholder="Description" className="px-2 py-1 rounded bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none resize-none" />
            <button disabled={!name || !tag} onClick={handleCreate} className="px-2 py-1 rounded border text-[10px] font-semibold border-indigo-500 text-indigo-300 hover:bg-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed">CREATE</button>
          </div>
        </div>
      )}

      {/* Pending Invites (if not in clan) */}
      {!currentClan && invites.length > 0 && (
        <div className="p-3 rounded border border-yellow-600 bg-yellow-900/20 space-y-2">
          <h4 className="text-yellow-300 font-semibold text-xs">Invites</h4>
          <div className="space-y-1">
            {invites.map(inv => (
              <div key={inv.id} className="flex items-center justify-between gap-2 text-[10px] bg-slate-800/60 px-2 py-1 rounded border border-slate-600">
                <span className="text-slate-300 truncate">{inv.clanName} <span className="text-indigo-400">[{inv.tag}]</span></span>
                <div className="flex gap-1">
                  <button onClick={()=>acceptInvite && acceptInvite(inv.id)} className="px-1.5 py-0.5 rounded border border-emerald-500 text-emerald-300 hover:bg-emerald-500/20">ACCEPT</button>
                  <button onClick={()=>declineInvite && declineInvite(inv.id)} className="px-1.5 py-0.5 rounded border border-red-500 text-red-300 hover:bg-red-500/20">X</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {filtered.map(c => {
            const joined = player.clanId === c.id
            return (
              <motion.div key={c.id} layout initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} whileHover={{y:-2}} className={`p-2 rounded border text-[10px] flex flex-col gap-1 ${joined? 'border-emerald-500/60 bg-emerald-900/20':'border-slate-600 bg-slate-800/50 hover:border-indigo-500/60'}`}> 
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200 truncate">{c.name} <span className="text-indigo-400">[{c.tag}]</span></div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 tabular-nums">#{c.rank}</span>
                    <span className="text-slate-400">{c.members}/{c.maxMembers}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-slate-400">
                  <span>Lv {c.level}</span>
                  <span>W {c.totalWealth}</span>
                  <span>T {c.trophies}</span>
                </div>
                {c.description && <div className="text-slate-500 line-clamp-2 leading-snug">{c.description}</div>}
                {!joined && !player.clanId && <div className="flex gap-2 mt-1">
                  <button onClick={()=>joinClan && joinClan(c.id)} className="self-start px-2 py-1 rounded border border-indigo-500 text-indigo-300 hover:bg-indigo-600/20">JOIN</button>
                  <button onClick={()=>useGameStore.getState().requestClanInvite && useGameStore.getState().requestClanInvite!(c.id)} className="self-start px-2 py-1 rounded border border-yellow-500 text-yellow-300 hover:bg-yellow-600/20">INVITE</button>
                </div>}
              </motion.div>
            )
          })}
        </AnimatePresence>
        {filtered.length === 0 && <div className="text-xs text-slate-500 py-4 text-center">No clans found.</div>}
      </div>
    </div>
  )
}

// XP Bar Component
const ClanXpBar: React.FC<{ level: number; xp: number }> = ({ level, xp }) => {
  // Mirror threshold logic from store
  const threshold = (lvl: number) => lvl * 500
  const needed = threshold(level)
  const pct = Math.min(100, Math.floor((xp / needed) * 100))
  return (
    <div className="space-y-1 text-[10px]">
      <div className="flex justify-between"><span className="text-slate-400">Clan XP</span><span className="text-slate-300">{xp}/{needed}</span></div>
      <div className="h-2 bg-slate-700 rounded overflow-hidden">
        <div className="h-full bg-emerald-500" style={{ width: pct+'%' }} />
      </div>
    </div>
  )
}

interface ClanMemberListProps {
  clan: any
  playerId: string
  playerRole?: string
  onPromote: (id: string) => void
  onDemote: (id: string) => void
  onKick: (id: string) => void
}

const ClanMemberList: React.FC<ClanMemberListProps> = ({ clan, playerId, playerRole, onPromote, onDemote, onKick }) => {
  const members = clan.membersList || []
  const canManage = playerRole === 'leader'
  return (
    <div className="border-t border-emerald-700/40 pt-2 space-y-2">
      <h4 className="text-emerald-300 font-semibold text-xs flex items-center gap-2">Members <span className="text-[10px] text-slate-400">({members.length})</span></h4>
      <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {members.map((m: any) => {
          const leader = m.id === clan.leader
          const self = m.id === playerId
          return (
            <div key={m.id} className="flex items-center justify-between gap-2 bg-slate-800/60 border border-slate-600 rounded px-2 py-1">
              <div className="flex flex-col leading-tight">
                <span className="text-slate-200 text-[10px] font-semibold truncate">{m.id}</span>
                <span className={`text-[9px] ${leader ? 'text-emerald-400' : 'text-slate-400'}`}>{m.role.toUpperCase()}</span>
              </div>
              {canManage && !self && (
                <div className="flex gap-1">
                  <button onClick={()=>onPromote(m.id)} className="px-1.5 py-0.5 rounded border border-emerald-500 text-emerald-300 text-[9px] hover:bg-emerald-500/20">▲</button>
                  <button onClick={()=>onDemote(m.id)} className="px-1.5 py-0.5 rounded border border-yellow-500 text-yellow-300 text-[9px] hover:bg-yellow-500/20">▼</button>
                  <button onClick={()=>onKick(m.id)} className="px-1.5 py-0.5 rounded border border-red-500 text-red-300 text-[9px] hover:bg-red-500/20">✖</button>
                </div>
              )}
            </div>
          )
        })}
        {members.length === 0 && <div className="text-[10px] text-slate-500 py-2 text-center">No members.</div>}
      </div>
    </div>
  )
}
