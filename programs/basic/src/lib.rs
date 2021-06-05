use anchor_lang::prelude::*;
//use anchor_spl::token::{self, Burn, MintTo, TokenAccount, Transfer};
use anchor_spl::token::{TokenAccount};

#[program]
mod manager {
    use super::*;

    #[state]
    pub struct InternalState {
        pub count: u32,
        pub staking: Pubkey,
        pub mint: Pubkey
    }

    impl InternalState {
        pub fn new(ctx: Context<InitState>) -> Result<Self> {
            Ok(Self {
                count: 0,
                staking: *ctx.accounts.staking.to_account_info().key,
                mint: *ctx.accounts.mint.key

            })
        }

        pub fn init_user(&mut self, ctx: Context<CreateUser>) -> ProgramResult{
            let user = &mut ctx.accounts.user;
            if self.count >= 5 {
                return Err(ErrorCode::MoreThanFiveUsers.into());
            } 
            self.count += 1;

            if self.count == 5{
                //should mint to staking
            }
            user.shares = 0;

            Ok(())
        }


        pub fn calculate(&mut self, _ctx: Context<CalcToken>) -> ProgramResult {
            //let token = &mut ctx.accounts.token;

            //token.withdrawable = token.amount ;//* self.supply / 10000;
            Ok(())
        }
    }
}


#[derive(Accounts)]
pub struct InitState<'info> {
    staking: CpiAccount<'info, TokenAccount>,
    mint: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(init)]
    user: ProgramAccount<'info, User>,
    #[account(mut)]
    mint: AccountInfo<'info>,
    mint_auth: AccountInfo<'info>,
    #[account(mut)]
    staking: CpiAccount<'info, TokenAccount>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CalcToken<'info> {
    #[account(mut)]
    token: CpiAccount<'info, TokenAccount>,
    #[account(signer)]
    authority: AccountInfo<'info>,
}


#[account]
pub struct User{
    pub shares: u32,
}

#[account]
pub struct Mint {
    pub supply: u32,
}

#[error]
pub enum ErrorCode {
    #[msg("There can't be more than 5 users.")]
    MoreThanFiveUsers,
    #[msg("You are not authorized")]
    Unauthorized,
}
