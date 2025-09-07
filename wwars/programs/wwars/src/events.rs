use anchor_lang::prelude::*;

#[event]
pub struct PlayerJoined {
    pub player: Pubkey,
}

#[event]
pub struct AssetBought {
    pub player: Pubkey,
    pub class: Pubkey,
    pub price: u64,
    pub level: u16,
}

#[event]
pub struct UpgradeQueued {
    pub player: Pubkey,
    pub class: Pubkey,
    pub end_ts: i64,
}

#[event]
pub struct UpgradeFinished {
    pub player: Pubkey,
    pub class: Pubkey,
    pub new_level: u16,
}

#[event]
pub struct Defended {
    pub player: Pubkey,
    pub class: Pubkey,
    pub spend: u64,
    pub risk_after: u32,
    pub shield_after: u32,
}

#[event]
pub struct TakenOver {
    pub from_player: Pubkey,
    pub to_player: Pubkey,
    pub class: Pubkey,
    pub level: u16,
    pub cost: u64,
}

#[event]
pub struct WorkCompleted {
    pub player: Pubkey,
    pub reward: u64,
    pub new_streak: u32,
    pub new_level: u8,
    pub timestamp: i64,
}

#[event]
pub struct BusinessPurchased {
    pub player: Pubkey,
    pub business_id: u8,
    pub cost: u64,
    pub timestamp: i64,
}

#[event]
pub struct StreakBroken {
    pub player: Pubkey,
    pub old_streak: u32,
    pub timestamp: i64,
}

#[event]
pub struct LevelUp {
    pub player: Pubkey,
    pub new_level: u8,
    pub new_cooldown_hours: u8,
    pub timestamp: i64,
}

#[event]
pub struct SwapExecuted {
    pub user: Pubkey,
    pub base_in: u64,
    pub quote_out: u64,
    pub fee_paid: u64,
    pub price_before: u64,  // scaled by 1_000_000
    pub price_after: u64,   // scaled by 1_000_000
    pub timestamp: i64,
}

#[event]
pub struct TreasuryInitialized {
    pub base_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub fee_bps: u16,
    pub timestamp: i64,
}

#[event]
pub struct LiquidityAdded {
    pub base_amount: u64,
    pub quote_amount: u64,
    pub total_base_reserve: u64,
    pub total_quote_reserve: u64,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryParamsUpdated {
    pub old_fee_bps: u16,
    pub new_fee_bps: u16,
    pub old_max_trade: u64,
    pub new_max_trade: u64,
    pub timestamp: i64,
}
