use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::math::*;
use crate::events::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(class_id: u64)]
pub struct Defend<'info> {
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
        has_one = player @ ErrorCode::Unauthorized
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

pub fn defend(ctx: Context<Defend>, _class_id: u64, spend_amount: u64) -> Result<()> {
    let holding = &mut ctx.accounts.holding;
    let asset_class = &ctx.accounts.asset_class;
    let game_config = &ctx.accounts.game_config;
    let player = &mut ctx.accounts.player;
    let clock = Clock::get()?;

    // Check defend cooldown
    let defend_cd = defend_cd(asset_class, game_config);
    let time_since_last_defend = clock.unix_timestamp.saturating_sub(player.last_defend_ts);
    require!(time_since_last_defend >= defend_cd, ErrorCode::CooldownNotExpired);

    // Update risk first
    update_risk(holding, asset_class, game_config, clock.unix_timestamp);

    // Transfer tokens
    let cpi_accounts = Transfer {
        from: ctx.accounts.owner_token_account.to_account_info(),
        to: ctx.accounts.treasury_vault.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, spend_amount)?;

    // Reduce risk
    let risk_reduction = (spend_amount as u128)
        .checked_mul(game_config.defend_risk_reduction_per_token as u128)
        .unwrap_or(u128::MAX);
    holding.risk_score = holding.risk_score.saturating_sub(risk_reduction as u32);

    // Increase shield
    let shield_increase = spend_amount.checked_div(1000).unwrap_or(0);
    holding.shield = holding.shield.saturating_add(shield_increase as u32);

    // Update timestamps
    holding.last_defend_ts = clock.unix_timestamp;
    player.last_defend_ts = clock.unix_timestamp;

    emit!(Defended {
        player: holding.player,
        class: holding.class,
        spend: spend_amount,
        risk_after: holding.risk_score,
        shield_after: holding.shield,
    });

    Ok(())
}
