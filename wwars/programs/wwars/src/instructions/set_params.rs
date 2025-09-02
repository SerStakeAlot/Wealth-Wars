use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct SetParams<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub game_config: Account<'info, GameConfig>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct SetParamsArgs {
    pub fee_bps: Option<u16>,
    pub default_upgrade_cd: Option<i64>,
    pub default_defend_cd: Option<i64>,
    pub risk_threshold: Option<u32>,
    pub risk_growth_per_sec: Option<u32>,
    pub defend_risk_reduction_per_token: Option<u32>,
}

pub fn set_params(ctx: Context<SetParams>, args: SetParamsArgs) -> Result<()> {
    let config = &mut ctx.accounts.game_config;

    if let Some(fee_bps) = args.fee_bps {
        config.fee_bps = fee_bps;
    }
    if let Some(default_upgrade_cd) = args.default_upgrade_cd {
        config.default_upgrade_cd = default_upgrade_cd;
    }
    if let Some(default_defend_cd) = args.default_defend_cd {
        config.default_defend_cd = default_defend_cd;
    }
    if let Some(risk_threshold) = args.risk_threshold {
        config.risk_threshold = risk_threshold;
    }
    if let Some(risk_growth_per_sec) = args.risk_growth_per_sec {
        config.risk_growth_per_sec = risk_growth_per_sec;
    }
    if let Some(defend_risk_reduction_per_token) = args.defend_risk_reduction_per_token {
        config.defend_risk_reduction_per_token = defend_risk_reduction_per_token;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct Pause<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub game_config: Account<'info, GameConfig>,
}

pub fn pause(ctx: Context<Pause>, paused: bool) -> Result<()> {
    let config = &mut ctx.accounts.game_config;
    config.paused = paused;
    Ok(())
}
