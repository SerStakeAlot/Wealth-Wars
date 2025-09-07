import { 
  PublicKey, 
  Connection, 
  Keypair, 
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY
} from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
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
  
  constructor(connection: Connection, wallet: AnchorWallet) {
    this.connection = connection;
    this.wallet = wallet;
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });
  }

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

      // Create initialize instruction
      const instruction = new TransactionInstruction({
        keys: [
          {
            pubkey: playerPDA,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: this.wallet.publicKey,
            isSigner: true,
            isWritable: true,
          },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        programId: WEALTH_WARS_PROGRAM_ID,
        data: Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]), // initialize_player discriminator
      });

      const transaction = new Transaction().add(instruction);
      const signature = await this.provider.sendAndConfirm(transaction);
      
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

      // Create work instruction
      const instruction = new TransactionInstruction({
        keys: [
          {
            pubkey: playerPDA,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: this.wallet.publicKey,
            isSigner: true,
            isWritable: true,
          },
        ],
        programId: WEALTH_WARS_PROGRAM_ID,
        data: Buffer.from([181, 175, 109, 31, 13, 152, 155, 237]), // do_work discriminator (placeholder)
      });

      const transaction = new Transaction().add(instruction);
      const signature = await this.provider.sendAndConfirm(transaction);
      
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
          const cooldownRemaining = await this.getCooldownRemaining();
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

      // Create purchase instruction
      const instruction = new TransactionInstruction({
        keys: [
          {
            pubkey: playerPDA,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: this.wallet.publicKey,
            isSigner: true,
            isWritable: true,
          },
        ],
        programId: WEALTH_WARS_PROGRAM_ID,
        data: Buffer.concat([
          Buffer.from([182, 175, 109, 31, 13, 152, 155, 237]), // purchase_business discriminator (placeholder)
          Buffer.from([businessId]) // business_id parameter
        ]),
      });

      const transaction = new Transaction().add(instruction);
      const signature = await this.provider.sendAndConfirm(transaction);
      
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

      // Parse account data (simplified - would use proper deserialization)
      // For now, return mock data structure
      return {
        owner: this.wallet.publicKey,
        lastWorkTimestamp: new BN(0),
        streakCount: 0,
        workFrequencyLevel: 0,
        totalWorkActions: new BN(0),
        credits: new BN(1000),
        wealthTokens: new BN(0),
        businessesOwned: [],
        activeBusinessSlots: [],
        lastStreakCheck: new BN(0),
        cooldownHours: 24,
        bump: 0,
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
