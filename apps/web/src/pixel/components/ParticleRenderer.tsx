import { motion } from 'framer-motion'
import type { ParticleProps } from '../hooks/useParticleEmitterSimple'

export function ParticleRenderer({ particles }: { particles: Array<ParticleProps> }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 select-none">
      {particles.map(p => {
        const color = p.type === 'credit' ? 'text-amber-300' : 'text-yellow-300'
        return (
          <motion.span
            key={p.id}
            className={`absolute font-mono text-xs ${color}`}
            style={{ left: p.x, top: p.y }}
            initial={{ opacity: 0.9, y: 0, scale: 0.8, rotate: (Math.random()-0.5)*30 }}
            animate={{ opacity: [0.9, 0.9, 0], y: [-10, -24, -34], scale: [0.8, 1, 0.6] }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          >{p.symbol || '$'}</motion.span>
        )
      })}
    </div>
  )
}
