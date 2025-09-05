'use client';

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import toast from "react-hot-toast";
import { getProgramForWallet, PROGRAM_ID, WEALTH_MINT, TREASURY_VAULT, checkProgramDeployment } from "../../lib/anchorClient";
import { pdaConfig, pdaAmm, pdaPolicy, pdaTreasuryAuth, pdaPlayer, pdaEra, pdaPlayerEra } from "../../lib/pdas";

type Player = {
  owner: PublicKey;
  creditBalance: any; // BN
  streakDays: number;
  lastClickDay: number;
  xp: any; // BN
  business: { clickBonusPerDay: number; lemStand: number; cafe: number; factory: number; };
};

type EraAcc = {
  owner: PublicKey;
  season: PublicKey;
  xp: any; // BN
  claimedTierFree: number;
  claimedTierPremium: number;
  hasPremium: boolean;
};

export default function Demo() {
  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [playerPda, setPlayerPda] = useState<PublicKey | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isProgramDeployed, setIsProgramDeployed] = useState<boolean | null>(null);

  const [eraPda, setEraPda] = useState<PublicKey | null>(null);
  const [playerEraPda, setPlayerEraPda] = useState<PublicKey | null>(null);
  const [era, setEra] = useState<any>(null);
  const [playerEra, setPlayerEra] = useState<EraAcc | null>(null);

  // Check program deployment status
  useEffect(() => {
    async function checkDeployment() {
      if (connection) {
        const deployed = await checkProgramDeployment(connection);
        setIsProgramDeployed(deployed);
      }
    }
    checkDeployment();
  }, [connection]);

  const refresh = useCallback(async () => {
    if (!connection || !publicKey || !wallet) return;
    setLoading(true);
    try {
      const pPda = pdaPlayer(publicKey);
      setPlayerPda(pPda);

      // For demo purposes, we'll show the PDAs but note that
      // actual account fetching would require the correct account names from IDL
      console.log("Player PDA:", pPda.toBase58());

      // For demo, we'll skip Era functionality for now
      setEra(null);
      setPlayerEra(null);
    } finally { setLoading(false); }
  }, [connection, publicKey, wallet]);

  useEffect(() => { refresh(); }, [refresh]);

  const initPlayer = async () => {
    if (!publicKey || !connection || !wallet) {
      toast("Please connect your wallet first");
      return;
    }
    setLoading(true);
    try {
      console.log("initPlayer called with:", {
        hasPublicKey: !!publicKey,
        hasConnection: !!connection,
        hasWallet: !!wallet,
        walletType: typeof wallet,
        walletKeys: wallet ? Object.keys(wallet) : []
      });

      const p = getProgramForWallet(connection, wallet);
      if (!p) {
        toast("Failed to initialize program. Please check browser console for details.");
        console.error("Program creation failed. Check wallet connection and IDL.");
        return;
      }

      console.log("Program created, attempting initPlayer...");
      await p.methods.initPlayer().accounts({
        owner: publicKey,
        player: pdaPlayer(publicKey),
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();
      toast("Player initialized");
      await refresh();
    } catch (e:any) {
      console.error("initPlayer error:", e);
      toast(`Transaction failed: ${e.message}`);
    } finally { setLoading(false); }
  };

  const clickWork = async () => {
    if (!publicKey || !connection || !wallet) return;
    setLoading(true);
    try {
      const p = getProgramForWallet(connection, wallet);
      if (!p) {
        toast("Failed to initialize program. Please check wallet connection.");
        return;
      }
      await p.methods.clickWork().accounts({
        player: pdaPlayer(publicKey),
        owner: publicKey,
      }).rpc();
      toast("Worked! Credit + XP granted");
      await refresh();
    } catch (e:any) { toast(e.message);} finally { setLoading(false); }
  };

  const [bizKind, setBizKind] = useState(0);
  const buyBusiness = async () => {
    if (!publicKey || !connection || !wallet) return;
    setLoading(true);
    try {
      const p = getProgramForWallet(connection, wallet);
      if (!p) {
        toast("Failed to initialize program. Please check wallet connection.");
        return;
      }
      await p.methods.buyBusiness(bizKind).accounts({
        player: pdaPlayer(publicKey),
        owner: publicKey,
      }).rpc();
      toast("Business upgraded");
      await refresh();
    } catch (e:any) { toast(e.message);} finally { setLoading(false); }
  };

  const [amtCreditIn, setAmtCreditIn] = useState("0");
  const swapCreditForWealth = async () => {
    if (!publicKey || !connection || !wallet) return;
    setLoading(true);
    try {
      const p = getProgramForWallet(connection, wallet);
      if (!p) {
        toast("Failed to initialize program. Please check wallet connection.");
        return;
      }
      const cfg = pdaConfig();
      const amm = pdaAmm();
      const tAuth = pdaTreasuryAuth();
      const playerWealthAta = getAssociatedTokenAddressSync(WEALTH_MINT, publicKey);
      await p.methods.swapCreditForWealth(new anchor.BN(amtCreditIn)).accounts({
        config: cfg,
        amm,
        player: pdaPlayer(publicKey),
        owner: publicKey,
        treasuryAuth: tAuth,
        treasuryTokenAccount: TREASURY_VAULT,
        playerWealthTokenAccount: playerWealthAta,
        wealthMint: WEALTH_MINT,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      }).rpc();
      toast("Swapped Credit → $WEALTH");
      await refresh();
    } catch (e:any) { toast(e.message); } finally { setLoading(false); }
  };

  const [amtWealthIn, setAmtWealthIn] = useState("0");
  const swapWealthForCredit = async () => {
    if (!publicKey || !connection || !wallet) return;
    setLoading(true);
    try {
      const p = getProgramForWallet(connection, wallet);
      if (!p) {
        toast("Failed to initialize program. Please check wallet connection.");
        return;
      }
      const cfg = pdaConfig();
      const amm = pdaAmm();
      const playerWealthAta = getAssociatedTokenAddressSync(WEALTH_MINT, publicKey);
      await p.methods.swapWealthForCredit(new anchor.BN(amtWealthIn)).accounts({
        config: cfg,
        amm,
        player: pdaPlayer(publicKey),
        owner: publicKey,
        treasuryAuth: pdaTreasuryAuth(),
        treasuryTokenAccount: TREASURY_VAULT,
        playerWealthTokenAccount: playerWealthAta,
        wealthMint: WEALTH_MINT,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      }).rpc();
      toast("Swapped $WEALTH → Credit");
      await refresh();
    } catch (e:any) { toast(e.message); } finally { setLoading(false); }
  };

  const eraAttach = async () => {
    if (!connection || !publicKey || !eraPda) return;
    setLoading(true);
    try {
      // This would normally call the Anchor program method
      toast("Era attachment would happen here (requires Anchor program setup)");
      await refresh();
    } catch (e: any) { toast(e.message); } finally { setLoading(false); }
  };

  const eraGrantXp = async () => {
    if (!connection || !publicKey || !eraPda || !playerEraPda) return;
    setLoading(true);
    try {
      // This would normally call the Anchor program method
      toast("XP grant would happen here (requires Anchor program setup)");
      await refresh();
    } catch (e: any) { toast(e.message); } finally { setLoading(false); }
  };

  const eraClaim = async () => {
    if (!connection || !publicKey || !eraPda || !playerEraPda) return;
    setLoading(true);
    try {
      // This would normally call the Anchor program method
      toast("Era claim would happen here (requires Anchor program setup)");
      await refresh();
    } catch (e: any) { toast(e.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Wealth Wars — Demo</h1>
      <div style={{display:"flex", gap:12, alignItems:"center", margin:"12px 0"}}>
        <WalletMultiButton />
        {publicKey && <code>{publicKey.toBase58().slice(0,8)}…</code>}
      </div>

      {!publicKey && <p>Connect your wallet to begin.</p>}

      {publicKey && (
        <>
          {/* Status Indicator */}
          <div style={{
            padding: "16px",
            background: "#fef3c7",
            border: "2px solid #f59e0b",
            borderRadius: "12px",
            marginBottom: "16px"
          }}>
            <h3 style={{margin: "0 0 12px 0", color: "#92400e", fontSize: "18px"}}>⚠️ Demo Mode Active</h3>
            <div style={{marginBottom: "12px"}}>
              <div style={{display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "8px"}}>
                <span style={{color: connection ? "#22c55e" : "#ef4444", fontWeight: "600"}}>
                  🔗 Connection: {connection ? "✅ Connected" : "❌ Disconnected"}
                </span>
                <span style={{color: wallet ? "#22c55e" : "#ef4444", fontWeight: "600"}}>
                  👛 Wallet: {wallet ? "✅ Connected" : "❌ Disconnected"}
                </span>
              </div>
              <div style={{color: "#92400e", fontWeight: "600", fontSize: "14px"}}>
                📋 Anchor Program: {isProgramDeployed === null ? "⏳ Checking..." : isProgramDeployed ? "✅ Deployed" : "❌ Not deployed (functions will show error messages)"}
              </div>
            </div>
            <div style={{
              background: "#fed7aa", 
              padding: "12px", 
              borderRadius: "8px", 
              border: "1px solid #fb923c"
            }}>
              <p style={{margin: "0 0 8px 0", fontWeight: "600", color: "#ea580c"}}>
                🚀 To Enable Real Transactions:
              </p>
              <div style={{fontSize: "14px", color: "#9a3412"}}>
                <strong>Quick Setup:</strong> Run <code style={{background: "#ffffff", padding: "2px 6px", borderRadius: "4px"}}>./deploy.sh</code> in the project root, then refresh this page.
              </div>
            </div>
          </div>
          <section style={{border:"2px solid #3b82f6", padding:20, borderRadius:12, marginTop:16, backgroundColor: "#eff6ff"}}>
            <h3 style={{color: "#1e40af", margin: "0 0 12px 0"}}>🚀 Enable Real Transactions</h3>
            <p style={{margin: "8px 0", color: "#1e3a8a"}}>Currently running in demo mode. To enable real Solana transactions:</p>
            
            <div style={{
              background: "#dbeafe", 
              padding: "16px", 
              borderRadius: "8px", 
              margin: "12px 0",
              border: "1px solid #93c5fd"
            }}>
              <div style={{margin: "8px 0", fontSize: "16px", fontWeight: "600", color: "#1e40af"}}>
                🎯 Quick Setup (Recommended):
              </div>
              <div style={{margin: "8px 0", fontSize: "14px", fontFamily: "monospace", background: "#1e40af", color: "white", padding: "8px", borderRadius: "4px"}}>
                ./deploy.sh
              </div>
              <div style={{margin: "8px 0", fontSize: "14px", color: "#1e3a8a"}}>
                Run this command in the project root, then refresh this page.
              </div>
            </div>

            <details style={{margin: "12px 0"}}>
              <summary style={{cursor: "pointer", color: "#1e40af", fontWeight: "600"}}>
                📋 Manual Setup Steps (Advanced)
              </summary>
              <div style={{margin: "8px 0", paddingLeft: "16px"}}>
                <ol style={{margin: "8px 0", paddingLeft: "20px", fontSize: "14px", color: "#1e3a8a"}}>
                  <li>Install Solana CLI: <code style={{background: "#f1f5f9", padding: "2px 4px"}}>curl -sSfL https://release.solana.com/v1.18.26/install | sh</code></li>
                  <li>Configure for devnet: <code style={{background: "#f1f5f9", padding: "2px 4px"}}>solana config set --url https://api.devnet.solana.com</code></li>
                  <li>Create/fund account: <code style={{background: "#f1f5f9", padding: "2px 4px"}}>solana-keygen new && solana airdrop 2</code></li>
                  <li>Deploy program: <code style={{background: "#f1f5f9", padding: "2px 4px"}}>cd wwars && anchor build && anchor deploy</code></li>
                  <li>Run bootstrap: <code style={{background: "#f1f5f9", padding: "2px 4px"}}>cd bootstrap && npm run start</code></li>
                </ol>
              </div>
            </details>
            
            <p style={{margin: "8px 0", fontSize: "14px", color: "#64748b"}}>
              💡 Check browser console for detailed error logs and setup progress.
            </p>
          </section>

          <section style={{border:"1px solid #ddd", padding:16, borderRadius:8, marginTop:16}}>
            <h3>Player</h3>
            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              <button onClick={initPlayer} disabled={loading}>Init Player</button>
              <button onClick={clickWork} disabled={loading}>Click Work (1/day)</button>
            </div>
            <div style={{marginTop:12}}>
              {player ? (
                <table>
                  <tbody>
                    <tr><td><b>Credit</b></td><td>{player.creditBalance?.toString()}</td></tr>
                    <tr><td><b>Streak</b></td><td>{player.streakDays}</td></tr>
                    <tr><td><b>XP</b></td><td>{player.xp?.toString()}</td></tr>
                    <tr><td><b>Click Bonus/day</b></td><td>{player.business?.clickBonusPerDay}</td></tr>
                  </tbody>
                </table>
              ) : <p>No player yet.</p>}
            </div>
          </section>

          <section style={{border:"1px solid #ddd", padding:16, borderRadius:8, marginTop:16}}>
            <h3>Businesses</h3>
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              <select value={bizKind} onChange={e=>setBizKind(Number(e.target.value))}>
                <option value={0}>Lemonade Stand</option>
                <option value={1}>Café</option>
                <option value={2}>Factory</option>
              </select>
              <button onClick={buyBusiness} disabled={loading}>Buy/Upgrade</button>
            </div>
          </section>

          <section style={{border:"1px solid #ddd", padding:16, borderRadius:8, marginTop:16}}>
            <h3>Swap (AMM)</h3>
            <p style={{marginTop:0}}>Treasury Vault: <code>{TREASURY_VAULT.toBase58().slice(0,8)}…</code></p>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
              <div>
                <b>Credit → $WEALTH</b>
                <div style={{display:"flex", gap:8}}>
                  <input type="number" min="0" value={amtCreditIn} onChange={e=>setAmtCreditIn(e.target.value)} />
                  <button onClick={swapCreditForWealth} disabled={loading}>Swap</button>
                </div>
              </div>
              <div>
                <b>$WEALTH → Credit</b>
                <div style={{display:"flex", gap:8}}>
                  <input type="number" min="0" value={amtWealthIn} onChange={e=>setAmtWealthIn(e.target.value)} />
                  <button onClick={swapWealthForCredit} disabled={loading}>Swap</button>
                </div>
              </div>
            </div>
            <p style={{fontSize:12, marginTop:8, color:"#666"}}>
              Note: swaps require AMM reserves seeded by admin (see bootstrap or add policy OMO).
            </p>
          </section>

          <section style={{border:"1px solid #ddd", padding:16, borderRadius:8, marginTop:16}}>
            <h3>Eras (Season Pass)</h3>
            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              <button onClick={eraAttach} disabled={loading || !eraPda}>Attach to Era</button>
              <button onClick={eraGrantXp} disabled={loading || !playerEraPda}>Grant +50 XP</button>
              <button onClick={eraClaim} disabled={loading || !playerEraPda}>Claim Rewards</button>
            </div>
            <div style={{marginTop:12}}>
              {playerEra ? (
                <table>
                  <tbody>
                    <tr><td><b>XP</b></td><td>{playerEra.xp?.toString()}</td></tr>
                    <tr><td><b>Free tier</b></td><td>{playerEra.claimedTierFree}</td></tr>
                    <tr><td><b>Premium tier</b></td><td>{playerEra.claimedTierPremium}</td></tr>
                    <tr><td><b>Has Premium</b></td><td>{playerEra.hasPremium ? "Yes" : "No"}</td></tr>
                  </tbody>
                </table>
              ) : <p>Not attached to current Era.</p>}
            </div>
          </section>

          <section style={{border:"1px solid #ddd", padding:16, borderRadius:8, marginTop:16}}>
            <h3>Debug Info</h3>
            <div style={{fontSize:12, fontFamily:"monospace"}}>
              <p><b>Program ID:</b> {PROGRAM_ID.toBase58()}</p>
              <p><b>WEALTH Mint:</b> {WEALTH_MINT.toBase58()}</p>
              <p><b>Treasury Vault:</b> {TREASURY_VAULT.toBase58()}</p>
              {playerPda && <p><b>Player PDA:</b> {playerPda.toBase58()}</p>}
              {eraPda && <p><b>Era PDA:</b> {eraPda.toBase58()}</p>}
              {playerEraPda && <p><b>Player Era PDA:</b> {playerEraPda.toBase58()}</p>}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
