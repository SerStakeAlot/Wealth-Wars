use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::math::*;
use crate::events::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(class_id: u64)]
pub struct QueueUpgrade<'info> {
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
        constraint = holding.upgrade_end_ts == 0 @ ErrorCode::UpgradeInProgress
    )]
    pub holding: Account<'info, Holding>,

    #[account(
        mut,
        token::mint = game_config.wealth_mint,
        token::authority = owner
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = game_config.wealth_mint,
        token::authority = game_config,
        seeds = [b"vault", game_config.key().as_ref()],
        bump = game_config.bump_vault
    )]
    pub treasury_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn queue_upgrade(ctx: Context<QueueUpgrade>, _class_id: u64) -> Result<()> {
    let holding = &mut ctx.accounts.holding;
    let asset_class = &ctx.accounts.asset_class;
    let game_config = &ctx.accounts.game_config;
    let clock = Clock::get()?;

    // Calculate price for next level
    let next_level = holding.level.checked_add(1).ok_or(ErrorCode::MathOverflow)?;
    let price = price_for_level(
        asset_class.base_price,
        asset_class.price_scale_num,
        asset_class.price_scale_den,
        next_level,
    )?;

    // Apply fee
    let fee = (price as u128)
        .checked_mul(game_config.fee_bps as u128)
        .and_then(|x| x.checked_div(10000))
        .ok_or(ErrorCode::MathOverflow)?;
    let total_cost = price.checked_add(fee as u64).ok_or(ErrorCode::MathOverflow)?;

    // Transfer tokens
    let cpi_accounts = Transfer {
        from: ctx.accounts.owner_token_account.to_account_info(),
        to: ctx.accounts.treasury_vault.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, total_cost)?;

    // Set upgrade timer
    let upgrade_cd = upgrade_cd(asset_class, game_config);
    holding.upgrade_end_ts = clock.unix_timestamp.checked_add(upgrade_cd).ok_or(ErrorCode::MathOverflow)?;

    emit!(UpgradeQueued {
        player: holding.player,
        class: holding.class,
        end_ts: holding.upgrade_end_ts,
    });

    Ok(())
}
