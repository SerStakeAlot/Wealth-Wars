'use client';
import React from 'react';
import { useGame } from '../app/lib/store';
import { ENHANCED_BUSINESSES } from '../app/lib/businesses';

function formatDuration(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function OwnedEnhancedBusinesses() {
  const { enhancedBusinesses, activeEnhancedBusinesses, toggleActiveEnhancedBusiness, activateBusinessAbility, businessCooldowns, wealth, activeSustainedAbilityId, sustainedAbilityEnd, abilityCharges, consumedUpgrades } = useGame();
  if (!enhancedBusinesses || enhancedBusinesses.length === 0) return null;
  const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
  const now = Date.now();

  return (
    <div className="ownedEnhancedWrapper">
      <div className="ownedHeader">
        <span className="ownedTitle">Owned Businesses</span>
  <span className="ownedSub">Instant / Sustained / Upgrade abilities • One sustained at a time • Toggle up to 3 for synergy</span>
      </div>
      <div className="ownedGrid">
        {enhancedBusinesses.map(id => {
          const biz = ENHANCED_BUSINESSES.find(b => b.id === id);
          if (!biz) return null;
          const isActive = activeEnhancedBusinesses.includes(id);
          const lastUsed = businessCooldowns[id] || 0;
          const cooldown = biz.ability.cooldown || FOUR_HOURS_MS;
          const cdRemaining = Math.max(0, cooldown - (now - lastUsed));
          const cdPct = 1 - (cdRemaining / cooldown);
          const isSustainedActive = activeSustainedAbilityId === id && now < sustainedAbilityEnd;
          const sustainedRemaining = isSustainedActive ? sustainedAbilityEnd - now : 0;
          const charges = abilityCharges[id] || 0;
          const upgradeConsumed = consumedUpgrades[id];
          const canActivate = !upgradeConsumed && cdRemaining === 0 && (biz.ability.effectMode === 'sustained' ? (!activeSustainedAbilityId || isSustainedActive) : true) && wealth >= (biz.ability.cost || 0);
          return (
            <div key={id} className={`ownedCard ${isActive ? 'active' : ''}`}> 
              <div className="ownedTop">
                <span className="emoji">{biz.emoji || '🏢'}</span>
                <div className="info">
                  <div className="name">{biz.name}</div>
                  <div className="cat">{biz.category} • {biz.ability.effectMode || biz.ability.type}</div>
                </div>
                <label className="toggleWrap" title={isActive ? 'Deactivate from synergy' : 'Activate for synergy'}>
                  <input type="checkbox" checked={isActive} onChange={() => toggleActiveEnhancedBusiness(id)} />
                  <span className="checkmark" />
                </label>
              </div>
              <div className="abilityDescSmall">{biz.ability?.description || biz.description}</div>
              <div className="abilityActions">
                {biz.ability.effectMode === 'upgrade' && upgradeConsumed && (
                  <span className="upgradeDone">Applied</span>
                )}
                {biz.ability.effectMode !== 'upgrade' && (
                  <button
                    className="activateBtn"
                    disabled={!canActivate}
                    onClick={() => activateBusinessAbility(id)}
                  >
                    {isSustainedActive ? `Active ${formatDuration(sustainedRemaining)}` : canActivate ? 'Activate' : cdRemaining > 0 ? `CD ${formatDuration(cdRemaining)}` : 'Cost'}
                  </button>
                )}
                {biz.ability.effectMode === 'instant' && charges > 0 && (
                  <span className="chargesTag">{charges} charges</span>
                )}
                {biz.ability.cost && !upgradeConsumed && <span className="costTag">Cost: {biz.ability.cost}</span>}
              </div>
              {biz.ability.effectMode !== 'upgrade' && (
                <div className="cooldownBar" aria-label="cooldown progress">
                  <div className="fill" style={{ width: `${cdPct*100}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .ownedEnhancedWrapper { margin-top:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); padding:16px; border-radius:14px; }
        .ownedHeader { display:flex; flex-direction:column; margin-bottom:12px; }
        .ownedTitle { font-size:15px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:#ffd700; }
        .ownedSub { font-size:11px; opacity:.7; color:#e6edf5; }
        .ownedGrid { display:grid; gap:12px; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); }
        .ownedCard { position:relative; background:#1e2533; border:1px solid #343d4e; border-radius:12px; padding:12px 12px 14px; display:flex; flex-direction:column; gap:8px; transition:border-color .2s, box-shadow .2s; }
        .ownedCard.active { border-color:#ffd700; box-shadow:0 0 0 1px #ffd70066, 0 4px 12px -2px #000; }
        .ownedTop { display:flex; align-items:center; gap:10px; }
        .emoji { font-size:26px; }
        .info .name { font-size:14px; font-weight:600; color:#e6edf5; }
        .info .cat { font-size:11px; text-transform:capitalize; color:#94a3b8; }
        .abilityDescSmall { font-size:12px; line-height:1.3; color:#cbd5e1; min-height:34px; }
  .abilityActions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .activateBtn { background:linear-gradient(90deg,#2563eb,#3b82f6); border:none; color:white; padding:6px 10px; font-size:12px; border-radius:6px; font-weight:600; cursor:pointer; box-shadow:0 4px 10px -2px #1e3a8a88; transition:background .2s, transform .15s; }
        .activateBtn:disabled { background:#334155; cursor:not-allowed; opacity:.6; box-shadow:none; }
        .activateBtn:not(:disabled):hover { filter:brightness(1.1); }
        .costTag { font-size:10px; padding:3px 6px; border-radius:4px; background:#334155; color:#e2e8f0; letter-spacing:.04em; }
  .chargesTag { font-size:10px; padding:3px 6px; border-radius:4px; background:#0f766e; color:#d1fae5; letter-spacing:.04em; }
  .upgradeDone { font-size:10px; padding:3px 6px; border-radius:4px; background:#4d7c0f; color:#ecfccb; letter-spacing:.04em; }
        .cooldownBar { height:5px; background:#0f172a; border-radius:4px; overflow:hidden; margin-top:4px; }
        .cooldownBar .fill { height:100%; background:linear-gradient(90deg,#10b981,#06b6d4); transition:width .5s linear; }
        .toggleWrap { margin-left:auto; position:relative; width:30px; height:18px; }
        .toggleWrap input { opacity:0; width:0; height:0; }
        .checkmark { position:absolute; inset:0; background:#334155; border-radius:20px; cursor:pointer; }
        .checkmark:after { content:''; position:absolute; width:14px; height:14px; top:2px; left:2px; background:#64748b; border-radius:50%; transition:transform .2s, background .2s; }
        .toggleWrap input:checked + .checkmark { background:#166534; }
        .toggleWrap input:checked + .checkmark:after { transform:translateX(12px); background:#10b981; }
        @media (max-width:600px){ .ownedGrid { grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
