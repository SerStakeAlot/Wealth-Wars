import { EnhancedBusiness } from './types';

// Phased $WEALTH Cost Structure for 300M Community Allocation
// Based on 5M $WEALTH monthly distribution from Land NFT Pool (300 NFTs @ 16,667 each)
// Land NFT mint price: 400 $WEALTH (premium tier above all businesses)
// Designed for sustainable economy with growing player base

// Cost Tiers:
// Entry: 8-20 $WEALTH (Accessible starter businesses)
// Mid: 30-50 $WEALTH (Solid mid-tier investments) 
// Premium: 60-100 $WEALTH (Advanced business capabilities)
// Elite: 150-200 $WEALTH (Top-tier business empire)
// Land NFT: 400 $WEALTH (Ultimate passive income tier)
// Elite: 150+ $WEALTH (1200+ hours of play, 20+ weeks active)

export const ENHANCED_BUSINESSES: EnhancedBusiness[] = [
  // Efficiency Category (⚡ Time Management)
  {
    id: 'automation_factory',
    name: 'Automation Factory',
    emoji: '🏭',
    description: 'A cutting-edge facility that automates your business processes, dramatically reducing work cooldowns when activated.',
    cost: 75, // Premium tier - significant investment for game-changing ability
    workMultiplier: 100,
    category: 'efficiency',
    tier: 'premium',
    rarity: 'rare',
    ability: {
      id: 'rapid_processing',
      name: 'Rapid Processing',
      description: 'Reduces work cooldown to 1 hour for the next 6 work actions',
      type: 'active',
  effectMode: 'sustained',
  cooldown: 48 * 60 * 60 * 1000, // 48h
  duration: 6 * 60 * 60 * 1000, // max window; ends earlier once 6 actions consumed
  cost: 15
    }
  },
  
  {
    id: 'fast_food_chain',
    name: 'Fast Food Chain',
    emoji: '🍔',
    description: 'A network of quick-service restaurants that provide steady income and rapid customer service capabilities.',
    cost: 35, // Mid tier - accessible but meaningful investment
    workMultiplier: 75,
    category: 'efficiency',
    tier: 'advanced',
    rarity: 'uncommon',
    ability: {
      id: 'quick_service',
      name: 'Quick Service',
      description: 'Next 4 work actions earn 40 credits instead of 25 (complete 1.6 $WEALTH)',
      type: 'active',
  effectMode: 'instant',
  cooldown: 24 * 60 * 60 * 1000, // 24h
  uses: 4,
  cost: 8
    }
  },

  {
    id: 'innovation_lab',
    name: 'Innovation Lab',
    emoji: '🔬',
    description: 'A research facility that develops new technologies and processes to improve your business efficiency.',
    cost: 50, // Mid-Premium tier - high-value permanent upgrade
    workMultiplier: 60,
    category: 'efficiency',
    tier: 'advanced',
    rarity: 'uncommon',
    ability: {
      id: 'breakthrough',
      name: 'Breakthrough',
  description: 'Permanent +5 credits per work (one-time upgrade)',
  type: 'triggered',
  effectMode: 'upgrade',
  cost: 20
    }
  },

  // Defensive Category (🛡️ Protection)
  {
    id: 'security_firm',
    name: 'Security Firm',
    emoji: '🛡️',
    description: 'Professional security services that protect your business from hostile takeovers and attacks.',
    cost: 40, // Mid tier - valuable for PvP protection
    workMultiplier: 50,
    category: 'defensive',
    tier: 'advanced',
    rarity: 'uncommon',
    ability: {
      id: 'fortress_protection',
      name: 'Fortress Protection',
      description: 'Immune to PvP attacks and cannot lose $WEALTH to other players',
      type: 'passive',
      duration: 30 * 60 * 1000 // Always active when owned
    }
  },

  {
    id: 'insurance_company',
    name: 'Insurance Company',
    emoji: '🏥',
    description: 'Financial protection that reduces losses from failed defenses and hostile business actions.',
    cost: 15, // Entry tier - accessible defensive option
    workMultiplier: 40,
    category: 'defensive',
    tier: 'basic',
    rarity: 'common',
    ability: {
      id: 'damage_insurance',
      name: 'Damage Insurance',
      description: 'When PvP attacked, automatically counter-attack for 2x damage',
      type: 'passive'
    }
  },

  {
    id: 'government_contract',
    name: 'Government Contract',
    emoji: '🏛️',
    description: 'High-level government connections that provide diplomatic immunity and steady income streams.',
    cost: 200, // Elite tier - ultimate defensive business
    workMultiplier: 80,
    category: 'defensive',
    tier: 'legendary',
    rarity: 'legendary',
    prerequisites: ['week_streak'],
    ability: {
      id: 'diplomatic_immunity',
      name: 'Diplomatic Immunity',
      description: 'Generate 1 $WEALTH per day automatically + immune to all PvP',
      type: 'passive'
    }
  },

  // Offensive Category (⚔️ Aggression)
  {
    id: 'consulting_firm',
    name: 'Consulting Firm',
    emoji: '💼',
    description: 'Strategic advisors that can infiltrate and disrupt competitor business operations.',
    cost: 45, // Mid tier - powerful PvP tool
    workMultiplier: 45,
    category: 'offensive',
    tier: 'advanced',
    rarity: 'uncommon',
    ability: {
      id: 'corporate_espionage',
      name: 'Corporate Espionage',
      description: 'Add 6 hours to target player\'s work cooldown',
      type: 'active',
  effectMode: 'instant',
  cooldown: 36 * 60 * 60 * 1000, // 36h
  cost: 10
    }
  },

  {
    id: 'cyber_security',
    name: 'Cyber Security',
    emoji: '💻',
    description: 'Elite hackers capable of disrupting digital infrastructure and business systems.',
    cost: 60, // Premium tier - advanced offensive capabilities
    workMultiplier: 30,
    category: 'offensive',
    tier: 'advanced',
    rarity: 'rare',
    ability: {
      id: 'system_disruption',
      name: 'System Disruption',
      description: 'Disable target\'s defensive businesses for 2 hours',
      type: 'active',
  effectMode: 'sustained',
  duration: 2 * 60 * 60 * 1000,
  cooldown: 36 * 60 * 60 * 1000, // 36h
  cost: 15
    }
  },

  {
    id: 'market_research',
    name: 'Market Research',
    emoji: '📊',
    description: 'Intelligence gathering operation that reveals competitor weaknesses and market opportunities.',
    cost: 12, // Entry tier - accessible intel gathering
    workMultiplier: 35,
    category: 'offensive',
    tier: 'basic',
    rarity: 'common',
    ability: {
      id: 'intelligence_gathering',
      name: 'Intelligence Gathering',
      description: 'Reveal target player\'s business portfolio and cooldowns',
      type: 'active',
  effectMode: 'instant',
  cooldown: 12 * 60 * 60 * 1000, // 12h
  cost: 3
    }
  },

  // Utility Category (🎲 Special Operations)
  {
    id: 'marketing_agency',
    name: 'Marketing Agency',
    emoji: '📢',
    description: 'Professional marketing services that amplify your business presence and improve conversion rates.',
    cost: 30, // Mid tier - useful economic tool
    workMultiplier: 30,
    category: 'utility',
    tier: 'basic',
    rarity: 'common',
    ability: {
      id: 'market_boost',
      name: 'Market Boost',
      description: '25% better conversion rates for 12 hours',
      type: 'active',
  effectMode: 'sustained',
  duration: 8 * 60 * 60 * 1000, // 8h
  cooldown: 36 * 60 * 60 * 1000, // 36h
  cost: 8
    }
  },

  {
    id: 'investment_bank',
    name: 'Investment Bank',
    emoji: '🏦',
    description: 'Financial institution that provides compound interest and wealth multiplication services.',
    cost: 100, // Premium tier - powerful wealth generation
    workMultiplier: 80,
    category: 'utility',
    tier: 'premium',
    rarity: 'rare',
    ability: {
      id: 'compound_interest',
      name: 'Compound Interest',
  description: 'Earn 5% of current $WEALTH after 24h (snapshot at activation)',
  type: 'active',
  effectMode: 'sustained',
  duration: 24 * 60 * 60 * 1000, // 24h window
  cooldown: 72 * 60 * 60 * 1000, // 72h
  cost: 25
    }
  },

  {
    id: 'venture_capital',
    name: 'Venture Capital',
    emoji: '🎰',
    description: 'High-risk investment firm that can provide massive returns or significant losses.',
    cost: 20, // Entry tier - accessible gambling option
    workMultiplier: 35,
    category: 'utility',
    tier: 'basic',
    rarity: 'common',
    ability: {
      id: 'risky_investment',
      name: 'Risky Investment',
      description: '60% chance to earn +50 bonus credits, 40% chance to lose 25 credits',
      type: 'active',
  effectMode: 'instant',
  cooldown: 3 * 60 * 60 * 1000, // 3h
  cost: 5
    }
  },

  {
    id: 'trading_exchange',
    name: 'Trading Exchange',
    emoji: '💱',
    description: 'Financial marketplace that provides better conversion rates between credits and wealth tokens.',
    cost: 8, // Entry tier - foundational economic tool
    workMultiplier: 25,
    category: 'utility',
    tier: 'basic',
    rarity: 'common',
    ability: {
      id: 'arbitrage',
      name: 'Arbitrage',
      description: '15% better conversion rates between credits and $WEALTH',
      type: 'passive'
    }
  }
];