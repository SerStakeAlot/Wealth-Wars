"use client";

import { useMemo } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { BUSINESS_SYNERGIES, calculateActiveSynergies, getSynergyProgressTowardsNext } from '@/app/lib/synergies'
import { Badge } from '@/components/ui/badge'

type EffectMap = Partial<{
  workMultiplierBonus: number;
  attackSuccessBonus: number;
  defenseBonus: number;
  wealthTheftBonus: number;
  dailyWealthBonus: number;
  counterAttackBonus: number;
  wealthLossReduction: number;
}>

function formatEffects(effects: EffectMap): string[] {
  const parts: string[] = []
  if (effects.workMultiplierBonus) parts.push(`+${effects.workMultiplierBonus}% Work`)
  if (effects.defenseBonus) parts.push(`+${effects.defenseBonus} Defense`)
  if (effects.attackSuccessBonus) parts.push(`+${effects.attackSuccessBonus}% Attack Success`)
  if (effects.wealthTheftBonus) parts.push(`+${effects.wealthTheftBonus}% Theft`) 
  if (effects.counterAttackBonus) parts.push(`+${effects.counterAttackBonus}% Counter-attack`)
  if (effects.wealthLossReduction) parts.push(`-${effects.wealthLossReduction}% Wealth loss on defense fail`)
  if (effects.dailyWealthBonus) parts.push(`+${effects.dailyWealthBonus} $WEALTH/day`)
  return parts
}

function requirementsSummary(id: string, requiredCategories: string[], minBusinesses: number): string {
  if (id === 'complete_monopoly') {
    return 'At least one active slot from each category: efficiency, defensive, offensive, utility'
  }
  if (requiredCategories.length === 0 && id === 'ultimate_synergy') {
    return 'Fill all 4 enhanced business slots'
  }
  if (requiredCategories.length === 1) {
    const cat = requiredCategories[0]
    return `At least ${minBusinesses} ${cat} activations in slots`
  }
  // general case split requirement
  return `At least ${minBusinesses} total across: ${requiredCategories.join(', ')}`
}

export default function SynergyGuide() {
  const { activeSlots } = useGameStore()

  const { items } = useMemo(() => {
    const active = calculateActiveSynergies(activeSlots)
    const activeIds = new Set(active.map(s => s.id))
    const progressList = getSynergyProgressTowardsNext(activeSlots)
    const progressMap = new Map(progressList.map(p => [p.synergy.id, p]))

    // Compose list from static synergies
    const list = BUSINESS_SYNERGIES.map(s => {
      const isActive = activeIds.has(s.id)
      const progress = isActive ? undefined : progressMap.get(s.id)
      return {
        id: s.id,
        name: s.name,
        description: s.description,
        emoji: s.emoji,
        requiredCategories: s.requiredCategories,
        minBusinesses: s.minBusinesses,
        effects: s.effects,
        active: isActive,
        progressText: isActive ? 'Active' : (progress?.progress ?? '0%'),
        missing: isActive ? [] : (progress?.missingRequirements ?? [])
      }
    })

    // Add Ultimate Synergy to overview
    const ultimateActive = activeSlots.length >= 4
    const ultimate = {
      id: 'ultimate_synergy',
      name: 'Ultimate Synergy',
      description: 'All four slots are active, unlocking peak operational harmony: stronger work output, defense, and passive income.',
      emoji: '✨',
      requiredCategories: [] as string[],
      minBusinesses: 4,
      effects: {
        workMultiplierBonus: 20,
        defenseBonus: 20,
        dailyWealthBonus: 2
      } as EffectMap,
      active: ultimateActive,
      progressText: ultimateActive ? 'Active' : `${activeSlots.length}/4`,
      missing: ultimateActive ? [] : [`Activate ${4 - activeSlots.length} more slot(s)`]
    }

    return { items: [ultimate, ...list] }
  }, [activeSlots])

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.id} className="flex items-start gap-3 rounded-md border border-border p-3">
          <div className="text-2xl shrink-0" aria-hidden>{item.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium truncate">{item.name}</div>
              {item.active ? (
                <Badge className="bg-green-600">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
              <div className="text-xs text-muted-foreground">{requirementsSummary(item.id, item.requiredCategories, item.minBusinesses)}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {formatEffects(item.effects).map((e, i) => (
                <span key={i} className="px-2 py-1 rounded bg-muted text-muted-foreground">{e}</span>
              ))}
            </div>
            {!item.active && (
              <div className="mt-2 text-xs">
                <span className="font-medium">Progress:</span> {item.progressText}
                {item.missing.length > 0 && (
                  <ul className="list-disc ml-5 mt-1 text-muted-foreground">
                    {item.missing.map((m: string, i: number) => <li key={i}>{m}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
