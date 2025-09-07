export interface Asset {
  id: string;
  name: string;
  level: number;
  yieldPerTick: number;
  upgradeCost: number;
  condition: number;
  cooldowns: {
    collect: number;
    upgrade: number;
    defend: number;
  };
  // AdCap extensions (additive)
  outlets?: number;
  costPerOutlet?: number;
  cycleMs?: number;
  nextReadyTs?: number;
  managerHired?: boolean;
  milestones?: number[];
  multiplier?: number;
}

export interface Player {
  level: number;
  xp: number;
  wealth: number;
  liquidity: number;
  prestige: number;
  clanEligible: boolean;
  username: string;
  creditBalance: number; // Credit balance that increases per work action
  streakDays: number;
  lastClickDay: number; // Legacy - keeping for compatibility
  lastWorkDay: number; // Day of last work action (for streak calculation)
  lastWorkTime: number; // Timestamp of last work action (for cooldown)
  workCooldown: number; // Current work cooldown in milliseconds
  workFrequency: 'novice' | 'apprentice' | 'skilled' | 'expert' | 'master'; // Work frequency tier
  totalWorkActions: number; // Total number of work actions performed
  totalCreditsEarned: number; // Total credits earned from all work actions
  business: { 
    clickBonusPerDay: number; // Legacy - keeping for compatibility
    lemStand: number; 
    cafe: number; 
    factory: number; 
  };
  // Enhanced Business System
  enhancedBusinesses: string[]; // Owned enhanced business IDs
  activeBusinessSlots: BusinessSlot[]; // Currently active business slots
  businessCooldowns: Record<string, number>; // Business ability cooldowns
  activeEffects: Record<string, { endTime: number; effect: any }>; // Active temporary effects
  // Takeover System
  accountCreated: number; // Timestamp for new player protection
  portfolioValue: number; // Total value of owned businesses (cached)
  takeoversReceived: TakeoverBid[]; // Incoming takeover attempts
  takeoversInitiated: TakeoverBid[]; // Outgoing takeover attempts
  defenseHistory: DefenseResponse[]; // Recent defense actions
  takeoverProtections: string[]; // Active protection business IDs
  lastTakeoverCheck: number; // Last time eligibility was calculated
}

export interface Derived {
  assetValue: number;
  risk: number;
  pnlSeries: number[];
  profitPerSecond?: number; // AdCap extension
}

export interface Swap {
  amount: number;
  fromToken: string;
  toToken: string;
  price: number;
}

export interface LeaderboardPlayer {
  id: string;
  username: string;
  rank: number;
  creditBalance: number;
  totalClicks: number; // Legacy - keeping for compatibility
  totalWorkActions: number; // New - number of work actions performed
  streakDays: number;
  workFrequency: 'novice' | 'apprentice' | 'skilled' | 'expert' | 'master';
  business: {
    clickBonusPerDay: number; // Legacy
    lemStand: number;
    cafe: number;
    factory: number;
  };
  clan?: string;
  level: number;
  xp: number;
  wealth: number;
  joinDate: string;
  lastActive: string;
  avatar: string;
  // Takeover Statistics
  takeoverWins?: number;
  takeoverLosses?: number;
  takeoverSuccessRate?: number; // calculated percentage
}

// Enhanced Business System Types
export interface BusinessAbility {
  id: string;
  name: string;
  description: string;
  type: 'active' | 'passive' | 'triggered';
  cooldown?: number; // milliseconds
  duration?: number; // milliseconds for temporary effects
  uses?: number; // limited uses per time period
  cost?: number; // activation cost in credits
}

export interface EnhancedBusiness {
  id: string;
  name: string;
  emoji: string;
  description: string; // Added description field
  cost: number;
  workMultiplier: number;
  category: 'efficiency' | 'defensive' | 'offensive' | 'utility';
  tier: 'basic' | 'advanced' | 'premium' | 'legendary';
  ability: BusinessAbility;
  prerequisites?: string[]; // required achievements or other businesses
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface BusinessSlot {
  businessId: string | null;
  isActive: boolean;
  abilityLastUsed?: number;
  abilityUsesRemaining?: number;
}

export interface PlayerBusinessState {
  ownedBusinesses: string[]; // Business IDs
  activeSlots: BusinessSlot[]; // Limited slots based on work frequency
  businessCooldowns: Record<string, number>; // Ability cooldowns
  takeoversReceived: number;
  takeoversInitiated: number;
}

// Takeover System Types
export interface TakeoverTarget {
  type: 'business' | 'portfolio_stake' | 'work_streak' | 'active_slot' | 'wealth_reserve';
  businessId?: string;
  value: number; // Credits equivalent
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  defenseDifficulty: number; // 1-100 scale
}

export interface TakeoverBid {
  id: string;
  attackerId: string;
  targetPlayerId: string;
  target: TakeoverTarget;
  bidAmount: number; // Credits or wealth amount
  bidCurrency: 'credits' | 'wealth';
  timestamp: number;
  expiresAt: number; // 24-hour bidding window
  status: 'pending' | 'active' | 'defended' | 'successful' | 'failed' | 'cancelled';
  currentHighestBid?: number;
  currentHighestBidder?: string;
}

export interface DefenseResponse {
  defenderId: string;
  takeoverId: string;
  defenseType: 'credit_counter' | 'business_protection' | 'alliance_support' | 'cancel_payment';
  defenseAmount: number;
  businessUsed?: string; // If using defensive business ability
  timestamp: number;
  success: boolean;
}

export interface TakeoverEligibility {
  canBeTargeted: boolean;
  reason?: string;
  portfolioValue: number;
  protectionLevel: 'absolute' | 'limited' | 'none';
  protectedBusinesses: string[];
  minimumAttackCost: number;
}

export interface TakeoverResult {
  success: boolean;
  attackerId: string;
  defenderId: string;
  target: TakeoverTarget;
  finalBid: number;
  currency: 'credits' | 'wealth';
  defenseAttempted: boolean;
  compensation?: number; // What defender received
  timestamp: number;
}
