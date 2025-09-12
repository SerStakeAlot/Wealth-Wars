import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { IDL } from '../idl/wwars';
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from '@solana/spl-token';

// Test configuration
const PROGRAM_ID = new PublicKey('9A2bft4ehF3zGTid1o6TC828Ww2mmNhmqGC3PzHd4EXw');
const CONNECTION = new Connection('https://api.devnet.solana.com', 'confirmed');

// Mock wallet for testing
const mockWallet = new Wallet(Keypair.generate());

async function testWealthWars() {
  console.log('🚀 Starting Wealth Wars Program Tests...\n');

  try {
    // Setup provider
    const provider = new AnchorProvider(CONNECTION, mockWallet, {
      commitment: 'confirmed',
    });

  // Create program instance (cast to any to avoid strict type mismatches in tests)
  // The test runs in JS runtime; for type-checking we loosen types here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const program = new (Program as any)(IDL as any, PROGRAM_ID as any, provider as any) as any;

    // Create test accounts
    const admin = Keypair.generate();
    const player1 = Keypair.generate();
    const player2 = Keypair.generate();

    console.log('📝 Test Accounts:');
    console.log(`Admin: ${admin.publicKey.toString()}`);
    console.log(`Player1: ${player1.publicKey.toString()}`);
    console.log(`Player2: ${player2.publicKey.toString()}\n`);

    // Airdrop SOL to test accounts
    console.log('💰 Requesting SOL airdrops...');
    await CONNECTION.confirmTransaction(
      await CONNECTION.requestAirdrop(admin.publicKey, 2 * LAMPORTS_PER_SOL)
    );
    await CONNECTION.confirmTransaction(
      await CONNECTION.requestAirdrop(player1.publicKey, 2 * LAMPORTS_PER_SOL)
    );
    await CONNECTION.confirmTransaction(
      await CONNECTION.requestAirdrop(player2.publicKey, 2 * LAMPORTS_PER_SOL)
    );
    console.log('✅ SOL airdrops completed\n');

    // Create WEALTH token mint
    console.log('🪙 Creating WEALTH token mint...');
    const wealthMint = await createMint(
      CONNECTION,
      admin,
      admin.publicKey,
      null,
      9
    );
    console.log(`WEALTH Mint: ${wealthMint.toString()}\n`);

    // Create treasury vault
    console.log('🏦 Creating treasury vault...');
    const treasuryVault = await createAccount(
      CONNECTION,
      admin,
      wealthMint,
      admin.publicKey
    );
    console.log(`Treasury Vault: ${treasuryVault.toString()}\n`);

    // Mint initial WEALTH tokens to treasury
    console.log('💰 Minting initial WEALTH tokens...');
    await mintTo(
      CONNECTION,
      admin,
      wealthMint,
      treasuryVault,
      admin,
      1000000 * 10 ** 9 // 1M WEALTH tokens
    );
    console.log('✅ Initial WEALTH tokens minted\n');

    // Test 1: Initialize Game
    console.log('🎮 Test 1: Initialize Game');
    const [gameConfigPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('game_config')],
      PROGRAM_ID
    );

    try {
      await program.methods
        .initializeGame()
        .accounts({
          admin: admin.publicKey,
          gameConfig: gameConfigPDA,
          wealthMint: wealthMint,
          treasuryVault: treasuryVault,
          systemProgram: PublicKey.default,
        })
        .signers([admin])
        .rpc();

      console.log('✅ Game initialized successfully');
    } catch (error) {
      console.log('❌ Game initialization failed:', (error as any).message);
    }

    // Test 2: Join Game
    console.log('\n👤 Test 2: Player1 joins game');
    const [player1PDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('player'), player1.publicKey.toBytes()],
      PROGRAM_ID
    );

    try {
      await program.methods
        .joinGame()
        .accounts({
          player: player1.publicKey,
          playerAccount: player1PDA,
          gameConfig: gameConfigPDA,
          systemProgram: PublicKey.default,
        })
        .signers([player1])
        .rpc();

      console.log('✅ Player1 joined successfully');
    } catch (error) {
      console.log('❌ Player1 join failed:', (error as any).message);
    }

    // Test 3: Add Asset Class
    console.log('\n🏗️ Test 3: Add Asset Class');
    const assetClassId = 1;
    const [assetClassPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('asset_class'), new Uint8Array([assetClassId])],
      PROGRAM_ID
    );

    try {
      await program.methods
        .addAssetClass(
          assetClassId,
          'Test Asset',
          new PublicKey('11111111111111111111111111111112'), // Mock token mint
          1000, // basePrice
          10, // baseYield
          5 // riskFactor
        )
        .accounts({
          admin: admin.publicKey,
          gameConfig: gameConfigPDA,
          assetClass: assetClassPDA,
          systemProgram: PublicKey.default,
        })
        .signers([admin])
        .rpc();

      console.log('✅ Asset class added successfully');
    } catch (error) {
      console.log('❌ Asset class addition failed:', (error as any).message);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run tests
testWealthWars();
