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
    #[msg("Work cooldown still active")]
    CooldownActive,
    #[msg("Insufficient credits")]
    InsufficientCredits,
    #[msg("Business already owned")]
    AlreadyOwned,
    #[msg("Business not owned")]
    NotOwned,
    #[msg("Invalid business ID")]
    InvalidBusinessId,
    #[msg("Maximum slots reached")]
    MaxSlotsReached,
    #[msg("Treasury is paused")]
    TreasuryPaused,
    #[msg("Fee too high (max 10%)")]
    FeeTooHigh,
    #[msg("Zero amount not allowed")]
    ZeroAmount,
    #[msg("Math overflow/underflow")]
    MathError,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
    #[msg("Trade too large")]
    TradeTooLarge,
    #[msg("Slippage exceeded")]
    SlippageExceeded,
    #[msg("Pool not ready")]
    PoolNotReady,
    #[msg("Insufficient seed liquidity")]
    InsufficientSeed,
}
