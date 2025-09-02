'use client';

import { useState } from 'react';
import { Orbitron, Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

interface MenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MenuSheet({ isOpen, onClose }: MenuSheetProps) {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleEvents = () => {
    alert('Events & Planets coming soon!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="menuOverlay" onClick={onClose} />
      <div className="menuSheet">
        <div className="menuHeader">
          <h3 className={`${orbitron.className} menuTitle`}>MENU</h3>
          <button className="closeBtn" onClick={onClose}>✕</button>
        </div>

        <div className="menuContent">
          <div className="menuSection">
            <h4 className="sectionTitle">Navigation</h4>
            <button
              className="menuItem active"
              onClick={() => handleNavigation('/game')}
            >
              <span className="itemIcon">🎮</span>
              <span className="itemText">Play Mode</span>
            </button>
            <button
              className="menuItem"
              onClick={() => handleNavigation('/trade')}
            >
              <span className="itemIcon">📈</span>
              <span className="itemText">Trade Mode</span>
            </button>
            <button
              className="menuItem"
              onClick={() => handleNavigation('/about')}
            >
              <span className="itemIcon">ℹ️</span>
              <span className="itemText">About</span>
            </button>
          </div>

          <div className="menuSection">
            <h4 className="sectionTitle">Features</h4>
            <button className="menuItem" onClick={handleEvents}>
              <span className="itemIcon">🌍</span>
              <span className="itemText">Events & Planets</span>
            </button>
            <button className="menuItem" onClick={handleEvents}>
              <span className="itemIcon">⚙️</span>
              <span className="itemText">Options</span>
            </button>
          </div>

          <div className="menuSection">
            <h4 className="sectionTitle">Stats</h4>
            <div className="statItem">
              <span className="statLabel">Version</span>
              <span className="statValue">Alpha 1.0</span>
            </div>
            <div className="statItem">
              <span className="statLabel">Platform</span>
              <span className="statValue">Solana</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .menuOverlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15,23,42,0.5);
          z-index: 100;
        }

        .menuSheet {
          position: fixed;
          top: 0;
          right: 0;
          width: 320px;
          height: 100vh;
          background: #fff;
          box-shadow: -8px 0 25px rgba(15,23,42,0.15);
          z-index: 101;
          display: flex;
          flex-direction: column;
        }

        .menuHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .menuTitle {
          margin: 0;
          font-size: 18px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0f172a;
        }

        .closeBtn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
        }

        .closeBtn:hover {
          color: #0f172a;
        }

        .menuContent {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .menuSection {
          margin-bottom: 24px;
        }

        .sectionTitle {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .menuItem {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          background: #f8fafc;
          color: #0f172a;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 8px;
        }

        .menuItem:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }

        .menuItem.active {
          background: #172554;
          color: #fff;
          border-color: #172554;
        }

        .itemIcon {
          font-size: 18px;
          width: 24px;
          text-align: center;
        }

        .itemText {
          font-size: 14px;
          font-weight: 500;
        }

        .statItem {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .statLabel {
          font-size: 14px;
          color: #6b7280;
        }

        .statValue {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        @media (max-width: 480px) {
          .menuSheet {
            width: 280px;
          }

          .menuHeader {
            padding: 16px;
          }

          .menuContent {
            padding: 16px;
          }
        }
      `}</style>
    </>
  );
}
