export interface BattleState {
  lastAttackTime: number;
  lastDefenseTime: number;
  attacksToday: number;
  successfulAttacksToday: number;
  defenseRating: number;
  shieldExpiry: number;
  consecutiveAttacksFrom: Record<string, { count: number; lastAttack: number }>;
  activeRaids: Array<{
    raiderId: string;
    startTime: number;
    dailyYield: number;
    daysRemaining: number;
  }>;
  tributePaid: Array<{
    playerId: string;
    expiry: number;
  }>;
  // Track cooldowns per attack type
  lastAttackByType: Record<string, number>;
}

export interface AttackResult {
  success: boolean;
  wealthStolen: number;
  wealthLost: number;
  counterAttack: boolean;
  raidTriggered: boolean;
  message: string;
  finalSuccessRate: number;
  attackType: string;
}

// Tiered attack system
export const ATTACK_TYPES = {
  STANDARD: {
    id: 'standard',
    name: 'Standard Attack',
    cost: 15,
    currency: 'credits' as const,
    cooldown: 4 * 60 * 60 * 1000, // 4 hours
    maxWealthTheft: 0.10, // 10%
    bypassDefenses: false,
    canTriggerLandRaid: false,
    description: 'Basic attack using credits. Affected by defensive businesses.'
  },
  
  WEALTH_ASSAULT: {
    id: 'wealth_assault',
    name: 'Wealth Assault',
    cost: 10, // 10 $WEALTH
    currency: 'wealth' as const,
    cooldown: 12 * 60 * 60 * 1000, // 12 hours
    maxWealthTheft: 0.25, // 25%
    bypassDefenses: true, // Ignores defensive businesses
    canTriggerLandRaid: false,
    description: 'Premium attack that bypasses Security Firm, Insurance Company, and defensive synergies.'
  },
  
  LAND_SIEGE: {
    id: 'land_siege',
    name: 'Land Siege',
    cost: 25, // Elite tier cost
    currency: 'wealth' as const,
    cooldown: 24 * 60 * 60 * 1000, // 24 hours
    maxWealthTheft: 0.35, // 35%
    bypassDefenses: true,
    canTriggerLandRaid: true, // Can trigger Land NFT yield theft
    description: 'Ultimate attack that bypasses defenses and can trigger Land NFT raids.'
  }
} as const;

export type AttackType = keyof typeof ATTACK_TYPES;

// Shield system with updated costs
export const SHIELD_TYPES = {
  BASIC: {
    id: 'basic',
    name: 'Basic Shield',
    cost: 25, // $WEALTH
    duration: 24 * 60 * 60 * 1000, // 24 hours
    description: 'Basic protection for 24 hours. Good for short-term safety.'
  },
  ADVANCED: {
    id: 'advanced', 
    name: 'Advanced Shield',
    cost: 50, // $WEALTH
    duration: 48 * 60 * 60 * 1000, // 48 hours
    description: 'Enhanced protection for 48 hours. Suitable for weekend safety.'
  },
  ELITE: {
    id: 'elite',
    name: 'Elite Shield',
    cost: 100, // $WEALTH (reduced from 500)
    duration: 72 * 60 * 60 * 1000, // 72 hours
    description: 'Maximum protection for 72 hours. Ultimate defensive investment.'
  }
} as const;

export type ShieldType = keyof typeof SHIELD_TYPES;

export const BATTLE_CONFIG = {
  BASE_SUCCESS_RATE: 0.6,
  DEFENSE_IMMUNITY: 2 * 60 * 60 * 1000, // 2 hours
  COUNTER_ATTACK_CHANCE: 0.25,
  
  // Land Raid System
  RAID_ATTACKS_REQUIRED: 3,
  RAID_TIME_WINDOW: 24 * 60 * 60 * 1000, // 24 hours
  RAID_YIELD_PERCENTAGE: 0.1, // 10%
  RAID_DURATION_DAYS: 7,
  MONTHLY_LAND_YIELD: 16667, // Per Land NFT
  
  // Wealth Theft Rates
  THEFT_RATES: {
    LOW: { min: 0, max: 25, rate: 0.05, successMod: -0.1, maxTheft: 10 },
    MEDIUM: { min: 26, max: 100, rate: 0.10, successMod: 0, maxTheft: 20 },
    HIGH: { min: 101, max: 300, rate: 0.15, successMod: 0.1, maxTheft: 30 },
    WHALE: { min: 301, max: Infinity, rate: 0.15, successMod: 0.2, maxTheft: 50 }
  },
  
  // Protection Costs (updated for new tiered system)
  TRIBUTE_COST: 50, // $WEALTH (reduced from 200)
  TRIBUTE_DURATION: 48 * 60 * 60 * 1000, // 48 hours
  ALLIANCE_DEFENSE_COST: 75, // $WEALTH (reduced from 100)
  
  // Business Modifiers
  BUSINESS_MODIFIERS: {
    // Offensive bonuses
    'consulting_firm': { attackBonus: 0.15, defenseBonus: 0 },
    'cyber_security': { attackBonus: 0.10, defenseBonus: 0 },
    'market_research': { attackBonus: 0.05, defenseBonus: 0 },
    
    // Defensive bonuses
    'private_security': { attackBonus: 0, defenseBonus: 0.20 },
    'insurance_company': { attackBonus: 0, defenseBonus: 0.10 },
    'government_contract': { attackBonus: 0, defenseBonus: 0.15 }
  }
};

export function getWealthTier(wealth: number): keyof typeof BATTLE_CONFIG.THEFT_RATES {
  for (const [tier, config] of Object.entries(BATTLE_CONFIG.THEFT_RATES)) {
    if (wealth >= config.min && wealth <= config.max) {
      return tier as keyof typeof BATTLE_CONFIG.THEFT_RATES;
    }
  }
  return 'LOW';
}

export function calculateBusinessModifiers(businesses: string[]): { attackBonus: number; defenseBonus: number } {
  let attackBonus = 0;
  let defenseBonus = 0;
  
  businesses.forEach(businessId => {
    const modifier = BATTLE_CONFIG.BUSINESS_MODIFIERS[businessId as keyof typeof BATTLE_CONFIG.BUSINESS_MODIFIERS];
    if (modifier) {
      attackBonus += modifier.attackBonus;
      defenseBonus += modifier.defenseBonus;
    }
  });
  
  return { attackBonus, defenseBonus };
}

export function calculateAttackSuccess(
  attackerWealth: number,
  defenderWealth: number,
  attackerBusinesses: string[],
  defenderBusinesses: string[],
  attackType: AttackType = 'STANDARD',
  attackerSynergyEffects?: { attackSuccessBonus?: number; defenseBonus?: number },
  defenderSynergyEffects?: { attackSuccessBonus?: number; defenseBonus?: number }
): { successRate: number; breakdown: any } {
  let successRate = BATTLE_CONFIG.BASE_SUCCESS_RATE;
  const attack = ATTACK_TYPES[attackType];
  
  const breakdown = {
    base: BATTLE_CONFIG.BASE_SUCCESS_RATE,
    attackerWealthMod: 0,
    defenderWealthMod: 0,
    attackerBusinessMod: 0,
    defenderBusinessMod: 0,
    attackerSynergyMod: 0,
    defenderSynergyMod: 0,
    bypassedDefenses: attack.bypassDefenses
  };
  
  // Wealth tier modifiers
  const attackerTier = getWealthTier(attackerWealth);
  const defenderTier = getWealthTier(defenderWealth);
  
  breakdown.attackerWealthMod = BATTLE_CONFIG.THEFT_RATES[attackerTier].successMod;
  breakdown.defenderWealthMod = -BATTLE_CONFIG.THEFT_RATES[defenderTier].successMod;
  
  successRate += breakdown.attackerWealthMod;
  successRate += breakdown.defenderWealthMod;
  
  // Business modifiers
  const attackerMods = calculateBusinessModifiers(attackerBusinesses);
  breakdown.attackerBusinessMod = attackerMods.attackBonus;
  successRate += breakdown.attackerBusinessMod;
  
  // Defender business modifiers (only if NOT bypassing defenses)
  if (!attack.bypassDefenses) {
    const defenderMods = calculateBusinessModifiers(defenderBusinesses);
    breakdown.defenderBusinessMod = -defenderMods.defenseBonus;
    successRate += breakdown.defenderBusinessMod;
  }
  
  // Synergy effects
  if (attackerSynergyEffects?.attackSuccessBonus) {
    breakdown.attackerSynergyMod = attackerSynergyEffects.attackSuccessBonus / 100;
    successRate += breakdown.attackerSynergyMod;
  }
  
  // Defender synergy effects (only if NOT bypassing defenses)
  if (!attack.bypassDefenses && defenderSynergyEffects?.defenseBonus) {
    breakdown.defenderSynergyMod = -defenderSynergyEffects.defenseBonus / 100;
    successRate += breakdown.defenderSynergyMod;
  }
  
  // Clamp between 10% and 95%
  successRate = Math.max(0.1, Math.min(0.95, successRate));
  
  return { successRate, breakdown };
}

export function calculateWealthTheft(
  defenderWealth: number,
  attackSuccess: boolean,
  attackType: AttackType = 'STANDARD',
  attackerSynergyEffects?: { wealthTheftBonus?: number }
): { stolen: number; lost: number } {
  const attack = ATTACK_TYPES[attackType];
  
  if (!attackSuccess) {
    return { 
      stolen: 0, 
      lost: attack.currency === 'wealth' ? attack.cost : 15 // Attack cost + penalty
    };
  }
  
  const tier = getWealthTier(defenderWealth);
  const tierConfig = BATTLE_CONFIG.THEFT_RATES[tier];
  
  // Use attack type's max theft rate
  const baseTheftRate = Math.min(attack.maxWealthTheft, tierConfig.rate * 1.5);
  let theftAmount = Math.floor(defenderWealth * baseTheftRate);
  
  // Apply synergy wealth theft bonus
  if (attackerSynergyEffects?.wealthTheftBonus) {
    const synergyMultiplier = 1 + (attackerSynergyEffects.wealthTheftBonus / 100);
    theftAmount = Math.floor(theftAmount * synergyMultiplier);
  }
  
  // Apply attack type limits
  const maxTheftByType = Math.floor(defenderWealth * attack.maxWealthTheft);
  const stolen = Math.min(maxTheftByType, theftAmount);
  
  return { 
    stolen, 
    lost: attack.currency === 'wealth' ? attack.cost : 15
  };
}

export function checkRaidEligibility(
  attackerId: string,
  targetBattleState: BattleState,
  isLandOwner: boolean
): boolean {
  if (!isLandOwner) return false;
  
  const attackHistory = targetBattleState.consecutiveAttacksFrom[attackerId];
  if (!attackHistory) return false;
  
  const withinTimeWindow = Date.now() - attackHistory.lastAttack < BATTLE_CONFIG.RAID_TIME_WINDOW;
  return attackHistory.count >= BATTLE_CONFIG.RAID_ATTACKS_REQUIRED && withinTimeWindow;
}

export function calculateRaidYield(): number {
  return Math.floor(BATTLE_CONFIG.MONTHLY_LAND_YIELD * BATTLE_CONFIG.RAID_YIELD_PERCENTAGE);
}

export function isWithinAttackRange(attackerWealth: number, defenderWealth: number): boolean {
  const lowerBound = attackerWealth * 0.5;
  const upperBound = attackerWealth * 2.0;
  return defenderWealth >= lowerBound && defenderWealth <= upperBound;
}

export function canAttackTarget(
  attacker: { wealth: number; battleState: BattleState; creditBalance: number },
  defender: { wealth: number; battleState: BattleState },
  attackType: AttackType = 'STANDARD'
): { canAttack: boolean; reason?: string } {
  const attack = ATTACK_TYPES[attackType];
  
  // Check attack type cooldown
  const lastAttackKey = attack.id;
  const lastAttackTime = attacker.battleState.lastAttackByType?.[lastAttackKey] || 0;
  const timeSinceLastAttack = Date.now() - lastAttackTime;
  
  if (timeSinceLastAttack < attack.cooldown) {
    const minutesRemaining = Math.ceil((attack.cooldown - timeSinceLastAttack) / 1000 / 60);
    return { canAttack: false, reason: `${attack.name} cooldown: ${minutesRemaining} minutes remaining` };
  }
  
  // Check resources
  const hasResources = attack.currency === 'wealth' 
    ? attacker.wealth >= attack.cost
    : attacker.creditBalance >= attack.cost;
    
  if (!hasResources) {
    const resourceName = attack.currency === 'wealth' ? '$WEALTH' : 'credits';
    return { canAttack: false, reason: `Need ${attack.cost} ${resourceName} for ${attack.name}` };
  }
  
  // Check wealth range
  if (!isWithinAttackRange(attacker.wealth, defender.wealth)) {
    return { canAttack: false, reason: 'Target outside wealth range (±50%)' };
  }
  
  // Check defense immunity
  const timeSinceDefense = Date.now() - defender.battleState.lastDefenseTime;
  if (timeSinceDefense < BATTLE_CONFIG.DEFENSE_IMMUNITY) {
    const minutesRemaining = Math.ceil((BATTLE_CONFIG.DEFENSE_IMMUNITY - timeSinceDefense) / 1000 / 60);
    return { canAttack: false, reason: `Target has defense immunity: ${minutesRemaining} minutes` };
  }
  
  // Check shield
  if (defender.battleState.shieldExpiry > Date.now()) {
    const hoursRemaining = Math.ceil((defender.battleState.shieldExpiry - Date.now()) / 1000 / 60 / 60);
    return { canAttack: false, reason: `Target has shield: ${hoursRemaining} hours remaining` };
  }
  
  return { canAttack: true };
}
