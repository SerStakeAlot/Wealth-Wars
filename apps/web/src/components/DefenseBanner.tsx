'use client';

import { useState, useEffect } from 'react';
import { useGame } from '../app/lib/store';

export function DefenseBanner() {
  const { username, creditBalance } = useGame();
  const [showAttack, setShowAttack] = useState(false);

  // Mock attack for demo purposes
  useEffect(() => {
    // Randomly show attack demo every 30 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance
        setShowAttack(true);
        setTimeout(() => setShowAttack(false), 10000); // Hide after 10 seconds
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleDefend = () => {
    alert(`Defense activated! You spent ${500} credits to defend your business.`);
    setShowAttack(false);
  };

  const handleCounterBid = () => {
    alert(`Counter-bid placed! You bid ${1200} credits to keep your business.`);
    setShowAttack(false);
  };

  if (!showAttack) return null;

  return (
    <div className="defenseBanner">
      <div className="bannerContent">
        
        {/* Attack Info */}
        <div className="attackInfo">
          <div className="alertIcon">🚨</div>
          <div className="attackDetails">
            <div className="attackTitle">UNDER ATTACK!</div>
            <div className="attackDesc">
              CryptoWhale is bidding 1000 credits for your Automation Factory
            </div>
          </div>
        </div>

        {/* Time and Actions */}
        <div className="defenseActions">
          <div className="timeRemaining">
            <div className="timeValue">⏰ 8h 23m</div>
            <div className="timeLabel">remaining</div>
          </div>
          
          <button onClick={handleDefend} className="defenseBtn defend">
            🛡️ DEFEND
          </button>
          
          <button onClick={handleCounterBid} className="defenseBtn counter">
            💰 COUNTER-BID
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
        .defenseActions {
          display: flex; align-items: center; gap: 16px;
        }
        .timeRemaining {
          text-align: center; padding: 0 16px;
        }
        .timeValue {
          font-size: 16px; font-weight: bold;
        }
        .timeLabel {
          font-size: 10px; opacity: 0.8;
        }
        .defenseBtn {
          padding: 8px 16px; border: 2px solid white; background: transparent;
          color: white; border-radius: 6px; font-weight: bold; cursor: pointer;
          transition: all 0.2s; font-size: 14px;
        }
        .defenseBtn:hover {
          background: white; color: #dc2626; transform: translateY(-1px);
        }
        .defend:hover {
          background: #3b82f6; border-color: #3b82f6; color: white;
        }
        .counter:hover {
          background: #f59e0b; border-color: #f59e0b; color: white;
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
