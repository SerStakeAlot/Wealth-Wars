"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { Orbitron, Inter } from 'next/font/google';
import { useGame } from '../app/lib/store';
import { UsernameInput } from './UsernameInput';
const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

interface AvatarButtonProps {
  onClick?: () => void;
}

export function AvatarButton({ onClick }: AvatarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { username, walletAddress } = useGame();

  const handleClick = () => {
    setIsOpen(!isOpen);
    onClick?.();
  };

  const displayName = walletAddress && username ? username : 'Player';

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
            </div>

            <div className="menuBody">
              <UsernameInput onClose={() => setIsOpen(false)} />
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
