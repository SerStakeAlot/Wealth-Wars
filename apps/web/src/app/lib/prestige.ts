import { Player, Derived } from './types';

export function prestigeFromBehavior(player: Player, derived: Derived): number {
  // Simple prestige calculation
  return Math.floor((player.level * player.wealth) / 1000) + derived.assetValue / 100;
}

export const CLAN_MIN_LEVEL = 10;
