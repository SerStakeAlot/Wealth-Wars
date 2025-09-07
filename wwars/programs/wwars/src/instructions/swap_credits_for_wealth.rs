use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};
use crate::state::{Treasury, PlayerState};
use crate::events::SwapExecuted;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct SwapCreditsForWealth<'info> {
    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,
    
    #[account(
        mut,
        seeds = [b"player_state", user.key().as_ref()],
        bump = player_state.bump
    )]
    pub player_state: Account<'info, PlayerState>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        token::mint = treasury.base_mint,
        token::authority = treasury,
    )]
    pub base_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = treasury.quote_mint,
        token::authority = treasury,
    )]
    pub quote_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = treasury.base_mint,
        token::authority = user,
    )]
    pub user_base_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

pub fn swap_credits_for_wealth(
    ctx: Context<SwapCreditsForWealth>,
    credits_in: u64,
    min_wealth_out: u64,
) -> Result<()> {
    let treasury = &ctx.accounts.treasury;
    let player = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;
    
    // Validation checks
    require!(!treasury.paused, ErrorCode::TreasuryPaused);
    require!(credits_in > 0, ErrorCode::ZeroAmount);
    require!(player.credits >= credits_in, ErrorCode::InsufficientCredits);
    require!(credits_in <= treasury.max_trade_units, ErrorCode::TradeTooLarge);
    
    // Get current reserves
    let r_base = ctx.accounts.base_vault.amount as u128;
    let r_quote = ctx.accounts.quote_vault.amount as u128;
    
    // Check minimum liquidity
    require!(r_base >= treasury.min_base_liquidity as u128, ErrorCode::PoolNotReady);
    require!(r_quote >= treasury.min_quote_liquidity as u128, ErrorCode::PoolNotReady);
    
    // Constant product AMM math: x * y = k
    let k = r_base * r_quote;
    let r_quote_new = r_quote + (credits_in as u128);
    require!(r_quote_new > 0, ErrorCode::MathError);
    
    let r_base_new = k / r_quote_new;
    require!(r_base_new < r_base, ErrorCode::InsufficientLiquidity);
    
    let mut wealth_out = r_base - r_base_new;
    
    // Apply fee (fee is taken from output)
    let fee = wealth_out * (treasury.fee_bps as u128) / 10_000u128;
    wealth_out = wealth_out - fee;
    
    // Slippage check
    require!(wealth_out >= min_wealth_out as u128, ErrorCode::SlippageExceeded);
    
    // Calculate prices for event (scaled by 1M for precision)
    let price_before = if r_base > 0 { (r_quote * 1_000_000u128) / r_base } else { 0 };
    let price_after = if r_base_new > 0 { (r_quote_new * 1_000_000u128) / r_base_new } else { 0 };
    
    // Update player credits (deduct the credits used)
    player.credits -= credits_in;
    
    // Transfer WEALTH tokens from vault to user
    let treasury_seeds = &[
        b"treasury",
        &[treasury.bump],
    ];
    let signer_seeds = &[&treasury_seeds[..]];
    
    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        token::Transfer {
            from: ctx.accounts.base_vault.to_account_info(),
            to: ctx.accounts.user_base_account.to_account_info(),
            authority: ctx.accounts.treasury.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(transfer_ctx, wealth_out as u64)?;
    
    // Update virtual quote vault (credits are virtual, not real tokens)
    // Note: In a real implementation, you might want to track virtual reserves separately
    
    emit!(SwapExecuted {
        user: ctx.accounts.user.key(),
        base_in: 0,
        quote_out: wealth_out as u64,
        fee_paid: fee as u64,
        price_before: price_before as u64,
        price_after: price_after as u64,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
