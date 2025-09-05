'use client';

import { useEffect } from 'react';
import { Orbitron, Inter } from 'next/font/google';
import { useGame } from '../app/lib/store';
import { calculateOutletCost, getNextMilestone, DEFAULT_CYCLE_MS } from '../app/lib/balance';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

interface BusinessRowProps {
  asset: any; // keep as-is to avoid type cascades for now
}

export function BusinessRow({ asset }: BusinessRowProps) {
  const { wealth, buyOutlet, toggleManager, collect } = useGame();
  const outlets = asset.outlets || 1;
  const multiplier = asset.multiplier || 1;
  const cycleMs = asset.cycleMs || DEFAULT_CYCLE_MS;
  const profitPerCycle = asset.yieldPerTick * outlets * multiplier;

  const now = Date.now();
  const isRunning = asset.nextReadyTs && now < asset.nextReadyTs;
  const isReady = !isRunning || now >= asset.nextReadyTs;
  const timeLeft = isRunning ? Math.max(0, asset.nextReadyTs - now) : 0;
  const progressPercent = isRunning ? ((cycleMs - timeLeft) / cycleMs) * 100 : (isReady ? 100 : 0);

  // Force single-outlet purchase
  const bulkQty = 1 as const;
  const outletCost = calculateOutletCost(asset, bulkQty);
  const canAffordOutlet = wealth >= outletCost;
  const nextMilestone = getNextMilestone(outlets, asset.milestones);

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="businessRow" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '16px',
      background: '#1e293b',
      border: '2px solid #ffd700',
      borderRadius: '14px',
      padding: '20px',
      boxShadow: '0 6px 24px rgba(255,215,0,.3)',
      marginBottom: '16px',
      position: 'relative'
    }}>
      {/* Identity Section */}
      <div className="identity">
        <div className="nameSection">
          <h3 className={`${orbitron.className} businessName`}>{asset.name}</h3>
          <span className="levelBadge">Lv {asset.level}</span>
        </div>
        <div className="outletInfo">
          <span className="outletCount">× {outlets}</span>
          {nextMilestone && <span className="milestoneHint">Next at ×{nextMilestone}</span>}
        </div>
      </div>

      {/* Progress Section */}
      <div className="progress" style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
        <div className="cycleBar" style={{
          height: '12px', 
          width: '100%',
          background: '#475569',
          borderRadius: '999px', 
          overflow: 'hidden', 
          position: 'relative'
        }}>
          <div className="cycleFill" style={{ 
            width: `${progressPercent}%`,
            height: '100%', 
            background: 'linear-gradient(90deg, #22c55e, #16a34a)', 
            transition: 'width 120ms linear' 
          }} />
          {!isRunning && isReady && <span className="tapHint" style={{
            position: 'absolute', 
            inset: '0', 
            fontSize: '11px', 
            color: '#f1f5f9', 
            display: 'grid', 
            placeItems: 'center', 
            pointerEvents: 'none'
          }}>Tap to start</span>}
          {isRunning && <span className="timer" style={{
            position: 'absolute', 
            inset: '0', 
            fontSize: '11px', 
            color: '#f1f5f9', 
            display: 'grid', 
            placeItems: 'center', 
            pointerEvents: 'none'
          }}>{formatTime(timeLeft)}</span>}
        </div>
        <div className="profitInfo" style={{fontWeight: '700', color: '#f1f5f9'}}>Profit/cycle: {profitPerCycle} $WEALTH</div>
        <div className="conditionBar" style={{
          height: '8px', 
          width: '100%', 
          background: '#374151', 
          borderRadius: '999px', 
          overflow: 'hidden'
        }}>
          <div
            className="conditionFill"
            style={{
              width: `${asset.condition}%`,
              height: '100%',
              background: asset.condition < 35 ? '#ef4444' : asset.condition < 70 ? '#f59e0b' : '#22c55e'
            }}
          />
        </div>
      </div>

      {/* Actions Section */}
      <div className="actions" style={{
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        gap: '8px', 
        alignSelf: 'stretch'
      }}>
        <button
          className="btn primary large collectBtn"
          onClick={() => collect(asset.id)}
          disabled={!isReady}
          style={{
            padding: '12px 10px',
            fontSize: '14px',
            borderRadius: '10px',
            border: '2px solid #ffd700',
            background: '#16a34a',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(255,215,0,.2)'
          }}
        >
          {isRunning ? 'Collect' : 'Start'}
        </button>

        <button
          className="btn dark large upgradeBtn"
          onClick={() => buyOutlet(asset.id, 1)}
          disabled={!canAffordOutlet}
          style={{
            padding: '12px 10px',
            fontSize: '14px',
            borderRadius: '10px',
            border: '2px solid #ffd700',
            background: '#fbbf24',
            color: '#0f172a',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(255,215,0,.2)'
          }}
        >
          Buy ({outletCost})
        </button>

        <button
          className="btn ghost large defendBtn"
          onClick={() => toggleManager(asset.id, !asset.managerHired)}
          style={{
            padding: '12px 10px',
            fontSize: '14px',
            borderRadius: '10px',
            border: '2px solid #ffd700',
            background: '#374151',
            color: '#f1f5f9',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(255,215,0,.2)'
          }}
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
    </div>
  );
}

<style jsx>{`
  .businessRow {
    display: grid !important;
    grid-template-columns: 1fr 1fr 1fr !important;
    gap: 16px !important;
    background: #1e293b !important;
    border: 2px solid #334155 !important;
    border-radius: 14px !important;
    padding: 20px !important;
    box-shadow: 0 6px 24px rgba(0,0,0,.2) !important;
    margin-bottom: 16px !important;
    position: relative !important;
  }
  .identity { display: flex !important; flex-direction: column !important; gap: 8px !important; }
  .nameSection { display: flex !important; align-items: center !important; gap: 8px !important; }
  .businessName { margin: 0 !important; font-size: 18px !important; letter-spacing: 0.08em !important; text-transform: uppercase !important; color: #f1f5f9 !important; }
  .levelBadge { background: #fbbf24 !important; color: #0f172a !important; padding: 2px 6px !important; border-radius: 4px !important; font-size: 12px !important; font-weight: 600 !important; }
  .outletInfo { display: flex !important; align-items: center !important; gap: 8px !important; font-size: 14px !important; color: #94a3b8 !important; }
  .outletCount { font-weight: 600 !important; color: #f1f5f9 !important; }
  .milestoneHint { font-size: 12px !important; color: #64748b !important; }

  .progress { display: flex !important; flex-direction: column !important; gap: 8px !important; }
  .cycleBar {
    height: 12px !important; width: 100% !important;
    background: #475569 !important;
    border-radius: 999px !important; overflow: hidden !important; position: relative !important;
  }
  .cycleFill { height: 100% !important; background: linear-gradient(90deg, #22c55e, #16a34a) !important; transition: width 120ms linear !important; }
  .tapHint, .timer { position: absolute !important; inset: 0 !important; font-size: 11px !important; color: #f1f5f9 !important; display: grid !important; place-items: center !important; pointer-events: none !important; }
  .profitInfo { font-weight: 700 !important; color: #f1f5f9 !important; }

  .conditionBar { height: 8px !important; width: 100% !important; background: #374151 !important; border-radius: 999px !important; overflow: hidden !important; }
  .conditionFill { height: 100% !important; }

  .actions { display: grid !important; grid-template-columns: 1fr !important; gap: 8px !important; align-self: stretch !important; }
  .btn { 
    border: none !important; 
    cursor: pointer !important; 
    font-weight: 600 !important; 
    transition: all 0.2s ease !important;
    font-family: inherit !important;
  }
  .btn:hover { transform: translateY(-1px) !important; }
  .btn:disabled { cursor: not-allowed !important; }
  .btn.large { padding: 12px 10px !important; font-size: 14px !important; border-radius: 10px !important; }
  .collectBtn { background: #16a34a !important; border: 1px solid #0f7a34 !important; color: #fff !important; }
  .collectBtn:disabled { opacity: 0.6 !important; filter: grayscale(0.2) !important; }
  .upgradeBtn { background: #fbbf24 !important; color: #0f172a !important; border: 1px solid #f59e0b !important; font-weight: 600 !important; }
  .defendBtn { background: #374151 !important; border: 1px solid #4b5563 !important; color: #f1f5f9 !important; }

  .milestones { grid-column: 1 / -1 !important; display: flex !important; flex-wrap: wrap !important; gap: 6px !important; margin-top: 8px !important; }
  .milestone { border: 1px solid #4b5563 !important; background: #374151 !important; border-radius: 999px !important; padding: 4px 8px !important; font-size: 11px !important; color: #d1d5db !important; }
  .milestone.achieved { background: #16a34a !important; border-color: #22c55e !important; color: #fff !important; font-weight: 700 !important; }

  @media (max-width: 860px) {
    .businessRow { grid-template-columns: 1fr !important; gap: 12px !important; padding: 14px !important; }
    .actions { grid-template-columns: repeat(3, 1fr) !important; }
  }
`}</style>
