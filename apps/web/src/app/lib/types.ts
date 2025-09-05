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
  creditBalance: number; // New: Credit balance that increases per click
  streakDays: number;
  lastClickDay: number;
  business: { 
    clickBonusPerDay: number; 
    lemStand: number; 
    cafe: number; 
    factory: number; 
  };
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
  totalClicks: number;
  streakDays: number;
  business: {
    clickBonusPerDay: number;
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
