'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Inter, Orbitron } from 'next/font/google';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useGame } from '../lib/store';
import { useWealthWarsProgram } from '../hooks/useWealthWarsProgram';
import { BusinessRow } from '../../components/BusinessRow';
import { BulkBar } from '../../components/BulkBar';
import { AvatarButton } from '../../components/AvatarButton';
import { MenuSheet } from '../../components/MenuSheet';
import { UsernameInput } from '../../components/UsernameInput';
import { DefenseBanner } from '../../components/DefenseBanner';
import { WARDisplay } from '../../components/WARDisplay';
import { ShareModal } from '../../components/ShareModal';
import { ENHANCED_BUSINESSES } from '../lib/businesses';
import { MAINTENANCE_ACTIONS } from '../lib/maintenance';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

/* ---------- Build a connection locally (no external helper) ---------- */
const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  clusterApiUrl(
    (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as 'devnet' | 'testnet' | 'mainnet-beta') || 'devnet'
  );

function useSolanaConnection() {
  const ref = useRef<Connection | null>(null);
  if (!ref.current) {
    ref.current = new Connection(RPC_URL, 'confirmed');
  }
  return ref.current;
}

/* ---------- Phantom wallet types ---------- */
type SolanaProvider = {
  isPhantom?: boolean;
  publicKey?: { toString: () => string };
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
};

declare global {
  interface Window {
    solana?: any;
  }
}

const shorten = (pk = '') => (pk ? `${pk.slice(0, 4)}…${pk.slice(-4)}` : '');



/* ---------- Reusable Wallet Avatar ---------- */
function WalletAvatar({
  connected,
  pubkey,
  onClick,
  size = 40,
}: {
  connected: boolean;
  pubkey: string;
  onClick: () => void;
  size?: number;
}) {
  return (
    <div className="walletWrap">
      <button
        className="avatar"
        onClick={onClick}
        aria-label={connected ? 'Disconnect Wallet' : 'Connect Wallet'}
        style={{ width: size, height: size }}
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 1 1 0 2H5.5A.5.5 0 0 0 5 7.5V17a.5.5 0 0 0 .5.5H19a2 2 0 0 0 2-2V11a1 1 0 1 0-2 0v3.5a.5.5 0 0 1-.5.5H6a2 2 0 0 1-2-2V7.5Z" fill="currentColor"/>
          <circle cx="18" cy="12" r="1.3" fill="currentColor"/>
        </svg>
        {connected && <span className="dot" />}
      </button>
      <div className="badge">{connected ? shorten(pubkey) : 'Connect'}</div>

      <style jsx>{`
        .walletWrap { display: inline-flex; align-items: center; gap: 8px; }
        .avatar {
          border-radius: 999px; display: grid; place-items: center; color: #0b1220;
          background: linear-gradient(180deg, #fde68a, #fbbf24);
          border: 2px solid #ffd700; box-shadow: 0 6px 16px rgba(255, 215, 0, 0.3);
          cursor: pointer; transition: transform 120ms, filter 120ms;
        }
        .avatar:hover { transform: translateY(-1px); filter: brightness(1.03); }
        .dot {
          position: absolute; transform: translate(12px, -12px);
          width: 9px; height: 9px; border-radius: 999px; background: #22c55e; box-shadow: 0 0 0 2px #fff inset;
        }
        .badge {
          font-size: 12px; letter-spacing: 0.06em; padding: 6px 10px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); color: #e6edf5; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
          user-select: none;
        }
      `}</style>
    </div>
  );
}



export default function GamePage() {
  const connection = useSolanaConnection();
  const router = useRouter();

  /* ---------- Wallet state ---------- */
  const [provider, setProvider] = useState<SolanaProvider | null>(null);
  const [pubkey, setPubkey] = useState('');
  const [sol, setSol] = useState(0);
  const connected = !!pubkey;

  /* ---------- Solana integration ---------- */
  const { isConnected, publicKey } = useWealthWarsProgram();

  /* ---------- Game state ---------- */
  const { 
    level, xp, wealth, liquidity, assets, collect, upgrade, defend, prestige, clanEligible, derived, tick, setWalletAddress,
    // Daily Work System state
    creditBalance, streakDays, business, clickWork, buyBusiness, initPlayer,
    lastWorkTime, workCooldown, workFrequency, totalWorkActions, totalCreditsEarned,
    // Enhanced Business System
    enhancedBusinesses, buyEnhancedBusiness,
    // Business Maintenance System
    businessConditions, performBusinessMaintenance, maintenanceBudget,
    // Solana integration
    isOnChainMode, setOnChainMode, loading, setLoading,
    initPlayerOnChain, clickWorkOnChain, buyBusinessOnChain, 
    swapCreditForWealth, swapWealthForCredit, refreshPlayerData,
    treasuryState, refreshTreasuryData
  } = useGame();

  // Helper functions for maintenance
  const getBusinessCondition = (businessId: string) => {
    return businessConditions[businessId] || { condition: 100, isOffline: false };
  };

  const getConditionColor = (condition: number) => {
    if (condition >= 80) return '#22c55e'; // Green
    if (condition >= 60) return '#f59e0b'; // Orange  
    if (condition >= 40) return '#ef4444'; // Red
    return '#7c2d12'; // Dark red
  };

  const getConditionLabel = (condition: number) => {
    if (condition >= 80) return 'Excellent';
    if (condition >= 60) return 'Good';
    if (condition >= 40) return 'Fair';
    if (condition >= 20) return 'Poor';
    return 'Critical';
  };

  const handleMaintenance = async (businessId: string, actionType: 'routine' | 'major' | 'upgrade' | 'emergency') => {
    const result = performBusinessMaintenance(businessId, actionType);
    if (result.success) {
      toast.success(`Maintenance completed! Cost: ${result.cost?.toLocaleString()} credits`);
    } else {
      toast.error(result.reason || 'Maintenance failed');
    }
  };

  // Treasury state and calculations
  const [swapDirection, setSwapDirection] = useState<'credit-to-wealth' | 'wealth-to-credit'>('credit-to-wealth');
  const [swapAmount, setSwapAmount] = useState('');
  const [maxSlippage, setMaxSlippage] = useState(0.5);

  const treasuryCalculations = useMemo(() => {
    if (!treasuryState) {
      return {
        creditPrice: 0,
        wealthPrice: 0,
        totalLiquidity: 0,
        poolShare: { credit: 0, wealth: 0 },
        estimatedOutput: 0,
        priceImpact: 0,
        minimumReceived: 0
      };
    }

    const { quoteReserve: creditReserves, baseReserve: wealthReserves } = treasuryState;
    const totalLiquidity = creditReserves + wealthReserves;
    const creditPrice = wealthReserves / creditReserves;
    const wealthPrice = creditReserves / wealthReserves;
    
    const poolShare = {
      credit: (creditReserves / totalLiquidity) * 100,
      wealth: (wealthReserves / totalLiquidity) * 100
    };

    let estimatedOutput = 0;
    let priceImpact = 0;
    let minimumReceived = 0;

    if (swapAmount && parseFloat(swapAmount) > 0) {
      const inputAmount = parseFloat(swapAmount);
      
      if (swapDirection === 'credit-to-wealth') {
        const k = creditReserves * wealthReserves;
        const newCreditReserves = creditReserves + inputAmount;
        const newWealthReserves = k / newCreditReserves;
        estimatedOutput = wealthReserves - newWealthReserves;
        
        const originalPrice = wealthReserves / creditReserves;
        const newPrice = estimatedOutput / inputAmount;
        priceImpact = Math.abs((newPrice - originalPrice) / originalPrice) * 100;
      } else {
        const k = creditReserves * wealthReserves;
        const newWealthReserves = wealthReserves + inputAmount;
        const newCreditReserves = k / newWealthReserves;
        estimatedOutput = creditReserves - newCreditReserves;
        
        const originalPrice = creditReserves / wealthReserves;
        const newPrice = estimatedOutput / inputAmount;
        priceImpact = Math.abs((newPrice - originalPrice) / originalPrice) * 100;
      }

      minimumReceived = estimatedOutput * (1 - maxSlippage / 100);
    }

    return {
      creditPrice,
      wealthPrice,
      totalLiquidity,
      poolShare,
      estimatedOutput,
      priceImpact,
      minimumReceived
    };
  }, [treasuryState, swapAmount, swapDirection, maxSlippage]);

  useEffect(() => {
    const p = typeof window !== 'undefined' ? window.solana : undefined;
    if (p?.isPhantom) {
      setProvider(p);
      try {
        p.on?.('connect', (args: any) => {
          const k = (args?.publicKey?.toString?.() ?? p.publicKey?.toString?.() ?? '') as string;
          if (k) setPubkey(k);
        });
        p.on?.('disconnect', () => { setPubkey(''); setSol(0); });
        const maybe = p.publicKey?.toString?.();
        if (maybe) setPubkey(maybe);
      } catch {}
    } else {
      setProvider(null);
    }
  }, []);

  // Update wallet address in store when pubkey changes
  useEffect(() => {
    setWalletAddress(pubkey);
  }, [pubkey]); // Removed setWalletAddress from deps since it's stable from Zustand
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // AdCap timer for auto-collection
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 250); // Update every 250ms for smooth progress bars

    return () => clearInterval(interval);
  }, [tick]);

  const lowLiquidity = liquidity < 0.12;
  const anyWeakAsset = assets.some(a => a.condition < 35);
  const profitPerSecond = derived.profitPerSecond || 0;

  async function handleWalletClick() {
    try {
      if (!provider) {
        alert('Phantom wallet not found. Install Phantom from https://phantom.app and try again.');
        return;
      }
      if (!pubkey) {
        const res = await provider.connect();
        const key = res?.publicKey?.toString?.();
        if (key) {
          setPubkey(key);
          await refreshBalance(key);
          toast.success('💸 Wallet Connected!'); // <-- Show toast on connect
        }
      } else {
        await provider.disconnect();
        setPubkey('');
        setSol(0);
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Wallet action canceled.');
    }
  }

  async function refreshBalance(key?: string) {
    try {
      const k = key ?? pubkey;
      if (!k) return;
      const lamports = await connection.getBalance(new PublicKey(k));
      setSol(lamports / 1e9);
    } catch (e) {
      console.error(e);
    }
  }

  async function airdrop1Sol() {
    try {
      if (!pubkey) return alert('Connect your wallet first.');
      const sig = await connection.requestAirdrop(new PublicKey(pubkey), 1e9); // 1 SOL
      await connection.confirmTransaction(sig, 'confirmed');
      await refreshBalance();
      alert('Airdropped 1 SOL on devnet.');
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Airdrop failed (devnet can rate-limit). Try again soon.');
    }
  }

  useEffect(() => { if (pubkey) refreshBalance(); }, [pubkey]);

  return (
    <div className={`${inter.className} page`}>
      {/* Defense Banner - Shows when under attack */}
      <DefenseBanner />
      
      {/* TOP BAR - Player Status & Settings */}
      <header className="topBar">
        <div className="playerSection">
          <div className="brand">
            <span className={`${orbitron.className} logo`}>WEALTH WARS</span>
            <span className="mode">GAME MODE</span>
          </div>
          <AvatarButton onClick={() => setProfileOpen(true)} />
        </div>

        <div className="profitSection">
          <div className="totalWealth">
            <span className="wealthLabel">$WEALTH</span>
            <span className={`${orbitron.className} wealthValue`}>{wealth.toLocaleString()}</span>
          </div>
          <div className="warCompact">
            <WARDisplay compact={true} />
          </div>
        </div>

        <div className="menuSection">
          <button className="menuBtn" onClick={() => setMenuOpen(true)}>
            <span className="menuIcon">☰</span>
          </button>
        </div>
      </header>

      {/* ALERT BANNER */}
      <section className="banner">
        <div className={`dot ${lowLiquidity || anyWeakAsset ? 'bad' : 'good'}`} />
        <div className="msg">
          {lowLiquidity
            ? 'Warning: Liquidity is low — assets vulnerable to takeover.'
            : anyWeakAsset
              ? 'Some assets are weakening — consider defense or upgrades.'
              : 'All systems stable — keep compounding your gains.'}
        </div>
      </section>

      {/* DAILY WORK SECTION */}
      <main className="creditSection">
        <div className="creditCard">
          <div className="creditDisplay">
            <span className="creditLabel">CREDITS</span>
            <span className={`${orbitron.className} creditValue`}>{creditBalance.toLocaleString()}</span>
          </div>
          
          <div className="workStats">
            <div className="workStat">
              <span className="statLabel">Streak</span>
              <span className="statValue">{streakDays} days</span>
            </div>
            <div className="workStat">
              <span className="statLabel">Work Level</span>
              <span className="statValue">{workFrequency}</span>
            </div>
            <div className="workStat">
              <span className="statLabel">Total Work</span>
              <span className="statValue">{totalWorkActions}</span>
            </div>
            <div className="workStat">
              <span className="statLabel">Mode</span>
              <span className="statValue">
                {isOnChainMode ? '⛓️ On-Chain' : '💻 Local'}
              </span>
            </div>
          </div>

          {/* On-chain initialization section */}
          {isConnected && !isOnChainMode && (
            <div className="onChainInit">
              <button 
                className="initBtn" 
                onClick={initPlayerOnChain}
                disabled={loading}
              >
                {loading ? 'Initializing...' : '⛓️ Initialize On-Chain'}
              </button>
              <p className="initText">
                Connect to Solana blockchain for verifiable timing and rewards
              </p>
            </div>
          )}

          {(() => {
            const now = Date.now();
            const timeSinceLastWork = now - (lastWorkTime || 0);
            const timeUntilWork = (workCooldown || (24 * 60 * 60 * 1000)) - timeSinceLastWork;
            const canWork = timeUntilWork <= 0;
            
            // Calculate work value
            const baseCredits = 10;
            const streakBonus = streakDays * 2;
            const businessBonus = 
              (business.lemStand * 5) +
              (business.cafe * 25) + 
              (business.factory * 100);
            const workValue = baseCredits + streakBonus + businessBonus;

            // Determine which work function to use
            const handleWork = isOnChainMode ? clickWorkOnChain : clickWork;

            if (canWork) {
              return (
                <button className="workBtn" onClick={handleWork} disabled={loading}>
                  <span className="workIcon">💼</span>
                  <span className="workText">
                    {loading ? 'Working...' : 'Clock in'}
                    {isOnChainMode && <span className="onChainBadge">⛓️</span>}
                  </span>
                  <span className="workEarn">+{workValue} credits</span>
                </button>
              );
            } else {
              const hours = Math.floor(timeUntilWork / (60 * 60 * 1000));
              const minutes = Math.floor((timeUntilWork % (60 * 60 * 1000)) / (60 * 1000));
              
              return (
                <div className="workCooldown">
                  <span className="cooldownIcon">⏰</span>
                  <span className="cooldownText">Next work available in</span>
                  <span className="cooldownTime">{hours}h {minutes}m</span>
                </div>
              );
            }
          })()}
        </div>

        <div className="businessGrid">
          {/* Basic Businesses */}
          <div className="businessCard">
            <div className="businessHeader">
              <span className="businessIcon">🥤</span>
              <span className="businessName">Lemonade Stand</span>
            </div>
            <div className="businessStats">
              <span className="businessOwned">Owned: {business.lemStand}</span>
              <span className="businessIncome">+{business.lemStand * 5} credits per work</span>
            </div>
            <button 
              className="buyBtn" 
              onClick={() => buyBusiness(0)}
              disabled={creditBalance < 10}
            >
              Buy for 10 credits
            </button>
          </div>

          <div className="businessCard">
            <div className="businessHeader">
              <span className="businessIcon">☕</span>
              <span className="businessName">Coffee Cafe</span>
            </div>
            <div className="businessStats">
              <span className="businessOwned">Owned: {business.cafe}</span>
              <span className="businessIncome">+{business.cafe * 25} credits per work</span>
            </div>
            <button 
              className="buyBtn" 
              onClick={() => buyBusiness(1)}
              disabled={creditBalance < 50}
            >
              Buy for 50 credits
            </button>
          </div>

          <div className="businessCard">
            <div className="businessHeader">
              <span className="businessIcon">🏭</span>
              <span className="businessName">Widget Factory</span>
            </div>
            <div className="businessStats">
              <span className="businessOwned">Owned: {business.factory}</span>
              <span className="businessIncome">+{business.factory * 100} credits per work</span>
            </div>
            <button 
              className="buyBtn" 
              onClick={() => buyBusiness(2)}
              disabled={creditBalance < 200}
            >
              Buy for 200 credits
            </button>
          </div>

          {/* Enhanced Businesses */}
          {ENHANCED_BUSINESSES.slice(0, 3).map((enhancedBiz) => {
            const isOwned = enhancedBusinesses.includes(enhancedBiz.id);
            const condition = getBusinessCondition(enhancedBiz.id);
            const conditionColor = getConditionColor(condition.condition);
            const conditionLabel = getConditionLabel(condition.condition);
            
            return (
              <div key={enhancedBiz.id} className="businessCard enhanced">
                <div className="businessHeader">
                  <span className="businessIcon">{enhancedBiz.emoji}</span>
                  <div className="businessTitleInfo">
                    <span className="businessName">{enhancedBiz.name}</span>
                    <span className="businessCategory">{enhancedBiz.category}</span>
                  </div>
                  {condition.isOffline && (
                    <span className="offlineIndicator">🔧 OFFLINE</span>
                  )}
                </div>
                
                {isOwned && (
                  <div className="healthSection">
                    <div className="healthHeader">
                      <span className="healthLabel">Condition: {conditionLabel}</span>
                      <span className="healthValue" style={{ color: conditionColor }}>
                        {Math.floor(condition.condition)}%
                      </span>
                    </div>
                    <div className="healthBar">
                      <div 
                        className="healthFill" 
                        style={{ 
                          width: `${condition.condition}%`, 
                          backgroundColor: conditionColor 
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="businessStats">
                  <span className="businessOwned">
                    {isOwned ? 'Owned ✓' : 'Not Owned'}
                  </span>
                  <span className="businessIncome">+{enhancedBiz.workMultiplier} credits per work</span>
                  <span className="businessDescription">{enhancedBiz.description}</span>
                </div>
                
                {isOwned ? (
                  <div className="maintenanceActions">
                    <button 
                      className="maintenanceBtn routine"
                      onClick={() => handleMaintenance(enhancedBiz.id, 'routine')}
                      disabled={condition.condition >= 90}
                      title="Routine maintenance - Low cost, moderate repair"
                    >
                      🔧 Routine
                    </button>
                    <button 
                      className="maintenanceBtn major"
                      onClick={() => handleMaintenance(enhancedBiz.id, 'major')}
                      disabled={condition.condition >= 90}
                      title="Major overhaul - Higher cost, significant repair"
                    >
                      ⚙️ Major
                    </button>
                    {condition.condition <= 20 && (
                      <button 
                        className="maintenanceBtn emergency"
                        onClick={() => handleMaintenance(enhancedBiz.id, 'emergency')}
                        title="Emergency repair - Expensive but instant"
                      >
                        🚨 Emergency
                      </button>
                    )}
                  </div>
                ) : (
                  <button 
                    className="buyBtn enhanced"
                    onClick={() => buyEnhancedBusiness(enhancedBiz.id)}
                    disabled={creditBalance < enhancedBiz.cost}
                  >
                    Buy for {enhancedBiz.cost.toLocaleString()} credits
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Treasury & Swap Section */}
        <div className="treasurySection">
          <div className="treasuryHeader">
            <span className="treasuryIcon">🏦</span>
            <span className="treasuryTitle">Treasury & Token Swaps</span>
          </div>
          
          <div className="modeToggle">
            <button 
              className={`modeBtn ${!isOnChainMode ? 'active' : ''}`}
              onClick={() => setOnChainMode(false)}
            >
              Demo Mode
            </button>
            <button 
              className={`modeBtn ${isOnChainMode ? 'active' : ''}`}
              onClick={() => setOnChainMode(true)}
            >
              Solana Mode
            </button>
          </div>

          {!isOnChainMode && (
            <div className="demoNotice">
              <span className="noticeIcon">ℹ️</span>
              <span>Demo mode - Real transactions require Anchor program deployment</span>
            </div>
          )}

          {/* Pool Information */}
          <div className="poolInfo">
            <h3>Liquidity Pool Stats</h3>
            <div className="poolStatsGrid">
              <div className="poolStat">
                <span className="statLabel">Total Value Locked:</span>
                <span className="statValue">{treasuryCalculations.totalLiquidity.toLocaleString()} USD</span>
              </div>
              <div className="poolStat">
                <span className="statLabel">Credit Price:</span>
                <span className="statValue">${treasuryCalculations.creditPrice.toFixed(4)}</span>
              </div>
              <div className="poolStat">
                <span className="statLabel">$WEALTH Price:</span>
                <span className="statValue">${treasuryCalculations.wealthPrice.toFixed(4)}</span>
              </div>
              <div className="poolStat">
                <span className="statLabel">Pool Composition:</span>
                <span className="statValue">
                  {treasuryCalculations.poolShare.credit.toFixed(1)}% Credits / {treasuryCalculations.poolShare.wealth.toFixed(1)}% $WEALTH
                </span>
              </div>
            </div>
          </div>

          {/* Swap Interface */}
          <div className="swapInterface">
            <div className="swapDirection">
              <button 
                className={`directionBtn ${swapDirection === 'credit-to-wealth' ? 'active' : ''}`}
                onClick={() => setSwapDirection('credit-to-wealth')}
              >
                Credits → $WEALTH
              </button>
              <button 
                className={`directionBtn ${swapDirection === 'wealth-to-credit' ? 'active' : ''}`}
                onClick={() => setSwapDirection('wealth-to-credit')}
              >
                $WEALTH → Credits
              </button>
            </div>

            <div className="swapCard">
              <div className="swapInputGroup">
                <label className="inputLabel">
                  You're swapping: {swapDirection === 'credit-to-wealth' ? 'Credits' : '$WEALTH'}
                </label>
                <input 
                  type="number" 
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  placeholder={`Amount of ${swapDirection === 'credit-to-wealth' ? 'Credits' : '$WEALTH'}`}
                  className="swapInput"
                />
              </div>

              {swapAmount && parseFloat(swapAmount) > 0 && (
                <div className="swapPreview">
                  <div className="previewItem">
                    <span>You'll receive:</span>
                    <span className="outputAmount">
                      {treasuryCalculations.estimatedOutput.toFixed(4)} {swapDirection === 'credit-to-wealth' ? '$WEALTH' : 'Credits'}
                    </span>
                  </div>
                  <div className="previewItem">
                    <span>Price Impact:</span>
                    <span className={`priceImpact ${treasuryCalculations.priceImpact > 5 ? 'high' : treasuryCalculations.priceImpact > 2 ? 'medium' : 'low'}`}>
                      {treasuryCalculations.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="previewItem">
                    <span>Minimum received (slippage: {maxSlippage}%):</span>
                    <span>{treasuryCalculations.minimumReceived.toFixed(4)} {swapDirection === 'credit-to-wealth' ? '$WEALTH' : 'Credits'}</span>
                  </div>
                </div>
              )}

              <div className="slippageSettings">
                <label className="inputLabel">Max Slippage: {maxSlippage}%</label>
                <input 
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={maxSlippage}
                  onChange={(e) => setMaxSlippage(parseFloat(e.target.value))}
                  className="slippageSlider"
                />
                <div className="slippageOptions">
                  {[0.5, 1, 2, 5].map(value => (
                    <button 
                      key={value}
                      className={`slippageBtn ${maxSlippage === value ? 'active' : ''}`}
                      onClick={() => setMaxSlippage(value)}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className="swapBtn"
                disabled={loading || !swapAmount || parseFloat(swapAmount) <= 0 || treasuryCalculations.priceImpact > 10}
                onClick={() => {
                  if (swapDirection === 'credit-to-wealth') {
                    swapCreditForWealth(swapAmount);
                  } else {
                    swapWealthForCredit(swapAmount);
                  }
                }}
              >
                {loading ? 'Processing...' : 
                 treasuryCalculations.priceImpact > 10 ? 'Price impact too high' :
                 !swapAmount || parseFloat(swapAmount) <= 0 ? 'Enter amount' :
                 `Swap ${swapDirection === 'credit-to-wealth' ? 'Credits' : '$WEALTH'}`}
              </button>
            </div>
          </div>

          <div className="treasuryInfo">
            <div className="treasuryStats">
              <span className="statLabel">Treasury Status:</span>
              <span className="statValue">{treasuryState ? 'Active' : 'Not Initialized'}</span>
            </div>
            <div className="treasuryStats">
              <span className="statLabel">Exchange Rate:</span>
              <span className="statValue">
                {treasuryState ? 
                  `1 Credit = ${treasuryCalculations.creditPrice.toFixed(4)} $WEALTH` : 
                  'Calculating...'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="resetSection">
          <button className="resetBtn" onClick={initPlayer}>
            Reset Progress
          </button>
        </div>
      </main>

      {/* PROFILE SLIDE-OUT */}
      <aside className={`drawer ${profileOpen ? 'open' : ''}`}>
        <div className="drawerHead">
          <h4 className={`${orbitron.className} drawerTitle`}>Player Profile</h4>
          <button className="x" onClick={() => setProfileOpen(false)}>✕</button>
        </div>

        <div className="profileRows">
          <div className="pRow"><span className="pKey">Wallet</span><span className="pVal">{connected ? shorten(pubkey) : 'Not connected'}</span></div>
          <div className="pRow"><span className="pKey">Level</span><span className="pVal">{level}</span></div>
          <div className="pRow"><span className="pKey">XP</span><span className="pVal">{xp}/100</span></div>
          <div className="pRow"><span className="pKey">SOL (devnet)</span><span className="pVal">{sol.toFixed(2)}</span></div>
          <div className="pRow"><span className="pKey">$WEALTH</span><span className="pVal">{wealth}</span></div>
          <div className="pRow"><span className="pKey">Liquidity</span><span className="pVal">{Math.round(liquidity*100)}%</span></div>
          <div className="pRow"><span className="pKey">Prestige</span><span className="pVal">{prestige}</span></div>
        </div>

        <UsernameInput />

        <div className="sep" />

        <div className="navTabs">
          <button className="navBtn active" onClick={() => router.push('/game')}>Play Mode</button>
          <button className="navBtn" onClick={() => router.push('/forbes')}>Forbes List</button>
        </div>

        <div className="sep" />

        {clanEligible && (
          <div className="clanCta">
            <h5>Clan Invitation</h5>
            <p>You've reached the minimum level to join a clan!</p>
            <button className="btn primary">Join Clan</button>
          </div>
        )}

        <div className="sep" />

        <div className="nftWrap">
          <h5 className="nftTitle">Owned Cosmetics</h5>
          <ul className="nftList">
            <li>Badge: Early Founder</li>
            <li>Wearable: Golden Visor</li>
            <li>Frame: Emerald Edge</li>
          </ul>
        </div>

        {/* wallet tools pinned bottom-right */}
        <div className="drawerWallet">
          <WalletAvatar connected={connected} pubkey={pubkey} onClick={handleWalletClick} size={44} />
          <button className="airBtn" onClick={airdrop1Sol}>Devnet Airdrop 1 SOL</button>
          <button className="airBtn ghost" onClick={() => refreshBalance()}>Refresh</button>
        </div>
      </aside>

      {/* MENU SHEET */}
      <MenuSheet isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* SHARE MODAL */}
      <ShareModal />

      {/* BOTTOM BAR */}
      <BulkBar />

      {/* STYLES */}
      <style jsx>{`
        .page { min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #e6edf5; display: flex; flex-direction: column; }

        .topBar {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 16px 20px;
          background: rgba(255,255,255,0.06);
          border-bottom: 2px solid #ffd700;
          backdrop-filter: blur(8px);
          z-index: 10;
          position: relative;
          box-shadow: 0 2px 12px rgba(255,215,0,0.2);
        }

        .playerSection {
          position: absolute;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .profitSection {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
        }
        .menuSection {
          position: absolute;
          right: 20px;
          display: flex;
          align-items: center;
        }

        .brand { font-weight: 800; display: flex; flex-direction: column; align-items: flex-start; }
        .logo {
          letter-spacing: 0.12em; text-transform: uppercase;
          background: linear-gradient(180deg,#fff6c7,#ffd34a 72%,#9b6a1a);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .mode { font-size: 12px; color: #9aa7bd; letter-spacing: 0.08em; text-transform: uppercase; }

        .totalWealth { display: flex; flex-direction: column; align-items: center; }
        .wealthLabel { font-size: 12px; color: #9aa7bd; letter-spacing: 0.08em; text-transform: uppercase; }
        .wealthValue { font-size: 24px; font-weight: 800; color: #e6edf5; }

        .warCompact {
          margin-top: 8px;
        }

        .profitRate { display: flex; flex-direction: column; align-items: center; margin-top: 4px; }
        .rateLabel { font-size: 11px; color: #9aa7bd; letter-spacing: 0.06em; text-transform: uppercase; }
        .rateValue { font-size: 16px; font-weight: 600; color: #3b82f6; }

        .menuBtn {
          border: 2px solid #ffd700;
          background: rgba(255,255,255,0.06);
          color: #e6edf5;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(255,215,0,0.2);
        }
        .menuBtn:hover { background: rgba(255,255,255,0.12); }
        .menuIcon { font-size: 16px; }

        .banner { display: flex; align-items: center; gap: 10px; margin: 10px 16px; padding: 12px 14px; background: rgba(255,255,255,0.06); border: 2px solid #ffd700; border-radius: 12px; box-shadow: 0 2px 8px rgba(255,215,0,0.2); }
        .dot { width: 10px; height: 10px; border-radius: 999px; background: #22c55e; }
        .dot.bad { background: #ef4444; }
        .msg { font-weight: 600; }

        .businessList {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          padding-bottom: 120px; /* Space for bottom bar */
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        /* WAR Section styles */
        .warSection {
          padding: 0 16px;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        /* Credit-based game styles */
        .creditSection {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 16px;
          padding-bottom: 120px;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        .creditCard {
          background: rgba(255,255,255,0.08);
          border: 2px solid #ffd700;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(255,215,0,0.2);
        }

        .creditDisplay {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 16px;
        }

        .creditLabel {
          font-size: 14px;
          color: #9aa7bd;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .creditValue {
          font-size: 36px;
          font-weight: 800;
          color: #ffd700;
          text-shadow: 0 0 20px rgba(255,215,0,0.4);
        }

        .workStats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .workStat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px;
          background: rgba(255,255,255,0.04);
          border-radius: 8px;
        }

        .statLabel {
          color: #9aa7bd;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }

        .statValue {
          color: #e6edf5;
          font-weight: 600;
          font-size: 14px;
          text-transform: capitalize;
        }

        .workBtn {
          background: linear-gradient(180deg, #22c55e, #16a34a);
          border: none;
          border-radius: 12px;
          padding: 16px 24px;
          color: white;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(34,197,94,0.3);
          width: 100%;
        }

        .workBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(34,197,94,0.4);
        }

        .workCooldown {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 24px;
          background: rgba(255,255,255,0.04);
          border: 2px dashed rgba(255,255,255,0.2);
          border-radius: 12px;
          color: #9aa7bd;
          gap: 4px;
        }

        .cooldownIcon {
          font-size: 24px;
          margin-bottom: 4px;
        }

        .cooldownText {
          font-size: 14px;
          color: #9aa7bd;
        }

        .cooldownTime {
          font-size: 18px;
          font-weight: 600;
          color: #ffd700;
        }
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(34,197,94,0.3);
        }

        .workIcon {
          font-size: 20px;
        }

        .workText {
          flex: 1;
        }

        .workEarn {
          background: rgba(255,255,255,0.2);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
        }

        .businessGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .businessCard {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s;
        }

        .businessCard:hover {
          border-color: #ffd700;
          box-shadow: 0 4px 16px rgba(255,215,0,0.1);
        }

        .businessCard.enhanced {
          background: linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.08));
          border: 1px solid rgba(34,197,94,0.3);
          position: relative;
          overflow: hidden;
        }

        .businessCard.enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-left: 20px solid transparent;
          border-top: 20px solid rgba(34,197,94,0.6);
        }

        .businessCard.enhanced:hover {
          border-color: #22c55e;
          box-shadow: 0 4px 16px rgba(34,197,94,0.3);
        }

        .businessHeader {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .businessIcon {
          font-size: 24px;
        }

        .businessName {
          font-weight: 600;
          color: #e6edf5;
        }

        .businessCategory {
          background: rgba(34,197,94,0.2);
          color: #22c55e;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }

        .businessStats {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 16px;
        }

        .businessOwned {
          color: #9aa7bd;
          font-size: 14px;
        }

        .businessIncome {
          color: #22c55e;
          font-size: 14px;
          font-weight: 600;
        }

        .businessDescription {
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.4;
          margin-top: 4px;
        }

        .buyBtn {
          background: linear-gradient(180deg, #3b82f6, #2563eb);
          border: none;
          border-radius: 8px;
          padding: 12px 16px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }

        .buyBtn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .buyBtn:disabled {
          background: rgba(255,255,255,0.08);
          color: #9aa7bd;
          cursor: not-allowed;
        }

        .buyBtn.enhanced {
          background: linear-gradient(180deg, #22c55e, #16a34a);
          border: 1px solid rgba(34,197,94,0.3);
        }

        .buyBtn.enhanced:hover:not(:disabled) {
          box-shadow: 0 4px 12px rgba(34,197,94,0.3);
        }

        .buyBtn.enhanced:disabled {
          background: rgba(34,197,94,0.1);
          color: #6b7280;
        }

        .healthSection {
          margin-top: 8px;
          padding: 6px 8px;
          background: rgba(0,0,0,0.2);
          border-radius: 4px;
        }

        .healthBar {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .healthFill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .healthFill.excellent {
          background: linear-gradient(90deg, #22c55e, #16a34a);
        }

        .healthFill.good {
          background: linear-gradient(90deg, #eab308, #ca8a04);
        }

        .healthFill.poor {
          background: linear-gradient(90deg, #f97316, #ea580c);
        }

        .healthFill.critical {
          background: linear-gradient(90deg, #ef4444, #dc2626);
        }

        .conditionText {
          font-size: 10px;
          text-align: center;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .conditionText.excellent {
          color: #22c55e;
        }

        .conditionText.good {
          color: #eab308;
        }

        .conditionText.poor {
          color: #f97316;
        }

        .conditionText.critical {
          color: #ef4444;
        }

        .maintenanceActions {
          display: flex;
          gap: 4px;
          margin-top: 6px;
        }

        .maintenanceBtn {
          flex: 1;
          padding: 4px 6px;
          font-size: 9px;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .maintenanceBtn.routine {
          background: linear-gradient(180deg, #3b82f6, #2563eb);
          color: white;
        }

        .maintenanceBtn.routine:hover {
          box-shadow: 0 2px 6px rgba(59,130,246,0.3);
          transform: translateY(-1px);
        }

        .maintenanceBtn.major {
          background: linear-gradient(180deg, #f59e0b, #d97706);
          color: white;
        }

        .maintenanceBtn.major:hover {
          box-shadow: 0 2px 6px rgba(245,158,11,0.3);
          transform: translateY(-1px);
        }

        .maintenanceBtn.emergency {
          background: linear-gradient(180deg, #ef4444, #dc2626);
          color: white;
        }

        .maintenanceBtn.emergency:hover {
          box-shadow: 0 2px 6px rgba(239,68,68,0.3);
          transform: translateY(-1px);
        }

        .maintenanceBtn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .offlineIndicator {
          position: absolute;
          top: 4px;
          right: 4px;
          padding: 2px 6px;
          background: rgba(156,163,175,0.9);
          color: white;
          font-size: 8px;
          border-radius: 8px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .onChainInit {
          margin-top: 16px;
          padding: 16px;
          background: rgba(34,197,94,0.05);
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 8px;
          text-align: center;
        }

        .initBtn {
          background: linear-gradient(180deg, #22c55e, #16a34a);
          border: 1px solid rgba(34,197,94,0.3);
          border-radius: 6px;
          padding: 10px 20px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 8px;
        }

        .initBtn:hover:not(:disabled) {
          box-shadow: 0 4px 12px rgba(34,197,94,0.3);
          transform: translateY(-1px);
        }

        .initBtn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .initText {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          margin: 0;
        }

        .onChainBadge {
          margin-left: 4px;
          font-size: 10px;
        }

        .resetSection {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }

        .resetBtn {
          background: rgba(239,68,68,0.8);
          border: 1px solid #ef4444;
          border-radius: 8px;
          padding: 12px 24px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .resetBtn:hover {
          background: #ef4444;
          transform: translateY(-1px);
        }

        /* Treasury & Swap Section Styles */
        .treasurySection {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 24px;
          margin-top: 8px;
        }

        .treasuryHeader {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .treasuryIcon {
          font-size: 24px;
        }

        .treasuryTitle {
          font-weight: 700;
          font-size: 18px;
          color: #e6edf5;
        }

        .modeToggle {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .modeBtn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 8px 16px;
          color: #9aa7bd;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
        }

        .modeBtn.active {
          background: linear-gradient(180deg, #3b82f6, #2563eb);
          border-color: #3b82f6;
          color: white;
        }

        .modeBtn:hover:not(.active) {
          background: rgba(255,255,255,0.12);
          color: #e6edf5;
        }

        .demoNotice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(251,191,36,0.1);
          border: 1px solid rgba(251,191,36,0.3);
          border-radius: 8px;
          margin-bottom: 20px;
          color: #fbbf24;
          font-size: 14px;
        }

        .noticeIcon {
          font-size: 16px;
        }

        .swapGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .swapCard {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 16px;
        }

        .swapHeader {
          font-weight: 600;
          color: #e6edf5;
          margin-bottom: 12px;
          text-align: center;
        }

        .swapInputGroup {
          display: flex;
          gap: 8px;
        }

        .swapInput {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 6px;
          padding: 8px 12px;
          color: #e6edf5;
          font-size: 14px;
        }

        .swapInput::placeholder {
          color: #9aa7bd;
        }

        .swapInput:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
        }

        .swapBtn {
          background: linear-gradient(180deg, #f59e0b, #d97706);
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .swapBtn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245,158,11,0.3);
        }

        .swapBtn:disabled {
          background: rgba(255,255,255,0.08);
          color: #9aa7bd;
          cursor: not-allowed;
        }

        .treasuryInfo {
          display: flex;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .treasuryStats {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .statLabel {
          color: #9aa7bd;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .statValue {
          color: #e6edf5;
          font-weight: 600;
        }

        /* Enhanced Treasury AMM Styles */
        .poolInfo {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .poolInfo h3 {
          margin: 0 0 12px 0;
          color: #e6edf5;
          font-size: 16px;
        }

        .poolStatsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .poolStat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .swapInterface {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .swapDirection {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .directionBtn {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 12px 16px;
          color: #9aa7bd;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
        }

        .directionBtn.active {
          background: linear-gradient(180deg, #3b82f6, #2563eb);
          border-color: #3b82f6;
          color: white;
        }

        .directionBtn:hover:not(.active) {
          background: rgba(255,255,255,0.12);
          color: #e6edf5;
        }

        .inputLabel {
          display: block;
          color: #9aa7bd;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .swapPreview {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px;
          padding: 12px;
          margin: 12px 0;
        }

        .previewItem {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .previewItem:last-child {
          margin-bottom: 0;
        }

        .outputAmount {
          font-weight: 700;
          color: #10b981;
        }

        .priceImpact {
          font-weight: 600;
        }

        .priceImpact.low {
          color: #10b981;
        }

        .priceImpact.medium {
          color: #f59e0b;
        }

        .priceImpact.high {
          color: #ef4444;
        }

        .slippageSettings {
          margin: 16px 0;
        }

        .slippageSlider {
          width: 100%;
          margin: 8px 0;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }

        .slippageOptions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .slippageBtn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 4px;
          padding: 4px 8px;
          color: #9aa7bd;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 12px;
        }

        .slippageBtn.active {
          background: linear-gradient(180deg, #3b82f6, #2563eb);
          border-color: #3b82f6;
          color: white;
        }

        .slippageBtn:hover:not(.active) {
          background: rgba(255,255,255,0.12);
          color: #e6edf5;
        }



        .drawer {
          position: fixed; top: 0; right: 0; height: 100vh; width: 360px; background: rgba(255,255,255,0.06);
          border-left: 3px solid #ffd700; transform: translateX(100%); transition: transform 200ms ease;
          z-index: 20; box-shadow: -8px 0 24px rgba(255,215,0,0.3); padding: 16px; backdrop-filter: blur(8px);
        }
        .drawer.open { transform: translateX(0); }
        .drawerHead { display: flex; justify-content: space-between; align-items: center; }
        .drawerTitle { margin: 0; letter-spacing: 0.1em; text-transform: uppercase; }
        .x { border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 6px 10px; cursor: pointer; color: var(--text); }
        .profileRows { margin-top: 12px; display: grid; gap: 8px; }
        .pRow { display: flex; justify-content: space-between; }
        .pKey { color: #9aa7bd; }
        .pVal { font-weight: 700; color: #e6edf5; }
        .sep { height: 1px; background: var(--line); margin: 14px 0; }
        .nftTitle { margin: 0 0 8px 0; }
        .nftList { margin: 0; padding-left: 16px; color: #9aa7bd; }

        .navTabs { display: flex; gap: 8px; }
        .navBtn { flex: 1; padding: 10px; border: 2px solid #ffd700; background: rgba(255,255,255,0.06); color: #e6edf5; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(255,215,0,0.2); }
        .navBtn.active { background: linear-gradient(180deg, #1e2a4d, #172554); color: #fff; border-color: #ffd700; }

        .drawerWallet {
          position: absolute; right: 14px; bottom: 14px;
          display: flex; align-items: center; gap: 10px;
          background: var(--panel);
          padding: 8px 10px; border: 1px solid var(--line); border-radius: 12px;
          box-shadow: var(--shadow);
          backdrop-filter: blur(8px) saturate(1.2);
        }
        .airBtn {
          border: 1px solid var(--line); background: rgba(255,255,255,0.06); color: var(--text);
          padding: 8px 10px; border-radius: 8px; cursor: pointer;
          transition: all 0.2s;
        }
        .airBtn:hover { background: rgba(255,255,255,0.12); transform: translateY(-1px); }
        .airBtn.ghost { background: rgba(255,255,255,0.03); }

        @media (max-width: 768px) {
          .topBar {
            flex-direction: column;
            gap: 12px;
            padding: 12px 16px;
            position: static;
          }
          .playerSection {
            position: static;
            order: 1;
          }
          .profitSection {
            order: 2;
          }
          .menuSection {
            position: static;
            order: 3;
          }
          .businessList { padding: 12px; padding-bottom: 140px; }
        }

        @media (max-width: 480px) {
          .topBar { padding: 10px 12px; }
          .playerSection { left: 12px; }
          .menuSection { right: 12px; }
          .wealthValue { font-size: 20px; }
          .businessList { padding: 10px; padding-bottom: 140px; }
        }

        /* ====== AdCap-style layout polish (layout-only; no logic changes) ====== */

        /* Top bar: compact, sticky feel */
        .topBar {
          position: sticky;
          top: 0;
          backdrop-filter: saturate(1.2) blur(2px);
        }
        .profitSection .wealthValue {
          font-size: clamp(22px, 3.6vw, 32px);
          line-height: 1.08;
        }
        .profitSection .rateValue {
          font-weight: 800;
        }

        /* Banner: slimmer and unobtrusive */
        .banner {
          margin-top: 8px;
          border-width: 1px;
          box-shadow: none;
        }

        /* Business List: vertical stack, denser rhythm, centered column */
        .businessList {
          max-width: 860px;
          gap: 12px;
        }

        /* Bottom bulk bar: already sticky; just spacing/stack on mobile */
        .bulkBar {
          gap: 12px;
        }

        /* Subtle scrollbars for long lists (desktop) */
        .businessList::-webkit-scrollbar { width: 10px; }
        .businessList::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 999px;
        }

        /* ====== DARK THEME: Premium Space Aesthetic ====== */

        :root {
          --bg: #0b1020;
          --bg-2: #0e1426;
          --panel: rgba(255,255,255,0.06);
          --line: rgba(255,255,255,0.12);
          --text: #e6edf5;
          --muted: #9aa7bd;
          --accent: #22c55e;       /* emerald */
          --accent-2: #16a34a;
          --gold-1: #fde68a;
          --gold-2: #fbbf24;
          --gold-3: #9b6a1a;
          --shadow: 0 10px 30px rgba(0,0,0,0.45);
        }

        /* Premium starfield + radial glow + noise */
        body {
          background: radial-gradient(1200px 800px at 20% -10%, #1b2550 0%, transparent 60%),
                      radial-gradient(900px 700px at 85% 10%, #083b2c 0%, transparent 60%),
                      linear-gradient(180deg, var(--bg), var(--bg-2));
          color: var(--text);
        }
        body::before {
          content: "";
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.12) 30%, transparent 31%),
            radial-gradient(2px 2px at 80% 20%, rgba(255,255,255,0.12) 30%, transparent 31%),
            radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.10) 30%, transparent 31%);
          opacity: .6;
        }
        body::after {
          /* subtle film grain */
          content: "";
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' opacity='0.06' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          mix-blend-mode: soft-light;
        }

        /* Panels + cards go glassy */
        .topBar,
        .banner,
        .bulkBar,
        .drawer {
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
          border: 1px solid var(--line);
          box-shadow: var(--shadow);
          backdrop-filter: blur(8px) saturate(1.2);
          color: var(--text);
        }

        .banner .msg { color: var(--text); }
        .dot { box-shadow: 0 0 0 3px rgba(0,0,0,0.25) inset; }

        .page .wealthValue {
          color: #e6edf5;
          font-weight: 800;
        }

        .rateValue { color: #6bdcff; text-shadow: 0 0 14px rgba(107,220,255,0.35); }

        /* Progress bars: candy stripes + smooth fill */
        .cycleBar { background: rgba(255,255,255,0.12); }
        .cycleFill {
          background:
            repeating-linear-gradient(135deg, rgba(255,255,255,0.25) 0 8px, rgba(255,255,255,0.05) 8px 16px),
            linear-gradient(90deg, var(--accent), var(--accent-2));
          box-shadow: 0 0 12px rgba(34,197,94,0.35);
        }
        .conditionBar { background: rgba(255,255,255,0.08); }
        .conditionFill { box-shadow: inset 0 0 8px rgba(0,0,0,0.2); }

        /* Buttons: premium neon-ish glow */
        .btn.primary,
        .collectBtn {
          background: linear-gradient(180deg, var(--accent), var(--accent-2));
          border: 1px solid rgba(0,0,0,0.28);
          color: white;
          box-shadow:
            0 10px 22px rgba(34,197,94,0.22),
            inset 0 0 0 1px rgba(255,255,255,0.08);
        }
        .btn.primary:hover,
        .collectBtn:hover:not(:disabled) { filter: brightness(1.06) saturate(1.1); transform: translateY(-1px); }

        .btn.dark,
        .upgradeBtn {
          background: linear-gradient(180deg, #101628, #0a0f1f);
          color: #f8fafc;
          border: 1px solid rgba(255,255,255,0.12);
        }
        .btn.dark:hover,
        .upgradeBtn:hover { filter: brightness(1.08); transform: translateY(-1px); }

        .btn.ghost,
        .defendBtn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.16);
          color: var(--text);
        }
        .btn.ghost:hover,
        .defendBtn:hover { background: rgba(255,255,255,0.12); }

        /* Milestone chips pop */
        .milestone {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: var(--muted);
        }
        .milestone.achieved {
          background: rgba(190,242,100,0.18);
          border-color: rgba(163,230,53,0.6);
          color: #d9f99d;
        }

        /* Drawer: glass sheet */
        .drawer {
          background: linear-gradient(180deg, rgba(16,22,40,0.86), rgba(10,15,31,0.86));
          border-left: 1px solid rgba(255,255,255,0.12);
          color: var(--text);
        }
        .drawerTitle { color: var(--gold-1); text-shadow: 0 0 12px rgba(251,191,36,0.24); }
        .navBtn.active { background: linear-gradient(180deg, #1e2a4d, #172554); border-color: rgba(255,255,255,0.16); }

        /* Bottom bar polish */
        .bulkBar {
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
          border-top: 1px solid var(--line);
        }
        .bulkBtn.active {
          background: linear-gradient(180deg, #1d2a50, #172554);
          border-color: rgba(255,255,255,0.16);
          color: #e6edf5;
          box-shadow: 0 6px 18px rgba(23,37,84,0.35);
        }

        /* Avatar button polish */
        .avatarBtn { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.16); color: var(--text); }
        .avatar { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18); }

        /* Responsive bumps */
        @media (max-width: 860px) {
          .actions .btn.large { padding: 12px 8px; font-size: 13px; }
        }
      `}</style>
    </div>
  );
}
