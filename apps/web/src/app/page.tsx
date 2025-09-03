'use client';

import Link from 'next/link';
import { Orbitron } from 'next/font/google';
import { useEffect, useMemo, useState } from 'react';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

/* ---------- Phantom types ---------- */
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

/* ---------- Background sprinkles ---------- */
function DollarSprinkles() {
  const spots = useMemo(
    () => [
      { top: '12%', left: '8%',  size: 52, rot: -8,  dur: 10 },
      { top: '22%', right: '10%', size: 64, rot: 6,   dur: 12 },
      { bottom: '18%', left: '14%', size: 58, rot: 3, dur: 11 },
      { bottom: '10%', right: '12%', size: 66, rot: -5, dur: 13 },
      { top: '48%', left: '50%', size: 50, rot: 0,    dur: 9  },
    ],
    []
  );

  return (
    <div className="sprinkles" aria-hidden="true">
      {spots.map((s, i) => (
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
          $
        </div>
      ))}

      <style jsx>{`
        .sprinkles { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .dollar {
          color: rgba(34, 197, 94, 0.12);
          font-weight: 800;
          text-shadow: 0 2px 10px rgba(34, 197, 94, 0.08);
          animation: floaty ease-in-out infinite alternate;
        }
        @keyframes floaty {
          from { transform: translateY(-3px); }
          to   { transform: translateY(6px); }
        }
      `}</style>
    </div>
  );
}

/* ---------- Tiny tiled $ pattern ---------- */
function BackgroundPattern() {
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
       <text x="6" y="16" font-size="14" font-weight="700" fill="rgba(34,197,94,0.08)">$</text>
     </svg>`
  );
  return (
    <div
      className="pattern"
      aria-hidden="true"
      style={{ backgroundImage: `url("data:image/svg+xml,${svg}")` }}
    >
      <style jsx>{`
        .pattern {
          position: absolute; inset: 0;
          background-repeat: repeat; background-size: 24px 24px;
          z-index: 0; pointer-events: none;
        }
      `}</style>
    </div>
  );
}

/* ---------- Wallet avatar (top-right) ---------- */
function WalletAvatar({
  connected,
  onClick,
  pubkey,
}: {
  connected: boolean;
  onClick: () => void;
  pubkey: string;
}) {
  return (
    <div className="walletWrap">
      <button className="avatar" onClick={onClick} aria-label={connected ? 'Disconnect Wallet' : 'Connect Wallet'}>
        {/* simple wallet glyph */}
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 1 1 0 2H5.5A.5.5 0 0 0 5 7.5V17a.5.5 0 0 0 .5.5H19a2 2 0 0 0 2-2V11a1 1 0 1 0-2 0v3.5a.5.5 0 0 1-.5.5H6a2 2 0 0 1-2-2V7.5Z" fill="currentColor"/>
          <circle cx="18" cy="12" r="1.3" fill="currentColor"/>
        </svg>
        {connected && <span className="dot" />}
      </button>
      <div className="badge">{connected ? shorten(pubkey) : 'Connect'}</div>

      <style jsx>{`
        .walletWrap {
          position: absolute; top: 16px; right: 16px;
          display: flex; align-items: center; gap: 10px;
          z-index: 9;
        }
        .avatar {
          width: 40px; height: 40px; border-radius: 999px;
          display: grid; place-items: center;
          color: #e6edf5;
          background: linear-gradient(180deg, #fde68a, #fbbf24); /* gold-ish */
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 6px 16px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 120ms, filter 120ms;
        }
        .avatar:hover { transform: translateY(-1px); filter: brightness(1.02); }
        .dot {
          position: absolute; top: 4px; right: 4px;
          width: 9px; height: 9px; border-radius: 999px;
          background: #22c55e; box-shadow: 0 0 0 2px rgba(255,255,255,0.9) inset;
        }
        .badge {
          font-size: 12px; letter-spacing: 0.06em;
          padding: 6px 10px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); color: #e6edf5;
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
          user-select: none;
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  /* ---- wallet state ---- */
  const [provider, setProvider] = useState<SolanaProvider | null>(null);
  const [pubkey, setPubkey] = useState('');

  useEffect(() => {
    const p = typeof window !== 'undefined' ? window.solana : undefined;
    if (p?.isPhantom) {
      setProvider(p);
      try {
        p.on?.('connect', (args: any) => {
          const k =
            (args?.publicKey?.toString?.() ??
              p.publicKey?.toString?.() ??
              '') as string;
          if (k) setPubkey(k);
        });
        p.on?.('disconnect', () => setPubkey(''));
        const maybe = p.publicKey?.toString?.();
        if (maybe) setPubkey(maybe);
      } catch {}
    } else {
      setProvider(null);
    }
  }, []);

  async function handleAvatarClick() {
    try {
      if (!provider) {
        alert('Phantom wallet not found. Install Phantom from https://phantom.app and try again.');
        return;
      }
      if (!pubkey) {
        const res = await provider.connect();
        const key = res?.publicKey?.toString?.();
        if (key) setPubkey(key);
      } else {
        await provider.disconnect();
        setPubkey('');
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Wallet action canceled.');
    }
  }

  const connected = !!pubkey;

  return (
    <div className="page">
      {/* background layers */}
      <BackgroundPattern />
      <DollarSprinkles />

      {/* wallet avatar (top-right) */}
      <WalletAvatar connected={connected} onClick={handleAvatarClick} pubkey={pubkey} />

      {/* centered content */}
      <main className="content">
        <h1 className={`${orbitron.className} logo`}>WEALTH WARS</h1>

        <Link href="/game">
          <button className="playBtn" aria-label="Play Now">▶ PLAY NOW</button>
        </Link>

        <p className="alpha">Alpha • v0.1</p>
      </main>

      {/* global base */}
      <style jsx global>{`
        html, body, #__next { height: 100%; margin: 0; padding: 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); }
        * { box-sizing: border-box; }
      `}</style>

      {/* local styles */}
      <style jsx>{`
        .page {
          position: relative; width: 100%; height: 100svh; overflow: hidden; color: #e6edf5;
        }
        .content {
          position: relative; z-index: 5;
          height: 100%; display: grid; place-items: center; text-align: center;
        }
        .logo {
          font-size: clamp(42px, 8vw, 100px);
          margin: 0 0 28px 0; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 800;
          background: linear-gradient(
            180deg,
            #fff6c7 0%,
            #ffe89a 14%,
            #f9c742 28%,
            #b07c24 42%,
            #f2d271 58%,
            #ffd34a 72%,
            #9b6a1a 86%,
            #ffd98c 100%
          );
          -webkit-background-clip: text; background-clip: text; color: transparent;
          text-shadow: 0 2px 0 rgba(0,0,0,0.12), 0 10px 24px rgba(255,199,84,0.18);
        }
        .playBtn {
          border: none; padding: 18px 36px; font-size: 20px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.12em; border-radius: 12px; cursor: pointer;
          background: linear-gradient(180deg, #22c55e, #166534); color: #fff;
          box-shadow: 0 8px 20px rgba(22,101,52,0.35), 0 0 0 2px rgba(0,0,0,0.04) inset;
          transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
        }
        .playBtn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(22,101,52,0.45), 0 0 0 2px rgba(0,0,0,0.06) inset; filter: brightness(1.03); }
        .playBtn:active { transform: translateY(2px); box-shadow: 0 6px 16px rgba(22,101,52,0.25), 0 0 0 2px rgba(0,0,0,0.04) inset; }
        .alpha {
          margin-top: 16px; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #64748b;
          animation: blink 1400ms steps(2, start) infinite;
        }
        @keyframes blink { 0%, 49% { opacity: 0.8; } 50%, 100% { opacity: 0.4; } }

        /* ====== DARK THEME: Premium Space Aesthetic ====== */

        :root {
          --bg: #0b1020;
          --bg-2: #0e1426;
          --panel: rgba(255,255,255,0.06);
          --line: rgba(255,255,255,0.12);
          --text: #e6edf5;
          --muted: #9aa7bd;
          --accent: #22c55e;
          --accent-2: #16a34a;
          --gold-1: #fde68a;
          --gold-2: #fbbf24;
          --gold-3: #9b6a1a;
          --shadow: 0 10px 30px rgba(0,0,0,0.45);
        }

        /* Premium starfield background */
        .page {
          background: radial-gradient(1200px 800px at 20% -10%, #1b2550 0%, transparent 60%),
                      radial-gradient(900px 700px at 85% 10%, #083b2c 0%, transparent 60%),
                      linear-gradient(180deg, var(--bg), var(--bg-2));
          color: var(--text);
        }

        .page::before {
          content: "";
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.12) 30%, transparent 31%),
            radial-gradient(2px 2px at 80% 20%, rgba(255,255,255,0.12) 30%, transparent 31%),
            radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.10) 30%, transparent 31%);
          opacity: .6;
        }

        .page::after {
          content: "";
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' opacity='0.06' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          mix-blend-mode: soft-light;
        }

        /* Logo with enhanced glow */
        .logo {
          background: linear-gradient(
            180deg,
            #fde68a 0%,
            #fbbf24 14%,
            #f9c742 28%,
            #b07c24 42%,
            #f2d271 58%,
            #ffd34a 72%,
            #9b6a1a 86%,
            #ffd98c 100%
          );
          -webkit-background-clip: text; background-clip: text; color: transparent;
          text-shadow: 0 2px 0 rgba(0,0,0,0.12), 0 10px 24px rgba(255,199,84,0.18);
          position: relative;
        }

        .logo::after {
          content: "";
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.6) 14%, transparent 28%);
          transform: translateX(-120%);
          animation: logoShine 3.2s ease-in-out infinite;
        }

        @keyframes logoShine { to { transform: translateX(120%); } }

        /* Play button with premium styling */
        .playBtn {
          border: none; padding: 18px 36px; font-size: 20px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.12em; border-radius: 12px; cursor: pointer;
          background: linear-gradient(180deg, var(--accent), var(--accent-2));
          color: #fff;
          box-shadow:
            0 8px 20px rgba(34,197,94,0.35),
            0 0 0 2px rgba(0,0,0,0.04) inset,
            inset 0 0 0 1px rgba(255,255,255,0.08);
          transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
        }
        .playBtn:hover {
          transform: translateY(-2px);
          box-shadow:
            0 12px 28px rgba(34,197,94,0.45),
            0 0 0 2px rgba(0,0,0,0.06) inset,
            inset 0 0 0 1px rgba(255,255,255,0.12);
          filter: brightness(1.06) saturate(1.1);
        }
        .playBtn:active {
          transform: translateY(2px);
          box-shadow:
            0 6px 16px rgba(34,197,94,0.25),
            0 0 0 2px rgba(0,0,0,0.04) inset;
        }

        /* Alpha text with subtle glow */
        .alpha {
          margin-top: 16px; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--muted);
          animation: blink 1400ms steps(2, start) infinite;
        }

        /* Wallet avatar with glass effect */
        .walletWrap {
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
          border: 1px solid var(--line);
          box-shadow: var(--shadow);
          backdrop-filter: blur(8px) saturate(1.2);
          border-radius: 12px;
          padding: 8px 12px;
        }

        .avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
        }

        .badge {
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--line);
          color: var(--text);
        }
      `}</style>
    </div>
  );
}
