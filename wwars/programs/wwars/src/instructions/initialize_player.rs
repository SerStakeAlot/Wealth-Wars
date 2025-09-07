use anchor_lang::prelude::*;
use crate::state::PlayerState;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(
        init,
        payer = owner,
        space = PlayerState::MAX_SIZE,
        seeds = [b"player_state", owner.key().as_ref()],
        bump
    )]
    pub player_state: Account<'info, PlayerState>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;
    
    player_state.owner = ctx.accounts.owner.key();
    player_state.last_work_timestamp = 0;
    player_state.streak_count = 0;
    player_state.work_frequency_level = 0; // Start as novice
    player_state.total_work_actions = 0;
    player_state.credits = 1000; // Starting credits
    player_state.wealth_tokens = 0;
    player_state.businesses_owned = Vec::new();
    player_state.active_business_slots = Vec::new();
    player_state.last_streak_check = clock.unix_timestamp;
    player_state.cooldown_hours = 24; // Start with 24h cooldown
    player_state.bump = ctx.bumps.player_state;
    
    msg!("Player initialized with 1000 starting credits");
    
    Ok(())
}
