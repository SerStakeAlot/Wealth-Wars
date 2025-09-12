'use client';

import React, { useState } from 'react';
import { useGame } from '../app/lib/store';
import { BATTLE_CONFIG, ATTACK_TYPES, SHIELD_TYPES } from '../app/lib/battle-system';
import { BattleNotificationCenter } from './BattleNotificationCenter';

interface BattleCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BattleCenter({ isOpen, onClose }: BattleCenterProps) {
  const { 
    attackPlayer, 
    activateShield, 
    payTribute, 
    canAttack,
    getBattleStats,
    creditBalance,
    wealth,
    battleState,
    landNfts
  } = useGame();
  
  const [targetId, setTargetId] = useState('');
  const [targetWealth, setTargetWealth] = useState('150');
  const [selectedTargetData, setSelectedTargetData] = useState<any | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Helper to convert snake_case identifiers to Title Case without underscores
  const humanize = (val: string) => val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const [attackType, setAttackType] = useState<keyof typeof ATTACK_TYPES>('STANDARD');
  const [battleResult, setBattleResult] = useState<string | null>(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [tributeTarget, setTributeTarget] = useState('');

  if (!isOpen) return null;

  const handleAttack = async () => {
    if (!targetId.trim()) {
      setBattleResult('Please enter a target player ID');
      return;
    }
    
    setIsAttacking(true);
    // Use selected target data if available, otherwise mock
    const mockTargetData = selectedTargetData || {
      wealth: parseInt(targetWealth) || 150,
      enhancedBusinesses: Math.random() > 0.5 ? ['security_firm'] : [],
      battleState: {
        lastAttackTime: 0,
        lastDefenseTime: 0,
        attacksToday: 0,
        successfulAttacksToday: 0,
        defenseRating: 0,
        shieldExpiry: 0,
        consecutiveAttacksFrom: {},
        activeRaids: [],
        tributePaid: [],
        lastAttackByType: {
          STANDARD: 0,
          WEALTH_ASSAULT: 0,
          LAND_SIEGE: 0,
          BUSINESS_SABOTAGE: 0
        }
      },
      landNfts: Math.random() > 0.7 ? 1 : 0
    };
    
    const result = await attackPlayer(targetId, attackType as any, mockTargetData);
    setBattleResult(result.message);
    setIsAttacking(false);
  };

  const lookupTarget = async () => {
    if (!targetId.trim()) {
      setBattleResult('Enter a player ID to lookup');
      return;
    }
    setLookupLoading(true);
    setLookupError(null);
    try {
      const res = await fetch(`/api/player/${encodeURIComponent(targetId)}`);
      if (!res.ok) throw new Error(`Lookup failed: ${res.status}`);
      const data = await res.json();
      setSelectedTargetData(data);
      setTargetWealth(String(data.wealth || 0));
      setBattleResult(null);
    } catch (err: any) {
      setLookupError(err?.message || 'Unknown error');
      setSelectedTargetData(null);
    } finally {
      setLookupLoading(false);
    }
  };

  // Determine cooldown and affordability for the selected attack type
  const currentAttack = ATTACK_TYPES[attackType];
  const lastAttackByType = (battleState.lastAttackByType && battleState.lastAttackByType[attackType]) || battleState.lastAttackTime || 0;
  const timeSinceLastAttack = Date.now() - lastAttackByType;
  const attackCooldownRemaining = Math.max(0, (currentAttack.cooldown || 0) - timeSinceLastAttack);
  const canAfford = currentAttack.currency === 'credits' ? (creditBalance >= (currentAttack.cost || 0)) : (wealth >= (currentAttack.cost || 0));
  const canAttackNow = attackCooldownRemaining === 0 && canAfford;

  const isShieldActive = battleState.shieldExpiry > Date.now();
  const shieldTimeRemaining = Math.max(0, battleState.shieldExpiry - Date.now());

  const battleStats = getBattleStats();

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-red-400">⚔️ Battle Center</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Embedded Notifications Toggle */}
        <div className="mb-4">
          <BattleNotificationCenter mode="embedded" />
        </div>

        {/* Battle Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">💪 Your Power</h3>
            <p className="text-sm">💰 Wealth: {wealth} $WEALTH</p>
            <p className="text-sm">💳 Credits: {creditBalance}</p>
            <p className="text-sm">🎯 Base Success: {battleStats.successRate}%</p>
            <p className="text-sm">🏗️ Land NFTs: {landNfts}</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">📊 Today's Stats</h3>
            <p className="text-sm">⚔️ Attacks: {battleStats.attacksToday}</p>
            <p className="text-sm">✅ Successful: {battleState.successfulAttacksToday}</p>
            <p className="text-sm">📈 Win Rate: {battleStats.attacksToday > 0 ? Math.round((battleState.successfulAttacksToday / battleStats.attacksToday) * 100) : 0}%</p>
            <p className="text-sm">⏰ Cooldown: {attackCooldownRemaining > 0 ? `${Math.ceil(attackCooldownRemaining / 1000 / 60)} min` : 'Ready'}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-400 mb-2">🛡️ Defense</h3>
            <p className="text-sm">🛡️ Shield: {isShieldActive ? `Active (${Math.ceil(shieldTimeRemaining / 1000 / 60 / 60)}h)` : 'Inactive'}</p>
            <p className="text-sm">💰 Tribute Paid: {battleState.tributePaid.filter(t => t.expiry > Date.now()).length}</p>
            <p className="text-sm">🏴‍☠️ Active Raids: {battleState.activeRaids.length}</p>
          </div>
        </div>

        {/* Attack Interface */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-xl font-semibold text-red-400 mb-4">🗡️ Launch Attack</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Player ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter player username..."
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
                <button
                  onClick={lookupTarget}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white"
                >
                  {lookupLoading ? 'Looking up...' : 'Lookup'}
                </button>
              </div>
              {lookupError && (
                <div className="mt-2 text-sm text-red-300">Lookup error: {lookupError}</div>
              )}
        {selectedTargetData && (
                <div className="mt-2 text-sm text-gray-300 p-2 bg-gray-700 rounded">
                  <div><strong>ID:</strong> {selectedTargetData.id}</div>
          <div><strong>Wealth:</strong> {selectedTargetData.wealth} $WEALTH</div>
          <div><strong>Businesses:</strong> {selectedTargetData.enhancedBusinesses.map((b:string)=>humanize(b)).join(', ') || 'None'}</div>
                  <div><strong>Land NFTs:</strong> {selectedTargetData.landNfts}</div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Wealth (for demo)</label>
              <input
                type="number"
                placeholder="150"
                value={targetWealth}
                onChange={(e) => setTargetWealth(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
          {/* Attack type selection with tooltips */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {Object.keys(ATTACK_TYPES).map((t) => {
              const key = t as keyof typeof ATTACK_TYPES;
              const cfg = ATTACK_TYPES[key];
              const disabled = key === 'LAND_SIEGE' && !(selectedTargetData?.landNfts || cfg.canTriggerLandRaid);
              const displayName = humanize(cfg.name || key.toLowerCase());
              const currencyLabel = cfg.currency === 'wealth' ? '$WEALTH' : 'Credits';
              const summary =
                key === 'STANDARD' ? 'Balanced, low commitment wealth steal.' :
                key === 'WEALTH_ASSAULT' ? 'Higher cost, bigger potential wealth transfer.' :
                key === 'LAND_SIEGE' ? 'Specialized vs land owners; can start raid flows.' :
                key === 'BUSINESS_SABOTAGE' ? 'Targets business performance; uses credits.' : 'Attack type';
              return (
                <div key={t} className="relative group">
                  <button
                    onClick={() => setAttackType(key)}
                    className={`px-3 py-2 rounded text-xs md:text-sm font-semibold transition-colors border border-transparent ${
                      attackType === key ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    disabled={disabled}
                  >
                    {displayName}
                  </button>
                  {/* Tooltip */}
                  <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute z-50 left-1/2 -translate-x-1/2 mt-2 w-56 p-3 rounded-lg bg-card border border-border shadow-lg">
                    <p className="text-xs font-semibold text-indigo-300 mb-1">{displayName}</p>
                    <p className="text-[11px] text-gray-200 leading-snug mb-1">{summary}</p>
                    <p className="text-[11px] text-gray-400">Cost: <span className="text-gray-200">{cfg.cost} {currencyLabel}</span></p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={handleAttack}
              disabled={!canAttackNow || isAttacking || !targetId.trim()}
              className={`px-6 py-3 rounded font-semibold transition-colors ${
                canAttackNow && targetId.trim()
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isAttacking ? 'Attacking...' : `⚔️ ${humanize(ATTACK_TYPES[attackType].name || 'Attack')} (${currentAttack.cost || 0} ${currentAttack.currency === 'wealth' ? '$WEALTH' : 'credits'})`}
            </button>
          </div>

          {!canAttackNow && (
            <div className="text-yellow-400 text-sm mb-2">
              {attackCooldownRemaining > 0 
                ? `⏱️ Cooldown: ${Math.ceil(attackCooldownRemaining / 1000 / 60)} minutes remaining`
                : (currentAttack.currency === 'credits'
                    ? `💳 Need ${currentAttack.cost} credits to attack`
                    : `💰 Need ${currentAttack.cost} $WEALTH to attack`)
              }
            </div>
          )}

          {battleResult && (
            <div className="mt-4 p-3 bg-gray-700 rounded-lg">
              <p className="text-yellow-300 font-medium">{battleResult}</p>
            </div>
          )}
        </div>

        {/* Land NFT Protection */}
        {landNfts > 0 && (
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-semibold text-purple-300 mb-4">🏗️ Land NFT Protection</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-300 mb-2">🛡️ Shield System</h4>
                <p className="text-sm mb-3">
                  {isShieldActive 
                    ? `Protected for ${Math.ceil(shieldTimeRemaining / 1000 / 60 / 60)} hours`
                    : '❌ Vulnerable to Land raids'
                  }
                </p>
                <button
                  onClick={() => activateShield('BASIC')}
                  disabled={isShieldActive || wealth < SHIELD_TYPES.BASIC.cost}
                  className={`w-full py-2 px-4 rounded text-sm font-semibold transition-colors ${
                    !isShieldActive && wealth >= SHIELD_TYPES.BASIC.cost
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Activate Shield ({SHIELD_TYPES.BASIC.cost} $WEALTH)
                </button>
              </div>
              
              <div>
                <h4 className="font-semibold text-purple-300 mb-2">💰 Tribute System</h4>
                <p className="text-sm mb-3">Pay potential raiders to avoid attacks (48h protection)</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Player ID..."
                    value={tributeTarget}
                    onChange={(e) => setTributeTarget(e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => {
                      payTribute(tributeTarget);
                      setTributeTarget('');
                    }}
                    disabled={!tributeTarget.trim() || wealth < BATTLE_CONFIG.TRIBUTE_COST}
                    className="py-2 px-4 rounded text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600 disabled:text-gray-400"
                  >
                    Pay ({BATTLE_CONFIG.TRIBUTE_COST} $WEALTH)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Battle Mechanics Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-300 mb-3">⚔️ Attack Mechanics</h3>
            <div className="text-sm space-y-2">
              <p>• Base success rate: 60% — modified by attacker/defender bonuses (businesses, shields, defense rating).</p>
              <p>• Attack cost: {ATTACK_TYPES.STANDARD.cost} {ATTACK_TYPES.STANDARD.currency === 'wealth' ? '$WEALTH' : 'credits'} (shown per attack type when selected)</p>
              <p>• Cooldown: {ATTACK_TYPES.STANDARD.cooldown ? `${Math.ceil(ATTACK_TYPES.STANDARD.cooldown / 1000 / 60 / 60)} hours` : 'None'}</p>
              <p>• Target range: typically ±50% of your wealth; some attacks require specific circumstances (land raids require target land NFTs).</p>
              <p>• Wealth theft: a percent of the target's wealth on success; repeated successful attacks against the same target suffer diminishing returns (slippage).</p>
              <p>• Counter-attack: failed attacks can trigger counter-effects (defender gains or attacker loses additional resources).</p>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">🏴‍☠️ Land Raid System</h3>
            <div className="text-sm space-y-1">
              <p>• Target: Land NFT owners only</p>
              <p>• Requirement: 3 consecutive wins in 24h</p>
              <p>• Reward: 10% of monthly yield for 7 days</p>
              <p>• Payout: ~238 $WEALTH daily during raid</p>
              <p>• Protection: Shields, tributes, alliances</p>
            </div>
          </div>
        </div>

        {/* Business Modifiers */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-300 mb-3">🏢 Business Battle Bonuses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-red-300 mb-2">Offensive Bonuses:</h4>
              <p>• Consulting Firm: +15% attack success</p>
              <p>• Cyber Security: +10% attack success</p>
              <p>• Market Research: +5% attack success</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">Defensive Bonuses:</h4>
              <p>• Private Security: -20% incoming attacks</p>
              <p>• Insurance Company: -10% incoming attacks</p>
              <p>• Government Contract: -15% incoming attacks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
