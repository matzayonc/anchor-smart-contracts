use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, MintTo, TokenAccount, Transfer};

#[program]
mod manager {
    use super::*;

    #[state]
    pub struct MintState {
        pub authority: Pubkey,
        pub count: u64,
        pub supply: u32,
    }

    impl MintState {
        pub fn new(ctx: Context<CreateMint>) -> Result<Self> {
            Ok(Self {
                authority: *ctx.accounts.authority.key,
                count: 0,
                supply: 2000
            })
        }

        pub fn init_user(&mut self, ctx: Context<CreateUser>, auth: Pubkey) -> ProgramResult{
            let user = &mut ctx.accounts.user;
            user.authority = auth;
            if self.count >= 5 {
                return Err(ErrorCode::MoreThanFiveUsers.into());
            } 
            
            self.count += 1;

            if self.count == 5{
                self.supply += 1000;
            }

            Ok(())
        }

        pub fn create_token(&mut self, ctx: Context<CreateToken>, amount: u32) -> ProgramResult {
            let token = &mut ctx.accounts.token;
            token.amount = amount * 10000 / self.supply; //four decimal places
            token.withdrawable = amount;
            token.authority = *ctx.accounts.authority.key;
            token.user = *ctx.accounts.user.to_account_info().key;
            
            Ok(())
        }

        pub fn calculate(&mut self, ctx: Context<CalcToken>) -> ProgramResult {
            let token = &mut ctx.accounts.token;

            token.withdrawable = token.amount * self.supply / 10000;
            Ok(())
        }
    }
}


#[derive(Accounts)]
pub struct CreateMint<'info> {
    #[account(init)]
    mint: ProgramAccount<'info, Mint>,
    #[account(signer)]
    authority: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(init, associated = authority, with = user)]
    token: ProgramAccount<'info, Token>,
    #[account(mut, signer)]
    authority: AccountInfo<'info>,
    user: ProgramAccount<'info, User>,
    rent: Sysvar<'info, Rent>,
    system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(init)]
    user: ProgramAccount<'info, User>,
    #[account(signer)]
    authority: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CalcToken<'info> {
    #[account(mut)]
    token: ProgramAccount<'info, Token>,
    #[account(signer)]
    authority: AccountInfo<'info>,
}


#[account]
pub struct User{
    authority: Pubkey,
}

#[account]
pub struct Mint {
    pub supply: u32,
}

#[account]
pub struct MyAccount {
    pub tokens: u64,
}


#[associated]
pub struct Token {
    pub amount: u32,
    pub withdrawable: u32,
    pub authority: Pubkey,
    pub user: Pubkey,
}


#[error]
pub enum ErrorCode {
    #[msg("There can't be more than 5 users.")]
    MoreThanFiveUsers,
    #[msg("You are not authorized")]
    Unauthorized,
}
