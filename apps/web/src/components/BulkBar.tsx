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
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
          border-top: 1px solid rgba(255,255,255,0.12);
          padding: 16px 20px; box-shadow: 0 -4px 12px rgba(15,23,42,0.15);
          display: flex; justify-content: center; align-items: center; z-index: 10;
          backdrop-filter: blur(8px);
        }
        .actionButtons { display: flex; gap: 8px; }
        .actionBtn {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 16px; border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06); color: #e6edf5; border-radius: 10px;
          cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;
        }
        .actionBtn:hover { background: rgba(255,255,255,0.12); transform: translateY(-1px); }
        .upgrades { border-color: #22c55e; color: #4ade80; }
        .upgrades:hover { background: rgba(34,197,94,0.1); }
        .prestige { border-color: #f59e0b; color: #fbbf24; }
        .prestige:hover { background: rgba(245,158,11,0.1); }
        .events { border-color: #8b5cf6; color: #a78bfa; }
        .events:hover { background: rgba(139,92,246,0.1); }
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
