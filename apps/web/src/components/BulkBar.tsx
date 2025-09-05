'use client';
import { useRouter } from 'next/navigation';

export function BulkBar() {
  const router = useRouter();
  const handleUpgrades = () => alert('Upgrades page coming soon!');
  const handlePrestige = () => alert('Prestige system coming soon!');
  const handleEvents = () => alert('Events & Planets coming soon!');

  return (
    <div className="bulkBar">
      <div className="actionButtons">
        <button className="actionBtn upgrades" onClick={handleUpgrades}>
          <span className="btnIcon">⬆️</span><span className="btnText">Upgrades</span>
        </button>
        <button className="actionBtn prestige" onClick={handlePrestige}>
          <span className="btnIcon">👑</span><span className="btnText">Investors</span>
        </button>
        <button className="actionBtn events" onClick={handleEvents}>
          <span className="btnIcon">🌍</span><span className="btnText">Events</span>
        </button>
      </div>

      <style jsx>{`
        .bulkBar {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #1e293b; border-top: 3px solid #ffd700;
          padding: 16px 20px; box-shadow: 0 -4px 12px rgba(255,215,0,0.3);
          display: flex; justify-content: center; align-items: center; z-index: 10;
        }
        .actionButtons { display: flex; gap: 8px; }
        .actionBtn {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 16px; border: 2px solid #ffd700;
          background: #374151; color: #f1f5f9; border-radius: 10px;
          cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(255,215,0,.2);
        }
        .actionBtn:hover { background: #4b5563; transform: translateY(-1px); border-color: #ffd700; }
        .upgrades { border-color: #ffd700; color: #16a34a; background: #064e3b; }
        .upgrades:hover { background: #065f46; border-color: #ffd700; }
        .prestige { border-color: #ffd700; color: #d97706; background: #451a03; }
        .prestige:hover { background: #78350f; border-color: #ffd700; }
        .events { border-color: #ffd700; color: #7c3aed; background: #312e81; }
        .events:hover { background: #3730a3; border-color: #ffd700; }
        .btnIcon { font-size: 16px; }
        .btnText { font-size: 13px; }
        @media (max-width: 768px) {
          .bulkBar { padding: 12px 16px; }
          .actionButtons { flex-wrap: wrap; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
