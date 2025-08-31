'use client';

import { useEffect, useRef, useState } from 'react';
import { Inter, Orbitron } from 'next/font/google';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

/* ---------- Build a connection locally (no external helper) ---------- */
const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  clusterApiUrl(
    (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as 'devnet' | 'testnet' | 'mainnet-beta') || 'devnet'
  );

function useSolanaConnection() {
  const ref = useRef<Connection | null>(null);
  if (!ref.current) {
    ref.current = new Connection(RPC_URL, 'confirmed');
  }
  return ref.current;
}

/* ---------- Phantom wallet types ---------- */
type SolanaProvider = {
  isPhantom?: boolean;
  publicKey?: { toString: () => string };
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
};

declare global {
  interface Window {
    solana?: SolanaProvider;
  }
}

const shorten = (pk = '') => (pk ? `${pk.slice(0, 4)}…${pk.slice(-4)}` : '');

/* ---------- Reusable Wallet Avatar ---------- */
function WalletAvatar({
  connected,
  pubkey,
  onClick,
  size = 40,
}: {
  connected: boolean;
  pubkey: string;
  onClick: () => void;
  size?: number;
}) {
  return (
    <div className="walletWrap">
      <button
        className="avatar"
        onClick={onClick}
        aria-label={connected ? 'Disconnect Wallet' : 'Connect Wallet'}
        style={{ width: size, height: size }}
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 1 1 0 2H5.5A.5.5 0 0 0 5 7.5V17a.5.5 0 0 0 .5.5H19a2 2 0 0 0 2-2V11a1 1 0 1 0-2 0v3.5a.5.5 0 0 1-.5.5H6a2 2 0 0 1-2-2V7.5Z" fill="currentColor"/>
          <circle cx="18" cy="12" r="1.3" fill="currentColor"/>
        </svg>
        {connected && <span className="dot" />}
      </button>
      <div className="badge">{connected ? shorten(pubkey) : 'Connect'}</div>

      <style jsx>{`
        .walletWrap { display: inline-flex; align-items: center; gap: 8px; }
        .avatar {
          border-radius: 999px; display: grid; place-items: center; color: #0b1220;
          background: linear-gradient(180deg, #fde68a, #fbbf24);
          border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
          cursor: pointer; transition: transform 120ms, filter 120ms;
        }
        .avatar:hover { transform: translateY(-1px); filter: brightness(1.03); }
        .dot {
          position: absolute; transform: translate(12px, -12px);
          width: 9px; height: 9px; border-radius: 999px; background: #22c55e; box-shadow: 0 0 0 2px #fff inset;
        }
        .badge {
          font-size: 12px; letter-spacing: 0.06em; padding: 6px 10px; border-radius: 10px;
          border: 1px solid #e5e7eb; background: #fff; color: #0f172a; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
          user-select: none;
        }
      `}</style>
    </div>
  );
}

type Asset = {
  id: string;
  name: string;
  level: number;
  yieldPerTick: number;
  upgradeCost: number;
  condition: number; // 0..100
};

export default function GamePage() {
  const connection = useSolanaConnection();

  /* ---------- Wallet state ---------- */
  const [provider, setProvider] = useState<SolanaProvider | null>(null);
  const [pubkey, setPubkey] = useState('');
  const [sol, setSol] = useState(0);
  const connected = !!pubkey;

  useEffect(() => {
    const p = typeof window !== 'undefined' ? window.solana : undefined;
    if (p?.isPhantom) {
      setProvider(p);
      try {
        p.on?.('connect', (args: any) => {
          const k = (args?.publicKey?.toString?.() ?? p.publicKey?.toString?.() ?? '') as string;
          if (k) setPubkey(k);
        });
        p.on?.('disconnect', () => { setPubkey(''); setSol(0); });
        const maybe = p.publicKey?.toString?.();
        if (maybe) setPubkey(maybe);
      } catch {}
    } else {
      setProvider(null);
    }
  }, []);

  async function handleWalletClick() {
    try {
      if (!provider) {
        alert('Phantom wallet not found. Install Phantom from https://phantom.app and try again.');
        return;
      }
      if (!pubkey) {
        const res = await provider.connect();
        const key = res?.publicKey?.toString?.();
        if (key) { setPubkey(key); await refreshBalance(key); }
      } else {
        await provider.disconnect();
        setPubkey('');
        setSol(0);
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Wallet action canceled.');
    }
  }

  async function refreshBalance(key?: string) {
    try {
      const k = key ?? pubkey;
      if (!k) return;
      const lamports = await connection.getBalance(new PublicKey(k));
      setSol(lamports / 1e9);
    } catch (e) {
      console.error(e);
    }
  }

  async function airdrop1Sol() {
    try {
      if (!pubkey) return alert('Connect your wallet first.');
      const sig = await connection.requestAirdrop(new PublicKey(pubkey), 1e9); // 1 SOL
      await connection.confirmTransaction(sig, 'confirmed');
      await refreshBalance();
      alert('Airdropped 1 SOL on devnet.');
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Airdrop failed (devnet can rate-limit). Try again soon.');
    }
  }

  useEffect(() => { if (pubkey) refreshBalance(); }, [pubkey]);

  /* ---------- Game state (placeholder) ---------- */
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(20);
  const [wealth, setWealth] = useState(150);
  const [liquidity, setLiquidity] = useState(0.22);
  const [profileOpen, setProfileOpen] = useState(false);

  const [assets, setAssets] = useState<Asset[]>([
    { id: 'farm',   name: 'Crypto Mining Farm', level: 1, yieldPerTick: 24, upgradeCost: 80,  condition: 72 },
    { id: 'reit',   name: 'REIT Tower',         level: 1, yieldPerTick: 18, upgradeCost: 60,  condition: 65 },
    { id: 'startup',name: 'Fintech Startup',    level: 1, yieldPerTick: 14, upgradeCost: 55,  condition: 58 },
    { id: 'mine',   name: 'Rare Metals Mine',   level: 1, yieldPerTick: 28, upgradeCost: 95,  condition: 50 },
  ]);

  const lowLiquidity = liquidity < 0.12;
  const anyWeakAsset = assets.some(a => a.condition < 35);
  const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

  function collect(id: string) {
    const a = assets.find(x => x.id === id)!;
    setWealth(w => w + a.yieldPerTick);
    setXp(x => { const nx = x + 5; if (nx >= 100) { setLevel(l => l + 1); return 0; } return nx; });
    setLiquidity(q => clamp(q + (Math.random() - 0.5) * 0.03, 0.05, 0.6));
  }

  function upgrade(id: string) {
    const asset = assets.find(a => a.id === id)!;
    if (wealth < asset.upgradeCost) return;
    setWealth(w => w - asset.upgradeCost);
    setAssets(prev => prev.map(a => a.id !== id ? a : ({
      ...a,
      level: a.level + 1,
      yieldPerTick: Math.round(a.yieldPerTick * 1.25),
      upgradeCost: Math.round(a.upgradeCost * 1.35),
      condition: clamp(a.condition + 6, 0, 100),
    })));
    setXp(x => (x + 18 >= 100 ? (setLevel(l => l + 1), 0) : x + 18));
    setLiquidity(q => clamp(q + (Math.random() - 0.5) * 0.02, 0.05, 0.6));
  }

  function defend(id: string) {
    const fee = 12;
    if (wealth < fee) return;
    setWealth(w => w - fee);
    setAssets(prev => prev.map(a => a.id === id ? { ...a, condition: clamp(a.condition + 10, 0, 100) } : a));
    setLiquidity(q => clamp(q - 0.02, 0.05, 0.6));
  }

  return (
    <div className={`${inter.className} page`}>
      {/* HEADER / HUD */}
      <header className="hud">
        <div className="brand">
          <span className={`${orbitron.className} logo`}>WEALTH WARS</span>
        </div>

        <div className="stats">
          <div className="stat"><span className="k">Level</span><span className={`${orbitron.className} v`}>{level}</span></div>
          <div className="stat"><span className="k">XP</span><span className={`${orbitron.className} v`}>{xp}/100</span></div>
          <div className="stat"><span className="k">SOL</span><span className={`${orbitron.className} v`}>{sol.toFixed(2)}</span></div>
          <div className="stat"><span className="k">$WEALTH</span><span className={`${orbitron.className} v`}>{wealth}</span></div>
          <div className="stat"><span className="k">Liquidity</span><span className={`${orbitron.className} v`}>{Math.round(liquidity*100)}%</span></div>
        </div>

        <div className="actions">
          <button className="profileBtn" onClick={() => setProfileOpen(true)}>View Profile</button>
          <WalletAvatar connected={connected} pubkey={pubkey} onClick={handleWalletClick} />
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

      {/* ASSET GRID */}
      <main className="grid">
        {assets.map(a => (
          <article className="card" key={a.id}>
            <header className="cardHead">
              <h3 className={`${orbitron.className} title`}>{a.name}</h3>
              <span className="sub">Lv {a.level}</span>
            </header>

            <div className="rows">
              <div className="row"><span className="label">Yield</span><span className="val">{a.yieldPerTick} tokens/collect</span></div>
              <div className="row"><span className="label">Next Upgrade</span><span className="val">{a.upgradeCost} $WEALTH</span></div>
            </div>

            <div className="condWrap">
              <div className="condBar" style={{ width: `${a.condition}%`, background: a.condition < 35 ? '#ef4444' : a.condition < 70 ? '#f59e0b' : '#22c55e' }} />
            </div>
            <div className="condText">Condition: {a.condition}%</div>

            <div className="buttons">
              <button className="btn primary" onClick={() => collect(a.id)}>Collect Income</button>
              <button className="btn dark" disabled={wealth < a.upgradeCost} onClick={() => upgrade(a.id)} style={{ opacity: wealth < a.upgradeCost ? 0.55 : 1 }}>
                Upgrade
              </button>
              <button className="btn ghost" onClick={() => defend(a.id)}>Defend</button>
            </div>
          </article>
        ))}
      </main>

      {/* PROFILE SLIDE-OUT */}
      <aside className={`drawer ${profileOpen ? 'open' : ''}`}>
        <div className="drawerHead">
          <h4 className={`${orbitron.className} drawerTitle`}>Player Profile</h4>
          <button className="x" onClick={() => setProfileOpen(false)}>✕</button>
        </div>

        <div className="profileRows">
          <div className="pRow"><span className="pKey">Wallet</span><span className="pVal">{connected ? shorten(pubkey) : 'Not connected'}</span></div>
          <div className="pRow"><span className="pKey">Level</span><span className="pVal">{level}</span></div>
          <div className="pRow"><span className="pKey">XP</span><span className="pVal">{xp}/100</span></div>
          <div className="pRow"><span className="pKey">SOL (devnet)</span><span className="pVal">{sol.toFixed(2)}</span></div>
          <div className="pRow"><span className="pKey">$WEALTH</span><span className="pVal">{wealth}</span></div>
          <div className="pRow"><span className="pKey">Liquidity</span><span className="pVal">{Math.round(liquidity*100)}%</span></div>
        </div>

        <div className="sep" />

        <div className="nftWrap">
          <h5 className="nftTitle">Owned Cosmetics</h5>
          <ul className="nftList">
            <li>Badge: Early Founder</li>
            <li>Wearable: Golden Visor</li>
            <li>Frame: Emerald Edge</li>
          </ul>
        </div>

        {/* wallet tools pinned bottom-right */}
        <div className="drawerWallet">
          <WalletAvatar connected={connected} pubkey={pubkey} onClick={handleWalletClick} size={44} />
          <button className="airBtn" onClick={airdrop1Sol}>Devnet Airdrop 1 SOL</button>
          <button className="airBtn ghost" onClick={() => refreshBalance()}>Refresh</button>
        </div>
      </aside>

      {profileOpen && <div className="mask" onClick={() => setProfileOpen(false)} />}

      {/* STYLES */}
      <style jsx>{`
        .page { min-height: 100vh; background: #f6f8fb; color: #0f172a; display: grid; grid-template-rows: auto auto 1fr; }

        .hud {
          display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
          gap: 12px; padding: 16px 20px; background: #fff; border-bottom: 1px solid #e5e7eb;
          position: sticky; top: 0; z-index: 5;
        }
        .brand { font-weight: 800; }
        .logo {
          letter-spacing: 0.12em; text-transform: uppercase;
          background: linear-gradient(180deg,#fff6c7,#ffd34a 72%,#9b6a1a);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .stats { display: grid; grid-auto-flow: column; gap: 12px; }
        .stat { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 12px; text-align: center; min-width: 110px; }
        .k { font-size: 11px; color: #6b7280; letter-spacing: 0.08em; text-transform: uppercase; }
        .v { font-size: 18px; font-weight: 800; color: #0f172a; }
        .actions { justify-self: end; display: flex; align-items: center; gap: 10px; }
        .profileBtn { border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a; padding: 8px 12px; border-radius: 8px; cursor: pointer; }

        .banner { display: flex; align-items: center; gap: 10px; margin: 10px 16px; padding: 12px 14px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; }
        .dot { width: 10px; height: 10px; border-radius: 999px; background: #22c55e; }
        .dot.bad { background: #ef4444; }
        .msg { font-weight: 600; }

        .grid { display: grid; gap: 14px; padding: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px; box-shadow: 0 6px 24px rgba(15,23,42,.04); }
        .cardHead { display: flex; justify-content: space-between; align-items: baseline; }
        .title { margin: 0; font-size: 18px; letter-spacing: 0.08em; text-transform: uppercase; }
        .sub { color: #64748b; }
        .rows { margin: 8px 0; }
        .row { display: flex; justify-content: space-between; color: #475569; padding: 4px 0; }
        .label { color: #6b7280; }
        .val { font-weight: 600; color: #0f172a; }

        .condWrap { height: 9px; width: 100%; background: #f1f5f9; border-radius: 999px; overflow: hidden; margin-top: 6px; }
        .condBar { height: 100%; border-radius: 999px; }
        .condText { margin-top: 6px; color: #475569; font-size: 13px; }

        .buttons { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
        .btn { border-radius: 10px; padding: 9px 12px; cursor: pointer; }
        .primary { border: 1px solid #2b3b61; background: #172554; color: #fff; }
        .dark { border: 1px solid #334155; background: #0f172a; color: #fff; }
        .ghost { border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a; }

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

        .drawerWallet {
          position: absolute; right: 14px; bottom: 14px;
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.92);
          padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 12px;
          box-shadow: 0 6px 18px rgba(15,23,42,0.08);
        }
        .airBtn {
          border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a;
          padding: 8px 10px; border-radius: 8px; cursor: pointer;
        }
        .airBtn.ghost { background: #fff; }

        .mask { position: fixed; inset: 0; background: rgba(15,23,42,0.25); z-index: 10; }

        @media (max-width: 640px) {
          .stats { grid-auto-flow: row; grid-template-columns: repeat(2, minmax(110px, 1fr)); }
          .hud { grid-template-columns: 1fr; gap: 8px; }
          .actions { justify-self: start; }
        }
      `}</style>
    </div>
  );
}
