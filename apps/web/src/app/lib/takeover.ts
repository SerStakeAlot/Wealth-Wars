// Takeover System Implementation
import { EnhancedBusiness, TakeoverTarget, TakeoverBid, TakeoverEligibility, TakeoverResult, DefenseResponse, Player } from './types';
import { ENHANCED_BUSINESSES } from './businesses';

// Takeover Configuration
export const TAKEOVER_CONFIG = {
  thresholds: {
    minimumTargetValue: 500, // Credits worth of businesses to be targetable
    individualBusinessMin: 50, // Minimum individual business value to target
    premiumAttackMin: 1000, // Portfolio value for premium attacks
  },
  
  protections: {
    starterBusinesses: ['lemonade_stand'], // Protected if only business
    newPlayerDays: 7, // Days of absolute protection
    portfolioBuffer: 3, // First 3 businesses under 100 credits protected
  },
  
  costs: {
    creditMultiplier: 1.5, // 150% of business value
    wealthMultiplier: 2.0, // 200% in $WEALTH terms
    minimumBid: 50, // Minimum credit attack cost
    minimumWealthBid: 5, // Minimum $WEALTH attack cost
  },
  
  timing: {
    biddingWindow: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    defenseWindow: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
    newPlayerProtection: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
  
  success: {
    baseRate: 60, // Base 60% success rate
    offensiveBusinessBonus: 5, // +5% per offensive business
    defensiveBusinessPenalty: 10, // -10% per defensive business
    bidBonusPerHundred: 1, // +1% per 100 credits over minimum
    allianceSupportPenalty: 15, // -15% if alliance helps defend
  }
};

// Calculate if a player can be targeted for takeovers
export function calculateTakeoverEligibility(player: Player): TakeoverEligibility {
  const now = Date.now();
  const accountAge = now - (player.accountCreated || 0);
  const isNewPlayer = accountAge < TAKEOVER_CONFIG.timing.newPlayerProtection;
  
  // Calculate portfolio value
  const portfolioValue = calculatePortfolioValue(player.enhancedBusinesses, player.business);
  
  // Check absolute protection
  if (isNewPlayer) {
    return {
      canBeTargeted: false,
      reason: 'New player protection (7 days)',
      portfolioValue,
      protectionLevel: 'absolute',
      protectedBusinesses: [...player.enhancedBusinesses],
      minimumAttackCost: 0
    };
  }
  
  if (portfolioValue < TAKEOVER_CONFIG.thresholds.minimumTargetValue) {
    return {
      canBeTargeted: false,
      reason: `Portfolio value too low (${portfolioValue} < ${TAKEOVER_CONFIG.thresholds.minimumTargetValue})`,
      portfolioValue,
      protectionLevel: 'absolute',
      protectedBusinesses: [...player.enhancedBusinesses],
      minimumAttackCost: 0
    };
  }
  
  // Check limited protection
  const protectedBusinesses = getProtectedBusinesses(player);
  const hasLimitedProtection = portfolioValue < TAKEOVER_CONFIG.thresholds.premiumAttackMin;
  
  return {
    canBeTargeted: true,
    portfolioValue,
    protectionLevel: hasLimitedProtection ? 'limited' : 'none',
    protectedBusinesses,
    minimumAttackCost: TAKEOVER_CONFIG.costs.minimumBid
  };
}

// Calculate total portfolio value
export function calculatePortfolioValue(enhancedBusinesses: string[], legacyBusiness: any): number {
  let value = 0;
  
  // Enhanced businesses
  enhancedBusinesses.forEach(businessId => {
    const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
    if (business) {
      value += business.cost;
    }
  });
  
  // Legacy businesses (Lemonade Stand, Cafe, Factory)
  value += legacyBusiness.lemStand * 10; // Lemonade stands worth 10 each
  value += legacyBusiness.cafe * 50; // Cafes worth 50 each
  value += legacyBusiness.factory * 200; // Factories worth 200 each
  
  return value;
}

// Get list of protected businesses for a player
export function getProtectedBusinesses(player: Player): string[] {
  const eligibility = calculateTakeoverEligibility(player);
  
  if (eligibility.protectionLevel === 'absolute') {
    return [...player.enhancedBusinesses];
  }
  
  if (eligibility.protectionLevel === 'limited') {
    // Protect starter businesses and businesses under value threshold
    const protectedBusinesses: string[] = [];
    
    player.enhancedBusinesses.forEach(businessId => {
      const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
      if (business && business.cost < TAKEOVER_CONFIG.thresholds.individualBusinessMin) {
        protectedBusinesses.push(businessId);
      }
    });
    
    return protectedBusinesses;
  }
  
  return []; // No protection for high-value portfolios
}

// Calculate takeover cost for a specific business
export function calculateTakeoverCost(
  targetBusiness: EnhancedBusiness | { cost: number }, 
  attackType: 'credits' | 'wealth'
): number {
  const baseValue = targetBusiness.cost;
  
  if (attackType === 'credits') {
    return Math.max(
      Math.floor(baseValue * TAKEOVER_CONFIG.costs.creditMultiplier), 
      TAKEOVER_CONFIG.costs.minimumBid
    );
  } else {
    // Convert to $WEALTH at 10:1 ratio, then add premium
    const wealthEquivalent = Math.ceil(baseValue / 10);
    return Math.max(
      Math.floor(wealthEquivalent * TAKEOVER_CONFIG.costs.wealthMultiplier), 
      TAKEOVER_CONFIG.costs.minimumWealthBid
    );
  }
}

// Check if a specific business can be targeted
export function canTargetBusiness(
  attacker: Player, 
  defender: Player, 
  businessId: string
): { canTarget: boolean; reason?: string; cost?: number } {
  const eligibility = calculateTakeoverEligibility(defender);
  
  if (!eligibility.canBeTargeted) {
    return { canTarget: false, reason: eligibility.reason };
  }
  
  if (eligibility.protectedBusinesses.includes(businessId)) {
    return { canTarget: false, reason: 'Business is protected' };
  }
  
  const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
  if (!business) {
    return { canTarget: false, reason: 'Business not found' };
  }
  
  if (!defender.enhancedBusinesses.includes(businessId)) {
    return { canTarget: false, reason: 'Target does not own this business' };
  }
  
  const cost = calculateTakeoverCost(business, 'credits');
  
  if (attacker.creditBalance < cost) {
    return { canTarget: false, reason: 'Insufficient credits for attack' };
  }
  
  return { canTarget: true, cost };
}

// Calculate takeover success probability
export function calculateSuccessRate(
  attacker: Player,
  defender: Player, 
  bid: TakeoverBid,
  defenseAmount: number = 0
): number {
  let successRate = TAKEOVER_CONFIG.success.baseRate;
  
  // Attacker bonuses
  const attackerOffensiveBusinesses = attacker.enhancedBusinesses.filter(id => {
    const business = ENHANCED_BUSINESSES.find(b => b.id === id);
    return business?.category === 'offensive';
  }).length;
  successRate += attackerOffensiveBusinesses * TAKEOVER_CONFIG.success.offensiveBusinessBonus;
  
  // Bid size bonus
  const business = ENHANCED_BUSINESSES.find(b => b.id === bid.target.businessId);
  if (business) {
    const minimumBid = calculateTakeoverCost(business, bid.bidCurrency);
    const excessBid = bid.bidAmount - minimumBid;
    const bidBonus = Math.floor(excessBid / 100) * TAKEOVER_CONFIG.success.bidBonusPerHundred;
    successRate += bidBonus;
  }
  
  // Defender penalties (reduce attacker success)
  const defenderDefensiveBusinesses = defender.enhancedBusinesses.filter(id => {
    const business = ENHANCED_BUSINESSES.find(b => b.id === id);
    return business?.category === 'defensive';
  }).length;
  successRate -= defenderDefensiveBusinesses * TAKEOVER_CONFIG.success.defensiveBusinessPenalty;
  
  // Defense investment penalty
  const defenseBonus = Math.floor(defenseAmount / 50) * 1; // -1% per 50 credits spent on defense
  successRate -= defenseBonus;
  
  // Clamp between 5% and 95%
  return Math.max(5, Math.min(95, successRate));
}

// Execute a takeover attempt
export function executeTakeover(
  attacker: Player,
  defender: Player,
  bid: TakeoverBid,
  defense?: DefenseResponse
): TakeoverResult {
  const now = Date.now();
  const defenseAmount = defense?.defenseAmount || 0;
  const successRate = calculateSuccessRate(attacker, defender, bid, defenseAmount);
  
  // Random roll for success
  const roll = Math.random() * 100;
  const success = roll < successRate;
  
  const result: TakeoverResult = {
    success,
    attackerId: attacker.username,
    defenderId: defender.username,
    target: bid.target,
    finalBid: bid.bidAmount,
    currency: bid.bidCurrency,
    defenseAttempted: !!defense,
    timestamp: now
  };
  
  if (success) {
    // Attacker wins - transfer business
    if (bid.target.businessId) {
      // Calculate compensation for defender
      const business = ENHANCED_BUSINESSES.find(b => b.id === bid.target.businessId);
      if (business) {
        result.compensation = Math.floor(business.cost * 0.5); // 50% compensation
      }
    }
  } else {
    // Defender wins - attacker loses portion of bid
    // (This will be handled in the game state update)
  }
  
  return result;
}

// Check for active defensive protections
export function hasActiveProtection(player: Player, protectionType: string): boolean {
  const now = Date.now();
  
  // Check for active business abilities providing protection
  const activeEffect = player.activeEffects?.[protectionType];
  if (activeEffect && activeEffect.endTime > now) {
    return true;
  }
  
  // Check for passive defensive business ownership
  const hasDefensiveBusiness = player.enhancedBusinesses.some(id => {
    const business = ENHANCED_BUSINESSES.find(b => b.id === id);
    return business?.category === 'defensive' && 
           business.ability.type === 'passive' &&
           business.ability.name.toLowerCase().includes(protectionType.toLowerCase());
  });
  
  return hasDefensiveBusiness;
}

// Validate takeover bid
export function validateTakeoverBid(
  attacker: Player,
  defender: Player,
  businessId: string,
  bidAmount: number,
  currency: 'credits' | 'wealth'
): { valid: boolean; reason?: string } {
  // Check if business can be targeted
  const targetCheck = canTargetBusiness(attacker, defender, businessId);
  if (!targetCheck.canTarget) {
    return { valid: false, reason: targetCheck.reason };
  }
  
  // Check minimum bid
  const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
  if (!business) {
    return { valid: false, reason: 'Business not found' };
  }
  
  const minimumBid = calculateTakeoverCost(business, currency);
  if (bidAmount < minimumBid) {
    return { valid: false, reason: `Bid too low. Minimum: ${minimumBid} ${currency}` };
  }
  
  // Check attacker has sufficient funds
  const hasEnough = currency === 'credits' 
    ? attacker.creditBalance >= bidAmount
    : attacker.wealth >= bidAmount;
    
  if (!hasEnough) {
    return { valid: false, reason: `Insufficient ${currency}` };
  }
  
  return { valid: true };
}

// Helper to create takeover target from business
export function createBusinessTarget(business: EnhancedBusiness): TakeoverTarget {
  return {
    type: 'business',
    businessId: business.id,
    value: business.cost,
    rarity: business.rarity,
    defenseDifficulty: business.tier === 'legendary' ? 90 : 
                      business.tier === 'premium' ? 70 :
                      business.tier === 'advanced' ? 50 : 30
  };
}
