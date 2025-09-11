'use client';

import { useState, useEffect } from 'react';
import { useGame } from '../app/lib/store';
import { ATTACK_TYPES, SHIELD_TYPES, AttackType } from '../app/lib/battle-system';

interface ActiveAttack {
  id: string;
  attackerId: string;
  attackerName: string;
  attackType: AttackType;
  timestamp: number;
  wealthTargeted: number;
  timeRemaining: number;
}

export function DefenseBanner() {
  const { username, creditBalance, wealth, battleState, activateShield } = useGame();
  const [activeAttacks, setActiveAttacks] = useState<ActiveAttack[]>([]);
  const [currentAttackIndex, setCurrentAttackIndex] = useState(0);

  // Check for real attacks (in a real implementation, this would come from your backend/blockchain)
  useEffect(() => {
    // Mock attack detection based on battle state changes for demo
    const checkForAttacks = () => {
      const now = Date.now();
      const recentAttackWindow = 10 * 60 * 1000; // 10 minutes
      
      // Check if we've been attacked recently based on battle state
      const wasRecentlyAttacked = battleState.lastAttackTime > 0 && 
        (now - battleState.lastAttackTime) < recentAttackWindow;

      if (wasRecentlyAttacked && activeAttacks.length === 0) {
        // Generate mock attack notification for demo
        const mockAttack: ActiveAttack = {
          id: 'attack_' + Date.now(),
          attackerId: 'demo_attacker',
          attackerName: ['CryptoWhale', 'BusinessTycoon', 'WealthHunter'][Math.floor(Math.random() * 3)],
          attackType: ['STANDARD', 'WEALTH_ASSAULT', 'LAND_SIEGE', 'BUSINESS_SABOTAGE'][Math.floor(Math.random() * 4)] as AttackType,
          timestamp: battleState.lastAttackTime,
          wealthTargeted: wealth,
          timeRemaining: recentAttackWindow - (now - battleState.lastAttackTime)
        };
        
        setActiveAttacks([mockAttack]);
      }
    };

    // For demo purposes, also create periodic mock attacks
    const demoInterval = setInterval(() => {
      if (Math.random() > 0.85 && activeAttacks.length === 0) { // 15% chance
        const attackTypes: AttackType[] = ['STANDARD', 'WEALTH_ASSAULT', 'LAND_SIEGE', 'BUSINESS_SABOTAGE'];
        const attackers = ['SolanaShark', 'CryptoTycoon', 'DigitalRaider', 'BlockchainBaron'];
        
        const mockAttack: ActiveAttack = {
          id: 'demo_attack_' + Date.now(),
          attackerId: 'demo_' + Math.random().toString(36).substr(2, 9),
          attackerName: attackers[Math.floor(Math.random() * attackers.length)],
          attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
          timestamp: Date.now(),
          wealthTargeted: wealth,
          timeRemaining: 5 * 60 * 1000 // 5 minutes to respond
        };
        
        setActiveAttacks([mockAttack]);
      }
    }, 45000); // Check every 45 seconds

    checkForAttacks();
    const checkInterval = setInterval(checkForAttacks, 30000); // Check every 30 seconds

    return () => {
      clearInterval(checkInterval);
      clearInterval(demoInterval);
    };
  }, [battleState.lastAttackTime, wealth, activeAttacks.length]);

  // Cycle through multiple attacks if present
  useEffect(() => {
    if (activeAttacks.length > 1) {
      const interval = setInterval(() => {
        setCurrentAttackIndex(prev => (prev + 1) % activeAttacks.length);
      }, 5000); // Switch every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [activeAttacks.length]);

  // Update time remaining
  useEffect(() => {
    if (activeAttacks.length > 0) {
      const interval = setInterval(() => {
        setActiveAttacks(prev => prev.map(attack => ({
          ...attack,
          timeRemaining: Math.max(0, attack.timeRemaining - 1000)
        })).filter(attack => attack.timeRemaining > 0));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [activeAttacks.length]);

  const handleActivateShield = async (shieldType: keyof typeof SHIELD_TYPES) => {
    try {
      await activateShield(shieldType);
      // Clear attacks when shield is activated
      setActiveAttacks([]);
    } catch (error) {
      console.error('Failed to activate shield:', error);
    }
  };

  const handleDismissAttack = (attackId: string) => {
    setActiveAttacks(prev => prev.filter(attack => attack.id !== attackId));
  };

  // Don't show if shield is active or no attacks
  const isShieldActive = battleState.shieldExpiry > Date.now();
  if (activeAttacks.length === 0 || isShieldActive) return null;

  const currentAttack = activeAttacks[currentAttackIndex];
  const attackTypeInfo = ATTACK_TYPES[currentAttack.attackType];
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="defenseBanner">
      <div className="bannerContent">
        
        {/* Attack Info */}
        <div className="attackInfo">
          <div className="alertIcon">🚨</div>
          <div className="attackDetails">
            <div className="attackTitle">
              {attackTypeInfo.bypassDefenses ? '🔥 CRITICAL ATTACK!' : 'UNDER ATTACK!'}
            </div>
            <div className="attackDesc">
              {currentAttack.attackerName} launched a {attackTypeInfo.name}!
              {attackTypeInfo.bypassDefenses && <span className="bypass-warning"> ⚠️ Bypasses defenses!</span>}
            </div>
            {activeAttacks.length > 1 && (
              <div className="multiAttack">
                +{activeAttacks.length - 1} more attacks! ({currentAttackIndex + 1}/{activeAttacks.length})
              </div>
            )}
          </div>
        </div>

        {/* Time and Actions */}
        <div className="defenseActions">
          <div className="timeRemaining">
            <div className="timeValue">⏰ {formatTime(currentAttack.timeRemaining)}</div>
            <div className="timeLabel">to respond</div>
          </div>
          
          <button 
            onClick={() => handleActivateShield('BASIC')}
            disabled={wealth < SHIELD_TYPES.BASIC.cost}
            className="defenseBtn defend"
          >
            🛡️ SHIELD ({SHIELD_TYPES.BASIC.cost} $WEALTH)
          </button>
          
          <button 
            onClick={() => handleActivateShield('ADVANCED')}
            disabled={wealth < SHIELD_TYPES.ADVANCED.cost}
            className="defenseBtn counter"
          >
            ⚡ ADVANCED SHIELD ({SHIELD_TYPES.ADVANCED.cost} $WEALTH)
          </button>
          
          <button 
            onClick={() => handleDismissAttack(currentAttack.id)}
            className="defenseBtn dismiss"
          >
            ✕ DISMISS
          </button>
        </div>
        
      </div>

      <style jsx>{`
        .defenseBanner {
          position: fixed; top: 0; left: 0; right: 0; z-index: 40;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white; padding: 16px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
          animation: slideDown 0.5s ease-out, pulse 2s infinite;
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4); }
          50% { box-shadow: 0 4px 20px rgba(220, 38, 38, 0.8); }
        }
        .bannerContent {
          max-width: 1200px; margin: 0 auto; display: flex; 
          align-items: center; justify-content: space-between;
        }
        .attackInfo {
          display: flex; align-items: center; gap: 16px;
        }
        .alertIcon {
          font-size: 24px; animation: bounce 1s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .attackTitle {
          font-weight: bold; font-size: 18px;
        }
        .attackDesc {
          font-size: 14px; opacity: 0.9; margin-top: 2px;
        }
        .bypass-warning {
          color: #fbbf24; font-weight: bold; animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .multiAttack {
          font-size: 12px; color: #fbbf24; font-weight: bold; margin-top: 2px;
        }
        .defenseActions {
          display: flex; align-items: center; gap: 12px;
        }
        .timeRemaining {
          text-align: center; padding: 0 12px;
        }
        .timeValue {
          font-size: 16px; font-weight: bold;
        }
        .timeLabel {
          font-size: 10px; opacity: 0.8;
        }
        .defenseBtn {
          padding: 6px 12px; border: 2px solid white; background: transparent;
          color: white; border-radius: 6px; font-weight: bold; cursor: pointer;
          transition: all 0.2s; font-size: 14px;
        }
        .defenseBtn:disabled {
          opacity: 0.5; cursor: not-allowed;
        }
        .defenseBtn:hover:not(:disabled) {
          background: white; color: #dc2626; transform: translateY(-1px);
        }
        .defend:hover:not(:disabled) {
          background: #3b82f6; border-color: #3b82f6; color: white;
        }
        .counter:hover:not(:disabled) {
          background: #f59e0b; border-color: #f59e0b; color: white;
        }
        .dismiss:hover:not(:disabled) {
          background: #6b7280; border-color: #6b7280; color: white;
        }
        @media (max-width: 768px) {
          .bannerContent {
            flex-direction: column; gap: 12px; text-align: center;
          }
          .attackInfo {
            flex-direction: column; gap: 8px;
          }
          .defenseActions {
            flex-wrap: wrap; justify-content: center;
          }
          .defenseBanner {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}
