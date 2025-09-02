use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    pub wealth_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = admin,
        space = GameConfig::SPACE,
        seeds = [b"config"],
        bump
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        init,
        payer = admin,
        token::mint = wealth_mint,
        token::authority = game_config,
        seeds = [b"vault", game_config.key().as_ref()],
        bump
    )]
    pub treasury_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeGameParams {
    pub fee_bps: u16,
    pub default_upgrade_cd: i64,
    pub default_defend_cd: i64,
    pub risk_threshold: u32,
    pub risk_growth_per_sec: u32,
    pub defend_risk_reduction_per_token: u32,
}

pub fn initialize_game(
    ctx: Context<InitializeGame>,
    params: InitializeGameParams,
) -> Result<()> {
    let config = &mut ctx.accounts.game_config;
    let treasury_vault = &ctx.accounts.treasury_vault;

    config.admin = ctx.accounts.admin.key();
    config.wealth_mint = ctx.accounts.wealth_mint.key();
    config.treasury_vault = treasury_vault.key();
    config.fee_bps = params.fee_bps;
    config.paused = false;
    config.bump_config = ctx.bumps.game_config;
    config.bump_vault = ctx.bumps.treasury_vault;
    config.default_upgrade_cd = params.default_upgrade_cd;
    config.default_defend_cd = params.default_defend_cd;
    config.risk_threshold = params.risk_threshold;
    config.risk_growth_per_sec = params.risk_growth_per_sec;
    config.defend_risk_reduction_per_token = params.defend_risk_reduction_per_token;

    Ok(())
}
