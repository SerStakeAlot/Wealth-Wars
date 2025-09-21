"use client"
import React, { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Lightweight portal-less side / popover panel system sized for pixel UI.
// Panels overlay content but keep HUD visible. Hidden when not active.

export type PixelPanelId = 'quests' | 'achievements' | 'battle' | 'managers' | 'clans' | 'chat' | 'info'

export interface PixelSidePanelProps {
  id: PixelPanelId
  title: string
  icon?: ReactNode
  open: boolean
  onClose: () => void
  children: ReactNode
  width?: number
  side?: 'left' | 'right'
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.35 },
  exit: { opacity: 0 },
}

const panelVariants = {
  hidden: (side: 'left' | 'right') => ({ x: side === 'left' ? -40 : 40, opacity: 0, scale: 0.95 }),
  visible: { x: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 210, damping: 28 } },
  exit: (side: 'left' | 'right') => ({ x: side === 'left' ? -30 : 30, opacity: 0, scale: 0.93, transition: { duration: 0.15 } })
}

export const PixelSidePanel: React.FC<PixelSidePanelProps> = ({ id, title, icon, open, onClose, children, width = 360, side = 'right' }) => {
  // Close on ESC
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Body scroll lock when any panel open (simple approach)
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] pointer-events-none select-none">
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-slate-950"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-hidden
            onClick={onClose}
            style={{ pointerEvents: 'auto', backdropFilter: 'blur(2px)' }}
          />
          <motion.aside
            key={id}
            custom={side}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal
            aria-label={title}
            className={`absolute top-0 ${side === 'right' ? 'right-0' : 'left-0'} h-full flex flex-col bg-slate-900/95 border-${side === 'right' ? 'l' : 'r'}-2 border-indigo-600 shadow-xl pointer-events-auto max-sm:w-full max-sm:border-l-0 max-sm:border-r-0 max-sm:rounded-none max-sm:px-1`} style={{ width }}
          >
            <div className="p-3 pt-safe border-b border-slate-700 flex items-center gap-2">
              {icon && <span className="w-5 h-5 flex items-center justify-center text-indigo-300">{icon}</span>}
              <h2 className="text-sm font-bold tracking-wide text-indigo-200 flex-1 truncate">{title}</h2>
              <button onClick={onClose} className="text-[10px] px-2 py-1 rounded border border-slate-600 hover:bg-slate-700/50 text-slate-300">ESC</button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4 pb-safe custom-scrollbar text-[11px] max-sm:px-2">
              {children}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

export interface PixelPanelDockButtonProps {
  active?: boolean
  count?: number
  onClick?: () => void
  icon?: ReactNode
  label: string
}

export const PixelPanelDockButton: React.FC<PixelPanelDockButtonProps> = ({ active, count, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`relative group w-14 h-14 rounded-md border flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold tracking-wide transition touch-manipulation ${active ? 'border-indigo-400 bg-indigo-600/30 text-indigo-200 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'border-slate-600 bg-slate-800/70 text-slate-300 hover:bg-slate-700/70'}`}
    >
      <span className="text-lg leading-none">{icon || '★'}</span>
      <span className="leading-none">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full shadow">{count}</span>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-indigo-400/0 group-hover:ring-indigo-400/40 transition" />
    </button>
  )
}

// Floating dock container - positioned bottom center (or side on large)
export const PixelPanelDock: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="fixed z-[60] bottom-[env(safe-area-inset-bottom,1rem)] left-1/2 -translate-x-1/2 flex gap-2 bg-slate-900/85 border border-slate-700/70 rounded-2xl px-4 py-3 backdrop-blur-lg shadow-2xl max-sm:w-[92%] max-sm:justify-between">
      {children}
    </div>
  )
}

// Utility scroll styling (Tailwind can't easily target) - include once globally in app CSS if desired.
// Could be moved, but keeping here near component for now.