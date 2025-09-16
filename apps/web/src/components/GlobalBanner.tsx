'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNotificationStore, selectors } from '@/lib/notificationStore'
import { X } from 'lucide-react'

export default function GlobalBanner() {
  const active = useNotificationStore(selectors.activeBanner)
  const dismiss = useNotificationStore((s) => s.dismiss)
  const [hovered, setHovered] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Default duration if not sticky and not provided
  const duration = useMemo(() => {
    if (!active) return 0
    if (active.sticky) return 0
    return Math.max(2000, active.durationMs ?? 6000)
  }, [active])

  useEffect(() => {
    if (!active || hovered || duration === 0) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      dismiss(active.id)
    }, duration)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [active?.id, duration, hovered, dismiss])

  if (!active) return null

  const variant = active.type
  const bg =
    variant === 'success' ? 'from-emerald-600 to-emerald-700 border-emerald-400/50' :
    variant === 'warning' ? 'from-amber-600 to-amber-700 border-amber-400/50' :
    variant === 'error' ? 'from-rose-700 to-rose-800 border-rose-400/50' :
    'from-sky-700 to-sky-800 border-sky-400/50'

  return (
    <div 
      className={`fixed top-0 inset-x-0 z-50 px-3 sm:px-4 py-2 animate-slideDown`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`mx-auto max-w-6xl rounded-xl border shadow-lg bg-gradient-to-br ${bg}`}>
        <div className="flex items-start sm:items-center gap-3 p-3 sm:p-3.5">
          <div className="text-xl sm:text-2xl">
            {variant === 'success' ? '✅' : variant === 'warning' ? '⚠️' : variant === 'error' ? '🚨' : '📣'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold tracking-wide text-white line-clamp-1">
              {active.title}
            </div>
            {active.message && (
              <div className="text-white/90 text-sm sm:text-[15px] mt-0.5 line-clamp-2">
                {active.message}
              </div>
            )}
          </div>
          <button
            aria-label="Dismiss banner"
            onClick={() => dismiss(active.id)}
            className="shrink-0 rounded-md p-1.5 text-white/80 hover:text-white hover:bg-black/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .animate-slideDown { animation: slideDown 240ms ease-out }
      `}</style>
    </div>
  )
}
