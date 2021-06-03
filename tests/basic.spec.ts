import * as anchor from '@project-serum/anchor'
import { assert, expect } from 'chai'



anchor.setProvider(anchor.Provider.env())
const program = anchor.workspace.Manager as Program
const mintKeys = anchor.web3.Keypair.generate()
const authority = program.provider.wallet.publicKey
let fifthUserKeys = anchor.web3.Keypair.generate()

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

  async function userFactory(){
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

  it('creation', async () => {
    for(let i = 0 i < 5 i++)
    fifthUserKeys = await userFactory()
  })

  it('limit', async () => {
    try {
      expect(await userFactory()).to.throw() //FIXME: errors print to console
    } catch (err: unknown) {
      const {msg} = err as {msg: string}
      assert.ok(msg == "There can't be more than 5 users.")
    }
    
  })

})

describe('Tokens', () => {

  it(('creation'), async () => {
    const associatedToken = await program.account.token.associatedAddress(
      authority,
      fifthUserKeys.publicKey
    )

    await program.state.rpc.createToken(new anchor.BN(42), {
      accounts: {
        token: associatedToken,
        authority,
        user: fifthUserKeys.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    })

    const { amount } = await program.account.token.associated(
      authority,
      fifthUserKeys.publicKey
    ) as {amount: number}

    assert.ok(amount == 210)
  })
})
