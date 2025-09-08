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
}

export interface AttackResult {
  success: boolean;
  wealthStolen: number;
  wealthLost: number;
  counterAttack: boolean;
  raidTriggered: boolean;
  message: string;
  finalSuccessRate: number;
}

export const BATTLE_CONFIG = {
  ATTACK_COST: 10, // credits
  BASE_SUCCESS_RATE: 0.6,
  ATTACK_COOLDOWN: 4 * 60 * 60 * 1000, // 4 hours
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
  
  // Protection Costs
  LAND_SHIELD_COST: 500, // $WEALTH
  LAND_SHIELD_DURATION: 72 * 60 * 60 * 1000, // 72 hours
  ALLIANCE_DEFENSE_COST: 100, // $WEALTH
  TRIBUTE_COST: 200, // $WEALTH
  TRIBUTE_DURATION: 48 * 60 * 60 * 1000, // 48 hours
  
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
  defenderBusinesses: string[]
): { successRate: number; breakdown: any } {
  let successRate = BATTLE_CONFIG.BASE_SUCCESS_RATE;
  
  const breakdown = {
    base: BATTLE_CONFIG.BASE_SUCCESS_RATE,
    attackerWealthMod: 0,
    defenderWealthMod: 0,
    attackerBusinessMod: 0,
    defenderBusinessMod: 0
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
  const defenderMods = calculateBusinessModifiers(defenderBusinesses);
  
  breakdown.attackerBusinessMod = attackerMods.attackBonus;
  breakdown.defenderBusinessMod = -defenderMods.defenseBonus;
  
  successRate += breakdown.attackerBusinessMod;
  successRate += breakdown.defenderBusinessMod;
  
  // Clamp between 10% and 95%
  successRate = Math.max(0.1, Math.min(0.95, successRate));
  
  return { successRate, breakdown };
}

export function calculateWealthTheft(
  defenderWealth: number,
  attackSuccess: boolean
): { stolen: number; lost: number } {
  if (!attackSuccess) {
    return { stolen: 0, lost: BATTLE_CONFIG.ATTACK_COST + 5 }; // Attack cost + penalty
  }
  
  const tier = getWealthTier(defenderWealth);
  const tierConfig = BATTLE_CONFIG.THEFT_RATES[tier];
  
  const theftAmount = Math.floor(defenderWealth * tierConfig.rate);
  const stolen = Math.min(tierConfig.maxTheft, theftAmount);
  
  return { stolen, lost: BATTLE_CONFIG.ATTACK_COST }; // Just attack cost
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
  defender: { wealth: number; battleState: BattleState }
): { canAttack: boolean; reason?: string } {
  // Check cooldown
  const timeSinceLastAttack = Date.now() - attacker.battleState.lastAttackTime;
  if (timeSinceLastAttack < BATTLE_CONFIG.ATTACK_COOLDOWN) {
    const minutesRemaining = Math.ceil((BATTLE_CONFIG.ATTACK_COOLDOWN - timeSinceLastAttack) / 1000 / 60);
    return { canAttack: false, reason: `Cooldown: ${minutesRemaining} minutes remaining` };
  }
  
  // Check credits
  if (attacker.creditBalance < BATTLE_CONFIG.ATTACK_COST) {
    return { canAttack: false, reason: `Need ${BATTLE_CONFIG.ATTACK_COST} credits to attack` };
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
