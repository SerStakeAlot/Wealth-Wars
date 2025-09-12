import { create } from 'zustand'

// Core game interfaces based on comprehensive mechanics document
export interface Player {
  id: string
  level: number
  xp: number
  credits: number
  wealth: number
  walletAddress?: string
  workStreak: number
  lastWorkDate: string
  workSessionCount: number
  lastSessionEnd: number
  // Timestamp of the last work click (ms since epoch)
  lastWorkTimestamp?: number
  // Number of consecutive work clicks since the last long cooldown
  consecutiveWorkClicks?: number
  warScore: number
  landNFTs: number
  clanId?: string
  clanRole?: 'member' | 'elder' | 'co-leader' | 'leader'
}

export interface Business {
  id: string
  name: string
  description: string
  icon: string
  baseCost: number
  workMultiplier: number // percentage bonus to work
  outlets: number
  condition: number // 0-100%
  hasManager: boolean
  lastMaintenance: number
}

export interface EnhancedBusiness {
  id: string
  name: string
  description: string
  icon: string
  category: 'efficiency' | 'defensive' | 'offensive' | 'utility'
  cost: number // in $WEALTH
  workMultiplier: number
  abilityName: string
  abilityDescription: string
  abilityType: 'passive' | 'active' | 'upgrade' | 'sustained'
  cooldown: number // milliseconds
  lastActivated: number
  owned: boolean
  active: boolean
  abilityCharges?: number
  maxCharges?: number
}

export interface BattleState {
  lastStandardAttack: number
  lastWealthAssault: number
  lastLandSiege: number
  lastBusinessSabotage: number
  attacksToday: number
  successfulAttacksToday: number
  defenseRating: number
  activeShield?: {
    type: 'basic' | 'advanced' | 'elite'
    expires: number
  }
  businessDamage: number // 0-100%
}

export interface LandNFT {
  id: string
  dailyYield: number
  lastRaid?: number
  raidEnd?: number
  raiderId?: string
}

export interface Clan {
  id: string
  name: string
  tag: string
  level: number
  members: number
  maxMembers: number
  leader: string
  description: string
  totalWealth: number
  trophies: number
  rank: number
}

interface GameState {
  // Player state
  player: Player

  // Business systems
  businesses: Business[]
  enhancedBusinesses: EnhancedBusiness[]
  activeSlots: string[] // IDs of active enhanced businesses
  maxSlots: number

  // Battle system
  battleState: BattleState
  activeRaids: Array<{
    id: string
    targetId: string
    startTime: number
    endTime: number
    yieldStolen: number
  }>

  // Land NFT system
  landNFTs: LandNFT[]

  // Clan system
  currentClan?: Clan

  // Treasury/AMM system
  treasuryReserve: {
    credits: number
    wealth: number
  }
  conversionRate: number // credits to $WEALTH ratio
  // Reverse rate: how many credits you receive per 1 $WEALTH when converting back
  wealthToCreditsRate: number

  // UI state
  showShareModal: boolean
  // If true the next work action gets a 1.5x multiplier. Cleared after used.
  shareBoostActive: boolean
  // Last boost event for UI feedback (transient)
  lastBoostEvent?: { id: string; message: string; timestamp: number } | null
  currentTime: number

  // Actions
  initializePlayer: (walletAddress?: string) => void
  doWork: () => void
  buyBusinessOutlet: (businessId: string) => void
  setShareBoostActive: (active: boolean) => void
  hireManager: (businessId: string) => void
  repairBusiness: (businessId: string, repairAmount: number) => void
  buyEnhancedBusiness: (businessId: string) => void
  activateEnhancedBusiness: (businessId: string) => void
  toggleBusinessSlot: (businessId: string) => void
  convertCreditsToWealth: (amount: number) => void
  convertWealthToCredits: (amount: number) => void

  // Battle actions
  performAttack: (targetId: string, attackType: 'standard' | 'wealth_assault' | 'land_siege' | 'business_sabotage') => { success: boolean; message?: string; stolen?: number; damage?: number }
  purchaseShield: (type: 'basic' | 'advanced' | 'elite') => void
  repairBusinessDamage: () => void

  // Land NFT actions
  mintLandNFT: () => void
  collectLandYield: () => void

  // Utility actions
  updateTime: () => void
  setShowShareModal: (show: boolean) => void
  clearLastBoostEvent: () => void
  calculateWAR: () => number
  getWorkMultiplier: () => number
  getDefenseRating: () => number
}

// Mock businesses data based on comprehensive mechanics document
const mockBusinesses: Business[] = [
  {
    id: 'lemonade_stand',
    name: 'Lemonade Stand',
    description: 'A classic neighborhood business',
    icon: '🥤',
    baseCost: 10,
    workMultiplier: 5, // 5% bonus to work
    outlets: 0,
    condition: 100,
    hasManager: false,
    lastMaintenance: 0
  },
  {
    id: 'coffee_cafe',
    name: 'Coffee Cafe',
    description: 'Premium coffee experience',
    icon: '☕',
    baseCost: 50,
    workMultiplier: 15, // 15% bonus to work
    outlets: 0,
    condition: 100,
    hasManager: false,
    lastMaintenance: 0
  },
  {
    id: 'widget_factory',
    name: 'Widget Factory',
    description: 'Manufacturing excellence',
    icon: '🏭',
    baseCost: 200,
    workMultiplier: 25, // 25% bonus to work
    outlets: 0,
    condition: 100,
    hasManager: false,
    lastMaintenance: 0
  }
]

// Enhanced businesses with proper mechanics
const mockEnhancedBusinesses: EnhancedBusiness[] = [
  {
    id: 'automation_factory',
    name: 'Automation Factory',
    description: 'A cutting-edge facility that automates your business processes',
    icon: '🏭',
    category: 'efficiency',
    cost: 75, // $WEALTH cost
    workMultiplier: 100,
    abilityName: 'Rapid Processing',
    abilityDescription: 'Reduces all cooldowns by 50% for 24 hours',
    abilityType: 'active',
    cooldown: 604800000, // 7 days
    lastActivated: 0,
    owned: false,
    active: false
  },
  {
    id: 'fast_food_chain',
    name: 'Fast Food Chain',
    description: 'Quick service restaurant empire',
    icon: '🍔',
    category: 'efficiency',
    cost: 35,
    workMultiplier: 75,
    abilityName: 'Quick Service',
    abilityDescription: 'Next 3 work actions provide 20% bonus credits',
    abilityType: 'active',
    cooldown: 432000000, // 5 days
    lastActivated: 0,
    owned: false,
    active: false
  },
  {
    id: 'innovation_lab',
    name: 'Innovation Lab',
    description: 'Research facility that develops new technologies',
    icon: '🔬',
    category: 'efficiency',
    cost: 50,
    workMultiplier: 60,
    abilityName: 'Breakthrough',
    abilityDescription: 'Next work action provides 3x credits',
    abilityType: 'active',
    cooldown: 345600000, // 4 days
    lastActivated: 0,
    owned: false,
    active: false
  },
  {
    id: 'security_firm',
    name: 'Security Firm',
    description: 'Military-grade protection services',
    icon: '🛡️',
    category: 'defensive',
    cost: 40,
    workMultiplier: 50,
    abilityName: 'Fortress Protection',
    abilityDescription: 'Reduces takeover success rate by 50% for 48 hours',
    abilityType: 'passive',
    cooldown: 0,
    lastActivated: 0,
    owned: false,
    active: false
  },
  {
    id: 'insurance_company',
    name: 'Insurance Company',
    description: 'Elite protection and intelligence',
    icon: '🏥',
    category: 'defensive',
    cost: 15,
    workMultiplier: 40,
    abilityName: 'Damage Insurance',
    abilityDescription: 'If work streak breaks, only lose 50% instead of resetting to 0',
    abilityType: 'passive',
    cooldown: 0,
    lastActivated: 0,
    owned: false,
    active: false
  },
  {
    id: 'government_contract',
    name: 'Government Contract',
    description: 'Hostile takeover specialists',
    icon: '🏛️',
    category: 'defensive',
    cost: 200,
    workMultiplier: 80,
    abilityName: 'Diplomatic Immunity',
    abilityDescription: 'Cannot be targeted by takeovers. +10% multiplier to all businesses.',
    abilityType: 'passive',
    cooldown: 0,
    lastActivated: 0,
    owned: false,
    active: false
  },
  {
    id: 'consulting_firm',
    name: 'Consulting Firm',
    description: 'Business consulting and competitive analysis',
    icon: '💼',
    category: 'offensive',
    cost: 45,
    workMultiplier: 45,
    abilityName: 'Corporate Espionage',
    abilityDescription: 'Add 6 hours to target player\'s work cooldown',
    abilityType: 'active',
    cooldown: 1209600000, // 14 days
    lastActivated: 0,
    owned: false,
    active: false
  },
  {
    id: 'cyber_security',
    name: 'Cyber Security',
    description: 'Advanced offensive capabilities for PvP',
    icon: '💻',
    category: 'offensive',
    cost: 60,
    workMultiplier: 30,
    abilityName: 'System Disruption',
    abilityDescription: 'Disable target\'s defensive businesses for 2 hours',
    abilityType: 'active',
    cooldown: 86400000, // 1 day
    lastActivated: 0,
    owned: false,
    active: false
  },
  {
    id: 'investment_bank',
    name: 'Investment Bank',
    description: 'Advanced wealth management and compound growth',
    icon: '🏦',
    category: 'utility',
    cost: 100,
    workMultiplier: 80,
    abilityName: 'Compound Interest',
    abilityDescription: 'Generate 5% interest on $WEALTH holdings daily for 7 days',
    abilityType: 'active',
    cooldown: 604800000, // 7 days
    lastActivated: 0,
    owned: false,
    active: false
  },
  {
    id: 'trading_exchange',
    name: 'Trading Exchange',
    description: 'Foundational trading business for currency optimization',
    icon: '💱',
    category: 'utility',
    cost: 150,
    workMultiplier: 25,
    abilityName: 'Arbitrage',
    abilityDescription: '15% better conversion rates between credits and $WEALTH',
    abilityType: 'passive',
    cooldown: 0,
    lastActivated: 0,
    owned: false,
    active: false
  },
  {
    id: 'market_research',
    name: 'Market Research',
    description: 'Intelligence gathering and market analysis',
    icon: '📊',
    category: 'offensive',
    cost: 12,
    workMultiplier: 35,
    abilityName: 'Intelligence Gathering',
    abilityDescription: 'Reveal target player\'s business portfolio and cooldowns',
    abilityType: 'active',
    cooldown: 43200000, // 12 hours
    lastActivated: 0,
    owned: false,
    active: false
  },
  {
    id: 'marketing_agency',
    name: 'Marketing Agency',
    description: 'Marketing and advertising services',
    icon: '📢',
    category: 'utility',
    cost: 30,
    workMultiplier: 30,
    abilityName: 'Market Boost',
    abilityDescription: '25% better conversion rates for 8 hours',
    abilityType: 'active',
    cooldown: 129600000, // 36 hours
    lastActivated: 0,
    owned: false,
    active: false
  },
  {
    id: 'venture_capital',
    name: 'Venture Capital',
    description: 'High-risk, high-reward investment opportunities',
    icon: '🎰',
    category: 'utility',
    cost: 20,
    workMultiplier: 35,
    abilityName: 'Risky Investment',
    abilityDescription: '60% chance +50 bonus credits, 40% chance lose 25 credits',
    abilityType: 'active',
    cooldown: 10800000, // 3 hours
    lastActivated: 0,
    owned: false,
    active: false
  }
]

// Create the comprehensive game store
export const useGameStore = create<GameState>((set, get) => ({
  // Player state
  player: {
    id: 'demo-player',
    level: 1,
    xp: 0,
    credits: 100,
    wealth: 1000,
    walletAddress: undefined,
    workStreak: 0,
    lastWorkDate: '',
    workSessionCount: 0,
    lastSessionEnd: 0,
    warScore: 1000,
    landNFTs: 0
  },

  // Business systems
  businesses: mockBusinesses,
  enhancedBusinesses: mockEnhancedBusinesses,
  activeSlots: [],
  maxSlots: 3,

  // Battle system
  battleState: {
    lastStandardAttack: 0,
    lastWealthAssault: 0,
    lastLandSiege: 0,
    lastBusinessSabotage: 0,
    attacksToday: 0,
    successfulAttacksToday: 0,
    defenseRating: 50,
    businessDamage: 0
  },

  // Active raids
  activeRaids: [],

  // Land NFT system
  landNFTs: [],

  // Treasury system
  treasuryReserve: {
    credits: 1000000,
    wealth: 10000
  },
  conversionRate: 100, // 100 credits = 1 $WEALTH
  // When converting back, 1 $WEALTH -> 50 credits
  wealthToCreditsRate: 50,

  // UI state
  showShareModal: false,
  shareBoostActive: false,
  currentTime: Date.now(),

  // Actions
  initializePlayer: (walletAddress?: string) => {
    set(state => ({
      player: {
        ...state.player,
        id: walletAddress ? `player-${walletAddress.slice(0, 8)}` : 'demo-player',
        walletAddress
      }
    }))
  },
  doWork: () => {
    const now = Date.now()
    const state = get()

    const last = state.player.lastWorkTimestamp || 0
    let consecutive = state.player.consecutiveWorkClicks || 0

    // If it's been a long time (>= 6 hours) since last work, reset consecutive counter
    const sixHours = 6 * 60 * 60 * 1000
    const twoHours = 2 * 60 * 60 * 1000
    if (last === 0 || (now - last) >= sixHours) {
      consecutive = 0
    }

    // Determine required cooldown before allowing new click: 2h normally, 6h when this is the 4th
    const requiredCooldown = (consecutive >= 3) ? sixHours : twoHours
    if (last !== 0 && (now - last) < requiredCooldown) {
      return // Still on cooldown
    }

    const workMultiplier = get().getWorkMultiplier()
    const baseCredits = 25
    const bonusCredits = Math.floor(baseCredits * (workMultiplier / 100))
    let totalCredits = baseCredits + bonusCredits

    // Apply enhanced-business active charges/effects
    const enhancedBusinesses = state.enhancedBusinesses.slice()
    enhancedBusinesses.forEach((b, idx) => {
      if (!b.owned || !b.active) return

      // Fast Food Chain: abilityCharges provide 20% bonus per charge (consumed on work)
      if (b.id === 'fast_food_chain' && b.abilityCharges && b.abilityCharges > 0) {
        totalCredits = Math.floor(totalCredits * 1.2)
        // consume one charge
        enhancedBusinesses[idx] = { ...b, abilityCharges: b.abilityCharges - 1 }
        // set transient boost event for UI
        set(s => ({ lastBoostEvent: { id: b.id, message: 'Quick Service used: +20% credits', timestamp: Date.now() } }))
      }

      // Innovation Lab: next work action provides 3x credits (consumed)
      if (b.id === 'innovation_lab' && b.abilityCharges && b.abilityCharges > 0) {
        totalCredits = totalCredits * 3
        enhancedBusinesses[idx] = { ...b, abilityCharges: b.abilityCharges - 1 }
        set(s => ({ lastBoostEvent: { id: b.id, message: 'Breakthrough used: 3x credits', timestamp: Date.now() } }))
      }

      // Automation Factory: if active (slot) reduce required cooldowns by 50% — handled in getWorkMultiplier/cooldown checks indirectly
    })

    // write back any consumed charges
    set(state => ({ enhancedBusinesses: enhancedBusinesses }))

    // Apply share boost (1.5x) if active for next work action
    if (state.shareBoostActive) {
      totalCredits = Math.floor(totalCredits * 1.5)
    }

    const xpGained = 25 + (state.player.workStreak * 2)

    // Update state: credits, xp, streak, timestamps, and consecutive click count
    set(state => ({
      player: {
        ...state.player,
        credits: state.player.credits + totalCredits,
        xp: state.player.xp + xpGained,
        workStreak: state.player.workStreak + 1,
        lastWorkDate: new Date().toISOString().split('T')[0],
        workSessionCount: state.player.workSessionCount + 1,
        lastSessionEnd: now,
        lastWorkTimestamp: now,
        consecutiveWorkClicks: (consecutive || 0) + 1,
        level: Math.floor(state.player.xp / 1000) + 1
      },
      // after showing share modal, clear the one-time boost
      shareBoostActive: false,
      showShareModal: Math.random() > 0.8 // 20% chance to show share modal
    }))
  },

  buyBusinessOutlet: (businessId: string) => {
    const state = get()
    const businessIndex = state.businesses.findIndex(b => b.id === businessId)

    if (businessIndex >= 0) {
      const business = state.businesses[businessIndex]
      const cost = Math.floor(business.baseCost * Math.pow(1.15, business.outlets))

      if (state.player.credits >= cost) {
        set(state => ({
          player: {
            ...state.player,
            credits: state.player.credits - cost
          },
          businesses: state.businesses.map((b, i) =>
            i === businessIndex ? { ...b, outlets: b.outlets + 1 } : b
          )
        }))
      }
    }
  },

  hireManager: (businessId: string) => {
    const state = get()
    const businessIndex = state.businesses.findIndex(b => b.id === businessId)

    if (businessIndex >= 0) {
      const business = state.businesses[businessIndex]
      const cost = business.baseCost * 5

      if (state.player.credits >= cost && !business.hasManager) {
        set(state => ({
          player: {
            ...state.player,
            credits: state.player.credits - cost
          },
          businesses: state.businesses.map((b, i) =>
            i === businessIndex ? { ...b, hasManager: true } : b
          )
        }))
      }
    }
  },

  repairBusiness: (businessId: string, repairAmount: number) => {
    const state = get()
    const businessIndex = state.businesses.findIndex(b => b.id === businessId)

    if (businessIndex >= 0) {
      const business = state.businesses[businessIndex]
      const repairCost = Math.floor((100 - business.condition) * business.baseCost * 0.1)

      if (state.player.credits >= repairCost) {
        set(state => ({
          player: {
            ...state.player,
            credits: state.player.credits - repairCost
          },
          businesses: state.businesses.map((b, i) =>
            i === businessIndex ? {
              ...b,
              condition: Math.min(100, b.condition + repairAmount),
              lastMaintenance: Date.now()
            } : b
          )
        }))
      }
    }
  },

  buyEnhancedBusiness: (businessId: string) => {
    const state = get()
    const businessIndex = state.enhancedBusinesses.findIndex(b => b.id === businessId)

    if (businessIndex >= 0) {
      const business = state.enhancedBusinesses[businessIndex]

      if (state.player.wealth >= business.cost && !business.owned) {
        set(state => ({
          player: {
            ...state.player,
            wealth: state.player.wealth - business.cost
          },
          enhancedBusinesses: state.enhancedBusinesses.map((b, i) =>
            i === businessIndex ? { ...b, owned: true } : b
          )
        }))
      }
    }
  },

  activateEnhancedBusiness: (businessId: string) => {
    const state = get()
    const businessIndex = state.enhancedBusinesses.findIndex(b => b.id === businessId)

    if (businessIndex >= 0) {
      const business = state.enhancedBusinesses[businessIndex]
      const now = Date.now()

      if (!business.owned || (now - business.lastActivated) < business.cooldown) {
        return
      }

      if (business.abilityType === 'active') {
        // Set active and lastActivated for this business; handle special cases
        set(state => ({
          enhancedBusinesses: state.enhancedBusinesses.map((b, i) =>
            i === businessIndex ? { ...b, lastActivated: now, active: true } : b
          )
        }))

        // Special-case effects
        if (business.id === 'security_firm') {
          // Fortress Protection: grant an active shield for 48 hours
          set(state => ({
            battleState: {
              ...state.battleState,
              activeShield: {
                type: 'advanced',
                expires: now + 172800000 // 48 hours
              }
            }
          }))
        }

        if (business.id === 'fast_food_chain') {
          // Quick Service: next 3 work actions get a 20% bonus; store abilityCharges
          set(state => ({
            enhancedBusinesses: state.enhancedBusinesses.map((b, i) =>
              i === businessIndex ? { ...b, abilityCharges: 3, lastActivated: now, active: true } : b
            )
          }))
        }

        if (business.id === 'innovation_lab') {
          // Breakthrough: next work action provides 3x credits
          set(state => ({
            enhancedBusinesses: state.enhancedBusinesses.map((b, i) =>
              i === businessIndex ? { ...b, abilityCharges: 1, lastActivated: now, active: true } : b
            )
          }))
        }
      }
    }
  },

  toggleBusinessSlot: (businessId: string) => {
    const state = get()
    const business = state.enhancedBusinesses.find(b => b.id === businessId)

    if (!business || !business.owned) return

    set(state => {
      const isActive = state.activeSlots.includes(businessId)

      if (isActive) {
        return {
          activeSlots: state.activeSlots.filter(id => id !== businessId),
          enhancedBusinesses: state.enhancedBusinesses.map(b =>
            b.id === businessId ? { ...b, active: false } : b
          )
        }
      } else if (state.activeSlots.length < state.maxSlots) {
        return {
          activeSlots: [...state.activeSlots, businessId],
          enhancedBusinesses: state.enhancedBusinesses.map(b =>
            b.id === businessId ? { ...b, active: true } : b
          )
        }
      }

      return state
    })
  },

  convertCreditsToWealth: (amount: number) => {
    const state = get()
    const wealthGained = Math.floor(amount / state.conversionRate)

    if (state.player.credits >= amount && amount > 0) {
      set(state => ({
        player: {
          ...state.player,
          credits: state.player.credits - amount,
          wealth: state.player.wealth + wealthGained
        }
      }))
    }
  },

  convertWealthToCredits: (amount: number) => {
    const state = get()
    const creditsGained = Math.floor(amount * state.wealthToCreditsRate)

    if (state.player.wealth >= amount && amount > 0) {
      set(state => ({
        player: {
          ...state.player,
          credits: state.player.credits + creditsGained,
          wealth: state.player.wealth - amount
        }
      }))
    }
  },

  performAttack: (targetId: string, attackType: 'standard' | 'wealth_assault' | 'land_siege' | 'business_sabotage') => {
    // Implemented per Wealth Wars mechanics: costs, cooldowns, success, theft, sabotage
    const state = get()
    const now = Date.now()

    // cooldowns (ms) per doc
    const cooldowns: Record<'standard' | 'wealth_assault' | 'land_siege' | 'business_sabotage', number> = {
      standard: 4 * 60 * 60 * 1000, // 4 hours
      wealth_assault: 12 * 60 * 60 * 1000, // 12 hours
      land_siege: 24 * 60 * 60 * 1000, // 24 hours
      business_sabotage: 8 * 60 * 60 * 1000 // 8 hours
    }

    const lastKey = `last${attackType.charAt(0).toUpperCase() + attackType.slice(1).replace('_', '')}` as keyof BattleState
  const rawLast = state.battleState[lastKey]
  const lastAttack = typeof rawLast === 'number' ? rawLast : 0
  if ((now - lastAttack) < cooldowns[attackType as keyof typeof cooldowns]) return { success: false, message: 'On cooldown' }

    // cost and max theft definitions
    const costs = {
      standard: { amount: 15, currency: 'credits' },
      wealth_assault: { amount: 10, currency: 'wealth' },
      land_siege: { amount: 25, currency: 'wealth' },
      business_sabotage: { amount: 25, currency: 'credits' }
    } as any

    const maxTheftPct: Record<string, number> = {
      standard: 0.10,
      wealth_assault: 0.25,
      land_siege: 0.35,
      business_sabotage: 0
    }

    // Validate attacker resources
    const cost = costs[attackType]
  if (cost.currency === 'credits' && state.player.credits < cost.amount) return { success: false, message: 'Insufficient credits' }
  if (cost.currency === 'wealth' && state.player.wealth < cost.amount) return { success: false, message: 'Insufficient WEALTH' }

    // Find target in multiplayer store (demo mode)
    let multiplayerStore
    try {
      // dynamic import to avoid circular in some setups
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      multiplayerStore = require('./multiplayerStore').useMultiplayerStore
    } catch (e) {
      multiplayerStore = undefined
    }

  const target = multiplayerStore ? multiplayerStore.getState().onlinePlayers.find((p: any) => p.id === targetId) : undefined

    // Deduct cost from attacker
    if (cost.currency === 'credits') {
      set(s => ({ player: { ...s.player, credits: s.player.credits - cost.amount } }))
    } else {
      set(s => ({ player: { ...s.player, wealth: s.player.wealth - cost.amount } }))
    }

    // compute success chance (base 60% with WAR diff influence)
    const targetWar = (target && (target as any).warScore) || 1000
    let successChance = 0.6 + ((state.player.warScore - targetWar) / 2000)
    successChance = Math.max(0.05, Math.min(0.95, successChance))

    // Shields and defensive businesses: if the multiplayer store provides
    // per-player battleState, consult it for shields and insurance flags
    const targetHasShield = !!(target && (target as any).battleState && (target as any).battleState.activeShield && ((target as any).battleState.activeShield.expires || 0) > Date.now())

    // Determine bypass behavior
    const bypassesDefense = (attackType === 'wealth_assault' || attackType === 'land_siege')

    if (!bypassesDefense && targetHasShield) {
      // target protected by shield - attack fails
      set(s => ({ battleState: { ...s.battleState, [lastKey]: now, attacksToday: s.battleState.attacksToday + 1 } as BattleState }))
      return { success: false, message: 'Target shield active' }
    }

    const roll = Math.random()
    if (roll < successChance) {
      // Success
  if (attackType === 'business_sabotage') {
        // Apply 30% damage to target's business multiplier (store as businessDamage percent)
        let damage = 30

        // If target has insurance active, reduce sabotage damage by 50%
        const targetInsurance = !!(target && (target as any).battleState && (target as any).battleState.insuranceActive)
        if (targetInsurance) damage = Math.floor(damage / 2)

        if (multiplayerStore && target) {
          // update target's battleState in multiplayer store when available
          multiplayerStore.setState((ms: any) => ({
            onlinePlayers: ms.onlinePlayers.map((p: any) => p.id === targetId ? { 
              ...p, 
              battleState: { 
                ...(p.battleState || {}), 
                businessDamage: Math.min(100, ((p.battleState && p.battleState.businessDamage) || 0) + damage) 
              } 
            } : p)
          }))
        }

        // increase local placeholder battleState businessDamage as well for singleplayer demo
        set(s => ({ battleState: { ...s.battleState, businessDamage: Math.min(100, s.battleState.businessDamage + damage), [lastKey]: now, attacksToday: s.battleState.attacksToday + 1, successfulAttacksToday: s.battleState.successfulAttacksToday + 1 } as BattleState }))
        return { success: true, message: 'Business sabotaged', damage }
      } else {
        // Theft attacks
        const pct = maxTheftPct[attackType]
        const targetWealth = (target && (target as any).wealth) || 0
        const stolen = Math.floor(targetWealth * pct)

  if (stolen > 0 && multiplayerStore && target) {
          // transfer from target to attacker in multiplayer demo store
          multiplayerStore.setState((state: any) => ({
            onlinePlayers: state.onlinePlayers.map((p: any) => p.id === targetId ? { ...p, wealth: Math.max(0, (p.wealth || 0) - stolen) } : p)
          }))
          // credit attacker
          set(s => ({ player: { ...s.player, wealth: s.player.wealth + stolen }, battleState: { ...s.battleState, [lastKey]: now, attacksToday: s.battleState.attacksToday + 1, successfulAttacksToday: s.battleState.successfulAttacksToday + 1 } as BattleState }))
          return { success: true, message: `Stole ${stolen} WEALTH`, stolen }
        } else {
          // nothing to steal
          set(s => ({ battleState: { ...s.battleState, [lastKey]: now, attacksToday: s.battleState.attacksToday + 1, successfulAttacksToday: s.battleState.successfulAttacksToday + 1 } as BattleState }))
          return { success: true, message: 'Attack succeeded but nothing to steal' }
        }
      }
    } else {
      // Failure
      set(s => ({ battleState: { ...s.battleState, [lastKey]: now, attacksToday: s.battleState.attacksToday + 1 } as BattleState }))
      return { success: false, message: 'Attack failed' }
    }
    // Fallback
    return { success: false, message: 'Unhandled attack outcome' }
  },

  purchaseShield: (type: 'basic' | 'advanced' | 'elite') => {
    const costs = { basic: 100, advanced: 500, elite: 1000 }
    const durations = { basic: 3600000, advanced: 86400000, elite: 259200000 } // 1h, 24h, 72h

    const state = get()
    if (state.player.credits >= costs[type]) {
      set(state => ({
        player: {
          ...state.player,
          credits: state.player.credits - costs[type]
        },
        battleState: {
          ...state.battleState,
          activeShield: {
            type,
            expires: Date.now() + durations[type]
          }
        }
      }))
    }
  },

  repairBusinessDamage: () => {
    const state = get()
    const repairCost = Math.floor(state.battleState.businessDamage * 10)

    if (state.player.credits >= repairCost && state.battleState.businessDamage > 0) {
      set(state => ({
        player: {
          ...state.player,
          credits: state.player.credits - repairCost
        },
        battleState: {
          ...state.battleState,
          businessDamage: 0
        }
      }))
    }
  },

  mintLandNFT: () => {
    const state = get()
    const cost = 1000 // $WEALTH cost

    if (state.player.wealth >= cost) {
      const newLandNFT: LandNFT = {
        id: `land_${Date.now()}`,
        dailyYield: 10 + Math.floor(Math.random() * 20), // 10-30 credits per day
        lastRaid: undefined,
        raidEnd: undefined,
        raiderId: undefined
      }

      set(state => ({
        player: {
          ...state.player,
          wealth: state.player.wealth - cost,
          landNFTs: state.player.landNFTs + 1
        },
        landNFTs: [...state.landNFTs, newLandNFT]
      }))
    }
  },

  collectLandYield: () => {
    const state = get()
    const now = Date.now()
    const oneDay = 86400000

    set(state => ({
      landNFTs: state.landNFTs.map(land => {
        if (!land.lastRaid || (now - (land.lastRaid || 0)) >= oneDay) {
          return {
            ...land,
            lastRaid: now
          }
        }
        return land
      }),
      player: {
        ...state.player,
        credits: state.player.credits + state.landNFTs.reduce((total, land) => {
          if (!land.lastRaid || (now - land.lastRaid) >= oneDay) {
            return total + land.dailyYield
          }
          return total
        }, 0)
      }
    }))
  },

  updateTime: () => {
    set({ currentTime: Date.now() })
  },

  setShowShareModal: (show: boolean) => {
    set({ showShareModal: show })
  },
  clearLastBoostEvent: () => {
    set({ lastBoostEvent: null })
  },

  setShareBoostActive: (active: boolean) => {
    set({ shareBoostActive: active })
  },

  calculateWAR: () => {
    const state = get()
    const businessValue = state.businesses.reduce((total, business) => {
      return total + (business.baseCost * business.outlets * (business.condition / 100))
    }, 0)

    const enhancedValue = state.enhancedBusinesses
      .filter(b => b.owned)
      .reduce((total, business) => total + business.cost, 0)

    const landValue = state.landNFTs.reduce((total, land) => total + 1000, 0) // Base mint cost

    const totalAssets = businessValue + enhancedValue + landValue + state.player.credits + (state.player.wealth * state.conversionRate)

    return Math.floor(totalAssets / 1000) // WAR score calculation
  },

  getWorkMultiplier: () => {
    const state = get()
    let multiplier = 0

    // Basic businesses
    state.businesses.forEach(business => {
      multiplier += business.workMultiplier * business.outlets
    })

    // Enhanced businesses (active slots only)
    state.enhancedBusinesses.forEach(business => {
      if (business.owned && state.activeSlots.includes(business.id)) {
        multiplier += business.workMultiplier
      }
    })

    return Math.min(multiplier, 200) // Cap at 200%
  },

  getDefenseRating: () => {
    const state = get()
    let defense = state.battleState.defenseRating

    // Enhanced businesses defensive bonuses
    state.enhancedBusinesses.forEach(business => {
      if (business.owned && business.category === 'defensive' && state.activeSlots.includes(business.id)) {
        if (business.id === 'security_firm') {
          defense += 50 // Fortress Protection bonus
        } else if (business.id === 'insurance_company') {
          defense += 25 // Damage Insurance bonus
        } else if (business.id === 'government_contract') {
          defense += 75 // Diplomatic Immunity bonus
        }
      }
    })

    // Shield bonus
    if (state.battleState.activeShield && state.battleState.activeShield.expires > Date.now()) {
      defense += state.battleState.activeShield.type === 'basic' ? 25 :
                state.battleState.activeShield.type === 'advanced' ? 50 : 75
    }

    return Math.min(defense, 100)
  }
}))