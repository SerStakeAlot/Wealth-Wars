use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::math::*;
use crate::events::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(target_player: Pubkey, class_id: u64)]
pub struct Takeover<'info> {
    #[account(mut)]
    pub attacker: Signer<'info>,

    #[account(
        mut,
        seeds = [b"player", attacker.key().as_ref()],
        bump = attacker_player.bump,
        constraint = attacker_player.authority == attacker.key() @ ErrorCode::Unauthorized
    )]
    pub attacker_player: Account<'info, Player>,

    /// CHECK: Target player account
    pub target_player: AccountInfo<'info>,

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
        seeds = [b"holding", target_player.key().as_ref(), asset_class.key().as_ref()],
        bump = target_holding.bump
    )]
    pub target_holding: Account<'info, Holding>,

    #[account(
        mut,
        token::mint = game_config.wealth_mint,
        token::authority = attacker
    )]
    pub attacker_token_account: Account<'info, TokenAccount>,

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

pub fn takeover(ctx: Context<Takeover>, _target_player: Pubkey, _class_id: u64) -> Result<()> {
    let target_holding = &mut ctx.accounts.target_holding;
    let asset_class = &ctx.accounts.asset_class;
    let game_config = &ctx.accounts.game_config;
    let clock = Clock::get()?;

    // Update risk for target holding
    update_risk(target_holding, asset_class, game_config, clock.unix_timestamp);

    // Check if target is at risk
    require!(target_holding.risk_score >= game_config.risk_threshold, ErrorCode::AssetNotAtRisk);

    // Calculate takeover cost
    let cost = takeover_cost(
        asset_class.base_price,
        asset_class.price_scale_num,
        asset_class.price_scale_den,
        target_holding.level,
    )?;

    // Apply fee
    let fee = (cost as u128)
        .checked_mul(game_config.fee_bps as u128)
        .and_then(|x| x.checked_div(10000))
        .ok_or(ErrorCode::MathOverflow)?;
    let total_cost = cost.checked_add(fee as u64).ok_or(ErrorCode::MathOverflow)?;

    // Transfer tokens
    let cpi_accounts = Transfer {
        from: ctx.accounts.attacker_token_account.to_account_info(),
        to: ctx.accounts.treasury_vault.to_account_info(),
        authority: ctx.accounts.attacker.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, total_cost)?;

    // Transfer ownership
    let from_player = target_holding.player;
    target_holding.player = ctx.accounts.attacker.key();
    target_holding.shield = 0;
    target_holding.upgrade_end_ts = 0;
    target_holding.last_defend_ts = clock.unix_timestamp;
    target_holding.last_risk_ts = clock.unix_timestamp;
    target_holding.risk_score = game_config.risk_threshold / 4; // Reset to low baseline

    emit!(TakenOver {
        from_player,
        to_player: target_holding.player,
        class: target_holding.class,
        level: target_holding.level,
        cost: total_cost,
    });

    Ok(())
}
