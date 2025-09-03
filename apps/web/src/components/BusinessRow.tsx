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
          grid-template-columns: 1.1fr 1.2fr 0.9fr; /* identity | progress | actions */
          align-items: center;
          gap: 16px;
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.45);
          backdrop-filter: blur(8px) saturate(1.2);
          margin-bottom: 12px;
          position: relative;
          color: #e6edf5;
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
          color: #e6edf5;
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
          color: #9aa7bd;
        }

        .outletCount {
          font-weight: 600;
          color: #e6edf5;
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
          height: 14px;
          width: 100%;
          background: rgba(255,255,255,0.12);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
        }

        .cycleFill {
          height: 100%;
          background:
            repeating-linear-gradient(135deg, rgba(255,255,255,0.25) 0 8px, rgba(255,255,255,0.05) 8px 16px),
            linear-gradient(90deg, #22c55e, #16a34a);
          box-shadow: 0 0 12px rgba(34,197,94,0.35);
          transition: width 120ms linear;
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
          color: #9aa7bd;
          text-align: center;
        }

        .conditionBar {
          height: 8px;
          width: 100%;
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
          overflow: hidden;
        }

        .conditionFill {
          height: 100%;
          box-shadow: inset 0 0 8px rgba(0,0,0,0.2);
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
          padding: 12px 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
          border: 1px solid;
        }

        .primary {
          background: #16a34a;
          border-color: #0f7a34;
          color: #fff;
        }

        .primary:hover:not(:disabled) {
          background: #15803d;
        }

        .dark {
          background: #0f172a;
          border-color: #0f172a;
          color: #fff;
        }

        .dark:hover:not(:disabled) {
          background: #1e293b;
        }

        .ghost {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .ghost:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .milestones {
          grid-column: 1 / -1;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .milestone {
          border: 1px solid #e5e7eb;
          background: #fff;
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 11px;
          color: #334155;
          font-weight: 500;
        }

        .milestone.achieved {
          background: #ecfccb;
          border-color: #bef264;
          color: #365314;
          font-weight: 700;
        }

        @media (max-width: 860px) {
          .businessRow {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 14px;
          }

          .actions {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }

          .btn {
            padding: 10px 8px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
