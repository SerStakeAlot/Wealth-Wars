"use client";

import { 
  PublicKey, 
  Connection, 
  Keypair, 
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY
} from '@solana/web3.js';
import { AnchorProvider, BN } from '@coral-xyz/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';

// Program ID for Wealth Wars
export const WEALTH_WARS_PROGRAM_ID = new PublicKey('GCg5RAMT4pk74ybPTq2E9vo1o8SK2r5bJaJeYj45eCvH');

// Basic interfaces for the new program functions
export interface PlayerState {
  owner: PublicKey;
  lastWorkTimestamp: BN;
  streakCount: number;
  workFrequencyLevel: number;
  totalWorkActions: BN;
  credits: BN;
  wealthTokens: BN;
  businessesOwned: number[];
  activeBusinessSlots: number[];
  lastStreakCheck: BN;
  cooldownHours: number;
  bump: number;
}

export interface WorkResult {
  success: boolean;
  reward?: number;
  newStreak?: number;
  newLevel?: number;
  cooldownRemaining?: number;
  error?: string;
}

export interface BusinessPurchaseResult {
  success: boolean;
  businessId?: number;
  cost?: number;
  error?: string;
}

export interface TreasuryState {
  baseReserve: number;   // WEALTH tokens in pool
  quoteReserve: number;  // Credits in pool  
  exchangeRate: number;  // Current rate
  fee: number;           // Fee in basis points
  paused: boolean;
  maxTradeSize: number;
}

export interface SwapResult {
  success: boolean;
  amountIn?: number;
  amountOut?: number;
  fee?: number;
  priceImpact?: number;
  error?: string;
}

export class WealthWarsProgram {
  private connection: Connection;
  private wallet: AnchorWallet;
  private provider: AnchorProvider;
  private sendAdapter: { sendTransaction: Function } | null = null;
  
  private async confirmSig(signature: string, latest: { blockhash: string; lastValidBlockHeight: number }) {
    const maxRetries = 5;
    let attempt = 0;
    let delay = 1000; // Start with 1 second

    while (attempt < maxRetries) {
      try {
        // Modern strategy
        await (this.connection as any).confirmTransaction(
          {
            signature,
            blockhash: latest.blockhash,
            lastValidBlockHeight: latest.lastValidBlockHeight,
          },
          'confirmed'
        );
        return; // Success
      } catch (e) {
        console.warn(`Attempt ${attempt + 1} failed:`, e);
        if (attempt === maxRetries - 1) {
          throw new Error(
            `Transaction confirmation failed after ${maxRetries} attempts. Check signature ${signature} on Solana Explorer.`
          );
        }
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        attempt++;
      }
    }

    // Fallback to legacy overload for environments/types pinned to older web3.js
    try {
      await (this.connection as any).confirmTransaction(signature, 'confirmed');
    } catch (legacyError) {
      console.error('Legacy confirmation strategy also failed:', legacyError);
      throw new Error(
        `Transaction confirmation failed using both modern and legacy strategies. Check signature ${signature} on Solana Explorer.`
      );
    }
  }
  
  constructor(connection: Connection, wallet: AnchorWallet, adapter?: { sendTransaction?: Function } | null) {
    this.connection = connection;
    this.wallet = wallet;
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });
    if (adapter && typeof adapter.sendTransaction === 'function') {
      // Bind to the adapter object itself (the wallet), not a wrapper, to preserve internal context
      this.sendAdapter = { sendTransaction: adapter.sendTransaction.bind(adapter) } as any;
    }
  }

  private async sendAndConfirmTx(transaction: Transaction): Promise<string> {
    // Always ensure fee payer and recent blockhash are set for wallet signing
    transaction.feePayer = this.wallet.publicKey;
    const latestBlockhash = await this.connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = latestBlockhash.blockhash;

    // Prefer the wallet adapter's sendTransaction in browser contexts
    if (this.sendAdapter && typeof (this.sendAdapter as any).sendTransaction === 'function') {
      const signature = await (this.sendAdapter as any).sendTransaction(transaction, this.connection, {
        preflightCommitment: 'confirmed'
      });
      await this.confirmSig(signature as string, latestBlockhash);
      return signature as string;
    }

    // Fallback: attempt manual sign + send via wallet if available
    if (typeof (this.wallet as any).signTransaction === 'function') {
      const signed = await (this.wallet as any).signTransaction(transaction);
      const sig = await this.connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });
      await this.confirmSig(sig as string, latestBlockhash);
      return sig as string;
    }

    throw new Error('No wallet adapter available to send transaction');
  }

  // -----------------------------------------
  // PDA helpers (mirror on-chain seeds)
  // -----------------------------------------
  /**
   * Get the PDA for a player's state account
   */
  getPlayerPDA(wallet: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('player_state'), wallet.toBuffer()],
      WEALTH_WARS_PROGRAM_ID
    );
    return pda;
  }

  // -----------------------------------------
  // Instruction builders (Anchor discriminators)
  // -----------------------------------------
  private buildInitializePlayerIx(owner: PublicKey, playerPda: PublicKey): TransactionInstruction {
    // Discriminator: sha256('global:initialize_player').slice(0,8)
    const disc = Buffer.from([79, 249, 88, 177, 220, 62, 56, 128]);
    return new TransactionInstruction({
      keys: [
        { pubkey: playerPda, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: WEALTH_WARS_PROGRAM_ID,
      data: disc,
    });
  }

  private buildDoWorkIx(owner: PublicKey, playerPda: PublicKey): TransactionInstruction {
    // Discriminator: sha256('global:do_work').slice(0,8)
    const disc = Buffer.from([144, 196, 1, 15, 48, 134, 42, 39]);
    return new TransactionInstruction({
      keys: [
        { pubkey: playerPda, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: true },
      ],
      programId: WEALTH_WARS_PROGRAM_ID,
      data: disc,
    });
  }

  private buildPurchaseBusinessIx(owner: PublicKey, playerPda: PublicKey, businessId: number): TransactionInstruction {
    // Discriminator: sha256('global:purchase_business').slice(0,8)
    const disc = Buffer.from([6, 207, 40, 18, 41, 94, 66, 137]);
    const arg = Buffer.from(Uint8Array.of(businessId & 0xff)); // u8
    return new TransactionInstruction({
      keys: [
        { pubkey: playerPda, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: true },
      ],
      programId: WEALTH_WARS_PROGRAM_ID,
      data: Buffer.concat([disc, arg]),
    });
  }

  /**
   * Initialize a new player (call once per wallet)
   */
  async initializePlayer(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const playerPDA = this.getPlayerPDA(this.wallet.publicKey);
      // Check if player already exists
      const accountInfo = await this.connection.getAccountInfo(playerPDA);
      if (accountInfo) {
        return { success: true }; // Already initialized
      }

      // Build and send initialize_player instruction
      const ix = this.buildInitializePlayerIx(this.wallet.publicKey, playerPDA);
      const transaction = new Transaction().add(ix);
      await this.sendAndConfirmTx(transaction);
      
      toast.success('Player account initialized!');
      return { success: true };
      
    } catch (error) {
      console.error('Failed to initialize player:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Perform work action (on-chain timing validation)
   */
  async doWork(): Promise<WorkResult> {
    try {
      if (!this.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const playerPDA = this.getPlayerPDA(this.wallet.publicKey);

      // Check if player is initialized
      const playerState = await this.getPlayerState();
      if (!playerState) {
        // Initialize player first
        const initResult = await this.initializePlayer();
        if (!initResult.success) {
          return { success: false, error: 'Failed to initialize player' };
        }
      }

      // Build and send do_work instruction
      const ix = this.buildDoWorkIx(this.wallet.publicKey, playerPDA);
      const transaction = new Transaction().add(ix);
      await this.sendAndConfirmTx(transaction);
      
      // Fetch updated state
      const updatedState = await this.getPlayerState();
      if (updatedState) {
        return {
          success: true,
          reward: 100, // Will be calculated on-chain
          newStreak: updatedState.streakCount,
          newLevel: updatedState.workFrequencyLevel,
        };
      }

      return { success: true };
      
    } catch (error) {
      console.error('Work failed:', error);
      
      // Parse specific errors
      if (error instanceof Error) {
        if (error.message.includes('CooldownActive')) {
          let cooldownRemaining = await this.getCooldownRemaining();
          // If we can't read state yet (e.g., mock/empty), provide a reasonable fallback (2h)
          if (!cooldownRemaining || cooldownRemaining <= 0) {
            cooldownRemaining = 2 * 60 * 60; // seconds
          }
          return { 
            success: false, 
            cooldownRemaining,
            error: 'Work cooldown still active' 
          };
        }
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Purchase a business (on-chain validation)
   */
  async purchaseBusiness(businessId: number): Promise<BusinessPurchaseResult> {
    try {
      if (!this.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const playerPDA = this.getPlayerPDA(this.wallet.publicKey);

      // Build and send purchase_business instruction
      const ix = this.buildPurchaseBusinessIx(this.wallet.publicKey, playerPDA, businessId);
      const transaction = new Transaction().add(ix);
      await this.sendAndConfirmTx(transaction);
      
      return {
        success: true,
        businessId,
        cost: this.getBusinessCost(businessId),
      };
      
    } catch (error) {
      console.error('Business purchase failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get current player state from on-chain account
   */
  async getPlayerState(): Promise<PlayerState | null> {
    try {
      if (!this.wallet.publicKey) return null;

      const playerPDA = this.getPlayerPDA(this.wallet.publicKey);
      const accountInfo = await this.connection.getAccountInfo(playerPDA);
      
      if (!accountInfo) return null;
      // Anchor account layout decode for PlayerState
      const data = accountInfo.data;
      // Offsets
      let o = 0;
      o += 8; // skip 8-byte account discriminator
      const owner = new PublicKey(data.subarray(o, o + 32)); o += 32;
      const lastWorkTimestamp = new BN(data.subarray(o, o + 8), 10, 'le'); o += 8;
      const streakCount = data[o] | (data[o + 1] << 8) | (data[o + 2] << 16) | (data[o + 3] << 24); o += 4;
      const workFrequencyLevel = data[o]; o += 1;
      const totalWorkActions = new BN(data.subarray(o, o + 8), 10, 'le'); o += 8;
      const credits = new BN(data.subarray(o, o + 8), 10, 'le'); o += 8;
      const wealthTokens = new BN(data.subarray(o, o + 8), 10, 'le'); o += 8;
      // businesses_owned: Vec<u8>
      const boLen = data[o] | (data[o + 1] << 8) | (data[o + 2] << 16) | (data[o + 3] << 24); o += 4;
      const businessesOwned: number[] = Array.from(data.subarray(o, o + boLen)); o += boLen;
      // active_business_slots: Vec<u8>
      const absLen = data[o] | (data[o + 1] << 8) | (data[o + 2] << 16) | (data[o + 3] << 24); o += 4;
      const activeBusinessSlots: number[] = Array.from(data.subarray(o, o + absLen)); o += absLen;
      const lastStreakCheck = new BN(data.subarray(o, o + 8), 10, 'le'); o += 8;
      const cooldownHours = data[o]; o += 1;
      const bump = data[o]; o += 1;

      return {
        owner,
        lastWorkTimestamp,
        streakCount,
        workFrequencyLevel,
        totalWorkActions,
        credits,
        wealthTokens,
        businessesOwned,
        activeBusinessSlots,
        lastStreakCheck,
        cooldownHours,
        bump,
      };
      
    } catch (error) {
      console.error('Failed to get player state:', error);
      return null;
    }
  }

  /**
   * Calculate remaining cooldown time in seconds
   */
  async getCooldownRemaining(): Promise<number> {
    const playerState = await this.getPlayerState();
    if (!playerState) return 0;

    const now = Math.floor(Date.now() / 1000);
    const cooldownSeconds = playerState.cooldownHours * 3600;
    const lastWork = playerState.lastWorkTimestamp.toNumber();
    const elapsed = now - lastWork;
    
    return Math.max(0, cooldownSeconds - elapsed);
  }

  /**
   * Get business cost (matches on-chain logic)
   */
  getBusinessCost(businessId: number): number {
    const costs = [
      // Basic businesses (0-9)
      500, 1000, 2500, 5000, 10000, 20000, 50000, 100000, 250000, 500000,
      // Enhanced businesses (10-19)
      1000000, 2000000, 3000000, 5000000, 7500000, 10000000, 15000000, 20000000, 30000000, 50000000
    ];
    
    return costs[businessId] || 0;
  }

  /**
   * Get maximum slots based on work frequency level
   */
  getMaxSlots(level: number): number {
    return Math.min(level + 1, 5); // 1-5 slots based on level
  }

  /**
   * Get Treasury PDA
   */
  getTreasuryPDA(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('treasury')],
      WEALTH_WARS_PROGRAM_ID
    );
    return pda;
  }

  /**
   * Get current treasury state and reserves
   */
  async getTreasuryState(): Promise<TreasuryState | null> {
    try {
      const treasuryPDA = this.getTreasuryPDA();
      const accountInfo = await this.connection.getAccountInfo(treasuryPDA);
      
      if (!accountInfo) return null;

      // For now, return mock data - in real implementation would deserialize account data
      return {
        baseReserve: 450000,      // 450K WEALTH tokens
        quoteReserve: 12000000,   // 12M credits
        exchangeRate: 26.67,      // 1 WEALTH = 26.67 credits
        fee: 300,                 // 3% fee
        paused: false,
        maxTradeSize: 100000,
      };
      
    } catch (error) {
      console.error('Failed to get treasury state:', error);
      return null;
    }
  }

  /**
   * Simulate swap to calculate output and price impact
   */
  simulateSwap(
    amountIn: number, 
    direction: 'credits-to-wealth' | 'wealth-to-credits',
    reserves: { base: number; quote: number },
    feeBps: number = 300
  ): { amountOut: number; priceImpact: number; fee: number } {
    const { base: rBase, quote: rQuote } = reserves;
    
    if (direction === 'credits-to-wealth') {
      // Adding credits, getting WEALTH
      const k = rBase * rQuote;
      const newQuoteReserve = rQuote + amountIn;
      const newBaseReserve = k / newQuoteReserve;
      let wealthOut = rBase - newBaseReserve;
      
      // Apply fee
      const fee = wealthOut * (feeBps / 10000);
      wealthOut = wealthOut - fee;
      
      // Calculate price impact
      const oldPrice = rQuote / rBase;
      const newPrice = newQuoteReserve / newBaseReserve;
      const priceImpact = Math.abs(newPrice - oldPrice) / oldPrice * 100;
      
      return { amountOut: wealthOut, priceImpact, fee };
    } else {
      // Adding WEALTH, getting credits
      const k = rBase * rQuote;
      const newBaseReserve = rBase + amountIn;
      const newQuoteReserve = k / newBaseReserve;
      let creditsOut = rQuote - newQuoteReserve;
      
      // Apply fee
      const fee = creditsOut * (feeBps / 10000);
      creditsOut = creditsOut - fee;
      
      // Calculate price impact
      const oldPrice = rQuote / rBase;
      const newPrice = newQuoteReserve / newBaseReserve;
      const priceImpact = Math.abs(newPrice - oldPrice) / oldPrice * 100;
      
      return { amountOut: creditsOut, priceImpact, fee };
    }
  }

  /**
   * Swap credits for WEALTH tokens
   */
  async swapCreditsForWealth(creditsIn: number, minWealthOut: number): Promise<SwapResult> {
    try {
      if (!this.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      // For now, return mock success - real implementation would create transaction
      return {
        success: true,
        amountIn: creditsIn,
        amountOut: minWealthOut,
        fee: creditsIn * 0.03, // 3% fee
        priceImpact: 2.5,
      };
      
    } catch (error) {
      console.error('Swap failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Swap WEALTH tokens for credits
   */
  async swapWealthForCredits(wealthIn: number, minCreditsOut: number): Promise<SwapResult> {
    try {
      if (!this.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      // For now, return mock success - real implementation would create transaction
      return {
        success: true,
        amountIn: wealthIn,
        amountOut: minCreditsOut,
        fee: wealthIn * 0.03, // 3% fee
        priceImpact: 2.1,
      };
      
    } catch (error) {
      console.error('Swap failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// import { Connection, PublicKey } from '@solana/web3.js';
// import { Program, Provider, web3 } from '@project-serum/anchor';
// import idl from './wealthWars.json';
//
// const programID = new PublicKey(idl.metadata.address);
//
// export const initializeWealthWarsProgram = (connection: Connection, wallet: any) => {
//   const provider = new Provider(connection, wallet, Provider.defaultOptions());
//   return new Program(idl, programID, provider);
// };
//
// export const fetchPlayerState = async (program: Program, playerPublicKey: PublicKey) => {
//   return await program.account.playerState.fetch(playerPublicKey);
// };
//
// export const fetchTreasuryState = async (program: Program) => {
//   return await program.account.treasuryState.fetch(programID);
// };
