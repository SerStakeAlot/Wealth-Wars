import { useState } from 'react'

// Added optional symbol so we can render a glyph (e.g. '$') instead of just a colored square
export interface ParticleProps { id: string; x: number; y: number; type: 'credit' | 'wealth'; symbol?: string }

export function useParticleEmitterSimple() {
  const [particles, setParticles] = useState<ParticleProps[]>([])
  const emit = (
    x: number,
    y: number,
    type: 'credit' | 'wealth' = 'credit',
    count = 3,
    symbol: string = '$'
  ) => {
    const fresh: ParticleProps[] = []
    const capped = Math.min(count, 12)
    for (let i = 0; i < capped; i++) {
      fresh.push({
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        x: x + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 12,
        type,
        symbol
      })
    }
    // keep only a small tail of previous particles to avoid build-up
    setParticles(prev => [...prev.slice(-15), ...fresh])
    // auto-remove after lifetime
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !fresh.some(f => f.id === p.id)))
    }, 1500)
  }
  return { emit, getParticleData: () => particles }
}
