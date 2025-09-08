import React from 'react';
import { useGame } from '../app/lib/store';
import { BusinessSynergy } from '../app/lib/synergies';

interface SynergyDisplayProps {
  className?: string;
}

export const SynergyDisplay: React.FC<SynergyDisplayProps> = ({ className = '' }) => {
  const { getActiveSynergies, getSynergyEffects, getSynergyProgress } = useGame();
  
  const activeSynergies = getActiveSynergies();
  const synergyEffects = getSynergyEffects();
  const synergyProgress = getSynergyProgress();

  if (activeSynergies.length === 0 && synergyProgress.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center">
        <span className="mr-2">⚡</span>
        Business Alliance Synergies
      </h3>
      
      {/* Active Synergies */}
      {activeSynergies.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-purple-200 mb-2">Active Bonuses:</h4>
          <div className="space-y-2">
            {activeSynergies.map((synergy: BusinessSynergy, index: number) => (
              <div key={index} className="bg-purple-800/20 rounded px-3 py-2">
                <div className="font-medium text-purple-100">{synergy.name}</div>
                <div className="text-xs text-purple-300">{synergy.description}</div>
                <div className="text-xs text-green-400 mt-1">
                  {(synergy.effects.workMultiplierBonus || 0) > 0 && `+${synergy.effects.workMultiplierBonus}% Work Credits • `}
                  {(synergy.effects.attackSuccessBonus || 0) > 0 && `+${synergy.effects.attackSuccessBonus}% Attack Success • `}
                  {(synergy.effects.defenseBonus || 0) > 0 && `+${synergy.effects.defenseBonus}% Defense • `}
                  {(synergy.effects.wealthTheftBonus || 0) > 0 && `+${synergy.effects.wealthTheftBonus}% Wealth Theft • `}
                  {(synergy.effects.dailyWealthBonus || 0) > 0 && `+${synergy.effects.dailyWealthBonus}% Daily Wealth`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Combined Effects Summary */}
      {(synergyEffects.workMultiplierBonus > 0 || synergyEffects.attackSuccessBonus > 0 || 
        synergyEffects.defenseBonus > 0 || synergyEffects.wealthTheftBonus > 0 || 
        synergyEffects.dailyWealthBonus > 0) && (
        <div className="mb-4 bg-green-900/20 border border-green-500/30 rounded px-3 py-2">
          <h4 className="text-sm font-semibold text-green-200 mb-1">Total Alliance Bonuses:</h4>
          <div className="text-sm text-green-300">
            {synergyEffects.workMultiplierBonus > 0 && (
              <div>Work Credits: +{synergyEffects.workMultiplierBonus}%</div>
            )}
            {synergyEffects.attackSuccessBonus > 0 && (
              <div>Attack Success: +{synergyEffects.attackSuccessBonus}%</div>
            )}
            {synergyEffects.defenseBonus > 0 && (
              <div>Defense: +{synergyEffects.defenseBonus}%</div>
            )}
            {synergyEffects.wealthTheftBonus > 0 && (
              <div>Wealth Theft: +{synergyEffects.wealthTheftBonus}%</div>
            )}
            {synergyEffects.dailyWealthBonus > 0 && (
              <div>Daily Wealth: +{synergyEffects.dailyWealthBonus}%</div>
            )}
          </div>
        </div>
      )}

      {/* Progress to Next Synergies */}
      {synergyProgress.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-blue-200 mb-2">Available Alliances:</h4>
          {synergyProgress.slice(0, 3).map((progress, index) => (
            <div key={index} className="bg-blue-900/20 border border-blue-500/30 rounded px-3 py-2">
              <div className="text-sm text-blue-300">
                <div className="font-medium">{progress.synergy.name}</div>
                <div className="text-xs mb-2">{progress.synergy.description}</div>
                <div className="text-xs">
                  Progress: {progress.progress}
                </div>
                {progress.missingRequirements.length > 0 && (
                  <div className="text-xs text-orange-300 mt-1">
                    Still need: {progress.missingRequirements.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
