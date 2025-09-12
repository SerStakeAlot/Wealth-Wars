export const DEMO_CONFIG = {
  // Demo mode settings
  IS_DEMO: true,
  DEMO_NAME: "Wealth Wars Beta Demo",
  DEMO_VERSION: "v1.0.0",
  
  // Starting resources for all players
  STARTING_WEALTH: 1000,        // 1000 fake $WEALTH to buy businesses immediately
  STARTING_CREDITS: 500,        // 500 credits for battles
  STARTING_LAND_NFTS: 0,        // No Land NFTs to start
  
  // Demo treasury (smaller amounts for testing)
  DEMO_TREASURY: {
    initialWealth: 50_000,      // 50k fake $WEALTH in treasury
    initialCredits: 100_000,    // 100k credits in treasury
  conversionRate: 100,        // 100 credits = 1 $WEALTH
    maxDailyConversions: 1_000, // Prevent treasury drain
    refillAmount: 10_000,       // Auto-refill when low
    minReserve: 5_000,          // Minimum treasury reserve
  },
  
  // Demo-specific business prices (same as real game for authenticity)
  DEMO_BUSINESSES: {
    useSamePricing: true,
    // All businesses available from start
    unlockAll: true,
  },
  
  // Competitive leaderboard settings
  LEADERBOARD: {
    enabled: true,
    refreshInterval: 30_000,    // Update every 30 seconds
    showTop: 20,                // Show top 20 players
    categories: [
      'total_wealth',
      'businesses_owned', 
      'battles_won',
      'work_sessions'
    ]
  },
  
  // Demo session settings
  SESSION: {
    duration: 7 * 24 * 60 * 60 * 1000, // 7 days
    canReset: true
  },  // Battle system adjustments for demo (faster gameplay)
  BATTLE_ADJUSTMENTS: {
    reducedCooldowns: true,
    standardCooldown: 5 * 60 * 1000,    // 5 minutes instead of 4 hours
    wealthCooldown: 15 * 60 * 1000,     // 15 minutes instead of 12 hours  
    landCooldown: 30 * 60 * 1000,       // 30 minutes instead of 24 hours
    
    // Increased battle rewards for demo
    bonusRewards: true,
    rewardMultiplier: 2,                 // 2x rewards for faster progression
  },
  
  // Work session adjustments for demo
  WORK_ADJUSTMENTS: {
    reducedCooldown: true,
    workCooldown: 10 * 1000,            // 10 seconds instead of 1 minute
    bonusCredits: true,
    creditMultiplier: 1.5,              // 1.5x credits for faster gameplay
  },
  
  // Demo-specific features
  DEMO_FEATURES: {
    showTutorial: true,                 // Show tutorial for new players
    allowSpeedMode: true,               // Ultra-fast mode for testing
    showLeaderboard: true,              // Always show competitive leaderboard
    enableBattleNotifications: true,    // Full battle notification system
    allowReset: true,                   // Players can restart anytime
  },
  
  // Analytics and tracking (for demo feedback)
  ANALYTICS: {
    enabled: true,
    trackActions: [
      'business_purchase',
      'battle_initiated', 
      'work_session',
      'wealth_conversion',
      'demo_reset'
    ],
    sessionTracking: true,
  }
};

// Demo player name generator
export const DEMO_PLAYER_NAMES = {
  adjectives: [
    'Wealthy', 'Cunning', 'Strategic', 'Bold', 'Elite', 'Savvy', 
    'Dynamic', 'Fierce', 'Smart', 'Powerful', 'Digital', 'Crypto',
    'Business', 'Empire', 'Golden', 'Diamond', 'Platinum', 'Royal'
  ],
  nouns: [
    'Tycoon', 'Mogul', 'Baron', 'Entrepreneur', 'Investor', 'Trader', 
    'Builder', 'Warrior', 'Master', 'Legend', 'Champion', 'Titan',
    'Emperor', 'Lord', 'King', 'Boss', 'Chief', 'Captain'
  ]
};

export const generateDemoPlayerName = (): string => {
  const { adjectives, nouns } = DEMO_PLAYER_NAMES;
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${adj}${noun}${number}`;
};

// Demo session management
export const DEMO_STORAGE_KEYS = {
  PLAYER_DATA: 'wealth_wars_demo_player',
  SESSION_START: 'wealth_wars_demo_session_start', 
  LEADERBOARD: 'wealth_wars_demo_leaderboard',
  SETTINGS: 'wealth_wars_demo_settings',
  TUTORIAL_COMPLETED: 'wealth_wars_demo_tutorial'
};
