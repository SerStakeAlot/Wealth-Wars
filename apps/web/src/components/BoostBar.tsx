"use client"

import { useEffect, useState } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Timer } from 'lucide-react'

export function BoostBar() {
  const enhanced = useGameStore(state => state.enhancedBusinesses)
  const battleState = useGameStore(state => state.battleState)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const formatTime = (ms: number) => {
    if (ms <= 0) return '0s'
    const sec = Math.floor(ms / 1000)
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  const active = enhanced.filter(b => b.owned && b.active)

  if (active.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Active Boosts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {active.map(b => {
          // Determine expiry: for shields, use battleState.activeShield if matching
          let expiryLabel = ''
          if (b.id === 'security_firm' && battleState.activeShield?.expires) {
            const remaining = battleState.activeShield.expires - now
            expiryLabel = remaining > 0 ? `Expires in ${formatTime(remaining)}` : 'Expired'
          } else if (b.lastActivated && b.cooldown > 0) {
            const remaining = (b.lastActivated + b.cooldown) - now
            expiryLabel = remaining > 0 ? `Cooldown until ${formatTime(remaining)}` : 'Ready'
          }

          return (
            <div key={b.id} className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-xl">{b.icon}</div>
                  <div>
                    <div className="font-semibold">{b.abilityName} <Badge>{b.name}</Badge></div>
                    <div className="text-xs text-muted-foreground">{b.abilityDescription}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {b.abilityCharges ? `Charges: ${b.abilityCharges}` : null}
                </div>
              </div>

              <div className="text-right text-sm text-muted-foreground flex flex-col items-end">
                {expiryLabel ? <div className="flex items-center gap-1"><Timer className="h-4 w-4" />{expiryLabel}</div> : null}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default BoostBar
