'use client';

import React from 'react';
import { BattleNotificationCenter } from '../../components/BattleNotificationCenter';
import { DefenseBanner } from '../../components/DefenseBanner';
import { useGame } from '../lib/store';

export default function BattleDemoPage() {
  const { 
    wealth, 
    creditBalance, 
    battleState, 
    attackPlayer, 
    activateShield 
  } = useGame();

  const triggerMockAttack = async () => {
    // Simulate an attack to trigger notifications
    const mockTarget = {
      wealth: 200,
      enhancedBusinesses: ['security_firm'],
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
          LAND_SIEGE: 0
        }
      },
      landNfts: 1
    };

    await attackPlayer('demo_target', 'WEALTH_ASSAULT', mockTarget);
  };

  const formatShieldTime = () => {
    if (battleState.shieldExpiry <= Date.now()) return 'No shield active';
    
    const remaining = battleState.shieldExpiry - Date.now();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Battle notification components */}
      <DefenseBanner />
      <BattleNotificationCenter />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-orange-400 mb-4">
              ⚔️ Battle System Demo
            </h1>
            <p className="text-xl text-gray-300">
              Testing the battle notification system and defense mechanics
            </p>
          </div>

          {/* Current Status */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">📊 Current Status</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-sm text-gray-400">Wealth</div>
                <div className="text-xl font-bold text-green-400">{wealth.toLocaleString()} $WEALTH</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-sm text-gray-400">Credits</div>
                <div className="text-xl font-bold text-blue-400">{creditBalance.toLocaleString()}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-sm text-gray-400">Shield Status</div>
                <div className="text-sm font-medium text-yellow-400">
                  {formatShieldTime()}
                </div>
              </div>
            </div>
          </div>

          {/* Demo Controls */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🎮 Demo Controls</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Battle Triggers */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">🚨 Trigger Attacks</h3>
                <div className="space-y-3">
                  <button
                    onClick={triggerMockAttack}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    🗡️ Simulate Incoming Attack
                  </button>
                  <p className="text-sm text-gray-400">
                    This will trigger a mock attack and activate the defense banner and notification system.
                  </p>
                </div>
              </div>

              {/* Shield Controls */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">🛡️ Shield Controls</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => activateShield('BASIC')}
                    disabled={wealth < 25}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors text-sm"
                  >
                    Basic Shield (25 $WEALTH • 24h)
                  </button>
                  <button
                    onClick={() => activateShield('ADVANCED')}
                    disabled={wealth < 50}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors text-sm"
                  >
                    Advanced Shield (50 $WEALTH • 48h)
                  </button>
                  <button
                    onClick={() => activateShield('ELITE')}
                    disabled={wealth < 100}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors text-sm"
                  >
                    Elite Shield (100 $WEALTH • 72h)
                  </button>
                </div>
              </div>
              
            </div>
          </div>

          {/* Battle Log */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">📜 Battle Log</h2>
            <div className="space-y-2">
              <div className="text-sm text-gray-400 p-2 bg-gray-700 rounded">
                <span className="text-green-400">[{new Date().toLocaleTimeString()}]</span> 
                {" "}Battle notification system initialized
              </div>
              <div className="text-sm text-gray-400 p-2 bg-gray-700 rounded">
                <span className="text-blue-400">[{new Date().toLocaleTimeString()}]</span> 
                {" "}Defense banner monitoring active attacks
              </div>
              <div className="text-sm text-gray-400 p-2 bg-gray-700 rounded">
                <span className="text-yellow-400">[{new Date().toLocaleTimeString()}]</span> 
                {" "}Notification center ready for battle alerts
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-900/20 border border-blue-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">📋 Demo Instructions</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• <strong>Trigger Attack:</strong> Click "Simulate Incoming Attack" to see the defense banner appear</li>
              <li>• <strong>Notification Center:</strong> Click the ⚔️ icon in the top-right to view detailed battle notifications</li>
              <li>• <strong>Shield System:</strong> Activate shields to protect against attacks (costs $WEALTH)</li>
              <li>• <strong>Real-time Updates:</strong> Notifications auto-update with attack progress and time remaining</li>
              <li>• <strong>Multi-Attack Support:</strong> System handles multiple simultaneous attacks</li>
              <li>• <strong>Responsive Design:</strong> Works on mobile and desktop devices</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
