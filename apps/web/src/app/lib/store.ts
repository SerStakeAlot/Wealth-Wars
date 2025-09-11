import { create } from 'zustand';
import { Asset, Player, Derived, LeaderboardPlayer, EnhancedBusiness, BusinessSlot, TakeoverBid, TakeoverTarget, TakeoverEligibility, DefenseResponse, TakeoverResult, BusinessCondition, MaintenanceNotification, MaintenanceRecord, WealthAssetRatio, WARHistoryEntry, BusinessSlotSystem } from './types';
import { calculateAssetValue, calculateRisk, getPriceInSol, calculateProfitPerSecond, calculateOutletCost, calculateMultiplier, getNextMilestone, DEFAULT_CYCLE_MS, MILESTONES } from './balance';
import { prestigeFromBehavior, CLAN_MIN_LEVEL } from './prestige';
import { ENHANCED_BUSINESSES } from './businesses';
import * as SlotManagement from './slotManagement';
import { calculateActiveSynergies, calculateSynergyEffects, getSynergyProgressTowardsNext } from './synergies';
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
import { 
  processDegradation, 
  performMaintenance, 
  generateMaintenanceNotifications, 
  initializeBusinessCondition, 
  MAINTENANCE_ACTIONS,
  calculateMaintenanceCost,
  getMaintenanceRecommendations,
  getEfficiencyMultiplier
} from './maintenance';
import {
  calculateWAR,
  updatePlayerWAR,
  calculateWARRankings,
  getWARRecommendations,
  checkWARAchievements
} from './war';
import { 
  BattleState, 
  AttackResult, 
  BATTLE_CONFIG, 
  ATTACK_TYPES,
  AttackType,
  SHIELD_TYPES,
  ShieldType,
  calculateAttackSuccess, 
  calculateWealthTheft, 
  checkRaidEligibility, 
  calculateRaidYield, 
  canAttackTarget,
  isWithinAttackRange,
  calculateBusinessModifiers
} from './battle-system';
import { WealthWarsProgram, PlayerState, TreasuryState } from './solana/wealthWarsProgram';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';

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
  // Social Sharing System
  shareToX: () => void;
  skipShare: () => void;
  closeShareModal: () => void;
  // Enhanced Business System
  buyEnhancedBusiness: (businessId: string) => boolean;
  reorderEnhancedBusinesses: (newOrder: string[]) => void;
  activateBusinessAbility: (businessId: string) => boolean;
  getActiveEffects: () => Record<string, any>;
  getMaxActiveSlots: () => number;
  // New simplified active selection (replaces slot UI) - up to 3 active for synergy
  activeEnhancedBusinesses: string[];
  toggleActiveEnhancedBusiness: (businessId: string) => void;
  // Ability System (new)
  activeSustainedAbilityId: string | null; // which business is providing a sustained effect
  sustainedAbilityEnd: number; // timestamp ms when sustained ends
  abilityCharges: Record<string, number>; // per-business temporary charges (e.g. quick_service)
  consumedUpgrades: Record<string, boolean>; // one-time upgrades applied
  gambleFailStreak: number; // pity counter for risky investment
  rapidProcessingRemaining?: number; // remaining work actions at reduced cooldown
  compoundInterestSnapshot?: number; // snapshot of wealth for investment bank
  // Business Synergy System
  getActiveSynergies: () => import('./synergies').BusinessSynergy[];
  getSynergyEffects: () => Record<string, number>;
  getSynergyProgress: () => Array<{synergy: import('./synergies').BusinessSynergy; progress: string; missingRequirements: string[]}>;
  // Takeover System
  getTakeoverEligibility: () => TakeoverEligibility;
  canTargetPlayerBusiness: (targetPlayerId: string, businessId: string) => { canTarget: boolean; reason?: string; cost?: number };
  initiateTakeover: (targetPlayerId: string, businessId: string, bidAmount: number, currency: 'credits' | 'wealth') => { success: boolean; reason?: string; takeoverId?: string };
  defendTakeover: (takeoverId: string, defenseType: 'credit_counter' | 'business_protection' | 'cancel_payment', amount?: number, businessId?: string) => { success: boolean; reason?: string };
  processPendingTakeovers: () => void;
  updatePortfolioValue: () => void;
  // Business Maintenance System
  performBusinessMaintenance: (businessId: string, actionType: keyof typeof MAINTENANCE_ACTIONS) => { success: boolean; reason?: string; cost?: number };
  processDegradationCheck: () => void;
  getMaintenanceNotifications: () => MaintenanceNotification[];
  dismissMaintenanceNotification: (notificationId: string) => void;
  getMaintenanceRecommendations: () => Array<{businessId: string; businessName: string; action: any; cost: number; priority: number}>;
  setMaintenanceBudget: (amount: number) => void;
  simulateBusinessDegradation: () => void; // Demo function
  // WAR (Wealth Asset Ratio) System
  updateWAR: () => void;
  getWARRecommendations: () => Array<{type: 'warning' | 'suggestion' | 'opportunity'; title: string; description: string; action: string}>;
  getWARAchievements: () => Array<{id: string; name: string; description: string; achieved: boolean; progress?: number}>;
  // Slot Management
  assignBusinessToSlot: (businessId: string, slotId: number) => void;
  removeBusinessFromSlot: (slotId: number) => void;
  updateSlotSystem: () => void;
  getSlotCooldownTime: () => number;
  // Active ability selection
  selectedAbilityBusinessId: string | null;
  setActiveAbility: (businessId: string | null) => void;
  // Battle System
  attackPlayer: (targetId: string, attackType?: AttackType, targetData?: { wealth: number; enhancedBusinesses: string[]; battleState: BattleState; landNfts: number }) => Promise<AttackResult>;
  repairBusinessMultipliers: () => { success: boolean; cost: number; damageRepaired: number };
  activateShield: (shieldType: ShieldType) => boolean;
  payTribute: (targetId: string) => boolean;
  defendAlly: (allyId: string, attackerId: string) => boolean;
  canAttack: (targetWealth: number) => { canAttack: boolean; reason?: string };
  getBattleStats: () => { successRate: number; attacksToday: number; shieldActive: boolean };
  resetDailyBattleStats: () => void;
  // Solana integration functions
  initPlayerOnChain: () => Promise<void>;
  clickWorkOnChain: () => Promise<void>;
  buyBusinessOnChain: (bizKind: number) => Promise<void>;
  convertCreditsToWealth: (creditAmount?: number) => Promise<void>;
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
  // On-chain program state
  wealthWarsProgram: WealthWarsProgram | null;
  onChainPlayerState: PlayerState | null;
  treasuryState: TreasuryState | null;
  connection: Connection | null;
  wallet: AnchorWallet | null;
  setWalletConnection: (connection: Connection, wallet: AnchorWallet) => void;
  clearWalletConnection: () => void;
  refreshTreasuryData: () => Promise<void>;
  
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
  
  // Social Sharing System
  shareModalOpen: false,
  pendingWorkReward: null as { baseReward: number; isShared: boolean } | null,
  
  // On-chain program state
  wealthWarsProgram: null,
  onChainPlayerState: null,
  treasuryState: null,
  connection: null,
  wallet: null,
  
  business: {
    clickBonusPerDay: 1, // Legacy - keeping for compatibility
    lemStand: 0,
    cafe: 0,
    factory: 0
  },

  // Enhanced Business System
  enhancedBusinesses: [],
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
  // Business Maintenance
  businessConditions: {},
  maintenanceBudget: 1000,
  lastMaintenanceCheck: Date.now(),
  maintenanceNotifications: [],
  totalMaintenanceSpent: 0,
  // WAR (Wealth Asset Ratio) System
  war: {
    current: 0,
    peak: 0,
    trend: 'stable',
    rank: 0,
    efficiency: 'poor'
  },
  warHistory: [],

  // Business Slot Management System
  businessSlots: SlotManagement.initializeSlotSystem('novice'),
  selectedAbilityBusinessId: null,
  activeEnhancedBusinesses: [],
  activeSustainedAbilityId: null as string | null,
  sustainedAbilityEnd: 0,
  abilityCharges: {},
  consumedUpgrades: {},
  gambleFailStreak: 0,
  rapidProcessingRemaining: 0,
  compoundInterestSnapshot: 0,

  // Battle System
  battleState: {
    lastAttackTime: 0,
    lastDefenseTime: 0,
    attacksToday: 0,
    successfulAttacksToday: 0,
    defenseRating: 0,
    shieldExpiry: 0,
    consecutiveAttacksFrom: {},
    activeRaids: [],
    tributePaid: [],
    lastAttackByType: {},
    businessMultiplierDamage: 0
  },
  landNfts: 0,

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

  // Enhanced Daily Work System with Strategic $WEALTH Conversion
  clickWork: () => {
    const now = Date.now();
    set(state => {
      // Check work session state
      const workSession = state.workSession || {
        clicksInSession: 0,
        sessionStartTime: 0,
        isInExtendedCooldown: false,
        extendedCooldownStart: 0
      };
      
      // Check if we're in extended cooldown (6 hours after 4th click)
      if (workSession.isInExtendedCooldown) {
        const timeSinceExtendedCooldown = now - workSession.extendedCooldownStart;
        const extendedCooldownDuration = 6 * 60 * 60 * 1000; // 6 hours
        
        if (timeSinceExtendedCooldown < extendedCooldownDuration) {
          // Still in extended cooldown
          return state;
        } else {
          // Extended cooldown completed, reset session
          workSession.clicksInSession = 0;
          workSession.isInExtendedCooldown = false;
          workSession.extendedCooldownStart = 0;
          workSession.sessionStartTime = now;
        }
      }
      
      // Check regular work cooldown (2 hours between clicks)
      const timeSinceLastWork = now - (state.lastWorkTime || 0);
      // Base cooldown 2h, reduced to 1h if rapid processing active
      let baseCooldown = 2 * 60 * 60 * 1000; // 2 hours
      if (state.activeSustainedAbilityId) {
        const sustainedBiz = ENHANCED_BUSINESSES.find(b => b.id === state.activeSustainedAbilityId);
        if (sustainedBiz?.ability.id === 'rapid_processing' && state.rapidProcessingRemaining && state.rapidProcessingRemaining > 0) {
          baseCooldown = 60 * 60 * 1000; // 1 hour
        }
      }
      const regularCooldown = baseCooldown;
      
      if (timeSinceLastWork < regularCooldown) {
        // Return current state - work not ready
        return state;
      }
      
      // Calculate work value: Fixed 25 credits base (modified by quick_service charges if present)
      let baseWorkValue = 25;
      // Quick Service charges provide flat 40 credits per work action instead of 25
      const quickServiceCharges = Object.entries(state.abilityCharges).find(([bizId, charges]) => {
        const biz = ENHANCED_BUSINESSES.find(b => b.id === bizId);
        return biz?.ability.id === 'quick_service' && charges > 0;
      });
      if (quickServiceCharges) {
        baseWorkValue = 40;
      }
      
      // Apply business multipliers (these affect credits earned)
      let businessMultiplier = 1 + 
        (state.business.lemStand * 0.2) +     // +20% per lemonade stand
        (state.business.cafe * 0.5) +         // +50% per coffee cafe  
        (state.business.factory * 1.0);       // +100% per widget factory
      
      // Apply business multiplier damage from successful Business Sabotage attacks
      const damageMultiplier = 1 - (state.battleState.businessMultiplierDamage / 100);
      businessMultiplier *= damageMultiplier;
      
      // Enhanced business bonuses from active slots
      let enhancedBusinessMultiplier = 1;
      const activeBusinessSlots = state.businessSlots.slotManagement.activeSlots;
      
      activeBusinessSlots.forEach(slot => {
        if (slot.businessId) {
          const business = ENHANCED_BUSINESSES.find(b => b.id === slot.businessId);
          if (business) {
            // Convert work multiplier to percentage bonus
            enhancedBusinessMultiplier += business.workMultiplier / 100;
          }
        }
      });
      
      // Apply synergy multiplier to enhanced business bonus
      const synergyMultiplier = state.businessSlots.totalSynergyMultiplier;
      enhancedBusinessMultiplier *= synergyMultiplier;
      
      // Apply synergy effects
      const synergyEffects = get().getSynergyEffects();
      const synergyWorkBonus = 1 + (synergyEffects.workMultiplierBonus || 0) / 100;
      
      // Apply active effects
      const activeEffects = get().getActiveEffects();
      let effectMultiplier = 1;
      
      Object.values(activeEffects).forEach(effect => {
        const ability = effect.effect;
        if (ability.id === 'breakthrough') {
          effectMultiplier *= 3; // 3x credits for this work action (legacy if treated as timed)
        }
        // quick_service now handled via charges base value modification
      });
      
      // Calculate final work value
      const totalMultiplier = businessMultiplier * enhancedBusinessMultiplier * effectMultiplier * synergyWorkBonus;
      const workValue = Math.floor(baseWorkValue * totalMultiplier);
      
      // Update work session tracking
      const newClicksInSession = workSession.clicksInSession + 1;
      const isSessionComplete = newClicksInSession >= 4;
      
      let updatedWorkSession = {
        ...workSession,
        clicksInSession: newClicksInSession,
        sessionStartTime: workSession.sessionStartTime || now
      };
      
      // If this is the 4th click, trigger extended cooldown
      if (isSessionComplete) {
        updatedWorkSession = {
          ...updatedWorkSession,
          isInExtendedCooldown: true,
          extendedCooldownStart: now
        };
      }
      
      // Check if it's a new day for streak calculation
      const currentDay = Math.floor(now / (24 * 60 * 60 * 1000));
      const isNewDay = currentDay > (state.lastWorkDay || 0);
      const newStreakDays = isNewDay ? state.streakDays + 1 : state.streakDays;
      
      const xpGain = 5 + Math.floor(newStreakDays * 0.5); // XP scales with streak
      const newXp = state.xp + xpGain;
      const newLevel = newXp >= 100 ? state.level + 1 : state.level;
      
      // Store pending reward and show share modal
      return {
        streakDays: newStreakDays,
        lastWorkDay: currentDay,
        lastWorkTime: now,
        workSession: updatedWorkSession,
        totalWorkActions: (state.totalWorkActions || 0) + 1,
        // Consume rapid processing remaining actions
        rapidProcessingRemaining: (state.activeSustainedAbilityId && ENHANCED_BUSINESSES.find(b => b.id === state.activeSustainedAbilityId)?.ability.id === 'rapid_processing' && state.rapidProcessingRemaining && state.rapidProcessingRemaining > 0)
          ? state.rapidProcessingRemaining - 1
          : state.rapidProcessingRemaining,
        // Consume one quick service charge if present
        abilityCharges: quickServiceCharges ? {
          ...state.abilityCharges,
          [quickServiceCharges[0]]: Math.max(0, (quickServiceCharges[1] as number) - 1)
        } : state.abilityCharges,
        xp: newXp >= 100 ? 0 : newXp,
        level: newLevel,
        clanEligible: newLevel >= CLAN_MIN_LEVEL,
        shareModalOpen: true,
        pendingWorkReward: {
          baseReward: workValue,
          isShared: false,
          sessionProgress: {
            clicksInSession: newClicksInSession,
            creditsTowardNextWealth: (state.creditBalance + workValue) % 100,
            canConvertToWealth: (state.creditBalance + workValue) >= 100
          }
        }
      };
    });
  },

  // Social Sharing functions
  shareToX: () => {
    const state = get();
    if (!state.pendingWorkReward) return;

    const sharedReward = Math.floor(state.pendingWorkReward.baseReward * 1.5);
    const tweetText = encodeURIComponent(
      `Just clocked in at @WealthWars and earned ${sharedReward} credits! 💰 Building my business empire one work action at a time. #WealthWars #GameFi #Crypto`
    );
    
    // Open Twitter share dialog
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');

    set(state => ({
      creditBalance: state.creditBalance + sharedReward,
      totalCreditsEarned: (state.totalCreditsEarned || 0) + sharedReward,
      shareModalOpen: false,
      pendingWorkReward: null
    }));
  },

  skipShare: () => {
    const state = get();
    if (!state.pendingWorkReward) return;

    set(state => ({
      creditBalance: state.creditBalance + state.pendingWorkReward!.baseReward,
      totalCreditsEarned: (state.totalCreditsEarned || 0) + state.pendingWorkReward!.baseReward,
      shareModalOpen: false,
      pendingWorkReward: null
    }));
  },

  closeShareModal: () => {
    set({ shareModalOpen: false, pendingWorkReward: null });
  },

  buyBusiness: (bizKind: number) => {
    const businessTypes = ['lemStand', 'cafe', 'factory'] as const;
    const costs = [10, 50, 200]; // Credit costs for each business type
    // Note: Businesses now multiply work value instead of providing click bonuses
    // Lemonade Stand: +5 credits per work action
    // Coffee Cafe: +25 credits per work action  
    // Widget Factory: +100 credits per work action
    
    console.log('Regular store buyBusiness called:', {
      bizKind,
      businessType: businessTypes[bizKind],
      cost: costs[bizKind],
      currentCredits: get().creditBalance
    });
    
    if (bizKind < 0 || bizKind >= businessTypes.length) {
      console.log('Invalid business kind:', bizKind);
      return;
    }
    
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
    
    console.log('Store buyEnhancedBusiness called:', {
      businessId,
      business: business?.name,
      currentWealth: state.wealth,
      businessCost: business?.cost,
      alreadyOwned: state.enhancedBusinesses.includes(businessId),
      enhancedBusinesses: state.enhancedBusinesses
    });
    
    if (!business) {
      console.log('Business not found in ENHANCED_BUSINESSES');
      return false;
    }
    if (state.wealth < business.cost) {
      console.log('Insufficient wealth:', { required: business.cost, available: state.wealth });
      return false;
    }
    if (state.enhancedBusinesses.includes(businessId)) {
      console.log('Business already owned');
      return false;
    }
    
    // Check prerequisites
    if (business.prerequisites) {
      const meetsPrereqs = business.prerequisites.every(req => {
        if (req === '100_work_actions') return state.totalWorkActions >= 100;
        if (req === 'week_streak') return state.streakDays >= 7;
        return true;
      });
      if (!meetsPrereqs) return false;
    }
    
    set(state => {
      const isFirstEnhanced = state.enhancedBusinesses.length === 0;
      const slots = state.businessSlots.slotManagement.activeSlots;
      const emptySlotIndex = slots.findIndex(slot => slot.businessId === null);
      const canAutoAssign = isFirstEnhanced && emptySlotIndex !== -1 && emptySlotIndex < state.businessSlots.slotManagement.maxSlots;

      let updatedBusinessSlots = state.businessSlots;
      if (canAutoAssign) {
        const updatedSlots = slots.map((slot, index) => 
          index === emptySlotIndex 
            ? { ...slot, businessId, activatedAt: Date.now() }
            : slot
        );
        updatedBusinessSlots = {
          ...state.businessSlots,
          slotManagement: {
            ...state.businessSlots.slotManagement,
            activeSlots: updatedSlots
          }
        };
      }

      return {
        wealth: state.wealth - business.cost,
        enhancedBusinesses: [...state.enhancedBusinesses, businessId],
        businessConditions: {
          ...state.businessConditions,
          [businessId]: initializeBusinessCondition(business)
        },
        portfolioValue: calculatePortfolioValue([...state.enhancedBusinesses, businessId], state.business),
        businessSlots: updatedBusinessSlots
      };
    });
    
    // Update synergy bonuses after purchase
    get().updateSlotSystem();
    
    return true;
  },

  reorderEnhancedBusinesses: (newOrder: string[]) => {
    set(state => {
      // Validate that newOrder contains the same businesses as current
      const currentBusinesses = [...state.enhancedBusinesses].sort();
      const newOrderSorted = [...newOrder].sort();
      
      if (currentBusinesses.length !== newOrderSorted.length ||
          !currentBusinesses.every(id => newOrderSorted.includes(id))) {
        return state; // Invalid reorder, return unchanged state
      }
      
      return {
        enhancedBusinesses: newOrder
      };
    });
  },

  activateBusinessAbility: (businessId: string) => {
    const state = get();
    const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
    
    if (!business || !state.enhancedBusinesses.includes(businessId)) return false;
    if (business.ability.type === 'passive') return false; // Passive abilities don't need activation
    
    const now = Date.now();
    const ability = business.ability;
    const lastUsed = state.businessCooldowns[businessId] || 0;

    // Upgrade one-time
    if (ability.effectMode === 'upgrade') {
      if (state.consumedUpgrades[businessId]) return false;
      // Apply upgrade (+5 credits per work) -> we model as an active effect modifier
      set({
        consumedUpgrades: { ...state.consumedUpgrades, [businessId]: true }
      });
      return true;
    }

    // Cooldown check (if defined)
    if (ability.cooldown && now - lastUsed < ability.cooldown) return false;

    // Sustained exclusivity
    if (ability.effectMode === 'sustained') {
      if (state.activeSustainedAbilityId && state.activeSustainedAbilityId !== businessId) {
        // Cannot stack another sustained
        return false;
      }
    }

    // Cost check
    if (ability.cost && state.wealth < ability.cost) return false;

    // Instant logic (e.g., gamble, intel, quick service charges)
    if (ability.effectMode === 'instant') {
      if (ability.id === 'risky_investment') {
        // Venture gamble with pity mechanics
        const win = Math.random() < 0.6 || state.gambleFailStreak >= 3;
        set(s => ({
          creditBalance: win ? s.creditBalance + 50 : s.creditBalance - 25,
          gambleFailStreak: win ? 0 : s.gambleFailStreak + 1,
          businessCooldowns: { ...s.businessCooldowns, [businessId]: now },
          wealth: ability.cost ? s.wealth - ability.cost : s.wealth
        }));
        return true;
      }
      if (ability.id === 'quick_service') {
        // Grant charges tracked in abilityCharges
        const existing = state.abilityCharges[businessId] || 0;
        const grant = ability.uses || 4;
        set(s => ({
          abilityCharges: { ...s.abilityCharges, [businessId]: existing + grant },
          businessCooldowns: { ...s.businessCooldowns, [businessId]: now },
          wealth: ability.cost ? s.wealth - ability.cost : s.wealth
        }));
        return true;
      }
      // Generic instant (espionage, intel)
      set(s => ({
        businessCooldowns: { ...s.businessCooldowns, [businessId]: now },
        wealth: ability.cost ? s.wealth - ability.cost : s.wealth
      }));
      return true;
    }

    // Sustained activation
    if (ability.effectMode === 'sustained') {
      const end = ability.duration ? now + ability.duration : now + 60 * 60 * 1000; // fallback 1h
      set(s => {
        const updates: any = {
          activeSustainedAbilityId: businessId,
          sustainedAbilityEnd: end,
          businessCooldowns: { ...s.businessCooldowns, [businessId]: now },
          wealth: ability.cost ? s.wealth - ability.cost : s.wealth
        };
        if (ability.id === 'rapid_processing') {
          // 6 reduced-cooldown work actions
            updates.rapidProcessingRemaining = 6;
        }
        if (ability.id === 'compound_interest') {
          updates.compoundInterestSnapshot = s.wealth; // snapshot current wealth
        }
        return updates;
      });
      return true;
    }

    return false;
  },

  getActiveEffects: () => {
    const state = get();
    const now = Date.now();
    const activeEffects: Record<string, any> = {};

    // Add sustained ability pseudo-effect if active
    if (state.activeSustainedAbilityId && now < state.sustainedAbilityEnd) {
      const biz = ENHANCED_BUSINESSES.find(b => b.id === state.activeSustainedAbilityId);
      if (biz) {
        activeEffects[biz.ability.id] = {
          endTime: state.sustainedAbilityEnd,
          effect: biz.ability
        };
      } else {
        // Clean if business missing
        set({ activeSustainedAbilityId: null, sustainedAbilityEnd: 0 });
      }
    } else if (state.activeSustainedAbilityId && now >= state.sustainedAbilityEnd) {
      // Sustained expired: handle end-of-effect resolutions
      const expiredBiz = ENHANCED_BUSINESSES.find(b => b.id === state.activeSustainedAbilityId);
      if (expiredBiz) {
        if (expiredBiz.ability.id === 'compound_interest') {
          // Pay out 5% of snapshot wealth captured at activation
          const snapshot = state.compoundInterestSnapshot || 0;
          const payout = Math.floor(snapshot * 0.05);
          if (payout > 0) {
            set(s => ({ wealth: s.wealth + payout }));
          }
        }
      }
      set({ activeSustainedAbilityId: null, sustainedAbilityEnd: 0, compoundInterestSnapshot: 0 });
    }
    
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

  // Business Synergy System
  getActiveSynergies: () => {
    const state = get();
  return calculateActiveSynergies(state.activeEnhancedBusinesses);
  },

  getSynergyEffects: () => {
    const state = get();
  const activeSynergies = calculateActiveSynergies(state.activeEnhancedBusinesses);
    return calculateSynergyEffects(activeSynergies);
  },

  getSynergyProgress: () => {
    const state = get();
  return getSynergyProgressTowardsNext(state.activeEnhancedBusinesses);
  },

  initPlayer: () => {
    // Initialize or reset player to demo state
    set(state => ({
      ...state,
      creditBalance: 2000, // Starting credits (increased for maintenance testing)
      streakDays: 0,
      lastClickDay: 0, // Legacy
      lastWorkDay: 0,
      lastWorkTime: 0,
      workCooldown: 24 * 60 * 60 * 1000, // 24 hours
      workFrequency: 'novice',
      totalWorkActions: 0,
      totalCreditsEarned: 0,
      // Social Sharing System reset
      shareModalOpen: false,
      pendingWorkReward: null,
      business: {
        clickBonusPerDay: 1, // Legacy
        lemStand: 0,
        cafe: 0,
        factory: 0
      },
      // Enhanced Business System initialization
      enhancedBusinesses: ['trading_exchange', 'investment_bank', 'automation_factory'], // Demo businesses for testing
      businessCooldowns: {},
      activeEffects: {},
      // Business Maintenance initialization - with demo conditions
      businessConditions: {
        'trading_exchange': {
          businessId: 'trading_exchange',
          condition: 75, // Good condition
          lastMaintained: Date.now() - (7 * 24 * 60 * 60 * 1000), // Last maintained 7 days ago
          degradationRate: 2.0,
          maintenanceCost: 75,
          efficiencyMultiplier: 0.95,
          warningLevel: 'good',
          maintenanceHistory: [],
          isOffline: false,
          upgradeBonus: 0
        },
        'investment_bank': {
          businessId: 'investment_bank',
          condition: 45, // Fair condition - needs attention
          lastMaintained: Date.now() - (14 * 24 * 60 * 60 * 1000), // Last maintained 14 days ago
          degradationRate: 1.5,
          maintenanceCost: 100,
          efficiencyMultiplier: 0.85,
          warningLevel: 'caution',
          maintenanceHistory: [],
          isOffline: false,
          upgradeBonus: 0
        },
        'automation_factory': {
          businessId: 'automation_factory',
          condition: 15, // Critical condition!
          lastMaintained: Date.now() - (30 * 24 * 60 * 60 * 1000), // Last maintained 30 days ago
          degradationRate: 2.5,
          maintenanceCost: 125,
          efficiencyMultiplier: 0.50,
          warningLevel: 'critical',
          maintenanceHistory: [],
          isOffline: false,
          upgradeBonus: 0
        }
      },
      maintenanceBudget: 1000,
      lastMaintenanceCheck: Date.now(),
      maintenanceNotifications: [],
      totalMaintenanceSpent: 0,
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
      // Initialize business slots for novice level
      businessSlots: SlotManagement.initializeSlotSystem('novice'),
    }));
  },

  // Solana blockchain functions
  setOnChainMode: (enabled: boolean) => {
    set({ isOnChainMode: enabled });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setWalletConnection: (connection: Connection, wallet: AnchorWallet) => {
    const program = new WealthWarsProgram(connection, wallet);
    set({ 
      connection, 
      wallet, 
      wealthWarsProgram: program 
    });
  },

  clearWalletConnection: () => {
    set({ 
      connection: null, 
      wallet: null, 
      wealthWarsProgram: null,
      onChainPlayerState: null 
    });
  },

  initPlayerOnChain: async () => {
    const { wealthWarsProgram } = get();
    if (!wealthWarsProgram) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      set({ loading: true });
      const result = await wealthWarsProgram.initializePlayer();
      
      if (result.success) {
        // Fetch updated player state
        await get().refreshPlayerData();
        toast.success('Player initialized on-chain!');
      } else {
        toast.error(result.error || 'Failed to initialize player');
      }
    } catch (error) {
      console.error('Failed to initialize player:', error);
      toast.error('Transaction failed');
    } finally {
      set({ loading: false });
    }
  },

  clickWorkOnChain: async () => {
    const { wealthWarsProgram, isOnChainMode } = get();
    
    if (!isOnChainMode) {
      // Fall back to client-side work
      return get().clickWork();
    }
    
    if (!wealthWarsProgram) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      set({ loading: true });
      const result = await wealthWarsProgram.doWork();
      
      if (result.success) {
        // Show share modal with actual reward
        set({ 
          shareModalOpen: true,
          pendingWorkReward: { 
            baseReward: result.reward || 100, 
            isShared: false 
          }
        });
        
        // Refresh on-chain state
        await get().refreshPlayerData();
        
        toast.success(`Work completed! Earned ${result.reward} credits`);
      } else {
        if (result.cooldownRemaining) {
          const hours = Math.floor(result.cooldownRemaining / 3600);
          const minutes = Math.floor((result.cooldownRemaining % 3600) / 60);
          toast.error(`Cooldown active: ${hours}h ${minutes}m remaining`);
        } else {
          toast.error(result.error || 'Work failed');
        }
      }
    } catch (error) {
      console.error('Work transaction failed:', error);
      toast.error('Transaction failed');
    } finally {
      set({ loading: false });
    }
  },

  buyBusinessOnChain: async (bizKind: number) => {
    const { wealthWarsProgram, isOnChainMode } = get();
    
    if (!isOnChainMode) {
      // Fall back to client-side purchase
      return get().buyBusiness(bizKind);
    }
    
    if (!wealthWarsProgram) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      set({ loading: true });
      const result = await wealthWarsProgram.purchaseBusiness(bizKind);
      
      if (result.success) {
        // Refresh on-chain state
        await get().refreshPlayerData();
        toast.success(`Business purchased for ${result.cost} credits!`);
      } else {
        toast.error(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Business purchase failed:', error);
      toast.error('Transaction failed');
    } finally {
      set({ loading: false });
    }
  },

  // Strategic Credit to $WEALTH Conversion via Treasury
  convertCreditsToWealth: async (creditAmount?: number) => {
    const { swapCreditForWealth, isOnChainMode, creditBalance } = get();
    const amountToConvert = creditAmount || 100; // Default to 100 credits
    
    if (creditBalance < amountToConvert) {
      toast.error(`Need ${amountToConvert} credits to convert`);
      return;
    }
    
    if (!isOnChainMode) {
      // Fallback to simple conversion in off-chain mode
      set(state => {
        const wealthToAdd = Math.floor(amountToConvert / 100); // 100 credits = 1 $WEALTH
        const creditsUsed = wealthToAdd * 100; // Exact amount used
        
        return {
          creditBalance: state.creditBalance - creditsUsed,
          wealth: state.wealth + wealthToAdd
        };
      });
      toast.success(`Converted ${amountToConvert} credits → ${Math.floor(amountToConvert / 100)} $WEALTH`);
      return;
    }
    
    // Use treasury swap in on-chain mode
    await swapCreditForWealth(amountToConvert.toString());
  },

  swapCreditForWealth: async (amount: string) => {
    const { wealthWarsProgram, isOnChainMode } = get();
    
    if (!isOnChainMode) {
      toast('Treasury requires on-chain mode');
      return;
    }
    
    if (!wealthWarsProgram) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      set({ loading: true });
      const amountNum = parseFloat(amount);
      const minOut = amountNum * 0.035; // Rough estimate minus slippage
      
      const result = await wealthWarsProgram.swapCreditsForWealth(amountNum, minOut);
      
      if (result.success) {
        await get().refreshPlayerData();
        await get().refreshTreasuryData();
        toast.success(`Swapped ${amountNum} credits for ${result.amountOut} WEALTH!`);
      } else {
        toast.error(result.error || 'Swap failed');
      }
    } catch (error) {
      console.error('Swap failed:', error);
      toast.error('Transaction failed');
    } finally {
      set({ loading: false });
    }
  },

  swapWealthForCredit: async (amount: string) => {
    const { wealthWarsProgram, isOnChainMode } = get();
    
    if (!isOnChainMode) {
      toast('Treasury requires on-chain mode');
      return;
    }
    
    if (!wealthWarsProgram) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      set({ loading: true });
      const amountNum = parseFloat(amount);
      const minOut = amountNum * 25; // Rough estimate minus slippage
      
      const result = await wealthWarsProgram.swapWealthForCredits(amountNum, minOut);
      
      if (result.success) {
        await get().refreshPlayerData();
        await get().refreshTreasuryData();
        toast.success(`Swapped ${amountNum} WEALTH for ${result.amountOut} credits!`);
      } else {
        toast.error(result.error || 'Swap failed');
      }
    } catch (error) {
      console.error('Swap failed:', error);
      toast.error('Transaction failed');
    } finally {
      set({ loading: false });
    }
  },

  refreshTreasuryData: async () => {
    const { wealthWarsProgram } = get();
    if (!wealthWarsProgram) return;

    try {
      const treasuryState = await wealthWarsProgram.getTreasuryState();
      set({ treasuryState });
    } catch (error) {
      console.error('Failed to refresh treasury data:', error);
    }
  },

  refreshPlayerData: async () => {
    const { wealthWarsProgram } = get();
    if (!wealthWarsProgram) return;

    try {
      const playerState = await wealthWarsProgram.getPlayerState();
      
      if (playerState) {
        // Map on-chain level to client frequency
        const frequencyMap = ['novice', 'apprentice', 'skilled', 'expert', 'master'] as const;
        const workFrequency = frequencyMap[playerState.workFrequencyLevel] || 'novice';
        
        // Update local state with on-chain data
        set({
          onChainPlayerState: playerState,
          creditBalance: playerState.credits.toNumber(),
          streakDays: playerState.streakCount,
          workFrequency,
          totalWorkActions: playerState.totalWorkActions.toNumber(),
        });
      }
    } catch (error) {
      console.error('Failed to refresh player data:', error);
    }
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
        takeoverSuccessRate: 80,
        // Business Maintenance
        businessConditions: {},
        maintenanceBudget: 2000,
        lastMaintenanceCheck: Date.now(),
        maintenanceNotifications: [],
        totalMaintenanceSpent: 1200,
        // WAR System
        war: {
          current: 0.825,
          peak: 0.892,
          trend: 'stable',
          rank: 1,
          efficiency: 'legendary'
        },
        warHistory: []
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
        takeoverSuccessRate: 67,
        // Business Maintenance
        businessConditions: {},
        maintenanceBudget: 1500,
        lastMaintenanceCheck: Date.now(),
        maintenanceNotifications: [],
        totalMaintenanceSpent: 800,
        // WAR System
        war: {
          current: 0.642,
          peak: 0.701,
          trend: 'rising',
          rank: 2,
          efficiency: 'excellent'
        },
        warHistory: []
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
        takeoverSuccessRate: 80,
        // Business Maintenance
        businessConditions: {},
        maintenanceBudget: 800,
        lastMaintenanceCheck: Date.now(),
        maintenanceNotifications: [],
        totalMaintenanceSpent: 400,
        // WAR System
        war: {
          current: 0.551,
          peak: 0.624,
          trend: 'stable',
          rank: 3,
          efficiency: 'excellent'
        },
        warHistory: []
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
        takeoverSuccessRate: 50,
        // Business Maintenance
        businessConditions: {},
        maintenanceBudget: 800,
        lastMaintenanceCheck: Date.now(),
        maintenanceNotifications: [],
        totalMaintenanceSpent: 400,
        // WAR System
        war: {
          current: 0.347,
          peak: 0.412,
          trend: 'falling',
          rank: 4,
          efficiency: 'good'
        },
        warHistory: []
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
        takeoverSuccessRate: 30,
        // Business Maintenance
        businessConditions: {},
        maintenanceBudget: 500,
        lastMaintenanceCheck: Date.now(),
        maintenanceNotifications: [],
        totalMaintenanceSpent: 200,
        // WAR System
        war: {
          current: 0.196,
          peak: 0.234,
          trend: 'stable',
          rank: 5,
          efficiency: 'poor'
        },
        warHistory: []
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

  // Business Maintenance System
  performBusinessMaintenance: (businessId: string, actionType: keyof typeof MAINTENANCE_ACTIONS) => {
    const state = get();
    const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
    const condition = state.businessConditions[businessId];
    
    if (!business || !condition) {
      return { success: false, reason: 'Business or condition not found' };
    }
    
    const cost = calculateMaintenanceCost(business, actionType, state.enhancedBusinesses);
    
    if (state.creditBalance < cost) {
      return { success: false, reason: 'Insufficient credits for maintenance', cost };
    }
    
    const { updatedCondition, record } = performMaintenance(condition, business, actionType, state.enhancedBusinesses);
    
    set({
      businessConditions: {
        ...state.businessConditions,
        [businessId]: updatedCondition
      },
      creditBalance: state.creditBalance - cost,
      totalMaintenanceSpent: state.totalMaintenanceSpent + cost,
      maintenanceNotifications: state.maintenanceNotifications.filter(n => 
        !(n.businessId === businessId && (n.type === 'warning' || n.type === 'critical'))
      )
    });
    
    return { success: true, cost };
  },

  processDegradationCheck: () => {
    const state = get();
    const updatedConditions = processDegradation(state.businessConditions, state.lastMaintenanceCheck);
    const newNotifications = generateMaintenanceNotifications(updatedConditions, 
      ENHANCED_BUSINESSES.reduce((acc, b) => ({ ...acc, [b.id]: b }), {})
    );
    
    set({
      businessConditions: updatedConditions,
      lastMaintenanceCheck: Date.now(),
      maintenanceNotifications: [
        ...state.maintenanceNotifications.filter(n => !n.dismissed),
        ...newNotifications
      ]
    });
  },

  getMaintenanceNotifications: () => {
    const state = get();
    return state.maintenanceNotifications.filter(n => !n.dismissed);
  },

  dismissMaintenanceNotification: (notificationId: string) => {
    const state = get();
    set({
      maintenanceNotifications: state.maintenanceNotifications.map(n =>
        n.id === notificationId ? { ...n, dismissed: true } : n
      )
    });
  },

  getMaintenanceRecommendations: () => {
    const state = get();
    return getMaintenanceRecommendations(
      state.businessConditions,
      ENHANCED_BUSINESSES.reduce((acc, b) => ({ ...acc, [b.id]: b }), {}),
      state.creditBalance
    );
  },

  setMaintenanceBudget: (amount: number) => {
    set({ maintenanceBudget: amount });
  },

  // Demo function to simulate degradation for testing
  simulateBusinessDegradation: () => {
    const state = get();
    const businessesToDegrade = state.enhancedBusinesses.slice(0, 3); // Degrade first 3 businesses
    
    const updatedConditions = { ...state.businessConditions };
    
    businessesToDegrade.forEach(businessId => {
      if (updatedConditions[businessId]) {
        updatedConditions[businessId] = {
          ...updatedConditions[businessId],
          condition: Math.max(0, updatedConditions[businessId].condition - Math.random() * 50 + 10), // Random degradation
          efficiencyMultiplier: getEfficiencyMultiplier(updatedConditions[businessId].condition)
        };
      }
    });
    
    set({ businessConditions: updatedConditions });
  },

  // WAR (Wealth Asset Ratio) System Functions
  updateWAR: () => {
    const state = get();
    const { war, warHistory } = updatePlayerWAR(state, state.wealth, state.portfolioValue, 'manual_update');
    
    set({ war, warHistory });
  },

  getWARRecommendations: () => {
    const state = get();
    return getWARRecommendations(state);
  },

  getWARAchievements: () => {
    const state = get();
    return checkWARAchievements(state);
  },

  // Slot Management Functions
  assignBusinessToSlot: (businessId: string, slotId: number) => {
    const state = get();
    const currentPlayer = {
      ...state,
      enhancedBusinesses: state.enhancedBusinesses || [],
      businessSlots: state.businessSlots
    } as Player;

    const result = SlotManagement.assignBusinessToSlot(currentPlayer, businessId, slotId);
    
    if (result.success && result.updatedSlots) {
      const now = Date.now();
      
      set(state => ({
        businessSlots: {
          ...state.businessSlots,
          slotManagement: {
            ...state.businessSlots.slotManagement,
            activeSlots: result.updatedSlots!,
            lastSlotChange: now,
            slotCooldownUntil: now + SlotManagement.SLOT_COOLDOWN_DURATION,
            canEditSlots: false
          }
        }
      }));

      // Update synergy bonuses
      get().updateSlotSystem();
    }
    
    console.log(result.message);
  },

  removeBusinessFromSlot: (slotId: number) => {
    const state = get();
    const currentPlayer = {
      ...state,
      enhancedBusinesses: state.enhancedBusinesses || [],
      businessSlots: state.businessSlots
    } as Player;

    const result = SlotManagement.removeBusinessFromSlot(currentPlayer, slotId);
    
    if (result.success && result.updatedSlots) {
      const now = Date.now();
      
      set(state => ({
        businessSlots: {
          ...state.businessSlots,
          slotManagement: {
            ...state.businessSlots.slotManagement,
            activeSlots: result.updatedSlots!,
            lastSlotChange: now,
            slotCooldownUntil: now + SlotManagement.SLOT_COOLDOWN_DURATION,
            canEditSlots: false
          }
        }
      }));

      // Update synergy bonuses
      get().updateSlotSystem();

      // Clear active ability if its business was removed
      const removedBiz = state.businessSlots.slotManagement.activeSlots.find(s => s.slotId === slotId)?.businessId;
      if (removedBiz && get().selectedAbilityBusinessId === removedBiz) {
        set({ selectedAbilityBusinessId: null });
      }
    }
    
    console.log(result.message);
  },

  updateSlotSystem: () => {
    const state = get();
    const currentPlayer = {
      ...state,
      enhancedBusinesses: state.enhancedBusinesses || [],
      businessSlots: state.businessSlots,
      workFrequency: state.workFrequency
    } as Player;

    const updatedSlotSystem = SlotManagement.updateSlotSystem(currentPlayer);
    
    set(state => ({
      businessSlots: updatedSlotSystem
    }));
  },

  setActiveAbility: (businessId: string | null) => {
    const state = get();
    if (businessId === null) {
      set({ selectedAbilityBusinessId: null });
      return;
    }
    // Must be currently slotted
    const slotted = state.businessSlots.slotManagement.activeSlots.some(s => s.businessId === businessId);
    if (!slotted) return; // ignore invalid
    set({ selectedAbilityBusinessId: businessId });
  },

  // Toggle active enhanced businesses (max 3) for synergy purposes
  toggleActiveEnhancedBusiness: (businessId: string) => {
    const state = get();
    if (!state.enhancedBusinesses.includes(businessId)) return; // must own
    const currentlyActive = state.activeEnhancedBusinesses;
    const isActive = currentlyActive.includes(businessId);
    if (isActive) {
      set({ activeEnhancedBusinesses: currentlyActive.filter(id => id !== businessId) });
    } else {
      if (currentlyActive.length >= 3) {
        // Optional: toast feedback if available
        try { toast.error('Maximum of 3 active businesses for synergy'); } catch {}
        return;
      }
      set({ activeEnhancedBusinesses: [...currentlyActive, businessId] });
    }
  },

  getSlotCooldownTime: () => {
    const state = get();
    const now = Date.now();
    const cooldownEnd = state.businessSlots.slotManagement.slotCooldownUntil;
    
    return Math.max(0, cooldownEnd - now);
  },

  // Battle System Functions
  attackPlayer: async (targetId: string, attackType: AttackType = 'STANDARD', targetData?: { wealth: number; enhancedBusinesses: string[]; battleState: BattleState; landNfts: number }): Promise<AttackResult> => {
    const state = get();
  const TARGET_MIN_WEALTH = 50; // minimum wealth to be a valid target (prevents griefing of new players)
    
    // Mock target data if not provided (for testing)
    const target = targetData || {
      wealth: 150 + Math.random() * 200,
      enhancedBusinesses: [],
      battleState: {
        lastAttackTime: 0,
        lastDefenseTime: 0,
        attacksToday: 0,
        successfulAttacksToday: 0,
        defenseRating: 0,
        shieldExpiry: 0,
        consecutiveAttacksFrom: {},
        activeRaids: [],
        tributePaid: [],
        lastAttackByType: {
          STANDARD: 0,
          WEALTH_ASSAULT: 0,
          LAND_SIEGE: 0,
          BUSINESS_SABOTAGE: 0
        },
        businessMultiplierDamage: 0
      },
      landNfts: Math.random() > 0.8 ? 1 : 0
    };

    // Quick target eligibility checks (minimum wealth to be targetable)
    if (target.wealth < TARGET_MIN_WEALTH) {
      return {
        success: false,
        wealthStolen: 0,
        wealthLost: 0,
        counterAttack: false,
        raidTriggered: false,
        message: `Target must have at least ${TARGET_MIN_WEALTH} $WEALTH to be attackable.`,
        finalSuccessRate: 0,
        attackType
      };
    }

    // Check attacker eligibility and resources
    const attackConfig = ATTACK_TYPES[attackType];

    // For high-tier wealth attacks require attacker to hold a fraction of target wealth
    if ((attackType === 'WEALTH_ASSAULT' || attackType === 'LAND_SIEGE')) {
      const requiredShare = 0.25; // attacker must have >= 25% of target wealth
      if (state.wealth < target.wealth * requiredShare) {
        return {
          success: false,
          wealthStolen: 0,
          wealthLost: 0,
          counterAttack: false,
          raidTriggered: false,
          message: `Need at least ${Math.ceil(requiredShare * 100)}% of target's wealth to perform ${attackConfig.name}`,
          finalSuccessRate: 0,
          attackType
        };
      }
    }

    // Check if attack is allowed by generic checks
    const attackCheck = canAttackTarget(
      { 
        wealth: state.wealth, 
        battleState: state.battleState, 
        creditBalance: state.creditBalance 
      },
      { 
        wealth: target.wealth, 
        battleState: target.battleState 
      }
    );

    if (!attackCheck.canAttack) {
      return {
        success: false,
        wealthStolen: 0,
        wealthLost: 0,
        counterAttack: false,
        raidTriggered: false,
        message: attackCheck.reason || 'Attack not allowed',
        finalSuccessRate: 0,
        attackType
      };
    }

    // Get synergy effects for both players
    const attackerSynergyEffects = get().getSynergyEffects();
    const defenderSynergyEffects = targetData?.enhancedBusinesses ? 
      calculateSynergyEffects(calculateActiveSynergies(targetData.enhancedBusinesses)) : 
      { attackSuccessBonus: 0, defenseBonus: 0, wealthTheftBonus: 0 };

    // Calculate diminishing returns / slippage based on consecutive successful attacks
    const consecutiveCount = state.battleState.consecutiveAttacksFrom[targetId]?.count || 0;
    const slippageMultiplier = Math.max(0.5, 1 - 0.1 * consecutiveCount); // reduce loot by 10% per consecutive success, min 50%

    // Calculate attack cost with retry fee (10% per consecutive success)
    const retryFeeMultiplier = 1 + 0.10 * consecutiveCount;
    const costToDeduct = Math.ceil((attackConfig.cost || 0) * retryFeeMultiplier);

    // Ensure attacker has resources for the cost
    if (attackConfig.currency === 'wealth' && state.wealth < costToDeduct) {
      return { success: false, wealthStolen: 0, wealthLost: 0, counterAttack: false, raidTriggered: false, message: `Need ${costToDeduct} $WEALTH for ${attackConfig.name}`, finalSuccessRate: 0, attackType };
    }
    if (attackConfig.currency === 'credits' && state.creditBalance < costToDeduct) {
      return { success: false, wealthStolen: 0, wealthLost: 0, counterAttack: false, raidTriggered: false, message: `Need ${costToDeduct} credits for ${attackConfig.name}`, finalSuccessRate: 0, attackType };
    }

    // Deduct cost immediately (attacker pays to initiate)
    let newWealth = state.wealth;
    let newCreditBalance = state.creditBalance;
    if (attackConfig.currency === 'wealth') newWealth -= costToDeduct;
    else newCreditBalance -= costToDeduct;

    // Calculate attack success
    const { successRate } = calculateAttackSuccess(
      state.wealth,
      target.wealth,
      state.enhancedBusinesses,
      target.enhancedBusinesses,
      attackType,
      attackerSynergyEffects,
      defenderSynergyEffects
    );

    const attackSuccess = Math.random() < successRate;
    
    // Handle Business Sabotage attack type
    let businessDamageDealt = 0;
    if (attackType === 'BUSINESS_SABOTAGE' && attackSuccess) {
      const attackConfig = ATTACK_TYPES[attackType];
      let damageAmount: number = attackConfig.multiplierDamagePercent || 30;
      
      // Check for defensive business protection
      if (target.enhancedBusinesses.includes('security_firm')) {
        // Security Firm provides complete immunity
        damageAmount = 0;
      } else if (target.enhancedBusinesses.includes('insurance_company')) {
        // Insurance Company reduces damage by 50%
        damageAmount = Math.floor(damageAmount * 0.5);
      }
      
      businessDamageDealt = damageAmount;
      
      // Note: We'll apply this damage to the target's business multipliers
      // For now, we track it in the result message
    }
    
  let { stolen, lost } = calculateWealthTheft(target.wealth, attackSuccess, attackType, attackerSynergyEffects);
  // Apply slippage to stolen amount
  if (stolen > 0) stolen = Math.floor(stolen * slippageMultiplier);

    // Check for counter-attack
    const counterAttack = !attackSuccess && Math.random() < BATTLE_CONFIG.COUNTER_ATTACK_CHANCE;
  const finalLoss = counterAttack ? lost * 2 : lost;

  // Update consecutive attacks for raid system
    const consecutiveAttacks = { ...state.battleState.consecutiveAttacksFrom };
    if (attackSuccess) {
      if (!consecutiveAttacks[targetId]) {
        consecutiveAttacks[targetId] = { count: 1, lastAttack: Date.now() };
      } else {
        const timeSinceLastAttack = Date.now() - consecutiveAttacks[targetId].lastAttack;
        if (timeSinceLastAttack < BATTLE_CONFIG.RAID_TIME_WINDOW) {
          consecutiveAttacks[targetId].count += 1;
          consecutiveAttacks[targetId].lastAttack = Date.now();
        } else {
          consecutiveAttacks[targetId] = { count: 1, lastAttack: Date.now() };
        }
      }
    } else {
      // Reset consecutive attacks on failure
      delete consecutiveAttacks[targetId];
    }

    // Check for Land raid eligibility
    const raidTriggered = checkRaidEligibility(state.username || 'player', target.battleState, target.landNfts > 0) && 
                         consecutiveAttacks[targetId]?.count >= BATTLE_CONFIG.RAID_ATTACKS_REQUIRED;

    let raidYield = 0;
    if (raidTriggered) {
      raidYield = calculateRaidYield();
      // Add raid to active raids (simplified)
      toast.success(`🏴‍☠️ Land Raid Triggered! You'll receive ${Math.floor(raidYield / 7)} $WEALTH daily for 7 days!`);
    }

    // Apply results to new balances (we already deducted initiation cost)
    if (attackSuccess) {
      newWealth += stolen;
    } else {
      // On failure, apply additional loss to wealth if applicable
      newWealth -= finalLoss;
    }

    set(state => ({
      wealth: newWealth,
      creditBalance: newCreditBalance,
      battleState: {
        ...state.battleState,
        lastAttackTime: Date.now(),
        attacksToday: state.battleState.attacksToday + 1,
        successfulAttacksToday: attackSuccess ? state.battleState.successfulAttacksToday + 1 : state.battleState.successfulAttacksToday,
        consecutiveAttacksFrom: consecutiveAttacks
      }
    }));

    const result: AttackResult = {
      success: attackSuccess,
      wealthStolen: stolen,
      wealthLost: finalLoss,
      counterAttack,
      raidTriggered,
      finalSuccessRate: successRate,
      attackType,
      businessDamageDealt,
      message: attackSuccess 
        ? attackType === 'BUSINESS_SABOTAGE' && businessDamageDealt > 0
          ? `✅ Business Sabotage successful! Reduced target's work multipliers by ${businessDamageDealt}%`
          : attackType === 'BUSINESS_SABOTAGE' && businessDamageDealt === 0
          ? `✅ Business Sabotage blocked by Security Firm!`
          : `✅ Attack successful! Stolen ${stolen} $WEALTH${raidTriggered ? ' + Land Raid triggered!' : ''}`
        : counterAttack 
          ? `❌ Attack failed and counter-attacked! Lost ${finalLoss} ${attackType === 'BUSINESS_SABOTAGE' ? 'credits' : '$WEALTH'}`
          : `❌ Attack failed! Lost ${finalLoss} ${attackType === 'BUSINESS_SABOTAGE' ? 'credits' : '$WEALTH'}`
    };

    // Show toast notification
    if (attackSuccess) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }

    return result;
  },

  activateShield: (shieldType: ShieldType): boolean => {
    const state = get();
    const shield = SHIELD_TYPES[shieldType];
    
    if (state.wealth < shield.cost) {
      toast.error(`Need ${shield.cost} $WEALTH to activate ${shield.name}`);
      return false;
    }

    if (state.battleState.shieldExpiry > Date.now()) {
      toast.error('Shield is already active');
      return false;
    }

    set(state => ({
      wealth: state.wealth - shield.cost,
      battleState: {
        ...state.battleState,
        shieldExpiry: Date.now() + shield.duration
      }
    }));

    const hours = shield.duration / (1000 * 60 * 60);
    toast.success(`🛡️ ${shield.name} activated for ${hours} hours!`);
    return true;
  },

  payTribute: (targetId: string): boolean => {
    const state = get();
    
    if (state.wealth < BATTLE_CONFIG.TRIBUTE_COST) {
      toast.error(`Need ${BATTLE_CONFIG.TRIBUTE_COST} $WEALTH to pay tribute`);
      return false;
    }

    // Check if tribute already paid to this player
    const existingTribute = state.battleState.tributePaid.find(t => t.playerId === targetId && t.expiry > Date.now());
    if (existingTribute) {
      toast.error('Tribute already paid to this player');
      return false;
    }

    set(state => ({
      wealth: state.wealth - BATTLE_CONFIG.TRIBUTE_COST,
      battleState: {
        ...state.battleState,
        tributePaid: [
          ...state.battleState.tributePaid.filter(t => t.expiry > Date.now()), // Remove expired tributes
          { playerId: targetId, expiry: Date.now() + BATTLE_CONFIG.TRIBUTE_DURATION }
        ]
      }
    }));

    toast.success(`💰 Tribute paid to ${targetId}. Protected for 48 hours.`);
    return true;
  },

  defendAlly: (allyId: string, attackerId: string): boolean => {
    const state = get();
    
    if (state.wealth < BATTLE_CONFIG.ALLIANCE_DEFENSE_COST) {
      toast.error(`Need ${BATTLE_CONFIG.ALLIANCE_DEFENSE_COST} $WEALTH to defend ally`);
      return false;
    }
    
    if (state.landNfts === 0) {
      toast.error('Only Land NFT owners can provide alliance defense');
      return false;
    }

    set(state => ({
      wealth: state.wealth - BATTLE_CONFIG.ALLIANCE_DEFENSE_COST
    }));

    toast.success(`🤝 Defending ${allyId} against ${attackerId}!`);
    return true;
  },

  canAttack: (targetWealth: number): { canAttack: boolean; reason?: string } => {
    const state = get();
    return canAttackTarget(
      { 
        wealth: state.wealth, 
        battleState: state.battleState, 
        creditBalance: state.creditBalance 
      },
      { 
        wealth: targetWealth, 
        battleState: { 
          lastAttackTime: 0, 
          lastDefenseTime: 0, 
          attacksToday: 0, 
          successfulAttacksToday: 0, 
          defenseRating: 0, 
          shieldExpiry: 0, 
          consecutiveAttacksFrom: {}, 
          activeRaids: [], 
          tributePaid: [],
          lastAttackByType: {
            STANDARD: 0,
            WEALTH_ASSAULT: 0,
            LAND_SIEGE: 0,
            BUSINESS_SABOTAGE: 0
          },
          businessMultiplierDamage: 0
        } 
      }
    );
  },

  getBattleStats: () => {
    const state = get();
    const baseSuccessRate = BATTLE_CONFIG.BASE_SUCCESS_RATE;
    const { attackBonus } = calculateBusinessModifiers(state.enhancedBusinesses);
    const successRate = Math.min(0.95, baseSuccessRate + attackBonus);
    
    return {
      successRate: Math.round(successRate * 100),
      attacksToday: state.battleState.attacksToday,
      shieldActive: state.battleState.shieldExpiry > Date.now()
    };
  },

  resetDailyBattleStats: () => {
    set(state => ({
      battleState: {
        ...state.battleState,
        attacksToday: 0,
        successfulAttacksToday: 0
      }
    }));
  },

  repairBusinessMultipliers: () => {
    const state = get();
    const currentDamage = state.battleState.businessMultiplierDamage;
    
    if (currentDamage === 0) {
      return { success: false, cost: 0, damageRepaired: 0 };
    }
    
    // Calculate repair cost: 2 credits per 1% damage
    const repairCost = Math.ceil(currentDamage * 2);
    
    if (state.creditBalance < repairCost) {
      return { success: false, cost: repairCost, damageRepaired: 0 };
    }
    
    // Perform repair
    set(state => ({
      creditBalance: state.creditBalance - repairCost,
      battleState: {
        ...state.battleState,
        businessMultiplierDamage: 0
      }
    }));
    
    toast.success(`🔧 Business multipliers fully repaired for ${repairCost} credits!`);
    
    return { 
      success: true, 
      cost: repairCost, 
      damageRepaired: currentDamage 
    };
  },
}));
