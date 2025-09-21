// Minimal types for pixel UI; adapter will map real store state into this shape.
export interface PixelBusiness {
  id: string
  name: string
  cost: number
  creditBoost: number
  tier: 1 | 2 | 3
  owned: boolean
  enhanced?: boolean // true if from enhancedBusinesses list
  // Optional ability metadata for enhanced businesses
  abilityCharges?: number
  cooldownMs?: number
  lastActivated?: number
  abilityType?: 'passive' | 'active' | 'upgrade' | 'sustained'
  abilityName?: string
  abilityDescription?: string
  image?: string // optional pixel image path
}

export interface PixelGameState {
  credits: number
  wealth: number
  shieldExpiresAt: number | null
  businesses: PixelBusiness[]
  dailyWealthConverted: number
  globalPoolRemaining: number
  expectedWorkPayout?: number
}

export interface PixelLotteryState {
  currentPot: number
  myTickets: number
  drawsAt: number
  isActive: boolean
}
