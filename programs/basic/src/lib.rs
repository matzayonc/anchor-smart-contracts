use anchor_lang::prelude::*;

#[program]
mod manager {
    use super::*;

    pub fn initialize(ctx: Context<InitializeWallet>, data: u64) -> ProgramResult {
        let user = &mut ctx.accounts.user;
        user.tokens = data;
        Ok(())
    }

    pub fn update(ctx: Context<UpdateWallet>, data: u64) -> ProgramResult {
        let user = &mut ctx.accounts.user;
        user.tokens = data;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeWallet<'info> {
    #[account(init)]
    pub user: ProgramAccount<'info, MyAccount>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateWallet<'info> {
    #[account(mut)]
    pub user: ProgramAccount<'info, MyAccount>,
}

#[account]
pub struct MyAccount {
    pub tokens: u64,
}




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
    pub owner: ProgramAccount<'info, Counter>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub owner: ProgramAccount<'info, Counter>,
}

#[account]
pub struct Counter {
    pub amount: u64,
}
