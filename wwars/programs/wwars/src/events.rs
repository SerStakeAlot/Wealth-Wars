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
