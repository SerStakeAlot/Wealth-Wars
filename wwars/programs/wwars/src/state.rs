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
