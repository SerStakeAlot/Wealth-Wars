import { create } from 'zustand';
import { Asset, Player, Derived } from './types';
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
  // Username management
  setUsername: (username: string) => Promise<{ success: boolean; error?: string }>;
  setWalletAddress: (address: string) => void;
  walletAddress: string;
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
}));
