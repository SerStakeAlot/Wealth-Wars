'use client';

import { useState } from 'react';
import { useGame } from '../app/lib/store';
import { ENHANCED_BUSINESSES } from '../app/lib/businesses';
import { EnhancedBusiness } from '../app/lib/types';
import { BusinessSlotManager } from './BusinessSlotManager';

interface BusinessPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_INFO = {
  efficiency: { name: 'Efficiency', emoji: '⚡', color: '#3b82f6' },
  defensive: { name: 'Defensive', emoji: '🛡️', color: '#10b981' },
  offensive: { name: 'Offensive', emoji: '⚔️', color: '#ef4444' },
  utility: { name: 'Utility', emoji: '🎲', color: '#8b5cf6' }
};

export function BusinessPopup({ isOpen, onClose }: BusinessPopupProps) {
  const { enhancedBusinesses, creditBalance, buyEnhancedBusiness } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('efficiency');
  const [isSlotManagerOpen, setIsSlotManagerOpen] = useState(false);

  if (!isOpen) return null;

  const categorizedBusinesses = ENHANCED_BUSINESSES.reduce((acc, business) => {
    if (!acc[business.category]) acc[business.category] = [];
    acc[business.category].push(business);
    return acc;
  }, {} as Record<string, EnhancedBusiness[]>);

  const handleBuyBusiness = (businessId: string) => {
    const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
    if (!business) return;

    if (creditBalance >= business.cost) {
      buyEnhancedBusiness(businessId);
    }
  };

  const isOwned = (businessId: string) => {
    return enhancedBusinesses.includes(businessId);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#1e293b',
          border: '3px solid #ffd700',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px', borderBottom: '2px solid #ffd700', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ color: '#ffd700', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              🏢 Strategic Businesses
            </h2>
            <button
              onClick={() => setIsSlotManagerOpen(true)}
              style={{
                background: '#fbbf24',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = '#f59e0b'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = '#fbbf24'}
            >
              🎯 Manage Slots
            </button>
          </div>
          <p style={{ color: '#94a3b8', margin: '0', fontSize: '14px' }}>
            Build your empire with enhanced businesses
          </p>
        </div>

        <div style={{ padding: '12px 16px 0', borderBottom: '1px solid #374151' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {Object.entries(CATEGORY_INFO).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                style={{
                  padding: '8px 16px',
                  background: selectedCategory === key ? info.color : '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content'
                }}
              >
                {info.emoji} {info.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ 
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {categorizedBusinesses[selectedCategory]?.map((business) => {
            const owned = isOwned(business.id);
            const canAfford = creditBalance >= business.cost;

            return (
              <div
                key={business.id}
                style={{
                  background: '#334155',
                  border: '2px solid #475569',
                  borderRadius: '12px',
                  padding: '16px',
                  opacity: owned ? 0.8 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{business.emoji}</span>
                  <div>
                    <h3 style={{ color: '#f1f5f9', margin: 0, fontSize: '16px', fontWeight: '600' }}>
                      {business.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      {business.tier.charAt(0).toUpperCase() + business.tier.slice(1)} • 
                      {business.workMultiplier}x Work Rate
                    </div>
                  </div>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.4', margin: '0 0 12px 0' }}>
                  {business.description}
                </p>

                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
                  {business.ability && (
                    <div>
                      <strong style={{ color: '#e2e8f0' }}>Ability:</strong> {business.ability.description}
                      <div style={{ marginTop: '4px', fontSize: '11px' }}>
                        Activation Cost: {business.ability.cost} credits
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#ffd700', fontWeight: '600', fontSize: '14px' }}>
                    💰 {business.cost.toLocaleString()} credits
                  </div>
                  {!owned ? (
                    <button
                      onClick={() => handleBuyBusiness(business.id)}
                      disabled={!canAfford}
                      style={{
                        padding: '8px 16px',
                        background: canAfford ? '#10b981' : '#374151',
                        color: canAfford ? 'white' : '#9ca3af',
                        border: canAfford ? '1px solid #10b981' : '1px solid #6b7280',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: canAfford ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {canAfford ? 'Purchase' : 'Not Enough Credits'}
                    </button>
                  ) : (
                    <div style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '12px'
                    }}>
                      ✅ Owned
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Business Slot Manager Modal */}
      <BusinessSlotManager
        isOpen={isSlotManagerOpen}
        onClose={() => setIsSlotManagerOpen(false)}
      />
    </div>
  );
}
