'use client';

import { useState, useEffect } from 'react';
import { useGame } from '../app/lib/store';
import { ENHANCED_BUSINESSES } from '../app/lib/businesses';

interface BusinessSlotManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessSlotManager({ isOpen, onClose }: BusinessSlotManagerProps) {
  const { 
    businessSlots,
    enhancedBusinesses,
    workFrequency,
    assignBusinessToSlot, 
    removeBusinessFromSlot,
    getSlotCooldownTime,
    updateSlotSystem
  } = useGame();

  const [cooldownTime, setCooldownTime] = useState(0);

  // Update cooldown timer
  useEffect(() => {
    if (!isOpen) return;
    
    const updateTimer = () => {
      setCooldownTime(getSlotCooldownTime());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [isOpen, getSlotCooldownTime]);

  // Update slot system when component opens
  useEffect(() => {
    if (isOpen) {
      updateSlotSystem();
    }
  }, [isOpen, updateSlotSystem]);

  if (!isOpen) return null;

  const { activeSlots, maxSlots, canEditSlots } = businessSlots.slotManagement;
  const { synergyBonuses, totalSynergyMultiplier } = businessSlots;

  // Get businesses not in active slots
  const availableBusinesses = (enhancedBusinesses || []).filter(businessId => 
    !activeSlots.some(slot => slot.businessId === businessId)
  );

  const formatCooldownTime = (ms: number) => {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getBusinessInfo = (businessId: string) => {
    return ENHANCED_BUSINESSES.find(b => b.id === businessId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'efficiency': return '#3b82f6';
      case 'defensive': return '#10b981';
      case 'offensive': return '#ef4444';
      case 'utility': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'efficiency': return '⚡';
      case 'defensive': return '🛡️';
      case 'offensive': return '⚔️';
      case 'utility': return '🎲';
      default: return '🏢';
    }
  };

  return (
    <div className="slotManagerOverlay">
      <div className="slotManagerModal">
        
        {/* Header */}
        <div className="slotManagerHeader">
          <div>
            <h2 className="slotManagerTitle">
              🎯 Business Slot Manager
            </h2>
            <p className="slotManagerSubtitle">
              {maxSlots} slots available • Synergy Bonus: +{Math.round((totalSynergyMultiplier - 1) * 100)}%
            </p>
          </div>
          <button 
            onClick={onClose}
            className="slotManagerClose"
          >
            ✕
          </button>
        </div>

        {/* Cooldown Warning */}
        {!canEditSlots && cooldownTime > 0 && (
          <div className="cooldownWarning">
            <div className="cooldownText">
              <span className="cooldownIcon">⏰</span>
              <span>
                Slot editing locked for {formatCooldownTime(cooldownTime)}
              </span>
            </div>
          </div>
        )}

        <div className="slotManagerContent">
          
          {/* Active Slots */}
          <div className="slotsSection">
            <h3 className="sectionTitle">
              🎯 Active Business Slots ({activeSlots.filter(s => s.businessId).length}/{maxSlots})
            </h3>
            
            <div className="slotsGrid">
              {activeSlots.map((slot) => {
                const business = slot.businessId ? getBusinessInfo(slot.businessId) : null;
                
                return (
                  <div
                    key={slot.slotId}
                    className={`slotCard ${business ? 'slotActive' : 'slotEmpty'}`}
                    style={{
                      borderColor: business ? getCategoryColor(business.category) : '#4b5563'
                    }}
                  >
                    {business ? (
                      <>
                        <div className="slotEmoji">
                          {getCategoryEmoji(business.category)}
                        </div>
                        <div className="slotName">
                          {business.name}
                        </div>
                        <div 
                          className="slotCategory"
                          style={{ color: getCategoryColor(business.category) }}
                        >
                          {business.category}
                        </div>
                        {canEditSlots && (
                          <button
                            onClick={() => removeBusinessFromSlot(slot.slotId)}
                            className="slotRemoveBtn"
                          >
                            Remove
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="slotEmptyContent">
                        <div className="slotEmoji">📭</div>
                        <div className="slotEmptyText">Empty Slot</div>
                        {slot.slotId >= maxSlots && (
                          <div className="slotLockedText">
                            Locked
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Synergy Bonuses */}
          {synergyBonuses.length > 0 && (
            <div className="synergySection">
              <h3 className="sectionTitle">
                ✨ Active Synergy Bonuses
              </h3>
              
              <div className="synergyGrid">
                {synergyBonuses.map((bonus, index) => (
                  <div
                    key={index}
                    className="synergyCard"
                  >
                    <div className="synergyHeader">
                      <span className="synergyEmoji">{getCategoryEmoji(bonus.category)}</span>
                      <span className="synergyBonus">+{bonus.bonus}%</span>
                    </div>
                    <div className="synergyDescription">
                      {bonus.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Businesses */}
          <div className="businessesSection">
            <h3 className="sectionTitle">
              📦 Available Businesses ({availableBusinesses.length})
            </h3>
            
            {availableBusinesses.length > 0 ? (
              <div className="businessesGrid">
                {availableBusinesses.map((businessId) => {
                  const business = getBusinessInfo(businessId);
                  if (!business) return null;
                  
                  return (
                    <div
                      key={businessId}
                      className="businessCard"
                      style={{ borderColor: getCategoryColor(business.category) }}
                    >
                      <div className="businessHeader">
                        <span className="businessEmoji">{getCategoryEmoji(business.category)}</span>
                        <span className="businessName">{business.name}</span>
                      </div>
                      
                      <div className="businessDetails">
                        <div className="businessBonus">
                          +{business.workMultiplier} credits per work
                        </div>
                        
                        <div 
                          className="businessCategory"
                          style={{ color: getCategoryColor(business.category) }}
                        >
                          {business.category} • {business.tier}
                        </div>
                      </div>
                      
                      {canEditSlots ? (
                        <div className="businessSlotButtons">
                          {activeSlots.map((slot) => (
                            <button
                              key={slot.slotId}
                              onClick={() => assignBusinessToSlot(businessId, slot.slotId)}
                              disabled={slot.businessId !== null || slot.slotId >= maxSlots}
                              className="slotAssignBtn"
                            >
                              Slot {slot.slotId + 1}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="businessLockedText">
                          Slots locked - cooldown active
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="emptyBusinesses">
                All owned businesses are already active in slots.
                <br />
                <span>Purchase more businesses to expand your options!</span>
              </div>
            )}
          </div>
          
        </div>
      </div>

      <style jsx>{`
        .slotManagerOverlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 20px;
        }

        .slotManagerModal {
          background: #1e293b;
          border: 2px solid #ffd700;
          border-radius: 16px;
          width: 100%;
          max-width: 1200px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .slotManagerHeader {
          background: linear-gradient(to right, #fbbf24, #f59e0b);
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slotManagerTitle {
          font-size: 24px;
          font-weight: bold;
          color: white;
          margin: 0;
        }

        .slotManagerSubtitle {
          color: #fef3c7;
          font-size: 14px;
          margin: 4px 0 0 0;
        }

        .slotManagerClose {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .slotManagerClose:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .cooldownWarning {
          background: rgba(239, 68, 68, 0.2);
          border-bottom: 1px solid #ef4444;
          padding: 12px 20px;
        }

        .cooldownText {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #fca5a5;
        }

        .cooldownIcon {
          font-size: 18px;
        }

        .slotManagerContent {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .slotsSection {
          margin-bottom: 32px;
        }

        .sectionTitle {
          font-size: 20px;
          font-weight: bold;
          color: #ffd700;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .slotsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .slotCard {
          border: 2px dashed #4b5563;
          border-radius: 12px;
          padding: 16px;
          height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: all 0.2s;
          background: #374151;
        }

        .slotActive {
          border-style: solid;
          background: #1f2937;
        }

        .slotEmpty:hover {
          border-color: #6b7280;
        }

        .slotEmoji {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .slotName {
          color: white;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 4px;
        }

        .slotCategory {
          font-size: 12px;
          text-transform: capitalize;
          margin-bottom: 8px;
        }

        .slotRemoveBtn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .slotRemoveBtn:hover {
          background: #dc2626;
        }

        .slotEmptyContent {
          text-align: center;
          color: #9ca3af;
        }

        .slotEmptyText {
          font-size: 12px;
          margin-bottom: 4px;
        }

        .slotLockedText {
          font-size: 12px;
          color: #fbbf24;
        }

        .synergySection {
          margin-bottom: 32px;
        }

        .synergyGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .synergyCard {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid #10b981;
          border-radius: 12px;
          padding: 16px;
        }

        .synergyHeader {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .synergyEmoji {
          font-size: 18px;
        }

        .synergyBonus {
          color: #10b981;
          font-weight: bold;
          font-size: 16px;
        }

        .synergyDescription {
          color: #d1d5db;
          font-size: 14px;
        }

        .businessesSection {
          margin-bottom: 32px;
        }

        .businessesGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .businessCard {
          border: 1px solid #4b5563;
          border-radius: 12px;
          padding: 16px;
          background: #374151;
        }

        .businessHeader {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .businessEmoji {
          font-size: 20px;
        }

        .businessName {
          color: white;
          font-weight: 600;
          font-size: 16px;
        }

        .businessDetails {
          margin-bottom: 16px;
        }

        .businessBonus {
          color: #d1d5db;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .businessCategory {
          font-size: 12px;
          text-transform: capitalize;
        }

        .businessSlotButtons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .slotAssignBtn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .slotAssignBtn:hover:not(:disabled) {
          background: #2563eb;
        }

        .slotAssignBtn:disabled {
          background: #6b7280;
          cursor: not-allowed;
        }

        .businessLockedText {
          color: #9ca3af;
          font-size: 12px;
        }

        .emptyBusinesses {
          text-align: center;
          padding: 40px 20px;
          color: #9ca3af;
        }

        .emptyBusinesses span {
          font-size: 14px;
          opacity: 0.8;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .slotsGrid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
          
          .businessesGrid {
            grid-template-columns: 1fr;
          }
          
          .slotManagerModal {
            margin: 10px;
            max-height: 95vh;
          }
        }
      `}</style>
    </div>
  );
}
