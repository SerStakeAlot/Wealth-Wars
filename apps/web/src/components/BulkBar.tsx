'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BusinessPopup } from './BusinessPopup';

export function BulkBar() {
  const router = useRouter();
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);
  
  const handlePartnerships = () => alert('Partnerships system coming soon!');
  const handleEvents = () => alert('Events & Planets coming soon!');
  const handleBusiness = () => setIsBusinessOpen(true);

  return (
    <>
      <div className="bulkBar">
        <div className="actionButtons">
          <button className="actionBtn business" onClick={handleBusiness}>
            <span className="btnIcon">🏢</span><span className="btnText">Business</span>
          </button>
          <button className="actionBtn partnerships" onClick={handlePartnerships}>
            <span className="btnIcon">👑</span><span className="btnText">Partnerships</span>
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
          .business { border-color: #ffd700; color: #0ea5e9; background: #0c4a6e; }
          .business:hover { background: #075985; border-color: #ffd700; }
          .era { border-color: #ffd700; color: #16a34a; background: #064e3b; }
          .era:hover { background: #065f46; border-color: #ffd700; }
          .partnerships { border-color: #ffd700; color: #d97706; background: #451a03; }
          .partnerships:hover { background: #78350f; border-color: #ffd700; }
          .events { border-color: #ffd700; color: #7c3aed; background: #312e81; }
          .events:hover { background: #3730a3; border-color: #ffd700; }
          .attack { border-color: #ffd700; color: #dc2626; background: #7f1d1d; }
          .attack:hover { background: #991b1b; border-color: #ffd700; }
          .btnIcon { font-size: 16px; }
          .btnText { font-size: 13px; }
          @media (max-width: 768px) {
            .bulkBar { padding: 12px 16px; }
            .actionButtons { flex-wrap: wrap; justify-content: center; }
          }
        `}</style>
      </div>

      <BusinessPopup isOpen={isBusinessOpen} onClose={() => setIsBusinessOpen(false)} />
    </>
  );
}
