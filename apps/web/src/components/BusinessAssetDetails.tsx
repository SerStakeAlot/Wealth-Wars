'use client'

import { useEffect, useState } from 'react'
import type { Asset } from '@/app/lib/types'

interface Props {
  open: boolean
  asset: Asset | null
  onClose: () => void
}

const msToTime = (ms?: number) => {
  if (!ms || ms <= 0) return '—'
  const s = Math.floor(ms / 1000)
  const m = Math.floor((s % 3600) / 60)
  const h = Math.floor(s / 3600)
  if (h) return `${h}h ${m}m`
  return `${m}m`
}

export default function BusinessAssetDetails({ open, asset, onClose }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVisible(true), 15)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [open])

  if (!open || !asset) return null

  const outlets = asset.outlets || 1
  const multiplier = asset.multiplier || 1
  const cycleMs = asset.cycleMs || 0
  const profitPerCycle = Math.round((asset.yieldPerTick || 0) * outlets * multiplier)
  const nextReadyIn = asset.nextReadyTs ? Math.max(0, asset.nextReadyTs - Date.now()) : 0

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" onClick={onClose}>
      {/* Solid backdrop (not transparent card) */}
      <div className={`absolute inset-0 bg-black/70 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`} />

      <div className="absolute inset-0 grid place-items-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-2xl rounded-2xl border-[3px] border-[#ffd700] shadow-2xl transition-all duration-200 ${
            visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
          }`}
          style={{ background: '#1e293b' }}
        >
          <div className="flex items-start justify-between p-5" style={{ borderBottom: '2px solid #ffd700' }}>
            <div>
              <div className="text-xl font-extrabold tracking-wide" style={{ color: '#ffd700' }}>{asset.name}</div>
              <div className="mt-1 text-xs" style={{ color: '#cbd5e1' }}>Level {asset.level} • Outlets ×{outlets} • Multiplier ×{multiplier}</div>
            </div>
            <button
              aria-label="Close"
              onClick={onClose}
              className="inline-flex h-9 px-3 items-center justify-center rounded-md"
              style={{ background: '#374151', color: '#f1f5f9', border: '1px solid #475569' }}
            >
              Close
            </button>
          </div>

          <div className="p-5 grid gap-4" style={{ color: '#e5e7eb' }}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="rounded-lg p-3" style={{ background: '#334155', border: '1px solid #475569' }}>
                <div className="text-xs" style={{ color: '#94a3b8' }}>Yield / Tick</div>
                <div className="font-semibold">{asset.yieldPerTick}</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: '#334155', border: '1px solid #475569' }}>
                <div className="text-xs" style={{ color: '#94a3b8' }}>Upgrade Cost</div>
                <div className="font-semibold">{asset.upgradeCost}</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: '#334155', border: '1px solid #475569' }}>
                <div className="text-xs" style={{ color: '#94a3b8' }}>Profit / Cycle</div>
                <div className="font-semibold">{profitPerCycle}</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: '#334155', border: '1px solid #475569' }}>
                <div className="text-xs" style={{ color: '#94a3b8' }}>Cycle Time</div>
                <div className="font-semibold">{msToTime(cycleMs)}</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: '#334155', border: '1px solid #475569' }}>
                <div className="text-xs" style={{ color: '#94a3b8' }}>Manager</div>
                <div className="font-semibold">{asset.managerHired ? 'Hired' : 'None'}</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: '#334155', border: '1px solid #475569' }}>
                <div className="text-xs" style={{ color: '#94a3b8' }}>Next Ready</div>
                <div className="font-semibold">{nextReadyIn ? msToTime(nextReadyIn) : 'Ready'}</div>
              </div>
            </div>

            <div className="rounded-lg p-3" style={{ background: '#334155', border: '1px solid #475569' }}>
              <div className="text-xs mb-1" style={{ color: '#94a3b8' }}>Condition</div>
              <div className="w-full h-3 rounded-full" style={{ background: '#374151' }}>
                <div className="h-3 rounded-full" style={{ width: `${asset.condition}%`, background: asset.condition < 35 ? '#ef4444' : asset.condition < 70 ? '#f59e0b' : '#22c55e' }} />
              </div>
            </div>

            {asset.milestones?.length ? (
              <div className="rounded-lg p-3" style={{ background: '#334155', border: '1px solid #475569' }}>
                <div className="text-xs mb-2" style={{ color: '#94a3b8' }}>Milestones</div>
                <div className="flex flex-wrap gap-2">
                  {asset.milestones.map(m => (
                    <span key={m} className="px-2 py-1 rounded-full text-xs" style={{ background: '#475569', color: '#e5e7eb', border: '1px solid #64748b' }}>×{m}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
