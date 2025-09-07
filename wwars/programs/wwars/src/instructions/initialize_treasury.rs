use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};
use crate::state::Treasury;
use crate::events::TreasuryInitialized;

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(
        init,
        payer = admin,
        space = Treasury::SPACE,
        seeds = [b"treasury"],
        bump
    )]
    pub treasury: Account<'info, Treasury>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub base_mint: Account<'info, Mint>,      // WEALTH token
    pub quote_mint: Account<'info, Mint>,     // Credits/USDC
    
    #[account(
        init,
        payer = admin,
        token::mint = base_mint,
        token::authority = treasury,
        seeds = [b"treasury", b"base_vault"],
        bump
    )]
    pub base_vault: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = admin,
        token::mint = quote_mint,
        token::authority = treasury,
        seeds = [b"treasury", b"quote_vault"],
        bump
    )]
    pub quote_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize_treasury(
    ctx: Context<InitializeTreasury>,
    fee_bps: u16,
    max_trade_units: u64,
) -> Result<()> {
    require!(fee_bps <= 1000, crate::errors::ErrorCode::FeeTooHigh);
    
    let treasury = &mut ctx.accounts.treasury;
    let clock = Clock::get()?;
    
    treasury.bump = ctx.bumps.treasury;
    treasury.base_mint = ctx.accounts.base_mint.key();
    treasury.quote_mint = ctx.accounts.quote_mint.key();
    treasury.base_vault = ctx.accounts.base_vault.key();
    treasury.quote_vault = ctx.accounts.quote_vault.key();
    treasury.fee_bps = fee_bps;
    treasury.max_trade_units = max_trade_units;
    treasury.paused = true; // Start paused
    treasury.min_base_liquidity = 1_000_000; // 1M WEALTH minimum
    treasury.min_quote_liquidity = 100_000;  // 100K credits minimum
    treasury.last_params_slot = clock.slot;
    treasury.params_authority = ctx.accounts.admin.key();
    
    emit!(TreasuryInitialized {
        base_mint: treasury.base_mint,
        quote_mint: treasury.quote_mint,
        fee_bps,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
