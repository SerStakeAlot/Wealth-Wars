use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Math operation overflow")]
    MathOverflow,
    #[msg("Game is paused")]
    GamePaused,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Cooldown not expired")]
    CooldownNotExpired,
    #[msg("Upgrade in progress")]
    UpgradeInProgress,
    #[msg("Asset not at risk")]
    AssetNotAtRisk,
    #[msg("Invalid parameters")]
    InvalidParameters,
}
