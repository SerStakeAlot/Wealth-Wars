'use client';

import { useGame } from '../app/lib/store';

interface BusinessRowProps {
  asset: any;
}

export function BusinessRow({ asset }: BusinessRowProps) {
  console.log('BusinessRow rendering with asset:', asset);

  // Check if asset exists
  if (!asset) {
    console.error('BusinessRow: No asset provided');
    return <div style={{color: 'red', padding: '20px', border: '2px solid red'}}>Error: No asset data</div>;
  }

  console.log('Asset data:', asset.name, asset.id, asset.level);

  // Add back the game hooks for functionality
  const { wealth, buyOutlet, toggleManager, collect } = useGame();

  // Simple button handlers
  const handleCollect = () => {
    collect(asset.id);
  };

  const handleBuy = () => {
    buyOutlet(asset.id, 1);
  };

  const handleManager = () => {
    toggleManager(asset.id, !asset.managerHired);
  };

  return (
    <div style={{
      border: '2px solid #ffd700',
      borderRadius: '14px',
      padding: '20px',
      margin: '10px 0',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
      color: '#e6edf5',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '15px',
      boxShadow: '0 6px 24px rgba(15,23,42,0.15)',
      backdropFilter: 'blur(8px)'
    }}>
      {/* Identity Section */}
      <div>
        <h3 style={{margin: '0 0 8px 0', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase'}}>
          {asset.name}
        </h3>
        <span style={{
          background: 'linear-gradient(135deg, #1e2a4d, #172554)',
          color: '#fff',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          border: '1px solid rgba(255,255,255,0.16)'
        }}>
          Lv {asset.level}
        </span>
        <div style={{marginTop: '8px', fontSize: '14px', color: '#9aa7bd'}}>
          <span style={{fontWeight: '600', color: '#e6edf5'}}>× {asset.outlets}</span>
        </div>
      </div>

      {/* Progress Section */}
      <div>
        <div style={{
          height: '12px',
          width: '100%',
          background: 'rgba(255,255,255,0.12)',
          borderRadius: '999px',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '8px'
        }}>
          <div style={{
            height: '100%',
            width: '50%',
            background: 'linear-gradient(90deg, #22c55e, #16a34a)',
            transition: 'width 120ms linear'
          }} />
          <span style={{
            position: 'absolute',
            inset: '0',
            fontSize: '11px',
            color: '#e6edf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            Running
          </span>
        </div>
        <div style={{fontWeight: '700', color: '#e6edf5', marginBottom: '8px'}}>
          Profit/cycle: {asset.yieldPerTick * (asset.outlets || 1)} $WEALTH
        </div>
        <div style={{
          height: '8px',
          width: '100%',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '999px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${asset.condition || 100}%`,
            background: '#22c55e'
          }} />
        </div>
      </div>

      {/* Actions Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '8px'
      }}>
        <button
          style={{
            padding: '12px 10px',
            fontSize: '14px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #16a34a, #0f7a34)',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={handleCollect}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Collect
        </button>

        <button
          style={{
            padding: '12px 10px',
            fontSize: '14px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.16)',
            background: 'linear-gradient(135deg, #1e2a4d, #172554)',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={handleBuy}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Buy
        </button>

        <button
          style={{
            padding: '12px 10px',
            fontSize: '14px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            color: '#e6edf5',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={handleManager}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {asset.managerHired ? 'Manager ✓' : 'Hire Manager'}
        </button>
      </div>
    </div>
  );
}
