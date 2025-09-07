'use client';

import { Orbitron } from 'next/font/google';
import { useGame } from '../app/lib/store';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

export function ShareModal() {
  const { shareModalOpen, pendingWorkReward, shareToX, skipShare, closeShareModal } = useGame();

  if (!shareModalOpen || !pendingWorkReward) return null;

  const baseReward = pendingWorkReward.baseReward;
  const sharedReward = Math.floor(baseReward * 1.5);
  const bonusReward = sharedReward - baseReward;

  return (
    <div className="modalOverlay" onClick={closeShareModal}>
      <div className="shareModal" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3 className={`${orbitron.className} modalTitle`}>Work Complete! 💼</h3>
          <button className="closeBtn" onClick={closeShareModal}>✕</button>
        </div>
        
        <div className="rewardInfo">
          <div className="baseReward">
            <span className="rewardLabel">Base Reward:</span>
            <span className="rewardValue">{baseReward.toLocaleString()} credits</span>
          </div>
          
          <div className="sharePromotion">
            <div className="shareHeader">
              <span className="shareIcon">🐦</span>
              <span className="shareTitle">Share on X & Boost Your Reward!</span>
            </div>
            
            <div className="bonusInfo">
              <span className="bonusLabel">Share Bonus (+50%):</span>
              <span className="bonusValue">+{bonusReward.toLocaleString()} credits</span>
            </div>
            
            <div className="totalReward">
              <span className="totalLabel">Total with Share:</span>
              <span className={`${orbitron.className} totalValue`}>{sharedReward.toLocaleString()} credits</span>
            </div>
          </div>
        </div>
        
        <div className="modalActions">
          <button className="shareBtn" onClick={shareToX}>
            <span className="btnIcon">🐦</span>
            <span>Share & Get 1.5x Reward</span>
          </button>
          
          <button className="skipBtn" onClick={skipShare}>
            <span>Skip Share</span>
          </button>
        </div>
        
        <div className="promoNote">
          <span className="noteIcon">💡</span>
          <span>Sharing helps promote Wealth Wars and earns you bonus credits!</span>
        </div>
      </div>

      <style jsx>{`
        .modalOverlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .shareModal {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border: 2px solid #ffd700;
          border-radius: 16px;
          padding: 24px;
          max-width: 480px;
          width: 90%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          color: #e6edf5;
        }

        .modalHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modalTitle {
          margin: 0;
          color: #ffd700;
          font-size: 24px;
          text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
        }

        .closeBtn {
          background: none;
          border: none;
          color: #9aa7bd;
          font-size: 24px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .closeBtn:hover {
          color: #ffd700;
          background: rgba(255, 255, 255, 0.1);
        }

        .rewardInfo {
          margin-bottom: 24px;
        }

        .baseReward {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .rewardLabel {
          color: #9aa7bd;
          font-size: 14px;
        }

        .rewardValue {
          color: #22c55e;
          font-weight: 600;
          font-size: 16px;
        }

        .sharePromotion {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 16px;
        }

        .shareHeader {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .shareIcon {
          font-size: 20px;
        }

        .shareTitle {
          font-weight: 600;
          color: #3b82f6;
        }

        .bonusInfo {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .bonusLabel {
          color: #9aa7bd;
          font-size: 14px;
        }

        .bonusValue {
          color: #f59e0b;
          font-weight: 600;
        }

        .totalReward {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .totalLabel {
          color: #e6edf5;
          font-weight: 600;
        }

        .totalValue {
          color: #ffd700;
          font-size: 18px;
          text-shadow: 0 1px 2px rgba(255, 215, 0, 0.3);
        }

        .modalActions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .shareBtn {
          background: linear-gradient(180deg, #1d9bf0, #1565c0);
          border: none;
          border-radius: 12px;
          padding: 16px 24px;
          color: white;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(29, 155, 240, 0.3);
        }

        .shareBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(29, 155, 240, 0.4);
        }

        .btnIcon {
          font-size: 18px;
        }

        .skipBtn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px 24px;
          color: #9aa7bd;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .skipBtn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #e6edf5;
        }

        .promoNote {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 8px;
          font-size: 14px;
          color: #94a3b8;
        }

        .noteIcon {
          font-size: 16px;
          color: #22c55e;
        }

        @media (max-width: 480px) {
          .shareModal {
            margin: 16px;
            padding: 20px;
          }

          .modalTitle {
            font-size: 20px;
          }

          .modalActions {
            gap: 8px;
          }

          .shareBtn {
            padding: 14px 20px;
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}
