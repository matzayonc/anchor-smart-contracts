use anchor_lang::prelude::*;

#[program]
mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>,) -> ProgramResult {
        let owner = &mut ctx.accounts.owner;
        owner.amount = 0;
        Ok(())
    }

    pub fn update(ctx: Context<Update>) -> ProgramResult {
        let owner = &mut ctx.accounts.owner;
        owner.amount += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init)]
    pub owner: ProgramAccount<'info, MyAccount>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub owner: ProgramAccount<'info, MyAccount>,
}

#[account]
pub struct MyAccount {
    pub amount: u64,
}
