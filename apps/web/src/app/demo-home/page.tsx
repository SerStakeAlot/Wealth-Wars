'use client';

import Link from 'next/link';
import { Orbitron } from 'next/font/google';
import { useEffect, useMemo, useState } from 'react';
import { isDemoSite, DEMO_SITE_CONFIG } from '../lib/demo-site-config';
import { useDemoGame } from '../lib/demo-store';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

/* ---------- Demo-Only Homepage Component ---------- */
export default function DemoHomePage() {
  const [isClient, setIsClient] = useState(false);
  const { leaderboard, updateLeaderboard } = useDemoGame();

  useEffect(() => {
    setIsClient(true);
    updateLeaderboard();
    
    // Update leaderboard every 30 seconds for live feel
    const interval = setInterval(updateLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [updateLeaderboard]);

  /* ---------- Background sprinkles ---------- */
  const dollarSpots = useMemo(
    () => [
      { top: '12%', left: '8%',  size: 52, rot: -8,  dur: 10 },
      { top: '22%', right: '10%', size: 64, rot: 6,   dur: 12 },
      { bottom: '18%', left: '14%', size: 58, rot: 3, dur: 11 },
      { bottom: '10%', right: '12%', size: 66, rot: -5, dur: 13 },
      { top: '48%', left: '50%', size: 50, rot: 0,    dur: 9  },
    ],
    []
  );

  if (!isClient) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <style jsx>{`
          .loading { display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); }
          .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const topPlayers = leaderboard.slice(0, 3);

  return (
    <div className="page">
      {/* Background elements */}
      <div className="sprinkles" aria-hidden="true">
        {dollarSpots.map((s, i) => (
          <div
            key={i}
            className="dollar"
            style={{
              position: 'absolute',
              ...('top' in s ? { top: s.top } : {}),
              ...('bottom' in s ? { bottom: s.bottom } : {}),
              ...('left' in s ? { left: s.left } : {}),
              ...('right' in s ? { right: s.right } : {}),
              fontSize: s.size,
              transform: `rotate(${s.rot}deg)`,
              animationDuration: `${s.dur}s`,
            }}
          >
            💰
          </div>
        ))}
      </div>

      {/* Demo Site Header */}
      <header className="demoHeader">
        <div className="headerContent">
          <div className="demoBadge">🎮 DEMO SITE</div>
          <div className="headerText">
            <span className="live">● LIVE</span>
            <span className="players">{leaderboard.length} Players Online</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="content">
        <div className="heroSection">
          <h1 className={`${orbitron.className} logo`}>WEALTH WARS</h1>
          <p className="subtitle">Competitive Demo Experience</p>
          
          <div className="valueProps">
            <div className="prop">
              <span className="icon">💰</span>
              <span>Start with 1000 $WEALTH</span>
            </div>
            <div className="prop">
              <span className="icon">⚡</span>
              <span>7-Day Competition Sessions</span>
            </div>
            <div className="prop">
              <span className="icon">🏆</span>
              <span>Live Leaderboard Rankings</span>
            </div>
          </div>

          <div className="actionButtons">
            <Link href="/demo">
              <button className="primaryBtn" aria-label="Start Playing">
                🚀 START PLAYING
              </button>
            </Link>
            
            <Link href="/demo">
              <button className="secondaryBtn" aria-label="View Leaderboard">
                📊 VIEW RANKINGS
              </button>
            </Link>
          </div>
        </div>

        {/* Live Leaderboard Preview */}
        {topPlayers.length > 0 && (
          <div className="leaderboardPreview">
            <h2 className="leaderboardTitle">🏆 Current Top Players</h2>
            <div className="topPlayers">
              {topPlayers.map((player, index) => (
                <div key={player.id} className={`playerCard rank${index + 1}`}>
                  <div className="rank">
                    {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className="playerInfo">
                    <div className="playerName">{player.name}</div>
                    <div className="playerWealth">${player.wealth.toLocaleString()}</div>
                  </div>
                  <div className="playerStats">
                    <span className="businesses">🏢 {player.businesses}</span>
                    <span className="battles">⚔️ {player.battles}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <Link href="/demo">
              <button className="viewAllBtn">View Full Leaderboard →</button>
            </Link>
          </div>
        )}

        {/* Demo Features */}
        <div className="features">
          <h2 className="featuresTitle">Why Play the Demo?</h2>
          <div className="featureGrid">
            <div className="feature">
              <div className="featureIcon">🎯</div>
              <h3>Instant Access</h3>
              <p>No wallet setup, no real money. Jump in and start building your empire immediately.</p>
            </div>
            
            <div className="feature">
              <div className="featureIcon">⚡</div>
              <h3>Fast-Paced Action</h3>
              <p>Reduced cooldowns mean more action. Work every 5 minutes, attack every 30 minutes.</p>
            </div>
            
            <div className="feature">
              <div className="featureIcon">🏆</div>
              <h3>Real Competition</h3>
              <p>Compete against other players in 7-day seasons. Climb the leaderboard and dominate!</p>
            </div>
            
            <div className="feature">
              <div className="featureIcon">🎮</div>
              <h3>Full Game Experience</h3>
              <p>Complete business system, battles, upgrades - everything from the main game.</p>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        html, body, #__next { height: 100%; margin: 0; padding: 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); }
        * { box-sizing: border-box; }
      `}</style>

      <style jsx>{`
        .page {
          position: relative; width: 100%; min-height: 100vh; color: #e6edf5; overflow-x: hidden;
        }

        .sprinkles { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
        .dollar { opacity: 0.15; animation: float linear infinite; }
        @keyframes float { 0% { transform: translateY(100vh) rotate(var(--rotation, 0deg)); } 100% { transform: translateY(-10vh) rotate(calc(var(--rotation, 0deg) + 360deg)); } }

        .demoHeader {
          position: sticky; top: 0; z-index: 10; background: rgba(30, 64, 175, 0.95); backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(59, 130, 246, 0.3); padding: 12px 20px;
        }
        .headerContent { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
        .demoBadge { 
          background: linear-gradient(90deg, #22c55e, #16a34a); color: white; padding: 6px 12px; 
          border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }
        .headerText { display: flex; gap: 16px; align-items: center; font-size: 14px; }
        .live { color: #22c55e; font-weight: 600; }
        .players { color: #cbd5e1; }

        .content { position: relative; z-index: 5; padding: 40px 20px; max-width: 1200px; margin: 0 auto; }

        .heroSection { text-align: center; margin-bottom: 80px; }
        
        .logo {
          font-size: clamp(48px, 10vw, 120px); margin: 0 0 16px 0; letter-spacing: 0.12em; 
          text-transform: uppercase; font-weight: 800;
          background: linear-gradient(180deg, #fff6c7 0%, #ffe89a 14%, #f9c742 28%, #b07c24 42%, #f2d271 58%, #ffd34a 72%, #9b6a1a 86%, #ffd98c 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          text-shadow: 0 2px 0 rgba(0,0,0,0.12), 0 10px 24px rgba(255,199,84,0.18);
        }

        .subtitle { 
          font-size: 24px; color: #3b82f6; font-weight: 600; margin-bottom: 32px;
          text-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }

        .valueProps { display: flex; justify-content: center; gap: 32px; margin-bottom: 48px; flex-wrap: wrap; }
        .prop { display: flex; align-items: center; gap: 8px; color: #e2e8f0; font-weight: 500; }
        .prop .icon { font-size: 20px; }

        .actionButtons { display: flex; justify-content: center; gap: 16px; margin-bottom: 48px; flex-wrap: wrap; }
        
        .primaryBtn {
          border: none; padding: 20px 40px; font-size: 18px; font-weight: 800; text-transform: uppercase; 
          letter-spacing: 0.1em; border-radius: 12px; cursor: pointer; background: linear-gradient(180deg, #22c55e, #166534); 
          color: #fff; box-shadow: 0 8px 20px rgba(22,101,52,0.4), 0 0 0 2px rgba(34,197,94,0.1) inset;
          transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
        }
        .primaryBtn:hover { 
          transform: translateY(-3px); box-shadow: 0 12px 28px rgba(22,101,52,0.5), 0 0 0 2px rgba(34,197,94,0.2) inset; 
          filter: brightness(1.05); 
        }

        .secondaryBtn {
          border: 2px solid #3b82f6; padding: 18px 36px; font-size: 16px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.1em; border-radius: 12px; cursor: pointer; background: rgba(59, 130, 246, 0.1);
          color: #3b82f6; transition: all 120ms ease; backdrop-filter: blur(10px);
        }
        .secondaryBtn:hover { 
          background: rgba(59, 130, 246, 0.2); transform: translateY(-2px); 
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .leaderboardPreview { 
          background: rgba(255,255,255,0.06); border-radius: 16px; padding: 32px; margin-bottom: 80px;
          border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);
        }
        .leaderboardTitle { 
          text-align: center; font-size: 28px; font-weight: 700; margin-bottom: 24px; color: #fbbf24; 
        }
        .topPlayers { display: flex; gap: 16px; margin-bottom: 24px; justify-content: center; flex-wrap: wrap; }
        
        .playerCard { 
          background: rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; min-width: 200px;
          border: 1px solid rgba(255,255,255,0.1); transition: transform 120ms ease;
        }
        .playerCard:hover { transform: translateY(-2px); }
        .playerCard.rank1 { border-color: rgba(251, 191, 36, 0.4); background: rgba(251, 191, 36, 0.1); }
        .playerCard.rank2 { border-color: rgba(156, 163, 175, 0.4); background: rgba(156, 163, 175, 0.1); }
        .playerCard.rank3 { border-color: rgba(205, 127, 50, 0.4); background: rgba(205, 127, 50, 0.1); }

        .rank { text-align: center; font-size: 24px; margin-bottom: 8px; }
        .playerName { font-weight: 700; font-size: 16px; text-align: center; margin-bottom: 4px; }
        .playerWealth { 
          color: #22c55e; font-weight: 700; font-size: 18px; text-align: center; margin-bottom: 8px; 
        }
        .playerStats { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; }

        .viewAllBtn {
          display: block; margin: 0 auto; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6;
          color: #3b82f6; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;
          transition: all 120ms ease;
        }
        .viewAllBtn:hover { background: rgba(59, 130, 246, 0.3); transform: translateY(-1px); }

        .features { margin-bottom: 80px; }
        .featuresTitle { text-align: center; font-size: 32px; font-weight: 700; margin-bottom: 48px; }
        .featureGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; }
        
        .feature { 
          background: rgba(255,255,255,0.06); border-radius: 12px; padding: 24px; text-align: center;
          border: 1px solid rgba(255,255,255,0.1); transition: transform 120ms ease;
        }
        .feature:hover { transform: translateY(-2px); }
        .featureIcon { font-size: 48px; margin-bottom: 16px; }
        .feature h3 { font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #e2e8f0; }
        .feature p { color: #94a3b8; line-height: 1.5; }

        @media (max-width: 768px) {
          .valueProps { flex-direction: column; align-items: center; gap: 16px; }
          .actionButtons { flex-direction: column; align-items: center; }
          .topPlayers { flex-direction: column; align-items: center; }
          .headerContent { flex-direction: column; gap: 8px; }
        }
      `}</style>
    </div>
  );
}
