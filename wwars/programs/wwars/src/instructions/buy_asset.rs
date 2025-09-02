use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::math::*;
use crate::events::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(class_id: u64)]
pub struct BuyAsset<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"player", buyer.key().as_ref()],
        bump = player.bump,
        constraint = player.authority == buyer.key() @ ErrorCode::Unauthorized
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
        init,
        payer = buyer,
        space = Holding::SPACE,
        seeds = [b"holding", buyer.key().as_ref(), asset_class.key().as_ref()],
        bump
    )]
    pub holding: Account<'info, Holding>,

    #[account(
        mut,
        token::mint = game_config.wealth_mint,
        token::authority = buyer
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = game_config.wealth_mint,
        token::authority = game_config,
        seeds = [b"vault", game_config.key().as_ref()],
        bump = game_config.bump_vault
    )]
    pub treasury_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn buy_asset(ctx: Context<BuyAsset>, _class_id: u64) -> Result<()> {
    let holding = &mut ctx.accounts.holding;
    let asset_class = &ctx.accounts.asset_class;
    let game_config = &ctx.accounts.game_config;
    let clock = Clock::get()?;

    // Calculate price for level 1
    let price = price_for_level(
        asset_class.base_price,
        asset_class.price_scale_num,
        asset_class.price_scale_den,
        1,
    )?;

    // Apply fee
    let fee = (price as u128)
        .checked_mul(game_config.fee_bps as u128)
        .and_then(|x| x.checked_div(10000))
        .ok_or(ErrorCode::MathOverflow)?;
    let total_cost = price.checked_add(fee as u64).ok_or(ErrorCode::MathOverflow)?;

    // Transfer tokens
    let cpi_accounts = Transfer {
        from: ctx.accounts.buyer_token_account.to_account_info(),
        to: ctx.accounts.treasury_vault.to_account_info(),
        authority: ctx.accounts.buyer.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, total_cost)?;

    // Initialize holding
    holding.player = ctx.accounts.buyer.key();
    holding.class = asset_class.key();
    holding.level = 1;
    holding.shield = 0;
    holding.last_claim_ts = clock.unix_timestamp;
    holding.upgrade_end_ts = 0;
    holding.last_defend_ts = clock.unix_timestamp;
    holding.last_risk_ts = clock.unix_timestamp;
    holding.risk_score = 0;
    holding.bump = ctx.bumps.holding;

    emit!(AssetBought {
        player: holding.player,
        class: holding.class,
        price: total_cost,
        level: holding.level,
    });

    Ok(())
}
