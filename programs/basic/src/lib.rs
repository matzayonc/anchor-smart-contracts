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

    pub fn create_mint(ctx: Context<CreateMint>) -> ProgramResult {
        ctx.accounts.mint.supply = 0;
        Ok(())
    }

    pub fn create_token(ctx: Context<CreateToken>) -> ProgramResult {
        let token = &mut ctx.accounts.token;
        token.amount = 0;
        token.authority = *ctx.accounts.authority.key;
        token.mint = *ctx.accounts.mint.to_account_info().key;
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

#[derive(Accounts)]
pub struct CreateMint<'info> {
    #[account(init)]
    mint: ProgramAccount<'info, Mint>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(init, associated = authority, with = mint)]
    token: ProgramAccount<'info, Token>,
    #[account(mut, signer)]
    authority: AccountInfo<'info>,
    mint: ProgramAccount<'info, Mint>,
    rent: Sysvar<'info, Rent>,
    system_program: AccountInfo<'info>,
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
    pub authority: Pubkey,
    pub mint: Pubkey,
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
