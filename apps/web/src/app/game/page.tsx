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

  /* ---------- Game state ---------- */
  const { level, xp, wealth, liquidity, assets, collect, upgrade, defend, prestige, clanEligible, derived, tick } = useGame();
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
      `}</style>
    </div>
  );
}
