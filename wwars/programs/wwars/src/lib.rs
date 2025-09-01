use anchor_lang::prelude::*;

// ⬅️ Replace with YOUR real program id
declare_id!("3MuF3DSnsg166e1EuYdF4Dc86Z1nzD8dESbqpmFVmQYd");

#[program]
pub mod wwars {
    use super::*;

    pub fn init_player(ctx: Context<InitPlayer>) -> Result<()> {
        let p = &mut ctx.accounts.player;
        p.authority = ctx.accounts.authority.key();
        p.wealth = 0;
        p.xp = 0;
        p.bump = ctx.bumps.player;
        Ok(())
    }

    pub fn collect_income(ctx: Context<CollectIncome>) -> Result<()> {
        let p = &mut ctx.accounts.player;
        p.wealth = p.wealth.saturating_add(10);
        p.xp = p.xp.saturating_add(1);
        Ok(())
    }
}

// -------- Accounts --------

#[derive(Accounts)]
pub struct InitPlayer<'info> {
    // IMPORTANT: declare authority FIRST since we reference it below
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

#[derive(Accounts)]
pub struct CollectIncome<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"player", authority.key().as_ref()],
        bump = player.bump,
        has_one = authority
    )]
    pub player: Account<'info, Player>,
}

// -------- State --------

#[account]
pub struct Player {
    pub authority: Pubkey, // 32
    pub wealth: u64,       // 8
    pub xp: u32,           // 4
    pub bump: u8,          // 1
}

impl Player {
    // 8 (disc) + 32 + 8 + 4 + 1 = 53 → pad a little for future safety
    pub const SPACE: usize = 8 + 32 + 8 + 4 + 1 + 16;
}
