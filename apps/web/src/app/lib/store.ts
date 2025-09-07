import { create } from 'zustand';
import { Asset, Player, Derived, LeaderboardPlayer, EnhancedBusiness, BusinessSlot, TakeoverBid, TakeoverTarget, TakeoverEligibility, DefenseResponse, TakeoverResult } from './types';
import { calculateAssetValue, calculateRisk, getPriceInSol, calculateProfitPerSecond, calculateOutletCost, calculateMultiplier, getNextMilestone, DEFAULT_CYCLE_MS, MILESTONES } from './balance';
import { prestigeFromBehavior, CLAN_MIN_LEVEL } from './prestige';
import { ENHANCED_BUSINESSES } from './businesses';
import { 
  calculateTakeoverEligibility, 
  calculatePortfolioValue, 
  canTargetBusiness, 
  calculateTakeoverCost, 
  validateTakeoverBid, 
  executeTakeover, 
  createBusinessTarget,
  hasActiveProtection
} from './takeover';

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
  // Enhanced Business System
  buyEnhancedBusiness: (businessId: string) => boolean;
  activateBusinessAbility: (businessId: string) => boolean;
  setBusinessActive: (businessId: string, slotIndex: number) => boolean;
  getActiveEffects: () => Record<string, any>;
  getMaxActiveSlots: () => number;
  // Takeover System
  getTakeoverEligibility: () => TakeoverEligibility;
  canTargetPlayerBusiness: (targetPlayerId: string, businessId: string) => { canTarget: boolean; reason?: string; cost?: number };
  initiateTakeover: (targetPlayerId: string, businessId: string, bidAmount: number, currency: 'credits' | 'wealth') => { success: boolean; reason?: string; takeoverId?: string };
  defendTakeover: (takeoverId: string, defenseType: 'credit_counter' | 'business_protection' | 'cancel_payment', amount?: number, businessId?: string) => { success: boolean; reason?: string };
  processPendingTakeovers: () => void;
  updatePortfolioValue: () => void;
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

  // Enhanced Business System
  enhancedBusinesses: [],
  activeBusinessSlots: [],
  businessCooldowns: {},
  activeEffects: {},
  
  // Takeover System
  accountCreated: Date.now(),
  portfolioValue: 0,
  takeoversReceived: [],
  takeoversInitiated: [],
  defenseHistory: [],
  takeoverProtections: [],
  lastTakeoverCheck: 0,

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
      
      // Enhanced business bonuses
      let enhancedBusinessBonus = 0;
      state.activeBusinessSlots.forEach(slot => {
        if (slot.isActive && slot.businessId) {
          const business = ENHANCED_BUSINESSES.find(b => b.id === slot.businessId);
          if (business) {
            enhancedBusinessBonus += business.workMultiplier;
          }
        }
      });
      
      // Apply active effects
      const activeEffects = get().getActiveEffects();
      let workMultiplier = 1;
      let streakMultiplier = 1;
      let cooldownReduction = 0;
      
      Object.values(activeEffects).forEach(effect => {
        const ability = effect.effect;
        if (ability.id === 'rapid_processing') {
          cooldownReduction = 0.5; // 50% cooldown reduction
        } else if (ability.id === 'breakthrough') {
          workMultiplier = 3; // 3x credits for this work action
        } else if (ability.id === 'quick_service') {
          workMultiplier = 1.2; // 20% bonus
        } else if (ability.id === 'viral_campaign') {
          streakMultiplier = 2; // Double streak bonus
        }
      });
      
      const adjustedStreakBonus = Math.floor(streakBonus * streakMultiplier);
      const totalBaseValue = baseCredits + adjustedStreakBonus + businessBonus + enhancedBusinessBonus;
      const workValue = Math.floor(totalBaseValue * workMultiplier);
      
      // Apply cooldown reduction
      const adjustedBaseCooldown = Math.floor(baseCooldown * (1 - cooldownReduction));
      
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
        workCooldown: adjustedBaseCooldown,
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
        portfolioValue: calculatePortfolioValue(state.enhancedBusinesses, newBusiness)
      };
    });
  },

  // Enhanced Business System Methods
  buyEnhancedBusiness: (businessId: string) => {
    const state = get();
    const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
    
    if (!business) return false;
    if (state.creditBalance < business.cost) return false;
    if (state.enhancedBusinesses.includes(businessId)) return false;
    
    // Check prerequisites
    if (business.prerequisites) {
      const meetsPrereqs = business.prerequisites.every(req => {
        if (req === '100_work_actions') return state.totalWorkActions >= 100;
        if (req === 'week_streak') return state.streakDays >= 7;
        return true;
      });
      if (!meetsPrereqs) return false;
    }
    
    set(state => ({
      creditBalance: state.creditBalance - business.cost,
      enhancedBusinesses: [...state.enhancedBusinesses, businessId],
      portfolioValue: calculatePortfolioValue([...state.enhancedBusinesses, businessId], state.business)
    }));
    
    return true;
  },

  activateBusinessAbility: (businessId: string) => {
    const state = get();
    const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
    
    if (!business || !state.enhancedBusinesses.includes(businessId)) return false;
    if (business.ability.type === 'passive') return false; // Passive abilities don't need activation
    
    // Check cooldown
    const lastUsed = state.businessCooldowns[businessId] || 0;
    const now = Date.now();
    if (business.ability.cooldown && now - lastUsed < business.ability.cooldown) return false;
    
    // Check cost
    if (business.ability.cost && state.creditBalance < business.ability.cost) return false;
    
    set(state => {
      const updates: any = {
        businessCooldowns: {
          ...state.businessCooldowns,
          [businessId]: now
        }
      };
      
      // Deduct cost if any
      if (business.ability.cost) {
        updates.creditBalance = state.creditBalance - business.ability.cost;
      }
      
      // Apply temporary effects
      if (business.ability.duration) {
        updates.activeEffects = {
          ...state.activeEffects,
          [business.ability.id]: {
            endTime: now + business.ability.duration,
            effect: business.ability
          }
        };
      }
      
      return updates;
    });
    
    return true;
  },

  setBusinessActive: (businessId: string, slotIndex: number) => {
    const state = get();
    const maxSlots = get().getMaxActiveSlots();
    
    if (slotIndex >= maxSlots) return false;
    if (!state.enhancedBusinesses.includes(businessId)) return false;
    
    set(state => {
      const newSlots = [...state.activeBusinessSlots];
      
      // Ensure we have enough slots
      while (newSlots.length <= slotIndex) {
        newSlots.push({ businessId: null, isActive: false });
      }
      
      // Deactivate any existing slot with this business
      newSlots.forEach(slot => {
        if (slot.businessId === businessId) {
          slot.businessId = null;
          slot.isActive = false;
        }
      });
      
      // Set new slot
      newSlots[slotIndex] = {
        businessId,
        isActive: true,
        abilityLastUsed: 0,
        abilityUsesRemaining: undefined
      };
      
      return { activeBusinessSlots: newSlots };
    });
    
    return true;
  },

  getActiveEffects: () => {
    const state = get();
    const now = Date.now();
    const activeEffects: Record<string, any> = {};
    
    // Clean up expired effects and return active ones
    Object.entries(state.activeEffects).forEach(([effectId, effect]) => {
      if (effect.endTime > now) {
        activeEffects[effectId] = effect;
      }
    });
    
    // Update state to remove expired effects
    set(state => ({
      activeEffects
    }));
    
    return activeEffects;
  },

  getMaxActiveSlots: () => {
    const state = get();
    // Number of active slots based on work frequency
    switch (state.workFrequency) {
      case 'novice': return 1;
      case 'apprentice': return 2;
      case 'skilled': return 3;
      case 'expert': return 4;
      case 'master': return 5;
      default: return 1;
    }
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
      // Enhanced Business System initialization
      enhancedBusinesses: [],
      activeBusinessSlots: [],
      businessCooldowns: {},
      activeEffects: {},
      // Takeover System initialization
      accountCreated: Date.now(),
      portfolioValue: 0,
      takeoversReceived: [],
      takeoversInitiated: [],
      defenseHistory: [],
      takeoverProtections: [],
      lastTakeoverCheck: Date.now(),
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
        avatar: '👑',
        takeoverWins: 8,
        takeoverLosses: 2,
        takeoverSuccessRate: 80
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
        avatar: '🐋',
        takeoverWins: 6,
        takeoverLosses: 3,
        takeoverSuccessRate: 67
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
        avatar: '⚡',
        takeoverWins: 12,
        takeoverLosses: 3,
        takeoverSuccessRate: 80
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
        avatar: '🎯',
        takeoverWins: 5,
        takeoverLosses: 5,
        takeoverSuccessRate: 50
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
        avatar: '🏗️',
        takeoverWins: 3,
        takeoverLosses: 7,
        takeoverSuccessRate: 30
      }
    ];
    
    set({ leaderboardPlayers: mockPlayers });
  },

  viewPlayerProfile: (playerId: string) => {
    const { leaderboardPlayers } = get();
    const player = leaderboardPlayers.find(p => p.id === playerId);
    set({ selectedPlayer: player || null });
  },

  // Takeover System Methods
  getTakeoverEligibility: () => {
    const state = get();
    const eligibility = calculateTakeoverEligibility(state);
    
    // Update cached portfolio value
    set({ portfolioValue: eligibility.portfolioValue });
    
    return eligibility;
  },

  canTargetPlayerBusiness: (targetPlayerId: string, businessId: string) => {
    const state = get();
    // In a real implementation, you'd fetch the target player's data
    // For now, we'll simulate with current player's data as a demo
    const targetPlayer = state; // Placeholder - would be fetched from server/blockchain
    
    return canTargetBusiness(state, targetPlayer, businessId);
  },

  initiateTakeover: (targetPlayerId: string, businessId: string, bidAmount: number, currency: 'credits' | 'wealth') => {
    const state = get();
    
    // Validate the takeover bid
    const targetPlayer = state; // Placeholder - would be fetched from server/blockchain
    const validation = validateTakeoverBid(state, targetPlayer, businessId, bidAmount, currency);
    
    if (!validation.valid) {
      return { success: false, reason: validation.reason };
    }
    
    // Create takeover bid
    const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
    if (!business) {
      return { success: false, reason: 'Business not found' };
    }
    
    const takeoverId = `takeover_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const takeoverBid: TakeoverBid = {
      id: takeoverId,
      attackerId: state.username || 'anonymous',
      targetPlayerId,
      target: createBusinessTarget(business),
      bidAmount,
      bidCurrency: currency,
      timestamp: now,
      expiresAt: now + (24 * 60 * 60 * 1000), // 24 hours
      status: 'pending'
    };
    
    // Deduct bid amount (held in escrow)
    const updates: any = {
      takeoversInitiated: [...state.takeoversInitiated, takeoverBid]
    };
    
    if (currency === 'credits') {
      updates.creditBalance = state.creditBalance - bidAmount;
    } else {
      updates.wealth = state.wealth - bidAmount;
    }
    
    set(updates);
    
    return { success: true, takeoverId };
  },

  defendTakeover: (takeoverId: string, defenseType: 'credit_counter' | 'business_protection' | 'cancel_payment', amount?: number, businessId?: string) => {
    const state = get();
    
    // Find the takeover bid
    const takeover = state.takeoversReceived.find(t => t.id === takeoverId);
    if (!takeover) {
      return { success: false, reason: 'Takeover not found' };
    }
    
    if (takeover.status !== 'pending') {
      return { success: false, reason: 'Takeover no longer active' };
    }
    
    const now = Date.now();
    if (now > takeover.expiresAt) {
      return { success: false, reason: 'Takeover has expired' };
    }
    
    let defenseSuccessful = false;
    const updates: any = {};
    
    switch (defenseType) {
      case 'cancel_payment':
        // Pay 200% of bid to cancel the attack
        const cancelCost = takeover.bidAmount * 2;
        if (state.creditBalance < cancelCost) {
          return { success: false, reason: 'Insufficient credits to cancel attack' };
        }
        updates.creditBalance = state.creditBalance - cancelCost;
        defenseSuccessful = true;
        break;
        
      case 'business_protection':
        // Use defensive business ability
        if (!businessId) {
          return { success: false, reason: 'Business ID required for protection' };
        }
        
        const protectionResult = hasActiveProtection(state, 'fortress');
        if (!protectionResult) {
          return { success: false, reason: 'No active protection available' };
        }
        
        defenseSuccessful = true;
        break;
        
      case 'credit_counter':
        // Invest credits in defense
        if (!amount || state.creditBalance < amount) {
          return { success: false, reason: 'Insufficient credits for defense' };
        }
        updates.creditBalance = state.creditBalance - amount;
        // Defense success depends on amount invested vs attack strength
        defenseSuccessful = amount >= takeover.bidAmount * 0.75; // 75% of bid for successful defense
        break;
    }
    
    // Create defense response
    const defense: DefenseResponse = {
      defenderId: state.username || 'anonymous',
      takeoverId,
      defenseType,
      defenseAmount: amount || 0,
      businessUsed: businessId,
      timestamp: now,
      success: defenseSuccessful
    };
    
    // Update takeover status and defense history
    const updatedTakeovers = state.takeoversReceived.map(t => 
      t.id === takeoverId 
        ? { ...t, status: (defenseSuccessful ? 'defended' : 'active') as TakeoverBid['status'] }
        : t
    );
    
    updates.takeoversReceived = updatedTakeovers;
    updates.defenseHistory = [...state.defenseHistory, defense];
    
    set(updates);
    
    return { success: true };
  },

  processPendingTakeovers: () => {
    const state = get();
    const now = Date.now();
    
    // Process expired takeovers
    const updatedReceived = state.takeoversReceived.map(takeover => {
      if (takeover.status === 'pending' && now > takeover.expiresAt) {
        // Execute the takeover since defense window expired
        const mockAttacker = { ...state, username: takeover.attackerId }; // Placeholder
        const result = executeTakeover(mockAttacker, state, takeover);
        
        return { ...takeover, status: (result.success ? 'successful' : 'failed') as TakeoverBid['status'] };
      }
      return takeover;
    });
    
    const updatedInitiated = state.takeoversInitiated.map(takeover => {
      if (takeover.status === 'pending' && now > takeover.expiresAt) {
        return { ...takeover, status: 'active' as TakeoverBid['status'] };
      }
      return takeover;
    });
    
    set({
      takeoversReceived: updatedReceived,
      takeoversInitiated: updatedInitiated
    });
  },

  updatePortfolioValue: () => {
    const state = get();
    const newValue = calculatePortfolioValue(state.enhancedBusinesses, state.business);
    
    set({ 
      portfolioValue: newValue,
      lastTakeoverCheck: Date.now()
    });
  },
}));
