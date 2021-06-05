use anchor_lang::prelude::*;
//use anchor_spl::token::{self, Burn, MintTo, TokenAccount, Transfer};
use anchor_spl::token::{self, TokenAccount, Transfer};

const SEED: &str = "Synthetify";



#[program]
mod manager {
    use super::*;

    #[state]
    pub struct InternalState {
        pub count: u32,
        pub staking: Pubkey,
        pub mint: Pubkey,
        pub nonce: u8,
        pub total_shares: u64,
    }

    impl InternalState {
        pub fn new(ctx: Context<InitState>, nonce: u8) -> Result<Self> {
            Ok(Self {
                count: 0,
                staking: *ctx.accounts.staking.to_account_info().key,
                mint: *ctx.accounts.mint.key,
                nonce: nonce,
                total_shares: 1000000
            })
        }

        pub fn init_user(&mut self, ctx: Context<CreateUser>) -> ProgramResult{
            let user = &mut ctx.accounts.user;
            if self.count >= 5 {
                return Err(ErrorCode::MoreThanFiveUsers.into());
            } 
            self.count += 1;
            user.shares = 0;

            Ok(())
        }

        pub fn deposit(&mut self, ctx: Context<Deposit>) -> ProgramResult {
            let user = &mut ctx.accounts.user;

            user.shares = ctx.accounts.tokens.amount
                * self.total_shares
                / ctx.accounts.staking.amount;

            let cpi_accounts = Transfer {
                from: ctx.accounts.tokens.to_account_info(),
                to: ctx.accounts.staking.to_account_info(),
                authority: ctx.accounts.auth.clone()
            };

            let cpi_program = ctx.accounts.token_program.clone();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_context, ctx.accounts.tokens.amount)?;


            Ok(())
        }

        pub fn withdraw(&mut self, ctx: Context<Withdraw>) -> ProgramResult {
            let user = &mut ctx.accounts.user;


            let amount = user.shares
                * ctx.accounts.staking.amount
                / self.total_shares;

            user.shares = 0;

            Ok(())
        }

    }
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    user: ProgramAccount<'info, User>,
    #[account(mut)]
    tokens: CpiAccount<'info, TokenAccount>,
    #[account(mut)]
    staking: CpiAccount<'info, TokenAccount>,
}


#[derive(Accounts)]
pub struct Deposit<'info>{
    #[account(mut)]
    user: ProgramAccount<'info, User>,
    #[account(signer)]
    auth: AccountInfo<'info>,
    #[account(mut, "tokens.owner == *auth.key")]
    tokens: CpiAccount<'info, TokenAccount>,
    #[account(mut)]
    staking: CpiAccount<'info, TokenAccount>,
    #[account(executable, "token_program.key == &token::ID")]
    token_program: AccountInfo<'info>
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
    pub shares: u64,
}

#[error]
pub enum ErrorCode {
    #[msg("There can't be more than 5 users.")]
    MoreThanFiveUsers,
    #[msg("You are not authorized")]
    Unauthorized,
}
