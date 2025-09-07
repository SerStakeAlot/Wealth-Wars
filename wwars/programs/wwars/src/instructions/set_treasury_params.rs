use anchor_lang::prelude::*;
use crate::state::Treasury;
use crate::events::TreasuryParamsUpdated;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct SetTreasuryParams<'info> {
    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn set_treasury_params(
    ctx: Context<SetTreasuryParams>,
    fee_bps: Option<u16>,
    max_trade_units: Option<u64>,
    paused: Option<bool>,
) -> Result<()> {
    let treasury = &mut ctx.accounts.treasury;
    let clock = Clock::get()?;
    
    // Verify authority
    require!(
        ctx.accounts.authority.key() == treasury.params_authority,
        ErrorCode::Unauthorized
    );
    
    let old_fee = treasury.fee_bps;
    let old_max_trade = treasury.max_trade_units;
    
    // Update parameters if provided
    if let Some(new_fee) = fee_bps {
        require!(new_fee <= 1000, ErrorCode::FeeTooHigh);
        treasury.fee_bps = new_fee;
    }
    
    if let Some(new_max) = max_trade_units {
        treasury.max_trade_units = new_max;
    }
    
    if let Some(new_paused) = paused {
        treasury.paused = new_paused;
    }
    
    treasury.last_params_slot = clock.slot;
    
    emit!(TreasuryParamsUpdated {
        old_fee_bps: old_fee,
        new_fee_bps: treasury.fee_bps,
        old_max_trade: old_max_trade,
        new_max_trade: treasury.max_trade_units,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
