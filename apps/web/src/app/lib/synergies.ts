import { ENHANCED_BUSINESSES } from './businesses';

export interface BusinessSynergy {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requiredCategories: string[];
  minBusinesses: number;
  effects: {
    workMultiplierBonus?: number;
    attackSuccessBonus?: number;
    defenseBonus?: number;
    wealthTheftBonus?: number;
    dailyWealthBonus?: number;
    counterAttackBonus?: number;
    wealthLossReduction?: number;
  };
  priority: number; // Higher priority synergies override lower ones
}

export const BUSINESS_SYNERGIES: BusinessSynergy[] = [
  {
    id: 'defensive_alliance',
    name: 'Defensive Alliance',
    description: 'Multiple defensive businesses create an impenetrable fortress. Enhances counter-attacks and reduces wealth loss.',
    emoji: '🛡️',
    requiredCategories: ['defensive'],
    minBusinesses: 2,
    effects: {
      counterAttackBonus: 15, // +15% counter-attack damage
      wealthLossReduction: 25, // -25% wealth loss on failed defense
      defenseBonus: 10 // +10% defense rating
    },
    priority: 2
  },
  {
    id: 'offensive_coalition',
    name: 'Offensive Coalition',
    description: 'Coordinated offensive businesses form a powerful raiding force. Increases attack success and wealth theft.',
    emoji: '⚔️',
    requiredCategories: ['offensive'],
    minBusinesses: 2,
    effects: {
      attackSuccessBonus: 20, // +20% attack success rate
      wealthTheftBonus: 15 // +15% wealth stolen per attack
    },
    priority: 2
  },
  {
    id: 'efficiency_network',
    name: 'Efficiency Network',
    description: 'Interconnected efficiency businesses optimize all operations. Boosts work output significantly.',
    emoji: '⚡',
    requiredCategories: ['efficiency'],
    minBusinesses: 2,
    effects: {
      workMultiplierBonus: 25 // +25% additional credits per work
    },
    priority: 2
  },
  {
    id: 'economic_empire',
    name: 'Economic Empire',
    description: 'A diversified utility empire generates passive wealth through market dominance and strategic positioning.',
    emoji: '💰',
    requiredCategories: ['utility'],
    minBusinesses: 3,
    effects: {
      dailyWealthBonus: 2, // +2 $WEALTH per day passive income
      workMultiplierBonus: 15 // +15% work efficiency
    },
    priority: 3
  },
  {
    id: 'complete_monopoly',
    name: 'Complete Monopoly',
    description: 'Total market domination across all business sectors. Massive bonuses to all activities.',
    emoji: '👑',
    requiredCategories: ['efficiency', 'defensive', 'offensive', 'utility'],
    minBusinesses: 4, // At least one from each category
    effects: {
      workMultiplierBonus: 40,
      attackSuccessBonus: 25,
      defenseBonus: 25,
      dailyWealthBonus: 5,
      counterAttackBonus: 30,
      wealthTheftBonus: 20
    },
    priority: 5 // Highest priority - overrides all others
  }
];

export function calculateActiveSynergies(ownedBusinessIds: string[]): BusinessSynergy[] {
  const ownedBusinesses = ownedBusinessIds
    .map(id => ENHANCED_BUSINESSES.find(b => b.id === id))
    .filter(Boolean);

  const activeSynergies: BusinessSynergy[] = [];

  for (const synergy of BUSINESS_SYNERGIES) {
    const isActive = checkSynergyRequirements(synergy, ownedBusinesses);
    if (isActive) {
      activeSynergies.push(synergy);
    }
  }

  // Sort by priority (highest first) to ensure proper override behavior
  return activeSynergies.sort((a, b) => b.priority - a.priority);
}

function checkSynergyRequirements(synergy: BusinessSynergy, ownedBusinesses: any[]): boolean {
  const categoryCount: Record<string, number> = {};
  
  // Count businesses in each category
  ownedBusinesses.forEach(business => {
    if (business && business.category) {
      categoryCount[business.category] = (categoryCount[business.category] || 0) + 1;
    }
  });

  // Check if we meet the requirements
  for (const requiredCategory of synergy.requiredCategories) {
    const requiredCount = synergy.requiredCategories.length === 1 
      ? synergy.minBusinesses 
      : Math.ceil(synergy.minBusinesses / synergy.requiredCategories.length);
      
    if ((categoryCount[requiredCategory] || 0) < requiredCount) {
      return false;
    }
  }

  // Special case for complete monopoly - need at least one from each category
  if (synergy.id === 'complete_monopoly') {
    return synergy.requiredCategories.every(category => (categoryCount[category] || 0) >= 1);
  }

  return true;
}

export function calculateSynergyEffects(activeSynergies: BusinessSynergy[]) {
  const totalEffects = {
    workMultiplierBonus: 0,
    attackSuccessBonus: 0,
    defenseBonus: 0,
    wealthTheftBonus: 0,
    dailyWealthBonus: 0,
    counterAttackBonus: 0,
    wealthLossReduction: 0
  };

  // Apply effects from highest priority synergy first
  // Lower priority synergies don't stack if they affect the same stat
  const appliedEffects = new Set<string>();

  for (const synergy of activeSynergies) {
    Object.entries(synergy.effects).forEach(([effectType, value]) => {
      if (value && value > 0) {
        const effectKey = `${effectType}_${synergy.priority}`;
        
        // Only apply if this effect type hasn't been applied by a higher priority synergy
        const hasHigherPriority = activeSynergies.some(s => 
          s.priority > synergy.priority && 
          s.effects[effectType as keyof typeof s.effects]
        );

        if (!hasHigherPriority) {
          totalEffects[effectType as keyof typeof totalEffects] += value;
        }
      }
    });
  }

  return totalEffects;
}

export function getSynergyProgressTowardsNext(ownedBusinessIds: string[]): Array<{
  synergy: BusinessSynergy;
  progress: string;
  missingRequirements: string[];
}> {
  const ownedBusinesses = ownedBusinessIds
    .map(id => ENHANCED_BUSINESSES.find(b => b.id === id))
    .filter(Boolean);

  const categoryCount: Record<string, number> = {};
  ownedBusinesses.forEach(business => {
    if (business && business.category) {
      categoryCount[business.category] = (categoryCount[business.category] || 0) + 1;
    }
  });

  const progress: Array<{
    synergy: BusinessSynergy;
    progress: string;
    missingRequirements: string[];
  }> = [];

  for (const synergy of BUSINESS_SYNERGIES) {
    const isActive = checkSynergyRequirements(synergy, ownedBusinesses);
    if (!isActive) {
      const missing: string[] = [];
      let totalRequired = 0;
      let totalOwned = 0;

      for (const category of synergy.requiredCategories) {
        const requiredForCategory = synergy.requiredCategories.length === 1 
          ? synergy.minBusinesses 
          : Math.ceil(synergy.minBusinesses / synergy.requiredCategories.length);
          
        const ownedForCategory = categoryCount[category] || 0;
        totalRequired += requiredForCategory;
        totalOwned += Math.min(ownedForCategory, requiredForCategory);

        if (ownedForCategory < requiredForCategory) {
          const needed = requiredForCategory - ownedForCategory;
          missing.push(`${needed} more ${category} business${needed > 1 ? 'es' : ''}`);
        }
      }

      // Special handling for complete monopoly
      if (synergy.id === 'complete_monopoly') {
        const missingCategories = synergy.requiredCategories.filter(cat => (categoryCount[cat] || 0) === 0);
        if (missingCategories.length > 0) {
          missing.length = 0; // Clear existing
          missing.push(`Need businesses from: ${missingCategories.join(', ')}`);
        }
        totalRequired = 4;
        totalOwned = synergy.requiredCategories.filter(cat => (categoryCount[cat] || 0) > 0).length;
      }

      const progressPercent = Math.floor((totalOwned / totalRequired) * 100);
      progress.push({
        synergy,
        progress: `${progressPercent}% (${totalOwned}/${totalRequired})`,
        missingRequirements: missing
      });
    }
  }

  return progress.sort((a, b) => {
    // Sort by completion percentage (closer to completion first)
    const aPercent = parseInt(a.progress.split('%')[0]);
    const bPercent = parseInt(b.progress.split('%')[0]);
    return bPercent - aPercent;
  });
}
