'use client';

import { Orbitron } from 'next/font/google';
import { useGame } from '../app/lib/store';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

interface WARDisplayProps {
  compact?: boolean;
}

export function WARDisplay({ compact = false }: WARDisplayProps) {
  const { war, warHistory, wealth, assets, derived, updateWAR } = useGame();

  // Calculate portfolio value from derived asset value
  const portfolioValue = derived.assetValue || 0;
  
  // Use the stored WAR value or calculate current WAR if not available
  const currentWAR = war?.current || (portfolioValue > 0 ? wealth / portfolioValue : 0);
  
  // Determine efficiency rating
  const getEfficiencyRating = (warScore: number) => {
    if (warScore >= 0.8) return { text: 'Legendary', color: '#f59e0b', icon: '👑' };
    if (warScore >= 0.6) return { text: 'Excellent', color: '#10b981', icon: '💎' };
    if (warScore >= 0.4) return { text: 'Good', color: '#3b82f6', icon: '⭐' };
    if (warScore >= 0.2) return { text: 'Average', color: '#f97316', icon: '📈' };
    return { text: 'Poor', color: '#ef4444', icon: '⚠️' };
  };

  // Determine trend
  const getTrend = () => {
    // Use stored trend if available
    if (war?.trend) {
      if (war.trend === 'rising') return { text: 'Rising', color: '#10b981', icon: '↗️' };
      if (war.trend === 'falling') return { text: 'Falling', color: '#ef4444', icon: '↘️' };
      return { text: 'Stable', color: '#64748b', icon: '━' };
    }

    // Fallback to history calculation
    if (!warHistory || warHistory.length < 2) return { text: 'Stable', color: '#64748b', icon: '━' };
    
    const recent = warHistory.slice(-3);
    if (recent.length < 2) return { text: 'Stable', color: '#64748b', icon: '━' };
    
    const trend = recent[recent.length - 1].war - recent[0].war;
    if (trend > 0.05) return { text: 'Rising', color: '#10b981', icon: '↗️' };
    if (trend < -0.05) return { text: 'Falling', color: '#ef4444', icon: '↘️' };
    return { text: 'Stable', color: '#64748b', icon: '━' };
  };

  const efficiency = getEfficiencyRating(currentWAR);
  const trend = getTrend();

  if (compact) {
    return (
      <div className="warDisplayCompact">
        <div className="warCompactHeader">
          <span className="warCompactIcon">⚔️</span>
          <span className="warCompactScore">{currentWAR.toFixed(3)}</span>
          <span className="warCompactRating" style={{ color: efficiency.color }}>
            {efficiency.icon}
          </span>
        </div>
        
        <style jsx>{`
          .warDisplayCompact {
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            padding: 6px 12px;
            backdrop-filter: blur(4px);
          }

          .warCompactHeader {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .warCompactIcon {
            font-size: 12px;
            opacity: 0.7;
          }

          .warCompactScore {
            font-family: ${orbitron.style.fontFamily};
            font-size: 14px;
            font-weight: 600;
            color: #ffd700;
            letter-spacing: 0.05em;
          }

          .warCompactRating {
            font-size: 12px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="warDisplay">
      <div className="warHeader">
        <span className="warIcon">⚔️</span>
        <span className="warTitle">WAR Score</span>
        <button className="refreshBtn" onClick={updateWAR} title="Refresh WAR Score">
          🔄
        </button>
        <span className="warHelp" title="Wealth Asset Ratio - Your $WEALTH divided by Portfolio Value">?</span>
      </div>
      
      <div className="warMain">
        <div className="warScore">
          <span className={`${orbitron.className} warValue`}>
            {currentWAR.toFixed(3)}
          </span>
          <span className="warSubtext">
            ${wealth.toLocaleString()} ÷ ${portfolioValue.toLocaleString()}
          </span>
        </div>
        
        <div className="warMetrics">
          <div className="warMetric">
            <span className="metricIcon">{efficiency.icon}</span>
            <span className="metricLabel">Efficiency</span>
            <span className="metricValue" style={{ color: efficiency.color }}>
              {efficiency.text}
            </span>
          </div>
          
          <div className="warMetric">
            <span className="metricIcon">{trend.icon}</span>
            <span className="metricLabel">Trend</span>
            <span className="metricValue" style={{ color: trend.color }}>
              {trend.text}
            </span>
          </div>
          
          {war?.rank && (
            <div className="warMetric">
              <span className="metricIcon">🏆</span>
              <span className="metricLabel">Rank</span>
              <span className="metricValue" style={{ color: '#ffd700' }}>
                #{war.rank}
              </span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .warDisplay {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 16px;
          margin: 12px 0;
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        }

        .warHeader {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .warIcon {
          font-size: 18px;
        }

        .warTitle {
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #e6edf5;
        }

        .warHelp {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          font-size: 10px;
          color: #9aa7bd;
          cursor: help;
        }

        .refreshBtn {
          background: none;
          border: none;
          color: #9aa7bd;
          cursor: pointer;
          font-size: 14px;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
          margin-left: auto;
          margin-right: 8px;
        }

        .refreshBtn:hover {
          background: rgba(255,255,255,0.1);
          color: #ffd700;
          transform: rotate(180deg);
        }

        .warMain {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .warScore {
          text-align: center;
        }

        .warValue {
          display: block;
          font-size: 28px;
          font-weight: 800;
          color: #ffd700;
          text-shadow: 0 2px 4px rgba(255,215,0,0.3);
        }

        .warSubtext {
          display: block;
          font-size: 11px;
          color: #9aa7bd;
          margin-top: 4px;
        }

        .warMetrics {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
        }

        .warMetric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 8px 4px;
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
        }

        .metricIcon {
          font-size: 14px;
        }

        .metricLabel {
          font-size: 10px;
          color: #9aa7bd;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metricValue {
          font-size: 11px;
          font-weight: 600;
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .warMetrics {
            grid-template-columns: 1fr 1fr;
          }
          
          .warMetric:last-child {
            grid-column: 1 / -1;
            max-width: 120px;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}
