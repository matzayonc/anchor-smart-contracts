import { Token, u64 } from '@solana/spl-token'
import { TokenInstructions } from '@project-serum/serum'
import { Account, Connection, PublicKey } from '@solana/web3.js'


export const TOKEN_PROGRAM = TokenInstructions.TOKEN_PROGRAM_ID


export function parseNumber(amount:number): u64 {
    return new u64(amount.toString())
  }
  

  export const createToken = async (
    connection: Connection,
    payer: Account,
    mintAuthority: PublicKey,
  ) => {
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