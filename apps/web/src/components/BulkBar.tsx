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
          background: #fff; border-top: 2px solid #e5e7eb;
          padding: 16px 20px; box-shadow: 0 -4px 12px rgba(15,23,42,0.08);
          display: flex; justify-content: center; align-items: center; z-index: 10;
        }
        .actionButtons { display: flex; gap: 8px; }
        .actionBtn {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 16px; border: 1px solid #cbd5e1;
          background: #f8fafc; color: #0f172a; border-radius: 10px;
          cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;
        }
        .actionBtn:hover { background: #e2e8f0; transform: translateY(-1px); }
        .upgrades { border-color: #22c55e; color: #16a34a; }
        .upgrades:hover { background: #dcfce7; }
        .prestige { border-color: #f59e0b; color: #d97706; }
        .prestige:hover { background: #fef3c7; }
        .events { border-color: #8b5cf6; color: #7c3aed; }
        .events:hover { background: #f3e8ff; }
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
