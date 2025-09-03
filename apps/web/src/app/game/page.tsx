'use client';

import { useEffect, useRef, useState } from 'react';
import { Inter, Orbitron } from 'next/font/google';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useGame } from '../lib/store';
import { BusinessRow } from '../../components/BusinessRow';
import { BulkBar } from '../../components/BulkBar';
import { AvatarButton } from '../../components/AvatarButton';
import { MenuSheet } from '../../components/MenuSheet';
import { UsernameInput } from '../../components/UsernameInput';

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
    solana?: any;
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



export default function GamePage() {
  const connection = useSolanaConnection();
  const router = useRouter();

  /* ---------- Wallet state ---------- */
  const [provider, setProvider] = useState<SolanaProvider | null>(null);
  const [pubkey, setPubkey] = useState('');
  const [sol, setSol] = useState(0);
  const connected = !!pubkey;

  /* ---------- Game state ---------- */
  const { level, xp, wealth, liquidity, assets, collect, upgrade, defend, prestige, clanEligible, derived, tick, setWalletAddress } = useGame();

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

  // Update wallet address in store when pubkey changes
  useEffect(() => {
    setWalletAddress(pubkey);
  }, [pubkey]); // Removed setWalletAddress from deps since it's stable from Zustand
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bulkQty, setBulkQty] = useState(1);

  // AdCap timer for auto-collection
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 250); // Update every 250ms for smooth progress bars

    return () => clearInterval(interval);
  }, [tick]);

  const lowLiquidity = liquidity < 0.12;
  const anyWeakAsset = assets.some(a => a.condition < 35);
  const profitPerSecond = derived.profitPerSecond || 0;

  async function handleWalletClick() {
    try {
      if (!provider) {
        alert('Phantom wallet not found. Install Phantom from https://phantom.app and try again.');
        return;
      }
      if (!pubkey) {
        const res = await provider.connect();
        const key = res?.publicKey?.toString?.();
        if (key) {
          setPubkey(key);
          await refreshBalance(key);
          toast.success('💸 Wallet Connected!'); // <-- Show toast on connect
        }
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

  return (
    <div className={`${inter.className} page`}>
      {/* TOP BAR - Player Status & Settings */}
      <header className="topBar">
        <div className="playerSection">
          <AvatarButton onClick={() => setProfileOpen(true)} />
        </div>

        <div className="profitSection">
          <div className="totalWealth">
            <span className="wealthLabel">$WEALTH</span>
            <span className={`${orbitron.className} wealthValue`}>{wealth.toLocaleString()}</span>
          </div>
          <div className="profitRate">
            <span className="rateLabel">Profit/sec</span>
            <span className={`${orbitron.className} rateValue`}>{profitPerSecond.toFixed(1)}</span>
          </div>
        </div>

        <div className="menuSection">
          <button className="menuBtn" onClick={() => setMenuOpen(true)}>
            <span className="menuIcon">☰</span>
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

      {/* BUSINESS LIST */}
      <main className="businessList">
        {assets.map(a => (
          <BusinessRow key={a.id} asset={a} />
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
          <div className="pRow"><span className="pKey">Prestige</span><span className="pVal">{prestige}</span></div>
        </div>

        <UsernameInput />

        <div className="sep" />

        <div className="navTabs">
          <button className="navBtn active" onClick={() => router.push('/game')}>Play Mode</button>
          <button className="navBtn" onClick={() => router.push('/trade')}>Trade Mode</button>
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

        {/* wallet tools pinned bottom-right */}
        <div className="drawerWallet">
          <WalletAvatar connected={connected} pubkey={pubkey} onClick={handleWalletClick} size={44} />
          <button className="airBtn" onClick={airdrop1Sol}>Devnet Airdrop 1 SOL</button>
          <button className="airBtn ghost" onClick={() => refreshBalance()}>Refresh</button>
        </div>
      </aside>

      {/* MENU SHEET */}
      <MenuSheet isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* BOTTOM BAR */}
      <BulkBar bulkQty={bulkQty} setBulkQty={setBulkQty} />

      {/* STYLES */}
      <style jsx>{`
        .page { min-height: 100vh; background: #f6f8fb; color: #0f172a; display: flex; flex-direction: column; }

        .topBar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #fff;
          border-bottom: 2px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(15,23,42,0.08);
          z-index: 10;
        }

        .playerSection { display: flex; align-items: center; }
        .profitSection { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .menuSection { display: flex; align-items: center; }

        .totalWealth { display: flex; flex-direction: column; align-items: center; }
        .wealthLabel { font-size: 12px; color: #6b7280; letter-spacing: 0.08em; text-transform: uppercase; }
        .wealthValue { font-size: 24px; font-weight: 800; color: #0f172a; }

        .profitRate { display: flex; flex-direction: column; align-items: center; margin-top: 4px; }
        .rateLabel { font-size: 11px; color: #64748b; letter-spacing: 0.06em; text-transform: uppercase; }
        .rateValue { font-size: 16px; font-weight: 600; color: #0ea5e9; }

        .menuBtn {
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #0f172a;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .menuBtn:hover { background: #e2e8f0; }
        .menuIcon { font-size: 16px; }

        .banner { display: flex; align-items: center; gap: 10px; margin: 10px 16px; padding: 12px 14px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; }
        .dot { width: 10px; height: 10px; border-radius: 999px; background: #22c55e; }
        .dot.bad { background: #ef4444; }
        .msg { font-weight: 600; }

        .businessList {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          padding-bottom: 120px; /* Space for bottom bar */
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }



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

        @media (max-width: 768px) {
          .topBar { flex-direction: column; gap: 12px; padding: 12px 16px; }
          .profitSection { order: -1; }
          .businessList { padding: 12px; padding-bottom: 140px; }
        }

        @media (max-width: 480px) {
          .topBar { padding: 10px 12px; }
          .wealthValue { font-size: 20px; }
          .businessList { padding: 10px; padding-bottom: 140px; }
        }

        /* ====== AdCap-style layout polish (layout-only; no logic changes) ====== */

        /* Top bar: compact, sticky feel */
        .topBar {
          position: sticky;
          top: 0;
          backdrop-filter: saturate(1.2) blur(2px);
        }
        .profitSection .wealthValue {
          font-size: clamp(22px, 3.6vw, 32px);
          line-height: 1.08;
        }
        .profitSection .rateValue {
          font-weight: 800;
        }

        /* Banner: slimmer and unobtrusive */
        .banner {
          margin-top: 8px;
          border-width: 1px;
          box-shadow: none;
        }

        /* Business List: vertical stack, denser rhythm, centered column */
        .businessList {
          max-width: 860px;
          gap: 12px;
        }

        /* BusinessRow card: three-column grid with clear areas (AdCap vibe) */
        .businessRow {
          grid-template-columns: 1.1fr 1.2fr 0.9fr; /* identity | progress | actions */
          align-items: center;
          padding: 16px 16px;
          border-width: 1px;
          box-shadow: 0 4px 16px rgba(15,23,42,0.04);
        }

        /* Identity column */
        .businessName {
          letter-spacing: 0.12em;
        }
        .levelBadge {
          transform: translateY(-1px);
        }
        .outletInfo {
          gap: 10px;
        }

        /* Progress column */
        .cycleBar {
          height: 14px;
          background: #e5e7eb;
        }
        .cycleFill {
          background: linear-gradient(90deg, #22c55e, #16a34a);
          transition: width 120ms linear;
        }
        .tapHint, .timer {
          position: absolute;
          inset: 0;
          font-size: 11px;
          color: #0f172a;
          display: grid;
          place-items: center;
          mix-blend-mode: multiply;
          pointer-events: none;
        }
        .profitInfo {
          font-weight: 700;
          color: #0f172a;
        }
        .conditionBar {
          height: 8px;
          width: 100%;
          background: #f1f5f9;
          border-radius: 999px;
          overflow: hidden;
        }
        .conditionFill { height: 100%; }

        /* Actions column: big tap targets, consistent sizes */
        .actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          align-self: stretch;
        }
        .actions .btn.large {
          padding: 12px 10px;
          font-size: 14px;
          border-radius: 10px;
        }
        .collectBtn {
          background: #16a34a;
          border: 1px solid #0f7a34;
          color: #fff;
        }
        .collectBtn:disabled {
          opacity: 0.6;
          filter: grayscale(0.2);
        }
        .upgradeBtn {
          background: #0f172a;
          color: #fff;
          border-color: #0f172a;
        }
        .defendBtn {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #0f172a;
        }

        /* Milestones row: tighter chips */
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
        }
        .milestone.achieved {
          background: #ecfccb;
          border-color: #bef264;
          color: #365314;
          font-weight: 700;
        }

        /* Bottom bulk bar: already sticky; just spacing/stack on mobile */
        .bulkBar {
          gap: 12px;
        }
        @media (max-width: 860px) {
          .businessRow {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 14px;
          }
          .actions {
            grid-template-columns: repeat(3, 1fr);
          }
          .profitSection { order: -1; }
        }

        /* Subtle scrollbars for long lists (desktop) */
        .businessList::-webkit-scrollbar { width: 10px; }
        .businessList::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 999px;
        }

        /* ====== DARK THEME: Premium Space Aesthetic ====== */

        :root {
          --bg: #0b1020;
          --bg-2: #0e1426;
          --panel: rgba(255,255,255,0.06);
          --line: rgba(255,255,255,0.12);
          --text: #e6edf5;
          --muted: #9aa7bd;
          --accent: #22c55e;       /* emerald */
          --accent-2: #16a34a;
          --gold-1: #fde68a;
          --gold-2: #fbbf24;
          --gold-3: #9b6a1a;
          --shadow: 0 10px 30px rgba(0,0,0,0.45);
        }

        /* Premium starfield + radial glow + noise */
        body {
          background: radial-gradient(1200px 800px at 20% -10%, #1b2550 0%, transparent 60%),
                      radial-gradient(900px 700px at 85% 10%, #083b2c 0%, transparent 60%),
                      linear-gradient(180deg, var(--bg), var(--bg-2));
          color: var(--text);
        }
        body::before {
          content: "";
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.12) 30%, transparent 31%),
            radial-gradient(2px 2px at 80% 20%, rgba(255,255,255,0.12) 30%, transparent 31%),
            radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.10) 30%, transparent 31%);
          opacity: .6;
        }
        body::after {
          /* subtle film grain */
          content: "";
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' opacity='0.06' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          mix-blend-mode: soft-light;
        }

        /* Panels + cards go glassy */
        .topBar,
        .banner,
        .businessRow,
        .bulkBar,
        .drawer {
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
          border: 1px solid var(--line);
          box-shadow: var(--shadow);
          backdrop-filter: blur(8px) saturate(1.2);
          color: var(--text);
        }

        .banner .msg { color: var(--text); }
        .dot { box-shadow: 0 0 0 3px rgba(0,0,0,0.25) inset; }

        /* "WEALTH" numbers shimmer like coins */
        .page .wealthValue {
          background: linear-gradient(180deg, var(--gold-1), var(--gold-2) 70%, var(--gold-3)) !important;
          -webkit-background-clip: text !important; 
          background-clip: text !important; 
          color: var(--gold-2) !important; /* Fallback color in case background-clip doesn't work */
          -webkit-text-fill-color: transparent !important; /* Better browser support */
          position: relative;
          font-weight: 800 !important;
        }
        .wealthValue::after {
          content: "";
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.6) 14%, transparent 28%);
          transform: translateX(-120%);
          animation: shine 2.6s ease-in-out infinite;
        }
        @keyframes shine { to { transform: translateX(120%); } }

        .rateValue { color: #6bdcff; text-shadow: 0 0 14px rgba(107,220,255,0.35); }

        /* Business rows: tighter rhythm + accent edges */
        .businessRow {
          position: relative;
          overflow: hidden;
        }
        .businessRow::before {
          content: "";
          position: absolute; inset: -1px;
          border-radius: 14px;
          padding: 1px;
          background: conic-gradient(from 180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04), rgba(255,255,255,0.14));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          pointer-events: none;
        }

        /* Progress bars: candy stripes + smooth fill */
        .cycleBar { background: rgba(255,255,255,0.12); }
        .cycleFill {
          background:
            repeating-linear-gradient(135deg, rgba(255,255,255,0.25) 0 8px, rgba(255,255,255,0.05) 8px 16px),
            linear-gradient(90deg, var(--accent), var(--accent-2));
          box-shadow: 0 0 12px rgba(34,197,94,0.35);
        }
        .conditionBar { background: rgba(255,255,255,0.08); }
        .conditionFill { box-shadow: inset 0 0 8px rgba(0,0,0,0.2); }

        /* Buttons: premium neon-ish glow */
        .btn.primary,
        .collectBtn {
          background: linear-gradient(180deg, var(--accent), var(--accent-2));
          border: 1px solid rgba(0,0,0,0.28);
          color: white;
          box-shadow:
            0 10px 22px rgba(34,197,94,0.22),
            inset 0 0 0 1px rgba(255,255,255,0.08);
        }
        .btn.primary:hover,
        .collectBtn:hover:not(:disabled) { filter: brightness(1.06) saturate(1.1); transform: translateY(-1px); }

        .btn.dark,
        .upgradeBtn {
          background: linear-gradient(180deg, #101628, #0a0f1f);
          color: #f8fafc;
          border: 1px solid rgba(255,255,255,0.12);
        }
        .btn.dark:hover,
        .upgradeBtn:hover { filter: brightness(1.08); transform: translateY(-1px); }

        .btn.ghost,
        .defendBtn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.16);
          color: var(--text);
        }
        .btn.ghost:hover,
        .defendBtn:hover { background: rgba(255,255,255,0.12); }

        /* Milestone chips pop */
        .milestone {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: var(--muted);
        }
        .milestone.achieved {
          background: rgba(190,242,100,0.18);
          border-color: rgba(163,230,53,0.6);
          color: #d9f99d;
        }

        /* Drawer: glass sheet */
        .drawer {
          background: linear-gradient(180deg, rgba(16,22,40,0.86), rgba(10,15,31,0.86));
          border-left: 1px solid rgba(255,255,255,0.12);
          color: var(--text);
        }
        .drawerTitle { color: var(--gold-1); text-shadow: 0 0 12px rgba(251,191,36,0.24); }
        .navBtn.active { background: linear-gradient(180deg, #1e2a4d, #172554); border-color: rgba(255,255,255,0.16); }

        /* Bottom bar polish */
        .bulkBar {
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
          border-top: 1px solid var(--line);
        }
        .bulkBtn.active {
          background: linear-gradient(180deg, #1d2a50, #172554);
          border-color: rgba(255,255,255,0.16);
          color: #e6edf5;
          box-shadow: 0 6px 18px rgba(23,37,84,0.35);
        }

        /* Avatar button polish */
        .avatarBtn { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.16); color: var(--text); }
        .avatar { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18); }

        /* Responsive bumps */
        @media (max-width: 860px) {
          .businessRow { padding: 14px 12px; }
          .actions .btn.large { padding: 12px 8px; font-size: 13px; }
        }
      `}</style>
    </div>
  );
}
