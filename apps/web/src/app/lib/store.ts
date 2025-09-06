import { create } from 'zustand';
import { Asset, Player, Derived, LeaderboardPlayer } from './types';
import { calculateAssetValue, calculateRisk, getPriceInSol, calculateProfitPerSecond, calculateOutletCost, calculateMultiplier, getNextMilestone, DEFAULT_CYCLE_MS, MILESTONES } from './balance';
import { prestigeFromBehavior, CLAN_MIN_LEVEL } from './prestige';

interface GameState extends Player {
  assets: Asset[];
  collect: (id: string) => void;
  upgrade: (id: string) => void;
  defend: (id: string) => void;
  pnlSeries: (priceFn?: (token: string) => number) => number[];
  derived: Derived;
  // AdCap extensions
  buyOutlet: (id: string, qty: number) => void;
  toggleManager: (id: string, on: boolean) => void;
  tick: () => void;
  // Demo-style functions (new tokenomics)
  clickWork: () => void;
  buyBusiness: (bizKind: number) => void;
  initPlayer: () => void;
  // Solana integration functions
  initPlayerOnChain: () => Promise<void>;
  clickWorkOnChain: () => Promise<void>;
  buyBusinessOnChain: (bizKind: number) => Promise<void>;
  swapCreditForWealth: (amount: string) => Promise<void>;
  swapWealthForCredit: (amount: string) => Promise<void>;
  refreshPlayerData: () => Promise<void>;
  // Username management
  setUsername: (username: string) => Promise<{ success: boolean; error?: string }>;
  setWalletAddress: (address: string) => void;
  walletAddress: string;
  // Solana state
  isOnChainMode: boolean;
  setOnChainMode: (enabled: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Leaderboard data
  leaderboardPlayers: LeaderboardPlayer[];
  refreshLeaderboard: () => void;
  viewPlayerProfile: (playerId: string) => void;
  selectedPlayer: LeaderboardPlayer | null;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

const COOLDOWN_MS = 5000; // 5 seconds cooldown for actions

// Username management utilities
const USERNAMES_KEY = 'wealth-wars-usernames';
const USER_PROFILES_KEY = 'wealth-wars-user-profiles';

const getUserProfiles = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(USER_PROFILES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveUserProfiles = (profiles: Record<string, string>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    // Ignore localStorage errors
  }
};

const isUsernameAvailable = (username: string, walletAddress: string): boolean => {
  const profiles = getUserProfiles();
  const lowerUsername = username.toLowerCase();
  for (const [addr, uname] of Object.entries(profiles)) {
    if (addr !== walletAddress && uname.toLowerCase() === lowerUsername) {
      return false;
    }
  }
  return true;
};

const reserveUsername = (walletAddress: string, username: string): boolean => {
  const profiles = getUserProfiles();
  profiles[walletAddress] = username;
  saveUserProfiles(profiles);
  return true;
};

const getUsernameForWallet = (walletAddress: string): string => {
  const profiles = getUserProfiles();
  return profiles[walletAddress] || '';
};

const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (!username.trim()) {
    return { valid: false, error: 'Username is required' };
  }
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 20) {
    return { valid: false, error: 'Username must be less than 20 characters' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  return { valid: true };
};

export const useGame = create<GameState>((set, get) => ({
  // Player state
  level: 1,
  xp: 20,
  wealth: 150,
  liquidity: 0.22,
  prestige: 0,
  clanEligible: false,
  username: '',
  walletAddress: '',
  
  // Daily Work System state
  creditBalance: 10,
  streakDays: 0,
  lastClickDay: 0, // Legacy - keeping for compatibility
  lastWorkDay: 0,
  lastWorkTime: 0,
  workCooldown: 24 * 60 * 60 * 1000, // 24 hours default
  workFrequency: 'novice',
  totalWorkActions: 0,
  totalCreditsEarned: 0,
  business: {
    clickBonusPerDay: 1, // Legacy - keeping for compatibility
    lemStand: 0,
    cafe: 0,
    factory: 0
  },

  // Solana state
  isOnChainMode: false,
  loading: false,

  // Leaderboard data
  leaderboardPlayers: [],
  selectedPlayer: null,

  assets: [
    {
      id: 'farm',
      name: 'Crypto Mining Farm',
      level: 1,
      yieldPerTick: 24,
      upgradeCost: 80,
      condition: 72,
      cooldowns: { collect: 0, upgrade: 0, defend: 0 },
      outlets: 1,
      costPerOutlet: 8,
      cycleMs: DEFAULT_CYCLE_MS,
      nextReadyTs: 0,
      managerHired: false,
      milestones: MILESTONES,
      multiplier: 1
    },
    {
      id: 'reit',
      name: 'REIT Tower',
      level: 1,
      yieldPerTick: 18,
      upgradeCost: 60,
      condition: 65,
      cooldowns: { collect: 0, upgrade: 0, defend: 0 },
      outlets: 1,
      costPerOutlet: 6,
      cycleMs: DEFAULT_CYCLE_MS,
      nextReadyTs: 0,
      managerHired: false,
      milestones: MILESTONES,
      multiplier: 1
    },
    {
      id: 'startup',
      name: 'Fintech Startup',
      level: 1,
      yieldPerTick: 14,
      upgradeCost: 55,
      condition: 58,
      cooldowns: { collect: 0, upgrade: 0, defend: 0 },
      outlets: 1,
      costPerOutlet: 5.5,
      cycleMs: DEFAULT_CYCLE_MS,
      nextReadyTs: 0,
      managerHired: false,
      milestones: MILESTONES,
      multiplier: 1
    },
    {
      id: 'mine',
      name: 'Rare Metals Mine',
      level: 1,
      yieldPerTick: 28,
      upgradeCost: 95,
      condition: 50,
      cooldowns: { collect: 0, upgrade: 0, defend: 0 },
      outlets: 1,
      costPerOutlet: 9.5,
      cycleMs: DEFAULT_CYCLE_MS,
      nextReadyTs: 0,
      managerHired: false,
      milestones: MILESTONES,
      multiplier: 1
    },
  ],

  derived: {
    assetValue: 0,
    risk: 0,
    pnlSeries: [],
  },

  collect: (id: string) => {
    const assets = get().assets;
    const a = assets.find(x => x.id === id)!;
    const now = Date.now();

    // Check if cycle is ready or start a new one
    const isReady = a.nextReadyTs ? now >= a.nextReadyTs : true;
    if (!isReady && !a.managerHired) return;

    const outlets = a.outlets || 1;
    const multiplier = a.multiplier || 1;
    const profit = a.yieldPerTick * outlets * multiplier;

    set(state => {
      const newXp = state.xp + 5;
      const newLevel = newXp >= 100 ? state.level + 1 : state.level;
      const newPrestige = prestigeFromBehavior({ ...state, level: newLevel }, { ...state.derived, assetValue: calculateAssetValue(state.assets) });
      return {
        wealth: state.wealth + profit,
        xp: newXp >= 100 ? 0 : newXp,
        level: newLevel,
        prestige: newPrestige,
        clanEligible: newLevel >= CLAN_MIN_LEVEL,
        liquidity: clamp(state.liquidity + (Math.random() - 0.5) * 0.03, 0.05, 0.6),
        assets: state.assets.map(asset =>
          asset.id === id ? {
            ...asset,
            nextReadyTs: now + (asset.cycleMs || DEFAULT_CYCLE_MS),
            cooldowns: { ...asset.cooldowns, collect: now + COOLDOWN_MS }
          } : asset
        ),
        derived: {
          assetValue: calculateAssetValue(state.assets),
          risk: calculateRisk(state.assets),
          pnlSeries: state.derived.pnlSeries,
          profitPerSecond: calculateProfitPerSecond(state.assets)
        },
      };
    });
  },

  upgrade: (id: string) => {
    const assets = get().assets;
    const asset = assets.find(a => a.id === id)!;
    if (get().wealth < asset.upgradeCost || Date.now() < asset.cooldowns.upgrade) return;
    set(state => {
      const newXp = state.xp + 18;
      const newLevel = newXp >= 100 ? state.level + 1 : state.level;
      const newPrestige = prestigeFromBehavior({ ...state, level: newLevel }, { ...state.derived, assetValue: calculateAssetValue(state.assets) });
      return {
        wealth: state.wealth - asset.upgradeCost,
        assets: state.assets.map(a =>
          a.id !== id
            ? a
            : {
                ...a,
                level: a.level + 1,
                yieldPerTick: Math.round(a.yieldPerTick * 1.25),
                upgradeCost: Math.round(a.upgradeCost * 1.35),
                condition: clamp(a.condition + 6, 0, 100),
                cooldowns: { ...a.cooldowns, upgrade: Date.now() + COOLDOWN_MS },
              }
        ),
        xp: newXp >= 100 ? 0 : newXp,
        level: newLevel,
        prestige: newPrestige,
        clanEligible: newLevel >= CLAN_MIN_LEVEL,
        liquidity: clamp(state.liquidity + (Math.random() - 0.5) * 0.02, 0.05, 0.6),
        derived: {
          assetValue: calculateAssetValue(state.assets),
          risk: calculateRisk(state.assets),
          pnlSeries: state.derived.pnlSeries,
        },
      };
    });
  },

  defend: (id: string) => {
    const assets = get().assets;
    const asset = assets.find(a => a.id === id)!;
    const fee = 12;
    if (get().wealth < fee || Date.now() < asset.cooldowns.defend) return;
    set(state => ({
      wealth: state.wealth - fee,
      assets: state.assets.map(a =>
        a.id !== id ? a : { ...a, condition: clamp(a.condition + 10, 0, 100), cooldowns: { ...a.cooldowns, defend: Date.now() + COOLDOWN_MS } }
      ),
      liquidity: clamp(state.liquidity - 0.02, 0.05, 0.6),
      derived: {
        assetValue: calculateAssetValue(state.assets),
        risk: calculateRisk(state.assets),
        pnlSeries: state.derived.pnlSeries,
      },
    }));
  },

  pnlSeries: (priceFn?: (token: string) => number) => {
    // Stub: generate a simple PnL series
    const series = [];
    for (let i = 0; i < 10; i++) {
      series.push(Math.random() * 100 - 50); // random PnL values
    }
    return series;
  },

  // AdCap actions
  buyOutlet: (id: string, qty: number) => {
    const assets = get().assets;
    const asset = assets.find(a => a.id === id);
    if (!asset) return;

    const cost = calculateOutletCost(asset, qty);
    if (get().wealth < cost) return;

    set(state => ({
      wealth: state.wealth - cost,
      assets: state.assets.map(a =>
        a.id !== id ? a : {
          ...a,
          outlets: (a.outlets || 1) + qty,
          multiplier: calculateMultiplier((a.outlets || 1) + qty, a.milestones)
        }
      ),
      derived: {
        ...state.derived,
        profitPerSecond: calculateProfitPerSecond(state.assets)
      }
    }));
  },

  toggleManager: (id: string, on: boolean) => {
    const assets = get().assets;
    const asset = assets.find(a => a.id === id);
    if (!asset) return;

    // Alpha: free toggle (no cost)
    set(state => ({
      assets: state.assets.map(a =>
        a.id !== id ? a : {
          ...a,
          managerHired: on,
          nextReadyTs: on && !a.nextReadyTs ? Date.now() + (a.cycleMs || DEFAULT_CYCLE_MS) : a.nextReadyTs
        }
      ),
      derived: {
        ...state.derived,
        profitPerSecond: calculateProfitPerSecond(state.assets)
      }
    }));
  },

  tick: () => {
    const now = Date.now();
    set(state => {
      const updatedAssets = state.assets.map(asset => {
        if (!asset.managerHired || !asset.nextReadyTs) return asset;

        if (now >= asset.nextReadyTs) {
          // Auto-collect and start next cycle
          const outlets = asset.outlets || 1;
          const multiplier = asset.multiplier || 1;
          const profit = asset.yieldPerTick * outlets * multiplier;

          return {
            ...asset,
            nextReadyTs: now + (asset.cycleMs || DEFAULT_CYCLE_MS)
          };
        }
        return asset;
      });

      return {
        wealth: state.wealth + updatedAssets.reduce((sum, asset) => {
          if (!asset.managerHired || !asset.nextReadyTs || now < asset.nextReadyTs) return sum;

          const outlets = asset.outlets || 1;
          const multiplier = asset.multiplier || 1;
          return sum + (asset.yieldPerTick * outlets * multiplier);
        }, 0),
        assets: updatedAssets,
        derived: {
          ...state.derived,
          profitPerSecond: calculateProfitPerSecond(updatedAssets)
        }
      };
    });
  },

  setUsername: async (username: string) => {
    const { valid, error } = validateUsername(username);
    if (!valid) {
      return { success: false, error };
    }

    const currentState = get();
    const walletAddress = currentState.walletAddress;
    
    if (!walletAddress) {
      return { success: false, error: 'Please connect your wallet first' };
    }

    const oldUsername = currentState.username;

    if (!isUsernameAvailable(username, walletAddress) && username.toLowerCase() !== oldUsername.toLowerCase()) {
      return { success: false, error: 'Username is already taken' };
    }

    if (reserveUsername(walletAddress, username)) {
      set({ username });
      return { success: true };
    } else {
      return { success: false, error: 'Failed to reserve username' };
    }
  },

  setWalletAddress: (address: string) => {
    const username = address ? getUsernameForWallet(address) : '';
    set({ walletAddress: address, username });
  },

  // Daily Work System (new tokenomics)
  clickWork: () => {
    const now = Date.now();
    set(state => {
      // Check if work cooldown is ready
      const timeSinceLastWork = now - (state.lastWorkTime || 0);
      const requiredCooldown = state.workCooldown || (24 * 60 * 60 * 1000); // 24 hours default
      
      if (timeSinceLastWork < requiredCooldown) {
        // Return current state - work not ready
        return state;
      }
      
      // Calculate work frequency based on progression
      const totalBusinesses = state.business.lemStand + state.business.cafe + state.business.factory;
      const totalCreditsEarned = state.totalCreditsEarned || 0;
      
      let workFrequency: 'novice' | 'apprentice' | 'skilled' | 'expert' | 'master' = 'novice';
      let baseCooldown = 24 * 60 * 60 * 1000; // 24 hours
      
      if (totalCreditsEarned >= 1000000 || totalBusinesses >= 25) {
        workFrequency = 'master';
        baseCooldown = 6 * 60 * 60 * 1000; // 6 hours
      } else if (totalCreditsEarned >= 200000 || totalBusinesses >= 15) {
        workFrequency = 'expert';
        baseCooldown = 8 * 60 * 60 * 1000; // 8 hours
      } else if (totalCreditsEarned >= 50000 || totalBusinesses >= 8) {
        workFrequency = 'skilled';
        baseCooldown = 12 * 60 * 60 * 1000; // 12 hours
      } else if (state.streakDays >= 7 && totalBusinesses >= 3) {
        workFrequency = 'apprentice';
        baseCooldown = 18 * 60 * 60 * 1000; // 18 hours
      }
      
      // Calculate work value
      const baseCredits = 10; // Base work value
      const streakBonus = state.streakDays * 2; // 2 credits per consecutive day
      const businessBonus = 
        (state.business.lemStand * 5) +     // +5 credits per lemonade stand
        (state.business.cafe * 25) +        // +25 credits per coffee cafe
        (state.business.factory * 100);     // +100 credits per widget factory
      
      const workValue = baseCredits + streakBonus + businessBonus;
      
      // Check if it's a new day for streak calculation
      const currentDay = Math.floor(now / (24 * 60 * 60 * 1000));
      const isNewDay = currentDay > (state.lastWorkDay || 0);
      const newStreakDays = isNewDay ? state.streakDays + 1 : state.streakDays;
      
      const xpGain = 5 + Math.floor(newStreakDays * 0.5); // XP scales with streak
      const newXp = state.xp + xpGain;
      const newLevel = newXp >= 100 ? state.level + 1 : state.level;
      
      return {
        creditBalance: state.creditBalance + workValue,
        streakDays: newStreakDays,
        lastWorkDay: currentDay,
        lastWorkTime: now,
        workCooldown: baseCooldown,
        workFrequency,
        totalWorkActions: (state.totalWorkActions || 0) + 1,
        totalCreditsEarned: (state.totalCreditsEarned || 0) + workValue,
        xp: newXp >= 100 ? 0 : newXp,
        level: newLevel,
        clanEligible: newLevel >= CLAN_MIN_LEVEL,
      };
    });
  },

  buyBusiness: (bizKind: number) => {
    const businessTypes = ['lemStand', 'cafe', 'factory'] as const;
    const costs = [10, 50, 200]; // Credit costs for each business type
    // Note: Businesses now multiply work value instead of providing click bonuses
    // Lemonade Stand: +5 credits per work action
    // Coffee Cafe: +25 credits per work action  
    // Widget Factory: +100 credits per work action
    
    if (bizKind < 0 || bizKind >= businessTypes.length) return;
    
    const businessType = businessTypes[bizKind];
    const cost = costs[bizKind];
    
    set(state => {
      if (state.creditBalance < cost) return state;
      
      const newBusiness = {
        ...state.business,
        [businessType]: state.business[businessType] + 1,
        // Keep legacy clickBonusPerDay for compatibility but it's not used in new system
        clickBonusPerDay: state.business.clickBonusPerDay + [1, 5, 20][bizKind]
      };
      
      return {
        creditBalance: state.creditBalance - cost,
        business: newBusiness,
      };
    });
  },

  initPlayer: () => {
    // Initialize or reset player to demo state
    set(state => ({
      ...state,
      creditBalance: 10, // Starting credits
      streakDays: 0,
      lastClickDay: 0, // Legacy
      lastWorkDay: 0,
      lastWorkTime: 0,
      workCooldown: 24 * 60 * 60 * 1000, // 24 hours
      workFrequency: 'novice',
      totalWorkActions: 0,
      totalCreditsEarned: 0,
      business: {
        clickBonusPerDay: 1, // Legacy
        lemStand: 0,
        cafe: 0,
        factory: 0
      },
      level: 1,
      xp: 0,
    }));
  },

  // Solana blockchain functions
  setOnChainMode: (enabled: boolean) => {
    set({ isOnChainMode: enabled });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  initPlayerOnChain: async () => {
    // Placeholder for Solana on-chain player initialization
    // This will be implemented when Anchor program is deployed
    console.log('initPlayerOnChain called - requires Anchor program deployment');
  },

  clickWorkOnChain: async () => {
    // Placeholder for Solana on-chain work clicking
    // This will be implemented when Anchor program is deployed
    console.log('clickWorkOnChain called - requires Anchor program deployment');
  },

  buyBusinessOnChain: async (bizKind: number) => {
    // Placeholder for Solana on-chain business purchases
    // This will be implemented when Anchor program is deployed
    console.log('buyBusinessOnChain called with:', bizKind, '- requires Anchor program deployment');
  },

  swapCreditForWealth: async (amount: string) => {
    // Placeholder for Solana on-chain credit to $WEALTH swaps
    // This will be implemented when Anchor program is deployed
    console.log('swapCreditForWealth called with amount:', amount, '- requires Anchor program deployment');
  },

  swapWealthForCredit: async (amount: string) => {
    // Placeholder for Solana on-chain $WEALTH to credit swaps
    // This will be implemented when Anchor program is deployed
    console.log('swapWealthForCredit called with amount:', amount, '- requires Anchor program deployment');
  },

  refreshPlayerData: async () => {
    // Placeholder for fetching player data from Solana blockchain
    // This will be implemented when Anchor program is deployed
    console.log('refreshPlayerData called - requires Anchor program deployment');
  },

  // Leaderboard functions
  refreshLeaderboard: () => {
    // Generate mock leaderboard data for demo
    const mockPlayers: LeaderboardPlayer[] = [
      {
        id: '1',
        username: 'CryptoKing',
        rank: 1,
        creditBalance: 15420,
        totalClicks: 892, // Legacy
        totalWorkActions: 89,
        streakDays: 12,
        workFrequency: 'expert',
        business: { clickBonusPerDay: 45, lemStand: 15, cafe: 8, factory: 3 },
        clan: 'Diamond Hands',
        level: 8,
        xp: 85,
        wealth: 2840,
        joinDate: '2025-08-15',
        lastActive: '2025-09-05T06:30:00Z',
        avatar: '👑'
      },
      {
        id: '2',
        username: 'SolanaWhale',
        rank: 2,
        creditBalance: 12850,
        totalClicks: 756, // Legacy
        totalWorkActions: 76,
        streakDays: 8,
        workFrequency: 'skilled',
        business: { clickBonusPerDay: 38, lemStand: 12, cafe: 6, factory: 2 },
        clan: 'Solana Sharks',
        level: 7,
        xp: 92,
        wealth: 2180,
        joinDate: '2025-08-20',
        lastActive: '2025-09-05T05:45:00Z',
        avatar: '🐋'
      },
      {
        id: '3',
        username: 'DefiMaster',
        rank: 3,
        creditBalance: 9640,
        totalClicks: 623, // Legacy
        totalWorkActions: 62,
        streakDays: 15,
        workFrequency: 'skilled',
        business: { clickBonusPerDay: 32, lemStand: 10, cafe: 5, factory: 1 },
        level: 6,
        xp: 64,
        wealth: 1750,
        joinDate: '2025-08-25',
        lastActive: '2025-09-05T04:20:00Z',
        avatar: '⚡'
      },
      {
        id: '4',
        username: 'TokenTycoon',
        rank: 4,
        creditBalance: 8320,
        totalClicks: 487, // Legacy
        totalWorkActions: 49,
        streakDays: 6,
        workFrequency: 'apprentice',
        business: { clickBonusPerDay: 28, lemStand: 8, cafe: 4, factory: 1 },
        clan: 'Token Titans',
        level: 5,
        xp: 43,
        wealth: 1420,
        joinDate: '2025-09-01',
        lastActive: '2025-09-05T03:10:00Z',
        avatar: '💎'
      },
      {
        id: '5',
        username: 'WealthBuilder',
        rank: 5,
        creditBalance: 6750,
        totalClicks: 412, // Legacy
        totalWorkActions: 41,
        streakDays: 4,
        workFrequency: 'novice',
        business: { clickBonusPerDay: 22, lemStand: 6, cafe: 3, factory: 0 },
        level: 4,
        xp: 78,
        wealth: 980,
        joinDate: '2025-09-03',
        lastActive: '2025-09-05T02:30:00Z',
        avatar: '🏗️'
      }
    ];
    
    set({ leaderboardPlayers: mockPlayers });
  },

  viewPlayerProfile: (playerId: string) => {
    const { leaderboardPlayers } = get();
    const player = leaderboardPlayers.find(p => p.id === playerId);
    set({ selectedPlayer: player || null });
  },
}));
