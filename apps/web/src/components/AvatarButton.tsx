"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Orbitron, Inter } from 'next/font/google';
import { useGame } from '../app/lib/store';
import { UsernameInput } from './UsernameInput';
import { useMultiplayerStore } from '../lib/multiplayerStore';
const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

interface AvatarButtonProps {
  onClick?: () => void;
}

export function AvatarButton({ onClick }: AvatarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { username, walletAddress, setWalletAddress } = useGame();
  const presenceMode = useMultiplayerStore(s => s.presenceMode)
  const presenceUrl = useMultiplayerStore(s => s.presenceUrl)
  const lastPresenceError = useMultiplayerStore(s => s.lastPresenceError)
  const connectToMultiplayer = useMultiplayerStore(s => s.connectToMultiplayer)
  const isConnected = useMultiplayerStore(s => s.isConnected)
  const connectionStatus = useMultiplayerStore(s => s.connectionStatus)

  // Ensure realtime client attempts to connect whenever the header is visible
  useEffect(() => {
    if (!isConnected && connectionStatus === 'disconnected') {
      try { connectToMultiplayer() } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClick = () => {
    setIsOpen(!isOpen);
    onClick?.();
  };

  const displayName = username?.trim() ? username : 'Player';

  // Minimal Phantom provider helpers
  const getPhantomProvider = () => {
    if (typeof window === 'undefined') return null as any;
    return (window as any).solana || null;
  };

  const connectWallet = async () => {
    try {
      const provider = getPhantomProvider();
      if (!provider?.isPhantom) {
        toast.error('Phantom wallet not found. Install Phantom to continue.');
        return;
      }
      const res = await provider.connect();
      const key = res?.publicKey?.toString?.() || provider.publicKey?.toString?.() || '';
      if (key) {
        setWalletAddress(key);
        toast.success('Wallet connected');
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Wallet action canceled.');
    }
  };

  const disconnectWallet = async () => {
    try {
      const provider = getPhantomProvider();
      if (provider?.isPhantom) {
        await provider.disconnect();
      }
    } catch {}
    setWalletAddress('');
    toast('Wallet disconnected');
  };

  return (
    <div className="avatarContainer">
      <button className="avatarBtn" onClick={handleClick}>
        <div className="avatar">
          <span className="avatarIcon">👤</span>
        </div>
        <span className="avatarLabel">{displayName}</span>
      </button>

      {isOpen && (
        <div className="avatarMenu">
          <div className="menuContent">
            <div className="menuTop">
              <div className="menuProfile">
                <div className="menuAvatar">👤</div>
                <div>
                  <div className="menuName">{displayName}</div>
                  <div className="menuSub">{walletAddress}</div>
                </div>
              </div>
              <div
                className={`presenceBadge ${presenceMode}`}
                title={
                  presenceMode === 'live'
                    ? `Connected to realtime server\n${presenceUrl || ''}`.trim()
                    : presenceMode === 'fallback'
                      ? `Demo mode (fallback)\nTried: ${presenceUrl || 'n/a'}\n${lastPresenceError ? `Last error: ${lastPresenceError}` : ''}`.trim()
                      : `Disconnected\n${lastPresenceError ? `Last error: ${lastPresenceError}` : ''}`.trim()
                }
              >
                {presenceMode === 'live' ? 'Live' : presenceMode === 'fallback' ? 'Fallback' : 'Offline'}
              </div>
            </div>

            <div className="menuBody">
              <UsernameInput onClose={() => setIsOpen(false)} />
              <div
                className="menuItem"
                onClick={() => (walletAddress ? disconnectWallet() : connectWallet())}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    walletAddress ? disconnectWallet() : connectWallet();
                  }
                }}
              >
                <span className="menuIcon">🔌</span>
                <span className="menuText">{walletAddress ? 'Disconnect Wallet' : 'Connect Wallet'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .avatarContainer {
          position: relative;
        }

        .avatarBtn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.06);
          color: #e6edf5;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(8px) saturate(1.2);
        }

        .avatarBtn:hover {
          background: rgba(255,255,255,0.12);
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatarIcon {
          font-size: 16px;
        }

        .avatarLabel {
          font-size: 13px;
          font-weight: 600;
        }

        .avatarMenu {
          position: absolute;
          top: 100%;
          left: 0;
          min-width: 260px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(2,6,23,0.6);
          margin-top: 8px;
          z-index: 50;
          overflow: hidden;
        }

        .menuContent {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
        }

        .menuTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .presenceBadge {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
        }
        .presenceBadge.live { color: #22c55e; border-color: rgba(34,197,94,0.4); background: rgba(34,197,94,0.08); }
        .presenceBadge.fallback { color: #f59e0b; border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.08); }
        .presenceBadge.disconnected { color: #ef4444; border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.08); }

        .menuProfile {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .menuAvatar {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .menuName {
          font-weight: 700;
        }

        .menuSub {
          font-size: 12px;
          color: #9aa7bd;
        }

        .menuItem {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .menuItem:hover {
          background: var(--muted);
        }

        .menuIcon {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }

        .menuText {
          font-size: 14px;
          font-weight: 500;
          color: #e6edf5;
        }

        @media (max-width: 768px) {
          .avatarLabel {
            display: none;
          }

          .avatarBtn {
            padding: 6px;
          }

          .avatarMenu {
            min-width: 150px;
          }
        }
      `}</style>
    </div>
  );
}
