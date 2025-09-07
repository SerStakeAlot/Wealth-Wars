use anchor_lang::prelude::*;

#[account]
pub struct GameConfig {
    pub admin: Pubkey,
    pub wealth_mint: Pubkey,
    pub treasury_vault: Pubkey,
    pub fee_bps: u16,
    pub paused: bool,
    pub bump_config: u8,
    pub bump_vault: u8,
    pub default_upgrade_cd: i64,
    pub default_defend_cd: i64,
    pub risk_threshold: u32,
    pub risk_growth_per_sec: u32,
    pub defend_risk_reduction_per_token: u32,
}

impl GameConfig {
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 2 + 1 + 1 + 1 + 8 + 8 + 4 + 4 + 4;
}

#[account]
pub struct Player {
    pub authority: Pubkey,
    pub last_defend_ts: i64,
    pub bump: u8,
}

impl Player {
    pub const SPACE: usize = 8 + 32 + 8 + 1;
}

#[account]
pub struct PlayerState {
    pub owner: Pubkey,                    // Player's wallet
    pub last_work_timestamp: i64,         // Unix timestamp from Solana Clock
    pub streak_count: u32,                // Consecutive work days
    pub work_frequency_level: u8,         // 0=novice, 4=master (24h→12h→6h)
    pub total_work_actions: u64,          // Lifetime work count
    pub credits: u64,                     // On-chain credit balance
    pub wealth_tokens: u64,               // $WEALTH token balance
    pub businesses_owned: Vec<u8>,        // Business IDs owned
    pub active_business_slots: Vec<u8>,   // Currently active businesses
    pub last_streak_check: i64,           // For streak validation window
    pub cooldown_hours: u8,               // Current cooldown (24→12→6)
    pub bump: u8,                         // PDA bump seed
}

impl PlayerState {
    pub const MAX_SIZE: usize = 8 + 32 + 8 + 4 + 1 + 8 + 8 + 8 + (4 + 20) + (4 + 5) + 8 + 1 + 1;
}

#[account]
pub struct AssetClass {
    pub class_id: u64,
    pub base_price: u64,
    pub price_scale_num: u64,
    pub price_scale_den: u64,
    pub base_yield: u64,
    pub upgrade_cd: i64,
    pub defend_cd: i64,
    pub base_risk_growth_per_sec: u32,
    pub bump: u8,
}

impl AssetClass {
    pub const SPACE: usize = 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 4 + 1;
}

#[account]
pub struct Holding {
    pub player: Pubkey,
    pub class: Pubkey,
    pub level: u16,
    pub shield: u32,
    pub last_claim_ts: i64,
    pub upgrade_end_ts: i64,
    pub last_defend_ts: i64,
    pub last_risk_ts: i64,
    pub risk_score: u32,
    pub bump: u8,
}

impl Holding {
    pub const SPACE: usize = 8 + 32 + 32 + 2 + 4 + 8 + 8 + 8 + 8 + 4 + 1;
}

#[account]
pub struct Treasury {
    pub bump: u8,
    pub base_mint: Pubkey,        // WEALTH token mint
    pub quote_mint: Pubkey,       // Credits/USDC mint
    pub base_vault: Pubkey,       // WEALTH token vault
    pub quote_vault: Pubkey,      // Credits/USDC vault
    pub fee_bps: u16,            // 0-1000 (0-10%)
    pub max_trade_units: u64,     // Anti-whale cap
    pub paused: bool,
    pub min_base_liquidity: u64,  // Minimum WEALTH in pool
    pub min_quote_liquidity: u64, // Minimum Credits in pool
    pub last_params_slot: u64,    // Governance hygiene
    pub params_authority: Pubkey, // Who can change params
}

impl Treasury {
    pub const SPACE: usize = 8 + 1 + 32 + 32 + 32 + 32 + 2 + 8 + 1 + 8 + 8 + 8 + 32;
}
