'use client';

import { useState } from 'react';
import { Orbitron, Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

interface BulkBarProps {
  bulkQty: number;
  setBulkQty: (qty: number) => void;
}

export function BulkBar({ bulkQty, setBulkQty }: BulkBarProps) {
  const router = useRouter();

  const handleUpgrades = () => {
    // Stub: navigate to upgrades page or open modal
    alert('Upgrades page coming soon!');
  };

  const handlePrestige = () => {
    // Stub: open prestige modal
    alert('Prestige system coming soon!');
  };

  const handleEvents = () => {
    // Stub: open events modal or navigate
    alert('Events & Planets coming soon!');
  };

  return (
    <div className="bulkBar">
      {/* Bulk Quantity Selector */}
      <div className="bulkSelector">
        <span className="bulkLabel">Buy</span>
        <div className="bulkButtons">
          <button
            className={`bulkBtn ${bulkQty === 1 ? 'active' : ''}`}
            onClick={() => setBulkQty(1)}
          >
            ×1
          </button>
          <button
            className={`bulkBtn ${bulkQty === 10 ? 'active' : ''}`}
            onClick={() => setBulkQty(10)}
          >
            ×10
          </button>
          <button
            className={`bulkBtn ${bulkQty === 100 ? 'active' : ''}`}
            onClick={() => setBulkQty(100)}
          >
            ×100
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actionButtons">
        <button className="actionBtn upgrades" onClick={handleUpgrades}>
          <span className="btnIcon">⬆️</span>
          <span className="btnText">Upgrades</span>
        </button>

        <button className="actionBtn prestige" onClick={handlePrestige}>
          <span className="btnIcon">👑</span>
          <span className="btnText">Investors</span>
        </button>

        <button className="actionBtn events" onClick={handleEvents}>
          <span className="btnIcon">🌍</span>
          <span className="btnText">Events</span>
        </button>
      </div>

      <style jsx>{`
        .bulkBar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
          border-top: 1px solid rgba(255,255,255,0.12);
          padding: 16px 20px;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.25);
          backdrop-filter: blur(8px) saturate(1.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
          color: #e6edf5;
        }

        .bulkSelector {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bulkLabel {
          font-size: 14px;
          font-weight: 600;
          color: #e6edf5;
        }

        .bulkButtons {
          display: flex;
          gap: 4px;
        }

        .bulkBtn {
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.06);
          color: #e6edf5;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .bulkBtn:hover {
          background: rgba(255,255,255,0.12);
        }

        .bulkBtn.active {
          background: linear-gradient(180deg, #1d2a50, #172554);
          border-color: rgba(255,255,255,0.16);
          color: #e6edf5;
          box-shadow: 0 6px 18px rgba(23,37,84,0.35);
        }

        .actionButtons {
          display: flex;
          gap: 8px;
        }

        .actionBtn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #0f172a;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .actionBtn:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        .upgrades {
          border-color: #22c55e;
          color: #16a34a;
        }

        .upgrades:hover {
          background: #dcfce7;
        }

        .prestige {
          border-color: #f59e0b;
          color: #d97706;
        }

        .prestige:hover {
          background: #fef3c7;
        }

        .events {
          border-color: #8b5cf6;
          color: #7c3aed;
        }

        .events:hover {
          background: #f3e8ff;
        }

        .btnIcon {
          font-size: 16px;
        }

        .btnText {
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .bulkBar {
            flex-direction: column;
            gap: 12px;
            padding: 12px 16px;
          }

          .bulkSelector {
            align-self: flex-start;
          }

          .actionButtons {
            align-self: stretch;
            justify-content: space-around;
          }

          .actionBtn {
            flex: 1;
            justify-content: center;
            padding: 8px 12px;
          }

          .btnText {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .bulkButtons {
            gap: 2px;
          }

          .bulkBtn {
            padding: 6px 8px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
