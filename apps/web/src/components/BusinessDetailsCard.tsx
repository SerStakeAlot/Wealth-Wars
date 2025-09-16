'use client'

import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { ENHANCED_BUSINESSES } from '@/app/lib/businesses'

type Props = {
  businessId?: string
  open: boolean
  onClose: () => void
}

const msToShort = (ms?: number) => {
  if (!ms || ms <= 0) return '—'
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d) return `${d}d ${h}h`
  if (h) return `${h}h ${m}m`
  return `${m}m`
}

export default function BusinessDetailsCard({ businessId, open, onClose }: Props) {
  const [visible, setVisible] = useState(false)
  const biz = useMemo(() => ENHANCED_BUSINESSES.find(b => b.id === businessId), [businessId])

  useEffect(() => {
    if (!open) { setVisible(false); return }
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [open])

  if (!open || !biz) return null

  const ability = biz.ability

  return (
    <div className="fixed inset-0 z-[80]" aria-modal="true" role="dialog" onClick={onClose}>
      <div className={`absolute inset-0 bg-black/70 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-xl rounded-2xl shadow-2xl transition-all duration-200 ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}
          style={{ background: '#1e293b', border: '3px solid #ffd700' }}
        >
          <div className="flex items-start justify-between p-5" style={{ borderBottom: '2px solid #ffd700' }}>
            <div className="flex items-center gap-4">
              <div className="text-4xl" aria-hidden>{biz.emoji}</div>
              <div>
                <div className="text-xl font-semibold" style={{ color: '#ffd700' }}>{biz.name}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded capitalize" style={{ background: '#374151', color: '#e5e7eb', border: '1px solid #475569' }}>{biz.category}</span>
                  <span className="px-2 py-0.5 rounded capitalize" style={{ background: '#374151', color: '#e5e7eb', border: '1px solid #475569' }}>{biz.tier}</span>
                  <span className="px-2 py-0.5 rounded capitalize" style={{ background: '#374151', color: '#e5e7eb', border: '1px solid #475569' }}>{biz.rarity}</span>
                </div>
              </div>
            </div>
            <button
              aria-label="Close"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md"
              style={{ background: '#374151', color: '#f1f5f9', border: '1px solid #475569' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5 space-y-4" style={{ color: '#e5e7eb' }}>
            <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>{biz.description}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded p-3" style={{ background: '#334155', border: '1px solid #475569' }}>
                <div className="text-xs" style={{ color: '#94a3b8' }}>Cost</div>
                <div className="font-semibold">{biz.cost.toLocaleString()} $WEALTH</div>
              </div>
              <div className="rounded p-3" style={{ background: '#334155', border: '1px solid #475569' }}>
                <div className="text-xs" style={{ color: '#94a3b8' }}>Work Multiplier</div>
                <div className="font-semibold">+{biz.workMultiplier}%</div>
              </div>
              <div className="rounded p-3 col-span-2" style={{ background: '#334155', border: '1px solid #475569' }}>
                <div className="text-xs" style={{ color: '#94a3b8' }}>Prerequisites</div>
                <div className="font-semibold">{biz.prerequisites?.length ? biz.prerequisites.join(', ') : 'None'}</div>
              </div>
            </div>

            <div className="rounded" style={{ background: '#334155', border: '1px solid #475569' }}>
              <div className="p-3" style={{ borderBottom: '1px solid #475569' }}>
                <div className="text-sm font-semibold" style={{ color: '#e5e7eb' }}>Ability: {ability.name}</div>
                <div className="text-xs capitalize" style={{ color: '#94a3b8' }}>{ability.type}{ability.effectMode ? ` • ${ability.effectMode}` : ''}</div>
              </div>
              <div className="p-3 space-y-2 text-sm">
                <div>{ability.description}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs" style={{ color: '#94a3b8' }}>Cooldown</div>
                    <div className="font-medium">{msToShort(ability.cooldown)}</div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: '#94a3b8' }}>Duration</div>
                    <div className="font-medium">{msToShort(ability.duration)}</div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: '#94a3b8' }}>Uses</div>
                    <div className="font-medium">{ability.uses ?? '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: '#94a3b8' }}>Activation Cost</div>
                    <div className="font-medium">{ability.cost ? `${ability.cost} $WEALTH` : '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button className="h-9 px-4 rounded-md text-sm" onClick={onClose} style={{ background: '#374151', color: '#f1f5f9', border: '1px solid #475569' }}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
