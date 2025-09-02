'use client';

import { useState } from 'react';
import { Orbitron, Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

interface AvatarButtonProps {
  onClick?: () => void;
}

export function AvatarButton({ onClick }: AvatarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
    onClick?.();
  };

  return (
    <div className="avatarContainer">
      <button className="avatarBtn" onClick={handleClick}>
        <div className="avatar">
          <span className="avatarIcon">👤</span>
        </div>
        <span className="avatarLabel">Player</span>
      </button>

      {isOpen && (
        <div className="avatarMenu">
          <div className="menuItem">
            <span className="menuIcon">🏆</span>
            <span className="menuText">Badges</span>
          </div>
          <div className="menuItem">
            <span className="menuIcon">👕</span>
            <span className="menuText">Suits</span>
          </div>
          <div className="menuItem">
            <span className="menuIcon">⚙️</span>
            <span className="menuText">Settings</span>
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
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #0f172a;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .avatarBtn:hover {
          background: #e2e8f0;
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
          right: 0;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 8px 25px rgba(15,23,42,0.12);
          margin-top: 4px;
          z-index: 20;
          overflow: hidden;
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
          background: #f8fafc;
        }

        .menuIcon {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }

        .menuText {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
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
