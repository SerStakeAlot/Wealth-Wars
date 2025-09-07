use anchor_lang::prelude::*;
use instructions::*;

mod state;
mod math;
mod errors;
mod events;
mod instructions;

declare_id!("GCg5RAMT4pk74ybPTq2E9vo1o8SK2r5bJaJeYj45eCvH");

#[program]
pub mod wwars {
    use super::*;

    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        params: InitializeGameParams,
    ) -> Result<()> {
        instructions::initialize_game::initialize_game(ctx, params)
    }

    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        instructions::join_game::join_game(ctx)
    }

    pub fn add_asset_class(
        ctx: Context<AddAssetClass>,
        params: AddAssetClassParams,
    ) -> Result<()> {
        instructions::add_asset_class::add_asset_class(ctx, params)
    }

    pub fn buy_asset(ctx: Context<BuyAsset>, class_id: u64) -> Result<()> {
        instructions::buy_asset::buy_asset(ctx, class_id)
    }

    pub fn queue_upgrade(ctx: Context<QueueUpgrade>, class_id: u64) -> Result<()> {
        instructions::queue_upgrade::queue_upgrade(ctx, class_id)
    }

    pub fn finish_upgrade(ctx: Context<FinishUpgrade>, class_id: u64) -> Result<()> {
        instructions::finish_upgrade::finish_upgrade(ctx, class_id)
    }

    pub fn defend(ctx: Context<Defend>, class_id: u64, spend_amount: u64) -> Result<()> {
        instructions::defend::defend(ctx, class_id, spend_amount)
    }

    pub fn takeover(ctx: Context<Takeover>, target_player: Pubkey, class_id: u64) -> Result<()> {
        instructions::takeover::takeover(ctx, target_player, class_id)
    }

    pub fn set_params(ctx: Context<SetParams>, args: SetParamsArgs) -> Result<()> {
        instructions::set_params::set_params(ctx, args)
    }

    pub fn pause(ctx: Context<Pause>, paused: bool) -> Result<()> {
        instructions::set_params::pause(ctx, paused)
    }

    pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
        instructions::initialize_player::initialize_player(ctx)
    }

    pub fn do_work(ctx: Context<DoWork>) -> Result<()> {
        instructions::work::do_work(ctx)
    }

    pub fn purchase_business(ctx: Context<PurchaseBusiness>, business_id: u8) -> Result<()> {
        instructions::purchase_business::purchase_business(ctx, business_id)
    }

    pub fn initialize_treasury(ctx: Context<InitializeTreasury>, fee_bps: u16, max_trade_units: u64) -> Result<()> {
        instructions::initialize_treasury::initialize_treasury(ctx, fee_bps, max_trade_units)
    }

    pub fn add_liquidity(ctx: Context<AddLiquidity>, base_amount: u64, quote_amount: u64) -> Result<()> {
        instructions::add_liquidity::add_liquidity(ctx, base_amount, quote_amount)
    }

    pub fn swap_credits_for_wealth(ctx: Context<SwapCreditsForWealth>, credits_in: u64, min_wealth_out: u64) -> Result<()> {
        instructions::swap_credits_for_wealth::swap_credits_for_wealth(ctx, credits_in, min_wealth_out)
    }

    pub fn swap_wealth_for_credits(ctx: Context<SwapWealthForCredits>, wealth_in: u64, min_credits_out: u64) -> Result<()> {
        instructions::swap_wealth_for_credits::swap_wealth_for_credits(ctx, wealth_in, min_credits_out)
    }

    pub fn set_treasury_params(ctx: Context<SetTreasuryParams>, fee_bps: Option<u16>, max_trade_units: Option<u64>, paused: Option<bool>) -> Result<()> {
        instructions::set_treasury_params::set_treasury_params(ctx, fee_bps, max_trade_units, paused)
    }
}