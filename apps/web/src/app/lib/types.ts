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
