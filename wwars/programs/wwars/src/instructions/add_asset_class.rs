use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(class_id: u64)]
pub struct AddAssetClass<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        has_one = admin @ ErrorCode::Unauthorized,
        constraint = !game_config.paused @ ErrorCode::GamePaused
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        init,
        payer = admin,
        space = AssetClass::SPACE,
        seeds = [b"class", class_id.to_le_bytes().as_ref()],
        bump
    )]
    pub asset_class: Account<'info, AssetClass>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AddAssetClassParams {
    pub class_id: u64,
    pub base_price: u64,
    pub price_scale_num: u64,
    pub price_scale_den: u64,
    pub base_yield: u64,
    pub upgrade_cd: i64,
    pub defend_cd: i64,
    pub base_risk_growth_per_sec: u32,
}

pub fn add_asset_class(
    ctx: Context<AddAssetClass>,
    params: AddAssetClassParams,
) -> Result<()> {
    let asset_class = &mut ctx.accounts.asset_class;

    asset_class.class_id = params.class_id;
    asset_class.base_price = params.base_price;
    asset_class.price_scale_num = params.price_scale_num;
    asset_class.price_scale_den = params.price_scale_den;
    asset_class.base_yield = params.base_yield;
    asset_class.upgrade_cd = params.upgrade_cd;
    asset_class.defend_cd = params.defend_cd;
    asset_class.base_risk_growth_per_sec = params.base_risk_growth_per_sec;
    asset_class.bump = ctx.bumps.asset_class;

    Ok(())
}
