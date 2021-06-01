use anchor_lang::prelude::*;

#[program]
mod basic {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: u64) -> ProgramResult {
        let user = &mut ctx.accounts.user;
        user.tokens = data;
        Ok(())
    }

    pub fn update(ctx: Context<Update>, data: u64) -> ProgramResult {
        let user = &mut ctx.accounts.user;
        user.tokens = data;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init)]
    pub user: ProgramAccount<'info, User>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub user: ProgramAccount<'info, User>,
}

#[account]
pub struct User {
    pub tokens: u64,
}
