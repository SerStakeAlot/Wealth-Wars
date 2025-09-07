'use client';

import { useState, useMemo } from 'react';
import { useGame } from '../app/lib/store';
import { ENHANCED_BUSINESSES } from '../app/lib/businesses';

interface AttackCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AttackCenter({ isOpen, onClose }: AttackCenterProps) {
  const { 
    leaderboardPlayers,
    username,
    creditBalance,
    wealth
  } = useGame();

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidCurrency, setBidCurrency] = useState<'credits' | 'wealth'>('credits');

  // Mock targets for demo
  const mockTargets = [
    { username: 'CryptoWhale', creditBalance: 2500, businessCount: 3 },
    { username: 'BlockchainBoss', creditBalance: 1800, businessCount: 2 },
    { username: 'DeFiDegen', creditBalance: 950, businessCount: 4 },
  ];

  // Mock businesses for selected target
  const mockBusinesses = ['automation_factory', 'fast_food_chain', 'security_firm'];

  // Calculate minimum bid for selected business
  const businessInfo = useMemo(() => {
    if (!selectedBusiness) return null;
    
    const business = ENHANCED_BUSINESSES.find(b => b.id === selectedBusiness);
    if (!business) return null;
    
    const minBidCredits = Math.ceil(business.cost * 1.5);
    const minBidWealth = Math.ceil((business.cost / 10) * 2);
    
    return {
      business,
      minBidCredits,
      minBidWealth,
      minBid: bidCurrency === 'credits' ? minBidCredits : minBidWealth
    };
  }, [selectedBusiness, bidCurrency]);

  // Mock success rate calculation
  const successRate = useMemo(() => {
    if (!selectedTarget || !bidAmount || !businessInfo) return 0;
    
    const baseRate = 60;
    const bidMultiplier = Math.min(1.5, bidAmount / businessInfo.minBid);
    
    return Math.min(95, Math.round(baseRate * bidMultiplier));
  }, [selectedTarget, bidAmount, businessInfo]);

  const handleAttack = () => {
    if (!selectedTarget || !selectedBusiness || !businessInfo || bidAmount < businessInfo.minBid) {
      alert('Please complete all fields with valid amounts');
      return;
    }

    if (bidCurrency === 'credits' && bidAmount > creditBalance) {
      alert('Insufficient credits for this bid');
      return;
    }

    if (bidCurrency === 'wealth' && bidAmount > wealth) {
      alert('Insufficient $WEALTH for this bid');
      return;
    }
    
    // For now, simulate the attack
    const success = Math.random() > 0.5; // 50/50 chance for demo
    
    if (success) {
      alert(`Attack launched! You bid ${bidAmount} ${bidCurrency} for ${businessInfo.business.name}`);
      onClose();
    } else {
      alert('Attack failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="attackCenter">
      <div className="attackModal">
        {/* Header */}
        <div className="attackHeader">
          <h2>⚔️ Attack Center</h2>
          <button onClick={onClose} className="closeBtn">✕</button>
        </div>

        <div className="attackContent">
          <div className="attackGrid">
            
            {/* Target Selection */}
            <div className="attackSection">
              <h3>🎯 Select Target</h3>
              
              <div className="targetList">
                {mockTargets.map(player => (
                  <button
                    key={player.username}
                    onClick={() => setSelectedTarget(player.username)}
                    className={`targetBtn ${selectedTarget === player.username ? 'selected' : ''}`}
                  >
                    <div className="targetName">{player.username}</div>
                    <div className="targetInfo">
                      Portfolio: {player.creditBalance || 0} credits
                    </div>
                    <div className="targetBusinesses">
                      {player.businessCount} businesses
                    </div>
                  </button>
                ))}
              </div>

              {mockTargets.length === 0 && (
                <div className="noTargets">
                  No eligible targets found.
                  <br />
                  <span>Players need 500+ credit portfolios to be targetable.</span>
                </div>
              )}
            </div>

            {/* Business Selection */}
            <div className="attackSection">
              <h3>🏢 Select Business</h3>
              
              {selectedTarget ? (
                <div className="businessList">
                  {mockBusinesses.map(businessId => {
                    const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
                    return business ? (
                      <button
                        key={businessId}
                        onClick={() => setSelectedBusiness(businessId)}
                        className={`businessBtn ${selectedBusiness === businessId ? 'selected' : ''}`}
                      >
                        <div className="businessHeader">
                          <span className="businessEmoji">{business.emoji}</span>
                          <span className="businessName">{business.name}</span>
                        </div>
                        <div className="businessValue">Value: {business.cost} credits</div>
                        <div className="businessCategory">{business.category} • {business.tier}</div>
                      </button>
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="selectFirst">Select a target first</div>
              )}
            </div>

            {/* Bid Placement */}
            <div className="attackSection">
              <h3>💰 Place Bid</h3>
              
              {selectedBusiness && businessInfo ? (
                <div className="bidSection">
                  {/* Currency Selection */}
                  <div className="currencySelect">
                    <label>Currency</label>
                    <div className="currencyBtns">
                      <button
                        onClick={() => setBidCurrency('credits')}
                        className={`currencyBtn ${bidCurrency === 'credits' ? 'selected' : ''}`}
                      >
                        💰 Credits
                      </button>
                      <button
                        onClick={() => setBidCurrency('wealth')}
                        className={`currencyBtn ${bidCurrency === 'wealth' ? 'selected' : ''}`}
                      >
                        💎 $WEALTH
                      </button>
                    </div>
                  </div>

                  {/* Bid Amount */}
                  <div className="bidAmount">
                    <label>Bid Amount (Min: {businessInfo.minBid})</label>
                    <input
                      type="number"
                      min={businessInfo.minBid}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      placeholder={`Minimum ${businessInfo.minBid} ${bidCurrency}`}
                      className="bidInput"
                    />
                  </div>

                  {/* Success Rate */}
                  <div className="successRate">
                    <div className="rateLabel">Estimated Success Rate</div>
                    <div className={`rateValue ${successRate >= 70 ? 'high' : successRate >= 40 ? 'medium' : 'low'}`}>
                      {successRate}%
                    </div>
                    <div className="rateNote">Based on portfolio values and bid amount</div>
                  </div>

                  {/* Current Balance */}
                  <div className="balance">
                    Your Balance: {bidCurrency === 'credits' ? creditBalance : wealth} {bidCurrency}
                  </div>

                  {/* Attack Button */}
                  <button
                    onClick={handleAttack}
                    disabled={!selectedTarget || !selectedBusiness || bidAmount < businessInfo.minBid}
                    className="attackBtn"
                  >
                    🚀 Launch Attack
                  </button>
                </div>
              ) : (
                <div className="selectFirst">Select a business to bid on</div>
              )}
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .attackCenter {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center;
          z-index: 50; padding: 20px;
        }
        .attackModal {
          background: #1e293b; border: 2px solid #dc2626; border-radius: 12px;
          width: 100%; max-width: 1200px; max-height: 90vh; overflow: hidden;
          box-shadow: 0 20px 40px rgba(220, 38, 38, 0.3);
        }
        .attackHeader {
          background: linear-gradient(135deg, #7f1d1d, #dc2626);
          padding: 20px; display: flex; justify-content: space-between; align-items: center;
        }
        .attackHeader h2 {
          color: white; font-size: 24px; font-weight: bold; margin: 0;
        }
        .closeBtn {
          background: none; border: none; color: white; font-size: 24px; 
          cursor: pointer; padding: 5px; border-radius: 5px;
        }
        .closeBtn:hover { background: rgba(255, 255, 255, 0.1); }
        .attackContent {
          padding: 24px; height: 70vh; overflow-y: auto;
        }
        .attackGrid {
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; height: 100%;
        }
        .attackSection {
          background: #374151; border-radius: 8px; padding: 20px;
          display: flex; flex-direction: column;
        }
        .attackSection h3 {
          color: #fbbf24; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;
        }
        .targetList, .businessList {
          flex: 1; overflow-y: auto;
        }
        .targetBtn, .businessBtn {
          width: 100%; padding: 12px; border: 2px solid #4b5563; background: #1f2937;
          color: white; border-radius: 8px; cursor: pointer; text-align: left;
          transition: all 0.2s; margin-bottom: 8px;
        }
        .targetBtn:hover, .businessBtn:hover {
          background: #374151; border-color: #dc2626;
        }
        .targetBtn.selected, .businessBtn.selected {
          border-color: #dc2626; background: rgba(220, 38, 38, 0.2);
        }
        .targetName, .businessName {
          font-weight: 600; margin-bottom: 4px;
        }
        .targetInfo, .targetBusinesses, .businessValue, .businessCategory {
          font-size: 12px; color: #9ca3af; margin-bottom: 2px;
        }
        .businessHeader {
          display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
        }
        .businessEmoji { font-size: 16px; }
        .noTargets, .selectFirst {
          color: #9ca3af; text-align: center; padding: 40px 0; font-size: 14px;
        }
        .bidSection {
          display: flex; flex-direction: column; gap: 16px;
        }
        .currencySelect label, .bidAmount label {
          display: block; color: #e5e7eb; font-size: 14px; margin-bottom: 8px;
        }
        .currencyBtns {
          display: flex; gap: 8px;
        }
        .currencyBtn {
          flex: 1; padding: 8px 12px; border: 2px solid #4b5563; background: #1f2937;
          color: white; border-radius: 6px; cursor: pointer; transition: all 0.2s;
        }
        .currencyBtn.selected {
          border-color: #dc2626; background: rgba(220, 38, 38, 0.2);
        }
        .bidInput {
          width: 100%; padding: 12px; background: #1f2937; border: 2px solid #4b5563;
          border-radius: 6px; color: white; font-size: 14px;
        }
        .bidInput:focus { outline: none; border-color: #dc2626; }
        .successRate {
          background: #1f2937; padding: 12px; border-radius: 6px; text-align: center;
        }
        .rateLabel {
          color: #e5e7eb; font-size: 12px; margin-bottom: 4px;
        }
        .rateValue {
          font-size: 20px; font-weight: bold; margin-bottom: 4px;
        }
        .rateValue.high { color: #10b981; }
        .rateValue.medium { color: #f59e0b; }
        .rateValue.low { color: #ef4444; }
        .rateNote {
          color: #9ca3af; font-size: 10px;
        }
        .balance {
          color: #e5e7eb; font-size: 14px;
        }
        .attackBtn {
          width: 100%; padding: 12px; background: #dc2626; color: white;
          border: none; border-radius: 6px; font-weight: bold; cursor: pointer;
          transition: all 0.2s; font-size: 16px;
        }
        .attackBtn:hover:not(:disabled) {
          background: #b91c1c; transform: translateY(-1px);
        }
        .attackBtn:disabled {
          background: #4b5563; cursor: not-allowed; opacity: 0.5;
        }
        @media (max-width: 1024px) {
          .attackGrid { grid-template-columns: 1fr; }
          .attackModal { width: 95%; max-width: none; }
        }
      `}</style>
    </div>
  );
}
