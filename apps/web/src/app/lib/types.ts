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
  enhancedBusinesses: string[];
  businessCooldowns: Record<string, number>;
  activeEffects: Record<string, any>;
  // Takeover System
  accountCreated: number; // Timestamp for new player protection
  portfolioValue: number; // Total value of owned businesses (cached)
  takeoversReceived: TakeoverBid[]; // Incoming takeover attempts
  takeoversInitiated: TakeoverBid[]; // Outgoing takeover attempts
  defenseHistory: DefenseResponse[]; // Recent defense actions
  takeoverProtections: string[]; // Active protection business IDs
  lastTakeoverCheck: number; // Last time eligibility was calculated
  // Business Maintenance
  businessConditions: Record<string, BusinessCondition>;
  maintenanceBudget: number;
  lastMaintenanceCheck: number;
  maintenanceNotifications: MaintenanceNotification[];
  totalMaintenanceSpent: number;

  // WAR (Wealth Asset Ratio) System
  war: WealthAssetRatio;
  warHistory: WARHistoryEntry[];

  // Business Slot Management System
  businessSlots: BusinessSlotSystem;
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
  takeoverSuccessRate?: number;

  // Business Maintenance
  businessConditions: Record<string, BusinessCondition>;
  maintenanceBudget: number;
  lastMaintenanceCheck: number;
  maintenanceNotifications: MaintenanceNotification[];
  totalMaintenanceSpent: number;

  // WAR (Wealth Asset Ratio) System
  war: WealthAssetRatio;
  warHistory: WARHistoryEntry[];
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
  message: string;
  newOwner?: string;
  compensationPaid?: number;
  businessTransferred?: string;
}

// Business Maintenance System
export interface MaintenanceRecord {
  id: string;
  timestamp: number;
  type: 'routine' | 'major' | 'upgrade' | 'emergency';
  cost: number;
  conditionBefore: number;
  conditionAfter: number;
  downtime: number; // hours offline
  description: string;
}

export interface BusinessCondition {
  businessId: string;
  condition: number; // 0-100 (100 = perfect, 0 = broken)
  lastMaintained: number;
  degradationRate: number; // % per day
  maintenanceCost: number;
  efficiencyMultiplier: number; // 0.0-1.0 based on condition
  warningLevel: 'good' | 'caution' | 'critical' | 'broken';
  maintenanceHistory: MaintenanceRecord[];
  isOffline: boolean; // true during maintenance
  offlineUntil?: number; // timestamp when maintenance completes
  upgradeBonus: number; // permanent efficiency bonus from upgrades
}

export interface MaintenanceAction {
  type: 'routine' | 'major' | 'upgrade' | 'emergency';
  name: string;
  costMultiplier: number; // % of business value
  conditionRestored: number; // points restored
  duration: number; // hours offline
  preventsDegradation: number; // days of slower degradation
  description: string;
  upgradeBonus?: number; // permanent efficiency bonus
}

export interface MaintenanceNotification {
  id: string;
  businessId: string;
  businessName: string;
  type: 'warning' | 'critical' | 'broken' | 'maintenance_complete';
  message: string;
  action: string;
  timestamp: number;
  dismissed: boolean;
}

// WAR (Wealth Asset Ratio) System
export interface WealthAssetRatio {
  current: number;           // Current WAR score
  peak: number;             // Highest WAR ever achieved
  trend: 'rising' | 'falling' | 'stable';  // 7-day trend
  rank: number;             // WAR leaderboard position
  efficiency: 'poor' | 'average' | 'good' | 'excellent' | 'legendary';
}

export interface WARHistoryEntry {
  timestamp: number;
  war: number;
  trigger: string;
  portfolioValue: number;
  wealthAmount: number;
}

// Business Slot Management System
export interface ActiveSlot {
  slotId: number;
  businessId: string | null;
  activatedAt: number; // timestamp when business was placed in slot
}

export interface SlotManagement {
  activeSlots: ActiveSlot[];
  maxSlots: number; // based on work frequency level
  lastSlotChange: number; // timestamp of last portfolio edit
  slotCooldownUntil: number; // timestamp when cooldown ends
  canEditSlots: boolean; // derived field for UI
}

export interface SynergyBonus {
  category: 'efficiency' | 'defensive' | 'offensive' | 'utility';
  count: number;
  bonus: number; // percentage bonus (25, 50, 75)
  description: string;
}

export interface BusinessSlotSystem {
  slotManagement: SlotManagement;
  synergyBonuses: SynergyBonus[];
  totalSynergyMultiplier: number; // combined bonus from all synergies
}
