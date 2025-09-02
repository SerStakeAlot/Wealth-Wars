'use client';

import { useState } from 'react';
import { Inter, Orbitron } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useGame } from '../lib/store';
import { getPriceInSol, recordSwap } from '../lib/price';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

function SwapForm() {
  const [amount, setAmount] = useState(0);
  const [fromToken, setFromToken] = useState('WEALTH');
  const [toToken, setToToken] = useState('SOL');

  const handleSwap = () => {
    recordSwap({ amount, fromToken, toToken });
    alert(`Swapped ${amount} ${fromToken} to ${toToken}`);
  };

  const pnlValue = amount * getPriceInSol(fromToken) / getPriceInSol(toToken);

  return (
    <div className="swapForm">
      <div className="swapRow">
        <label>Amount:</label>
        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </div>
      <div className="swapRow">
        <label>From:</label>
        <select value={fromToken} onChange={(e) => setFromToken(e.target.value)}>
          <option value="WEALTH">WEALTH</option>
          <option value="SOL">SOL</option>
          <option value="USDC">USDC</option>
        </select>
      </div>
      <div className="swapRow">
        <label>To:</label>
        <select value={toToken} onChange={(e) => setToToken(e.target.value)}>
          <option value="WEALTH">WEALTH</option>
          <option value="SOL">SOL</option>
          <option value="USDC">USDC</option>
        </select>
      </div>
      <div className="swapRow">
        <span>PnL Value: {pnlValue.toFixed(2)} {toToken}</span>
      </div>
      <button className="btn primary" onClick={handleSwap}>Swap</button>
    </div>
  );
}

export default function TradePage() {
  const router = useRouter();
  const { level, xp, wealth, liquidity, assets, collect, upgrade, defend, prestige, clanEligible, pnlSeries } = useGame();
  const [profileOpen, setProfileOpen] = useState(false);

  const lowLiquidity = liquidity < 0.12;
  const anyWeakAsset = assets.some(a => a.condition < 35);

  const assetValue = assets.reduce((sum, a) => sum + a.yieldPerTick * a.level, 0);
  const avgCondition = assets.reduce((sum, a) => sum + a.condition, 0) / assets.length;
  const risk = Math.round(100 - avgCondition);
  const pnl = pnlSeries();

  return (
    <div className={`${inter.className} page`}>
      {/* HEADER / HUD */}
      <header className="hud">
        <div className="brand">
          <span className={`${orbitron.className} logo`}>WEALTH WARS</span>
          <span className="mode">TRADE MODE</span>
        </div>

        <div className="stats">
          <div className="stat"><span className="k">Level</span><span className={`${orbitron.className} v`}>{level}</span></div>
          <div className="stat"><span className="k">XP</span><span className={`${orbitron.className} v`}>{xp}/100</span></div>
          <div className="stat"><span className="k">$WEALTH</span><span className={`${orbitron.className} v`}>{wealth}</span></div>
          <div className="stat"><span className="k">Liquidity</span><span className={`${orbitron.className} v`}>{Math.round(liquidity*100)}%</span></div>
        </div>

        <div className="actions">
          <div className="modeTabs">
            <button className="modeBtn" onClick={() => router.push('/game')}>Play</button>
            <button className="modeBtn active" onClick={() => router.push('/trade')}>Trade</button>
          </div>
          <button className="profileBtn" onClick={() => setProfileOpen(true)}>View Profile</button>
          <button className="profileBtn" onClick={() => window.location.reload()} title="Refresh">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M8 16H3v5"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ALERT BANNER */}
      <section className="banner">
        <div className={`dot ${lowLiquidity || anyWeakAsset ? 'bad' : 'good'}`} />
        <div className="msg">
          {lowLiquidity
            ? 'Warning: Liquidity is low — assets vulnerable to takeover.'
            : anyWeakAsset
              ? 'Some assets are weakening — consider defense or upgrades.'
              : 'All systems stable — keep compounding your gains.'}
        </div>
      </section>

      {/* KPI PANEL */}
      <section className="kpi">
        <div className="kpiCard">
          <span className="kpiLabel">WAR</span>
          <span className={`${orbitron.className} kpiValue`}>{level}</span>
        </div>
        <div className="kpiCard">
          <span className="kpiLabel">Wealth</span>
          <span className={`${orbitron.className} kpiValue`}>{wealth}</span>
        </div>
        <div className="kpiCard">
          <span className="kpiLabel">Asset Value</span>
          <span className={`${orbitron.className} kpiValue`}>{assetValue}</span>
        </div>
        <div className="kpiCard">
          <span className="kpiLabel">Risk</span>
          <span className={`${orbitron.className} kpiValue`}>{risk}%</span>
        </div>
      </section>

      {/* ASSET TABLE */}
      <main className="tableWrap">
        <table className="assetTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Level</th>
              <th>Yield</th>
              <th>Condition</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.name}</td>
                <td>{a.level}</td>
                <td>{a.yieldPerTick}</td>
                <td>{a.condition}%</td>
                <td>{a.yieldPerTick * a.level}</td>
                <td className="actionsCell">
                  <button className="btn primary" onClick={() => collect(a.id)} disabled={Date.now() < a.cooldowns.collect}>
                    Collect {Date.now() < a.cooldowns.collect ? `(${Math.ceil((a.cooldowns.collect - Date.now()) / 1000)}s)` : ''}
                  </button>
                  <button className="btn dark" disabled={wealth < a.upgradeCost || Date.now() < a.cooldowns.upgrade} onClick={() => upgrade(a.id)} style={{ opacity: wealth < a.upgradeCost || Date.now() < a.cooldowns.upgrade ? 0.55 : 1 }}>
                    Upgrade {Date.now() < a.cooldowns.upgrade ? `(${Math.ceil((a.cooldowns.upgrade - Date.now()) / 1000)}s)` : ''}
                  </button>
                  <button className="btn ghost" onClick={() => defend(a.id)} disabled={Date.now() < a.cooldowns.defend}>
                    Defend {Date.now() < a.cooldowns.defend ? `(${Math.ceil((a.cooldowns.defend - Date.now()) / 1000)}s)` : ''}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* EQUITY CHART PLACEHOLDER */}
      <section className="chart">
        <h3 className={`${orbitron.className} chartTitle`}>Equity Chart</h3>
        <div className="chartPlaceholder">
          <p>PnL Series: {Array.isArray(pnl) ? pnl.join(', ') : 'N/A'}</p>
          <p>Chart will be integrated here using Lightweight Charts.</p>
        </div>
      </section>

      {/* SWAP FORM */}
      <section className="swap">
        <h3 className={`${orbitron.className} swapTitle`}>Swap Tokens</h3>
        <SwapForm />
      </section>

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
          <button className="navBtn active" onClick={() => router.push('/trade')}>Trade Mode</button>
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

      {profileOpen && <div className="mask" onClick={() => setProfileOpen(false)} />}

      {/* STYLES */}
      <style jsx>{`
        .page { min-height: 100vh; background: #f6f8fb; color: #0f172a; display: grid; grid-template-rows: auto auto auto 1fr auto; }

        .hud {
          display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
          gap: 12px; padding: 16px 20px; background: #fff; border-bottom: 1px solid #e5e7eb;
          position: sticky; top: 0; z-index: 5;
        }
        .brand { font-weight: 800; display: flex; flex-direction: column; align-items: flex-start; }
        .logo {
          letter-spacing: 0.12em; text-transform: uppercase;
          background: linear-gradient(180deg,#fff6c7,#ffd34a 72%,#9b6a1a);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .mode { font-size: 12px; color: #6b7280; letter-spacing: 0.08em; text-transform: uppercase; }
        .stats { display: grid; grid-auto-flow: column; gap: 12px; }
        .stat { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 12px; text-align: center; min-width: 110px; }
        .k { font-size: 11px; color: #6b7280; letter-spacing: 0.08em; text-transform: uppercase; }
        .v { font-size: 18px; font-weight: 800; color: #0f172a; }
        .actions { justify-self: end; display: flex; align-items: center; gap: 10px; }
        .modeTabs { display: flex; gap: 4px; }
        .modeBtn { padding: 6px 12px; border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a; border-radius: 6px; cursor: pointer; font-size: 12px; }
        .modeBtn.active { background: #172554; color: #fff; border-color: #172554; }
        .profileBtn { border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a; padding: 8px 12px; border-radius: 8px; cursor: pointer; }

        .banner { display: flex; align-items: center; gap: 10px; margin: 10px 16px; padding: 12px 14px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; }
        .dot { width: 10px; height: 10px; border-radius: 999px; background: #22c55e; }
        .dot.bad { background: #ef4444; }
        .msg { font-weight: 600; }

        .kpi { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; padding: 16px; }
        .kpiCard { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; text-align: center; box-shadow: 0 6px 24px rgba(15,23,42,.04); }
        .kpiLabel { display: block; font-size: 14px; color: #6b7280; margin-bottom: 8px; }
        .kpiValue { font-size: 32px; font-weight: 800; color: #0f172a; }

        .tableWrap { padding: 16px; overflow-x: auto; }
        .assetTable { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; box-shadow: 0 6px 24px rgba(15,23,42,.04); }
        .assetTable th, .assetTable td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .assetTable th { background: #f8fafc; font-weight: 600; color: #0f172a; }
        .actionsCell { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn { border-radius: 10px; padding: 6px 10px; cursor: pointer; font-size: 12px; }
        .primary { border: 1px solid #2b3b61; background: #172554; color: #fff; }
        .dark { border: 1px solid #334155; background: #0f172a; color: #fff; }
        .ghost { border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a; }

        .chart { padding: 16px; }
        .chartTitle { margin: 0 0 16px 0; font-size: 24px; letter-spacing: 0.08em; text-transform: uppercase; }
        .chartPlaceholder { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 40px; text-align: center; color: #6b7280; box-shadow: 0 6px 24px rgba(15,23,42,.04); }

        .swap { padding: 16px; }
        .swapTitle { margin: 0 0 16px 0; font-size: 24px; letter-spacing: 0.08em; text-transform: uppercase; }
        .swapForm { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; box-shadow: 0 6px 24px rgba(15,23,42,.04); }
        .swapRow { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .swapRow label { font-weight: 600; }
        .swapRow input, .swapRow select { padding: 8px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .clanCta { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; padding: 16px; margin: 16px 0; }
        .clanCta h5 { margin: 0 0 8px 0; color: #0ea5e9; }
        .clanCta p { margin: 0 0 12px 0; color: #374151; }

        .drawer {
          position: fixed; top: 0; right: 0; height: 100vh; width: 360px; background: #ffffff;
          border-left: 1px solid #e5e7eb; transform: translateX(100%); transition: transform 200ms ease;
          z-index: 20; box-shadow: -8px 0 24px rgba(15,23,42,0.08); padding: 16px;
        }
        .drawer.open { transform: translateX(0); }
        .drawerHead { display: flex; justify-content: space-between; align-items: center; }
        .drawerTitle { margin: 0; letter-spacing: 0.1em; text-transform: uppercase; }
        .x { border: 1px solid #e5e7eb; background: #f8fafc; border-radius: 8px; padding: 6px 10px; cursor: pointer; }
        .profileRows { margin-top: 12px; display: grid; gap: 8px; }
        .pRow { display: flex; justify-content: space-between; }
        .pKey { color: #6b7280; }
        .pVal { font-weight: 700; }
        .sep { height: 1px; background: #e5e7eb; margin: 14px 0; }
        .nftTitle { margin: 0 0 8px 0; }
        .nftList { margin: 0; padding-left: 16px; color: #334155; }

        .navTabs { display: flex; gap: 8px; }
        .navBtn { flex: 1; padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a; border-radius: 8px; cursor: pointer; }
        .navBtn.active { background: #172554; color: #fff; border-color: #172554; }

        .mask { position: fixed; inset: 0; background: rgba(15,23,42,0.25); z-index: 10; }

        @media (max-width: 768px) {
          .kpi { grid-template-columns: 1fr; }
          .assetTable { font-size: 14px; }
          .actionsCell { flex-direction: column; align-items: stretch; }
          .btn { width: 100%; margin-bottom: 4px; }
          .hud { grid-template-columns: 1fr; gap: 8px; }
          .stats { grid-auto-flow: row; grid-template-columns: repeat(2, minmax(110px, 1fr)); }
          .actions { justify-self: start; flex-wrap: wrap; }
          .swapForm { padding: 16px; }
          .swapRow { flex-direction: column; align-items: flex-start; gap: 6px; }
          .chartPlaceholder { padding: 20px; }
        }

        @media (max-width: 480px) {
          .kpiCard { padding: 16px; }
          .kpiValue { font-size: 24px; }
          .assetTable th, .assetTable td { padding: 8px; }
          .swapTitle, .chartTitle { font-size: 20px; }
          .stats { grid-template-columns: 1fr; }
          .stat { min-width: auto; }
        }
      `}</style>
    </div>
  );
}
