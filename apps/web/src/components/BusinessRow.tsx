'use client';

import { useState, useEffect } from 'react';
import { Orbitron, Inter } from 'next/font/google';
import { useGame } from '../app/lib/store';
import { calculateOutletCost, getNextMilestone, DEFAULT_CYCLE_MS } from '../app/lib/balance';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

interface BusinessRowProps {
  asset: any; // Using any for now to avoid type conflicts
}

export function BusinessRow({ asset }: BusinessRowProps) {
  const { wealth, buyOutlet, toggleManager, collect } = useGame();
  const [bulkQty, setBulkQty] = useState(1);

  const outlets = asset.outlets || 1;
  const multiplier = asset.multiplier || 1;
  const cycleMs = asset.cycleMs || DEFAULT_CYCLE_MS;
  const profitPerCycle = asset.yieldPerTick * outlets * multiplier;

  const now = Date.now();
  const isRunning = asset.nextReadyTs && now < asset.nextReadyTs;
  const isReady = !isRunning || now >= asset.nextReadyTs;
  const timeLeft = isRunning ? Math.max(0, asset.nextReadyTs - now) : 0;
  const progressPercent = isRunning ? ((cycleMs - timeLeft) / cycleMs) * 100 : (isReady ? 100 : 0);

  const outletCost = calculateOutletCost(asset, bulkQty);
  const canAffordOutlet = wealth >= outletCost;
  const nextMilestone = getNextMilestone(outlets, asset.milestones);

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="businessRow">
      {/* Identity Section */}
      <div className="identity">
        <div className="nameSection">
          <h3 className={`${orbitron.className} businessName`}>{asset.name}</h3>
          <span className="levelBadge">Lv {asset.level}</span>
        </div>
        <div className="outletInfo">
          <span className="outletCount">× {outlets}</span>
          {nextMilestone && (
            <span className="milestoneHint">Next at ×{nextMilestone}</span>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="progress">
        <div className="cycleBar">
          <div
            className="cycleFill"
            style={{ width: `${progressPercent}%` }}
          />
          {!isRunning && isReady && (
            <span className="tapHint">Tap to start</span>
          )}
          {isRunning && (
            <span className="timer">{formatTime(timeLeft)}</span>
          )}
        </div>
        <div className="profitInfo">
          Profit/cycle: {profitPerCycle} $WEALTH
        </div>
        <div className="conditionBar">
          <div
            className="conditionFill"
            style={{
              width: `${asset.condition}%`,
              background: asset.condition < 35 ? '#ef4444' : asset.condition < 70 ? '#f59e0b' : '#22c55e'
            }}
          />
        </div>
      </div>

      {/* Actions Section */}
      <div className="actions">
        <button
          className="btn primary large collectBtn"
          onClick={() => collect(asset.id)}
          disabled={!isReady}
        >
          {isRunning ? 'Collect' : 'Start'}
        </button>

        <button
          className="btn dark large upgradeBtn"
          onClick={() => buyOutlet(asset.id, bulkQty)}
          disabled={!canAffordOutlet}
        >
          Buy ×{bulkQty} ({outletCost})
        </button>

        <button
          className="btn ghost large defendBtn"
          onClick={() => toggleManager(asset.id, !asset.managerHired)}
        >
          {asset.managerHired ? 'Manager ✓' : 'Hire Manager'}
        </button>
      </div>

      {/* Milestones */}
      {asset.milestones && (
        <div className="milestones">
          {asset.milestones.map((milestone: number) => (
            <span
              key={milestone}
              className={`milestone ${outlets >= milestone ? 'achieved' : ''}`}
            >
              ×{milestone} {outlets >= milestone ? '✓' : ''}
            </span>
          ))}
        </div>
      )}

      <style jsx>{`
        .businessRow {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          background: #fff;
          border: 2px solid #e5e7eb;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 6px 24px rgba(15,23,42,.04);
          margin-bottom: 16px;
          position: relative;
        }

        .identity {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nameSection {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .businessName {
          margin: 0;
          font-size: 18px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0f172a;
        }

        .levelBadge {
          background: #172554;
          color: #fff;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .outletInfo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .outletCount {
          font-weight: 600;
          color: #0f172a;
        }

        .milestoneHint {
          font-size: 12px;
          color: #64748b;
        }

        .progress {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cycleBar {
          height: 12px;
          width: 100%;
          background: #e2e8f0;
          border-radius: 999px;
          overflow: hidden;
          position: relative;
        }

        .cycleFill {
          height: 100%;
          background: #0ea5e9;
          border-radius: 999px;
          transition: width 0.3s;
        }

        .tapHint, .timer {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          font-size: 10px;
          font-weight: 600;
        }

        .profitInfo {
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }

        .conditionBar {
          height: 8px;
          width: 100%;
          background: #f1f5f9;
          border-radius: 999px;
          overflow: hidden;
        }

        .conditionFill {
          height: 100%;
          border-radius: 999px;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .btn {
          border-radius: 10px;
          padding: 10px 14px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }

        .primary {
          border: 1px solid #2b3b61;
          background: #172554;
          color: #fff;
        }

        .dark {
          border: 1px solid #334155;
          background: #0f172a;
          color: #fff;
        }

        .ghost {
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #0f172a;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .milestones {
          grid-column: 1 / -1;
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .milestone {
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          background: #f1f5f9;
          color: #64748b;
        }

        .milestone.achieved {
          background: #22c55e;
          color: #fff;
        }

        @media (max-width: 768px) {
          .businessRow {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .actions {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .btn {
            flex: 1;
            min-width: 120px;
          }
        }
      `}</style>
    </div>
  );
}
