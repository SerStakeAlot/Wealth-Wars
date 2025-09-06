'use client';

import { useState } from 'react';
import { useGame } from '../app/lib/store';
import { ENHANCED_BUSINESSES } from '../app/lib/businesses';
import { EnhancedBusiness } from '../app/lib/types';

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

const TIER_COLORS = {
  basic: '#64748b',
  advanced: '#3b82f6',
  premium: '#8b5cf6',
  legendary: '#f59e0b'
};

export function BusinessPopup({ isOpen, onClose }: BusinessPopupProps) {
  const { enhancedBusinesses, creditBalance, buyEnhancedBusiness } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('efficiency');

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
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Strategic Businesses</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="category-tabs">
          {Object.entries(CATEGORY_INFO).map(([category, info]) => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
              style={{ borderColor: selectedCategory === category ? info.color : '#4a5568' }}
            >
              <span className="category-emoji">{info.emoji}</span>
              <span className="category-name">{info.name}</span>
            </button>
          ))}
        </div>

        <div className="business-grid">
          {categorizedBusinesses[selectedCategory]?.map((business) => {
            const owned = isOwned(business.id);
            const canAfford = creditBalance >= business.cost;
            
            return (
              <div key={business.id} className={`business-card ${owned ? 'owned' : ''}`}>
                <div className="business-header">
                  <div className="business-info">
                    <span className="business-emoji">{business.emoji}</span>
                    <div className="business-details">
                      <h3 className="business-name">{business.name}</h3>
                      <div className="business-tier" style={{ color: TIER_COLORS[business.tier] }}>
                        {business.tier.toUpperCase()} • {business.rarity.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="business-multiplier">
                    +{business.workMultiplier}% Work
                  </div>
                </div>

                <div className="ability-section">
                  <h4 className="ability-name">{business.ability.name}</h4>
                  <p className="ability-description">{business.ability.description}</p>
                  {business.ability.cost && (
                    <div className="ability-cost">
                      Activation Cost: {business.ability.cost} credits
                    </div>
                  )}
                </div>

                <div className="business-footer">
                  <div className="business-cost">
                    💰 {business.cost.toLocaleString()} credits
                  </div>
                  {!owned ? (
                    <button
                      className={`buy-btn ${canAfford ? 'affordable' : 'expensive'}`}
                      onClick={() => handleBuyBusiness(business.id)}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Purchase' : 'Not Enough Credits'}
                    </button>
                  ) : (
                    <div className="owned-badge">✅ Owned</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <style jsx>{`
          .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 20px;
          }

          .popup-content {
            background: #1e293b;
            border: 3px solid #ffd700;
            border-radius: 16px;
            width: 100%;
            max-width: 900px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
          }

          .popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 2px solid #ffd700;
            background: rgba(255, 255, 255, 0.05);
          }

          .popup-header h2 {
            color: #ffd700;
            font-size: 24px;
            font-weight: 800;
            margin: 0;
          }

          .close-btn {
            background: none;
            border: 2px solid #ffd700;
            color: #ffd700;
            font-size: 24px;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }

          .close-btn:hover {
            background: rgba(255, 215, 0, 0.1);
          }

          .category-tabs {
            display: flex;
            padding: 16px 24px 0;
            gap: 8px;
            overflow-x: auto;
          }

          .category-tab {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border: 2px solid #4a5568;
            background: rgba(255, 255, 255, 0.05);
            color: #e6edf5;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
          }

          .category-tab.active {
            background: rgba(255, 255, 255, 0.1);
          }

          .category-tab:hover {
            background: rgba(255, 255, 255, 0.08);
          }

          .category-emoji {
            font-size: 16px;
          }

          .category-name {
            font-weight: 600;
            font-size: 14px;
          }

          .business-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 16px;
            padding: 20px 24px;
          }

          .business-card {
            background: rgba(255, 255, 255, 0.06);
            border: 2px solid #374151;
            border-radius: 12px;
            padding: 16px;
            transition: all 0.2s;
          }

          .business-card:hover {
            border-color: #ffd700;
            background: rgba(255, 255, 255, 0.08);
          }

          .business-card.owned {
            border-color: #10b981;
            background: rgba(16, 185, 129, 0.1);
          }

          .business-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
          }

          .business-info {
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }

          .business-emoji {
            font-size: 32px;
          }

          .business-details {
            display: flex;
            flex-direction: column;
          }

          .business-name {
            color: #e6edf5;
            font-size: 16px;
            font-weight: 700;
            margin: 0 0 4px 0;
          }

          .business-tier {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }

          .business-multiplier {
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
          }

          .ability-section {
            margin-bottom: 16px;
            padding: 12px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
          }

          .ability-name {
            color: #ffd700;
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 8px 0;
          }

          .ability-description {
            color: #94a3b8;
            font-size: 13px;
            line-height: 1.4;
            margin: 0 0 8px 0;
          }

          .ability-cost {
            color: #f59e0b;
            font-size: 12px;
            font-weight: 600;
          }

          .business-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .business-cost {
            color: #ffd700;
            font-weight: 600;
            font-size: 14px;
          }

          .buy-btn {
            padding: 8px 16px;
            border: 2px solid;
            border-radius: 8px;
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .buy-btn.affordable {
            background: #10b981;
            border-color: #10b981;
            color: white;
          }

          .buy-btn.affordable:hover {
            background: #059669;
            border-color: #059669;
          }

          .buy-btn.expensive {
            background: #374151;
            border-color: #6b7280;
            color: #9ca3af;
            cursor: not-allowed;
          }

          .owned-badge {
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 12px;
          }

          @media (max-width: 768px) {
            .popup-content {
              max-width: 95vw;
              max-height: 90vh;
            }

            .business-grid {
              grid-template-columns: 1fr;
              padding: 16px;
            }

            .category-tabs {
              padding: 12px 16px 0;
            }

            .popup-header {
              padding: 16px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
