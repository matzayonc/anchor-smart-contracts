import * as anchor from '@project-serum/anchor'
import { assert, expect } from 'chai'
import {
  generateUser,


} from './manager'


anchor.setProvider(anchor.Provider.env())
const program = anchor.workspace.Manager as Program
const mintKeys = anchor.web3.Keypair.generate()
const authority = program.provider.wallet.publicKey
let fourthUsersKeys = anchor.web3.Keypair.generate()



describe('Mint', () => {

  it(('init'), async () => {
    await program.state.rpc.new({
      accounts: {
        mint: mintKeys.publicKey,
        authority: authority,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      instructions: [await program.account.myAccount.createInstruction(mintKeys)],
      signers: [mintKeys],
    })

    const {count} = (await program.state.fetch()) as anchor.BN
    assert.ok(count.eq(new anchor.BN(0)))
  })
})




describe('Users', () => {
  it('creation', async () => {
    for(let i = 0; i < 4; i++)
    fourthUsersKeys = await generateUser()
  })
})

describe('Tokens', () => {

  it('creation', async () => {
    const associatedToken = await program.account.token.associatedAddress(
      authority,
      fourthUsersKeys.publicKey
    )

    await program.state.rpc.createToken(new anchor.BN(42), {
      accounts: {
        token: associatedToken,
        authority,
        user: fourthUsersKeys.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    })

    const { amount } = await program.account.token.associated(
      authority,
      fourthUsersKeys.publicKey
    ) as {amount: number}

    assert.ok(amount == 210)
  })

  it('calc', async () => {
    const associatedToken = await program.account.token.associatedAddress(
      authority,
      fourthUsersKeys.publicKey
    )
    
    await program.state.rpc.calculate({
      accounts: {
        token: associatedToken,
        authority,
      },
    })

    const { withdrawable } = await program.account.token.associated(
      authority,
      fourthUsersKeys.publicKey
    ) as {withdrawable: number}

    assert.ok(withdrawable == 42)
  })

  it('change in price after adding user', async () => {

    await generateUser()


    const associatedToken = await program.account.token.associatedAddress(
      authority,
      fourthUsersKeys.publicKey
    )

    await program.state.rpc.calculate({
      accounts: {
        token: associatedToken,
        authority,
      },
    })

    const { withdrawable } = await program.account.token.associated(
      authority,
      fourthUsersKeys.publicKey
    ) as {withdrawable: number}



    assert.ok(withdrawable == 63)
  })
})


describe('Users', () => {

  it('limit', async () => {
    try {
      expect(await generateUser()).to.throw() //FIXME: errors print to console
    } catch (err: unknown) {
      const {msg} = err as {msg: string}
      assert.ok(msg == "There can't be more than 5 users.")
    }
    
  })
})