import React, { useState } from 'react';
import { ATTACK_TYPES, SHIELD_TYPES, AttackType, ShieldType } from '../app/lib/battle-system';

export const BattleCenterNew: React.FC = () => {
  const [selectedAttackType, setSelectedAttackType] = useState<AttackType>('STANDARD');
  const [selectedShieldType, setSelectedShieldType] = useState<ShieldType>('BASIC');
  const [targetId, setTargetId] = useState('');

  const selectedAttack = ATTACK_TYPES[selectedAttackType];
  const selectedShield = SHIELD_TYPES[selectedShieldType];

  return (
    <div className="p-6 bg-gray-900 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">⚔️ Wealth Wars Battle System</h1>
      
      {/* Attack Types */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-orange-400">Attack Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(ATTACK_TYPES).map(([key, attack]) => (
            <button
              key={key}
              onClick={() => setSelectedAttackType(key as AttackType)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedAttackType === key
                  ? 'border-orange-400 bg-orange-400/20'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="font-bold text-lg mb-2">{attack.name}</div>
              <div className="text-sm text-gray-300 mb-3">{attack.description}</div>
              <div className="space-y-1 text-sm">
                <div className="text-yellow-400">
                  💰 Cost: {attack.cost} {attack.currency === 'wealth' ? '$WEALTH' : 'credits'}
                </div>
                <div className="text-blue-400">
                  ⏰ Cooldown: {attack.cooldown / (1000 * 60 * 60)}h
                </div>
                <div className="text-green-400">
                  📈 Max Theft: {Math.round(attack.maxWealthTheft * 100)}%
                </div>
                {attack.bypassDefenses && (
                  <div className="text-red-400 font-semibold">🛡️ Bypasses Defenses</div>
                )}
                {attack.canTriggerLandRaid && (
                  <div className="text-purple-400 font-semibold">🏗️ Can Trigger Land Raids</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Attack Details */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold mb-2 text-red-400">Selected: {selectedAttack.name}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Cost:</strong> {selectedAttack.cost} {selectedAttack.currency === 'wealth' ? '$WEALTH' : 'credits'}
          </div>
          <div>
            <strong>Cooldown:</strong> {selectedAttack.cooldown / (1000 * 60 * 60)} hours
          </div>
          <div>
            <strong>Max Wealth Theft:</strong> {Math.round(selectedAttack.maxWealthTheft * 100)}%
          </div>
          <div>
            <strong>Bypasses Defenses:</strong> {selectedAttack.bypassDefenses ? 'Yes' : 'No'}
          </div>
        </div>
        
        {selectedAttack.bypassDefenses && (
          <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded">
            <div className="text-red-300 font-semibold">⚔️ Defense Bypass Effect:</div>
            <div className="text-sm text-red-200 mt-1">
              This attack ignores Security Firm (-20% defense), Insurance Company (-10% defense), 
              and all Defensive Alliance synergies. Only wealth tier modifiers and attacker bonuses apply.
            </div>
          </div>
        )}
      </div>

      {/* Shield Types */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400">Shield Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(SHIELD_TYPES).map(([key, shield]) => (
            <button
              key={key}
              onClick={() => setSelectedShieldType(key as ShieldType)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedShieldType === key
                  ? 'border-blue-400 bg-blue-400/20'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="font-bold text-lg mb-2">{shield.name}</div>
              <div className="text-sm text-gray-300 mb-3">{shield.description}</div>
              <div className="space-y-1 text-sm">
                <div className="text-yellow-400">
                  💰 Cost: {shield.cost} $WEALTH
                </div>
                <div className="text-blue-400">
                  🛡️ Duration: {shield.duration / (1000 * 60 * 60)}h
                </div>
                <div className="text-green-400">
                  ⚡ Protection: Complete immunity
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cost Comparison */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-purple-400">💡 Strategic Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Attack Economics */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-300 mb-3">Attack Economics</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Standard Attack:</strong> 15 credits (~1.5 work sessions)</div>
              <div><strong>Wealth Assault:</strong> 10 $WEALTH (~800 credits of work)</div>
              <div><strong>Land Siege:</strong> 25 $WEALTH (~2000 credits of work)</div>
              <div className="pt-2 border-t border-gray-700">
                <div className="text-yellow-300">
                  💡 Wealth Assault ROI: Attack 100 $WEALTH target for potential 25 $WEALTH gain
                </div>
              </div>
            </div>
          </div>

          {/* Defense Economics */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">Defense Economics</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Basic Shield:</strong> 25 $WEALTH (24h protection)</div>
              <div><strong>Advanced Shield:</strong> 50 $WEALTH (48h protection)</div>
              <div><strong>Elite Shield:</strong> 100 $WEALTH (72h protection)</div>
              <div className="pt-2 border-t border-gray-700">
                <div className="text-blue-300">
                  💡 Elite Shield = 4 Wealth Assaults blocked
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Scenarios */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-green-400">🎯 Battle Scenarios</h2>
        
        <div className="space-y-4 text-sm">
          <div className="p-3 bg-gray-700 rounded">
            <div className="font-semibold text-orange-300">Scenario 1: Fort Knox vs Whale</div>
            <div className="mt-1 text-gray-300">
              Defender: Security Firm + Insurance + Defensive Alliance = -45% to Standard Attacks (15% success rate)
            </div>
            <div className="mt-1 text-red-300">
              Attacker uses Wealth Assault: Bypasses all defenses = 60% base success rate
            </div>
          </div>
          
          <div className="p-3 bg-gray-700 rounded">
            <div className="font-semibold text-blue-300">Scenario 2: Economic vs Strategic</div>
            <div className="mt-1 text-gray-300">
              Economic Player: High $WEALTH, few defenses → vulnerable to Standard Attacks but can afford Wealth Assaults
            </div>
            <div className="mt-1 text-blue-300">
              Strategic Player: Lower $WEALTH, defensive build → strong vs Standard, vulnerable to premium attacks
            </div>
          </div>
          
          <div className="p-3 bg-gray-700 rounded">
            <div className="font-semibold text-purple-300">Scenario 3: Land NFT Warfare</div>
            <div className="mt-1 text-gray-300">
              Land Owner: Can use Elite Shields (100 $WEALTH) for 72h protection
            </div>
            <div className="mt-1 text-purple-300">
              Attacker: Land Siege (25 $WEALTH) can trigger raids for 7-day yield theft
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleCenterNew;
