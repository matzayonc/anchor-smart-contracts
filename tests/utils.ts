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


export async function createUser(userKeys?: Keypair): Promise<Keypair>{

  let keys = userKeys ?? Keypair.generate()

  await mainProgram.state.rpc.initUser({
    accounts: {
      user: keys.publicKey,
      mint: someToken.publicKey,
      mintAuth: programAuthority,
      staking,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY
    },
    instructions: [await mainProgram.account.user.createInstruction(keys)],
    signers: [keys]
  })
  return keys
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