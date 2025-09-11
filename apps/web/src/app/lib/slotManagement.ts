import { Player, ActiveSlot, SynergyBonus, BusinessSlotSystem } from './types';
import { ENHANCED_BUSINESSES } from './businesses';

// Slot progression based on work frequency
export const SLOT_LIMITS = {
  novice: 1,
  apprentice: 2,
  skilled: 3,
  expert: 4,
  master: 5
} as const;

// Synergy bonus calculations
export const SYNERGY_THRESHOLDS = {
  2: 25, // 2+ same category = +25%
  3: 50, // 3+ same category = +50%
  4: 75  // 4+ same category = +75%
} as const;

// Cooldown duration (4 hours in milliseconds)
export const SLOT_COOLDOWN_DURATION = 4 * 60 * 60 * 1000;

export function getMaxSlots(workFrequency: Player['workFrequency']): number {
  return SLOT_LIMITS[workFrequency];
}

export function canEditSlots(player: Player): boolean {
  const now = Date.now();
  return now >= player.businessSlots.slotManagement.slotCooldownUntil;
}

export function calculateSynergyBonuses(activeSlots: ActiveSlot[], enhancedBusinesses: string[]): SynergyBonus[] {
  // Get business categories for active slots
  const activeBusinesses = activeSlots
    .filter(slot => slot.businessId)
    .map(slot => slot.businessId!)
    .filter(businessId => enhancedBusinesses.includes(businessId));

  // Count businesses by category
  const categoryCounts: Record<string, number> = {};
  
  activeBusinesses.forEach(businessId => {
    const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
    if (business) {
      categoryCounts[business.category] = (categoryCounts[business.category] || 0) + 1;
    }
  });

  // Calculate synergy bonuses
  const bonuses: SynergyBonus[] = [];
  
  Object.entries(categoryCounts).forEach(([category, count]) => {
    if (count >= 2) {
      const bonus = count >= 4 ? 75 : count >= 3 ? 50 : 25;
      bonuses.push({
        category: category as any,
        count,
        bonus,
        description: `${count}x ${category} businesses: +${bonus}% effectiveness`
      });
    }
  });

  return bonuses;
}

export function calculateTotalSynergyMultiplier(synergyBonuses: SynergyBonus[]): number {
  // Sum all synergy bonuses (bonuses stack additively)
  const totalBonus = synergyBonuses.reduce((sum, bonus) => sum + bonus.bonus, 0);
  return 1 + (totalBonus / 100); // Convert percentage to multiplier
}

export function initializeSlotSystem(workFrequency: Player['workFrequency']): BusinessSlotSystem {
  const maxSlots = getMaxSlots(workFrequency);
  
  // Initialize empty slots
  const activeSlots: ActiveSlot[] = Array.from({ length: maxSlots }, (_, index) => ({
    slotId: index,
    businessId: null,
    activatedAt: 0
  }));

  return {
    slotManagement: {
      activeSlots,
      maxSlots,
      lastSlotChange: 0,
      slotCooldownUntil: 0,
      canEditSlots: true
    },
    synergyBonuses: [],
    totalSynergyMultiplier: 1.0
  };
}

export function updateSlotSystem(player: Player): BusinessSlotSystem {
  const { slotManagement } = player.businessSlots;
  
  // Recalculate synergy bonuses
  const synergyBonuses = calculateSynergyBonuses(
    slotManagement.activeSlots, 
    player.enhancedBusinesses || []
  );
  
  const totalSynergyMultiplier = calculateTotalSynergyMultiplier(synergyBonuses);
  
  // Update max slots based on current work frequency
  const maxSlots = getMaxSlots(player.workFrequency);
  
  // Check if can edit slots
  const canEditSlotsNow = canEditSlots(player);

  return {
    slotManagement: {
      ...slotManagement,
      maxSlots,
      canEditSlots: canEditSlotsNow
    },
    synergyBonuses,
    totalSynergyMultiplier
  };
}

export function assignBusinessToSlot(
  player: Player, 
  businessId: string, 
  slotId: number
): { success: boolean; message: string; updatedSlots?: ActiveSlot[] } {
  
  // Check cooldown
  if (!canEditSlots(player)) {
    const remainingTime = Math.ceil((player.businessSlots.slotManagement.slotCooldownUntil - Date.now()) / (60 * 1000));
    return {
      success: false,
      message: `Slot cooldown active. ${remainingTime} minutes remaining.`
    };
  }

  // Check if player owns the business
  if (!player.enhancedBusinesses?.includes(businessId)) {
    return {
      success: false,
      message: "You don't own this business."
    };
  }

  // Check if slot exists
  const { activeSlots } = player.businessSlots.slotManagement;
  if (slotId >= activeSlots.length) {
    return {
      success: false,
      message: "Invalid slot ID."
    };
  }

  // If business already active in another slot, swap them (replace target slot's business into old slot or just move existing?)
  const existingSlot = activeSlots.find(slot => slot.businessId === businessId);
  let updatedSlots: ActiveSlot[] = [...activeSlots];

  if (existingSlot && existingSlot.slotId !== slotId) {
    // Move business to requested slot, clear old slot
    updatedSlots = updatedSlots.map(slot => {
      if (slot.slotId === slotId) {
        return { ...slot, businessId, activatedAt: Date.now() };
      }
      if (slot.slotId === existingSlot.slotId) {
        return { ...slot, businessId: null, activatedAt: 0 };
      }
      return slot;
    });
  } else {
    // Replace whatever is in the destination slot
    updatedSlots = updatedSlots.map(slot => 
      slot.slotId === slotId 
        ? { ...slot, businessId, activatedAt: Date.now() }
        : slot
    );
  }

  return {
    success: true,
    message: "Business assigned to slot successfully.",
    updatedSlots
  };
}

export function removeBusinessFromSlot(
  player: Player,
  slotId: number
): { success: boolean; message: string; updatedSlots?: ActiveSlot[] } {
  
  // Check cooldown
  if (!canEditSlots(player)) {
    const remainingTime = Math.ceil((player.businessSlots.slotManagement.slotCooldownUntil - Date.now()) / (60 * 1000));
    return {
      success: false,
      message: `Slot cooldown active. ${remainingTime} minutes remaining.`
    };
  }

  const { activeSlots } = player.businessSlots.slotManagement;
  
  // Check if slot exists
  if (slotId >= activeSlots.length) {
    return {
      success: false,
      message: "Invalid slot ID."
    };
  }

  // Remove business from slot
  const updatedSlots = activeSlots.map(slot =>
    slot.slotId === slotId
      ? { ...slot, businessId: null, activatedAt: 0 }
      : slot
  );

  return {
    success: true,
    message: "Business removed from slot successfully.",
    updatedSlots
  };
}
