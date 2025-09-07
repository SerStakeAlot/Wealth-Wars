'use client';

import { useGame } from '../app/lib/store';
import { ENHANCED_BUSINESSES } from '../app/lib/businesses';

export function ActiveSlotsDisplay() {
  const { businessSlots } = useGame();

  if (!businessSlots) return null;

  const { activeSlots, maxSlots } = businessSlots.slotManagement;
  const { totalSynergyMultiplier } = businessSlots;

  const getBusinessInfo = (businessId: string) => {
    return ENHANCED_BUSINESSES.find(b => b.id === businessId);
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
    <div className="activeSlotsDisplay">
      <div className="slotsHeader">
        <span className="slotsTitle">🎯 Active Business Slots</span>
        {totalSynergyMultiplier > 1 && (
          <span className="synergyBonus">
            +{Math.round((totalSynergyMultiplier - 1) * 100)}% Synergy
          </span>
        )}
      </div>
      
      <div className="slotsContainer">
        {activeSlots.slice(0, maxSlots).map((slot) => {
          const business = slot.businessId ? getBusinessInfo(slot.businessId) : null;
          
          return (
            <div key={slot.slotId} className={`slotDisplay ${business ? 'slotActive' : 'slotEmpty'}`}>
              {business ? (
                <>
                  <span className="slotEmoji">{getCategoryEmoji(business.category)}</span>
                  <span className="slotName">{business.name}</span>
                </>
              ) : (
                <>
                  <span className="slotEmoji">📭</span>
                  <span className="slotName">Empty</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .activeSlotsDisplay {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 16px;
          margin: 12px 0;
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        }

        .slotsHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .slotsTitle {
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #e6edf5;
        }

        .synergyBonus {
          background: linear-gradient(90deg, #10b981, #059669);
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .slotsContainer {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }

        .slotDisplay {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          border-radius: 8px;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.2s ease;
        }

        .slotActive {
          border-color: #ffd700;
          background: rgba(255,215,0,0.1);
        }

        .slotEmpty {
          opacity: 0.6;
        }

        .slotEmoji {
          font-size: 18px;
          margin-bottom: 4px;
        }

        .slotName {
          font-size: 11px;
          text-align: center;
          color: #e6edf5;
          font-weight: 500;
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .slotsContainer {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          }
          
          .slotDisplay {
            padding: 8px 4px;
          }
          
          .slotEmoji {
            font-size: 16px;
          }
          
          .slotName {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
