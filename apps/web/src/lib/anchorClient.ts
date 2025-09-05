import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
import idl from "../idl/wwars.json";

// Fallback program IDs for demo mode
const FALLBACK_PROGRAM_ID = "GCg5RAMT4pk74ybPTq2E9vo1o8SK2r5bJaJeYj45eCvH";
const FALLBACK_WEALTH_MINT = "9ELH8MpSRswva8iW3TMVC4b3MCi3PRW3Zkb22TxCT232";
const FALLBACK_TREASURY_VAULT = "J8RbqYYhB6PXr8wrpxiVbVxmbRsxB93923TsJJuQza2H";

export const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || FALLBACK_PROGRAM_ID);
export const WEALTH_MINT = new PublicKey(process.env.NEXT_PUBLIC_WEALTH_MINT || FALLBACK_WEALTH_MINT);
export const TREASURY_VAULT = new PublicKey(process.env.NEXT_PUBLIC_TREASURY_VAULT || FALLBACK_TREASURY_VAULT);

/**
 * NOTE:
 * - Prefer using getProgramForWallet from React components where you have connection + wallet from
 *   @solana/wallet-adapter-react (useConnection + useWallet).
 * - getProvider() remains as a convenience fallback for non-wallet contexts.
 */

export function getProvider(): anchor.AnchorProvider {
  // fallback provider (no wallet)
  const connection = new anchor.web3.Connection(process.env.NEXT_PUBLIC_CLUSTER!, "confirmed");
  return new anchor.AnchorProvider(connection, anchor.AnchorProvider.env().wallet as any, { commitment: "confirmed" });
}

/**
 * Create an AnchorProvider from a WalletAdapter wallet + Connection.
 * wallet: the object from useWallet()
 * connection: the Connection from useConnection()
 */
export function getProviderForWallet(connection: Connection, wallet: any): anchor.AnchorProvider {
  // Check if wallet has an adapter property (common in wallet adapters)
  const walletToUse = wallet?.adapter || wallet;

  // wrap wallet-adapter into anchor Wallet interface
  const anchorWallet: anchor.Wallet = {
    publicKey: walletToUse?.publicKey || wallet?.publicKey || null,
    signTransaction: walletToUse?.signTransaction?.bind(walletToUse) || wallet?.signTransaction?.bind(wallet),
    signAllTransactions: walletToUse?.signAllTransactions?.bind(walletToUse) || wallet?.signAllTransactions?.bind(wallet),
  } as unknown as anchor.Wallet;

  return new anchor.AnchorProvider(connection, anchorWallet, { commitment: "confirmed" });
}

export function getProgram(provider?: anchor.AnchorProvider) {
  const p = provider || getProvider();
  return new anchor.Program(idl as any, p);
}

export function getProgramForWallet(connection: Connection, wallet: any) {
  try {
    console.log("Creating program for wallet:", {
      hasWallet: !!wallet,
      walletKeys: wallet ? Object.keys(wallet) : [],
      hasPublicKey: !!(wallet?.publicKey || wallet?.adapter?.publicKey),
      hasSignTransaction: !!(wallet?.signTransaction || wallet?.adapter?.signTransaction),
      connection: !!connection,
      programId: PROGRAM_ID?.toString(),
      cluster: process.env.NEXT_PUBLIC_CLUSTER
    });

    if (!wallet) {
      console.error("No wallet provided");
      return null;
    }

    const walletToUse = wallet?.adapter || wallet;
    if (!walletToUse.publicKey) {
      console.error("Wallet has no publicKey");
      return null;
    }

    if (!walletToUse.signTransaction) {
      console.error("Wallet has no signTransaction method");
      return null;
    }

    const provider = getProviderForWallet(connection, wallet);
    console.log("Provider created successfully");

    // Try to create program with error handling
    try {
      const program = getProgram(provider);
      console.log("Program created successfully:", program?.programId?.toString());
      return program;
    } catch (programError) {
      console.error("Failed to create Anchor program:", programError);
      console.log("🔧 To enable real transactions:");
      console.log("Quick setup: Run './deploy.sh' in the project root");
      console.log("Or manually:");
      console.log("1. Install Solana CLI: curl -sSfL https://release.solana.com/v1.18.26/install | sh");
      console.log("2. Configure for devnet: solana config set --url https://api.devnet.solana.com");
      console.log("3. Create/fund account: solana-keygen new && solana airdrop 2");
      console.log("4. Deploy program: cd wwars && anchor build && anchor deploy");
      console.log("5. Run bootstrap: cd bootstrap && npm run start");
      console.log("Then refresh the demo page!");
      console.log("Program ID:", PROGRAM_ID?.toString());
      console.log("Cluster:", process.env.NEXT_PUBLIC_CLUSTER);
      // Return a mock program object for now to prevent crashes
      return {
        programId: PROGRAM_ID,
        methods: {
          initPlayer: () => ({
            accounts: () => ({
              rpc: async () => {
                console.log("Mock initPlayer called");
                throw new Error("Demo mode: Anchor program not deployed. Run './deploy.sh' in project root, then refresh the page.");
              }
            })
          }),
          clickWork: () => ({
            accounts: () => ({
              rpc: async () => {
                console.log("Mock clickWork called");
                throw new Error("Demo mode: Anchor program not deployed. Run './deploy.sh' in project root, then refresh the page.");
              }
            })
          }),
          buyBusiness: () => ({
            accounts: () => ({
              rpc: async () => {
                console.log("Mock buyBusiness called");
                throw new Error("Demo mode: Anchor program not deployed. Run './deploy.sh' in project root, then refresh the page.");
              }
            })
          }),
          swapCreditForWealth: () => ({
            accounts: () => ({
              rpc: async () => {
                console.log("Mock swapCreditForWealth called");
                throw new Error("Demo mode: Anchor program not deployed. Run './deploy.sh' in project root, then refresh the page.");
              }
            })
          }),
          swapWealthForCredit: () => ({
            accounts: () => ({
              rpc: async () => {
                console.log("Mock swapWealthForCredit called");
                throw new Error("Demo mode: Anchor program not deployed. Run './deploy.sh' in project root, then refresh the page.");
              }
            })
          })
        }
      };
    }
  } catch (error) {
    console.error("Failed to create program for wallet:", error);
    return null;
  }
}
