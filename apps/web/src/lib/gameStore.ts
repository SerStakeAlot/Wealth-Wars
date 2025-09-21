"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { calculateActiveSynergies, calculateSynergyEffects } from '@/app/lib/synergies'
import { useNotificationStore } from '@/lib/notificationStore'

// Manager configuration
const MANAGER_CHARGES_PER_HIRE = 20

// Core game interfaces based on comprehensive mechanics document
export interface Player {
  id: string
  level: number
  xp: number
  credits: number
  wealth: number
  // Cumulative stats
  totalCreditsEarned?: number
  battlesWon?: number
  battlesLost?: number
  // Off-chain demo wallet balances for DEX
  usd?: number
  sol?: number
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
  // Maintenance
  condition?: number // 0-100%, defaults to 100 when present
  lastMaintenance?: number
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

// Global Manager contract (auto-work) state
interface ManagerState {
  charges: number // remaining automated work actions
  purchases: number // number of manager hires (for cost scaling)
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
  members: number // deprecated counter (kept for legacy UI) – authoritative list in membersList
  maxMembers: number
  leader: string
  description: string
  totalWealth: number
  trophies: number
  rank: number
  xp?: number
  membersList?: Array<{ id: string; role: 'member' | 'elder' | 'co-leader' | 'leader'; joinedAt: number }>
}
// Quest System Types
type QuestType = 'daily' | 'weekly' | 'chain'
type QuestObjectiveType = 'work_clicks' | 'credits_earned' | 'battles_won' | 'wealth_minted' | 'shields_purchased' | 'business_outlets'

interface QuestDefinition {
  id: string
  type: QuestType
  objective: QuestObjectiveType
  target: number
  reward: { credits?: number; wealth?: number; xp?: number; shieldHours?: number }
  chainOrder?: number // for chain type ordering
  description: string
}

interface QuestInstance extends QuestDefinition {
  progress: number
  complete: boolean
  claimed: boolean
  expiresAt?: number
}

const DAILY_QUEST_POOL: QuestDefinition[] = [
  { id: 'dq_work_100', type: 'daily', objective: 'work_clicks', target: 10, reward: { credits: 150, xp: 100 }, description: 'Perform 10 Work actions today' },
  { id: 'dq_convert_wealth', type: 'daily', objective: 'wealth_minted', target: 5, reward: { xp: 150, credits: 75 }, description: 'Mint 5 $WEALTH via Exchange Pool' },
  { id: 'dq_attack_3', type: 'daily', objective: 'battles_won', target: 3, reward: { credits: 120, xp: 120 }, description: 'Win 3 attacks' },
  { id: 'dq_shield_buy', type: 'daily', objective: 'shields_purchased', target: 1, reward: { xp: 80 }, description: 'Purchase a shield' }
]

const WEEKLY_QUEST_POOL: QuestDefinition[] = [
  { id: 'wq_work_70', type: 'weekly', objective: 'work_clicks', target: 70, reward: { credits: 1000, wealth: 5, xp: 800 }, description: 'Perform 70 Work actions this week' },
  { id: 'wq_convert_100', type: 'weekly', objective: 'wealth_minted', target: 100, reward: { wealth: 15, xp: 1200 }, description: 'Mint 100 $WEALTH this week' },
  { id: 'wq_battles_25', type: 'weekly', objective: 'battles_won', target: 25, reward: { credits: 1500, xp: 1500 }, description: 'Win 25 successful attacks' }
]

// Simple chain (progressive) example
const CHAIN_QUESTS: QuestDefinition[] = [
  { id: 'chain_builder_1', type: 'chain', chainOrder: 0, objective: 'business_outlets', target: 10, reward: { credits: 200, xp: 200 }, description: 'Own 10 total business outlets' },
  { id: 'chain_builder_2', type: 'chain', chainOrder: 1, objective: 'business_outlets', target: 25, reward: { credits: 400, xp: 400 }, description: 'Own 25 total business outlets' },
  { id: 'chain_builder_3', type: 'chain', chainOrder: 2, objective: 'business_outlets', target: 50, reward: { credits: 800, xp: 900, wealth: 10 }, description: 'Own 50 total business outlets' }
]

interface GameState {
  // Player state
  player: Player

  // Business systems
  businesses: Business[]
  enhancedBusinesses: EnhancedBusiness[]
  activeSlots: string[] // IDs of active enhanced businesses
  // maxSlots is now derived from level thresholds; we keep a persisted value for backward compat
  maxSlots: number
  // Helper to compute how many slots are currently unlocked from player level
  getUnlockedSlots?: () => number
  recalcExchangeCaps?: () => void
  // Quest system
  questsActive?: QuestInstance[]
  questLastInit?: number
  questDailyResetAt?: number
  questWeeklyResetAt?: number
  initQuests?: () => void
  incrementQuestProgress?: (kind: QuestObjectiveType, amount?: number) => void
  claimQuest?: (id: string) => { success: boolean; rewards?: string; reason?: string }
  refreshQuestRotations?: () => void

  // Achievements
  achievementsClaimed: string[]
  // (Optional) future: persisted achievement meta if we allow user-generated
  getAchievementTiers?: () => Array<AchievementTier>
  getActiveAchievementStages?: () => Array<AchievementTier & { progress: number; unlocked: boolean; claimed: boolean }>

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
  clans?: Clan[]
  createClan?: (name: string, tag: string, description?: string) => { success: boolean; reason?: string }
  joinClan?: (clanId: string) => { success: boolean; reason?: string }
  leaveClan?: () => { success: boolean; reason?: string }
  getClanById?: (id: string) => Clan | undefined
  // Clan role & management additions
  promoteMember?: (clanId: string, memberId: string) => { success: boolean; reason?: string }
  demoteMember?: (clanId: string, memberId: string) => { success: boolean; reason?: string }
  kickMember?: (clanId: string, memberId: string) => { success: boolean; reason?: string }
  requestClanInvite?: (clanId: string) => { success: boolean; reason?: string }
  acceptClanInvite?: (inviteId: string) => { success: boolean; reason?: string }
  declineClanInvite?: (inviteId: string) => { success: boolean; reason?: string }
  addClanXp?: (amount: number) => void

  clanInvites?: Array<{ id: string; clanId: string; clanName: string; tag: string; created: number }>
  globalChat?: Array<{ id: string; from: string; text: string; ts: number }>
  clanChat?: Record<string, Array<{ id: string; from: string; text: string; ts: number }>>
  postGlobalMessage?: (text: string) => { success: boolean; reason?: string }
  postClanMessage?: (text: string) => { success: boolean; reason?: string }
  // Unread chat tracking (primitive counters only for stable selectors)
  lastSeenGlobalChatCount?: number
  lastSeenClanChatCounts?: Record<string, number>
  markGlobalChatRead?: () => void
  markClanChatRead?: (clanId: string) => void

  // Treasury/AMM system
  treasuryReserve: {
    credits: number
    wealth: number
  }
  // Exchange Pool: one-way Credits -> $WEALTH with daily caps
  exchangePool: {
    rateCreditsPerWealth: number // how many credits per 1 WEALTH
    feeBps: number // basis points fee applied on input credits
    globalDailyCapWealth: number // max WEALTH minted per day globally
    userDailyCapWealth: number // max WEALTH minted per user per day
    redeemedTodayWealth: number // total minted today globally
    perUserRedeemedToday: Record<string, number> // minted per user today
    resetAt: number // timestamp (ms) when counters reset (typically next UTC midnight)
  }
  conversionRate: number // credits to $WEALTH ratio
  // Reverse rate: how many credits you receive per 1 $WEALTH when converting back
  wealthToCreditsRate: number

  // Simple market/DEX configuration (demo/off-chain)
  marketPrices?: {
    solUsd: number // 1 SOL = X USD
    wealthUsd: number // 1 WEALTH = X USD
  }
  dexFeeBps?: number // fee in basis points (e.g., 50 = 0.50%)
  // Optional external DEX adapter (for on-chain/integration)
  setDexAdapter?: (adapter: {
    getQuote?: (from: 'USD' | 'SOL' | 'WEALTH', to: 'USD' | 'SOL' | 'WEALTH', amount: number) => Promise<{ amountOut: number; fee?: number }>
    swap?: (from: 'USD' | 'SOL' | 'WEALTH', to: 'USD' | 'SOL' | 'WEALTH', amount: number) => Promise<{ success: boolean; amountOut?: number; fee?: number; error?: string }>
  } | null) => void
  _dexAdapter?: {
    getQuote?: (from: 'USD' | 'SOL' | 'WEALTH', to: 'USD' | 'SOL' | 'WEALTH', amount: number) => Promise<{ amountOut: number; fee?: number }>
    swap?: (from: 'USD' | 'SOL' | 'WEALTH', to: 'USD' | 'SOL' | 'WEALTH', amount: number) => Promise<{ success: boolean; amountOut?: number; fee?: number; error?: string }>
  } | null

  

  // UI state
  showShareModal: boolean
  // If true the next work action gets a 1.5x multiplier. Cleared after used.
  shareBoostActive: boolean
  // Last boost event for UI feedback (transient)
  lastBoostEvent?: { id: string; message: string; timestamp: number } | null
  currentTime: number
  // Amount of credits earned in the most recent Work action (for sharing)
  lastWorkReward?: number

  // Timed/sustained effects and utility flags
  rapidProcessingUntil?: number // halves work cooldown while active
  compoundActiveUntil?: number // investment bank accrual window end
  compoundLastTick?: number // last interest grant ts
  conversionBoostUntil?: number // marketing agency conversion buff
  intelRevealUntil?: number // market research intel window
  bypassDefensesUntil?: number // cyber security offensive window
  synergyLastTick?: number // last daily synergy wealth grant

  // Global Manager
  manager: ManagerState

  // On-chain adapter toggle and hooks (optional wiring)
  onChainEnabled?: boolean
  setOnChainEnabled?: (enabled: boolean) => void
  setOnChainAdapter?: (adapter: {
    initializePlayer?: () => Promise<{ success: boolean; error?: string }>
    doWork?: () => Promise<{ success: boolean; reward?: number; cooldownRemaining?: number; error?: string }>
    purchaseBusiness?: (businessId: number) => Promise<{ success: boolean; businessId?: number; cost?: number; error?: string }>
    getPlayerState?: () => Promise<{
      owner: any;
      lastWorkTimestamp: any;
      streakCount: number;
      workFrequencyLevel: number;
      totalWorkActions: any;
      credits: any;
      wealthTokens: any;
      businessesOwned: number[];
      activeBusinessSlots: number[];
      lastStreakCheck: any;
      cooldownHours: number;
      bump: number;
    } | null>
    getCooldownRemaining?: () => Promise<number>
  } | null) => void
  // internal holder for adapter
  _onChainAdapter?: {
    initializePlayer?: () => Promise<{ success: boolean; error?: string }>
    doWork?: () => Promise<{ success: boolean; reward?: number; cooldownRemaining?: number; error?: string }>
    purchaseBusiness?: (businessId: number) => Promise<{ success: boolean; businessId?: number; cost?: number; error?: string }>
    getPlayerState?: () => Promise<{
      owner: any;
      lastWorkTimestamp: any;
      streakCount: number;
      workFrequencyLevel: number;
      totalWorkActions: any;
      credits: any;
      wealthTokens: any;
      businessesOwned: number[];
      activeBusinessSlots: number[];
      lastStreakCheck: any;
      cooldownHours: number;
      bump: number;
    } | null>
    getCooldownRemaining?: () => Promise<number>
  } | null
  // If provided by on-chain error result, UI should respect this cooldown end time (ms since epoch)
  onChainCooldownUntil?: number

  // Actions
  initializePlayer: (walletAddress?: string) => void
  doWork: (opts?: { automated?: boolean }) => void
  buyBusinessOutlet: (businessId: string) => void
  setShareBoostActive: (active: boolean) => void
  hireManager: (businessId: string) => void
  repairBusiness: (businessId: string, repairAmount: number) => void
  repairEnhancedBusiness: (businessId: string, repairAmount: number) => void
  buyEnhancedBusiness: (businessId: string) => void
  activateEnhancedBusiness: (businessId: string) => void
  toggleBusinessSlot: (businessId: string) => void
  convertCreditsToWealth: (amount: number) => void
  convertWealthToCredits: (amount: number) => void

  // DEX helpers (off-chain demo)
  getDexQuote?: (from: 'USD' | 'SOL' | 'WEALTH', to: 'USD' | 'SOL' | 'WEALTH', amount: number) => { amountOut: number, fee: number }
  swapTokens?: (from: 'USD' | 'SOL' | 'WEALTH', to: 'USD' | 'SOL' | 'WEALTH', amount: number) => { success: boolean, amountOut?: number, fee?: number, error?: string }
  // Market updates
  setMarketPrices?: (next: Partial<{ solUsd: number; wealthUsd: number }>) => void
  nudgeMarketPrices?: () => void
  setDexFeeBps?: (bps: number) => void

  // Lottery system (demo, off-chain)
  lottery: {
    settings: { entryAmount: number; maxEntries: number; durationMs: number }
    currentRound: {
      id: number
      startedAt: number
      durationMs: number
      entries: Array<{ playerId: string; timestamp: number; amount: number }>
      locked: boolean
      settled: boolean
      pot: number
      winnerId?: string
      payouts?: { winner: number; treasury: number; redistribution: number }
      claims?: Record<string, boolean>
    }
    lastRound?: {
      id: number
      startedAt: number
      durationMs: number
      entries: Array<{ playerId: string; timestamp: number; amount: number }>
      locked: boolean
      settled: boolean
      pot: number
      winnerId?: string
      payouts?: { winner: number; treasury: number; redistribution: number }
      claims?: Record<string, boolean>
    }
    // Accumulated redistribution per player across rounds
    claimable?: Record<string, number>
  }
  enterLottery: () => { success: boolean; reason?: string }
  settleLotteryIfNeeded: () => void
  adminForceSettleLottery?: () => void
  _settleLottery?: () => void
  claimLotteryShare: () => { success: boolean; amount?: number; reason?: string }
  getLotteryRemainingMs: () => number
  enterLotteryBot?: (botId: string) => { success: boolean; reason?: string }

  // Battle actions
  performAttack: (targetId: string, attackType: 'standard' | 'wealth_assault' | 'land_siege' | 'business_sabotage') => { success: boolean; message?: string; stolen?: number; damage?: number }
  purchaseShield: (type: 'basic' | 'advanced' | 'elite') => void
  repairBusinessDamage: () => void
  claimAchievement: (id: string) => { success: boolean; reason?: string }

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
  // Centralized helpers
  getBusinessProfit: (businessOrId: string | Business) => number
  getOutletNextCost: (businessId: string) => number
  getWorkCooldownRemaining: (now?: number) => number
  // Preview next Work payout considering multipliers, abilities, synergies, and boosts
  getExpectedWorkPayout: () => number
  autoManagerWork: () => void
  // Manager helpers
  getManagerCost: () => number
  hireGlobalManager: () => void
  // Offline catch-up
  catchUpManagerWork: () => void
  // Internal helper (exposed for store-internal calls)
  _applyWork: (now: number, automated: boolean) => void
  // Periodic effect processor
  tickEffects: () => void
  // Reset all local progress
  resetGame: () => void
  // NPC Bots (local-only attackable targets when real players scarce)
  npcBots?: Array<{ id: string; name: string; wealth: number; warScore: number; shielded?: boolean; lastUpdated: number }>
  regenerateBots?: () => void
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
    cost: 75,
    workMultiplier: 100,
    abilityName: 'Rapid Processing',
    abilityDescription: 'Reduces all cooldowns by 50% for 24 hours',
    abilityType: 'active',
    cooldown: 86400000, // 24 hours
    lastActivated: 0,
    owned: false,
    active: false,
    condition: 100,
    lastMaintenance: 0
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
    cooldown: 43200000, // 12 hours
    lastActivated: 0,
    owned: false,
    active: false,
    condition: 100,
    lastMaintenance: 0
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
    cooldown: 28800000, // 8 hours
    lastActivated: 0,
    owned: false,
    active: false,
    condition: 100,
    lastMaintenance: 0
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
    active: false,
    condition: 100,
    lastMaintenance: 0
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
    active: false,
    condition: 100,
    lastMaintenance: 0
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
    active: false,
    condition: 100,
    lastMaintenance: 0
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
    cooldown: 43200000, // 12 hours
    lastActivated: 0,
    owned: false,
    active: false,
    condition: 100,
    lastMaintenance: 0
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
    cooldown: 28800000, // 8 hours
    lastActivated: 0,
    owned: false,
    active: false,
    condition: 100,
    lastMaintenance: 0
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
    cooldown: 172800000, // 2 days
    lastActivated: 0,
    owned: false,
    active: false,
    condition: 100,
    lastMaintenance: 0
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
    active: false,
    condition: 100,
    lastMaintenance: 0
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
    cooldown: 14400000, // 4 hours
    lastActivated: 0,
    owned: false,
    active: false,
    condition: 100,
    lastMaintenance: 0
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
    cooldown: 28800000, // 8 hours
    lastActivated: 0,
    owned: false,
    active: false,
    condition: 100,
    lastMaintenance: 0
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
    cooldown: 7200000, // 2 hours
    lastActivated: 0,
    owned: false,
    active: false,
    condition: 100,
    lastMaintenance: 0
  }
]

// Create the comprehensive game store
// ------------------------------
// Dynamic Achievement System (tiered)
// ------------------------------
// Each chain reveals the next tier only after claiming the current one.
// IDs intentionally keep original first generation IDs for backward compatibility.
type AchievementTier = {
  id: string
  chain: 'business_owned' | 'credits_earned' | 'battles_won'
  order: number // sequence within chain
  category: 'Business' | 'Wealth' | 'Combat'
  name: string
  description: string
  thresholdType: 'enhancedOwned' | 'creditsEarned' | 'battlesWon'
  threshold: number
  reward: { credits?: number; wealth?: number; xp?: number; shieldHours?: number }
}

// Flattened tier list; keep original IDs for first tier of each chain
const ACHIEVEMENT_TIERS: AchievementTier[] = [
  // Business ownership chain
  {
    id: 'first_business', chain: 'business_owned', order: 0, category: 'Business',
    name: 'Entrepreneur', description: 'Purchase your first enhanced business',
    thresholdType: 'enhancedOwned', threshold: 1, reward: { credits: 50 }
  },
  {
    id: 'business_tycoon_5', chain: 'business_owned', order: 1, category: 'Business',
    name: 'Business Tycoon', description: 'Own 5 enhanced businesses',
    thresholdType: 'enhancedOwned', threshold: 5, reward: { credits: 150, xp: 200 }
  },
  {
    id: 'business_empire', chain: 'business_owned', order: 2, category: 'Business',
    name: 'Business Empire', description: 'Own 10 enhanced businesses',
    thresholdType: 'enhancedOwned', threshold: 10, reward: { credits: 500, wealth: 5 }
  },
  {
    id: 'business_conglomerate_25', chain: 'business_owned', order: 3, category: 'Business',
    name: 'Conglomerate', description: 'Own 25 enhanced businesses',
    thresholdType: 'enhancedOwned', threshold: 25, reward: { credits: 2000, wealth: 20, xp: 5000 }
  },
  // Credits earned chain
  {
    id: 'wealthy_worker_1k', chain: 'credits_earned', order: 0, category: 'Wealth',
    name: 'Wealthy Worker', description: 'Earn 1,000 credits from work',
    thresholdType: 'creditsEarned', threshold: 1000, reward: { credits: 100, xp: 200 }
  },
  {
    id: 'wealthy_worker_10k', chain: 'credits_earned', order: 1, category: 'Wealth',
    name: 'Industrious Earner', description: 'Earn 10,000 credits from work',
    thresholdType: 'creditsEarned', threshold: 10_000, reward: { credits: 500, xp: 500 }
  },
  {
    id: 'wealthy_worker_100k', chain: 'credits_earned', order: 2, category: 'Wealth',
    name: 'Credit Mogul', description: 'Earn 100,000 credits from work',
    thresholdType: 'creditsEarned', threshold: 100_000, reward: { credits: 2500, wealth: 10, xp: 2000 }
  },
  {
    id: 'wealthy_worker_1m', chain: 'credits_earned', order: 3, category: 'Wealth',
    name: 'Credit Billionaire', description: 'Earn 1,000,000 credits from work',
    thresholdType: 'creditsEarned', threshold: 1_000_000, reward: { credits: 10_000, wealth: 50, xp: 10_000 }
  },
  // Battle wins chain
  {
    id: 'battle_master', chain: 'battles_won', order: 0, category: 'Combat',
    name: 'Battle Master', description: 'Win 50 battles',
    thresholdType: 'battlesWon', threshold: 50, reward: { credits: 250, shieldHours: 1 }
  },
  {
    id: 'battle_champion_200', chain: 'battles_won', order: 1, category: 'Combat',
    name: 'Battle Champion', description: 'Win 200 battles',
    thresholdType: 'battlesWon', threshold: 200, reward: { credits: 1000, wealth: 10, shieldHours: 4 }
  },
  {
    id: 'war_legend_1000', chain: 'battles_won', order: 2, category: 'Combat',
    name: 'WAR Legend', description: 'Win 1,000 battles',
    thresholdType: 'battlesWon', threshold: 1000, reward: { credits: 5000, wealth: 100, shieldHours: 12 }
  }
]

// Utility helpers for achievements
const getTierById = (id: string) => ACHIEVEMENT_TIERS.find(t => t.id === id)

export const useGameStore = create<GameState>()(persist((set, get) => ({
  // Player state
  player: {
    id: 'demo-player',
    level: 1,
    xp: 0,
    credits: 100,
    wealth: 1000,
    totalCreditsEarned: 0,
    battlesWon: 0,
    battlesLost: 0,
    usd: 250, // demo USD balance for DEX
    sol: 0.5, // demo SOL balance for DEX
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
  // Start with 1 unlocked slot at level 1; migration will upgrade legacy saves
  maxSlots: 1,
  getUnlockedSlots: () => {
    const level = get().player.level || 1
    // Slot unlock thresholds (inclusive): slot2 @5, slot3 @10, slot4 @15
    let unlocked = 1
    if (level >= 5) unlocked = 2
    if (level >= 10) unlocked = 3
    if (level >= 15) unlocked = 4
    return unlocked
  },
  recalcExchangeCaps: () => {
    const state = get()
    const lvl = state.player.level || 1
    // Base user cap 10 (existing) scales: +1 per 2 levels up to +20 at level 40, then slower +1 per 5 levels
    const linear = Math.min(40, Math.max(0, lvl - 1)) // levels beyond 1 in linear region
    const addLinear = Math.floor(linear / 2)
    const extra = Math.max(0, lvl - 40)
    const addExtra = Math.floor(extra / 5)
    const newUserCap = 10 + addLinear + addExtra
    // Global cap gentle growth: start 1000 then + (lvl*10)
    const newGlobal = 1000 + (lvl * 10)
    set(s => ({ exchangePool: { ...s.exchangePool, userDailyCapWealth: newUserCap, globalDailyCapWealth: newGlobal } }))
  },
  // Quest system state initialization values
  questsActive: [],
  questLastInit: 0,
  questDailyResetAt: 0,
  questWeeklyResetAt: 0,
  initQuests: () => {
    const state = get()
    const now = Date.now()
    // Determine today/this week boundaries (UTC)
    const todayUTC = new Date()
    const dayStart = Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), todayUTC.getUTCDate(), 0, 0, 0)
    const nextDay = dayStart + 24 * 60 * 60 * 1000
    // Week start (Monday) UTC
    const dayOfWeek = (new Date(dayStart)).getUTCDay() // 0=Sun
    const mondayOffset = (dayOfWeek + 6) % 7
    const weekStart = dayStart - mondayOffset * 24 * 60 * 60 * 1000
    const nextWeek = weekStart + 7 * 24 * 60 * 60 * 1000
    const existing = state.questsActive || []
    const stillValid = existing.filter(q => q.expiresAt ? q.expiresAt > now : true)
    const haveDaily = stillValid.filter(q => q.type === 'daily')
    const haveWeekly = stillValid.filter(q => q.type === 'weekly')
    // If no current dailies or expired
    const dailies: QuestInstance[] = haveDaily.length === 0 ? DAILY_QUEST_POOL.slice(0, 3).map(def => ({ ...def, progress: 0, complete: false, claimed: false, expiresAt: nextDay })) : haveDaily
    const weeklies: QuestInstance[] = haveWeekly.length === 0 ? WEEKLY_QUEST_POOL.slice(0, 2).map(def => ({ ...def, progress: 0, complete: false, claimed: false, expiresAt: nextWeek })) : haveWeekly
    // Chain quest: take first incomplete in order
    const chainProgress = stillValid.filter(q => q.type === 'chain')
    let chainQuest: QuestInstance[] = chainProgress
    if (chainProgress.length === 0) {
      const first = CHAIN_QUESTS[0]
      chainQuest = first ? [{ ...first, progress: 0, complete: false, claimed: false }] : []
    }
    const merged = [...dailies, ...weeklies, ...chainQuest]
    set({
      questsActive: merged,
      questDailyResetAt: nextDay,
      questWeeklyResetAt: nextWeek,
      questLastInit: now
    })
  },
  refreshQuestRotations: () => {
    const state = get()
    const now = Date.now()
    if ((state.questDailyResetAt || 0) <= now || (state.questWeeklyResetAt || 0) <= now) {
      const initFn = get().initQuests
      if (initFn) initFn()
    }
  },
  incrementQuestProgress: (kind, amount = 1) => {
    const state = get()
    if (!state.questsActive || state.questsActive.length === 0) return
    let changed = false
    const updated = state.questsActive.map(q => {
      if (q.complete || q.objective !== kind) return q
      const nextProgress = Math.min(q.target, q.progress + amount)
      const justCompleted = nextProgress >= q.target && !q.complete
      if (justCompleted) {
        try { useNotificationStore.getState().push({ type: 'success', title: 'Quest Complete', message: q.description, showInBanner: true }) } catch {}
      }
      if (nextProgress !== q.progress) changed = true
      return { ...q, progress: nextProgress, complete: nextProgress >= q.target }
    })
    if (changed) set({ questsActive: updated })
  },
  claimQuest: (id: string) => {
    const state = get()
    const quest = state.questsActive?.find(q => q.id === id)
    if (!quest) return { success: false, reason: 'Not found' }
    if (!quest.complete) return { success: false, reason: 'Not complete' }
    if (quest.claimed) return { success: false, reason: 'Already claimed' }
    const { credits = 0, wealth = 0, xp = 0, shieldHours = 0 } = quest.reward || {}
    if (credits || wealth || xp) {
      set(s => ({ player: { ...s.player, credits: s.player.credits + credits, wealth: s.player.wealth + wealth, xp: s.player.xp + xp, level: Math.floor((s.player.xp + xp) / 1000) + 1 } }))
    }
    if (shieldHours > 0) {
      set(s => ({ battleState: { ...s.battleState, activeShield: { type: 'basic', expires: Date.now() + shieldHours * 3600_000 } } }))
    }
    set(s => ({ questsActive: s.questsActive?.map(q => q.id === id ? { ...q, claimed: true } : q) }))
    try { useNotificationStore.getState().push({ type: 'success', title: 'Quest Claimed', message: `+${credits}C ${wealth?`+${wealth}W `:''}${xp?`+${xp}XP `:''}${shieldHours?`Shield ${shieldHours}h`:''}`, showInBanner: false }) } catch {}
    // Clan XP: award a portion of quest rewards to the clan (prioritize quest XP, fallback to credits)
    try {
      const addClanXp = get().addClanXp
      if (addClanXp) {
        let clanXp = 0
        if (xp > 0) {
          clanXp = Math.max(1, Math.floor(xp * 0.5)) // 50% of quest XP
        } else if (credits > 0) {
          clanXp = Math.max(1, Math.floor(credits / 50)) // Scale credits -> clan XP (simple divisor)
        }
        if (clanXp > 0) addClanXp(clanXp)
      }
    } catch {}
    // If chain quest claimed and complete, spawn next
    if (quest.type === 'chain') {
      const nextDef = CHAIN_QUESTS.find(d => (d.chainOrder ?? -1) === ((quest.chainOrder ?? 0) + 1))
      if (nextDef) {
        set(s => ({ questsActive: [...(s.questsActive || []).filter(q => q.id !== quest.id), { ...nextDef, progress: 0, complete: false, claimed: false }] }))
      }
    }
    return { success: true, rewards: 'claimed' }
  },

  // Achievements
  achievementsClaimed: [],
  getAchievementTiers: () => ACHIEVEMENT_TIERS,
  getActiveAchievementStages: () => {
    const state = get()
    const claimed = state.achievementsClaimed || []
    // For each chain select the first unclaimed tier, plus include already claimed tiers for history (optional)
    const chains = ['business_owned','credits_earned','battles_won'] as const
    const enhancedOwned = state.enhancedBusinesses.filter(b=>b.owned).length
    const creditsEarned = state.player.totalCreditsEarned || 0
    const battlesWon = state.player.battlesWon || 0
    const progressMetrics = { enhancedOwned, creditsEarned, battlesWon }
    const rows: Array<AchievementTier & { progress: number; unlocked: boolean; claimed: boolean }> = []
    chains.forEach(chain => {
      const tiers = ACHIEVEMENT_TIERS.filter(t=>t.chain === chain).sort((a,b)=>a.order-b.order)
      tiers.forEach(tier => {
        const metricValue = progressMetrics[tier.thresholdType]
        const progress = Math.min(100, Math.floor((metricValue / tier.threshold) * 100))
        const unlocked = metricValue >= tier.threshold
        const claimedFlag = claimed.includes(tier.id)
        // Always include claimed tiers; include first unclaimed tier only
        if (claimedFlag) {
          rows.push({ ...tier, progress, unlocked, claimed: true })
        } else {
          // If no earlier unclaimed tier already pushed for this chain
          const chainHasUnclaimed = rows.some(r=>r.chain===chain && !r.claimed && !claimed.includes(r.id))
          if (!chainHasUnclaimed) {
            rows.push({ ...tier, progress, unlocked, claimed: false })
          }
        }
      })
    })
    return rows
  },

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

  // Clan system implementation
  currentClan: undefined,
  clans: [],
  createClan: (name: string, tag: string, description?: string) => {
    name = name.trim(); tag = tag.trim().toUpperCase()
    if (!name || !tag) return { success: false, reason: 'Name and tag required' }
    if (tag.length > 5) return { success: false, reason: 'Tag too long' }
    const state = get()
    if (state.player.clanId) return { success: false, reason: 'Already in a clan' }
    const exists = (state.clans || []).some(c => c.tag === tag || c.name.toLowerCase() === name.toLowerCase())
    if (exists) return { success: false, reason: 'Clan exists' }
    const id = 'clan_' + Date.now().toString(36)
    const clan: Clan = { id, name, tag, level: 1, members: 1, maxMembers: 25, leader: state.player.id, description: description || '', totalWealth: state.player.wealth, trophies: 0, rank: (state.clans?.length || 0) + 1, xp: 0, membersList: [{ id: state.player.id, role: 'leader', joinedAt: Date.now() }] }
    set(s => ({ clans: [...(s.clans || []), clan], player: { ...s.player, clanId: id, clanRole: 'leader' }, currentClan: clan }))
    try { useNotificationStore.getState().push({ type: 'success', title: 'Clan Created', message: `${name} [${tag}]`, showInBanner: true }) } catch {}
    return { success: true }
  },
  joinClan: (clanId: string) => {
    const state = get()
    if (state.player.clanId) return { success: false, reason: 'Already in a clan' }
    const clan = (state.clans || []).find(c => c.id === clanId)
    if (!clan) return { success: false, reason: 'Not found' }
    if (clan.members >= clan.maxMembers) return { success: false, reason: 'Clan full' }
    const now = Date.now()
    set(s => ({
      clans: (s.clans || []).map(c => c.id === clanId ? { ...c, members: c.members + 1, totalWealth: c.totalWealth + s.player.wealth, membersList: [...(c.membersList||[]), { id: s.player.id, role: 'member', joinedAt: now }] } : c),
      player: { ...s.player, clanId: clanId, clanRole: 'member' },
      currentClan: { ...clan, members: clan.members + 1, totalWealth: clan.totalWealth + s.player.wealth, membersList: [...(clan.membersList||[]), { id: s.player.id, role: 'member', joinedAt: now }] }
    }))
    try { useNotificationStore.getState().push({ type: 'info', title: 'Joined Clan', message: clan.name, showInBanner: true }) } catch {}
    return { success: true }
  },
  leaveClan: () => {
    const state = get()
    const clanId = state.player.clanId
    if (!clanId) return { success: false, reason: 'Not in clan' }
    const clan = (state.clans || []).find(c => c.id === clanId)
    if (!clan) return { success: false, reason: 'Clan missing' }
    if (state.player.clanRole === 'leader' && clan.members > 1) return { success: false, reason: 'Transfer leadership first' }
    let updatedClans = (state.clans || []).map(c => c.id === clanId ? { ...c, members: c.members - 1, totalWealth: Math.max(0, c.totalWealth - state.player.wealth), membersList: (c.membersList||[]).filter(m => m.id !== state.player.id) } : c)
    updatedClans = updatedClans.filter(c => !(c.id === clanId && c.members <= 0))
    set(s => ({ clans: updatedClans, player: { ...s.player, clanId: undefined, clanRole: undefined }, currentClan: undefined }))
    try { useNotificationStore.getState().push({ type: 'warning', title: 'Left Clan', message: clan.name, showInBanner: false }) } catch {}
    return { success: true }
  },
  getClanById: (id: string) => {
    return get().clans?.find(c => c.id === id)
  },
  promoteMember: (clanId: string, memberId: string) => {
    const state = get()
    if (!state.player.clanId || state.player.clanId !== clanId) return { success: false, reason: 'Not in clan' }
    if (state.player.clanRole !== 'leader') return { success: false, reason: 'No permission' }
    const clan = state.clans?.find(c => c.id === clanId)
    if (!clan) return { success: false, reason: 'Clan missing' }
    type ClanRole = 'member' | 'elder' | 'co-leader' | 'leader'
    const roleOrder: ClanRole[] = ['member','elder','co-leader','leader']
    const membersList = (clan.membersList||[]).map(m => {
      if (m.id !== memberId) return m
      const idx = roleOrder.indexOf(m.role as ClanRole)
      if (idx === -1 || idx === roleOrder.length - 1) return m
      const nextRole: ClanRole = roleOrder[idx+1]
      return { ...m, role: nextRole }
    }) as Array<{ id: string; role: ClanRole; joinedAt: number }>
    const target = membersList.find(m => m.id === memberId)
    if (!target) return { success: false, reason: 'Member missing' }
    let newLeader = clan.leader
    if (target.role === 'leader' && clan.leader !== memberId) {
      // demote previous leader to co-leader
      for (let i=0;i<membersList.length;i++) {
        if (membersList[i].id === clan.leader) membersList[i] = { ...membersList[i], role: 'co-leader' }
      }
      newLeader = memberId
    }
    set(s => ({
      clans: (s.clans||[]).map(c => c.id === clanId ? { ...c, leader: newLeader, membersList } : c),
      currentClan: s.currentClan && s.currentClan.id === clanId ? { ...s.currentClan, leader: newLeader, membersList } : s.currentClan,
      player: s.player.id === memberId ? { ...s.player, clanRole: target.role as 'member' | 'elder' | 'co-leader' | 'leader' } : s.player
    }))
    return { success: true }
  },
  demoteMember: (clanId: string, memberId: string) => {
    const state = get()
    if (!state.player.clanId || state.player.clanId !== clanId) return { success: false, reason: 'Not in clan' }
    if (state.player.clanRole !== 'leader') return { success: false, reason: 'No permission' }
    const clan = state.clans?.find(c => c.id === clanId)
    if (!clan) return { success: false, reason: 'Clan missing' }
    if (memberId === clan.leader) return { success: false, reason: 'Cannot demote leader (transfer instead via promote path)' }
    type ClanRole = 'member' | 'elder' | 'co-leader' | 'leader'
    const roleOrder: ClanRole[] = ['member','elder','co-leader','leader']
    const membersList = (clan.membersList||[]).map(m => {
      if (m.id !== memberId) return m
      const idx = roleOrder.indexOf(m.role as ClanRole)
      if (idx <= 0) return m
      const newRole: ClanRole = roleOrder[idx-1]
      return { ...m, role: newRole }
    }) as Array<{ id: string; role: ClanRole; joinedAt: number }>
    const target = membersList.find(m => m.id === memberId)
    if (!target) return { success: false, reason: 'Member missing' }
    set(s => ({
      clans: (s.clans||[]).map(c => c.id === clanId ? { ...c, membersList } : c),
      currentClan: s.currentClan && s.currentClan.id === clanId ? { ...s.currentClan, membersList } : s.currentClan,
      player: s.player.id === memberId ? { ...s.player, clanRole: target.role as 'member' | 'elder' | 'co-leader' | 'leader' } : s.player
    }))
    return { success: true }
  },
  kickMember: (clanId: string, memberId: string) => {
    const state = get()
    if (!state.player.clanId || state.player.clanId !== clanId) return { success: false, reason: 'Not in clan' }
    if (state.player.clanRole !== 'leader') return { success: false, reason: 'No permission' }
    if (memberId === state.player.id) return { success: false, reason: 'Cannot kick self' }
    const clan = state.clans?.find(c => c.id === clanId)
    if (!clan) return { success: false, reason: 'Clan missing' }
    const membersList = (clan.membersList||[]).filter(m => m.id !== memberId)
    set(s => ({
      clans: (s.clans||[]).map(c => c.id === clanId ? { ...c, members: Math.max(0, c.members - 1), membersList } : c),
      currentClan: s.currentClan && s.currentClan.id === clanId ? { ...s.currentClan, members: Math.max(0, clan.members - 1), membersList } : s.currentClan
    }))
    return { success: true }
  },
  clanInvites: [],
  requestClanInvite: (clanId: string) => {
    const state = get()
    if (state.player.clanId) return { success: false, reason: 'Already in clan' }
    const clan = state.clans?.find(c => c.id === clanId)
    if (!clan) return { success: false, reason: 'Clan missing' }
    const exists = (state.clanInvites||[]).some(i => i.clanId === clanId)
    if (exists) return { success: false, reason: 'Invite exists' }
    const invite = { id: 'invite_'+Date.now().toString(36), clanId, clanName: clan.name, tag: clan.tag, created: Date.now() }
    set(s => ({ clanInvites: [...(s.clanInvites||[]), invite] }))
    try { useNotificationStore.getState().push({ type: 'info', title: 'Clan Invite Received', message: `${clan.name}`, showInBanner: true }) } catch {}
    return { success: true }
  },
  acceptClanInvite: (inviteId: string) => {
    const state = get()
    if (state.player.clanId) return { success: false, reason: 'Already in clan' }
    const invite = (state.clanInvites||[]).find(i => i.id === inviteId)
    if (!invite) return { success: false, reason: 'Invite missing' }
    const join = get().joinClan; if (!join) return { success: false, reason: 'Join missing' }
    const r = join(invite.clanId)
    if (r.success) {
      set(s => ({ clanInvites: (s.clanInvites||[]).filter(i => i.id !== inviteId) }))
    }
    return r
  },
  declineClanInvite: (inviteId: string) => {
    const state = get()
    if (!(state.clanInvites||[]).some(i => i.id === inviteId)) return { success: false, reason: 'Not found' }
    set(s => ({ clanInvites: (s.clanInvites||[]).filter(i => i.id !== inviteId) }))
    return { success: true }
  },
  addClanXp: (amount: number) => {
    if (amount <= 0) return
    const state = get()
    if (!state.player.clanId) return
    const clanId = state.player.clanId
    const clans = state.clans || []
    const clan = clans.find(c => c.id === clanId)
    if (!clan) return
    const xpGain = Math.max(1, Math.floor(amount))
    let newXp = (clan.xp||0) + xpGain
    let lvl = clan.level
    let maxMembers = clan.maxMembers
    const levelUpThreshold = (lv: number) => lv * 500
    let leveled = false
    while (newXp >= levelUpThreshold(lvl)) {
      newXp -= levelUpThreshold(lvl)
      lvl++
      leveled = true
      if (lvl % 5 === 0) maxMembers += 5
    }
    const updated = clans.map(c => c.id === clanId ? { ...c, xp: newXp, level: lvl, maxMembers } : c)
    set(s => ({ clans: updated, currentClan: s.currentClan && s.currentClan.id === clanId ? { ...s.currentClan, xp: newXp, level: lvl, maxMembers } : s.currentClan }))
    if (leveled) {
      try { useNotificationStore.getState().push({ type: 'success', title: 'Clan Level Up', message: `Level ${lvl}`, showInBanner: true }) } catch {}
    }
  },
  globalChat: [],
  clanChat: {},
  npcBots: [
    { id: 'bot_scavenger', name: 'Scavenger Drone', wealth: 800, warScore: 700, shielded: false, lastUpdated: Date.now() },
    { id: 'bot_raider', name: 'Rogue Raider', wealth: 2500, warScore: 1200, shielded: true, lastUpdated: Date.now() },
    { id: 'bot_cartel', name: 'Cartel Captain', wealth: 7500, warScore: 1800, shielded: false, lastUpdated: Date.now() },
    { id: 'bot_tycoon', name: 'Idle Tycoon', wealth: 15000, warScore: 2100, shielded: true, lastUpdated: Date.now() }
  ],
  regenerateBots: () => {
    // Light randomization to keep sessions varied
    const templates = [
      { id: 'bot_scavenger', base: 500, spread: 600, war: 700 },
      { id: 'bot_raider', base: 1800, spread: 1200, war: 1200 },
      { id: 'bot_cartel', base: 5000, spread: 4000, war: 1800 },
      { id: 'bot_tycoon', base: 12000, spread: 6000, war: 2100 }
    ]
    const bots = templates.map(t => ({
      id: t.id,
      name: t.id === 'bot_scavenger' ? 'Scavenger Drone' : t.id === 'bot_raider' ? 'Rogue Raider' : t.id === 'bot_cartel' ? 'Cartel Captain' : 'Idle Tycoon',
      wealth: t.base + Math.floor(Math.random() * t.spread),
      warScore: t.war + Math.floor(Math.random() * 300) - 150,
      shielded: Math.random() < 0.35,
      lastUpdated: Date.now()
    }))
    set({ npcBots: bots })
  },
  lastSeenGlobalChatCount: 0,
  lastSeenClanChatCounts: {},
  markGlobalChatRead: () => {
    const total = (get().globalChat || []).length
    set({ lastSeenGlobalChatCount: total })
  },
  markClanChatRead: (clanId: string) => {
    if (!clanId) return
    const state = get()
    const counts = { ...(state.lastSeenClanChatCounts || {}) }
    const current = (state.clanChat && state.clanChat[clanId]) ? state.clanChat[clanId].length : 0
    counts[clanId] = current
    set({ lastSeenClanChatCounts: counts })
  },
  postGlobalMessage: (text: string) => {
    const t = text.trim(); if (!t) return { success: false, reason: 'Empty' }
    const msg = { id: 'msg_'+Date.now().toString(36), from: get().player.id, text: t, ts: Date.now() }
    set(s => ({ globalChat: [...(s.globalChat||[]), msg].slice(-200) }))
    return { success: true }
  },
  postClanMessage: (text: string) => {
    const state = get()
    if (!state.player.clanId) return { success: false, reason: 'No clan' }
    const t = text.trim(); if (!t) return { success: false, reason: 'Empty' }
    const msg = { id: 'cmsg_'+Date.now().toString(36), from: state.player.id, text: t, ts: Date.now() }
    set(s => ({ clanChat: { ...(s.clanChat||{}), [state.player.clanId!]: [ ...((s.clanChat||{})[state.player.clanId!]||[]), msg ].slice(-200) } }))
    return { success: true }
  },

  // Treasury system
  treasuryReserve: {
    credits: 1000000,
    wealth: 10000
  },
  // Exchange Pool defaults (daily reset at next UTC midnight)
  exchangePool: {
    rateCreditsPerWealth: 75, // target: ~3 works (25 C each) ≈ 1 W (pre-fee)
    feeBps: 100, // 1.0% fee on input credits
    globalDailyCapWealth: 1000,
    userDailyCapWealth: 10,
    redeemedTodayWealth: 0,
    perUserRedeemedToday: {},
    resetAt: (() => {
      const now = new Date()
      const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0))
      return next.getTime()
    })()
  },
  conversionRate: 75, // used for WAR valuation and displays
  // Display-only reverse equivalence (WEALTH -> credits)
  wealthToCreditsRate: 75,

  // Demo market prices + fee
  marketPrices: {
    solUsd: 150, // $150 per SOL (mock)
    wealthUsd: 1, // $1 per WEALTH (mock)
  },
  dexFeeBps: 50, // 0.50%
  _dexAdapter: null,

  // Lottery initial state: 5 min window, 25 WEALTH entry, 20 players max
  lottery: {
    settings: { entryAmount: 25, maxEntries: 20, durationMs: 5 * 60 * 1000 },
    currentRound: {
      id: 1,
      startedAt: Date.now(),
      durationMs: 5 * 60 * 1000,
      entries: [],
      locked: false,
      settled: false,
      pot: 0,
      claims: {}
    },
    claimable: {}
  },

  // UI state
  showShareModal: false,
  shareBoostActive: false,
  currentTime: Date.now(),
  rapidProcessingUntil: undefined,
  compoundActiveUntil: undefined,
  compoundLastTick: undefined,
  conversionBoostUntil: undefined,
  intelRevealUntil: undefined,
  bypassDefensesUntil: undefined,
  synergyLastTick: undefined,

  // Manager state
  manager: {
    charges: 0,
    purchases: 0
  },

  // On-chain adapter wiring (off by default)
  onChainEnabled: false,
  _onChainAdapter: null,
  setOnChainEnabled: (enabled: boolean) => set({ onChainEnabled: enabled }),
  setOnChainAdapter: (adapter) => set({ _onChainAdapter: adapter }),
  onChainCooldownUntil: undefined,
  setDexAdapter: (adapter) => set({ _dexAdapter: adapter }),

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

  // Lottery helpers
  getLotteryRemainingMs: () => {
    const state = get()
    const r = state.lottery.currentRound
    const end = r.startedAt + r.durationMs
    return Math.max(0, end - Date.now())
  },
  enterLottery: () => {
    const state = get()
    const { entryAmount, maxEntries, durationMs } = state.lottery.settings
    const round = state.lottery.currentRound
    // Check locked or settled or window elapsed
    const remaining = get().getLotteryRemainingMs()
    if (round.locked || round.settled || remaining <= 0) {
      return { success: false, reason: 'Round closed' }
    }
    if (round.entries.length >= maxEntries) {
      return { success: false, reason: 'Entry cap reached' }
    }
    const pid = state.player.id
    const already = round.entries.some(e => e.playerId === pid)
    if (already) return { success: false, reason: 'Already entered' }
    if (state.player.wealth < entryAmount) {
      try { useNotificationStore.getState().push({ type: 'error', title: 'Lottery entry failed', message: `Need ${entryAmount} $WEALTH`, showInBanner: true }) } catch {}
      return { success: false, reason: 'Insufficient WEALTH' }
    }
    // Deduct and record entry
    set(s => ({
      player: { ...s.player, wealth: s.player.wealth - entryAmount },
      lottery: {
        ...s.lottery,
        currentRound: {
          ...s.lottery.currentRound,
          entries: [...s.lottery.currentRound.entries, { playerId: pid, timestamp: Date.now(), amount: entryAmount }],
          pot: s.lottery.currentRound.pot + entryAmount
        }
      }
    }))
    try { useNotificationStore.getState().push({ type: 'success', title: 'Entered lottery', message: `-${entryAmount} $WEALTH`, showInBanner: false }) } catch {}
    // If we hit cap, lock (do not settle; wait for duration to elapse)
    const after = get().lottery.currentRound
    if (after.entries.length >= maxEntries) {
      set(s => ({ lottery: { ...s.lottery, currentRound: { ...s.lottery.currentRound, locked: true } } }))
    }
    return { success: true }
  },
  enterLotteryBot: (botId: string) => {
    const state = get()
    const { entryAmount, maxEntries } = state.lottery.settings
    const round = state.lottery.currentRound
    const remaining = get().getLotteryRemainingMs()
    if (round.locked || round.settled || remaining <= 0) {
      return { success: false, reason: 'Round closed' }
    }
    if (round.entries.length >= maxEntries) {
      return { success: false, reason: 'Entry cap reached' }
    }
    const already = round.entries.some(e => e.playerId === botId)
    if (already) return { success: false, reason: 'Already entered' }
    // Simulate bot paying into the pot without touching local player balances
    set(s => ({
      lottery: {
        ...s.lottery,
        currentRound: {
          ...s.lottery.currentRound,
          entries: [...s.lottery.currentRound.entries, { playerId: botId, timestamp: Date.now(), amount: entryAmount }],
          pot: s.lottery.currentRound.pot + entryAmount
        }
      }
    }))
    // Auto lock if cap reached (do not settle; wait for timer)
    const after = get().lottery.currentRound
    if (after.entries.length >= maxEntries) {
      set(s => ({ lottery: { ...s.lottery, currentRound: { ...s.lottery.currentRound, locked: true } } }))
    }
    return { success: true }
  },
  settleLotteryIfNeeded: () => {
    const state = get()
    const r = state.lottery.currentRound
    if (r.settled) return
    const remaining = get().getLotteryRemainingMs()
    if (remaining <= 0 && !r.locked) {
      set(s => ({ lottery: { ...s.lottery, currentRound: { ...s.lottery.currentRound, locked: true } } }))
    }
    if (remaining <= 0 && !r.settled) {
  ;(get()._settleLottery as any)()
    }
  },
  adminForceSettleLottery: () => {
    const r = get().lottery.currentRound
    if (!r.settled) {
      set(s => ({ lottery: { ...s.lottery, currentRound: { ...s.lottery.currentRound, locked: true } } }))
  ;(get()._settleLottery as any)()
    }
  },
  _settleLottery: () => {
    const state = get()
    const r = state.lottery.currentRound
    if (r.settled) return
    const uniquePlayers = Array.from(new Set(r.entries.map(e => e.playerId)))
    // If no entries or just one, handle gracefully
    const pot = r.pot
    let winnerId: string | undefined = undefined
    if (uniquePlayers.length > 0) {
      const idx = Math.floor(Math.random() * uniquePlayers.length)
      winnerId = uniquePlayers[idx]
    }
    const winnerPayout = Math.floor(pot * 0.80)
    const treasuryCut = Math.floor(pot * 0.10)
    const redistribution = Math.max(0, pot - winnerPayout - treasuryCut)

    // Credit winner and treasury
    if (winnerId && winnerPayout > 0) {
      set(s => ({ player: { ...s.player, wealth: s.player.id === winnerId ? s.player.wealth + winnerPayout : s.player.wealth } }))
    }
    if (treasuryCut > 0) {
      set(s => ({ treasuryReserve: { ...s.treasuryReserve, wealth: s.treasuryReserve.wealth + treasuryCut } }))
    }

    // Build accumulated claimable for losers (redistribution pool)
    const losers = uniquePlayers.filter(id => id !== winnerId)
    const loserShare = (losers.length > 0) ? Math.floor(redistribution / losers.length) : 0
    if (loserShare > 0 && losers.length > 0) {
      set(s => ({
        lottery: {
          ...s.lottery,
          claimable: losers.reduce((acc, id) => ({
            ...acc,
            [id]: (s.lottery.claimable?.[id] || 0) + loserShare
          }), { ...(s.lottery.claimable || {}) })
        }
      }))
    }

    // Finalize current round and rotate to lastRound (keep last result for display only)
    const roundResult = {
      ...r,
      locked: true,
      settled: true,
      winnerId,
      payouts: { winner: winnerPayout, treasury: treasuryCut, redistribution },
      claims: {}
    }
    const nextId = r.id + 1
    const now = Date.now()
    const durationMs = state.lottery.settings.durationMs
    set(s => ({
      lottery: {
        settings: s.lottery.settings,
        lastRound: roundResult,
        currentRound: {
          id: nextId,
          startedAt: now,
          durationMs,
          entries: [],
          locked: false,
          settled: false,
          pot: 0,
          claims: {}
        },
        claimable: s.lottery.claimable
      }
    }))
    try {
      useNotificationStore.getState().push({ type: 'info', title: 'Lottery settled', message: winnerId ? `Winner: ${winnerId} (+${winnerPayout} W)` : 'No entries', showInBanner: true })
    } catch {}
  },
  claimLotteryShare: () => {
    const state = get()
    const pid = state.player.id
    const amt = Math.floor((state.lottery.claimable?.[pid] || 0))
    if (!amt || amt <= 0) return { success: false, reason: 'No claimable amount' }
    set(s => ({
      player: { ...s.player, wealth: s.player.wealth + amt },
      lottery: {
        ...s.lottery,
        claimable: { ...(s.lottery.claimable || {}), [pid]: 0 }
      }
    }))
    try { useNotificationStore.getState().push({ type: 'success', title: 'Claimed lottery share', message: `+${amt} $WEALTH`, showInBanner: false }) } catch {}
    return { success: true, amount: amt }
  },
  // Internal work application that assumes cooldown eligibility has been validated outside
  _applyWork: (now: number, automated: boolean) => {
    const state = get()
    const prevLevel = state.player.level || 1
    const workMultiplier = get().getWorkMultiplier()
    const baseCredits = 25
    const bonusCredits = Math.floor(baseCredits * (workMultiplier / 100))
    let totalCredits = baseCredits + bonusCredits

    // Apply enhanced-business active charges/effects
    const enhancedBusinesses = state.enhancedBusinesses.slice()
    enhancedBusinesses.forEach((b, idx) => {
      if (!b.owned || !b.active) return

      if (b.id === 'fast_food_chain' && b.abilityCharges && b.abilityCharges > 0) {
        totalCredits = Math.floor(totalCredits * 1.2)
        enhancedBusinesses[idx] = { ...b, abilityCharges: b.abilityCharges - 1 }
        set(() => ({ lastBoostEvent: { id: b.id, message: 'Quick Service used: +20% credits', timestamp: Date.now() } }))
      }

      if (b.id === 'innovation_lab' && b.abilityCharges && b.abilityCharges > 0) {
        totalCredits = totalCredits * 3
        enhancedBusinesses[idx] = { ...b, abilityCharges: b.abilityCharges - 1 }
        set(() => ({ lastBoostEvent: { id: b.id, message: 'Breakthrough used: 3x credits', timestamp: Date.now() } }))
      }
    })
    set(() => ({ enhancedBusinesses }))

    if (state.shareBoostActive) {
      totalCredits = Math.floor(totalCredits * 1.5)
    }

    const xpGained = 25 + (state.player.workStreak * 2)

    set(s => ({
      player: {
        ...s.player,
        credits: s.player.credits + totalCredits,
        xp: s.player.xp + xpGained,
        workStreak: s.player.workStreak + 1,
        lastWorkDate: new Date(now).toISOString().split('T')[0],
        workSessionCount: s.player.workSessionCount + 1,
        lastSessionEnd: now,
        lastWorkTimestamp: now,
        consecutiveWorkClicks: (s.player.consecutiveWorkClicks || 0) + 1,
        level: Math.floor((s.player.xp + xpGained) / 1000) + 1,
        totalCreditsEarned: (s.player.totalCreditsEarned || 0) + totalCredits
      },
      lastWorkReward: totalCredits,
      shareBoostActive: false,
      // Always offer to share when the user manually clicks Work; never show for automated manager ticks
      showShareModal: automated ? false : true
    }))

    // After applying XP, check for slot unlock progression
    const post = get()
    const unlocked = post.getUnlockedSlots ? post.getUnlockedSlots() : post.maxSlots
    if (unlocked > post.maxSlots) {
      set({ maxSlots: unlocked })
      try { useNotificationStore.getState().push({ type: 'success', title: 'New slot unlocked', message: `Enhanced business slot ${unlocked} available`, showInBanner: true }) } catch {}
    }
    // Recalculate exchange caps after any level change
    post.recalcExchangeCaps && post.recalcExchangeCaps()

    // Level-up milestone notification
    const newLevel = post.player.level || prevLevel
    if (newLevel > prevLevel) {
      // Determine which perks improved this level
      const perks: string[] = []
      // Slot unlock already notified separately; include summary if threshold hit
      if (([5,10,15] as number[]).includes(newLevel)) perks.push(`Slot ${unlocked} unlocked`)
      // Defense breakpoint
      const prevDefenseBreak = Math.floor(prevLevel / 5) + (prevLevel > 50 ? Math.floor((prevLevel - 50) / 10) : 0)
      const newDefenseBreak = Math.floor(newLevel / 5) + (newLevel > 50 ? Math.floor((newLevel - 50) / 10) : 0)
      if (newDefenseBreak > prevDefenseBreak) perks.push('+1 base defense')
      // Shield discount change
      const prevDisc = Math.min(30, Math.floor(prevLevel / 5) * 5)
      const newDisc = Math.min(30, Math.floor(newLevel / 5) * 5)
      if (newDisc > prevDisc) perks.push(`Shield cost -${newDisc}%`)
      // Exchange cap summary
      const calcUserCap = (lvl: number) => {
        const linear = Math.min(40, Math.max(0, lvl - 1))
        const addLinear = Math.floor(linear / 2)
        const extra = Math.max(0, lvl - 40)
        const addExtra = Math.floor(extra / 5)
        return 10 + addLinear + addExtra
      }
      if (calcUserCap(newLevel) > calcUserCap(prevLevel)) perks.push('Exchange cap increased')
      // Work multiplier level bonus always grows but avoid spam each level; highlight every 5 levels
      if (newLevel % 5 === 0) perks.push('Work multiplier bonus increased')
      try {
        useNotificationStore.getState().push({
          type: 'success',
          title: `Level Up: ${newLevel}`,
          message: perks.length ? perks.join(' • ') : 'Progression bonuses improved',
          showInBanner: true
        })
      } catch {}
    }
    // Quest progress: work click
    const incQ = get().incrementQuestProgress
    if (incQ) {
      incQ('work_clicks', 1)
      // Also increment credits_earned by the credits just awarded in this work action
      incQ('credits_earned', totalCredits)
    }
    // Clan XP: manual work contributes modest clan progression (skip automated manager ticks)
    if (!automated) {
      try {
        const addClanXp = get().addClanXp
        if (addClanXp) {
          const clanXpGain = Math.max(1, Math.floor(xpGained * 0.2)) // 20% of personal XP gained
          addClanXp(clanXpGain)
        }
      } catch {}
    }
  },

  // Claim an achievement reward (tiered dynamic system)
  claimAchievement: (id: string) => {
    const state = get()
    const already = state.achievementsClaimed?.includes(id)
    if (already) return { success: false, reason: 'Already claimed' }
    const tier = getTierById(id)
    if (!tier) return { success: false, reason: 'Unknown achievement' }

    // Current metrics
    const enhancedOwned = state.enhancedBusinesses.filter(b => b.owned).length
    const creditsEarned = state.player.totalCreditsEarned || 0
    const battlesWon = state.player.battlesWon || 0
    const metricValue = tier.thresholdType === 'enhancedOwned' ? enhancedOwned : tier.thresholdType === 'creditsEarned' ? creditsEarned : battlesWon
    if (metricValue < tier.threshold) return { success: false, reason: 'Not unlocked yet' }

    const { credits: creditReward = 0, wealth: wealthReward = 0, xp: xpReward = 0, shieldHours } = tier.reward || {}
    let shieldAppliedHours = 0
    if (shieldHours && shieldHours > 0) {
      shieldAppliedHours = shieldHours
      set(s => ({
        battleState: {
          ...s.battleState,
          activeShield: { type: 'basic', expires: Date.now() + shieldHours * 3600_000 }
        }
      }))
    }

    if (creditReward || wealthReward || xpReward) {
      set(s => ({
        player: {
          ...s.player,
          credits: s.player.credits + creditReward,
          wealth: s.player.wealth + wealthReward,
          xp: s.player.xp + xpReward,
        }
      }))
    }

    set(s => ({ achievementsClaimed: [...(s.achievementsClaimed || []), id] }))

    try {
      useNotificationStore.getState().push({
        type: 'success',
        title: 'Achievement claimed',
        message: `+${creditReward} credits${wealthReward ? ` • +${wealthReward} $WEALTH` : ''}${xpReward ? ` • +${xpReward} XP` : ''}${shieldAppliedHours ? ` • Shield (${shieldAppliedHours}h)` : ''}`,
        showInBanner: true,
        durationMs: 4000,
      })
    } catch {}

    return { success: true }
  },

  doWork: (opts?: { automated?: boolean }) => {
    const now = Date.now()
    const state = get()
    const last = state.player.lastWorkTimestamp || 0
    let consecutive = state.player.consecutiveWorkClicks || 0
    const sixHours = 6 * 60 * 60 * 1000
    const twoHours = 2 * 60 * 60 * 1000
    if (last === 0 || (now - last) >= sixHours) {
      consecutive = 0
    }
    // Base required cooldown
    let requiredCooldown = (consecutive >= 3) ? sixHours : twoHours
    // Rapid Processing halves cooldown if active
    if ((state.rapidProcessingUntil || 0) > now) {
      requiredCooldown = Math.floor(requiredCooldown / 2)
    }
    if (last !== 0 && (now - last) < requiredCooldown) {
      return
    }

    // Route through centralized work applier (25 base credits + multipliers)
    get()._applyWork(now, !!opts?.automated)
  },

  buyBusinessOutlet: (businessId: string) => {
    set(state => {
      const business = state.businesses.find(b => b.id === businessId);
      if (!business) {
        console.error(`Business with ID ${businessId} not found.`);
        return state;
      }

      const cost = state.getOutletNextCost(businessId);
      if (state.player.credits < cost) {
        console.error('Not enough credits to purchase business outlet.');
        return state;
      }

      return {
        ...state,
        player: {
          ...state.player,
          credits: state.player.credits - cost
        },
        businesses: state.businesses.map(b =>
          b.id === businessId ? { ...b, outlets: b.outlets + 1 } : b
        )
      };
    });
    const incQ = get().incrementQuestProgress; if (incQ) incQ('business_outlets', 1)
  },

  repairEnhancedBusiness: (businessId: string, repairAmount: number) => {
    const state = get()
    const idx = state.enhancedBusinesses.findIndex(b => b.id === businessId)
    if (idx < 0) return
    const b = state.enhancedBusinesses[idx]
    const condition = b.condition ?? 100
    const baseCost = Math.max(1, Math.floor((100 - condition) * (b.cost || 1) * 0.1))
    // TODO: When a defend/repair instruction for enhanced businesses exists, route this via on-chain
    if (state.player.credits >= baseCost) {
      set(s => ({
        player: { ...s.player, credits: s.player.credits - baseCost },
        enhancedBusinesses: s.enhancedBusinesses.map((eb, i) => i === idx ? {
          ...eb,
          condition: Math.min(100, (eb.condition ?? 100) + repairAmount),
          lastMaintenance: Date.now()
        } : eb)
      }))
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

      if (state.player.wealth < business.cost || business.owned) return

      // Local-only purchase logic
      set(state => ({
        player: { ...state.player, wealth: state.player.wealth - business.cost },
        enhancedBusinesses: state.enhancedBusinesses.map((b, i) => i === businessIndex ? { ...b, owned: true } : b)
      }))
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

        // Passive businesses should not trigger one-off activations

        if (business.id === 'fast_food_chain') {
          // Quick Service: next 3 work actions get a 20% bonus; store abilityCharges
          set(state => ({
            enhancedBusinesses: state.enhancedBusinesses.map((b, i) =>
              i === businessIndex ? { ...b, abilityCharges: 3, lastActivated: now, active: true } : b
            )
          }))
          set(() => ({ lastBoostEvent: { id: business.id, message: 'Quick Service activated: next 3 works +20%', timestamp: Date.now() } }))
        }

        if (business.id === 'innovation_lab') {
          // Breakthrough: next work action provides 3x credits
          set(state => ({
            enhancedBusinesses: state.enhancedBusinesses.map((b, i) =>
              i === businessIndex ? { ...b, abilityCharges: 1, lastActivated: now, active: true } : b
            )
          }))
          set(() => ({ lastBoostEvent: { id: business.id, message: 'Breakthrough primed: next Work x3', timestamp: Date.now() } }))
        }

        if (business.id === 'automation_factory') {
          // Rapid Processing: halves cooldowns for 24h
          set(() => ({ rapidProcessingUntil: now + (24 * 60 * 60 * 1000) }))
          set(() => ({ lastBoostEvent: { id: business.id, message: 'Rapid Processing: cooldowns halved for 24h', timestamp: Date.now() } }))
        }

        if (business.id === 'investment_bank') {
          // Compound Interest: 5% daily for 7 days
          set(() => ({ compoundActiveUntil: now + (7 * 24 * 60 * 60 * 1000), compoundLastTick: now }))
          set(() => ({ lastBoostEvent: { id: business.id, message: 'Compound Interest active for 7 days', timestamp: Date.now() } }))
        }

        if (business.id === 'marketing_agency') {
          // Market Boost: +25% better conversion for 8h
          set(() => ({ conversionBoostUntil: now + (8 * 60 * 60 * 1000) }))
          set(() => ({ lastBoostEvent: { id: business.id, message: 'Market Boost: conversion rates improved for 8h', timestamp: Date.now() } }))
        }

        if (business.id === 'market_research') {
          // Intelligence Gathering: reveal intel for 8h
          set(() => ({ intelRevealUntil: now + (8 * 60 * 60 * 1000) }))
          set(() => ({ lastBoostEvent: { id: business.id, message: 'Intelligence Gathering: target intel revealed for 8h', timestamp: Date.now() } }))
        }

        if (business.id === 'cyber_security') {
          // System Disruption: bypass defenses for 2h
          set(() => ({ bypassDefensesUntil: now + (2 * 60 * 60 * 1000) }))
          set(() => ({ lastBoostEvent: { id: business.id, message: 'System Disruption: bypass defenses for 2h', timestamp: Date.now() } }))
        }

        if (business.id === 'venture_capital') {
          // Risky Investment: RNG immediate effect on credits
          const win = Math.random() < 0.6
          const delta = win ? 50 : -25
          set(s => ({ player: { ...s.player, credits: Math.max(0, s.player.credits + delta) } }))
          set(() => ({ lastBoostEvent: { id: business.id, message: win ? 'Risky Investment won: +50 credits' : 'Risky Investment lost: -25 credits', timestamp: Date.now() } }))
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
      // Recompute unlocked slots dynamically
      const unlocked = (state.getUnlockedSlots ? state.getUnlockedSlots() : state.maxSlots) || state.maxSlots
      // Ensure persisted maxSlots reflects unlocked progression (monotonic increase)
      if (unlocked > state.maxSlots) {
        state.maxSlots = unlocked
        try { useNotificationStore.getState().push({ type: 'info', title: 'Slot unlocked', message: `Enhanced slot unlocked (${unlocked}/4)`, showInBanner: true }) } catch {}
      }

      if (isActive) {
        return {
          activeSlots: state.activeSlots.filter(id => id !== businessId),
          enhancedBusinesses: state.enhancedBusinesses.map(b =>
            b.id === businessId ? { ...b, active: false } : b
          )
        }
      } else if (state.activeSlots.length < unlocked) {
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
    const now = Date.now()
    if (amount <= 0) {
      try { useNotificationStore.getState().push({ type: 'error', title: 'Conversion failed', message: 'Invalid amount', showInBanner: true }) } catch {}
      return
    }
    if (state.player.credits < amount) {
      try { useNotificationStore.getState().push({ type: 'error', title: 'Conversion failed', message: `Need ${amount} credits to convert`, showInBanner: true }) } catch {}
      return
    }

    // Resolve effective rate with passive/active boosts
    let creditsPerWealth = state.exchangePool.rateCreditsPerWealth
    const hasTrading = state.enhancedBusinesses.some(b => b.owned && state.activeSlots.includes(b.id) && b.id === 'trading_exchange')
    if (hasTrading) creditsPerWealth = Math.max(1, Math.floor(creditsPerWealth * 0.85))
    if ((state.conversionBoostUntil || 0) > now) {
      creditsPerWealth = Math.max(1, Math.floor(creditsPerWealth * 0.75))
    }

    // Apply input fee on credits
    const feeBps = Math.max(0, state.exchangePool.feeBps)
    const effectiveCredits = Math.floor(amount * (1 - (feeBps / 10000)))
    let desiredWealth = Math.floor(effectiveCredits / Math.max(1, creditsPerWealth))
    if (desiredWealth <= 0) {
      try { useNotificationStore.getState().push({ type: 'error', title: 'Conversion too small', message: 'Increase amount to mint at least 1 $WEALTH', showInBanner: true }) } catch {}
      return
    }

    // Enforce pool caps and treasury availability
    const pool = state.exchangePool
    const pid = state.player.id
    const userMinted = pool.perUserRedeemedToday[pid] || 0
    const globalRemaining = Math.max(0, pool.globalDailyCapWealth - pool.redeemedTodayWealth)
    const userRemaining = Math.max(0, pool.userDailyCapWealth - userMinted)
    const treasuryRemaining = Math.max(0, state.treasuryReserve.wealth)
    const cap = Math.max(0, Math.min(globalRemaining, userRemaining, treasuryRemaining))
    if (cap <= 0) {
      try { useNotificationStore.getState().push({ type: 'warning', title: 'Exchange Pool capped', message: 'No $WEALTH available to redeem right now', showInBanner: true }) } catch {}
      return
    }
    if (desiredWealth > cap) {
      desiredWealth = cap
    }
    // Recompute required credits for the clamped wealth (including fee)
    const creditsRequiredNet = desiredWealth * creditsPerWealth
    // net = amount * (1 - fee) => amount = ceil(net / (1 - fee))
    const oneMinusFee = Math.max(0.0001, (1 - (feeBps / 10000)))
    const creditsRequiredGross = Math.ceil(creditsRequiredNet / oneMinusFee)
    if (creditsRequiredGross > amount) {
      // If the provided amount doesn't cover clamped mint, downscale further
      const effNet = Math.floor(amount * oneMinusFee)
      const mintable = Math.floor(effNet / Math.max(1, creditsPerWealth))
      if (mintable <= 0) {
        try { useNotificationStore.getState().push({ type: 'error', title: 'Conversion too small', message: 'Increase amount to mint at least 1 $WEALTH', showInBanner: true }) } catch {}
        return
      }
      desiredWealth = Math.max(0, Math.min(mintable, cap))
    }

    const creditsToCharge = Math.min(state.player.credits, Math.max(1, Math.ceil(desiredWealth * creditsPerWealth / oneMinusFee)))
    const wealthToMint = desiredWealth

    set(s => ({
      player: {
        ...s.player,
        credits: Math.max(0, s.player.credits - creditsToCharge),
        wealth: s.player.wealth + wealthToMint
      },
      // Credit the treasury reserves with consumed credits and deduct WEALTH supply
      treasuryReserve: {
        credits: s.treasuryReserve.credits + creditsToCharge,
        wealth: Math.max(0, s.treasuryReserve.wealth - wealthToMint)
      },
      exchangePool: {
        ...s.exchangePool,
        redeemedTodayWealth: s.exchangePool.redeemedTodayWealth + wealthToMint,
        perUserRedeemedToday: {
          ...s.exchangePool.perUserRedeemedToday,
          [s.player.id]: (s.exchangePool.perUserRedeemedToday[s.player.id] || 0) + wealthToMint
        }
      }
    }))
    try {
      useNotificationStore.getState().push({ type: 'success', title: 'Redeemed Credits → $WEALTH', message: `-${creditsToCharge} C → +${wealthToMint} W`, showInBanner: false })
    } catch {}
    const incQ = get().incrementQuestProgress; if (incQ) incQ('wealth_minted', wealthToMint)
  },

  convertWealthToCredits: (amount: number) => {
    // Disabled under Exchange Pool mechanics (one-way)
    try { useNotificationStore.getState().push({ type: 'warning', title: 'Conversion disabled', message: '$WEALTH → Credits is disabled. Use Credits → $WEALTH via the Exchange Pool.', showInBanner: true }) } catch {}
    return
  },

  getDexQuote: (from: 'USD' | 'SOL' | 'WEALTH', to: 'USD' | 'SOL' | 'WEALTH', amount: number) => {
    const state = get()
    const adapter = state._dexAdapter
    if (adapter && adapter.getQuote) {
      // best-effort sync unwrap
      try {
        const res = (adapter.getQuote as any)(from, to, amount)
        if (res && typeof (res as any).then === 'function') {
          // async not supported inline; return 0 to UI
          return { amountOut: 0, fee: 0 }
        }
        return (res as any) || { amountOut: 0, fee: 0 }
      } catch {}
    }
    const prices = state.marketPrices || { solUsd: 150, wealthUsd: 1 }
    const feeBps = state.dexFeeBps ?? 50
    if (amount <= 0 || from === to) return { amountOut: 0, fee: 0 }
    const bpsToPct = (bps: number) => Math.max(0, bps) / 10000
    const fee = amount * bpsToPct(feeBps)
    const effective = Math.max(0, amount - fee)
    // Convert "from" amount to USD then to target
    const toUsd = (token: 'USD' | 'SOL' | 'WEALTH', amt: number) => {
      if (token === 'USD') return amt
      if (token === 'SOL') return amt * prices.solUsd
      return amt * prices.wealthUsd
    }
    const fromUsd = (usd: number, token: 'USD' | 'SOL' | 'WEALTH') => {
      if (token === 'USD') return usd
      if (token === 'SOL') return usd / Math.max(0.0001, prices.solUsd)
      return usd / Math.max(0.0001, prices.wealthUsd)
    }
    const usdVal = toUsd(from, effective)
    const out = fromUsd(usdVal, to)
    return { amountOut: out, fee }
  },

  swapTokens: (from: 'USD' | 'SOL' | 'WEALTH', to: 'USD' | 'SOL' | 'WEALTH', amount: number) => {
    const state = get()
    if (amount <= 0) {
      try { useNotificationStore.getState().push({ type: 'error', title: 'Swap failed', message: 'Invalid amount', showInBanner: true }) } catch {}
      return { success: false, error: 'Invalid amount' }
    }
    if (from === to) {
      try { useNotificationStore.getState().push({ type: 'warning', title: 'Swap not executed', message: 'Select different tokens', showInBanner: false }) } catch {}
      return { success: false, error: 'Select different tokens' }
    }

    // Check balances
    const bal = (t: 'USD' | 'SOL' | 'WEALTH') =>
      t === 'USD' ? (state.player.usd || 0) : t === 'SOL' ? (state.player.sol || 0) : state.player.wealth
    if (bal(from) < amount) {
      try { useNotificationStore.getState().push({ type: 'error', title: 'Swap failed', message: 'Insufficient balance', showInBanner: true }) } catch {}
      return { success: false, error: 'Insufficient balance' }
    }
    const adapter = state._dexAdapter
    if (adapter && adapter.swap) {
      try {
        const res = (adapter.swap as any)(from, to, amount)
        if (res && typeof (res as any).then === 'function') {
          // async path unsupported in this inline reducer context
          try { useNotificationStore.getState().push({ type: 'error', title: 'Swap failed', message: 'Async swap not supported here', showInBanner: true }) } catch {}
          return { success: false, error: 'Async swap not supported here' }
        }
        const r = res as any
        if (!r?.success) {
          try { useNotificationStore.getState().push({ type: 'error', title: 'Swap failed', message: r?.error || 'Swap failed', showInBanner: true }) } catch {}
          return r || { success: false, error: 'Swap failed' }
        }
        // adapter responsible for on-chain balance updates; mirror to local demo balances (best-effort)
        const outRounded = to === 'SOL' ? Math.round((r.amountOut || 0) * 1e4) / 1e4 : Math.floor(r.amountOut || 0)
        set(s => ({
          player: {
            ...s.player,
            usd: from === 'USD' ? (s.player.usd || 0) - amount : s.player.usd,
            sol: from === 'SOL' ? (s.player.sol || 0) - amount : s.player.sol,
            wealth: from === 'WEALTH' ? s.player.wealth - amount : s.player.wealth,
          }
        }))
        set(s => ({
          player: {
            ...s.player,
            usd: to === 'USD' ? ((s.player.usd || 0) + outRounded) : s.player.usd,
            sol: to === 'SOL' ? ((s.player.sol || 0) + outRounded) : s.player.sol,
            wealth: to === 'WEALTH' ? (s.player.wealth + outRounded) : s.player.wealth,
          }
        }))
        try { useNotificationStore.getState().push({ type: 'success', title: 'Swap complete', message: `Swapped ${amount} ${from} → ${outRounded} ${to}`, showInBanner: false }) } catch {}
        return { success: true, amountOut: outRounded, fee: r.fee }
      } catch (e: any) {
        try { useNotificationStore.getState().push({ type: 'error', title: 'Swap failed', message: e?.message || 'Swap failed', showInBanner: true }) } catch {}
        return { success: false, error: e?.message || 'Swap failed' }
      }
    }
    const q = (get().getDexQuote || (() => ({ amountOut: 0, fee: 0 })))(from, to, amount)
    const outRounded = to === 'SOL' ? Math.round(q.amountOut * 1e4) / 1e4 : Math.floor(q.amountOut)
    // Apply swap: deduct input, credit output; fee is taken from input side
    set(s => ({
      player: {
        ...s.player,
        usd: (from === 'USD' ? (s.player.usd || 0) - amount : (s.player.usd || 0)) + (to === 'USD' ? outRounded : 0),
        sol: (from === 'SOL' ? (s.player.sol || 0) - amount : (s.player.sol || 0)) + (to === 'SOL' ? outRounded : 0),
        wealth: (from === 'WEALTH' ? s.player.wealth - amount : s.player.wealth) + (to === 'WEALTH' ? outRounded : 0),
      }
    }))
    try { useNotificationStore.getState().push({ type: 'success', title: 'Swap complete', message: `Swapped ${amount} ${from} → ${outRounded} ${to}`, showInBanner: false }) } catch {}
    return { success: true, amountOut: outRounded, fee: q.fee }
  },

  // Market controls
  setMarketPrices: (next) => {
    set(s => ({ marketPrices: { solUsd: next.solUsd ?? (s.marketPrices?.solUsd ?? 150), wealthUsd: next.wealthUsd ?? (s.marketPrices?.wealthUsd ?? 1) } }))
  },
  setDexFeeBps: (bps: number) => {
    const safe = Math.max(0, Math.min(1000, Math.floor(bps)))
    set({ dexFeeBps: safe })
  },
  nudgeMarketPrices: () => {
    const state = get()
    const prices = state.marketPrices || { solUsd: 150, wealthUsd: 1 }
    const jitter = (v: number, pct: number, min = 0.0001) => {
      const delta = v * pct * (Math.random() * 2 - 1)
      return Math.max(min, Math.round((v + delta) * 10000) / 10000)
    }
    set({ marketPrices: { solUsd: jitter(prices.solUsd, 0.01), wealthUsd: jitter(prices.wealthUsd, 0.01) } })
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
  if ((now - lastAttack) < cooldowns[attackType as keyof typeof cooldowns]) {
    try { useNotificationStore.getState().push({ type: 'warning', title: 'Attack on cooldown', message: 'Try again later', showInBanner: false }) } catch {}
    return { success: false, message: 'On cooldown' }
  }

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
  if (cost.currency === 'credits' && state.player.credits < cost.amount) { try { useNotificationStore.getState().push({ type: 'error', title: 'Attack failed', message: 'Insufficient credits', showInBanner: true }) } catch {} ; return { success: false, message: 'Insufficient credits' } }
  if (cost.currency === 'wealth' && state.player.wealth < cost.amount) { try { useNotificationStore.getState().push({ type: 'error', title: 'Attack failed', message: 'Insufficient WEALTH', showInBanner: true }) } catch {} ; return { success: false, message: 'Insufficient WEALTH' } }

    // Find target in multiplayer store OR npc bots
    let multiplayerStore
    try { multiplayerStore = require('./multiplayerStore').useMultiplayerStore } catch (e) { multiplayerStore = undefined }
    const mpTarget = multiplayerStore ? multiplayerStore.getState().onlinePlayers.find((p: any) => p.id === targetId) : undefined
    const botTarget = (!mpTarget) ? (get().npcBots || []).find(b => b.id === targetId) : undefined
    const target = mpTarget || botTarget

    // Deduct cost from attacker
    if (cost.currency === 'credits') {
      set(s => ({ player: { ...s.player, credits: s.player.credits - cost.amount } }))
    } else {
      set(s => ({ player: { ...s.player, wealth: s.player.wealth - cost.amount } }))
    }

    // compute success chance (base 60% with WAR diff influence)
  const targetWar = (target && (target as any).warScore) || (target && (target as any).battlePower) || 1000
  let successChance = 0.6 + ((state.player.warScore - targetWar) / 2000)
  // Level differential modifier: +/-0.2% per level difference (capped at +/-10%)
  const targetLevel = (target && (target as any).level) || 1
  const levelDiff = (state.player.level || 1) - targetLevel
  const levelAdj = Math.max(-0.10, Math.min(0.10, levelDiff * 0.002))
  successChance += levelAdj
  successChance = Math.max(0.05, Math.min(0.95, successChance))

    // Shields and defensive businesses: if the multiplayer store provides
    // per-player battleState, consult it for shields and insurance flags
  const targetHasShield = !!(mpTarget && (mpTarget as any).battleState && (mpTarget as any).battleState.activeShield && ((mpTarget as any).battleState.activeShield.expires || 0) > Date.now()) || !!(botTarget && botTarget.shielded)

  // Determine bypass behavior (wealth/land always bypass; cyber window bypasses too)
  const selfBypass = (state.bypassDefensesUntil || 0) > now
  const bypassesDefense = selfBypass || (attackType === 'wealth_assault' || attackType === 'land_siege')

    if (!bypassesDefense && targetHasShield) {
      // target protected by shield - attack fails
      set(s => ({ battleState: { ...s.battleState, [lastKey]: now, attacksToday: s.battleState.attacksToday + 1 } as BattleState }))
      try { useNotificationStore.getState().push({ type: 'warning', title: 'Attack blocked', message: 'Target has an active shield', showInBanner: true }) } catch {}
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
        try { useNotificationStore.getState().push({ type: 'success', title: 'Sabotage successful', message: `Applied ${damage}% damage to target businesses`, showInBanner: false }) } catch {}
  // Quest progress: battles won
  const incQ = get().incrementQuestProgress; if (incQ) incQ('battles_won', 1)
  return { success: true, message: 'Business sabotaged', damage }
      } else {
        // Theft attacks
    const pct = maxTheftPct[attackType]
  const targetWealth = (target && (target as any).wealth) || 0
    const stolen = Math.floor(targetWealth * pct)

  if (stolen > 0 && target) {
          if (mpTarget && multiplayerStore) {
            // transfer from multiplayer target
            multiplayerStore.setState((state: any) => ({
              onlinePlayers: state.onlinePlayers.map((p: any) => p.id === targetId ? { ...p, wealth: Math.max(0, (p.wealth || 0) - stolen) } : p)
            }))
          }
          if (botTarget) {
            // mutate npc bot wealth locally
            set(s => ({ npcBots: (s.npcBots || []).map(b => b.id === botTarget.id ? { ...b, wealth: Math.max(0, b.wealth - stolen) } : b) }))
          }
          // credit attacker always
          set(s => ({ player: { ...s.player, wealth: s.player.wealth + stolen }, battleState: { ...s.battleState, [lastKey]: now, attacksToday: s.battleState.attacksToday + 1, successfulAttacksToday: s.battleState.successfulAttacksToday + 1 } as BattleState }))
          try { useNotificationStore.getState().push({ type: 'success', title: 'Attack successful', message: `Stole ${stolen} WEALTH`, showInBanner: false }) } catch {}
          const incQ = get().incrementQuestProgress; if (incQ) incQ('battles_won', 1)
          return { success: true, message: `Stole ${stolen} WEALTH`, stolen }
        } else {
          // nothing to steal
          set(s => ({ battleState: { ...s.battleState, [lastKey]: now, attacksToday: s.battleState.attacksToday + 1, successfulAttacksToday: s.battleState.successfulAttacksToday + 1 } as BattleState }))
          try { useNotificationStore.getState().push({ type: 'info', title: 'Attack successful', message: 'Nothing to steal', showInBanner: false }) } catch {}
          const incQ = get().incrementQuestProgress; if (incQ) incQ('battles_won', 1)
          return { success: true, message: 'Attack succeeded but nothing to steal' }
        }
      }
    } else {
      // Failure
      set(s => ({ battleState: { ...s.battleState, [lastKey]: now, attacksToday: s.battleState.attacksToday + 1 } as BattleState }))
      try { useNotificationStore.getState().push({ type: 'error', title: 'Attack failed', message: 'Your attack did not succeed', showInBanner: true }) } catch {}
      return { success: false, message: 'Attack failed' }
    }
    // Fallback
    return { success: false, message: 'Unhandled attack outcome' }
  },

  purchaseShield: (type: 'basic' | 'advanced' | 'elite') => {
    // Tuned costs in $WEALTH: 5, 20, 50 respectively
    const costs = { basic: 5, advanced: 20, elite: 50 }
    // Durations unchanged: 1h, 24h, 72h
    const durations = { basic: 3600000, advanced: 86400000, elite: 259200000 } // ms

    const state = get()
    // Level-based discount: 5% every 5 levels capped at 30%
    const lvl = state.player.level || 1
    const discountPct = Math.min(30, Math.floor(lvl / 5) * 5)
    const discountedCost = Math.max(1, Math.floor(costs[type] * (1 - discountPct / 100)))
    if (state.player.wealth >= discountedCost) {
      set(state => ({
        player: {
          ...state.player,
          wealth: state.player.wealth - discountedCost
        },
        battleState: {
          ...state.battleState,
          activeShield: {
            type,
            expires: Date.now() + durations[type]
          }
        }
      }))
      try { useNotificationStore.getState().push({ type: 'success', title: 'Shield activated', message: `${type.charAt(0).toUpperCase() + type.slice(1)} shield purchased${discountPct>0?` (-${discountPct}% cost)`:''}`, showInBanner: false }) } catch {}
      const incQ = get().incrementQuestProgress; if (incQ) incQ('shields_purchased', 1)
    } else {
      try { useNotificationStore.getState().push({ type: 'error', title: 'Shield purchase failed', message: `Need ${discountedCost} $WEALTH`, showInBanner: true }) } catch {}
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
      try { useNotificationStore.getState().push({ type: 'success', title: 'Repairs complete', message: `Business damage repaired (-${repairCost} credits)`, showInBanner: false }) } catch {}
    } else if (state.battleState.businessDamage <= 0) {
      try { useNotificationStore.getState().push({ type: 'info', title: 'No repairs needed', message: 'Your businesses are at full condition', showInBanner: false }) } catch {}
    } else {
      try { useNotificationStore.getState().push({ type: 'error', title: 'Repair failed', message: `Need ${repairCost} credits`, showInBanner: true }) } catch {}
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
    // One-time hydration sync for legacy saves: ensure maxSlots & exchange caps reflect current level
    const state = get()
    const unlocked = state.getUnlockedSlots ? state.getUnlockedSlots() : state.maxSlots
    if (unlocked > state.maxSlots) {
      set({ maxSlots: unlocked })
    }
    if (state.recalcExchangeCaps) {
      state.recalcExchangeCaps()
    }
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
    const breakdown: { baseBasic: number; basicAfterDamage: number; enhanced: number; government: number; synergy: number; level: number } = { baseBasic: 0, basicAfterDamage: 0, enhanced: 0, government: 0, synergy: 0, level: 0 }

    // Basic businesses (subject to sabotage damage)
    let basicMult = 0
    state.businesses.forEach(business => {
      basicMult += business.workMultiplier * business.outlets
    })
    // Apply business damage reduction to basic portion only
    const damage = Math.max(0, Math.min(100, state.battleState.businessDamage || 0))
    const damagedBasic = Math.floor(basicMult * ((100 - damage) / 100))
    multiplier += damagedBasic
    breakdown.baseBasic = basicMult
    breakdown.basicAfterDamage = damagedBasic

    // Enhanced businesses (active slots only)
    state.enhancedBusinesses.forEach(business => {
      if (business.owned && state.activeSlots.includes(business.id)) {
        const cond = typeof (business as any).condition === 'number' ? (business as any).condition as number : 100
        const scaled = Math.floor(business.workMultiplier * (cond / 100))
        multiplier += scaled
        breakdown.enhanced += scaled
      }
    })

    // Government Contract passive: +10% multiplier to all businesses when slotted
    if (state.enhancedBusinesses.some(b => b.owned && state.activeSlots.includes(b.id) && b.id === 'government_contract')) {
      multiplier += 10
      breakdown.government = 10
    }

    // Synergy bonuses
    try {
      const activeSynergies = calculateActiveSynergies(state.activeSlots)
      const effects = calculateSynergyEffects(activeSynergies)
      multiplier += effects.workMultiplierBonus || 0
      breakdown.synergy = effects.workMultiplierBonus || 0
    } catch {}

    // Level-based bonus: +0.5% per level, soft-capped via diminishing returns after level 50
    const level = state.player.level || 1
    const linearPortion = Math.min(level, 50) * 0.5 // up to +25
    const extraLevels = Math.max(0, level - 50)
    // diminishing returns: each extra level adds 0.25% * (0.98^n)
    let drPortion = 0
    for (let i = 0; i < Math.min(extraLevels, 100); i++) { // cap loop for safety
      drPortion += 0.25 * Math.pow(0.98, i)
    }
    const levelBonus = Math.floor(linearPortion + drPortion)
    multiplier += levelBonus
    breakdown.level = levelBonus

    const capped = Math.min(multiplier, 200) // Cap at 200%
    // Optionally expose breakdown somewhere (future UI hook)
    return capped
  },

  getDefenseRating: () => {
    const state = get()
    let defense = state.battleState.defenseRating
    // Level-based baseline: +1 defense per 5 levels (capped +10 at level 50) then +1 every additional 10 levels
    const lvl = state.player.level || 1
    let levelDef = Math.min(10, Math.floor(lvl / 5))
    if (lvl > 50) levelDef += Math.floor((lvl - 50) / 10)
    defense += levelDef

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

    // Synergy defense bonus
    try {
      const activeSynergies = calculateActiveSynergies(state.activeSlots)
      const effects = calculateSynergyEffects(activeSynergies)
      defense += effects.defenseBonus || 0
    } catch {}

    return Math.min(defense, 100)
  }
  ,

  // Centralized helpers
  getBusinessProfit: (businessOrId: string | Business) => {
    const state = get()
    const business: Business | undefined = typeof businessOrId === 'string' ? state.businesses.find(b => b.id === businessOrId) : businessOrId
    if (!business) return 0
    if (business.outlets === 0) return 0
    const perOutlet = business.baseCost * 0.5
    return Math.floor(perOutlet * business.outlets * (business.condition / 100))
  },

  getOutletNextCost: (businessId: string) => {
    const state = get()
    const business = state.businesses.find(b => b.id === businessId)
    if (!business) return Number.POSITIVE_INFINITY
    return Math.floor(business.baseCost * Math.pow(1.15, business.outlets))
  },

  getWorkCooldownRemaining: (now?: number) => {
    const state = get()
    const last = state.player.lastWorkTimestamp || 0
    const consecutive = state.player.consecutiveWorkClicks || 0
    if (last === 0) return 0
    const sixHours = 6 * 60 * 60 * 1000
    const twoHours = 2 * 60 * 60 * 1000
    let required = consecutive >= 3 ? sixHours : twoHours
    // Rapid Processing halves required cooldown if active
    const current = now ?? Date.now()
    if ((state.rapidProcessingUntil || 0) > current) {
      required = Math.floor(required / 2)
    }
    const localRemaining = required - (current - last)
    const chainRemaining = Math.max(0, (state.onChainCooldownUntil || 0) - current)
    return Math.max(0, Math.max(localRemaining, chainRemaining))
  },

  // Compute expected payout for the next manual Work click without side effects
  getExpectedWorkPayout: () => {
    const state = get()
    const baseCredits = 25
    const workMultiplier = get().getWorkMultiplier()
    const bonusCredits = Math.floor(baseCredits * (workMultiplier / 100))
    let totalCredits = baseCredits + bonusCredits

    // Apply active enhanced-business charges that modify the next work payouts
    state.enhancedBusinesses.forEach((b) => {
      if (!b.owned || !b.active) return
      if (b.id === 'fast_food_chain' && (b.abilityCharges || 0) > 0) {
        totalCredits = Math.floor(totalCredits * 1.2)
      }
      if (b.id === 'innovation_lab' && (b.abilityCharges || 0) > 0) {
        totalCredits = totalCredits * 3
      }
    })

    // If the share boost is primed, it applies to the next manual Work
    if (state.shareBoostActive) {
      totalCredits = Math.floor(totalCredits * 1.5)
    }

    return Math.max(0, Math.floor(totalCredits))
  },

  autoManagerWork: () => {
    const state = get()
    if ((state.manager.charges || 0) <= 0) return
    const remaining = get().getWorkCooldownRemaining()
    if (remaining === 0) {
      const now = Date.now()
      get()._applyWork(now, true)
      set(s => ({ manager: { ...s.manager, charges: Math.max(0, (s.manager.charges || 0) - 1) } }))
    }
  }
  ,

  // Manager helpers
  getManagerCost: () => {
    const state = get()
    const base = 500 // base credits cost
    const factor = Math.pow(1.15, state.manager.purchases || 0)
    return Math.floor(base * factor)
  },

  hireGlobalManager: () => {
    const state = get()
    const cost = get().getManagerCost()
    const CHARGES = MANAGER_CHARGES_PER_HIRE // actions granted per hire
    if (state.player.credits < cost) return
    set(s => ({
      player: { ...s.player, credits: s.player.credits - cost },
      manager: { charges: (s.manager.charges || 0) + CHARGES, purchases: (s.manager.purchases || 0) + 1 }
    }))
  }
  ,

  // Offline catch-up: consume manager charges for elapsed cooldown windows
  catchUpManagerWork: () => {
    const MAX_LOOP = MANAGER_CHARGES_PER_HIRE // cap per resume equals actions per hire
    const sixHours = 6 * 60 * 60 * 1000
    const twoHours = 2 * 60 * 60 * 1000
    let processed = 0
    let state = get()
    if ((state.manager.charges || 0) <= 0) return
    let last = state.player.lastWorkTimestamp || 0
    if (last === 0) return
    let consecutive = state.player.consecutiveWorkClicks || 0
    const now = Date.now()

    // If it's been >= 6h since last work, consecutive resets (per current rules)
    if ((now - last) >= sixHours) {
      consecutive = 0
    }

    while ((state.manager.charges || 0) > 0 && processed < MAX_LOOP) {
      let required = (consecutive >= 3) ? sixHours : twoHours
      // Note: rapid processing may have been active during offline period; for simplicity, apply current effect
      if ((get().rapidProcessingUntil || 0) > Date.now()) {
        required = Math.floor(required / 2)
      }
      const eligibleAt = last + required
      if (eligibleAt > now) break
      const actionTime = eligibleAt + 1
      get()._applyWork(actionTime, true)
      // decrement one charge
      set(s => ({ manager: { ...s.manager, charges: Math.max(0, (s.manager.charges || 0) - 1) } }))
      // refresh state references for next iteration
      state = get()
      last = state.player.lastWorkTimestamp || actionTime
      consecutive = (state.player.consecutiveWorkClicks || 0)
      processed += 1
    }
  }
  ,

  // Process sustained effects (interest accrual, expirations)
  tickEffects: () => {
    const state = get()
    const now = Date.now()

    // Investment Bank: grant 5% daily while active
    const activeUntil = state.compoundActiveUntil || 0
    let lastTick = state.compoundLastTick || 0
    const oneDay = 24 * 60 * 60 * 1000
    if (activeUntil > now && lastTick > 0) {
      // grant for each elapsed day
      while ((now - lastTick) >= oneDay && (lastTick + oneDay) <= activeUntil) {
        lastTick += oneDay
        const grant = Math.floor(get().player.wealth * 0.05)
        if (grant > 0) {
          set(s => ({ player: { ...s.player, wealth: s.player.wealth + grant } }))
          set(() => ({ lastBoostEvent: { id: 'investment_bank', message: `Compound Interest: +${grant} $WEALTH`, timestamp: Date.now() } }))
        }
      }
      if (lastTick !== state.compoundLastTick) {
        set(() => ({ compoundLastTick: lastTick }))
      }
    }

    // Expiration cleanups (optional: can toggle active flags off)
    // When rapid processing expires, nothing else to do
    // When conversion boost expires, rates naturally revert

    // Daily synergy wealth bonus (if any synergy grants it)
    try {
      const activeSynergies = calculateActiveSynergies(state.activeSlots)
      const effects = calculateSynergyEffects(activeSynergies)
      const daily = effects.dailyWealthBonus || 0
      if (daily > 0) {
        const last = state.synergyLastTick || 0
        const oneDay = 24 * 60 * 60 * 1000
        if (last === 0) {
          set(() => ({ synergyLastTick: now }))
        } else if ((now - last) >= oneDay) {
          const days = Math.floor((now - last) / oneDay)
          const gain = daily * days
          if (gain > 0) {
            set(s => ({ player: { ...s.player, wealth: s.player.wealth + gain } }))
            set(() => ({ lastBoostEvent: { id: 'synergy', message: `Synergy bonus: +${gain} $WEALTH`, timestamp: Date.now() } }))
          }
          set(() => ({ synergyLastTick: last + days * oneDay }))
        }
      }
    } catch {}

    // Exchange Pool daily reset at resetAt
    try {
      const pool = get().exchangePool
      if ((pool.resetAt || 0) > 0 && now >= pool.resetAt) {
        const next = new Date()
        const nextReset = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth(), next.getUTCDate() + 1, 0, 0, 0)).getTime()
        set(s => ({ exchangePool: { ...s.exchangePool, redeemedTodayWealth: 0, perUserRedeemedToday: {}, resetAt: nextReset } }))
      }
    } catch {}
  }
  ,

  // Reset local game progress (demo/local only)
  resetGame: () => {
    const baselinePlayer: Player = {
      id: 'demo-player',
      level: 1,
      xp: 0,
      credits: 100,
      wealth: 1000,
      usd: 250,
      sol: 0.5,
      walletAddress: undefined,
      workStreak: 0,
      lastWorkDate: '',
      workSessionCount: 0,
      lastSessionEnd: 0,
      warScore: 1000,
      landNFTs: 0
    }
    set({
      player: baselinePlayer,
      businesses: mockBusinesses.map(b => ({ ...b })),
      enhancedBusinesses: mockEnhancedBusinesses.map(b => ({ ...b })),
      activeSlots: [],
      maxSlots: 1,
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
      activeRaids: [],
      landNFTs: [],
      treasuryReserve: { credits: 1000000, wealth: 10000 },
      exchangePool: {
        rateCreditsPerWealth: 75,
        feeBps: 100,
        globalDailyCapWealth: 1000,
        userDailyCapWealth: 10,
        redeemedTodayWealth: 0,
        perUserRedeemedToday: {},
        resetAt: (() => { const now = new Date(); const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)); return next.getTime() })()
      },
      conversionRate: 75,
      wealthToCreditsRate: 75,
      marketPrices: { solUsd: 150, wealthUsd: 1 },
      dexFeeBps: 50,
      showShareModal: false,
      shareBoostActive: false,
      currentTime: Date.now(),
      rapidProcessingUntil: undefined,
      compoundActiveUntil: undefined,
      compoundLastTick: undefined,
      conversionBoostUntil: undefined,
      intelRevealUntil: undefined,
      bypassDefensesUntil: undefined,
      synergyLastTick: undefined,
      manager: { charges: 0, purchases: 0 },
      onChainCooldownUntil: undefined,
    })
    try {
      // Clear notifications too if store available
      const notif = (useNotificationStore as any)?.getState?.()
      if (notif && notif.clearAll) notif.clearAll()
    } catch {}
  }
}), {
  name: 'wealth-wars-store',
  version: 2,
  migrate: (persistedState: any, version) => {
    // Ensure users with older saves get at least 4 enhanced business slots
    if (version < 2 && persistedState) {
      const upgraded = { ...persistedState }
      const currentMax = typeof upgraded.maxSlots === 'number' ? upgraded.maxSlots : 0
      // Previous baseline was 4 static; keep their progress but never below 1
      if (currentMax < 1) upgraded.maxSlots = 1
      // If activeSlots somehow exceeds the new max, trim it
      if (Array.isArray(upgraded.activeSlots) && upgraded.activeSlots.length > (upgraded.maxSlots || 4)) {
        upgraded.activeSlots = upgraded.activeSlots.slice(0, upgraded.maxSlots || 4)
      }
      return upgraded
    }
    return persistedState as any
  },
  storage: createJSONStorage(() => {
    if (typeof window === 'undefined') {
      // Returning undefined would break types; provide a minimal in-memory shim for SSR
      const mem = new Map<string, string>()
      return {
        getItem: (name: string) => mem.get(name) ?? null,
        setItem: (name: string, value: string) => { mem.set(name, value) },
        removeItem: (name: string) => { mem.delete(name) },
      } as unknown as Storage
    }
    return localStorage
  }),
  partialize: (state) => ({
    player: state.player,
    businesses: state.businesses,
    enhancedBusinesses: state.enhancedBusinesses,
    activeSlots: state.activeSlots,
    maxSlots: state.maxSlots,
    questsActive: state.questsActive,
    questDailyResetAt: state.questDailyResetAt,
    questWeeklyResetAt: state.questWeeklyResetAt,
    battleState: state.battleState,
    lottery: state.lottery,
    treasuryReserve: state.treasuryReserve,
    exchangePool: state.exchangePool,
    conversionRate: state.conversionRate,
    wealthToCreditsRate: state.wealthToCreditsRate,
    marketPrices: state.marketPrices,
    dexFeeBps: state.dexFeeBps,
  // Chat + unread tracking (cap already enforced on append)
  globalChat: state.globalChat,
  clanChat: state.clanChat,
  lastSeenGlobalChatCount: state.lastSeenGlobalChatCount,
  lastSeenClanChatCounts: state.lastSeenClanChatCounts,
  npcBots: state.npcBots,
    rapidProcessingUntil: state.rapidProcessingUntil,
    compoundActiveUntil: state.compoundActiveUntil,
    compoundLastTick: state.compoundLastTick,
    conversionBoostUntil: state.conversionBoostUntil,
    intelRevealUntil: state.intelRevealUntil,
    bypassDefensesUntil: state.bypassDefensesUntil,
    synergyLastTick: state.synergyLastTick,
    manager: state.manager,
    onChainCooldownUntil: state.onChainCooldownUntil,
  })
}))