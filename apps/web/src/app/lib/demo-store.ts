'use client';

import { create } from 'zustand';
import { DEMO_CONFIG, generateDemoPlayerName, DEMO_STORAGE_KEYS } from './demo-config';
import { ENHANCED_BUSINESSES } from './businesses';
import { ATTACK_TYPES, SHIELD_TYPES, AttackType } from './battle-system';
import { toast } from 'react-hot-toast';

// Demo-specific interfaces
export interface DemoPlayer {
  id: string;
  name: string;
  wealth: number;
  creditBalance: number;
  landNfts: number;
  enhancedBusinesses: string[];
  businessSlots: string[]; // Array of business IDs assigned to slots
  workSessions: number;
  battlesWon: number;
  battlesLost: number;
  totalEarned: number;
  isDemo: true;
  demoStartTime: number;
  lastWorkTime: number;
  lastSaveTime: number;
  // Normal businesses (lemonade, cafe, factory)
  business: {
    lemStand: number;
    cafe: number;
    factory: number;
  };
  battleState: {
    lastAttackTime: number;
    lastDefenseTime: number;
    attacksToday: number;
    successfulAttacksToday: number;
    defenseRating: number;
    shieldExpiry: number;
    consecutiveAttacksFrom: Record<string, { count: number; lastAttack: number }>;
    activeRaids: Array<{ raiderId: string; startTime: number; dailyYield: number; daysRemaining: number; }>;
    tributePaid: Array<{ playerId: string; expiry: number; }>;
    lastAttackByType: Record<string, number>;
  };
}

export interface DemoTreasury {
  wealth: number;
  credits: number;
  totalConversions: number;
  lastRefill: number;
  isLow: boolean;
}

export interface DemoLeaderboardEntry {
  id: string;
  name: string;
  wealth: number;
  businesses: number;
  battles: number;
  workSessions: number;
  lastActive: number;
}

interface DemoGameStore {
  // Demo player state
  player: DemoPlayer | null;
  isInitialized: boolean;
  
  // Demo treasury
  treasury: DemoTreasury;
  
  // Leaderboard and competition
  leaderboard: DemoLeaderboardEntry[];
  playerRank: number;
  
  // Demo session management
  sessionStartTime: number;
  timeRemaining: number;
  canReset: boolean;
  
  // Game mechanics
  isWorking: boolean;
  workCooldownRemaining: number;
  
  // Battle system (demo version)
  isBattling: boolean;
  battleCooldowns: Record<AttackType, number>;
  
  // Demo-specific actions
  initializeDemo: (playerName?: string) => void;
  resetDemo: () => void;
  saveProgress: () => void;
  loadProgress: () => boolean;
  
  // Core game actions (demo versions)
  work: () => Promise<{ credits: number; message: string }>;
  buyBusiness: (businessId: string) => boolean; // Enhanced businesses
  buyNormalBusiness: (bizKind: number) => void; // Normal businesses (0=lemonade, 1=cafe, 2=factory)
  convertCreditsToWealth: (amount?: number) => Promise<void>;
  
  // Business slot management
  assignBusinessToSlot: (businessId: string, slotIndex: number) => boolean;
  removeBusinessFromSlot: (slotIndex: number) => boolean;
  getAvailableSlots: () => number;
  
  // Battle actions (demo versions)
  attackPlayer: (targetId: string, attackType: AttackType, targetData?: Record<string, unknown>) => Promise<Record<string, unknown>>;
  activateShield: (shieldType: keyof typeof SHIELD_TYPES) => Promise<void>;
  
  // Leaderboard and competition
  updateLeaderboard: () => void;
  getPlayerRank: () => number;
  
  // Utility functions
  canAfford: (cost: number) => boolean;
  getBusinessCost: (businessId: string) => number;
  calculateNetWorth: () => number;
  
  // Demo analytics
  trackAction: (action: string, data?: Record<string, unknown>) => void;
}

// Create demo player
const createDemoPlayer = (name?: string): DemoPlayer => ({
  id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: name || generateDemoPlayerName(),
  wealth: DEMO_CONFIG.STARTING_WEALTH,
  creditBalance: DEMO_CONFIG.STARTING_CREDITS,
  landNfts: DEMO_CONFIG.STARTING_LAND_NFTS,
  enhancedBusinesses: [],
  businessSlots: [], // Initialize empty business slots
  workSessions: 0,
  battlesWon: 0,
  battlesLost: 0,
  totalEarned: 0,
  isDemo: true,
  demoStartTime: Date.now(),
  lastWorkTime: 0,
  lastSaveTime: Date.now(),
  business: {
    lemStand: 0,
    cafe: 0,
    factory: 0
  },
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
      LAND_SIEGE: 0
    }
  }
});

// Create initial demo treasury
const createDemoTreasury = (): DemoTreasury => ({
  wealth: DEMO_CONFIG.DEMO_TREASURY.initialWealth,
  credits: DEMO_CONFIG.DEMO_TREASURY.initialCredits,
  totalConversions: 0,
  lastRefill: Date.now(),
  isLow: false
});

export const useDemoGame = create<DemoGameStore>((set, get) => ({
  // Initial state
  player: null,
  isInitialized: false,
  treasury: createDemoTreasury(),
  leaderboard: [],
  playerRank: 0,
  sessionStartTime: 0,
  timeRemaining: DEMO_CONFIG.SESSION.duration,
  canReset: true,
  isWorking: false,
  workCooldownRemaining: 0,
  isBattling: false,
  battleCooldowns: {
    STANDARD: 0,
    WEALTH_ASSAULT: 0,
    LAND_SIEGE: 0
  },

  // Initialize demo
  initializeDemo: (playerName?: string) => {
    const player = createDemoPlayer(playerName);
    const sessionStart = Date.now();
    
    set({
      player,
      isInitialized: true,
      sessionStartTime: sessionStart,
      timeRemaining: DEMO_CONFIG.SESSION.duration,
      treasury: createDemoTreasury()
    });
    
    // Save to localStorage and sync to server
    get().saveProgress();
    get().updateLeaderboard(); // Initial sync with server
    get().trackAction('demo_started', { playerName: player.name });
    
    // Start auto-sync every 30 seconds
    setInterval(() => {
      get().updateLeaderboard();
    }, 30000);
    
    toast.success(`🎮 Demo started! Welcome ${player.name}! You have ${DEMO_CONFIG.STARTING_WEALTH} $WEALTH to begin.`);
  },

  // Reset demo progress
  resetDemo: () => {
    const newPlayer = createDemoPlayer();
    const sessionStart = Date.now();
    
    set({
      player: newPlayer,
      sessionStartTime: sessionStart,
      timeRemaining: DEMO_CONFIG.SESSION.duration,
      treasury: createDemoTreasury(),
      isWorking: false,
      workCooldownRemaining: 0,
      isBattling: false,
      battleCooldowns: {
        STANDARD: 0,
        WEALTH_ASSAULT: 0,
        LAND_SIEGE: 0
      }
    });
    
    // Clear localStorage
    localStorage.removeItem(DEMO_STORAGE_KEYS.PLAYER_DATA);
    localStorage.removeItem(DEMO_STORAGE_KEYS.SESSION_START);
    
    get().saveProgress();
    get().trackAction('demo_reset');
    
    toast.success(`🔄 Demo reset! New player ${newPlayer.name} with ${DEMO_CONFIG.STARTING_WEALTH} $WEALTH.`);
  },

  // Save progress to localStorage
  saveProgress: () => {
    const { player, sessionStartTime, treasury } = get();
    
    if (player && typeof window !== 'undefined') {
      localStorage.setItem(DEMO_STORAGE_KEYS.PLAYER_DATA, JSON.stringify(player));
      localStorage.setItem(DEMO_STORAGE_KEYS.SESSION_START, sessionStartTime.toString());
      localStorage.setItem(DEMO_STORAGE_KEYS.LEADERBOARD, JSON.stringify({ 
        player: {
          id: player.id,
          name: player.name,
          wealth: player.wealth,
          businesses: player.enhancedBusinesses.length,
          battles: player.battlesWon,
          workSessions: player.workSessions,
          lastActive: Date.now()
        }
      }));
      
      set(state => ({
        player: state.player ? { ...state.player, lastSaveTime: Date.now() } : null
      }));
    }
  },

  // Load progress from localStorage
  loadProgress: () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const savedPlayer = localStorage.getItem(DEMO_STORAGE_KEYS.PLAYER_DATA);
      const savedSession = localStorage.getItem(DEMO_STORAGE_KEYS.SESSION_START);
      
      if (savedPlayer && savedSession) {
        const player = JSON.parse(savedPlayer) as DemoPlayer;
        const sessionStart = parseInt(savedSession);
        const timeElapsed = Date.now() - sessionStart;
        
        // Check if session has expired
        if (timeElapsed > DEMO_CONFIG.SESSION.duration) {
          toast('Demo session expired. Starting fresh!');
          return false;
        }
        
        set({
          player,
          isInitialized: true,
          sessionStartTime: sessionStart,
          timeRemaining: Math.max(0, DEMO_CONFIG.SESSION.duration - timeElapsed)
        });
        
        // Load leaderboard on return
        get().updateLeaderboard();
        
        // Start auto-sync
        setInterval(() => {
          get().updateLeaderboard();
        }, 30000);
        
        toast.success(`Welcome back ${player.name}! Demo session restored.`);
        return true;
      }
    } catch (error) {
      console.error('Failed to load demo progress:', error);
    }
    
    return false;
  },

  // Work action (demo version with reduced cooldown)
  work: async () => {
    const { player, isWorking } = get();
    
    if (!player || isWorking) {
      return { credits: 0, message: 'Cannot work right now' };
    }
    
    const now = Date.now();
    const timeSinceLastWork = now - player.lastWorkTime;
    const cooldown = DEMO_CONFIG.WORK_ADJUSTMENTS.workCooldown;
    
    if (timeSinceLastWork < cooldown) {
      const remaining = Math.ceil((cooldown - timeSinceLastWork) / 1000);
      return { credits: 0, message: `Work cooldown: ${remaining}s remaining` };
    }
    
    set({ isWorking: true });
    
    // Simulate work time (faster in demo)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Calculate credits earned (with demo bonus)
    const baseCredits = 25; // Base work reward
    const multiplier = DEMO_CONFIG.WORK_ADJUSTMENTS.creditMultiplier;
    const creditsEarned = Math.floor(baseCredits * multiplier);
    
    // Update player state
    set(state => ({
      player: state.player ? {
        ...state.player,
        creditBalance: state.player.creditBalance + creditsEarned,
        workSessions: state.player.workSessions + 1,
        totalEarned: state.player.totalEarned + creditsEarned,
        lastWorkTime: now
      } : null,
      isWorking: false
    }));
    
    get().saveProgress();
    get().updateLeaderboard(); // Sync after work
    get().trackAction('work_session', { creditsEarned });
    
    return {
      credits: creditsEarned,
      message: `💪 Earned ${creditsEarned} credits! (Demo bonus applied)`
    };
  },

  // Buy business (demo version)
  buyBusiness: (businessId: string) => {
    const { player } = get();
    
    if (!player) return false;
    
    const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
    if (!business) return false;
    
    const cost = get().getBusinessCost(businessId);
    
    if (player.wealth < cost) {
      toast.error(`Need ${cost} $WEALTH to buy ${business.name}`);
      return false;
    }
    
    if (player.enhancedBusinesses.includes(businessId)) {
      toast.error(`You already own ${business.name}`);
      return false;
    }
    
    // Purchase business and assign to first available slot
    set(state => {
      if (!state.player) return state;
      
      const maxSlots = 3 + state.player.landNfts; // Base 3 slots + 1 per land NFT
      const newBusinessSlots = [...state.player.businessSlots];
      
      // Find first empty slot and assign business
      let assignedToSlot = false;
      for (let i = 0; i < maxSlots; i++) {
        // Ensure array is long enough
        while (newBusinessSlots.length <= i) {
          newBusinessSlots.push('');
        }
        
        // If slot is empty, assign business
        if (!newBusinessSlots[i] || newBusinessSlots[i] === '') {
          newBusinessSlots[i] = businessId;
          assignedToSlot = true;
          break;
        }
      }
      
      return {
        player: {
          ...state.player,
          wealth: state.player.wealth - cost,
          enhancedBusinesses: [...state.player.enhancedBusinesses, businessId],
          businessSlots: newBusinessSlots
        }
      };
    });
    
    get().saveProgress();
    get().updateLeaderboard(); // Sync after business purchase
    get().trackAction('business_purchase', { businessId, cost });
    
    toast.success(`🏢 Purchased ${business.name} for ${cost} $WEALTH!`);
    return true;
  },

  // Buy normal business (lemonade stand, cafe, factory)
  buyNormalBusiness: (bizKind: number) => {
    const { player } = get();
    
    if (!player) return;
    
    const businessTypes = ['lemStand', 'cafe', 'factory'] as const;
    const costs = [10, 50, 200]; // Credit costs for each business type
    const businessNames = ['Lemonade Stand', 'Coffee Cafe', 'Widget Factory'];
    
    if (bizKind < 0 || bizKind >= businessTypes.length) {
      console.log('Invalid business kind:', bizKind);
      return;
    }
    
    const businessType = businessTypes[bizKind];
    const cost = costs[bizKind];
    const businessName = businessNames[bizKind];
    
    if (player.creditBalance < cost) {
      toast.error(`Need ${cost} credits to buy ${businessName}!`);
      return;
    }
    
    set(state => {
      if (!state.player) return state;
      
      return {
        player: {
          ...state.player,
          creditBalance: state.player.creditBalance - cost,
          business: {
            ...state.player.business,
            [businessType]: state.player.business[businessType] + 1,
          }
        }
      };
    });
    
    get().saveProgress();
    get().updateLeaderboard();
    get().trackAction('normal_business_purchase', { businessType, cost });
    
    toast.success(`🏪 Purchased ${businessName} for ${cost} credits!`);
  },

  // Convert credits to wealth (demo treasury)
  convertCreditsToWealth: async (amount = 100) => {
    const { player, treasury } = get();
    
    if (!player) return;
    
    if (player.creditBalance < amount) {
      toast.error(`Need ${amount} credits to convert!`);
      return;
    }
    
    if (treasury.wealth < 1) {
      toast.error('Demo treasury is empty! Auto-refilling...');
      
      // Auto-refill treasury
      set(state => ({
        treasury: {
          ...state.treasury,
          wealth: DEMO_CONFIG.DEMO_TREASURY.refillAmount,
          lastRefill: Date.now()
        }
      }));
    }
    
    const wealthToAdd = Math.floor(amount / DEMO_CONFIG.DEMO_TREASURY.conversionRate);
    
    // Update player and treasury
    set(state => ({
      player: state.player ? {
        ...state.player,
        creditBalance: state.player.creditBalance - amount,
        wealth: state.player.wealth + wealthToAdd
      } : null,
      treasury: {
        ...state.treasury,
        wealth: Math.max(0, state.treasury.wealth - wealthToAdd),
        credits: state.treasury.credits + amount,
        totalConversions: state.treasury.totalConversions + 1,
        isLow: (state.treasury.wealth - wealthToAdd) < DEMO_CONFIG.DEMO_TREASURY.minReserve
      }
    }));
    
    get().saveProgress();
    get().updateLeaderboard(); // Sync after wealth conversion
    get().trackAction('wealth_conversion', { amount, wealthToAdd });
    
    toast.success(`💰 Converted ${amount} credits to ${wealthToAdd} $WEALTH!`);
  },

  // Attack player (demo version)
  attackPlayer: async (targetId: string, attackType: AttackType = 'STANDARD', _targetData?: Record<string, unknown>) => {
    const { player, isBattling } = get();
    
    if (!player || isBattling) {
      return { success: false, message: 'Cannot attack right now' };
    }
    
    const attackInfo = ATTACK_TYPES[attackType];
    const now = Date.now();
    const lastAttack = player.battleState.lastAttackByType[attackType] || 0;
    const cooldown = DEMO_CONFIG.BATTLE_ADJUSTMENTS.reducedCooldowns 
      ? DEMO_CONFIG.BATTLE_ADJUSTMENTS.standardCooldown 
      : attackInfo.cooldown;
    
    if (now - lastAttack < cooldown) {
      const remaining = Math.ceil((cooldown - (now - lastAttack)) / 1000);
      return { success: false, message: `Attack cooldown: ${remaining}s remaining` };
    }
    
    // Check resources
    if (attackInfo.currency === 'credits' && player.creditBalance < attackInfo.cost) {
      return { success: false, message: `Need ${attackInfo.cost} credits to attack` };
    }
    
    if (attackInfo.currency === 'wealth' && player.wealth < attackInfo.cost) {
      return { success: false, message: `Need ${attackInfo.cost} $WEALTH to attack` };
    }
    
    set({ isBattling: true });
    
    // Simulate battle (faster in demo)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Calculate battle outcome (simplified for demo)
    const successRate = 0.6; // 60% base success rate
    const success = Math.random() < successRate;
    
    const wealthStolen = success ? Math.floor(Math.random() * 50) + 25 : 0;
    const wealthLost = success ? 0 : Math.floor(attackInfo.cost * 0.5);
    
    // Update player state
    const costUpdate = attackInfo.currency === 'credits' 
      ? { creditBalance: player.creditBalance - attackInfo.cost }
      : { wealth: player.wealth - attackInfo.cost };
    
    set(state => ({
      player: state.player ? {
        ...state.player,
        ...costUpdate,
        wealth: state.player.wealth + wealthStolen - wealthLost,
        battlesWon: success ? state.player.battlesWon + 1 : state.player.battlesWon,
        battlesLost: !success ? state.player.battlesLost + 1 : state.player.battlesLost,
        battleState: {
          ...state.player.battleState,
          lastAttackTime: now,
          lastAttackByType: {
            ...state.player.battleState.lastAttackByType,
            [attackType]: now
          },
          attacksToday: state.player.battleState.attacksToday + 1,
          successfulAttacksToday: success ? state.player.battleState.successfulAttacksToday + 1 : state.player.battleState.successfulAttacksToday
        }
      } : null,
      isBattling: false
    }));
    
    get().saveProgress();
    get().trackAction('battle_initiated', { attackType, success, wealthStolen });
    
    const message = success 
      ? `⚔️ Attack successful! Stole ${wealthStolen} $WEALTH!`
      : `❌ Attack failed! Lost ${wealthLost} $WEALTH!`;
    
    return {
      success,
      wealthStolen,
      wealthLost,
      message,
      attackType,
      counterAttack: false,
      raidTriggered: false,
      finalSuccessRate: successRate
    };
  },

  // Activate shield (demo version)
  activateShield: async (shieldType: keyof typeof SHIELD_TYPES) => {
    const { player } = get();
    
    if (!player) return;
    
    const shield = SHIELD_TYPES[shieldType];
    
    if (player.wealth < shield.cost) {
      toast.error(`Need ${shield.cost} $WEALTH for ${shield.name}`);
      return;
    }
    
    const now = Date.now();
    if (player.battleState.shieldExpiry > now) {
      toast.error('Shield already active!');
      return;
    }
    
    // Activate shield
    set(state => ({
      player: state.player ? {
        ...state.player,
        wealth: state.player.wealth - shield.cost,
        battleState: {
          ...state.player.battleState,
          shieldExpiry: now + shield.duration
        }
      } : null
    }));
    
    get().saveProgress();
    get().trackAction('shield_activated', { shieldType, cost: shield.cost });
    
    toast.success(`🛡️ ${shield.name} activated! Protected for ${shield.duration / (60 * 60 * 1000)} hours.`);
  },

  // Update leaderboard (sync with server)
  updateLeaderboard: async () => {
    const { player } = get();
    
    if (!player) return;
    
    try {
      // Sync current player to server
      await fetch('/api/demo/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(player)
      });
      
      // Fetch updated leaderboard
      const response = await fetch('/api/demo/players');
      const data = await response.json();
      
      if (data.leaderboard) {
        const playerRank = data.leaderboard.findIndex((p: any) => p.id === player.id) + 1;
        
        set({
          leaderboard: data.leaderboard,
          playerRank: playerRank || data.leaderboard.length + 1
        });
      }
    } catch (error) {
      console.error('Failed to sync leaderboard:', error);
      // Fallback to local mock data
      const mockPlayers: DemoLeaderboardEntry[] = [
        {
          id: player.id,
          name: player.name,
          wealth: player.wealth,
          businesses: player.enhancedBusinesses.length,
          battles: player.battlesWon,
          workSessions: player.workSessions,
          lastActive: Date.now()
        }
      ];
      
      set({
        leaderboard: mockPlayers,
        playerRank: 1
      });
    }
  },

  // Get player rank
  getPlayerRank: () => {
    return get().playerRank;
  },

  // Utility functions
  canAfford: (cost: number) => {
    const { player } = get();
    return player ? player.wealth >= cost : false;
  },

  getBusinessCost: (businessId: string) => {
    const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
    return business?.cost || 0;
  },

  calculateNetWorth: () => {
    const { player } = get();
    if (!player) return 0;
    
    const businessValue = player.enhancedBusinesses.reduce((total, id) => {
      const business = ENHANCED_BUSINESSES.find(b => b.id === id);
      return total + (business?.cost || 0);
    }, 0);
    
    return player.wealth + Math.floor(player.creditBalance / 100) + businessValue;
  },

  // Business slot management
  assignBusinessToSlot: (businessId: string, slotIndex: number) => {
    const { player } = get();
    if (!player) return false;
    
    const maxSlots = 3 + player.landNfts;
    if (slotIndex >= maxSlots) return false;
    
    if (!player.enhancedBusinesses.includes(businessId)) {
      toast.error('You must own this business first!');
      return false;
    }
    
    set(state => {
      if (!state.player) return state;
      
      const newSlots = [...state.player.businessSlots];
      
      // Remove business from any existing slot
      const existingIndex = newSlots.indexOf(businessId);
      if (existingIndex !== -1) {
        newSlots[existingIndex] = '';
      }
      
      // Assign to new slot
      while (newSlots.length <= slotIndex) {
        newSlots.push('');
      }
      newSlots[slotIndex] = businessId;
      
      return {
        player: {
          ...state.player,
          businessSlots: newSlots
        }
      };
    });
    
    get().saveProgress();
    return true;
  },

  removeBusinessFromSlot: (slotIndex: number) => {
    const { player } = get();
    if (!player) return false;
    
    set(state => {
      if (!state.player) return state;
      
      const newSlots = [...state.player.businessSlots];
      if (slotIndex < newSlots.length) {
        newSlots[slotIndex] = '';
      }
      
      return {
        player: {
          ...state.player,
          businessSlots: newSlots
        }
      };
    });
    
    get().saveProgress();
    return true;
  },

  getAvailableSlots: () => {
    const { player } = get();
    if (!player) return 0;
    
    const maxSlots = 3 + player.landNfts;
    const usedSlots = player.businessSlots.filter(slot => slot !== '').length;
    return maxSlots - usedSlots;
  },

  // Demo analytics
  trackAction: (action: string, data?: Record<string, unknown>) => {
    if (!DEMO_CONFIG.ANALYTICS.enabled) return;
    
    const { player } = get();
    
    const event = {
      action,
      playerId: player?.id,
      playerName: player?.name,
      timestamp: Date.now(),
      data
    };
    
    // In a real implementation, send to analytics service
    console.log('Demo Analytics:', event);
  }
}));
