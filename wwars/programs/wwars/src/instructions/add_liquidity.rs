use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, MintTo};
use crate::state::Treasury;
use crate::events::LiquidityAdded;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub base_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        token::mint = base_mint,
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
        token::mint = treasury.quote_mint,
        token::authority = admin,
    )]
    pub admin_quote_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

pub fn add_liquidity(
    ctx: Context<AddLiquidity>,
    base_amount: u64,  // WEALTH to mint
    quote_amount: u64, // Credits to transfer
) -> Result<()> {
    let treasury = &ctx.accounts.treasury;
    let clock = Clock::get()?;
    
    // Generate treasury PDA seeds for signing
    let treasury_seeds = &[
        b"treasury",
        &[treasury.bump],
    ];
    let signer_seeds = &[&treasury_seeds[..]];
    
    // 1. Mint WEALTH tokens to base vault
    let mint_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.base_mint.to_account_info(),
            to: ctx.accounts.base_vault.to_account_info(),
            authority: ctx.accounts.treasury.to_account_info(),
        },
        signer_seeds,
    );
    token::mint_to(mint_ctx, base_amount)?;
    
    // 2. Transfer quote tokens from admin to quote vault
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        token::Transfer {
            from: ctx.accounts.admin_quote_account.to_account_info(),
            to: ctx.accounts.quote_vault.to_account_info(),
            authority: ctx.accounts.admin.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, quote_amount)?;
    
    // Check current reserves
    let base_balance = ctx.accounts.base_vault.amount;
    let quote_balance = ctx.accounts.quote_vault.amount;
    
    emit!(LiquidityAdded {
        base_amount,
        quote_amount,
        total_base_reserve: base_balance,
        total_quote_reserve: quote_balance,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
