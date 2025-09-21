import { motion } from 'framer-motion'
import { PixelBusiness } from '../lib/types'
import { PixelButton } from './PixelButton'
import { pixelMotionVariants, pixelTransitions } from '../lib/motionVariants'

interface Props {
  businesses: PixelBusiness[]
  credits: number
  wealth?: number
  onPurchase: (id: string) => void
  onPurchaseEnhanced?: (id: string) => void
  activeSlots?: string[]
  maxSlots?: number
  onToggleSlot?: (id: string) => void
  onActivateAbility?: (id: string) => void
}

export function PixelBusinessList(props: Props) {
  const { businesses, credits, wealth = 0, onPurchase, onPurchaseEnhanced, activeSlots = [], maxSlots = 0, onToggleSlot, onActivateAbility } = props
  const tierColor = (t: 1|2|3) => ({1:'border-green-600 bg-green-900/20',2:'border-blue-600 bg-blue-900/20',3:'border-purple-600 bg-purple-900/20'}[t])
  const tierIcon = (t: 1|2|3) => ({1:'bg-green-400',2:'bg-blue-400',3:'bg-purple-400'}[t])
  const core = businesses.filter(b => !b.enhanced)
  const enhanced = businesses.filter(b => b.enhanced)
  const ownedCount = businesses.filter(b => b.owned).length
  const slotsUsed = activeSlots.length
  return (
    <motion.div className="bg-slate-800/90 border-2 border-slate-600 p-4 font-mono" variants={pixelMotionVariants.fadeAndRise} initial="initial" animate="animate" transition={pixelTransitions.medium}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-400 rounded-sm" /><h3 className="text-blue-300 text-sm font-bold">BUSINESSES</h3></div>
        <div className="text-[10px] text-slate-400 flex items-center gap-3"><span>{ownedCount}/{businesses.length} owned</span>{maxSlots>0 && <span>Slots: {slotsUsed}/{maxSlots}</span>}</div>
      </div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Core</div>
      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
        {core.map(b => {
          const afford = credits >= b.cost
          const disabled = b.owned || !afford
          const reason = b.owned ? 'Already owned' : !afford ? `Need ${b.cost - credits} more credits` : ''
          return (
          <motion.div key={b.id} className={`relative border-2 p-3 rounded ${tierColor(b.tier)} ${b.owned ? 'opacity-60' : ''}`} variants={pixelMotionVariants.fadeAndRise} initial="initial" animate="animate" transition={{ delay: 0.05 }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {b.image ? (
                      <img
                        src={b.image}
                        alt=""
                        className="w-6 h-6 image-pixelate mt-0.5"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.style.display = 'none'
                          const next = document.createElement('span')
                          next.className = 'pixel-image-fallback'
                          next.textContent = '🏢'
                          target.parentElement?.insertBefore(next, target)
                        }}
                      />
                    ) : (
                      <span className="pixel-image-fallback">🏢</span>
                    )}
                  <div className={`w-2 h-2 rounded-sm ${tierIcon(b.tier)}`} />
                  <span className="text-white text-xs font-bold">{b.name}</span>
                  {b.owned && <span className="text-green-400 text-[10px]">OWNED</span>}
                </div>
                <div className="text-[10px] text-slate-300 mb-2">+{b.creditBoost} credits per clock in</div>
                <div className="flex items-center justify-between">
                  <div className="text-amber-300 text-[11px] font-bold" title="Cost to purchase base business">{b.cost.toLocaleString()} credits</div>
                  {!b.owned && (
                    <div className="relative group">
                      <PixelButton size='sm' onClick={() => !disabled && onPurchase(b.id)} disabled={disabled} className='text-[10px]'>BUY</PixelButton>
                      {disabled && reason && (
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 border border-slate-600 text-[9px] px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition">{reason}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>)
        })}
        {core.length===0 && <div className="text-xs text-slate-500 italic">None</div>}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-2">Enhanced <span className="text-purple-400 text-[9px] border border-purple-600 px-1 py-0.5 rounded">ADV</span></div>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {enhanced.map(b => {
          const active = activeSlots.includes(b.id)
          const now = Date.now()
            const cooldownRemaining = b.cooldownMs && b.lastActivated ? Math.max(0, (b.lastActivated + b.cooldownMs) - now) : 0
            const abilityReady = cooldownRemaining === 0
            const fmt = (ms: number) => {
              const s = Math.floor(ms/1000)
              if (s < 60) return s + 's'
              const m = Math.floor(s/60)
              if (m < 60) return m + 'm'
              const h = Math.floor(m/60)
              return h + 'h'
            }
            const afford = wealth >= b.cost
            const buyDisabled = b.owned || !afford
            const buyReason = b.owned ? 'Already owned' : !afford ? `Need ${b.cost - wealth} more $WEALTH` : ''
            return (
            <motion.div key={b.id} className={`border-2 p-3 rounded ${tierColor(b.tier)} ${b.owned ? '' : 'opacity-60'} ${active ? 'ring-2 ring-purple-400' : ''}`} variants={pixelMotionVariants.fadeAndRise} initial="initial" animate="animate" transition={{ delay: 0.05 }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {b.image ? (
                      <img
                        src={b.image}
                        alt=""
                        className="w-6 h-6 image-pixelate mt-0.5"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.style.display = 'none'
                          const next = document.createElement('span')
                          next.className = 'pixel-image-fallback'
                          next.textContent = '🏢'
                          target.parentElement?.insertBefore(next, target)
                        }}
                      />
                    ) : (
                      <span className="pixel-image-fallback">🏢</span>
                    )}
                    <div className={`w-2 h-2 rounded-sm ${tierIcon(b.tier)}`} />
                    <span className="text-white text-xs font-bold" title={b.enhanced && b.abilityName ? `${b.abilityName}: ${b.abilityDescription || ''}` : undefined}>{b.name.replace(/ \*$/, '')}</span>
                    <span className="text-purple-300 text-[10px] font-semibold" title={b.abilityName ? `${b.abilityName}: ${b.abilityDescription || ''}` : 'Enhanced Business'}>ENH</span>
                    {b.owned && active && <span className="text-cyan-300 text-[10px] font-semibold">ACTIVE</span>}
                    {b.owned && !active && <span className="text-slate-400 text-[10px] font-semibold">INACTIVE</span>}
                    {b.owned && b.abilityCharges !== undefined && b.abilityCharges > 0 && <span className="text-amber-300 text-[10px] font-semibold">CHG:{b.abilityCharges}</span>}
                  </div>
                  <div className="text-[10px] text-slate-300 mb-1">+{b.creditBoost} credits per clock in</div>
                  {b.owned && b.cooldownMs && b.abilityType === 'active' && (
                    <div className="text-[10px] mb-2 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-slate-700 relative overflow-hidden">
                        {cooldownRemaining>0 && b.lastActivated && (
                          <div className="absolute inset-y-0 left-0 bg-purple-500" style={{ width: `${Math.max(2, Math.min(100, (cooldownRemaining / b.cooldownMs) * 100))}%` }} />
                        )}
                      </div>
                      <span className={abilityReady ? 'text-green-400' : 'text-slate-500'}>{abilityReady ? 'READY' : fmt(cooldownRemaining)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-purple-300 text-[11px] font-bold whitespace-nowrap">{b.cost.toLocaleString()} $WEALTH</div>
                    {!b.owned && (
                      <div className="relative group">
                        <PixelButton size='sm' onClick={() => !buyDisabled && (onPurchaseEnhanced ? onPurchaseEnhanced(b.id) : onPurchase(b.id))} disabled={buyDisabled} className='text-[10px]'>BUY</PixelButton>
                        {buyDisabled && buyReason && (
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 border border-slate-600 text-[9px] px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition">{buyReason}</span>
                        )}
                      </div>
                    )}
                    {b.owned && onToggleSlot && <PixelButton size='sm' variant={active? 'secondary':'primary'} onClick={() => onToggleSlot(b.id)} className='text-[10px]'>{active? 'UNSLOT':'SLOT'}</PixelButton>}
                    {b.owned && onActivateAbility && <PixelButton size='sm' variant='wealth' onClick={() => onActivateAbility(b.id)} disabled={!abilityReady} className='text-[10px]'>{abilityReady? 'ABILITY':'CD'}</PixelButton>}
                  </div>
                </div>
              </div>
            </motion.div>
          )})}
        {enhanced.length===0 && <div className="text-xs text-slate-500 italic">None</div>}
      </div>
    </motion.div>
  )
}
