/**
 * Wealth Wars — Simple Devnet Bootstrap
 * - Initializes the game
 * - Creates a player
 * - Adds asset classes
 * - Demonstrates basic gameplay
 *
 * PREREQS:
 *  - Solana CLI configured for devnet
 *  - Your Anchor program deployed to devnet
 *  - A funded devnet keypair at ~/.config/solana/id.json
 */

import * as anchor from "@coral-xyz/anchor";
import {
  Keypair,
  Connection,
  clusterApiUrl,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

// -------------------------------
// 🔧 CONFIGURE THESE CONSTANTS
// -------------------------------

// Program ID from your deployment
const PROGRAM_ID = new PublicKey("BgiPAjcP224ppYDPYDponbWDFkBcHya8EPCbycJ9YYwL");

// Path to your IDL JSON
const IDL_PATH = path.resolve(
  process.cwd(),
  "../apps/web/src/idl/wwars.json"
);

// Game initialization parameters
const GAME_PARAMS = {
  fee_bps: 500, // 5% fee
  default_upgrade_cd: 3600, // 1 hour
  default_defend_cd: 1800, // 30 minutes
  risk_threshold: 1000,
  risk_growth_per_sec: 1,
  defend_risk_reduction_per_token: 10,
};

// Asset class parameters
const LEMONADE_STAND = {
  class_id: 0,
  base_price: 1000000, // 1.0 tokens (6 decimals)
  price_scale_num: 125,
  price_scale_den: 100,
  base_yield: 10000, // 0.01 tokens per second
  upgrade_cd: 3600,
  defend_cd: 1800,
  base_risk_growth_per_sec: 2,
};

const COFFEE_SHOP = {
  class_id: 1,
  base_price: 5000000, // 5.0 tokens
  price_scale_num: 130,
  price_scale_den: 100,
  base_yield: 50000, // 0.05 tokens per second
  upgrade_cd: 7200,
  defend_cd: 3600,
  base_risk_growth_per_sec: 3,
};

// -------------------------------

async function loadIdl(): Promise<anchor.Idl> {
  const raw = fs.readFileSync(IDL_PATH, "utf-8");
  return JSON.parse(raw);
}

async function airdropIfNeeded(conn: Connection, pubkey: PublicKey) {
  const bal = await conn.getBalance(pubkey);
  if (bal >= 1 * LAMPORTS_PER_SOL) return;
  console.log("⌛ Airdropping 2 SOL to admin on devnet…");
  const sig = await conn.requestAirdrop(pubkey, 2 * LAMPORTS_PER_SOL);
  await conn.confirmTransaction(sig, "confirmed");
}

async function main() {
  // ---------- Provider / Wallet ----------
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // For demo purposes, let's use a mock setup since we can't fund accounts
  console.log("🎭 Running in DEMO mode (no real transactions)");
  console.log("💡 To run with real transactions, install Solana CLI and fund your account");

  // Generate a new keypair for demo
  const admin = Keypair.generate();
  console.log("🔑 Generated demo keypair:", admin.publicKey.toBase58());

  const wallet = new anchor.Wallet(admin);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  anchor.setProvider(provider);

  // ---------- Program / IDL ----------
  const idl = await loadIdl();
  const program = new anchor.Program(idl, provider);

  console.log("Program ID:", program.programId.toBase58());
  console.log("Admin:", admin.publicKey.toBase58());

  // ---------- DEMO: Show what would happen ----------
  console.log("\n🪙 WOULD create WEALTH mint on devnet…");
  const wealthMint = Keypair.generate(); // Mock mint
  console.log("WEALTH mint:", wealthMint.publicKey.toBase58());

  // ---------- DEMO: Derive PDAs (must match your Anchor seeds) ----------
  const [gameConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );

  const [treasuryVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), gameConfig.toBuffer()],
    program.programId
  );

  console.log("⚙️ WOULD initialize game…");
  console.log("Game Config PDA:", gameConfig.toBase58());
  console.log("Treasury Vault PDA:", treasuryVault.toBase58());

  // ---------- DEMO: Create Player ----------
  const [player] = PublicKey.findProgramAddressSync(
    [Buffer.from("player"), admin.publicKey.toBuffer()],
    program.programId
  );

  console.log("👤 WOULD create player…");
  console.log("Player PDA:", player.toBase58());

  // ---------- DEMO: Add Asset Classes ----------
  console.log("🏭 WOULD add Lemonade Stand asset class…");
  const [lemonadeClass] = PublicKey.findProgramAddressSync(
    [Buffer.from("class"), new anchor.BN(0).toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  console.log("Lemonade Stand Class PDA:", lemonadeClass.toBase58());

  console.log("☕ WOULD add Coffee Shop asset class…");
  const [coffeeClass] = PublicKey.findProgramAddressSync(
    [Buffer.from("class"), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  console.log("Coffee Shop Class PDA:", coffeeClass.toBase58());

  // ---------- DEMO: Holding PDAs ----------
  const [lemonadeHolding] = PublicKey.findProgramAddressSync(
    [Buffer.from("holding"), admin.publicKey.toBuffer(), lemonadeClass.toBuffer()],
    program.programId
  );
  console.log("🏭 Lemonade Stand Holding PDA:", lemonadeHolding.toBase58());

  console.log("\n🎉 DEMO complete!");
  console.log("\n📋 To run with real transactions:");
  console.log("1. Install Solana CLI: curl -sSfL https://release.solana.com/v1.18.26/install | sh");
  console.log("2. Configure for devnet: solana config set --url https://api.devnet.solana.com");
  console.log("3. Create/fund keypair: solana-keygen new && solana airdrop 2");
  console.log("4. Update script to use real keypair instead of generated one");
  console.log("5. Run: npm run start");

  console.log("\n� Available game commands:");
  console.log("- buy_asset(class_id): Buy assets (0=Lemonade, 1=Coffee)");
  console.log("- queue_upgrade(class_id): Queue asset upgrades");
  console.log("- finish_upgrade(class_id): Complete upgrades");
  console.log("- defend(class_id, amount): Defend assets from takeover");
  console.log("- takeover(target_player, class_id): Attempt to steal assets");
}main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
