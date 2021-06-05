import * as anchor from '@project-serum/anchor'
import { assert, expect } from 'chai'
import {
  initializeMint,
  mintTokensToStaking,
  getAmountInStaking,
  mintTokensTo,
  getAmountIn,
  initializeState,
  createUser,

  mainProgram,
  someToken
} from './utils'

import {
  parseNumber,
} from './otherUtils'
import { Account } from '@solana/web3.js'
import { mintTo } from '@project-serum/serum/lib/token-instructions'
import { createSuper } from 'typescript'

//let fourthUsersKeys: anchor.web3.Keypair


describe('Mint', async () => {
  it('initialize', async () => {
    await initializeMint()
  })

  it('mint to staking account', async () => {
    await mintTokensToStaking(10e8) // 100 with 6 decimal places
    const amount = await getAmountInStaking()
    assert.ok(amount.eq(parseNumber(100 * 10e6)))
  })

  it('mint to account', async () => {
    const owner = new Account()
    const ownersTokens = await someToken.createAccount(owner.publicKey)

    assert.ok((await getAmountIn(ownersTokens)).eq(parseNumber(0)))
    await mintTokensTo(ownersTokens, 42)
    assert.ok((await getAmountIn(ownersTokens)).eq(parseNumber(42)))
    await mintTokensTo(ownersTokens, 2)
    assert.ok((await getAmountIn(ownersTokens)).eq(parseNumber(44)))
  })

})


describe('State', async () => {
  it('initialize', async () => {
    await initializeState()
    const { count } = await mainProgram.state.fetch() as {count: number}
    assert.ok(count == 0)
  })
})

describe('Users', async () => {
  it('creation', async () => {
    await createUser()
  })
})

/*
describe('Mint', () => {
  it('init', async () => {
    await initMint()

    const { count } = (await mainProgram.state.fetch()) as anchor.BN
    assert.ok(count.eq(new anchor.BN(0)))
  })
})

describe('Users', () => {
  it('creation', async () => {
    for (let i = 0; i < 4; i++) fourthUsersKeys = await generateUser()
  })
})

describe('Token', () => {
  it('creation', async () => {
    await generateToken(42, fourthUsersKeys.publicKey)

    const amount = await getTokenAmount(fourthUsersKeys.publicKey)
    assert.ok(amount == 210)
  })

  it('recalculation of value', async () => {
    await recalculateToken(fourthUsersKeys.publicKey)

    const withdrawable = await getTokenWithdrawable(fourthUsersKeys.publicKey)
    assert.ok(withdrawable == 42)
  })

  it('change in value', async () => {
    await generateUser()
    await recalculateToken(fourthUsersKeys.publicKey)
    const withdrawable = await getTokenWithdrawable(fourthUsersKeys.publicKey)
    assert.ok(withdrawable == 63)
  })
})

describe('Users', () => {
  it('limit', async () => {
    try {
      expect(await generateUser()).to.throw() //FIXME: errors print to console
    } catch (err: unknown) {
      const { msg } = err as { msg: string }
      assert.ok(msg == "There can't be more than 5 users.")
    }
  })
})
*/