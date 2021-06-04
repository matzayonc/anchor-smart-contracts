import * as anchor from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'


export const program = anchor.workspace.Manager as anchor.Program
export const authority = program.provider.wallet.publicKey
const mintKeys = anchor.web3.Keypair.generate()

export async function generateUser(){
    const userKeys = anchor.web3.Keypair.generate()

    await program.state.rpc.initUser(userKeys.publicKey, {
      accounts: {
        user: userKeys.publicKey,
        authority: authority,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      instructions: [await program.account.user.createInstruction(userKeys)],
      signers: [userKeys],
    })
    return userKeys
}


export async function generateToken(value: number, usersKey: PublicKey){
  
  const associatedToken = await program.account.token.associatedAddress(
    authority,
    usersKey
  )
  
  await program.state.rpc.createToken(new anchor.BN(42), {
    accounts: {
      token: associatedToken,
      authority,
      user: usersKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
    },
  })
}

export async function getTokenAmount(user: PublicKey): Promise<number> {

  const { amount } = await program.account.token.associated(
    authority,
    user
  ) as {amount: number}

  return amount
}

export async function recalculateToken(user: PublicKey): Promise<void> {
  const associatedToken = await program.account.token.associatedAddress(
    authority,
    user
  )
  
  await program.state.rpc.calculate({
    accounts: {
      token: associatedToken,
      authority,
    },
  })
}

export async function getTokenWithdrawable(user: PublicKey): Promise<number> {

  const { withdrawable } = await program.account.token.associated(
    authority,
    user
  ) as {withdrawable: number}

  return withdrawable
}


export async function initMint(){
  await program.state.rpc.new({
    accounts: {
      mint: mintKeys.publicKey,
      authority: authority,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    },
    instructions: [await program.account.myAccount.createInstruction(mintKeys)],
    signers: [mintKeys],
  })
}