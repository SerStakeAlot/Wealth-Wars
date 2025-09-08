import { BusinessCondition, MaintenanceAction, MaintenanceNotification, MaintenanceRecord, EnhancedBusiness } from './types';
import { calculateSynergyEffects, calculateActiveSynergies } from './synergies';

// Maintenance action definitions
export const MAINTENANCE_ACTIONS: Record<string, MaintenanceAction> = {
  routine: {
    type: 'routine',
    name: 'Routine Maintenance',
    costMultiplier: 0.08, // 8% of business value (reduced from 15%)
    conditionRestored: 25,
    duration: 2, // 2 hours offline
    preventsDegradation: 3, // 3 days slower degradation
    description: 'Basic upkeep and minor repairs to keep things running smoothly'
  },
  major: {
    type: 'major',
    name: 'Major Overhaul',
    costMultiplier: 0.20, // 20% of business value (reduced from 40%)
    conditionRestored: 60,
    duration: 8, // 8 hours offline
    preventsDegradation: 7, // 1 week slower degradation
    description: 'Comprehensive repairs and system updates to restore peak performance'
  },
  upgrade: {
    type: 'upgrade',
    name: 'Technology Upgrade',
    costMultiplier: 0.35, // 35% of business value (reduced from 75%)
    conditionRestored: 100,
    duration: 24, // 24 hours offline
    preventsDegradation: 14, // 2 weeks slower degradation
    upgradeBonus: 0.10, // +10% permanent efficiency
    description: 'Latest technology and equipment upgrades for permanent improvements'
  },
  emergency: {
    type: 'emergency',
    name: 'Emergency Repair',
    costMultiplier: 1.0, // 100% of business value (reduced from 200%)
    conditionRestored: 30,
    duration: 0, // Instant repair
    preventsDegradation: 0,
    description: 'Quick emergency fix to get business running immediately'
  }
};

// Calculate degradation rates based on business category
export const getDegradationRate = (business: EnhancedBusiness): number => {
  const baseRates = {
    efficiency: 2.5, // High-tech needs frequent maintenance
    offensive: 3.5,  // Aggressive tactics wear down quickly
    defensive: 1.5,  // Security systems are built to last
    utility: 2.0    // Moderate degradation
  };
  
  const tierMultipliers = {
    basic: 1.0,
    advanced: 1.2,
    premium: 1.4,
    legendary: 1.6 // More complex = more maintenance needed
  };
  
  return baseRates[business.category] * tierMultipliers[business.tier];
};

// Calculate efficiency multiplier based on condition
export const getEfficiencyMultiplier = (condition: number): number => {
  if (condition >= 80) return 1.0;   // 100-80%: Full performance
  if (condition >= 60) return 0.95;  // 79-60%: 95% efficiency
  if (condition >= 40) return 0.85;  // 59-40%: 85% efficiency  
  if (condition >= 20) return 0.70;  // 39-20%: 70% efficiency
  if (condition > 0) return 0.50;    // 19-1%: 50% efficiency
  return 0.0; // 0%: Broken - no performance
};

// Get warning level based on condition
export const getWarningLevel = (condition: number): 'good' | 'caution' | 'critical' | 'broken' => {
  if (condition >= 60) return 'good';
  if (condition >= 40) return 'caution';
  if (condition > 0) return 'critical';
  return 'broken';
};

// Calculate maintenance cost for a business with progressive scaling and synergy discounts
export const calculateMaintenanceCost = (
  business: EnhancedBusiness, 
  actionType: keyof typeof MAINTENANCE_ACTIONS,
  ownedBusinessIds?: string[]
): number => {
  const action = MAINTENANCE_ACTIONS[actionType];
  
  // Progressive scaling to make expensive businesses less punishing to maintain
  // This encourages synergy building by making multiple businesses affordable
  let scalingFactor = 1.0;
  if (business.cost > 100) {
    scalingFactor = 0.8; // 20% discount for premium businesses
  } else if (business.cost > 50) {
    scalingFactor = 0.9; // 10% discount for mid-tier businesses
  }
  
  // Alliance synergy discount - owning multiple businesses for synergies reduces maintenance overhead
  let synergyDiscount = 1.0;
  if (ownedBusinessIds && ownedBusinessIds.length > 0) {
    const activeSynergies = calculateActiveSynergies(ownedBusinessIds);
    if (activeSynergies.length > 0) {
      // 5% discount per active synergy (max 25% for Complete Monopoly)
      const discountPercent = Math.min(25, activeSynergies.length * 5);
      synergyDiscount = 1 - (discountPercent / 100);
    }
  }
  
  const baseCost = business.cost * action.costMultiplier * scalingFactor * synergyDiscount;
  return Math.floor(Math.max(1, baseCost)); // Minimum 1 credit cost
};

// Initialize business condition when first purchased
export const initializeBusinessCondition = (business: EnhancedBusiness): BusinessCondition => {
  const degradationRate = getDegradationRate(business);
  
  return {
    businessId: business.id,
    condition: 100, // Start in perfect condition
    lastMaintained: Date.now(),
    degradationRate,
    maintenanceCost: calculateMaintenanceCost(business, 'routine'),
    efficiencyMultiplier: 1.0,
    warningLevel: 'good',
    maintenanceHistory: [],
    isOffline: false,
    upgradeBonus: 0
  };
};

// Process degradation for all businesses
export const processDegradation = (businessConditions: Record<string, BusinessCondition>, lastCheck: number): Record<string, BusinessCondition> => {
  const now = Date.now();
  const hoursSinceLastCheck = (now - lastCheck) / (1000 * 60 * 60);
  const daysSinceLastCheck = hoursSinceLastCheck / 24;
  
  const updated: Record<string, BusinessCondition> = {};
  
  Object.entries(businessConditions).forEach(([businessId, condition]) => {
    if (condition.isOffline && condition.offlineUntil && now >= condition.offlineUntil) {
      // Business is back online after maintenance
      condition.isOffline = false;
      condition.offlineUntil = undefined;
    }
    
    if (!condition.isOffline && condition.condition > 0) {
      // Calculate degradation (slower if recently maintained)
      const daysSinceLastMaintained = (now - condition.lastMaintained) / (1000 * 60 * 60 * 24);
      const degradationMultiplier = daysSinceLastMaintained > 7 ? 1.0 : 0.5; // Slower degradation for first week after maintenance
      
      const degradationAmount = condition.degradationRate * daysSinceLastCheck * degradationMultiplier;
      const newCondition = Math.max(0, condition.condition - degradationAmount);
      
      updated[businessId] = {
        ...condition,
        condition: newCondition,
        efficiencyMultiplier: getEfficiencyMultiplier(newCondition),
        warningLevel: getWarningLevel(newCondition)
      };
    } else {
      updated[businessId] = condition;
    }
  });
  
  return updated;
};

// Perform maintenance on a business
export const performMaintenance = (
  businessCondition: BusinessCondition, 
  business: EnhancedBusiness, 
  actionType: keyof typeof MAINTENANCE_ACTIONS,
  ownedBusinessIds?: string[]
): { updatedCondition: BusinessCondition; cost: number; record: MaintenanceRecord } => {
  const action = MAINTENANCE_ACTIONS[actionType];
  const cost = calculateMaintenanceCost(business, actionType, ownedBusinessIds);
  const now = Date.now();
  
  const conditionBefore = businessCondition.condition;
  const newCondition = Math.min(100, businessCondition.condition + action.conditionRestored);
  
  const record: MaintenanceRecord = {
    id: `maintenance_${now}`,
    timestamp: now,
    type: action.type,
    cost,
    conditionBefore,
    conditionAfter: newCondition,
    downtime: action.duration,
    description: action.description
  };
  
  const updatedCondition: BusinessCondition = {
    ...businessCondition,
    condition: newCondition,
    lastMaintained: now,
    efficiencyMultiplier: getEfficiencyMultiplier(newCondition),
    warningLevel: getWarningLevel(newCondition),
    maintenanceHistory: [...businessCondition.maintenanceHistory, record],
    isOffline: action.duration > 0,
    offlineUntil: action.duration > 0 ? now + (action.duration * 60 * 60 * 1000) : undefined,
    upgradeBonus: actionType === 'upgrade' 
      ? businessCondition.upgradeBonus + (action.upgradeBonus || 0)
      : businessCondition.upgradeBonus
  };
  
  return { updatedCondition, cost, record };
};

// Generate maintenance notifications
export const generateMaintenanceNotifications = (
  businessConditions: Record<string, BusinessCondition>,
  businesses: Record<string, EnhancedBusiness>
): MaintenanceNotification[] => {
  const notifications: MaintenanceNotification[] = [];
  const now = Date.now();
  
  Object.entries(businessConditions).forEach(([businessId, condition]) => {
    const business = businesses[businessId];
    if (!business) return;
    
    if (condition.warningLevel === 'broken') {
      notifications.push({
        id: `broken_${businessId}_${now}`,
        businessId,
        businessName: business.name,
        type: 'broken',
        message: `💥 ${business.name} has broken down completely!`,
        action: 'Major repair required before it can operate again',
        timestamp: now,
        dismissed: false
      });
    } else if (condition.warningLevel === 'critical') {
      notifications.push({
        id: `critical_${businessId}_${now}`,
        businessId,
        businessName: business.name,
        type: 'critical',
        message: `🚨 ${business.name} in critical condition (${Math.floor(condition.condition)}%)`,
        action: 'Emergency repair recommended to prevent breakdown',
        timestamp: now,
        dismissed: false
      });
    } else if (condition.warningLevel === 'caution') {
      notifications.push({
        id: `warning_${businessId}_${now}`,
        businessId,
        businessName: business.name,
        type: 'warning',
        message: `🔧 ${business.name} needs maintenance (${Math.floor(condition.condition)}% condition)`,
        action: 'Schedule routine maintenance to prevent efficiency loss',
        timestamp: now,
        dismissed: false
      });
    }
    
    // Maintenance completion notification
    if (condition.isOffline && condition.offlineUntil && now >= condition.offlineUntil) {
      notifications.push({
        id: `complete_${businessId}_${now}`,
        businessId,
        businessName: business.name,
        type: 'maintenance_complete',
        message: `✅ ${business.name} maintenance completed successfully`,
        action: 'Business is back online and operating at peak efficiency',
        timestamp: now,
        dismissed: false
      });
    }
  });
  
  return notifications;
};

// Calculate total portfolio maintenance cost
export const calculatePortfolioMaintenanceCost = (
  businessConditions: Record<string, BusinessCondition>,
  businesses: Record<string, EnhancedBusiness>,
  actionType: keyof typeof MAINTENANCE_ACTIONS = 'routine',
  ownedBusinessIds?: string[]
): number => {
  return Object.entries(businessConditions).reduce((total, [businessId, condition]) => {
    const business = businesses[businessId];
    if (!business || condition.warningLevel === 'good') return total;
    
    return total + calculateMaintenanceCost(business, actionType, ownedBusinessIds);
  }, 0);
};

// Get maintenance recommendations
export const getMaintenanceRecommendations = (
  businessConditions: Record<string, BusinessCondition>,
  businesses: Record<string, EnhancedBusiness>,
  availableBudget: number,
  ownedBusinessIds?: string[]
): Array<{businessId: string; businessName: string; action: MaintenanceAction; cost: number; priority: number}> => {
  const recommendations: Array<{businessId: string; businessName: string; action: MaintenanceAction; cost: number; priority: number}> = [];
  
  Object.entries(businessConditions).forEach(([businessId, condition]) => {
    const business = businesses[businessId];
    if (!business) return;
    
    let recommendedAction: keyof typeof MAINTENANCE_ACTIONS;
    let priority = 0;
    
    if (condition.warningLevel === 'broken') {
      recommendedAction = 'major';
      priority = 100; // Highest priority
    } else if (condition.warningLevel === 'critical') {
      recommendedAction = 'emergency';
      priority = 80;
    } else if (condition.warningLevel === 'caution') {
      recommendedAction = 'routine';
      priority = 60;
    } else if (condition.condition < 90 && condition.upgradeBonus < 0.2) {
      recommendedAction = 'upgrade';
      priority = 40; // Enhancement opportunity
    } else {
      return; // No maintenance needed
    }
    
    const cost = calculateMaintenanceCost(business, recommendedAction, ownedBusinessIds);
    if (cost <= availableBudget) {
      recommendations.push({
        businessId,
        businessName: business.name,
        action: MAINTENANCE_ACTIONS[recommendedAction],
        cost,
        priority
      });
    }
  });
  
  return recommendations.sort((a, b) => b.priority - a.priority);
};
