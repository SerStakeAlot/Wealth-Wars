const { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Program, AnchorProvider, Wallet } = require('@coral-xyz/anchor');
const fs = require('fs');

// Test configuration
const PROGRAM_ID = new PublicKey('9A2bft4ehF3zGTid1o6TC828Ww2mmNhmqGC3PzHd4EXw');
const CONNECTION = new Connection('https://api.devnet.solana.com', 'confirmed');

// Load IDL
const idlPath = './src/idl/wwars.json';
const rawIdl = fs.readFileSync(idlPath, 'utf8');
const IDL = JSON.parse(rawIdl);

// Mock wallet for testing
const mockWallet = { payer: Keypair.generate() };

async function testWealthWars() {
  console.log('🚀 Starting Wealth Wars Program Tests...\n');

  try {
    // Setup provider
    const provider = new AnchorProvider(CONNECTION, mockWallet, {
      commitment: 'confirmed',
    });

    // Create program instance
    const program = new Program(IDL, PROGRAM_ID, provider);

    // Create test accounts
    const admin = Keypair.generate();
    const player1 = Keypair.generate();

    console.log('📝 Test Accounts:');
    console.log(`Admin: ${admin.publicKey.toString()}`);
    console.log(`Player1: ${player1.publicKey.toString()}\n`);

    // Airdrop SOL to test accounts
    console.log('💰 Requesting SOL airdrops...');
    await CONNECTION.confirmTransaction(
      await CONNECTION.requestAirdrop(admin.publicKey, 2 * LAMPORTS_PER_SOL)
    );
    await CONNECTION.confirmTransaction(
      await CONNECTION.requestAirdrop(player1.publicKey, 2 * LAMPORTS_PER_SOL)
    );
    console.log('✅ SOL airdrops completed\n');

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
          wealthMint: new PublicKey('11111111111111111111111111111112'), // Mock mint
          treasuryVault: new PublicKey('11111111111111111111111111111112'), // Mock vault
          systemProgram: PublicKey.default,
        })
        .signers([admin])
        .rpc();

      console.log('✅ Game initialized successfully');
    } catch (error) {
      console.log('❌ Game initialization failed:', error.message);
    }

    console.log('\n🎉 Basic test completed!');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run tests
testWealthWars();
