use anchor_lang::prelude::*;

#[program]
mod manager {
    use super::*;

    #[state]
    pub struct Counter {
        pub authority: Pubkey,
        pub count: u64,
    }

    impl Counter {
        pub fn new(ctx: Context<Auth>) -> Result<Self> {
            Ok(Self {
                authority: *ctx.accounts.authority.key,
                count: 0,
            })
        }

        pub fn increment(&mut self, ctx: Context<Auth>) -> Result<()> {
            if &self.authority != ctx.accounts.authority.key {
                return Err(ErrorCode::Unauthorized.into());
            } 

            self.count += 1;
            Ok(())
        }

    }

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



#[error]
pub enum ErrorCode {
    #[msg("This is an error message clients will automatically display")]
    Unauthorized,
}

#[derive(Accounts)]
pub struct Auth<'info> {
    #[account(signer)]
    authority: AccountInfo<'info>,
}


/*
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




*/
/*
use anchor_lang::prelude::*;

#[program]
pub mod basic_4 {
    use super::*;

    #[state]
    pub struct Counter {
        pub authority: Pubkey,
        pub count: u64,
    }

    impl Counter {
        pub fn new(ctx: Context<Auth>) -> Result<Self> {
            Ok(Self {
                authority: *ctx.accounts.authority.key,
                count: 0,
            })
        }

        pub fn increment(&mut self, ctx: Context<Auth>) -> Result<()> {
            if &self.authority != ctx.accounts.authority.key {
                return Err(ErrorCode::Unauthorized.into());
            }
            self.count += 1;
            Ok(())
        }
    }
}

#[derive(Accounts)]
pub struct Auth<'info> {
    #[account(signer)]
    authority: AccountInfo<'info>,
}
*/