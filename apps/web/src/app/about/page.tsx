'use client';

import { Orbitron, Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { AvatarButton } from '../../components/AvatarButton';
import { MenuSheet } from '../../components/MenuSheet';
import { useState, useEffect } from 'react';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });
const inter = Inter({ subsets: ['latin'] });

/* ---------- Phantom wallet types (copied from other pages for consistency) ---------- */
type SolanaProvider = {
  isPhantom?: boolean;
  publicKey?: { toString: () => string };
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    solana?: SolanaProvider;
  }
}

export default function About() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  /* ---- wallet state (consistent with other pages) ---- */
  const [provider, setProvider] = useState<SolanaProvider | null>(null);
  const [pubkey, setPubkey] = useState('');

  useEffect(() => {
    const p = typeof window !== 'undefined' ? window.solana : undefined;
    if (p?.isPhantom) {
      setProvider(p);
      try {
        p.on?.('connect', (args: { publicKey?: { toString?: () => string } }) => {
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
    } catch (e: unknown) {
      console.error(e);
      alert((e as Error)?.message ?? 'Wallet action canceled.');
    }
  }

  const connected = !!pubkey;

  return (
    <div className="page">
      {/* Header with wallet and menu */}
      <header className="header">
        <button
          className="backBtn"
          onClick={() => router.push('/')}
          aria-label="Go back to home"
        >
          ← Back
        </button>

        <AvatarButton
          connected={connected}
          onClick={handleAvatarClick}
          onMenuClick={() => setIsMenuOpen(true)}
          pubkey={pubkey}
        />
      </header>

      <MenuSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Main content */}
      <main className="content">
        <div className="container">
          <h1 className={`${orbitron.className} title`}>ABOUT WEALTH WARS</h1>
          
          <div className="aboutContent">
            <section className="section">
              <h2 className={`${inter.className} sectionTitle`}>What is Wealth Wars?</h2>
              <p className={`${inter.className} text`}>
                Wealth Wars is a strategy game where players build financial empires on the Solana blockchain. 
                Compete with other players, make strategic investments, and grow your wealth in a decentralized 
                gaming environment.
              </p>
            </section>

            <section className="section">
              <h2 className={`${inter.className} sectionTitle`}>Key Features</h2>
              <ul className={`${inter.className} featureList`}>
                <li>🏦 Build and manage your financial empire</li>
                <li>📈 Real-time trading and market dynamics</li>
                <li>🌐 Fully on-chain gameplay on Solana</li>
                <li>🔒 Secure wallet integration with Phantom</li>
                <li>⚡ Fast, low-cost transactions</li>
                <li>🎮 Competitive multiplayer strategy</li>
              </ul>
            </section>

            <section className="section">
              <h2 className={`${inter.className} sectionTitle`}>How to Play</h2>
              <ol className={`${inter.className} stepsList`}>
                <li>Connect your Phantom wallet</li>
                <li>Start building your financial empire</li>
                <li>Make strategic investments and trades</li>
                <li>Compete with other players</li>
                <li>Grow your wealth and dominate the markets</li>
              </ol>
            </section>

            <section className="section">
              <h2 className={`${inter.className} sectionTitle`}>Technology</h2>
              <p className={`${inter.className} text`}>
                Built on the Solana blockchain using modern web technologies including React, Next.js, 
                and Anchor framework. Experience lightning-fast transactions and seamless gameplay.
              </p>
            </section>

            <div className="actionButtons">
              <button
                className="playBtn"
                onClick={() => router.push('/game')}
              >
                ▶ START PLAYING
              </button>
              <button
                className="tradeBtn"
                onClick={() => router.push('/trade')}
              >
                📈 TRADE MODE
              </button>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #e6edf5;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.12);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .backBtn {
          background: none;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 8px 12px;
          color: #9aa7bd;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .backBtn:hover {
          background: rgba(255,255,255,0.06);
          color: #e6edf5;
          border-color: rgba(255,255,255,0.16);
        }

        .content {
          padding: 40px 20px;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
        }

        .title {
          font-size: clamp(32px, 6vw, 48px);
          margin: 0 0 40px 0;
          text-align: center;
          letter-spacing: 0.1em;
          text-transform: uppercase;
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
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 2px 0 rgba(0,0,0,0.12);
        }

        .aboutContent {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .section {
          margin-bottom: 32px;
        }

        .section:last-of-type {
          margin-bottom: 40px;
        }

        .sectionTitle {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #e6edf5;
        }

        .text {
          font-size: 16px;
          line-height: 1.6;
          color: #9aa7bd;
          margin: 0;
        }

        .featureList {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 12px;
        }

        .featureList li {
          font-size: 16px;
          color: #9aa7bd;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stepsList {
          padding-left: 20px;
          margin: 0;
          display: grid;
          gap: 8px;
        }

        .stepsList li {
          font-size: 16px;
          color: #9aa7bd;
          line-height: 1.5;
        }

        .actionButtons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .playBtn {
          border: none;
          padding: 16px 28px;
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-radius: 10px;
          cursor: pointer;
          background: linear-gradient(180deg, #22c55e, #166534);
          color: #fff;
          box-shadow: 0 6px 18px rgba(22,101,52,0.3);
          transition: transform 120ms, box-shadow 120ms, filter 120ms;
        }

        .playBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(22,101,52,0.4);
          filter: brightness(1.05);
        }

        .tradeBtn {
          border: 1px solid rgba(255,255,255,0.12);
          padding: 16px 28px;
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-radius: 10px;
          cursor: pointer;
          background: rgba(255,255,255,0.06);
          color: #e6edf5;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
          transition: transform 120ms, box-shadow 120ms, border-color 120ms;
        }

        .tradeBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          border-color: rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.12);
        }

        @media (max-width: 640px) {
          .content {
            padding: 20px 16px;
          }

          .aboutContent {
            padding: 24px;
          }

          .actionButtons {
            flex-direction: column;
            align-items: center;
          }

          .playBtn,
          .tradeBtn {
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>
    </div>
  );
}