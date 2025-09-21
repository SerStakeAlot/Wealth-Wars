"use client"
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { motion, AnimatePresence } from 'framer-motion'

// Combined Global + Clan chat (local-only demo)
export const PixelChatPanel: React.FC = () => {
  // Use primitive selectors ONLY to satisfy React 19 snapshot caching expectations.
  const clanId = useGameStore(s => s.player.clanId)
  const globalCount = useGameStore(s => (s.globalChat ? s.globalChat.length : 0))
  const clanCount = useGameStore(s => (s.player.clanId && s.clanChat && s.clanChat[s.player.clanId] ? s.clanChat[s.player.clanId].length : 0))
  const postGlobal = useGameStore(s => s.postGlobalMessage)
  const postClan = useGameStore(s => s.postClanMessage)
  const markGlobalChatRead = useGameStore(s => s.markGlobalChatRead)
  const markClanChatRead = useGameStore(s => s.markClanChatRead)
  // Pull full references ONCE outside the store subscription to avoid unstable selectors.
  const storeRef = useGameStore.getState()
  const globalMessagesRef = storeRef.globalChat || []
  const clanMessagesRef = (clanId && storeRef.clanChat ? (storeRef.clanChat[clanId] || []) : [])
  // Recompute displayed messages only when counts or active tab/clan changes.
  const [tab, setTab] = useState<'global' | 'clan'>(clanId ? 'clan' : 'global')
  const messages = useMemo(() => {
    return tab === 'global' ? globalMessagesRef : clanMessagesRef
  }, [tab, globalCount, clanCount, clanId, globalMessagesRef, clanMessagesRef])
  // Adjust tab if clan lost/left
  useEffect(() => { if (!clanId && tab === 'clan') setTab('global') }, [clanId, tab])
  // Mark read on mount & whenever tab changes
  useEffect(() => {
    if (tab === 'global') {
      markGlobalChatRead && markGlobalChatRead()
    } else if (tab === 'clan' && clanId) {
      markClanChatRead && markClanChatRead(clanId)
    }
  }, [tab, clanId, markGlobalChatRead, markClanChatRead])
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const bottomSpacerRef = useRef<HTMLDivElement | null>(null)

  // iOS / mobile viewport resize handling to keep input visible
  useEffect(() => {
    if (typeof window === 'undefined') return
    const vv = (window as any).visualViewport
    if (!vv) return
    const handle = () => {
      // Add padding equal to keyboard overlap if necessary
      if (!bottomSpacerRef.current) return
      const heightDiff = window.innerHeight - vv.height
      bottomSpacerRef.current.style.height = heightDiff > 0 ? `${heightDiff + 12}px` : '0px'
      // Ensure latest message stays visible
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
    }
    vv.addEventListener('resize', handle)
    return () => vv.removeEventListener('resize', handle)
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages.length, tab])

  // When focusing input, scroll list to bottom (helps on Android Chrome)
  const handleFocus = () => {
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
    }, 50)
  }

  const send = () => {
    if (!text.trim()) return
    const t = text
    setText('')
    if (tab === 'global') {
      postGlobal && postGlobal(t)
    } else {
      postClan && postClan(t)
    }
  }

  // messages already derived

  return (
    <div className="flex flex-col h-full text-[11px]">
      <div className="flex items-center gap-2 mb-2">
  <button onClick={()=>setTab('global')} className={`px-2 py-1 rounded border text-[10px] ${tab==='global'?'border-indigo-400 text-indigo-200 bg-indigo-900/40':'border-slate-600 text-slate-400 hover:bg-slate-700/40'}`}>GLOBAL</button>
  <button disabled={!clanId} onClick={()=>setTab('clan')} className={`px-2 py-1 rounded border text-[10px] ${tab==='clan'?'border-emerald-400 text-emerald-200 bg-emerald-900/30':'border-slate-600 text-slate-400 hover:bg-slate-700/40 disabled:opacity-30 disabled:cursor-not-allowed'}`}>CLAN</button>
        <div className="ml-auto text-[9px] text-slate-500">Local demo chat</div>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar bg-slate-800/60 border border-slate-700 rounded p-2 pb-4">
        <AnimatePresence initial={false}>
          {messages.slice(-150).map(m => (
            <motion.div key={m.id} layout initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} className="rounded px-2 py-1 bg-slate-900/70 border border-slate-700">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] text-indigo-400 font-semibold truncate">{m.from}</span>
                <span className="text-[8px] text-slate-500">{new Date(m.ts).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="text-slate-200 leading-snug whitespace-pre-wrap break-words">{m.text}</div>
            </motion.div>
          ))}
          {messages.length === 0 && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-[10px] text-slate-500 text-center py-4">No messages yet.</motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomSpacerRef} className="h-0 w-full" />
      </div>
      <form
        onSubmit={e => { e.preventDefault(); send() }}
        className="mt-2 flex gap-2 sticky bottom-0 left-0 bg-slate-900/80 backdrop-blur px-2 pt-2 pb-[env(safe-area-inset-bottom,8px)] border-t border-slate-700"
      >
        <input
          ref={inputRef}
          onFocus={handleFocus}
          value={text}
            onChange={e=>setText(e.target.value)}
          placeholder={tab==='global'?'Message global chat':'Message clan chat'}
          className="flex-1 px-2 py-2 rounded bg-slate-950/80 border border-slate-700 focus:border-indigo-500 outline-none text-[11px]"
          inputMode="text"
        />
        <button type="submit" disabled={!text.trim()} className="px-3 py-2 rounded border border-indigo-500 text-indigo-300 text-[10px] disabled:opacity-40">SEND</button>
      </form>
    </div>
  )
}
