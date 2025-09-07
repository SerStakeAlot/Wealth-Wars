'use client';

import { useState, useEffect } from 'react';
import { Inter, Orbitron } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useGame } from '../lib/store';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

export default function ForbesListPage() {
  const router = useRouter();
  const { 
    level, xp, wealth, liquidity, prestige, clanEligible, 
    leaderboardPlayers, refreshLeaderboard, viewPlayerProfile, selectedPlayer
  } = useGame();
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedPlayerModalOpen, setSelectedPlayerModalOpen] = useState(false);

  useEffect(() => {
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  const handlePlayerClick = (playerId: string) => {
    viewPlayerProfile(playerId);
    setSelectedPlayerModalOpen(true);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  const calculatePlayerWAR = (player: any) => {
    // Calculate portfolio value from business assets
    const portfolioValue = 
      (player.business?.lemStand || 0) * 10 +
      (player.business?.cafe || 0) * 50 +
      (player.business?.factory || 0) * 200;
    
    if (portfolioValue === 0) return 0;
    return player.wealth / portfolioValue;
  };

  const getWARRating = (warScore: number) => {
    if (warScore >= 0.8) return { icon: '👑', color: '#f59e0b' };
    if (warScore >= 0.6) return { icon: '💎', color: '#10b981' };
    if (warScore >= 0.4) return { icon: '⭐', color: '#3b82f6' };
    if (warScore >= 0.2) return { icon: '📈', color: '#f97316' };
    return { icon: '⚠️', color: '#ef4444' };
  };

  return (
    <div className={`${inter.className} page`}>
      {/* HEADER / HUD */}
      <header className="hud">
        <div className="brand">
          <span className={`${orbitron.className} logo`}>WEALTH WARS</span>
          <span className="mode">FORBES LIST</span>
        </div>

        <div className="stats">
          <div className="stat"><span className="k">Your Rank</span><span className={`${orbitron.className} v`}>#?</span></div>
          <div className="stat"><span className="k">Credits</span><span className={`${orbitron.className} v`}>{wealth}</span></div>
          <div className="stat"><span className="k">Players</span><span className={`${orbitron.className} v`}>{leaderboardPlayers.length}</span></div>
          <div className="stat"><span className="k">Active</span><span className={`${orbitron.className} v`}>{leaderboardPlayers.filter(p => formatTimeAgo(p.lastActive) === 'Just now' || formatTimeAgo(p.lastActive).includes('h')).length}</span></div>
        </div>

        <div className="actions">
          <div className="modeTabs">
            <button className="modeBtn" onClick={() => router.push('/game')}>Play</button>
            <button className="modeBtn active" onClick={() => router.push('/forbes')}>Forbes List</button>
          </div>
          <button className="profileBtn" onClick={() => setProfileOpen(true)}>View Profile</button>
          <button className="profileBtn" onClick={() => refreshLeaderboard()} title="Refresh">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M8 16H3v5"/>
            </svg>
          </button>
        </div>
      </header>

      {/* FORBES BANNER */}
      <section className="banner">
        <div className="dot good" />
        <div className="msg">
          💰 Welcome to the Wealth Wars Forbes List - Track top players and their empire strategies
        </div>
      </section>

      {/* TOP 3 PODIUM */}
      <section className="podium">
        {leaderboardPlayers.slice(0, 3).map((player, index) => (
          <div 
            key={player.id} 
            className={`podiumCard ${index === 0 ? 'first' : index === 1 ? 'second' : 'third'}`}
            onClick={() => handlePlayerClick(player.id)}
          >
            <div className="podiumRank">#{player.rank}</div>
            <div className="podiumAvatar">{player.avatar}</div>
            <div className="podiumName">{player.username}</div>
            <div className="podiumCredits">{player.creditBalance.toLocaleString()} credits</div>
            <div className="podiumWorkActions">{player.totalWorkActions || 0} work actions</div>
            {player.clan && <div className="podiumClan">{player.clan}</div>}
          </div>
        ))}
      </section>

      {/* LEADERBOARD TABLE */}
      <main className="tableWrap">
        <div className="tableHeader">
          <h3 className={`${orbitron.className} tableTitle`}>Global Leaderboard</h3>
          <span className="tableSubtitle">Click on any player to view their business strategy</span>
        </div>
        
        <table className="leaderboardTable">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Credits</th>
              <th>Work Actions</th>
              <th>Streak</th>
              <th>Business Empire</th>
              <th>Success Rate</th>
              <th>Clan</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardPlayers.map(player => (
              <tr key={player.id} className="playerRow" onClick={() => handlePlayerClick(player.id)}>
                <td>
                  <div className="rankCell">
                    <span className={`rank ${player.rank <= 3 ? 'top3' : ''}`}>#{player.rank}</span>
                  </div>
                </td>
                <td>
                  <div className="playerCell">
                    <span className="avatar">{player.avatar}</span>
                    <div className="playerInfo">
                      <span className="username">{player.username}</span>
                      <div className="levelWarInfo">
                        <span className="level">Level {player.level}</span>
                        {(() => {
                          const warScore = calculatePlayerWAR(player);
                          const warRating = getWARRating(warScore);
                          return (
                            <span className="warScore" style={{ color: warRating.color }}>
                              {warRating.icon} {warScore.toFixed(3)}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="creditsCell">
                    <span className="credits">{player.creditBalance.toLocaleString()}</span>
                    <span className="creditsLabel">credits</span>
                  </div>
                </td>
                <td>
                  <span className="workActions">{player.totalWorkActions || 0}</span>
                </td>
                <td>
                  <div className="streakCell">
                    <span className="streak">{player.streakDays}</span>
                    <span className="streakLabel">days</span>
                  </div>
                </td>
                <td>
                  <div className="businessCell">
                    <div className="businessItem">🥤 {player.business.lemStand}</div>
                    <div className="businessItem">☕ {player.business.cafe}</div>
                    <div className="businessItem">🏭 {player.business.factory}</div>
                  </div>
                </td>
                <td>
                  <div className="successRateCell">
                    <span className="successRate">{player.takeoverSuccessRate || 0}%</span>
                    <span className="successLabel">({player.takeoverWins || 0}W/{player.takeoverLosses || 0}L)</span>
                  </div>
                </td>
                <td>
                  {player.clan ? (
                    <span className="clan">{player.clan}</span>
                  ) : (
                    <span className="noClan">No Clan</span>
                  )}
                </td>
                <td>
                  <span className="lastActive">{formatTimeAgo(player.lastActive)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* PLAYER PROFILE MODAL */}
      {selectedPlayerModalOpen && selectedPlayer && (
        <div className="modalOverlay" onClick={() => setSelectedPlayerModalOpen(false)}>
          <div className="playerModal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div className="modalPlayerInfo">
                <span className="modalAvatar">{selectedPlayer.avatar}</span>
                <div>
                  <h3 className={`${orbitron.className} modalUsername`}>{selectedPlayer.username}</h3>
                  <p className="modalRank">Rank #{selectedPlayer.rank} • Level {selectedPlayer.level}</p>
                </div>
              </div>
              <button className="modalClose" onClick={() => setSelectedPlayerModalOpen(false)}>✕</button>
            </div>
            
            <div className="modalContent">
              <div className="modalSection">
                <h4>Performance Stats</h4>
                <div className="modalStats">
                  <div className="modalStat">
                    <span className="modalStatLabel">Credits</span>
                    <span className="modalStatValue">{selectedPlayer.creditBalance.toLocaleString()}</span>
                  </div>
                  <div className="modalStat">
                    <span className="modalStatLabel">Work Actions</span>
                    <span className="modalStatValue">{selectedPlayer.totalWorkActions || 0}</span>
                  </div>
                  <div className="modalStat">
                    <span className="modalStatLabel">Streak</span>
                    <span className="modalStatValue">{selectedPlayer.streakDays} days</span>
                  </div>
                  <div className="modalStat">
                    <span className="modalStatLabel">Wealth</span>
                    <span className="modalStatValue">{selectedPlayer.wealth.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="modalSection">
                <h4>Business Empire</h4>
                <div className="modalBusiness">
                  <div className="modalBusinessItem">
                    <span className="businessIcon">🥤</span>
                    <span className="businessName">Lemonade Stands</span>
                    <span className="businessCount">{selectedPlayer.business.lemStand}</span>
                  </div>
                  <div className="modalBusinessItem">
                    <span className="businessIcon">☕</span>
                    <span className="businessName">Coffee Cafes</span>
                    <span className="businessCount">{selectedPlayer.business.cafe}</span>
                  </div>
                  <div className="modalBusinessItem">
                    <span className="businessIcon">🏭</span>
                    <span className="businessName">Widget Factories</span>
                    <span className="businessCount">{selectedPlayer.business.factory}</span>
                  </div>
                  <div className="modalBusinessSummary">
                    <span>Click Bonus: +{selectedPlayer.business.clickBonusPerDay} credits/click</span>
                  </div>
                </div>
              </div>

              <div className="modalSection">
                <h4>Profile Info</h4>
                <div className="modalInfo">
                  <div className="modalInfoItem">
                    <span className="modalInfoLabel">Clan:</span>
                    <span className="modalInfoValue">{selectedPlayer.clan || 'No Clan'}</span>
                  </div>
                  <div className="modalInfoItem">
                    <span className="modalInfoLabel">Joined:</span>
                    <span className="modalInfoValue">{new Date(selectedPlayer.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="modalInfoItem">
                    <span className="modalInfoLabel">Last Active:</span>
                    <span className="modalInfoValue">{formatTimeAgo(selectedPlayer.lastActive)}</span>
                  </div>
                  <div className="modalInfoItem">
                    <span className="modalInfoLabel">XP:</span>
                    <span className="modalInfoValue">{selectedPlayer.xp}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE SLIDE-OUT */}
      <aside className={`drawer ${profileOpen ? 'open' : ''}`}>
        <div className="drawerHead">
          <h4 className={`${orbitron.className} drawerTitle`}>Player Profile</h4>
          <button className="x" onClick={() => setProfileOpen(false)}>✕</button>
        </div>

        <div className="profileRows">
          <div className="pRow"><span className="pKey">Level</span><span className="pVal">{level}</span></div>
          <div className="pRow"><span className="pKey">XP</span><span className="pVal">{xp}/100</span></div>
          <div className="pRow"><span className="pKey">$WEALTH</span><span className="pVal">{wealth}</span></div>
          <div className="pRow"><span className="pKey">Liquidity</span><span className="pVal">{Math.round(liquidity*100)}%</span></div>
          <div className="pRow"><span className="pKey">Prestige</span><span className="pVal">{prestige}</span></div>
        </div>

        <div className="sep" />

        <div className="navTabs">
          <button className="navBtn" onClick={() => router.push('/game')}>Play Mode</button>
          <button className="navBtn active" onClick={() => router.push('/forbes')}>Forbes List</button>
        </div>

        <div className="sep" />

        {clanEligible && (
          <div className="clanCta">
            <h5>Clan Invitation</h5>
            <p>You've reached the minimum level to join a clan!</p>
            <button className="btn primary">Join Clan</button>
          </div>
        )}

        <div className="sep" />

        <div className="nftWrap">
          <h5 className="nftTitle">Owned Cosmetics</h5>
          <ul className="nftList">
            <li>Badge: Early Founder</li>
            <li>Wearable: Golden Visor</li>
            <li>Frame: Emerald Edge</li>
          </ul>
        </div>
      </aside>

      {(profileOpen || selectedPlayerModalOpen) && <div className="mask" onClick={() => {
        setProfileOpen(false);
        setSelectedPlayerModalOpen(false);
      }} />}

      {/* STYLES */}
      <style jsx>{`
        .page { 
          min-height: 100vh; 
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
          color: #e6edf5; 
          display: flex; 
          flex-direction: column; 
        }

        /* Header */
        .hud {
          display: grid; 
          grid-template-columns: 1fr auto 1fr; 
          align-items: center;
          gap: 12px; 
          padding: 16px 20px; 
          background: rgba(255,255,255,0.06); 
          border-bottom: 2px solid #ffd700;
          position: sticky; 
          top: 0; 
          z-index: 5; 
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 12px rgba(255,215,0,0.2);
        }

        .brand { 
          font-weight: 800; 
          display: flex; 
          flex-direction: column; 
          align-items: flex-start; 
        }

        .logo {
          letter-spacing: 0.12em; 
          text-transform: uppercase;
          background: linear-gradient(180deg,#fff6c7,#ffd34a 72%,#9b6a1a);
          -webkit-background-clip: text; 
          background-clip: text; 
          color: transparent;
        }

        .mode { 
          font-size: 12px; 
          color: #9aa7bd; 
          letter-spacing: 0.08em; 
          text-transform: uppercase; 
        }

        .stats { 
          display: grid; 
          grid-auto-flow: column; 
          gap: 12px; 
        }

        .stat { 
          background: rgba(255,255,255,0.06); 
          border: 2px solid #ffd700; 
          border-radius: 10px; 
          padding: 8px 12px; 
          text-align: center; 
          min-width: 110px;
          box-shadow: 0 2px 8px rgba(255,215,0,0.2);
        }

        .k { 
          font-size: 11px; 
          color: #9aa7bd; 
          letter-spacing: 0.08em; 
          text-transform: uppercase; 
        }

        .v { 
          font-size: 18px; 
          font-weight: 800; 
          color: #e6edf5; 
        }

        .actions { 
          justify-self: end; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
        }

        .modeTabs { 
          display: flex; 
          gap: 4px; 
        }

        .modeBtn { 
          padding: 6px 12px; 
          border: 2px solid #ffd700; 
          background: rgba(255,255,255,0.06); 
          color: #e6edf5; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 12px;
          transition: all 0.2s;
        }

        .modeBtn.active { 
          background: linear-gradient(180deg, #1e2a4d, #172554); 
          color: #fff; 
        }

        .modeBtn:hover:not(.active) {
          background: rgba(255,255,255,0.12);
        }

        .profileBtn { 
          border: 2px solid #ffd700; 
          background: rgba(255,255,255,0.06); 
          color: #e6edf5; 
          padding: 8px 12px; 
          border-radius: 8px; 
          cursor: pointer;
          transition: all 0.2s;
        }

        .profileBtn:hover {
          background: rgba(255,255,255,0.12);
        }

        /* Banner */
        .banner { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          margin: 10px 16px; 
          padding: 12px 14px; 
          background: rgba(255,255,255,0.06); 
          border: 2px solid #ffd700; 
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(255,215,0,0.2);
        }

        .dot { 
          width: 10px; 
          height: 10px; 
          border-radius: 999px; 
          background: #22c55e; 
        }

        .msg { 
          font-weight: 600; 
          color: #e6edf5; 
        }

        /* Podium */
        .podium {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 16px;
          max-width: 800px;
          margin: 0 auto;
        }

        .podiumCard {
          background: rgba(255,255,255,0.06);
          border: 2px solid #ffd700;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .podiumCard.first {
          border-color: #ffd700;
          box-shadow: 0 4px 20px rgba(255,215,0,0.4);
        }

        .podiumCard.second {
          border-color: #c0c0c0;
          box-shadow: 0 4px 20px rgba(192,192,192,0.2);
        }

        .podiumCard.third {
          border-color: #cd7f32;
          box-shadow: 0 4px 20px rgba(205,127,50,0.2);
        }

        .podiumCard:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(255,215,0,0.3);
        }

        .podiumRank {
          font-size: 24px;
          font-weight: 800;
          color: #ffd700;
          margin-bottom: 8px;
        }

        .podiumAvatar {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .podiumName {
          font-weight: 700;
          font-size: 16px;
          color: #e6edf5;
          margin-bottom: 4px;
        }

        .podiumCredits {
          font-weight: 600;
          color: #22c55e;
          margin-bottom: 2px;
        }

        .podiumWorkActions {
          font-size: 12px;
          color: #9aa7bd;
          margin-bottom: 8px;
        }

        .podiumClan {
          font-size: 12px;
          color: #3b82f6;
          background: rgba(59,130,246,0.1);
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
        }

        /* Leaderboard Table */
        .tableWrap { 
          padding: 16px; 
          overflow-x: auto; 
          flex: 1;
        }

        .warSection {
          padding: 0 16px 16px 16px;
          max-width: 800px;
          margin: 0 auto;
        }

        .tableHeader {
          margin-bottom: 16px;
          text-align: center;
        }

        .tableTitle {
          margin: 0;
          font-size: 24px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #e6edf5;
        }

        .tableSubtitle {
          color: #9aa7bd;
          font-size: 14px;
          margin-top: 4px;
          display: block;
        }

        .leaderboardTable { 
          width: 100%; 
          border-collapse: collapse; 
          background: rgba(255,255,255,0.06); 
          border: 2px solid #ffd700; 
          border-radius: 14px; 
          overflow: hidden; 
          box-shadow: 0 6px 24px rgba(255,215,0,0.2); 
          backdrop-filter: blur(8px); 
        }

        .leaderboardTable th, .leaderboardTable td { 
          padding: 12px; 
          text-align: left; 
          border-bottom: 1px solid rgba(255,255,255,0.12); 
          color: #e6edf5; 
        }

        .leaderboardTable th { 
          background: rgba(255,255,255,0.03); 
          font-weight: 600; 
          color: #ffd700;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.05em;
        }

        .playerRow {
          cursor: pointer;
          transition: all 0.2s;
        }

        .playerRow:hover {
          background: rgba(255,255,255,0.08);
        }

        .rankCell {
          text-align: center;
        }

        .rank {
          font-weight: 800;
          font-size: 16px;
        }

        .rank.top3 {
          color: #ffd700;
        }

        .playerCell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          font-size: 24px;
        }

        .playerInfo {
          display: flex;
          flex-direction: column;
        }

        .username {
          font-weight: 700;
          color: #e6edf5;
        }

        .level {
          font-size: 12px;
          color: #9aa7bd;
        }

        .levelWarInfo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .warScore {
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .creditsCell {
          display: flex;
          flex-direction: column;
        }

        .credits {
          font-weight: 700;
          color: #22c55e;
        }

        .creditsLabel {
          font-size: 12px;
          color: #9aa7bd;
        }

        .workActions {
          font-weight: 600;
          color: #e6edf5;
        }

        .streakCell {
          display: flex;
          flex-direction: column;
        }

        .streak {
          font-weight: 700;
          color: #f59e0b;
        }

        .streakLabel {
          font-size: 12px;
          color: #9aa7bd;
        }

        .businessCell {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .businessItem {
          background: rgba(255,255,255,0.06);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .successRateCell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .successRate {
          font-weight: 600;
          font-size: 14px;
          color: #10b981;
        }

        .successLabel {
          font-size: 11px;
          color: #9aa7bd;
        }

        .clan {
          color: #3b82f6;
          font-weight: 600;
        }

        .noClan {
          color: #9aa7bd;
          font-style: italic;
        }

        .lastActive {
          color: #9aa7bd;
          font-size: 12px;
        }

        /* Player Profile Modal */
        .modalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          backdrop-filter: blur(4px);
        }

        .playerModal {
          background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06));
          border: 2px solid #ffd700;
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(255,215,0,0.3);
          backdrop-filter: blur(12px);
        }

        .modalHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }

        .modalPlayerInfo {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .modalAvatar {
          font-size: 40px;
        }

        .modalUsername {
          margin: 0;
          color: #e6edf5;
          font-size: 24px;
        }

        .modalRank {
          margin: 4px 0 0 0;
          color: #9aa7bd;
          font-size: 14px;
        }

        .modalClose {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 8px 12px;
          color: #9aa7bd;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modalClose:hover {
          background: rgba(255,255,255,0.12);
          color: #e6edf5;
        }

        .modalContent {
          padding: 20px;
        }

        .modalSection {
          margin-bottom: 24px;
        }

        .modalSection h4 {
          margin: 0 0 12px 0;
          color: #ffd700;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .modalStats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .modalStat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }

        .modalStatLabel {
          display: block;
          font-size: 12px;
          color: #9aa7bd;
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        .modalStatValue {
          display: block;
          font-weight: 700;
          font-size: 16px;
          color: #e6edf5;
        }

        .modalBusiness {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 16px;
        }

        .modalBusinessItem {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .modalBusinessItem:last-child {
          border-bottom: none;
        }

        .businessIcon {
          font-size: 20px;
        }

        .businessName {
          flex: 1;
          color: #e6edf5;
          font-weight: 600;
        }

        .businessCount {
          color: #22c55e;
          font-weight: 700;
          font-size: 18px;
        }

        .modalBusinessSummary {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.08);
          color: #f59e0b;
          font-weight: 600;
          text-align: center;
        }

        .modalInfo {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 16px;
        }

        .modalInfoItem {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .modalInfoItem:last-child {
          border-bottom: none;
        }

        .modalInfoLabel {
          color: #9aa7bd;
          font-weight: 600;
        }

        .modalInfoValue {
          color: #e6edf5;
          font-weight: 700;
        }

        /* Profile Drawer */
        .drawer {
          position: fixed; 
          top: 0; 
          right: 0; 
          height: 100vh; 
          width: 360px; 
          background: rgba(255,255,255,0.06);
          border-left: 2px solid #ffd700; 
          transform: translateX(100%); 
          transition: transform 200ms ease;
          z-index: 50; 
          box-shadow: -8px 0 24px rgba(255,215,0,0.3); 
          padding: 16px; 
          backdrop-filter: blur(8px);
        }

        .drawer.open { 
          transform: translateX(0); 
        }

        .drawerHead { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
        }

        .drawerTitle { 
          margin: 0; 
          letter-spacing: 0.1em; 
          text-transform: uppercase; 
          color: #e6edf5; 
        }

        .x { 
          border: 1px solid rgba(255,255,255,0.12); 
          background: rgba(255,255,255,0.06); 
          border-radius: 8px; 
          padding: 6px 10px; 
          cursor: pointer; 
          color: #9aa7bd; 
        }

        .profileRows { 
          margin-top: 12px; 
          display: grid; 
          gap: 8px; 
        }

        .pRow { 
          display: flex; 
          justify-content: space-between; 
        }

        .pKey { 
          color: #9aa7bd; 
        }

        .pVal { 
          font-weight: 700; 
          color: #e6edf5; 
        }

        .sep { 
          height: 1px; 
          background: rgba(255,255,255,0.12); 
          margin: 14px 0; 
        }

        .nftTitle { 
          margin: 0 0 8px 0; 
          color: #e6edf5; 
        }

        .nftList { 
          margin: 0; 
          padding-left: 16px; 
          color: #9aa7bd; 
        }

        .navTabs { 
          display: flex; 
          gap: 8px; 
        }

        .navBtn { 
          flex: 1; 
          padding: 10px; 
          border: 2px solid #ffd700; 
          background: rgba(255,255,255,0.06); 
          color: #e6edf5; 
          border-radius: 8px; 
          cursor: pointer;
          transition: all 0.2s;
        }

        .navBtn.active { 
          background: linear-gradient(180deg, #1e2a4d, #172554); 
          color: #fff; 
        }

        .navBtn:hover:not(.active) {
          background: rgba(255,255,255,0.12);
        }

        .clanCta { 
          background: rgba(59,130,246,0.1); 
          border: 1px solid rgba(59,130,246,0.3); 
          border-radius: 12px; 
          padding: 16px; 
          margin: 16px 0; 
        }

        .clanCta h5 { 
          margin: 0 0 8px 0; 
          color: #3b82f6; 
        }

        .clanCta p { 
          margin: 0 0 12px 0; 
          color: #9aa7bd; 
        }

        .btn { 
          border-radius: 10px; 
          padding: 6px 10px; 
          cursor: pointer; 
          font-size: 12px; 
        }

        .primary { 
          border: 1px solid rgba(255,255,255,0.16); 
          background: linear-gradient(180deg, #1e2a4d, #172554); 
          color: #fff; 
        }

        .mask { 
          position: fixed; 
          inset: 0; 
          background: rgba(15,23,42,0.5); 
          z-index: 10; 
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .podium {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .leaderboardTable {
            font-size: 14px;
          }

          .leaderboardTable th, .leaderboardTable td {
            padding: 8px;
          }

          .hud {
            grid-template-columns: 1fr;
            gap: 8px;
            text-align: center;
          }

          .stats {
            grid-auto-flow: row;
            grid-template-columns: repeat(2, 1fr);
          }

          .actions {
            justify-self: center;
          }

          .businessCell {
            flex-direction: column;
            gap: 4px;
          }

          .modalStats {
            grid-template-columns: repeat(2, 1fr);
          }

          .playerModal {
            width: 95%;
            margin: 10px;
          }
        }

        @media (max-width: 480px) {
          .stats {
            grid-template-columns: 1fr;
          }

          .stat {
            min-width: auto;
          }

          .tableWrap {
            padding: 8px;
          }

          .podiumCard {
            padding: 16px;
          }

          .modalContent {
            padding: 16px;
          }

          .modalStats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
