use anchor_lang::prelude::*;

declare_id!("ndepDTGfiqyxcBdN7zR4mA7qTh9vspygcqy6puQfo4g");

#[program]
pub mod wwars {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
