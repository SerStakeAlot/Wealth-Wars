use anchor_lang::prelude::*;
use crate::state::*;
use crate::events::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(class_id: u64)]
pub struct FinishUpgrade<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"player", owner.key().as_ref()],
        bump = player.bump,
        constraint = player.authority == owner.key() @ ErrorCode::Unauthorized
    )]
    pub player: Account<'info, Player>,

    #[account(
        constraint = !game_config.paused @ ErrorCode::GamePaused
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        seeds = [b"class", &class_id.to_le_bytes()],
        bump = asset_class.bump
    )]
    pub asset_class: Account<'info, AssetClass>,

    #[account(
        mut,
        seeds = [b"holding", owner.key().as_ref(), asset_class.key().as_ref()],
        bump = holding.bump,
        has_one = player @ ErrorCode::Unauthorized,
        constraint = holding.upgrade_end_ts > 0 @ ErrorCode::InvalidParameters
    )]
    pub holding: Account<'info, Holding>,
}

pub fn finish_upgrade(ctx: Context<FinishUpgrade>, _class_id: u64) -> Result<()> {
    let holding = &mut ctx.accounts.holding;
    let clock = Clock::get()?;

    // Check if upgrade is ready
    require!(clock.unix_timestamp >= holding.upgrade_end_ts, ErrorCode::InvalidParameters);

    // Increment level and clear upgrade timer
    holding.level = holding.level.checked_add(1).ok_or(ErrorCode::MathOverflow)?;
    holding.upgrade_end_ts = 0;

    emit!(UpgradeFinished {
        player: holding.player,
        class: holding.class,
        new_level: holding.level,
    });

    Ok(())
}
