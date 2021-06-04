import { Token } from '@solana/spl-token'
import { TokenInstructions } from '@project-serum/serum'
import { Account, Connection, PublicKey } from '@solana/web3.js'






interface ICreateToken {
    connection: Connection
    payer: Account
    mintAuthority: PublicKey
    decimals?: number
  }
  export const createToken = async ({
    connection,
    payer,
    mintAuthority,
    decimals = 6
  }: ICreateToken) => {
    const token = await Token.createMint(
      connection,
      payer,
      mintAuthority,
      null,
      decimals,
      TokenInstructions.TOKEN_PROGRAM_ID
    )
    return token
  }