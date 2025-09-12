'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../app/lib/store';
import { ATTACK_TYPES, SHIELD_TYPES, AttackType } from '../app/lib/battle-system';

export interface BattleNotification {
  id: string;
  type: 'incoming_attack' | 'attack_result' | 'shield_expired' | 'raid_active';
  attackerId?: string;
  attackerName?: string;
  attackType?: AttackType;
  targetWealth?: number;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionRequired: boolean;
  resolved: boolean;
}

export function BattleNotificationCenter({ mode = 'floating' }: { mode?: 'floating' | 'embedded' }) {
  const { battleState, wealth, activateShield, getBattleStats } = useGame();
  const [notifications, setNotifications] = useState<BattleNotification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastCheck, setLastCheck] = useState(Date.now());

  // Mock real battle notifications for demo
  useEffect(() => {
    // Simulate incoming attacks for demo purposes
    const generateMockAttack = () => {
      const attackers = ['CryptoWhale', 'BusinessTycoon', 'WealthHunter', 'DigitalNomad', 'SolanaShark'];
      const attackTypes: AttackType[] = ['STANDARD', 'WEALTH_ASSAULT', 'LAND_SIEGE'];
      
      const mockNotification: BattleNotification = {
        id: Date.now().toString(),
        type: 'incoming_attack',
        attackerId: 'mock_' + Math.random().toString(36).substr(2, 9),
        attackerName: attackers[Math.floor(Math.random() * attackers.length)],
        attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        targetWealth: wealth,
        timestamp: Date.now(),
        severity: Math.random() > 0.7 ? 'critical' : Math.random() > 0.4 ? 'high' : 'medium',
        message: '',
        actionRequired: true,
        resolved: false
      };

      // Generate appropriate message
      const attack = ATTACK_TYPES[mockNotification.attackType!];
      mockNotification.message = `${mockNotification.attackerName} is launching a ${attack.name}! ` +
        `${attack.bypassDefenses ? '⚠️ Bypasses your defenses!' : 'Your defenses may help.'}`;

      setNotifications(prev => [mockNotification, ...prev.slice(0, 9)]); // Keep last 10
    };

    // Generate mock attacks for demo (every 45-90 seconds)
    const attackInterval = setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance every interval
        generateMockAttack();
      }
    }, Math.random() * 45000 + 45000); // 45-90 seconds

    return () => clearInterval(attackInterval);
  }, [wealth]);

  // Check for shield expiry
  useEffect(() => {
    if (battleState.shieldExpiry > 0 && Date.now() > battleState.shieldExpiry) {
      const shieldExpiredNotification: BattleNotification = {
        id: 'shield_expired_' + Date.now(),
        type: 'shield_expired',
        timestamp: Date.now(),
        severity: 'medium',
        message: '🛡️ Your shield has expired! You are now vulnerable to attacks.',
        actionRequired: true,
        resolved: false
      };
      
      setNotifications(prev => [shieldExpiredNotification, ...prev]);
    }
  }, [battleState.shieldExpiry]);

  const markAsResolved = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, resolved: true, actionRequired: false }
          : n
      )
    );
  };

  const clearResolvedNotifications = () => {
    setNotifications(prev => prev.filter(n => !n.resolved));
  };

  const getUnresolvedCount = () => {
    return notifications.filter(n => !n.resolved).length;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-yellow-800 border-yellow-700 text-yellow-50';
      case 'high': return 'bg-yellow-700 border-yellow-600 text-yellow-50';
      case 'medium': return 'bg-yellow-600 border-yellow-500 text-black';
      case 'low': return 'bg-gray-800 border-gray-700 text-gray-100';
      default: return 'bg-gray-600 border-gray-500 text-gray-100';
    }
  };

  const getAttackTypeIcon = (attackType?: AttackType) => {
    if (!attackType) return '⚔️';
    switch (attackType) {
      case 'STANDARD': return '⚔️';
      case 'WEALTH_ASSAULT': return '💰';
      case 'LAND_SIEGE': return '🏰';
      default: return '⚔️';
    }
  };

  const hasUnresolvedNotifications = getUnresolvedCount() > 0;
  const criticalNotifications = notifications.filter(n => !n.resolved && n.severity === 'critical');

  const content = (
    <>
      {/* Critical Alert Banner (only in floating mode) */}
      {mode === 'floating' && criticalNotifications.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-card border border-border shadow-lg animate-pulse">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl animate-bounce">🚨</div>
                <div>
                  <div className="font-bold text-lg gold-gradient">CRITICAL THREAT DETECTED!</div>
                  <div className="text-sm opacity-90 gold-gradient">
                    {criticalNotifications[0].message}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="bg-yellow-400/10 hover:bg-yellow-400/20 px-4 py-2 rounded-lg font-semibold transition-colors gold-gradient"
                >
                  📊 View Details
                </button>
                <button
                  onClick={() => markAsResolved(criticalNotifications[0].id)}
                  className="bg-yellow-400/10 hover:bg-yellow-400/20 px-4 py-2 rounded-lg font-semibold transition-colors gold-gradient"
                >
                  ✓ Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'floating' && (
    <div className="fixed top-4 right-4 z-40">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`relative p-3 rounded-full shadow-lg transition-all transform hover:scale-105 ${
              hasUnresolvedNotifications 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-black animate-pulse' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
          >
            <div className="text-xl">⚔️</div>
            {hasUnresolvedNotifications && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                {getUnresolvedCount()}
              </div>
            )}
          </button>
        </div>
      )}

      {/* Notification Panel */}
      {isExpanded && (
        <div className={`${mode === 'floating' ? 'fixed top-0 right-0 h-full w-96 z-50 border-l shadow-2xl' : 'relative w-full'} bg-card border-border overflow-y-auto`}>  
          <div className="p-4 border-b border-border bg-card goldenize">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold gold-gradient flex items-center">
                ⚔️ Notifications
                {hasUnresolvedNotifications && (
                  <span className="ml-2 bg-yellow-600 text-black text-xs px-2 py-1 rounded-full gold-gradient">
                    {getUnresolvedCount()} active
                  </span>
                )}
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={clearResolvedNotifications}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded"
              >
                Clear Resolved
              </button>
              <button
                onClick={() => activateShield('BASIC')}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                🛡️ Activate Shield
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">🏰</div>
                <div className="text-lg font-medium">All Quiet</div>
                <div className="text-sm">No battle activity detected</div>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 transition-all ${
                    notification.resolved 
                      ? 'bg-gray-800 border-gray-600 opacity-50' 
                      : getSeverityColor(notification.severity)
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">
                          {notification.type === 'incoming_attack' ? getAttackTypeIcon(notification.attackType) : 
                           notification.type === 'shield_expired' ? '🛡️' :
                           notification.type === 'raid_active' ? '🏴‍☠️' : '⚔️'}
                        </span>
                        <span className="font-semibold gold-gradient">
                          {notification.attackerName || 'Battle Alert'}
                        </span>
                        <span className="text-xs opacity-75 gold-gradient">
                          {Math.floor((Date.now() - notification.timestamp) / 60000)}m ago
                        </span>
                      </div>
                      <p className="text-sm mb-2 gold-gradient">{notification.message}</p>
                      
                      {notification.attackType && (
                        <div className="text-xs opacity-75">
                          Attack Type: {ATTACK_TYPES[notification.attackType].name}
                          <br />
                          Cost: {ATTACK_TYPES[notification.attackType].cost} {ATTACK_TYPES[notification.attackType].currency}
                          {ATTACK_TYPES[notification.attackType].bypassDefenses && (
                            <span className="text-red-400"> • Bypasses Defenses</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                      {notification.actionRequired && !notification.resolved && (
                      <button
                        onClick={() => markAsResolved(notification.id)}
                        className="ml-2 px-3 py-1 bg-yellow-400/10 hover:bg-yellow-400/20 rounded text-xs font-medium transition-colors gold-gradient"
                      >
                        ✓ Handle
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <h4 className="text-sm font-medium text-white mb-3">Quick Defense</h4>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(SHIELD_TYPES).map(([key, shield]) => (
                <button
                  key={key}
                  onClick={() => activateShield(key as any)}
                  disabled={battleState.shieldExpiry > Date.now() || wealth < shield.cost}
                  className={`p-2 rounded text-sm font-medium transition-colors ${
                    battleState.shieldExpiry > Date.now() 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : wealth >= shield.cost
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  🛡️ {shield.name} ({shield.cost} $WEALTH • {shield.duration / (60 * 60 * 1000)}h)
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {mode === 'floating' && isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
  if (mode === 'embedded') {
    return (
      <div className="w-full">
        {/* Embedded toggle button */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-4 py-2 rounded font-semibold text-sm transition-colors ${
              hasUnresolvedNotifications
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
          >
            {hasUnresolvedNotifications ? `⚔️ Alerts (${getUnresolvedCount()})` : '⚔️ Battle Alerts'}
          </button>
          {hasUnresolvedNotifications && (
            <span className="text-xs text-red-400">{getUnresolvedCount()} pending</span>
          )}
        </div>
        {content}
      </div>
    );
  }
  return content;
}
