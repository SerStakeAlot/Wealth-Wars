'use client';

import { Orbitron } from 'next/font/google';
import { useGame } from '../app/lib/store';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

export function WARLeaderboard() {
  const { leaderboardPlayers } = useGame();

  // Sort players by WAR score
  const sortedPlayers = [...leaderboardPlayers]
    .filter(player => player.war && player.war.current > 0)
    .sort((a, b) => (b.war?.current || 0) - (a.war?.current || 0));

  const getEfficiencyColor = (efficiency: string) => {
    switch (efficiency) {
      case 'legendary': return '#f59e0b';
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'average': return '#f97316';
      case 'poor': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '↗️';
      case 'falling': return '↘️';
      case 'stable': return '━';
      default: return '━';
    }
  };

  return (
    <div className="warLeaderboard">
      <div className="leaderboardHeader">
        <span className="headerIcon">🏆</span>
        <h3 className={`${orbitron.className} headerTitle`}>WAR Rankings</h3>
        <span className="headerSubtext">Wealth Asset Ratio Leaders</span>
      </div>

      <div className="playersList">
        {sortedPlayers.length > 0 ? (
          sortedPlayers.map((player, index) => (
            <div key={player.id} className="playerRow">
              <div className="playerRank">
                <span className="rankNumber">#{index + 1}</span>
                {index < 3 && (
                  <span className="rankMedal">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                )}
              </div>
              
              <div className="playerInfo">
                <div className="playerName">
                  <span className="playerAvatar">{player.avatar}</span>
                  <span className="playerUsername">{player.username}</span>
                </div>
                <div className="playerMetrics">
                  <span className="playerWealth">
                    ${player.wealth?.toLocaleString() || '0'}
                  </span>
                  <span className="playerCredits">
                    {player.creditBalance?.toLocaleString() || '0'} credits
                  </span>
                </div>
              </div>

              <div className="warScores">
                <div className="warMain">
                  <span className={`${orbitron.className} warValue`}>
                    {player.war?.current?.toFixed(3) || '0.000'}
                  </span>
                  <span className="warTrend">
                    {getTrendIcon(player.war?.trend || 'stable')}
                  </span>
                </div>
                <div className="warDetails">
                  <span 
                    className="warEfficiency"
                    style={{ color: getEfficiencyColor(player.war?.efficiency || 'poor') }}
                  >
                    {player.war?.efficiency || 'unknown'}
                  </span>
                  <span className="warPeak">
                    Peak: {player.war?.peak?.toFixed(3) || '0.000'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="emptyState">
            <span className="emptyIcon">📊</span>
            <span className="emptyText">No WAR data available yet</span>
            <span className="emptySubtext">Play the game to see rankings!</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .warLeaderboard {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 20px;
          margin: 16px 0;
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        }

        .leaderboardHeader {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .headerIcon {
          font-size: 24px;
          display: block;
          margin-bottom: 8px;
        }

        .headerTitle {
          font-size: 20px;
          font-weight: 800;
          color: #ffd700;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .headerSubtext {
          font-size: 12px;
          color: #9aa7bd;
          display: block;
          margin-top: 4px;
        }

        .playersList {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .playerRow {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.2s ease;
        }

        .playerRow:hover {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,215,0,0.3);
        }

        .playerRank {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 50px;
        }

        .rankNumber {
          font-weight: 700;
          color: #ffd700;
          font-size: 14px;
        }

        .rankMedal {
          font-size: 16px;
          margin-top: 2px;
        }

        .playerInfo {
          flex: 1;
          min-width: 0;
        }

        .playerName {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .playerAvatar {
          font-size: 16px;
        }

        .playerUsername {
          font-weight: 600;
          color: #e6edf5;
          font-size: 14px;
        }

        .playerMetrics {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: #9aa7bd;
        }

        .warScores {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          min-width: 100px;
        }

        .warMain {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .warValue {
          font-size: 16px;
          font-weight: 700;
          color: #ffd700;
        }

        .warTrend {
          font-size: 12px;
        }

        .warDetails {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .warEfficiency {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .warPeak {
          font-size: 9px;
          color: #64748b;
        }

        .emptyState {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 40px 20px;
          color: #9aa7bd;
          text-align: center;
        }

        .emptyIcon {
          font-size: 32px;
          opacity: 0.5;
        }

        .emptyText {
          font-size: 14px;
          font-weight: 600;
        }

        .emptySubtext {
          font-size: 12px;
          opacity: 0.7;
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .playerRow {
            gap: 8px;
            padding: 10px;
          }
          
          .playerMetrics {
            flex-direction: column;
            gap: 2px;
          }
          
          .warScores {
            min-width: 80px;
          }
          
          .warValue {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
