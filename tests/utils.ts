import * as anchor from '@project-serum/anchor'
import { Program } from '@project-serum/anchor'
import { Account, PublicKey, Keypair } from '@solana/web3.js'
import { Token, u64 } from '@solana/spl-token'

import {
  createToken,
  parseNumber,
  TOKEN_PROGRAM,
} from './otherUtils'
import { Key } from 'readline'


export const mainProgram = anchor.workspace.Manager as Program
let nonce: number

const provider = anchor.Provider.local()
const connection = provider.connection
const wallet = (provider.wallet as unknown as {payer: Account}).payer

let programAuthority: PublicKey
export let someToken: Token
let staking: PublicKey

const SEED = Buffer.from('Synthetify')



export async function deposit(user: Keypair, tokens: PublicKey): Promise<void>{
  await mainProgram.state.rpc.deposit({
    accounts: {
      user: user.publicKey,
      tokens,
      staking,
      auth: user.publicKey,
      tokenProgram: TOKEN_PROGRAM
    },
    signers: [user]
  })

}


export async function amountOfSharesOf(user: Keypair): Promise<u64>{
  const {shares} = await mainProgram.account.user.fetch(user.publicKey) as {shares: u64}
  return shares
}








export async function initializeMint(){
  const [_programAuthority, _nonce] = await anchor.web3.PublicKey.findProgramAddress(
    [SEED],
    mainProgram.programId
  )
  programAuthority = _programAuthority
  nonce = _nonce

  someToken = await createToken({
    connection,
    payer: wallet,
    mintAuthority: wallet.publicKey
  })

  staking = await someToken.createAccount(programAuthority)
}

export async function initializeState(){
  await mainProgram.state.rpc.new(nonce, {
    accounts: {
      staking,
      authority: programAuthority,
      mint: someToken.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY
    }
  })
}


export async function createUser(userKeys: Keypair): Promise<Keypair>{

  await mainProgram.state.rpc.initUser({
    accounts: {
      user: userKeys.publicKey,
      mint: someToken.publicKey,
      mintAuth: programAuthority,
      staking,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY
    },
    instructions: [await mainProgram.account.user.createInstruction(userKeys)],
    signers: [userKeys]
  })
  return userKeys
}


export async function mintTokensTo(whom: PublicKey, amount: number): Promise<void>{
  await someToken.mintTo(whom, wallet, [], parseNumber(amount))
}

export async function getAmountIn(whose: PublicKey): Promise<u64>{
  const {amount} = await someToken.getAccountInfo(whose)
  return amount
}

export async function mintTokensToStaking(amount: number): Promise<void>{
  await mintTokensTo(staking, amount)
}

export async function getAmountInStaking(): Promise<u64>{
  const {amount} = await someToken.getAccountInfo(staking)
  return amount
}

/*

export async function generateUser() {
  const userKeys = anchor.web3.Keypair.generate()
  const tokens = someToken.createAccount(userKeys.publicKey)


  await mainProgram.state.rpc.initUser(userKeys.publicKey, {
    accounts: {
      user: userKeys.publicKey,
      authority: authority,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY
    },
    instructions: [await mainProgram.account.user.createInstruction(userKeys)],
    signers: [userKeys]
  })
  return userKeys
}

export async function generateToken(value: number, usersKey: PublicKey) {
  const associatedToken = await mainProgram.account.token.associatedAddress(authority, usersKey)

  await mainProgram.state.rpc.createToken(new anchor.BN(42), {
    accounts: {
      token: associatedToken,
      authority,
      user: usersKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId
    }
  })
}

export async function getTokenAmount(user: PublicKey): Promise<number> {
  const { amount } = (await mainProgram.account.token.associated(authority, user)) as { amount: number }
  return amount
}

export async function recalculateToken(user: PublicKey): Promise<void> {
  const associatedToken = await mainProgram.account.token.associatedAddress(authority, user)

  await mainProgram.state.rpc.calculate({
    accounts: {
      token: associatedToken,
      authority
    }
  })
}

export async function getTokenWithdrawable(user: PublicKey): Promise<number> {
  await recalculateToken(user)

  const { withdrawable } = (await mainProgram.account.token.associated(authority, user)) as {
    withdrawable: number
  }

  return withdrawable
}

export async function initMint() {
  await mainProgram.state.rpc.new({
    accounts: {
      mint: mintKeys.publicKey,
      authority: authority,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY
    },
    instructions: [await mainProgram.account.myAccount.createInstruction(mintKeys)],
    signers: [mintKeys]
  })
}
*/