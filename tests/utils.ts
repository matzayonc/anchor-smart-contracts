import * as anchor from '@project-serum/anchor'
import { Program } from '@project-serum/anchor'
import { Account, PublicKey } from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'

import {
  createToken,
} from './otherUtils'


export const mainProgram = anchor.workspace.Manager as Program
const authority = mainProgram.provider.wallet.publicKey
const mintKeys = anchor.web3.Keypair.generate()

const provider = anchor.Provider.local()
const connection = provider.connection
const wallet = provider.wallet.payer as Account //FIXME: I feel like thats bad


let mintAuthority: PublicKey
let someToken: Token
let staking: PublicKey

const SEED = Buffer.from('Synthetify')


export async function initializeMint(){
  const [_mintAuthoruty/*, nonce*/] = await anchor.web3.PublicKey.findProgramAddress(
    [SEED],
    mainProgram.programId
  )
  mintAuthority = _mintAuthoruty
  
  someToken = await createToken({
    connection,
    payer: wallet,
    mintAuthority: wallet.publicKey
  })
}









export async function generateUser() {
  const userKeys = anchor.web3.Keypair.generate()

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
