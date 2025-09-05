use anchor_lang::prelude::*;
use instructions::*;

mod state;
mod math;
mod errors;
mod events;
mod instructions;

declare_id!("EhN1NGXmhGyzN1qTPRRc7ZRA9yZuJdvVhJPE4AkRWMu");

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
}