import * as anchor from '@project-serum/anchor'
import { Program } from '@project-serum/anchor'
import { TokenInstructions } from '@project-serum/serum'
import { PublicKey, Keypair, Connection } from '@solana/web3.js'
import { Token, u64 } from '@solana/spl-token'


const TOKEN_PROGRAM = TokenInstructions.TOKEN_PROGRAM_ID
export const mainProgram = anchor.workspace.Manager as Program
let nonce: number

const provider = anchor.Provider.local()
const connection = provider.connection
const wallet = (provider.wallet as unknown as {payer: Keypair}).payer

let programAuthority: PublicKey
export let someToken: Token
let staking: PublicKey

const SEED = Buffer.from('Synthetify')


export async function withdraw(user: Keypair, tokens: PublicKey): Promise<void>{
  await mainProgram.state.rpc.withdraw({
    accounts: {
      user: user.publicKey, 
      tokens,
      staking,
      auth: programAuthority,
      tokenProgram: TOKEN_PROGRAM,
    },
  })
}


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

  someToken = await createToken(
    connection,
    wallet,
    wallet.publicKey
  )

  staking = await someToken.createAccount(programAuthority)
}

export async function initializeState(){
  await mainProgram.state.rpc.new(nonce, {
    accounts: {
      staking,
      authority: programAuthority,
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
      auth: programAuthority,
      staking,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM,
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


export function parseNumber(amount:number): u64 {
  return new u64(amount.toString())
}


async function createToken(
connection: Connection,
payer: Keypair,
mintAuthority: PublicKey,
) {
const token = await Token.createMint(
  connection,
  payer,
  mintAuthority,
  null,
  6,
  TokenInstructions.TOKEN_PROGRAM_ID
)
return token
}