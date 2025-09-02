use anchor_lang::prelude::*;
use crate::state::*;
use crate::events::*;

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Player::SPACE,
        seeds = [b"player", authority.key().as_ref()],
        bump
    )]
    pub player: Account<'info, Player>,

    pub system_program: Program<'info, System>,
}

pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
    let player = &mut ctx.accounts.player;
    let clock = Clock::get()?;

    player.authority = ctx.accounts.authority.key();
    player.last_defend_ts = clock.unix_timestamp;
    player.bump = ctx.bumps.player;

    emit!(PlayerJoined {
        player: player.authority,
    });

    Ok(())
}
