import { useGameStore } from '@/lib/gameStore'
import { useNotificationStore } from '@/lib/notificationStore'
import { PixelGameState, PixelBusiness, PixelLotteryState } from '../lib/types'

function mapStoreLottery(state: any): PixelLotteryState {
  try {
    const round = state.lottery.currentRound
    const pid = state.player.id
    const myTickets = round.entries.filter((e: any) => e.playerId === pid).length
    const drawsAt = round.startedAt + round.durationMs
    const isActive = !round.locked && !round.settled && Date.now() < drawsAt
    return { currentPot: round.pot, myTickets, drawsAt, isActive }
  } catch { return { currentPot: 0, myTickets: 0, drawsAt: Date.now() + 300000, isActive: true } }
}

export function usePixelGameAdapter() {
  const store = useGameStore()
  const lottery = mapStoreLottery(store as any)
  const pool = (store as any).exchangePool
  const pid = store.player.id
  const userMinted = pool?.perUserRedeemedToday?.[pid] || 0
  const globalRemaining = Math.max(0, (pool?.globalDailyCapWealth || 0) - (pool?.redeemedTodayWealth || 0))
  const userRemaining = Math.max(0, (pool?.userDailyCapWealth || 0) - userMinted)
  const treasuryRemaining = Math.max(0, store.treasuryReserve.wealth)
  const cap = Math.max(0, Math.min(globalRemaining, userRemaining, treasuryRemaining))

  const baseBusinesses: any[] = store.businesses || []
  const enhanced: any[] = (store as any).enhancedBusinesses || []
  const activeSlots: string[] = (store as any).activeSlots || []
  const maxSlots: number = (store as any).maxSlots || 0

  const allRaw = [
    ...baseBusinesses.map(b => ({ ...b, _enhanced: false })),
    ...enhanced.map(b => ({ ...b, _enhanced: true }))
  ]

  const businesses: PixelBusiness[] = allRaw
    .map((b: any) => ({
      id: b.id,
      name: b.name + (b._enhanced ? ' *' : ''),
      cost: Math.round(b.baseCost || b.cost || 100),
      creditBoost: Math.round(b.workMultiplier || b.creditBoost || 5),
      tier: (b.tier && [1,2,3].includes(b.tier) ? b.tier : (b._enhanced ? 3 : 1)) as 1|2|3,
      owned: !!b.owned,
      enhanced: !!b._enhanced,
      abilityCharges: b.abilityCharges,
      cooldownMs: b.cooldown,
      lastActivated: b.lastActivated,
      abilityType: b.abilityType,
      abilityName: b.abilityName,
      abilityDescription: b.abilityDescription,
      image: (() => {
        const base = '/pixel-assets'
        const map: Record<string,string> = {
          lemonade_stand: 'lemonade.svg',
          coffee_cafe: 'coffee.svg',
          widget_factory: 'factory.svg',
          automation_factory: 'automation.svg',
          fast_food_chain: 'fastfood.svg',
          innovation_lab: 'lab.svg',
          security_firm: 'security.svg',
          insurance_company: 'insurance.svg',
          government_contract: 'gov.svg',
          consulting_firm: 'consulting.svg',
          cyber_security: 'cyber.svg',
          investment_bank: 'bank.svg',
          trading_exchange: 'exchange.svg',
          market_research: 'research.svg',
          marketing_agency: 'marketing.svg',
          venture_capital: 'venture.svg'
        }
        const file = map[b.id]
        return file ? `${base}/${file}` : undefined
      })()
    }))
    .sort((a, b) => a.cost - b.cost)

  const expected = store.getExpectedWorkPayout ? store.getExpectedWorkPayout() : undefined
  const workRemaining = store.getWorkCooldownRemaining ? store.getWorkCooldownRemaining(Date.now()) : 0

  const gameState: PixelGameState = {
    credits: store.player.credits,
    wealth: store.player.wealth,
    shieldExpiresAt: store.battleState?.activeShield ? store.battleState.activeShield.expires : null,
    businesses,
    dailyWealthConverted: userMinted,
    globalPoolRemaining: cap,
    expectedWorkPayout: typeof expected === 'number' && expected > 0 ? expected : undefined
  }

  const clockIn = () => {
    if (workRemaining > 0) return
    try { (useGameStore.getState() as any)._applyWork(Date.now(), false) }
    catch {
      const base = gameState.expectedWorkPayout || 25
      useGameStore.setState(s => ({ player: { ...s.player, credits: s.player.credits + Math.round(base) } }))
    }
  }
  const convertCredits = (creditsAmount: number) => { store.convertCreditsToWealth(creditsAmount) }
  const buyBusiness = (id: string) => {
    const anyStore: any = store as any
    // Prefer dedicated outlet purchase for core businesses
    if (anyStore.buyBusinessOutlet) {
      try { anyStore.buyBusinessOutlet(id) } catch {}
      return
    }
    if (anyStore.purchaseBusiness) { try { anyStore.purchaseBusiness(id) } catch {} }
  }
  const buyEnhancedBusiness = (id: string) => {
    const anyStore: any = store as any
    if (anyStore.buyEnhancedBusiness) { try { anyStore.buyEnhancedBusiness(id) } catch {} }
  }
  const enterLottery = (_tickets: number) => { try { store.enterLottery() } catch {} }
  const purchaseShield = (hours: number) => { const type = hours <= 1 ? 'basic' : hours <= 24 ? 'advanced' : 'elite'; try { store.purchaseShield(type as any) } catch {} }

  const toggleSlot = (id: string) => {
    useGameStore.setState(s => {
      const active = (s as any).activeSlots as string[] || []
      const max = (s as any).maxSlots || 0
      if (active.includes(id)) {
        return { activeSlots: active.filter(a => a !== id) }
      } else {
        if (active.length >= max) return s
        return { activeSlots: [...active, id] }
      }
    })
  }
  const activateAbility = (id: string) => {
    useGameStore.setState(s => {
      const list = (s as any).enhancedBusinesses?.map((b: any) => {
        if (b.id !== id || !b.owned) return b
        if ((b.abilityCharges || 0) <= 0 && b.abilityType === 'active') return b
        const charges = b.abilityType === 'active' ? Math.max(0, (b.abilityCharges || 1) - 1) : b.abilityCharges
        return { ...b, lastActivated: Date.now(), abilityCharges: charges, active: true }
      })
      return { enhancedBusinesses: list }
    })
  }

  // Expose attack action with target selection and enrichment notification
  const performAttack = (attackType: 'standard' | 'wealth_assault' | 'land_siege' | 'business_sabotage', targetId: string) => {
    try {
      const anyStore: any = useGameStore.getState()
      if (anyStore.performAttack) {
        const res = anyStore.performAttack(targetId, attackType)
        try {
          if (res && res.success) {
            const details = typeof res.stolen === 'number' ? `Stole ${res.stolen} W` : typeof res.damage === 'number' ? `Damage ${res.damage}%` : res.message || 'Success'
            useNotificationStore.getState().push({ type: 'info', title: 'Attack Report', message: `${attackType.replace('_',' ')} → ${details}`, showInBanner: false })
          }
        } catch {}
        return res
      }
    } catch {}
    return { success: false, message: 'Attack unavailable' }
  }

  const repairDamage = () => {
    try {
      const anyStore: any = useGameStore.getState()
      if (anyStore.repairBusinessDamage) anyStore.repairBusinessDamage()
    } catch {}
  }

  return { gameState, lottery, actions: { clockIn, convertCredits, buyBusiness, buyEnhancedBusiness, enterLottery, purchaseShield, toggleSlot, activateAbility, performAttack, repairDamage }, meta: { workRemaining, activeSlots, maxSlots } }
}
