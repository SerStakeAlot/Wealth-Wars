import { Asset } from './types';

// AdCap constants
export const OUTLET_BASE_COST_MULT = 1.15;    // geometric cost growth per outlet
export const DEFAULT_CYCLE_MS = 4000;         // 4s per cycle (alpha)
export const MILESTONES = [10, 25, 50, 100];  // thresholds for multipliers
export const MILESTONE_BONUS = 1.2;           // 20% profit boost per milestone

export function calculateAssetValue(assets: Asset[]): number {
  return assets.reduce((sum, asset) => sum + asset.yieldPerTick * asset.level, 0);
}

export function calculateRisk(assets: Asset[]): number {
  const avgCondition = assets.reduce((sum, a) => sum + a.condition, 0) / assets.length;
  return Math.round(100 - avgCondition);
}

export function getPriceInSol(token: string): number {
  // Stub: return price in SOL
  const prices: Record<string, number> = {
    'WEALTH': 0.01,
    'SOL': 1,
    'USDC': 0.02,
  };
  return prices[token] || 0.01;
}

// AdCap calculations
export function calculateProfitPerSecond(assets: Asset[]): number {
  return assets.reduce((sum, asset) => {
    const outlets = asset.outlets || 1;
    const multiplier = asset.multiplier || 1;
    const cycleMs = asset.cycleMs || DEFAULT_CYCLE_MS;
    const profitPerCycle = asset.yieldPerTick * outlets * multiplier;

    // Only count assets with managers or currently running cycles
    if (asset.managerHired || (asset.nextReadyTs && Date.now() < asset.nextReadyTs)) {
      return sum + (profitPerCycle / (cycleMs / 1000));
    }
    return sum;
  }, 0);
}

export function calculateOutletCost(asset: Asset, qty: number): number {
  const currentOutlets = asset.outlets || 1;
  const baseCost = asset.costPerOutlet || asset.upgradeCost * 0.1; // fallback
  let totalCost = 0;

  for (let i = 0; i < qty; i++) {
    totalCost += baseCost * Math.pow(OUTLET_BASE_COST_MULT, currentOutlets + i - 1);
  }

  return Math.round(totalCost);
}

export function calculateMultiplier(outlets: number, milestones: number[] = MILESTONES): number {
  let multiplier = 1;
  for (const milestone of milestones) {
    if (outlets >= milestone) {
      multiplier *= MILESTONE_BONUS;
    }
  }
  return multiplier;
}

export function getNextMilestone(outlets: number, milestones: number[] = MILESTONES): number | null {
  for (const milestone of milestones) {
    if (outlets < milestone) {
      return milestone;
    }
  }
  return null;
}
